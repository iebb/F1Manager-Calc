import { getCloudflareContext } from "@opennextjs/cloudflare";
import { hashPassword } from "../../../../libs/password";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;

// Create a fresh username/password account (uid = `u:<username>`), stored in D1.
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

  const existing = await env.DB.prepare("SELECT username FROM users WHERE username = ?").bind(username).first();
  if (existing) return json({ error: "Username already taken" }, 409);

  const { salt, hash } = await hashPassword(password);
  try {
    await env.DB.prepare(
      "INSERT INTO users (username, salt, hash, uid, created_at) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(username, salt, hash, `u:${username}`, Date.now())
      .run();
  } catch {
    // Primary-key conflict from a race — treat as taken.
    return json({ error: "Username already taken" }, 409);
  }

  return json({ ok: true });
}
