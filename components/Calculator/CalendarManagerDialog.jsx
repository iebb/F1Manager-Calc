import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Trash2, ChevronUp, ChevronDown, X, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select, SelectItem } from "../ui/Select";
import { FlagIcon } from "../ui/FlagIcon";
import { tracks, TrackOrders, trackMap } from "../../consts/tracks";
import { upsertCalendar, removeCalendar } from "../../libs/reducers/configReducer";

// Selectable tracks, ordered by their appearance across the built-in calendars
// (familiar F1 order), then any remaining tracks; "Unspecified" (XX) excluded.
const ALL_TRACK_IDS = (() => {
  const seen = new Set();
  const ordered = [];
  for (const year of Object.keys(TrackOrders)) {
    for (const id of TrackOrders[year]) if (!seen.has(id) && trackMap[id]) (seen.add(id), ordered.push(id));
  }
  for (const t of tracks) if (t.id !== "XX" && !seen.has(t.id)) (seen.add(t.id), ordered.push(t.id));
  return ordered;
})();

const newId = () => "cal_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function TrackLabel({ id }) {
  const t = trackMap[id];
  if (!t) return <span>{id}</span>;
  return (
    <span className="flex items-center gap-2">
      <FlagIcon code={t.id} width={22} height={16} title={t.country} />
      <span className="truncate">
        {t.name}
        {t.country && t.country !== "-" ? `, ${t.country}` : ""}
      </span>
    </span>
  );
}

// Create / edit / delete user-defined calendars (track orders) that show up in
// the Game selector alongside 2022/2023/2024.
export default function CalendarManagerDialog({ open, onOpenChange }) {
  const dispatch = useDispatch();
  const calendars = useSelector((s) => s.config.customCalendars) || [];
  const [editing, setEditing] = useState(null); // {id,name,tracks} while editing, else null (list view)

  const close = (v) => {
    if (!v) setEditing(null);
    onOpenChange?.(v);
  };

  const addTrack = (id) =>
    setEditing((e) => (e.tracks.includes(id) ? e : { ...e, tracks: [...e.tracks, id] }));
  const removeTrack = (id) => setEditing((e) => ({ ...e, tracks: e.tracks.filter((t) => t !== id) }));
  const move = (i, dir) =>
    setEditing((e) => {
      const j = i + dir;
      if (j < 0 || j >= e.tracks.length) return e;
      const arr = [...e.tracks];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...e, tracks: arr };
    });

  const save = () => {
    const name = editing.name.trim();
    if (!name || editing.tracks.length === 0) return;
    dispatch(upsertCalendar({ id: editing.id, name, tracks: editing.tracks }));
    setEditing(null);
  };

  const available = editing ? ALL_TRACK_IDS.filter((id) => !editing.tracks.includes(id)) : [];

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg">
        <DialogTitle>Custom calendars</DialogTitle>
        <DialogDescription>
          Build your own track order to pick from the Game selector. The Next-track button cycles
          through it (skipping Unspecified).
        </DialogDescription>

        {!editing ? (
          <div className="mt-4 space-y-2">
            {calendars.length === 0 && (
              <p className="py-2 text-sm text-zinc-400">No custom calendars yet.</p>
            )}
            {calendars.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 rounded-lg border border-line bg-surface-raised px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-zinc-100">{c.name}</div>
                  <div className="text-xs text-zinc-400">
                    {c.tracks.length} track{c.tracks.length === 1 ? "" : "s"}
                  </div>
                </div>
                <Button variant="secondary" size="icon" aria-label="Edit calendar" onClick={() => setEditing({ id: c.id, name: c.name, tracks: [...c.tracks] })}>
                  <Pencil size={15} />
                </Button>
                <Button variant="danger" size="icon" aria-label="Delete calendar" onClick={() => dispatch(removeCalendar({ id: c.id }))}>
                  <Trash2 size={15} />
                </Button>
              </div>
            ))}
            <Button variant="primary" className="w-full" onClick={() => setEditing({ id: newId(), name: "", tracks: [] })}>
              <Plus size={16} /> New calendar
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <Input
              label="Name"
              value={editing.name}
              placeholder="My calendar"
              maxLength={60}
              onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))}
            />

            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Tracks (in order)
              </div>
              {editing.tracks.length === 0 ? (
                <p className="py-1 text-sm text-zinc-500">Add tracks below.</p>
              ) : (
                <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                  {editing.tracks.map((id, i) => (
                    <div
                      key={id}
                      className="flex items-center gap-2 rounded-md border border-line bg-surface-raised px-2 py-1.5"
                    >
                      <span className="w-5 text-right text-xs text-zinc-500">{i + 1}</span>
                      <div className="min-w-0 flex-1 text-sm">
                        <TrackLabel id={id} />
                      </div>
                      <button
                        type="button"
                        className="text-zinc-400 hover:text-zinc-100 disabled:opacity-30"
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                        aria-label="Move up"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        className="text-zinc-400 hover:text-zinc-100 disabled:opacity-30"
                        disabled={i === editing.tracks.length - 1}
                        onClick={() => move(i, 1)}
                        aria-label="Move down"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        type="button"
                        className="text-zinc-400 hover:text-danger"
                        onClick={() => removeTrack(id)}
                        aria-label="Remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Select
              value=""
              placeholder="Add a track…"
              ariaLabel="Add track"
              className="w-full"
              onValueChange={(id) => addTrack(id)}
            >
              {available.map((id) => (
                <SelectItem key={id} value={id}>
                  <TrackLabel id={id} />
                </SelectItem>
              ))}
            </Select>

            <div className="flex gap-2 pt-1">
              <Button variant="secondary" className="flex-1" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                disabled={!editing.name.trim() || editing.tracks.length === 0}
                onClick={save}
              >
                Save
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
