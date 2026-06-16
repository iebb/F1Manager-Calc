// Validates the redux-persist cloud-sync payload before it is written to D1.
//
// The client uploads exactly one key — the redux-persist root:
//     { "persist:root": "<stringified persisted config>" }   (normal save)
//     { "persist:root": null }                                 (clear)
// where the persisted config decodes to an object whose values are themselves
// each JSON strings (redux-persist serialises every top-level key separately):
//     { slots: "[...]", settings: "{...}", customCalendars: "[...]", _persist: "{...}" }
//
// We validate the structural shape and enforce size caps so a (potentially
// malicious) authenticated client can't store arbitrary or oversized blobs.

const MAX_BLOB_BYTES = 4 * 1024 * 1024; // 4 MB per user — the real abuse cap
const MAX_SLOTS = 500;
const MAX_PREVIOUS_RUNS = 5000;
const MAX_FEEDBACKS_PER_PARAM = 5000;
const MAX_CALENDARS = 100;
const MAX_TRACKS_PER_CALENDAR = 60;

const PERSIST_KEY = "persist:root";
const ALLOWED_SUBKEYS = new Set(["slots", "settings", "customCalendars", "_persist"]);
const SETTING_BOOLS = new Set(["allowBiasEdit", "allowBadDir", "allowBiasInput", "feedbackDropdown"]);

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const isStr = (v) => typeof v === "string";
// Slots are sparse — unused ones carry only id/title and omit carSetup, track,
// feedback, etc. So every field is optional; we check its type and bound only
// when present. The 4 MB blob cap is the real protection against oversized data.
function validateSlot(s) {
  if (!isObj(s)) return "not an object";
  if (s.id != null && !isNum(s.id) && !isStr(s.id)) return "id";
  if (s.slotNaming != null && (!isStr(s.slotNaming) || s.slotNaming.length > 200)) return "slotNaming";
  if (s.slotTitle != null && (!isStr(s.slotTitle) || s.slotTitle.length > 200)) return "slotTitle";
  if (s.gameVersion != null && (!isStr(s.gameVersion) || s.gameVersion.length > 64)) return "gameVersion";
  if (s.track != null && (!isStr(s.track) || s.track.length > 16)) return "track";
  if (s.carSetup != null && (!Array.isArray(s.carSetup) || s.carSetup.length > 16)) return "carSetup";
  if (s.prevCarSetup != null && (!Array.isArray(s.prevCarSetup) || s.prevCarSetup.length > 16)) return "prevCarSetup";
  if (s.feedback != null) {
    if (!Array.isArray(s.feedback) || s.feedback.length > 16) return "feedback";
    for (const f of s.feedback) {
      if (!Array.isArray(f) || f.length > MAX_FEEDBACKS_PER_PARAM) return "feedback[]";
    }
  }
  if (s.previousRuns != null && (!Array.isArray(s.previousRuns) || s.previousRuns.length > MAX_PREVIOUS_RUNS)) {
    return "previousRuns";
  }
  return null;
}

function validateSettings(s) {
  if (!isObj(s)) return "not an object";
  for (const k of Object.keys(s)) {
    if (!SETTING_BOOLS.has(k)) return `unknown key ${k}`;
    if (typeof s[k] !== "boolean") return k;
  }
  return null;
}

function validateCalendars(c) {
  if (!Array.isArray(c) || c.length > MAX_CALENDARS) return "not an array / too many";
  for (const cal of c) {
    if (!isObj(cal)) return "entry not an object";
    if (!isStr(cal.id) || cal.id.length > 64) return "id";
    if (!isStr(cal.name) || cal.name.length < 1 || cal.name.length > 60) return "name";
    if (!Array.isArray(cal.tracks) || cal.tracks.length > MAX_TRACKS_PER_CALENDAR) return "tracks";
    if (!cal.tracks.every((t) => isStr(t) && t.length <= 16)) return "tracks[]";
  }
  return null;
}

// Returns { ok: true } or { ok: false, error } — and { ok: true, clear: true }
// when the upload is a deliberate clear (persist:root === null).
export function validateCloudUpload(body) {
  if (!isObj(body)) return { ok: false, error: "Body must be an object" };

  for (const k of Object.keys(body)) {
    if (k !== PERSIST_KEY) return { ok: false, error: `Unexpected key: ${k}` };
  }
  if (!(PERSIST_KEY in body)) return { ok: true, empty: true };

  const val = body[PERSIST_KEY];
  if (val === null) return { ok: true, clear: true };
  if (!isStr(val)) return { ok: false, error: "persist:root must be a string" };
  if (val.length > MAX_BLOB_BYTES) return { ok: false, error: "Payload too large" };

  let outer;
  try {
    outer = JSON.parse(val);
  } catch {
    return { ok: false, error: "persist:root is not valid JSON" };
  }
  if (!isObj(outer)) return { ok: false, error: "persist:root must decode to an object" };

  for (const k of Object.keys(outer)) {
    if (!ALLOWED_SUBKEYS.has(k)) return { ok: false, error: `Unexpected persisted key: ${k}` };
    if (!isStr(outer[k])) return { ok: false, error: `${k} must be a stringified value` };
  }

  const sub = (key, parseFn) => {
    if (!(key in outer)) return null;
    let parsed;
    try {
      parsed = JSON.parse(outer[key]);
    } catch {
      return `${key} is not valid JSON`;
    }
    return parseFn(parsed);
  };

  let err = sub("slots", (slots) => {
    if (!Array.isArray(slots) || slots.length > MAX_SLOTS) return "slots invalid";
    for (const s of slots) {
      const e = validateSlot(s);
      if (e) return `invalid slot (${e})`;
    }
    return null;
  });
  if (err) return { ok: false, error: err };

  err = sub("settings", (settings) => {
    const e = validateSettings(settings);
    return e ? `invalid settings (${e})` : null;
  });
  if (err) return { ok: false, error: err };

  err = sub("customCalendars", (cals) => {
    const e = validateCalendars(cals);
    return e ? `invalid customCalendars (${e})` : null;
  });
  if (err) return { ok: false, error: err };

  return { ok: true };
}
