import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Container } from "../../components/ui/Container";
import { Switch } from "../../components/ui/Switch";
import { updateSettings } from "../../libs/reducers/configReducer";

function SettingRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/60 px-4 py-4 last:border-0">
      <div>
        <div className="font-semibold text-zinc-100">{title}</div>
        <div className="mt-1 max-w-xl text-sm text-zinc-400">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function SettingsPage() {
  const dispatch = useDispatch();
  const settings = useSelector((s) => s.config.settings) || {};

  return (
    <>
      <Header />
      <Container>
        <h3 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">Settings</h3>
        <p className="mt-1 text-sm text-zinc-400">Preferences are saved on this device.</p>

        <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface shadow-panel">
          <SettingRow
            title="Allow editing bias directly"
            description="Enable dragging the Bias sliders (and clicking history markers) to set the car bias directly. This can produce a setup that isn't on the in-game grid — a “Find Nearest” button then appears in the Setup panel to snap it back to a valid setup. Off by default."
            checked={!!settings.allowBiasEdit}
            onChange={(v) => dispatch(updateSettings({ allowBiasEdit: v }))}
          />
        </div>
      </Container>
      <Footer />
    </>
  );
}

export default dynamic(() => Promise.resolve(SettingsPage), {
  ssr: false,
});
