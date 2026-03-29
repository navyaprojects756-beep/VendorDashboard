import {
  Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Box, Typography, Divider, Chip
} from "@mui/material"

import DashboardIcon     from "@mui/icons-material/Dashboard"
import ApartmentIcon     from "@mui/icons-material/Apartment"
import GridViewIcon      from "@mui/icons-material/GridView"
import SettingsIcon      from "@mui/icons-material/Settings"
import LocalDrinkIcon    from "@mui/icons-material/LocalDrink"
import ChevronRightIcon  from "@mui/icons-material/ChevronRight"
import PeopleIcon        from "@mui/icons-material/People"
import PauseCircleIcon   from "@mui/icons-material/PauseCircle"

const MENU = [
  { key: "orders",     label: "Orders",     icon: <DashboardIcon fontSize="small" />   },
  { key: "customers",  label: "Customers",  icon: <PeopleIcon fontSize="small" />      },
  { key: "pauses",     label: "Pauses",     icon: <PauseCircleIcon fontSize="small" /> },
  { key: "apartments", label: "Apartments", icon: <ApartmentIcon fontSize="small" />   },
  { key: "blocks",     label: "Blocks",     icon: <GridViewIcon fontSize="small" />    },
  { key: "settings",   label: "Settings",   icon: <SettingsIcon fontSize="small" />    },
]

export default function Sidebar({ open, setOpen, page, setPage, dark }) {
  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      PaperProps={{
        sx: {
          width: 240,
          background: dark ? "#0f172a" : "#ffffff",
          borderRight: `1px solid ${dark ? "#1e293b" : "#e5e7eb"}`,
        },
      }}
    >
      {/* Logo area */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          borderBottom: `1px solid ${dark ? "#1e293b" : "#f3f4f6"}`,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "10px",
            background: "linear-gradient(135deg,#2563eb,#3b82f6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <LocalDrinkIcon sx={{ fontSize: 18, color: "white" }} />
        </Box>
        <Box>
          <Typography
            fontWeight={700}
            fontSize={14}
            letterSpacing="-0.3px"
            color={dark ? "#f1f5f9" : "#111827"}
          >
            MilkRoute
          </Typography>
          <Typography fontSize={11} color={dark ? "#64748b" : "#9ca3af"}>
            Vendor Panel
          </Typography>
        </Box>
      </Box>

      {/* Nav */}
      <Box px={1.5} py={1.5} flex={1}>
        <Typography
          fontSize={10}
          fontWeight={700}
          letterSpacing="0.8px"
          color={dark ? "#475569" : "#9ca3af"}
          px={1}
          mb={0.8}
        >
          NAVIGATION
        </Typography>

        <List disablePadding>
          {MENU.map((m) => {
            const active = page === m.key
            return (
              <ListItemButton
                key={m.key}
                onClick={() => { setPage(m.key); setOpen(false) }}
                sx={{
                  borderRadius: "8px",
                  mb: 0.3,
                  px: 1.2,
                  py: 0.9,
                  background: active
                    ? dark ? "#1e3a5f" : "#eff6ff"
                    : "transparent",
                  "&:hover": {
                    background: active
                      ? dark ? "#1e3a5f" : "#eff6ff"
                      : dark ? "#1e293b" : "#f9fafb",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: active ? "#2563eb" : dark ? "#64748b" : "#9ca3af",
                  }}
                >
                  {m.icon}
                </ListItemIcon>
                <ListItemText
                  primary={m.label}
                  primaryTypographyProps={{
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 500,
                    color: active ? "#2563eb" : dark ? "#cbd5e1" : "#374151",
                  }}
                />
                {active && (
                  <ChevronRightIcon sx={{ fontSize: 14, color: "#2563eb" }} />
                )}
              </ListItemButton>
            )
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box
        px={2}
        py={1.5}
        sx={{ borderTop: `1px solid ${dark ? "#1e293b" : "#f3f4f6"}` }}
      >
        <Typography fontSize={11} color={dark ? "#475569" : "#9ca3af"}>
          © 2026 MilkRoute
        </Typography>
      </Box>
    </Drawer>
  )
}