import { configureStore } from '@reduxjs/toolkit'
import configReducer from "./reducers/configReducer";

export default configureStore({
  reducer: {
    config: configReducer,
  },
})