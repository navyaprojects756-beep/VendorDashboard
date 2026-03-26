import { useEffect, useState } from "react"
import API, { getToken } from "../services/api"

import {
  Box, Typography, Paper, Switch, Button,
  Divider, CircularProgress, Chip, TextField,
  InputAdornment, Alert, Collapse,
} from "@mui/material"

import SettingsIcon      from "@mui/icons-material/Settings"
import SaveIcon          from "@mui/icons-material/Save"
import CheckCircleIcon   from "@mui/icons-material/CheckCircle"
import ApartmentIcon     from "@mui/icons-material/Apartment"
import GridViewIcon      from "@mui/icons-material/GridView"
import NotificationsIcon from "@mui/icons-material/Notifications"
import LocalDrinkIcon    from "@mui/icons-material/LocalDrink"
import AccessTimeIcon    from "@mui/icons-material/AccessTime"
import InfoOutlinedIcon  from "@mui/icons-material/InfoOutlined"

const SETTING_GROUPS = [
  {
    group: "Delivery",
    icon: <LocalDrinkIcon fontSize="small" />,
    color: "#2563eb",
    settings: [
      {
        key: "allow_apartments",
        label: "Apartment-based Delivery",
        desc: "Allow customers to select their apartment from a list during order placement.",
        icon: <ApartmentIcon sx={{ fontSize: 17 }} />,
      },
      {
        key: "allow_blocks",
        label: "Block-based Delivery",
        desc: "Enable block-level filtering within apartments.",
        icon: <GridViewIcon sx={{ fontSize: 17 }} />,
      },
      {
        key: "auto_generate_orders",
        label: "Auto-generate Daily Orders",
        desc: "Automatically create orders each day based on active subscriptions.",
        icon: <AccessTimeIcon sx={{ fontSize: 17 }} />,
      },
    ],
  },
  {
    group: "Notifications",
    icon: <NotificationsIcon fontSize="small" />,
    color: "#f97316",
    settings: [
      {
        key: "notify_on_delivery",
        label: "Delivery Confirmation Alerts",
        desc: "Send a notification when an order is marked as delivered.",
        icon: <CheckCircleIcon sx={{ fontSize: 17 }} />,
      },
      {
        key: "notify_pending_eod",
        label: "Pending Orders EOD Alert",
        desc: "Alert if there are still pending orders at end of day.",
        icon: <NotificationsIcon sx={{ fontSize: 17 }} />,
      },
    ],
  },
]

export default function Settings({ dark }) {
  const [s,       setS]       = useState({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [dirty,   setDirty]   = useState(false)

  const border        = dark ? "#1e293b" : "#e5e7eb"
  const bg            = dark ? "#0f172a" : "#ffffff"
  const textPrimary   = dark ? "#f1f5f9" : "#111827"
  const textSecondary = dark ? "#94a3b8" : "#6b7280"

  useEffect(() => {
    API.get(`/settings?token=${getToken()}`)
      .then((r) => setS(r.data))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (key) => {
    setS((prev) => ({ ...prev, [key]: !prev[key] }))
    setDirty(true)
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    await API.post(`/settings?token=${getToken()}`, s)
    setSaving(false)
    setSaved(true)
    setDirty(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Box sx={{ maxWidth: 680, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>

      {/* ── PAGE HEADER ── */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={1.2}>
          <Box
            sx={{
              width: 36, height: 36, borderRadius: "10px",
              background: "linear-gradient(135deg,#374151,#6b7280)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <SettingsIcon sx={{ fontSize: 18, color: "white" }} />
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize={17} color={textPrimary} lineHeight={1.2}>
              Settings
            </Typography>
            <Typography fontSize={12} color={textSecondary}>
              Configure your vendor preferences
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={saving ? <CircularProgress size={13} color="inherit" /> : <SaveIcon fontSize="small" />}
          onClick={save}
          disabled={saving || !dirty}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: 13,
            borderRadius: "8px",
            background: dirty ? "#2563eb" : dark ? "#1e293b" : "#e5e7eb",
            color: dirty ? "white" : textSecondary,
            "&:hover": { background: dirty ? "#1d4ed8" : undefined },
            "&.Mui-disabled": { background: dark ? "#1e293b" : "#f3f4f6", color: textSecondary },
          }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </Box>

      {/* ── SUCCESS ALERT ── */}
      <Collapse in={saved}>
        <Alert
          severity="success"
          icon={<CheckCircleIcon fontSize="small" />}
          sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}
        >
          Settings saved successfully.
        </Alert>
      </Collapse>

      {/* ── UNSAVED BANNER ── */}
      <Collapse in={dirty && !saved}>
        <Paper
          elevation={0}
          sx={{
            px: 2, py: 1.2, mb: 2, borderRadius: 2,
            background: dark ? "#1c1917" : "#fffbeb",
            border: `1px solid ${dark ? "#78350f" : "#fcd34d"}`,
            display: "flex", alignItems: "center", gap: 1,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 15, color: "#d97706" }} />
          <Typography fontSize={12} color="#d97706" fontWeight={500}>
            You have unsaved changes. Click "Save Changes" to apply.
          </Typography>
        </Paper>
      </Collapse>

      {loading ? (
        <Box py={8} textAlign="center">
          <CircularProgress size={24} sx={{ color: "#2563eb" }} />
        </Box>
      ) : (
        SETTING_GROUPS.map((group, gi) => (
          <Paper
            key={group.group}
            elevation={0}
            sx={{ borderRadius: 3, border: `1px solid ${border}`, overflow: "hidden", background: bg, mb: 2 }}
          >
            {/* Group header */}
            <Box
              sx={{
                px: 2.5, py: 1.5,
                display: "flex", alignItems: "center", gap: 1,
                background: dark ? "#111827" : "#f9fafb",
                borderBottom: `1px solid ${border}`,
              }}
            >
              <Box sx={{ color: group.color }}>{group.icon}</Box>
              <Typography fontWeight={700} fontSize={13} color={textPrimary}>
                {group.group}
              </Typography>
            </Box>

            {/* Settings rows */}
            {group.settings.map((setting, si) => (
              <Box key={setting.key}>
                <Box
                  sx={{
                    px: 2.5, py: 2,
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2,
                    "&:hover": { background: dark ? "#111827" : "#f9fafb" },
                    transition: "background 0.15s",
                  }}
                >
                  {/* Left */}
                  <Box display="flex" alignItems="flex-start" gap={1.5} flex={1}>
                    <Box
                      sx={{
                        width: 34, height: 34, borderRadius: "9px", flexShrink: 0,
                        mt: 0.2,
                        background: s[setting.key]
                          ? dark ? "#1e3a5f" : "#eff6ff"
                          : dark ? "#1e293b" : "#f3f4f6",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: s[setting.key] ? "#2563eb" : textSecondary,
                      }}
                    >
                      {setting.icon}
                    </Box>
                    <Box>
                      <Typography fontWeight={600} fontSize={13.5} color={textPrimary}>
                        {setting.label}
                      </Typography>
                      <Typography fontSize={12} color={textSecondary} mt={0.2} lineHeight={1.5}>
                        {setting.desc}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right */}
                  <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
                    <Chip
                      label={s[setting.key] ? "On" : "Off"}
                      size="small"
                      sx={{
                        fontSize: 11, fontWeight: 600,
                        background: s[setting.key]
                          ? dark ? "#1e3a5f" : "#eff6ff"
                          : dark ? "#1e293b" : "#f3f4f6",
                        color: s[setting.key] ? "#2563eb" : textSecondary,
                      }}
                    />
                    <Switch
                      size="small"
                      checked={!!s[setting.key]}
                      onChange={() => toggle(setting.key)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: "#2563eb" },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { background: "#2563eb" },
                      }}
                    />
                  </Box>
                </Box>
                {si !== group.settings.length - 1 && <Divider sx={{ borderColor: border }} />}
              </Box>
            ))}
          </Paper>
        ))
      )}

      {/* ── DANGER ZONE ── */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3, border: `1px solid ${dark ? "#450a0a" : "#fecaca"}`,
          overflow: "hidden", background: bg,
        }}
      >
        <Box
          sx={{
            px: 2.5, py: 1.5,
            background: dark ? "#1c0a0a" : "#fff5f5",
            borderBottom: `1px solid ${dark ? "#450a0a" : "#fecaca"}`,
          }}
        >
          <Typography fontWeight={700} fontSize={13} color="#dc2626">
            Danger Zone
          </Typography>
        </Box>
        <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography fontWeight={600} fontSize={13.5} color={textPrimary}>
              Reset All Orders
            </Typography>
            <Typography fontSize={12} color={textSecondary}>
              Mark all today's orders as pending. This cannot be undone.
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            sx={{
              textTransform: "none", fontWeight: 600, fontSize: 12,
              borderRadius: "8px", borderColor: "#dc2626", color: "#dc2626",
              "&:hover": { background: "#fef2f2", borderColor: "#dc2626" },
            }}
          >
            Reset Orders
          </Button>
        </Box>
      </Paper>

    </Box>
  )
}