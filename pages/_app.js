import '../styles/globals.css'
import {SessionProvider, useSession} from "next-auth/react"
import {CircularProgress, createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import ReactGA from "react-ga4";
import Head from "next/head";
import {SnackbarProvider} from "notistack";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {Provider} from "react-redux";
import {PersistGate} from "redux-persist/integration/react";
import {configureStore} from "@reduxjs/toolkit";
import {FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE} from "redux-persist";
import configReducer from "../libs/reducers/configReducer";
import storage from 'redux-persist/lib/storage'
import createCloudStorage from "../libs/storage/cloudStorage";
import dynamic from "next/dynamic";

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
export function MyApp({
                        Component,
                        pageProps: { session, ...pageProps },
                      }) {
  return (
    <SessionProvider session={session} refetchInterval={7 * 60}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>F1 Manager Setup Calculator</title>
      </Head>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right'}}>
          <CssBaseline />
          <Header />
          <SessionConsumer>
            <Component {...pageProps} />
          </SessionConsumer>
          <Footer />
        </SnackbarProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}


function SessionConsumer({ children }) {
  const session = useSession()
  const store = configureStore(
    {
      reducer: {
        config: persistReducer({
          key: 'root',
          version: 1,
          storage: (
            session.status === "authenticated"
          ) ? createCloudStorage(session) : storage,
        }, configReducer),
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          },
        }),
    },
  )
  const persistor = persistStore(store);

  if (session.status === "loading") {
    return (
      <div style={{ width: "100%", textAlign: "center" }}>
        <CircularProgress style={{ margin: "0 auto" }} />
      </div>
    )
  }

  return (
    <Provider store={store} key={session.status}>
      <PersistGate loading={(
        <div style={{ width: "100%", textAlign: "center" }}>
          <CircularProgress style={{ margin: "0 auto" }} />
        </div>
      )} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}

export default dynamic(() => Promise.resolve(MyApp), {
  ssr: false,
});