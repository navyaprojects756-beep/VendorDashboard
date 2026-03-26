import { AppBar, Toolbar, Typography, IconButton, Button, Box, Tooltip, Avatar } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import AutorenewIcon from "@mui/icons-material/Autorenew"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import LightModeIcon from "@mui/icons-material/LightMode"
import LocalDrinkIcon from "@mui/icons-material/LocalDrink"
import API, { getToken } from "../services/api"
import { useState } from "react"

export default function Header({ setOpen, dark, setDark }) {
  const [generating, setGenerating] = useState(false)

  const generate = async () => {
    setGenerating(true)
    try {
      await API.post(`/generate-orders?token=${getToken()}`)
      window.location.reload()
    } finally {
      setGenerating(false)
    }
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: dark ? "#0f172a" : "#ffffff",
        borderBottom: `1px solid ${dark ? "#1e293b" : "#e5e7eb"}`,
        zIndex: 1300,
        color: dark ? "#f1f5f9" : "#111827",
      }}
    >
      <Toolbar sx={{ minHeight: "56px !important", px: { xs: 1.5, sm: 2.5 } }}>

        {/* Left — menu + logo */}
        <IconButton
          onClick={() => setOpen(true)}
          size="small"
          sx={{
            mr: 1.5,
            color: dark ? "#94a3b8" : "#6b7280",
            "&:hover": { background: dark ? "#1e293b" : "#f3f4f6" },
          }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>

        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "8px",
              background: "linear-gradient(135deg,#2563eb,#3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LocalDrinkIcon sx={{ fontSize: 16, color: "white" }} />
          </Box>
          <Typography
            fontWeight={700}
            fontSize={15}
            letterSpacing="-0.3px"
            sx={{ color: dark ? "#f1f5f9" : "#111827" }}
          >
            MilkRoute
          </Typography>
          <Box
            sx={{
              ml: 0.5,
              px: 0.8,
              py: 0.15,
              borderRadius: "4px",
              background: dark ? "#1e293b" : "#f3f4f6",
              fontSize: 10,
              fontWeight: 600,
              color: dark ? "#94a3b8" : "#6b7280",
              letterSpacing: "0.5px",
            }}
          >
            VENDOR
          </Box>
        </Box>

        <Box flex={1} />

        {/* Right actions */}
        <Box display="flex" alignItems="center" gap={0.5}>

          <Tooltip title="Generate today's orders">
            <Button
              size="small"
              variant="outlined"
              startIcon={
                <AutorenewIcon
                  fontSize="small"
                  sx={{
                    animation: generating ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
                  }}
                />
              }
              onClick={generate}
              disabled={generating}
              sx={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "8px",
                borderColor: dark ? "#334155" : "#e5e7eb",
                color: dark ? "#94a3b8" : "#374151",
                "&:hover": { borderColor: "#2563eb", color: "#2563eb", background: "transparent" },
              }}
            >
              {generating ? "Generating…" : "Generate"}
            </Button>
          </Tooltip>

          <Tooltip title={dark ? "Light mode" : "Dark mode"}>
            <IconButton
              size="small"
              onClick={() => setDark((p) => !p)}
              sx={{
                color: dark ? "#94a3b8" : "#6b7280",
                "&:hover": { background: dark ? "#1e293b" : "#f3f4f6" },
              }}
            >
              {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Avatar
            sx={{
              width: 30,
              height: 30,
              fontSize: 12,
              fontWeight: 700,
              background: "linear-gradient(135deg,#2563eb,#3b82f6)",
              ml: 0.5,
            }}
          >
            V
          </Avatar>

        </Box>
      </Toolbar>
    </AppBar>
  )
}