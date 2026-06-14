import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/Dialog";
import { Switch } from "./ui/Switch";
import { updateSettings } from "../libs/reducers/configReducer";

function SettingRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 first:pt-2 last:pb-0">
      <div>
        <div className="font-semibold text-zinc-100">{title}</div>
        <div className="mt-1 text-sm text-zinc-400">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function SettingsDialog({ open, onOpenChange }) {
  const dispatch = useDispatch();
  const settings = useSelector((s) => s.config.settings) || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>Preferences are saved on this device.</DialogDescription>
        <div className="mt-3 divide-y divide-line/60">
          <SettingRow
            title="Allow editing bias directly"
            description="Enable dragging the Bias sliders (and clicking history markers) to set the car bias directly. This can produce a setup that isn't on the in-game grid — a “Find Nearest” button then appears in the Setup panel to snap it back. Off by default."
            checked={!!settings.allowBiasEdit}
            onChange={(v) => dispatch(updateSettings({ allowBiasEdit: v }))}
          />
          <SettingRow
            title="Enable bad+ / bad−"
            description="Add the “Bad (Too High)” and “Bad (Too Low)” states to the feedback cycle, for when the game tells you a value is off in a specific direction. Off by default."
            checked={!!settings.allowBadDir}
            onChange={(v) => dispatch(updateSettings({ allowBadDir: v }))}
          />
          <SettingRow
            title="Show bias value input"
            description="Add a number field next to each bias slider so you can type an exact bias value. Like the slider, this can push the setup off the in-game grid (use “Find Nearest” to snap back). Off by default."
            checked={!!settings.allowBiasInput}
            onChange={(v) => dispatch(updateSettings({ allowBiasInput: v }))}
          />
          <SettingRow
            title="Use a dropdown for feedback"
            description="Pick feedback from a dropdown menu instead of the click-to-cycle button. Off by default (click-to-cycle)."
            checked={!!settings.feedbackDropdown}
            onChange={(v) => dispatch(updateSettings({ feedbackDropdown: v }))}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
