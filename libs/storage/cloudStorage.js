import axios from "axios";
import storage from 'redux-persist/lib/storage'

export default function createCloudStorage(session) {
  const fallbackStorage = storage;
  return {
    getItem: (key)  => {
      return new Promise((resolve, reject) => {
        axios.get(`/api/cloud/storage`).then(d => {
          if (d.data && d.data[key]) {
            resolve(d.data[key])
          } else {
            fallbackStorage.getItem(key).then(resolve).catch(reject)
          }
        }).catch(reject)
      })
    },
    setItem: (key, item) => {
      return new Promise((resolve, reject) => {
        // fallbackStorage.setItem(key, item)
        axios.post(`/api/cloud/storage`, {[key]: item}).then(resolve).catch(reject)
      })
    },
    removeItem: (key) => {
      return new Promise((resolve, reject) => {
        // fallbackStorage.removeItem(key)
        axios.post(`/api/cloud/storage`, {[key]: null}).then(resolve).catch(reject)
      })
    },
  }
}