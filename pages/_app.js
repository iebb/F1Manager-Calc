import '../styles/globals.css'
import Head from "next/head";
import {SessionProvider} from "next-auth/react"
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import ReactGA from "react-ga4";
import Header from "../components/Header";
import {SnackbarProvider} from "notistack";
import Footer from "../components/Footer";
import store from '../libs/store'
import { Provider } from 'react-redux'

const theme = createTheme({
  palette: {
    mode: 'dark',
    white: {
      main: '#eee',
      contrastText: '#000',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", ' +
      'Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
});

ReactGA.initialize("G-XNCFQVHQMX");
export default function MyApp({
                                Component,
                                pageProps: { session, ...pageProps }
                              }) {
  return (
    <Provider store={store}>
      <SessionProvider session={session} refetchInterval={5 * 60}>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <title>F1 Manager Setup Calculator</title>
        </Head>
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right'}}>
            <CssBaseline />
            <Header />
            <Component {...pageProps} />
            <Footer />
          </SnackbarProvider>
        </ThemeProvider>
      </SessionProvider>
    </Provider>
  )
}
