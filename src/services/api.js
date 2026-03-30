import axios from "axios"

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 65000, // Render free tier cold start can take up to 60s
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

// Retry once on timeout or network error (handles Render cold start)
API.interceptors.response.use(
  res => res,
  async err => {
    const isRetryable =
      err.code === "ECONNABORTED" || // axios timeout
      err.code === "ERR_NETWORK" ||
      !err.response // no response = network-level failure

    if (isRetryable && !err.config._retried) {
      err.config._retried = true
      err.config.timeout = 65000
      return API(err.config)
    }
    return Promise.reject(err)
  }
)

export const getToken = () =>
  new URLSearchParams(window.location.search).get("token")

// Decode JWT payload (no verification — just reads role from URL token)
export const getRole = () => {
  try {
    const token = getToken()
    if (!token) return "admin"
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.role || "admin"
  } catch {
    return "admin"
  }
}

export default API
