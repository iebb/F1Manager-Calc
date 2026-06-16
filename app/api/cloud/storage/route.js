import { auth } from "../../../../auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { validateCloudUpload } from "../../../../libs/cloudSchema";

const JSON_HEADERS = { "content-type": "application/json" };

// Per-user cloud-sync blob (the redux-persist payload) stored in D1, keyed by
// uid (Discord id, or `u:<username>` for credentials users). D1 replaces KV,
// whose per-key write limits were too strict for sync traffic.
export async function GET() {
  const session = await auth();
  if (!session?.uid) return new Response("{}", { headers: JSON_HEADERS });
  const { env } = getCloudflareContext();
  const row = await env.DB.prepare("SELECT data FROM configs WHERE uid = ?").bind(session.uid).first();
  return new Response(row?.data || "{}", { headers: JSON_HEADERS });
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

  const { env } = getCloudflareContext();
  const uid = session.uid;

  // Read-merge-write so keys not present in this upload are preserved; a null
  // value clears that key (redux-persist removeItem).
  const row = await env.DB.prepare("SELECT data FROM configs WHERE uid = ?").bind(uid).first();
  let existing = {};
  if (row?.data) {
    try {
      existing = JSON.parse(row.data);
    } catch {
      existing = {};
    }
  }
  const merged = { ...existing, ...body };
  for (const k of Object.keys(merged)) {
    if (merged[k] === null) delete merged[k];
  }

  await env.DB.prepare(
    "INSERT INTO configs (uid, data, updated_at) VALUES (?, ?, ?) " +
      "ON CONFLICT(uid) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at"
  )
    .bind(uid, JSON.stringify(merged), Date.now())
    .run();

  return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS });
}
