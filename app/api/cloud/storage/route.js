import { auth } from "../../../../auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { validateCloudUpload } from "../../../../libs/cloudSchema";
import { encodeForStorage, decodeFromStorage } from "../../../../libs/cloudStore";

const JSON_HEADERS = { "content-type": "application/json" };

// Per-user cloud-sync blob (the redux-persist payload) stored in D1, keyed by
// uid (Discord id, or `u:<username>` for credentials users). Stored compressed
// (msgpack + gzip, see libs/cloudStore.js) to keep the row small.
export async function GET() {
  const session = await auth();
  if (!session?.uid) return new Response("{}", { headers: JSON_HEADERS });
  const { env } = getCloudflareContext();
  const row = await env.DB.prepare("SELECT data FROM configs WHERE uid = ?").bind(session.uid).first();
  if (!row?.data) return new Response("{}", { headers: JSON_HEADERS });
  let body;
  try {
    body = await decodeFromStorage(row.data);
  } catch {
    body = {};
  }
  return new Response(JSON.stringify(body), { headers: JSON_HEADERS });
}

export async function POST(req) {
  const session = await auth();
  if (!session?.uid) {
    return new Response(JSON.stringify({ error: "Not signed in" }), { status: 401, headers: JSON_HEADERS });
  }

  let body = {};
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: JSON_HEADERS });
  }

  // Validate the upload format before it ever touches storage.
  const result = validateCloudUpload(body);
  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error }), { status: 400, headers: JSON_HEADERS });
  }
  if (result.empty) {
    return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS });
  }

  // The client always uploads the full persist root, so we replace rather than
  // merge. A clear (persist:root === null) stores an empty payload.
  let stored;
  try {
    stored = await encodeForStorage(result.clear ? {} : body);
  } catch {
    return new Response(JSON.stringify({ error: "Could not encode payload" }), { status: 500, headers: JSON_HEADERS });
  }

  const { env } = getCloudflareContext();
  await env.DB.prepare(
    "INSERT INTO configs (uid, data, updated_at) VALUES (?, ?, ?) " +
      "ON CONFLICT(uid) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at"
  )
    .bind(session.uid, stored, Date.now())
    .run();

  return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS });
}
