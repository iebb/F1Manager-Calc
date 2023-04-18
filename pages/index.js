import {Container} from '@mui/material';
import {TabManager} from "../components/Calculator/TabManager";
import dynamic from "next/dynamic";

export function CalculatorPage() {
  return (
    <Container maxWidth="xl" component="main">
      <TabManager />
    </Container>
  );
}

export default dynamic(() => Promise.resolve(CalculatorPage), {
  ssr: false,
});