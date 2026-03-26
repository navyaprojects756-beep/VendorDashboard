import { AppBar, Toolbar, Typography, Button } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import API, { getToken } from "../services/api"

export default function Header({setOpen,setDark}){

  const generate = async ()=>{
    await API.post(`/generate-orders?token=${getToken()}`)
    window.location.reload()
  }

  return (
   <AppBar
  position="fixed"
  sx={{ background:"#1f2d3d", zIndex:1300 }}
>
      <Toolbar>

        <Button color="inherit" onClick={()=>setOpen(true)}>
          <MenuIcon/>
        </Button>

        <Typography sx={{flex:1}}>Milk Vendor Dashboard</Typography>

        <Button color="inherit" onClick={()=>setDark(prev=>!prev)}>
          Theme
        </Button>

        <Button color="inherit" onClick={generate}>
          Generate
        </Button>

      </Toolbar>
    </AppBar>
  )
}