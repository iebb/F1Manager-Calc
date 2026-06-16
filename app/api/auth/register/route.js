import { getCloudflareContext } from "@opennextjs/cloudflare";
import { hashPassword } from "../../../../libs/password";
import { userKey } from "../../../../auth";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const username = String(body.username || "").toLowerCase().trim();
  const password = String(body.password || "");

  if (!USERNAME_RE.test(username)) {
    return json({ error: "Username must be 3–32 chars (letters, numbers, . _ -)" }, 400);
  }
  if (password.length < 8) {
    return json({ error: "Password must be at least 8 characters" }, 400);
  }

  const { env } = getCloudflareContext();
  const key = userKey(username);

  const existing = await env.CONFIG_KV.get(key);
  if (existing) return json({ error: "Username already taken" }, 409);

  const { salt, hash } = await hashPassword(password);
  await env.CONFIG_KV.put(
    key,
    JSON.stringify({ username, salt, hash, uid: `u:${username}`, createdAt: Date.now() })
  );

  return json({ ok: true });
}
