import { AppBar, Toolbar, Typography, IconButton, Box, Avatar } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import LightModeIcon from "@mui/icons-material/LightMode"
import LocalDrinkIcon from "@mui/icons-material/LocalDrink"
import API, { getToken } from "../services/api"
import { useState, useEffect } from "react"

export default function Header({ setOpen, dark, setDark }) {
  const [profile, setProfile] = useState({})

  useEffect(() => {
    API.get(`/profile?token=${getToken()}`).then((r) => setProfile(r.data)).catch(() => {})
  }, [])

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
          <Avatar
            src={profile.logo_url || ""}
            variant="rounded"
            sx={{
              width: 30,
              height: 30,
              borderRadius: "8px",
              background: "linear-gradient(135deg,#2563eb,#3b82f6)",
              border: `1px solid ${dark ? "#1e293b" : "#e5e7eb"}`,
            }}
          >
            <LocalDrinkIcon sx={{ fontSize: 16, color: "white" }} />
          </Avatar>
          <Box>
            <Typography
              fontWeight={700}
              fontSize={14}
              letterSpacing="-0.3px"
              lineHeight={1.1}
              sx={{ color: dark ? "#f1f5f9" : "#111827" }}
            >
              {profile.business_name || "MilkRoute"}
            </Typography>
            {(profile.area || profile.city) && (
              <Typography fontSize={10} lineHeight={1.1} sx={{ color: dark ? "#64748b" : "#9ca3af" }}>
                {[profile.area, profile.city].filter(Boolean).join(", ")}
              </Typography>
            )}
          </Box>
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

          <IconButton
            size="small"
            onClick={() => setDark((p) => !p)}
            title={dark ? "Light mode" : "Dark mode"}
            sx={{
              color: dark ? "#94a3b8" : "#6b7280",
              "&:hover": { background: dark ? "#1e293b" : "#f3f4f6" },
            }}
          >
            {dark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>


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
            {(profile.business_name?.[0] || "V").toUpperCase()}
          </Avatar>

        </Box>
      </Toolbar>
    </AppBar>
  )
}