import { useState } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import Sidebar from "./dashboard/layout/Sidebar"
import Header from "./dashboard/layout/Header"

import Orders from "./dashboard/pages/Orders"
import Apartments from "./dashboard/pages/Apartments"
import Blocks from "./dashboard/pages/Blocks"
import Settings from "./dashboard/pages/Settings"
import Customers from "./dashboard/pages/Customers"
import Pauses    from "./dashboard/pages/Pauses"

import HomePage from "./company/HomePage"
import AboutPage from "./company/AboutPage"
import PrivacyPage from "./company/PrivacyPage"
import ProductDemo from "./company/ProductDemo"

function VendorDashboard() {
  const [page,setPage]=useState("orders")
  const [open,setOpen]=useState(false)
  const [dark,setDark]=useState(false)

  const theme = createTheme({
    palette:{ mode: dark ? "dark" : "light" }
  })

  const render=()=>{
    if(page==="orders") return <Orders dark={dark}/>
    if(page==="apartments") return <Apartments dark={dark}/>
    if(page==="blocks") return <Blocks dark={dark}/>
    if(page==="settings") return <Settings dark={dark}/>
    if(page==="customers") return <Customers dark={dark}/>
    if(page==="pauses")    return <Pauses dark={dark}/>
  }

  return (
    <ThemeProvider theme={theme}>
      <Sidebar open={open} setOpen={setOpen} setPage={setPage} dark={dark}/>
      <Header setOpen={setOpen} setDark={setDark} dark={dark}/>
      <div style={{padding:"90px 20px 20px 20px"}}>
        {render()}
      </div>
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