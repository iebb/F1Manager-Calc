import {Container} from '@mui/material';
import {useState} from "react";
import {PresetSnapshot} from "../consts/presets";
import {Calculator} from "../components/Calculator/Calculator";
import {TabManager} from "../components/Calculator/TabManager";
import dynamic from "next/dynamic";

export function CalculatorPage() {
  const [slot, setSlot] = useState({});
  return (
    <Container maxWidth="xl" component="main">
      <TabManager setSlot={setSlot} />
      <Calculator
        key={slot.id}
        target={slot.slotNaming}
        preset={PresetSnapshot}
      />
    </Container>
  );
}

export default dynamic(() => Promise.resolve(CalculatorPage), {
  ssr: false,
});