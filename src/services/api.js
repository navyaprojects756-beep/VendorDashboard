import axios from "axios"

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Cache-Control": "no-cache, no-store",
    "Pragma": "no-cache",
  },
})

// Add a unique timestamp to every GET request to bust carrier/browser caches
API.interceptors.request.use(config => {
  if (config.method === "get") {
    config.params = { ...config.params, _t: Date.now() }
  }
  return config
})

export const getToken = () =>
  new URLSearchParams(window.location.search).get("token")

export default API
