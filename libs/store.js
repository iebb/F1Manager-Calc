import {configureStore} from '@reduxjs/toolkit'
import configReducer from "./reducers/configReducer";

import {FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE,} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import createWebStorage from "./storage/cloudStorage";

export const store = configureStore(
  {
    reducer: {
      config: persistReducer({
        key: 'root',
        version: 1,
        storage,
      }, configReducer),
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  },
);


export const cloudStore = configureStore(
  {
    reducer: {
      config: persistReducer({
        key: 'root',
        version: 1,
        storage: createWebStorage('cloud'),
      }, configReducer),
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  },
);

export const persistor = persistStore(store)
export const cloudPersistor = persistStore(cloudStore)

export default store;