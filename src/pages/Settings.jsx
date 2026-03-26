import { useEffect, useState } from "react"
import API, { getToken } from "../services/api"

import {
  Box, Typography, Paper, Switch, Button, Divider,
  CircularProgress, Chip, TextField, InputAdornment,
  Alert, Collapse, Tab, Tabs, Avatar,
} from "@mui/material"

import SettingsIcon       from "@mui/icons-material/Settings"
import SaveIcon           from "@mui/icons-material/Save"
import CheckCircleIcon    from "@mui/icons-material/CheckCircle"
import ApartmentIcon      from "@mui/icons-material/Apartment"
import GridViewIcon       from "@mui/icons-material/GridView"
import NotificationsIcon  from "@mui/icons-material/Notifications"
import LocalDrinkIcon     from "@mui/icons-material/LocalDrink"
import AccessTimeIcon     from "@mui/icons-material/AccessTime"
import InfoOutlinedIcon   from "@mui/icons-material/InfoOutlined"
import HomeIcon           from "@mui/icons-material/Home"
import EditNoteIcon       from "@mui/icons-material/EditNote"
import BusinessIcon       from "@mui/icons-material/Business"
import PhoneIcon          from "@mui/icons-material/Phone"
import LocationOnIcon     from "@mui/icons-material/LocationOn"
import ImageIcon          from "@mui/icons-material/Image"
import LockClockIcon      from "@mui/icons-material/LockClock"
import StorefrontIcon     from "@mui/icons-material/Storefront"
import NumbersIcon        from "@mui/icons-material/Numbers"
import AutorenewIcon      from "@mui/icons-material/Autorenew"
import WarningAmberIcon   from "@mui/icons-material/WarningAmber"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

/* ── reusable setting row ── */
function SettingRow({ icon, label, desc, checked, onChange, color = "#2563eb", dark }) {
  const border        = dark ? "#1e293b" : "#e5e7eb"
  const bgHov         = dark ? "#111827" : "#f9fafb"
  const textPrimary   = dark ? "#f1f5f9" : "#111827"
  const textSecondary = dark ? "#94a3b8" : "#6b7280"
  return (
    <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, "&:hover": { background: bgHov }, transition: "background 0.15s" }}>
      <Box display="flex" alignItems="flex-start" gap={1.5} flex={1}>
        <Box sx={{ width: 34, height: 34, borderRadius: "9px", flexShrink: 0, mt: 0.2, background: checked ? (dark ? "#1e3a5f" : "#eff6ff") : (dark ? "#1e293b" : "#f3f4f6"), display: "flex", alignItems: "center", justifyContent: "center", color: checked ? color : textSecondary }}>
          {icon}
        </Box>
        <Box>
          <Typography fontWeight={600} fontSize={13.5} color={textPrimary}>{label}</Typography>
          <Typography fontSize={12} color={textSecondary} mt={0.2} lineHeight={1.5}>{desc}</Typography>
        </Box>
      </Box>
      <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
        <Chip label={checked ? "On" : "Off"} size="small" sx={{ fontSize: 11, fontWeight: 600, background: checked ? (dark ? "#1e3a5f" : "#eff6ff") : (dark ? "#1e293b" : "#f3f4f6"), color: checked ? color : textSecondary }} />
        <Switch size="small" checked={!!checked} onChange={onChange}
          sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { background: color } }} />
      </Box>
    </Box>
  )
}

/* ── section card ── */
function Section({ title, icon, color, children, dark }) {
  const border      = dark ? "#1e293b" : "#e5e7eb"
  const bg          = dark ? "#0f172a" : "#ffffff"
  const bgCard      = dark ? "#111827" : "#f9fafb"
  const textPrimary = dark ? "#f1f5f9" : "#111827"
  return (
    <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${border}`, overflow: "hidden", background: bg, mb: 2 }}>
      <Box sx={{ px: 2.5, py: 1.5, display: "flex", alignItems: "center", gap: 1, background: bgCard, borderBottom: `1px solid ${border}` }}>
        <Box sx={{ color }}>{icon}</Box>
        <Typography fontWeight={700} fontSize={13} color={textPrimary}>{title}</Typography>
      </Box>
      {children}
    </Paper>
  )
}

/* ════════════════════════════════════════════
   MAIN
════════════════════════════════════════════ */
export default function Settings({ dark }) {
  const [tab, setTab] = useState(0)

  // settings
  const [s, setS]           = useState({})
  const [sLoad, setSLoad]   = useState(true)
  const [sSave, setSSave]   = useState(false)
  const [sDirty, setSDirty] = useState(false)
  const [sSaved, setSSaved] = useState(false)

  // profile
  const [p, setP]           = useState({})
  const [pLoad, setPLoad]   = useState(true)
  const [pSave, setPSave]   = useState(false)
  const [pDirty, setPDirty] = useState(false)
  const [pSaved, setPSaved] = useState(false)

  const border        = dark ? "#1e293b" : "#e5e7eb"
  const bg            = dark ? "#0f172a" : "#ffffff"
  const bgCard        = dark ? "#111827" : "#f9fafb"
  const textPrimary   = dark ? "#f1f5f9" : "#111827"
  const textSecondary = dark ? "#94a3b8" : "#6b7280"

  useEffect(() => {
    API.get(`/settings?token=${getToken()}`).then((r) => setS(r.data)).finally(() => setSLoad(false))
    API.get(`/profile?token=${getToken()}`).then((r) => setP(r.data)).finally(() => setPLoad(false))
  }, [])

  const toggleS = (key) => { setS((prev) => ({ ...prev, [key]: !prev[key] })); setSDirty(true); setSSaved(false) }
  const updateP = (key, val) => { setP((prev) => ({ ...prev, [key]: val })); setPDirty(true); setPSaved(false) }

  const toggleDay = (idx) => {
    const days = Array.isArray(p.active_days) ? [...p.active_days] : [0,1,2,3,4,5,6]
    const pos  = days.indexOf(idx)
    if (pos === -1) days.push(idx); else days.splice(pos, 1)
    updateP("active_days", days.sort((a,b) => a-b))
  }

  const saveSettings = async () => {
    setSSave(true)
    await API.post(`/settings?token=${getToken()}`, s)
    setSSave(false); setSSaved(true); setSDirty(false)
    setTimeout(() => setSSaved(false), 3000)
  }

  const saveProfile = async () => {
    setPSave(true)
    await API.put(`/profile?token=${getToken()}`, p)
    setPSave(false); setPSaved(true); setPDirty(false)
    setTimeout(() => setPSaved(false), 3000)
  }

  /* ── save bar ── */
  const SaveBar = ({ dirty, saving, saved, onSave, label = "Save Changes" }) => (
    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1.5} mb={2} flexWrap="wrap">
      <Collapse in={saved}>
        <Alert severity="success" icon={<CheckCircleIcon fontSize="small" />} sx={{ py: 0.3, borderRadius: 2, fontSize: 12 }}>
          Saved successfully.
        </Alert>
      </Collapse>
      <Collapse in={dirty && !saved}>
        <Box display="flex" alignItems="center" gap={0.8}
          sx={{ px: 1.5, py: 0.6, borderRadius: 2, background: dark ? "#1c1917" : "#fffbeb", border: `1px solid ${dark ? "#78350f" : "#fcd34d"}` }}>
          <InfoOutlinedIcon sx={{ fontSize: 14, color: "#d97706" }} />
          <Typography fontSize={12} color="#d97706" fontWeight={500}>Unsaved changes</Typography>
        </Box>
      </Collapse>
      <Button variant="contained" size="small" disabled={saving || !dirty}
        startIcon={saving ? <CircularProgress size={13} color="inherit" /> : <SaveIcon fontSize="small" />}
        onClick={onSave}
        sx={{
          textTransform: "none", fontWeight: 600, fontSize: 13, borderRadius: "8px",
          background: dirty ? "#2563eb" : (dark ? "#1e293b" : "#e5e7eb"),
          color: dirty ? "white" : textSecondary,
          "&:hover": { background: dirty ? "#1d4ed8" : undefined },
          "&.Mui-disabled": { background: dark ? "#1e293b" : "#f3f4f6", color: textSecondary },
        }}
      >
        {saving ? "Saving…" : label}
      </Button>
    </Box>
  )

  /* ════ PROFILE TAB ════ */
  const ProfileTab = () => (
    <Box>
      <SaveBar dirty={pDirty} saving={pSave} saved={pSaved} onSave={saveProfile} label="Save Profile" />
      {pLoad ? (
        <Box py={8} textAlign="center"><CircularProgress size={24} sx={{ color: "#2563eb" }} /></Box>
      ) : (
        <>
          {/* Business Info */}
          <Section title="Business Info" icon={<BusinessIcon fontSize="small" />} color="#2563eb" dark={dark}>
            <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={p.logo_url || ""} sx={{ width: 56, height: 56, borderRadius: "12px", background: "#eff6ff", border: `2px solid ${border}` }}>
                  <LocalDrinkIcon sx={{ color: "#2563eb" }} />
                </Avatar>
                <TextField size="small" label="Logo URL" fullWidth value={p.logo_url || ""}
                  onChange={(e) => updateP("logo_url", e.target.value)}
                  placeholder="https://…/logo.png"
                  InputProps={{ startAdornment: <InputAdornment position="start"><ImageIcon fontSize="small" sx={{ color: textSecondary }} /></InputAdornment> }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              </Box>
              <Box display="flex" gap={1.5} flexWrap="wrap">
                <TextField size="small" label="Business Name" value={p.business_name || ""}
                  onChange={(e) => updateP("business_name", e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><StorefrontIcon fontSize="small" sx={{ color: textSecondary }} /></InputAdornment> }}
                  sx={{ flex: "1 1 200px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
                <TextField size="small" label="WhatsApp Number" value={p.whatsapp_number || ""}
                  onChange={(e) => updateP("whatsapp_number", e.target.value)} placeholder="919XXXXXXXXX"
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" sx={{ color: textSecondary }} /></InputAdornment> }}
                  sx={{ flex: "1 1 180px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              </Box>
              <TextField size="small" label="Business Description" multiline minRows={2} maxRows={4}
                value={p.description || ""} onChange={(e) => updateP("description", e.target.value)}
                placeholder="Tell customers about your milk delivery service…"
                InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.2 }}><EditNoteIcon fontSize="small" sx={{ color: textSecondary }} /></InputAdornment> }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              <Box display="flex" gap={1.5} flexWrap="wrap">
                <TextField size="small" label="Area / Locality" value={p.area || ""}
                  onChange={(e) => updateP("area", e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon fontSize="small" sx={{ color: textSecondary }} /></InputAdornment> }}
                  sx={{ flex: "1 1 160px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
                <TextField size="small" label="City" value={p.city || ""}
                  onChange={(e) => updateP("city", e.target.value)}
                  sx={{ flex: "1 1 130px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              </Box>
            </Box>
          </Section>

          {/* Delivery Timings */}
          <Section title="Delivery Timings" icon={<AccessTimeIcon fontSize="small" />} color="#16a34a" dark={dark}>
            <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography fontSize={12} color={textSecondary}>
                Set the time window when you physically deliver milk to customers.
              </Typography>
              <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
                <TextField size="small" type="time" label="Delivery Starts"
                  value={p.delivery_start || ""} onChange={(e) => updateP("delivery_start", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: "1 1 140px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
                <Typography color={textSecondary} fontSize={13}>to</Typography>
                <TextField size="small" type="time" label="Delivery Ends"
                  value={p.delivery_end || ""} onChange={(e) => updateP("delivery_end", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: "1 1 140px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              </Box>
            </Box>
          </Section>

          {/* Order Acceptance Window */}
          <Section title="Order Acceptance Window" icon={<LockClockIcon fontSize="small" />} color="#f97316" dark={dark}>
            <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, background: dark ? "#1c1005" : "#fff7ed", border: `1px solid ${dark ? "#78350f" : "#fed7aa"}`, display: "flex", gap: 1 }}>
                <InfoOutlinedIcon sx={{ fontSize: 15, color: "#f97316", flexShrink: 0, mt: 0.1 }} />
                <Typography fontSize={12} color="#f97316" lineHeight={1.5}>
                  Controls when customers can place new orders via WhatsApp. Enable "Enforce Order Window" in Feature Settings to activate this.
                </Typography>
              </Box>
              <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
                <TextField size="small" type="time" label="Accept Orders From"
                  value={p.order_accept_start || ""} onChange={(e) => updateP("order_accept_start", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: "1 1 140px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
                <Typography color={textSecondary} fontSize={13}>to</Typography>
                <TextField size="small" type="time" label="Accept Orders Until"
                  value={p.order_accept_end || ""} onChange={(e) => updateP("order_accept_end", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: "1 1 140px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              </Box>

              {/* Active Days */}
              <Box>
                <Typography fontSize={12} fontWeight={600} color={textSecondary} mb={1} letterSpacing="0.4px">
                  ACTIVE DAYS
                </Typography>
                <Box display="flex" gap={0.8} flexWrap="wrap">
                  {DAYS.map((day, idx) => {
                    const isActive = Array.isArray(p.active_days) ? p.active_days.includes(idx) : true
                    return (
                      <Box key={day} onClick={() => toggleDay(idx)}
                        sx={{
                          width: 40, height: 40, borderRadius: "10px", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 600, fontSize: 12,
                          background: isActive ? "#f97316" : (dark ? "#1e293b" : "#f3f4f6"),
                          color: isActive ? "white" : textSecondary,
                          border: `1px solid ${isActive ? "#f97316" : border}`,
                          transition: "all 0.15s", "&:hover": { opacity: 0.85 },
                        }}
                      >
                        {day}
                      </Box>
                    )
                  })}
                </Box>
              </Box>

              {/* Live preview */}
              {p.order_accept_start && p.order_accept_end && (
                <Box sx={{ p: 1.5, borderRadius: 2, display: "flex", alignItems: "center", gap: 1, background: dark ? "#0f172a" : "#f9fafb", border: `1px solid ${border}` }}>
                  <AccessTimeIcon sx={{ fontSize: 15, color: "#16a34a" }} />
                  <Typography fontSize={12} color={textSecondary}>
                    Orders accepted:{" "}
                    <Box component="span" fontWeight={700} color={textPrimary}>{p.order_accept_start} – {p.order_accept_end}</Box>
                    {" "}on{" "}
                    <Box component="span" fontWeight={700} color={textPrimary}>
                      {(Array.isArray(p.active_days) ? p.active_days : [0,1,2,3,4,5,6]).sort((a,b)=>a-b).map((d) => DAYS[d]).join(", ")}
                    </Box>
                  </Typography>
                </Box>
              )}
            </Box>
          </Section>
        </>
      )}
    </Box>
  )

  /* ════ SETTINGS TAB ════ */
  const SettingsTab = () => (
    <Box>
      <SaveBar dirty={sDirty} saving={sSave} saved={sSaved} onSave={saveSettings} />
      {sLoad ? (
        <Box py={8} textAlign="center"><CircularProgress size={24} sx={{ color: "#2563eb" }} /></Box>
      ) : (
        <>
          {/* Address Types */}
          <Section title="Address Types (WhatsApp Bot)" icon={<HomeIcon fontSize="small" />} color="#2563eb" dark={dark}>
            {[
              { key: "allow_apartments", icon: <ApartmentIcon sx={{ fontSize: 17 }} />, label: "Apartment Delivery", desc: "Customers can select an apartment from your list. Bot will show apartment options.", color: "#2563eb" },
              { key: "allow_blocks",     icon: <GridViewIcon sx={{ fontSize: 17 }} />,   label: "Block Selection",    desc: "Enable block-level selection within apartments. Apartment Delivery must be on.", color: "#7c3aed" },
              { key: "require_flat_number", icon: <NumbersIcon sx={{ fontSize: 17 }} />, label: "Require Flat Number", desc: "Ask customers to enter their flat/door number during order registration.", color: "#2563eb" },
              { key: "allow_houses",     icon: <HomeIcon sx={{ fontSize: 17 }} />,       label: "House / Villa Delivery", desc: "Allow independent house customers to register with a manual address.", color: "#16a34a" },
              { key: "allow_manual_address", icon: <EditNoteIcon sx={{ fontSize: 17 }} />, label: "Manual Address Entry", desc: "Customers can type their full address manually if no apartment is found.", color: "#16a34a" },
            ].map((row, i, arr) => (
              <Box key={row.key}>
                <SettingRow icon={row.icon} label={row.label} desc={row.desc}
                  checked={!!s[row.key]} onChange={() => toggleS(row.key)} color={row.color} dark={dark} />
                {i < arr.length - 1 && <Divider sx={{ borderColor: border }} />}
              </Box>
            ))}
          </Section>

          {/* Max Quantity */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${border}`, background: bg, mb: 2, overflow: "hidden" }}>
            <Box sx={{ px: 2.5, py: 1.5, background: bgCard, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 1 }}>
              <NumbersIcon fontSize="small" sx={{ color: "#f97316" }} />
              <Typography fontWeight={700} fontSize={13} color={textPrimary}>Order Limits</Typography>
            </Box>
            <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
              <Box flex={1}>
                <Typography fontWeight={600} fontSize={13.5} color={textPrimary}>Max Quantity per Order</Typography>
                <Typography fontSize={12} color={textSecondary} mt={0.2}>Maximum milk packets a customer can order per day via WhatsApp.</Typography>
              </Box>
              <TextField size="small" type="number" value={s.max_quantity_per_order || 10}
                onChange={(e) => { setS((prev) => ({ ...prev, max_quantity_per_order: parseInt(e.target.value) || 1 })); setSDirty(true) }}
                inputProps={{ min: 1, max: 50 }}
                sx={{ width: 90, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 15, fontWeight: 700 } }} />
            </Box>
          </Paper>

          {/* Order Window & Automation */}
          <Section title="Order Window & Automation" icon={<LockClockIcon fontSize="small" />} color="#f97316" dark={dark}>
            {[
              { key: "order_window_enabled", icon: <LockClockIcon sx={{ fontSize: 17 }} />,  label: "Enforce Order Window", desc: "Only accept WhatsApp orders within the time window set in your Profile tab.", color: "#f97316" },
              { key: "auto_generate_orders", icon: <AutorenewIcon sx={{ fontSize: 17 }} />,  label: "Auto-generate Daily Orders", desc: "Automatically create orders each morning based on active subscriptions.", color: "#2563eb" },
            ].map((row, i, arr) => (
              <Box key={row.key}>
                <SettingRow icon={row.icon} label={row.label} desc={row.desc}
                  checked={!!s[row.key]} onChange={() => toggleS(row.key)} color={row.color} dark={dark} />
                {i < arr.length - 1 && <Divider sx={{ borderColor: border }} />}
              </Box>
            ))}
          </Section>

          {/* Notifications */}
          <Section title="Notifications" icon={<NotificationsIcon fontSize="small" />} color="#7c3aed" dark={dark}>
            {[
              { key: "notify_on_delivery", icon: <CheckCircleIcon sx={{ fontSize: 17 }} />,  label: "Delivery Confirmation", desc: "Send WhatsApp message to customer when their order is marked delivered.", color: "#16a34a" },
              { key: "notify_pending_eod", icon: <NotificationsIcon sx={{ fontSize: 17 }} />, label: "Pending Orders Alert",  desc: "Alert you if any orders are still pending at end of day.", color: "#f97316" },
            ].map((row, i, arr) => (
              <Box key={row.key}>
                <SettingRow icon={row.icon} label={row.label} desc={row.desc}
                  checked={!!s[row.key]} onChange={() => toggleS(row.key)} color={row.color} dark={dark} />
                {i < arr.length - 1 && <Divider sx={{ borderColor: border }} />}
              </Box>
            ))}
          </Section>

          {/* Danger Zone */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${dark ? "#450a0a" : "#fecaca"}`, overflow: "hidden", background: bg }}>
            <Box sx={{ px: 2.5, py: 1.5, background: dark ? "#1c0a0a" : "#fff5f5", borderBottom: `1px solid ${dark ? "#450a0a" : "#fecaca"}`, display: "flex", alignItems: "center", gap: 1 }}>
              <WarningAmberIcon fontSize="small" sx={{ color: "#dc2626" }} />
              <Typography fontWeight={700} fontSize={13} color="#dc2626">Danger Zone</Typography>
            </Box>
            <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
              <Box>
                <Typography fontWeight={600} fontSize={13.5} color={textPrimary}>Reset Today's Orders</Typography>
                <Typography fontSize={12} color={textSecondary}>Mark all today's orders as pending. Cannot be undone.</Typography>
              </Box>
              <Button size="small" variant="outlined"
                sx={{ textTransform: "none", fontWeight: 600, fontSize: 12, borderRadius: "8px", borderColor: "#dc2626", color: "#dc2626", "&:hover": { background: "#fef2f2", borderColor: "#dc2626" } }}>
                Reset Orders
              </Button>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  )

  /* ── RENDER ── */
  return (
    <Box sx={{ maxWidth: 720, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>

      {/* Page header */}
      <Box display="flex" alignItems="center" gap={1.2} mb={3}>
        <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#374151,#6b7280)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SettingsIcon sx={{ fontSize: 18, color: "white" }} />
        </Box>
        <Box>
          <Typography fontWeight={700} fontSize={17} color={textPrimary} lineHeight={1.2}>Settings</Typography>
          <Typography fontSize={12} color={textSecondary}>Manage your vendor profile and preferences</Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${border}`, background: bg, mb: 2, overflow: "hidden" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            px: 1,
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 13, color: textSecondary, minHeight: 44 },
            "& .Mui-selected": { color: "#2563eb" },
            "& .MuiTabs-indicator": { background: "#2563eb" },
          }}
        >
          <Tab label="Business Profile" icon={<BusinessIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Feature Settings" icon={<SettingsIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Paper>

      {tab === 0 && <ProfileTab />}
      {tab === 1 && <SettingsTab />}
    </Box>
  )
}