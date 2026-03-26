import { Drawer, List, ListItemButton, ListItemText } from "@mui/material"

export default function Sidebar({open,setOpen,setPage}){

  const menu = ["orders","apartments","blocks","settings"]

  return (
    <Drawer open={open} onClose={()=>setOpen(false)}>
      <div style={{width:250,padding:20}}>
        <h3>Vendor</h3>

        <List>
          {menu.map(m=>(
            <ListItemButton key={m} onClick={()=>{
              setPage(m)
              setOpen(false)
            }}>
              <ListItemText primary={m.toUpperCase()} />
            </ListItemButton>
          ))}
        </List>
      </div>
    </Drawer>
  )
}