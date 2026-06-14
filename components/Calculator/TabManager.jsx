import { Plus, Pencil } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { driverNames } from "../../consts/driverNames";
import { addSlot, removeSlot, renameSlot } from "../../libs/reducers/configReducer";
import { Calculator } from "./Calculator";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";
import { Input } from "../ui/Input";
import { Dialog, DialogContent, DialogTitle } from "../ui/Dialog";
import { cn } from "../../libs/cn";

export function TabManager() {
  const config = useSelector((state) => state.config);
  const { slots } = config;
  const dispatch = useDispatch();
  const [tab, setTab] = useState(0);
  const [editText, setEditText] = useState("");
  const [openRenameSlot, setOpenRenameSlot] = useState(null);

  const saveSlotEdit = () => {
    dispatch(renameSlot({ id: openRenameSlot.id, slotTitle: editText }));
    setOpenRenameSlot(null);
  };

  return (
    <div>
      <Dialog
        open={Boolean(openRenameSlot)}
        onOpenChange={(o) => {
          if (!o) saveSlotEdit();
        }}
      >
        {openRenameSlot !== null && (
          <DialogContent className="max-w-xl">
            <DialogTitle>
              Renaming Slot {openRenameSlot.id}: <b>{openRenameSlot.slotTitle}</b>
            </DialogTitle>
            <div className="mt-4">
              <Input
                value={editText}
                autoFocus
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveSlotEdit()}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {driverNames.map((d) => (
                <Chip key={d} label={d} onClick={() => setEditText(d)} />
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              {slots.length > 1 && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setTab(tab > 0 ? tab - 1 : 0);
                    dispatch(removeSlot({ id: openRenameSlot.id }));
                    setOpenRenameSlot(null);
                  }}
                >
                  Delete this Slot
                </Button>
              )}
              <Button variant="primary" onClick={saveSlotEdit}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <div className="flex items-center gap-1 overflow-x-auto border-b border-line scroll-thin">
        {slots.map((s, _idx) => {
          const active = _idx === tab;
          return (
            <button
              key={_idx}
              onClick={() => setTab(_idx)}
              className={cn(
                "group flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              )}
            >
              {s.slotTitle}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditText(s.slotTitle);
                  setOpenRenameSlot(s);
                }}
                className="grid h-5 w-5 place-items-center rounded text-zinc-500 hover:bg-surface-hover hover:text-zinc-200"
              >
                <Pencil size={13} />
              </span>
            </button>
          );
        })}
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-1 shrink-0"
          onClick={() => dispatch(addSlot())}
          aria-label="Add slot"
        >
          <Plus size={16} />
        </Button>
      </div>

      {config.slots.length > 0 && <Calculator key={tab} slot={config.slots[tab]} />}
    </div>
  );
}
