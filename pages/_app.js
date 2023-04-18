import '../styles/globals.css'
import {SessionProvider, useSession} from "next-auth/react"
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";
import ReactGA from "react-ga4";
import Head from "next/head";
import {SnackbarProvider} from "notistack";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {Provider} from "react-redux";
import {PersistGate} from "redux-persist/integration/react";
import dynamic from "next/dynamic";
import {configureStore} from "@reduxjs/toolkit";
import {FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE} from "redux-persist";
import configReducer from "../libs/reducers/configReducer";
import storage from 'redux-persist/lib/storage'
import createWebStorage from "../libs/storage/cloudStorage";

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
  const store = configureStore(
    {
      reducer: {
        config: persistReducer({
          key: 'root',
          version: 1,
          storage: session.status === "unauthenticated" ? createWebStorage('web') : storage,
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
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}

export default dynamic(() => Promise.resolve(MyApp), {
  ssr: false,
});