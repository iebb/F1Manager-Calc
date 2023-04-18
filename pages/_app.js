import '../styles/globals.css'
import {getSession, SessionProvider, useSession} from "next-auth/react"
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import ReactGA from "react-ga4";
import Head from "next/head";
import {SnackbarProvider} from "notistack";
import Header from "../components/Header";
import Footer from "../components/Footer";
import store, {cloudPersistor, cloudStore, persistor} from "../libs/store";
import {Provider} from "react-redux";
import {PersistGate} from "redux-persist/integration/react";

ReactGA.initialize("G-XNCFQVHQMX");

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
export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>F1 Manager Setup Calculator</title>
      </Head>
      <SessionConsumer>
        <ThemeProvider theme={theme}>
          <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right'}}>
            <CssBaseline />
            <Header />
            <Component {...pageProps} />
            <Footer />
          </SnackbarProvider>
        </ThemeProvider>
      </SessionConsumer>
    </SessionProvider>
  )
}


function SessionConsumer({ children }) {
  const session = useSession()
  let providerStore = store;
  let providerPersistor = persistor;
  if (session.status === "loading" || session.status === "unauthenticated") {
    return "not logged in"
  } else {
    providerStore = cloudStore;
    providerPersistor = cloudPersistor;
  }
  return (
    <Provider store={providerStore}>
      <PersistGate loading={null} persistor={providerPersistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}