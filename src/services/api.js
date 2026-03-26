import axios from "axios"

const API = axios.create({
  baseURL: "http://localhost:3000/vendor"
})

export const getToken = () =>
  new URLSearchParams(window.location.search).get("token")

export default API