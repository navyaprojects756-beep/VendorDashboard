import { useEffect, useState } from "react"
import API, { getToken } from "../services/api"
import { Card, Switch, Button } from "@mui/material"

export default function Settings(){

  const [s,setS]=useState({})

  useEffect(()=>{
    API.get(`/settings?token=${getToken()}`).then(r=>setS(r.data))
  },[])

  const save=()=>{
    API.post(`/settings?token=${getToken()}`,s)
  }

  return (
    <Card sx={{p:2}}>
      <div>
        Apartments <Switch checked={s.allow_apartments||false}
        onChange={e=>setS({...s,allow_apartments:e.target.checked})}/>
      </div>

      <Button onClick={save}>Save</Button>
    </Card>
  )
}