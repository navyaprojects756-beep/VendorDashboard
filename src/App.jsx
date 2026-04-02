import { useState, useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { Snackbar, Alert } from "@mui/material"
import Sidebar from "./dashboard/layout/Sidebar"
import Header from "./dashboard/layout/Header"

import Orders    from "./dashboard/pages/Orders"
import Apartments from "./dashboard/pages/Apartments"
import Settings   from "./dashboard/pages/Settings"
import Customers  from "./dashboard/pages/Customers"
import Pauses     from "./dashboard/pages/Pauses"
import Products   from "./dashboard/pages/Products"
import Messages   from "./dashboard/pages/Messages"

import HomePage from "./company/HomePage"
import AboutPage from "./company/AboutPage"
import PrivacyPage from "./company/PrivacyPage"
import ProductDemo from "./company/ProductDemo"

import API, { getToken, getRole } from "./services/api"

function VendorDashboard() {
  const [page,setPage]=useState("orders")
  const [open,setOpen]=useState(false)
  const [dark,setDark]=useState(false)
  const [waking, setWaking]=useState(false)
  const role = getRole()

  // Ping server on mount so Render wakes up before first real request
  useEffect(() => {
    let timer
    const token = getToken()
    if (!token) return
    const controller = new AbortController()
    setWaking(true)
    timer = setTimeout(() => setWaking(false), 65000)
    API.get(`/ping?token=${token}`, { signal: controller.signal })
      .catch(() => {}) // ignore errors — this is just a wake-up call
      .finally(() => { clearTimeout(timer); setWaking(false) })
    return () => { controller.abort(); clearTimeout(timer) }
  }, [])

  const theme = createTheme({
    palette:{ mode: dark ? "dark" : "light" }
  })

  const render=()=>{
    if(page==="orders") return <Orders dark={dark}/>
    if(role==="admin"){
      if(page==="apartments") return <Apartments dark={dark}/>
      if(page==="settings")   return <Settings dark={dark}/>
      if(page==="customers")  return <Customers dark={dark}/>
      if(page==="pauses")     return <Pauses dark={dark}/>
      if(page==="products")   return <Products dark={dark}/>
      if(page==="messages")   return <Messages dark={dark}/>
    }
    // delivery role falls back to orders for any other page
    return <Orders dark={dark}/>
  }

  return (
    <ThemeProvider theme={theme}>
      <Sidebar open={open} setOpen={setOpen} setPage={setPage} dark={dark} role={role}/>
      <Header setOpen={setOpen} setDark={setDark} dark={dark}/>
      <div style={{padding:"90px 20px 20px 20px"}}>
        {render()}
      </div>
      <Snackbar open={waking} anchorOrigin={{ vertical:"bottom", horizontal:"center" }}>
        <Alert severity="info" variant="filled" sx={{ width:"100%" }}>
          Connecting to server, please wait...
        </Alert>
      </Snackbar>
    </ThemeProvider>
  )
}

export default function App(){
  return (
    <Routes>
      <Route path="/"        element={<HomePage />} />
      <Route path="/about"   element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/products" element={<ProductDemo />} />
      <Route path="/dashboard" element={<VendorDashboard />} />
      <Route path="*"        element={<Navigate to="/" replace />} />
    </Routes>
  )
}