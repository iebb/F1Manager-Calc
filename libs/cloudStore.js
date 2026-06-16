// At-rest codec for the per-user cloud-sync blob in D1.
//
// The client speaks redux-persist JSON: { "persist:root": "<json string>" }.
// To shrink storage we don't store that JSON verbatim — we one-level-decode the
// persist root (so its sub-values are plain strings, not double-escaped),
// msgpack-encode it, gzip it, and base64 it behind an "m1:" tag. Decode reverses
// it and also transparently reads legacy raw-JSON rows (so a mixed table works
// during migration).
import { encode as msgpackEncode, decode as msgpackDecode } from "@msgpack/msgpack";

export const STORAGE_PREFIX = "m1:";

// gzip/gunzip via Web Streams — available on Workers and Node 18+.
async function gzip(bytes) {
  const cs = new CompressionStream("gzip");
  const writer = cs.writable.getWriter();
  writer.write(bytes);
  writer.close();
  return new Uint8Array(await new Response(cs.readable).arrayBuffer());
}
async function gunzip(bytes) {
  const ds = new DecompressionStream("gzip");
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();
  return new Uint8Array(await new Response(ds.readable).arrayBuffer());
}

// base64 <-> bytes, chunked to avoid call-stack limits on large inputs.
function bytesToB64(bytes) {
  let bin = "";
  const CH = 0x8000;
  for (let i = 0; i < bytes.length; i += CH) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
  }
  return btoa(bin);
}
function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// body: { "persist:root": "<json string>" } (or persist:root null to clear, or {}).
export async function encodeForStorage(body) {
  const pr = body ? body["persist:root"] : undefined;
  // payload.r is the one-level-decoded root map { slots:"…", settings:"…", … };
  // its values stay opaque strings, so the round-trip is exact.
  const payload = pr == null ? { e: 1 } : { r: JSON.parse(pr) };
  const gz = await gzip(msgpackEncode(payload));
  return STORAGE_PREFIX + bytesToB64(gz);
}

// stored: a value read from configs.data. Returns the client body
// { "persist:root": "<json string>" } (or {} when empty/missing).
export async function decodeFromStorage(stored) {
  if (!stored) return {};
  if (!stored.startsWith(STORAGE_PREFIX)) {
    // Legacy raw-JSON row written before this codec existed.
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }
  const payload = msgpackDecode(await gunzip(b64ToBytes(stored.slice(STORAGE_PREFIX.length))));
  if (!payload || payload.e) return {};
  return { "persist:root": JSON.stringify(payload.r) };
}
