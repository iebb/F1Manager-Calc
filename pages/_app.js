import '../styles/globals.css'
import Head from "next/head";
import dynamic from "next/dynamic";
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import ReactGA from "react-ga4";

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", ' +
      'Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
});


ReactGA.initialize("G-XNCFQVHQMX");
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>F1 Manager Setup Calculator</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}

export default dynamic(() => Promise.resolve(MyApp), {
  ssr: false,
});