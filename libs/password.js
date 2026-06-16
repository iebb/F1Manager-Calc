// Password hashing with the Web Crypto API (PBKDF2) — works on the Workers
// runtime, Node, and the browser. No native deps (bcrypt/argon are not
// Workers-friendly).

const ITERATIONS = 100000; // Cloudflare Workers caps PBKDF2 at 100000
const KEY_BITS = 256;

const toB64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const fromB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

async function derive(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    KEY_BITS
  );
  return new Uint8Array(bits);
}

// Returns { salt, hash } as base64 strings.
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt);
  return { salt: toB64(salt), hash: toB64(hash) };
}

// Constant-time-ish comparison of the derived hash.
export async function verifyPassword(password, saltB64, hashB64) {
  try {
    const hash = await derive(password, fromB64(saltB64));
    const expected = fromB64(hashB64);
    if (hash.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < hash.length; i++) diff |= hash[i] ^ expected[i];
    return diff === 0;
  } catch {
    return false;
  }
}
