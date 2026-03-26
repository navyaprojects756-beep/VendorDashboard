import { Snackbar, Alert } from "@mui/material"

export default function Toast({open, setOpen, message, type="success"}){
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={()=>setOpen(false)}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert severity={type} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  )
}