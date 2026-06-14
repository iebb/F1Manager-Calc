import {Container} from "../components/ui/Container";
import {TabManager} from "../components/Calculator/TabManager";
import dynamic from "next/dynamic";
import Header from "../components/Header";
import Footer from "../components/Footer";

export function CalculatorPage() {
  return (
    <>
      <Header />
      <Container>
        <TabManager />
      </Container>
      <Footer />
    </>
  );
}

export default dynamic(() => Promise.resolve(CalculatorPage), {
  ssr: false,
});