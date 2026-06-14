import '../styles/globals.css'
import {SessionProvider, useSession} from "next-auth/react"
import {CenteredSpinner} from "../components/ui/Spinner";
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
import {useEffect, useState} from "react";

ReactGA.initialize("G-XNCFQVHQMX");

export function MyApp({Component, pageProps: { session, ...pageProps }}) {
  return (
    <SessionProvider session={session} refetchInterval={7 * 60}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>F1 Manager Setup Calculator</title>
      </Head>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right'}}>
        <SessionConsumer>
          <Component {...pageProps} />
        </SessionConsumer>
      </SnackbarProvider>
    </SessionProvider>
  )
}


function SessionConsumer({ children }) {
  const session = useSession()
  const [store, setStore] = useState(null);
  const [persistor, setPersistor] = useState(null);

  useEffect(() => {
    let s = configureStore(
      {
        reducer: {
          config: persistReducer({
            key: 'root',
            version: 1,
            storage: (
              session.status === "authenticated"
            ) ? createCloudStorage() : storage,
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
    setStore(s);
    setPersistor(persistStore(s));
  }, [session.status])


  if (session.status === "loading") {
    return <CenteredSpinner />
  }

  return (
    <Provider store={store} key={session.userId}>
      <PersistGate loading={<CenteredSpinner />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}

export default dynamic(() => Promise.resolve(MyApp), {
  ssr: false,
});