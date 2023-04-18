import axios from "axios";

export default function createWebStorage(type) {
  return {
    getItem: (key)  => {
      return new Promise((resolve, reject) => {
        axios.get(`/api/cloud/storage`).then(d => {
          resolve(
            d.data ? d.data[key] : null
          )
        }).catch(r => {
          reject(r)
        })
      })
    },
    setItem: (key, item) => {
      return new Promise((resolve, reject) => {
        axios.post(`/api/cloud/storage`, {[key]: item}).then(
          r => resolve(r)
        ).catch(r => {
          reject(r)
        })
      })
    },
    removeItem: (key) => {
      return new Promise((resolve, reject) => {
        axios.post(`/api/cloud/storage`, {[key]: null}).then(
          r => resolve(r)
        ).catch(r => {
          reject(r)
        })
      })
    },
  }
}