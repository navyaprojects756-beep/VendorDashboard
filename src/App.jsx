import { useState } from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { CssBaseline } from "@mui/material"
import Sidebar from "./layout/Sidebar"
import Header from "./layout/Header"

import Orders from "./pages/Orders"
import Apartments from "./pages/Apartments"
import Blocks from "./pages/Blocks"
import Settings from "./pages/Settings"
import Customers from "./pages/Customers"

export default function App(){

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