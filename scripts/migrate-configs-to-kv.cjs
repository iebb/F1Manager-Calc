/*
 * migrate-configs-to-kv.cjs
 *
 * One-time data-migration helper for moving cloud-sync data from MongoDB
 * to Cloudflare Workers KV.
 *
 * Background / data model (confirmed by reading the app source):
 *   - libs/cloud/mongodb.js connects with MONGODB_URI and the cloud config
 *     store lives in the "f1setup" database, collection "cloud_configs".
 *     Each doc looks like:
 *         { _id: ObjectId, userId: "<string of the user's _id>",
 *           root: "<stringified redux-persist state>", ...other persist keys }
 *     i.e. the redux-persist payload is spread at the top level of the doc
 *     (pages/api/cloud/storage.js does `updateOne(..., { $set: body })`).
 *   - NextAuth's MongoDB adapter (pages/api/auth/[...nextauth].js) stores
 *     "users", "accounts" and "sessions" in the database named by
 *     process.env.AUTH_DATABASE_NAME (defaults to "accounts").
 *     Each Discord account doc looks like:
 *         { userId: ObjectId, provider: "discord",
 *           providerAccountId: "<discord user id>", ... }
 *
 * In Cloudflare KV we key cloud-sync state by Discord id (the stable external
 * identity) instead of the internal Mongo _id, since the new auth layer keys
 * off the Discord id directly.
 *
 * Usage:
 *
 *   # Export configs from Mongo, keyed by Discord id, into KV bulk-put JSON:
 *   MONGODB_URI="..." AUTH_DATABASE_NAME="accounts" bun scripts/migrate-configs-to-kv.cjs
 *
 *   # Then import into the KV namespace (binding CONFIG_KV):
 *   bunx wrangler kv bulk put migration/kv-configs.json --binding=CONFIG_KV --remote
 *
 * Notes:
 *   - The exact `wrangler kv bulk put` flag syntax varies between wrangler
 *     versions (older versions used `wrangler kv:bulk put <file> --binding=...`,
 *     newer ones use `wrangler kv bulk put <file> --binding=...`). The intent
 *     is: bulk-load the produced JSON array into the KV namespace bound as
 *     CONFIG_KV. Adjust the subcommand/flags to match your installed wrangler;
 *     run `wrangler kv bulk put --help` to confirm. You can also target a
 *     namespace by id with `--namespace-id=<id>` instead of `--binding`.
 *   - Runs read-only against MongoDB and writes only the local JSON file. It
 *     does not touch Mongo data or KV directly. Safe to re-run.
 *   - Use `--remote` for the production KV namespace; omit it for local dev.
 *
 * This script is intentionally standalone (CommonJS) and is NOT wired into
 * package.json scripts, since it is a one-time helper.
 */

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

// Database that holds the cloud config store (see libs/cloud/mongodb.js:
// `clientPromise.then(client => client.db("f1setup"))`).
const CLOUD_DB_NAME = "f1setup";
const CLOUD_CONFIGS_COLLECTION = "cloud_configs";

// Database that holds the NextAuth adapter collections (users/accounts/sessions).
// Defaults to "accounts" to match the documented AUTH_DATABASE_NAME default.
const AUTH_DB_NAME = process.env.AUTH_DATABASE_NAME || "accounts";
const ACCOUNTS_COLLECTION = "accounts";

// Output file, formatted as an array of { key, value } for `wrangler kv bulk put`.
const OUTPUT_DIR = path.resolve(__dirname, "..", "migration");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "kv-configs.json");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing required environment variable: "MONGODB_URI"');
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB.");

    // 1) Build a map: internal user id (string) -> Discord id.
    //    Accounts live in the NextAuth adapter database (AUTH_DATABASE_NAME).
    const authDb = client.db(AUTH_DB_NAME);
    const discordAccounts = await authDb
      .collection(ACCOUNTS_COLLECTION)
      .find({ provider: "discord" })
      .toArray();

    const userIdToDiscordId = new Map();
    for (const account of discordAccounts) {
      // account.userId is typically an ObjectId; normalise to string so it can
      // be matched against cloud_configs.userId (which is stored as a string).
      if (account.userId != null && account.providerAccountId != null) {
        userIdToDiscordId.set(
          String(account.userId),
          account.providerAccountId
        );
      }
    }
    console.log(
      `Loaded ${userIdToDiscordId.size} Discord account mapping(s) from "${AUTH_DB_NAME}.${ACCOUNTS_COLLECTION}".`
    );

    // 2) Read every cloud_configs doc and produce KV entries keyed by Discord id.
    const cloudDb = client.db(CLOUD_DB_NAME);
    const configs = await cloudDb
      .collection(CLOUD_CONFIGS_COLLECTION)
      .find({})
      .toArray();
    console.log(
      `Found ${configs.length} config(s) in "${CLOUD_DB_NAME}.${CLOUD_CONFIGS_COLLECTION}".`
    );

    const entries = [];
    let skipped = 0;

    for (const doc of configs) {
      const discordId = userIdToDiscordId.get(String(doc.userId));

      if (!discordId) {
        skipped += 1;
        console.warn(
          `WARN: no Discord account for cloud_configs userId="${String(
            doc.userId
          )}" (_id=${String(doc._id)}); skipping.`
        );
        continue;
      }

      // The KV payload is just the persisted redux-persist state. Strip the
      // Mongo-specific fields (_id and userId); everything else (root, plus any
      // other persist keys) is the payload we want to keep.
      const { _id, userId, ...payload } = doc;

      entries.push({
        key: `cfg:${discordId}`,
        value: JSON.stringify(payload),
      });
    }

    // 4) Write the bulk-put JSON file (create the directory if needed).
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(entries, null, 2));

    // 5) Summary.
    console.log("");
    console.log("Migration summary");
    console.log("-----------------");
    console.log(`Total configs        : ${configs.length}`);
    console.log(`Migrated             : ${entries.length}`);
    console.log(`Skipped (no Discord) : ${skipped}`);
    console.log("");
    console.log(`Wrote ${entries.length} KV entry(ies) to ${OUTPUT_FILE}`);
  } finally {
    // Always close the connection, even on error.
    await client.close().catch(() => {});
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exitCode = 1;
});
