import axios from "axios";

export default function createWebStorage(type) {
  return {
    getItem: (key)  => {
      return new Promise((resolve, reject) => {
        axios.get(`/api/cloud/storage`).then(d => resolve(
          d.data[key]
        ))
      })
    },
    setItem: (key, item) => {
      return new Promise((resolve, reject) => {
        resolve(axios.post(`/api/cloud/storage`, {[key]: item}))
      })
    },
    removeItem: (key) => {
      return new Promise((resolve, reject) => {
        resolve(axios.post(`/api/cloud/storage`, {[key]: null}))
      })
    },
  }
}