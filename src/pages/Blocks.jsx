import { useEffect, useState } from "react"
import API, { getToken } from "../services/api"
import { Card, Select, MenuItem, Button, Table, TableBody, TableRow, TableCell, Switch } from "@mui/material"

export default function Blocks(){

  const [apts,setApts]=useState([])
  const [apt,setApt]=useState("")
  const [blocks,setBlocks]=useState([])

  useEffect(()=>{
    API.get(`/apartments?token=${getToken()}`).then(r=>setApts(r.data))
  },[])

  const load=(id)=>{
    API.get(`/blocks/${id}?token=${getToken()}`).then(r=>setBlocks(r.data))
  }

  return (
    <Card sx={{p:2}}>
      <Select fullWidth onChange={e=>{
        setApt(e.target.value)
        load(e.target.value)
      }}>
        {apts.map(a=>(
          <MenuItem key={a.apartment_id} value={a.apartment_id}>{a.name}</MenuItem>
        ))}
      </Select>

      <Table>
        <TableBody>
          {blocks.map(b=>(
            <TableRow key={b.block_id}>
              <TableCell>{b.block_name}</TableCell>
              <TableCell>
                <Switch checked={b.is_active}
                  onChange={()=>API.patch(`/blocks/${b.block_id}/toggle?token=${getToken()}`).then(()=>load(apt))}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}