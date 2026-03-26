import { useEffect, useState } from "react"
import API, { getToken } from "../services/api"
import { Card, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Switch } from "@mui/material"
import Toast from "../components/Toast"

export default function Apartments(){

  const [data,setData] = useState([])
  const [name,setName] = useState("")
  const [address,setAddress] = useState("")
  const [toast,setToast] = useState({open:false,msg:"",type:"success"})

  const load=()=>{
    API.get(`/apartments?token=${getToken()}`).then(res=>setData(res.data))
  }

  useEffect(()=>{load()},[])

  const add=async()=>{
    await API.post(`/apartments?token=${getToken()}`,{name,address})
    setToast({open:true,msg:"Added",type:"success"})
    load()
  }

  return (
    <>
      <Card sx={{p:2,mb:2}}>
        <TextField label="Name" onChange={e=>setName(e.target.value)}/>
        <TextField label="Address" onChange={e=>setAddress(e.target.value)}/>
        <Button onClick={add}>Add</Button>
      </Card>

      <Card sx={{p:2}}>
        <Table>
          <TableBody>
            {data.map(a=>(
              <TableRow key={a.apartment_id}>
                <TableCell>{a.name}</TableCell>
                <TableCell>
                  <Switch checked={a.is_active}
                    onChange={()=>API.patch(`/apartments/${a.apartment_id}/toggle?token=${getToken()}`).then(load)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Toast open={toast.open} setOpen={(v)=>setToast({...toast,open:v})} message={toast.msg}/>
    </>
  )
}