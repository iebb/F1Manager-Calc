import { auth } from "../../../../auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const JSON_HEADERS = { "content-type": "application/json" };
const keyFor = (session) => `cfg:${session.discordId}`;

// Per-user cloud config (redux-persist blob) stored in Workers KV, keyed by Discord id.
export async function GET() {
  const session = await auth();
  if (!session?.discordId) return new Response("{}", { headers: JSON_HEADERS });
  const { env } = getCloudflareContext();
  const value = await env.CONFIG_KV.get(keyFor(session));
  return new Response(value || "{}", { headers: JSON_HEADERS });
}

export async function POST(req) {
  const session = await auth();
  if (!session?.discordId) return new Response("{}", { headers: JSON_HEADERS });
  const { env } = getCloudflareContext();
  const key = keyFor(session);

  let body = {};
  try {
    body = await req.json();
  } catch {
    /* ignore malformed body */
  }

  const existing = JSON.parse((await env.CONFIG_KV.get(key)) || "{}");
  const merged = { ...existing, ...body };
  await env.CONFIG_KV.put(key, JSON.stringify(merged));

  return new Response(JSON.stringify({ ok: true }), { headers: JSON_HEADERS });
}
