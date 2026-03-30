import { useEffect, useState, useRef } from "react"
import API, { getToken } from "../../services/api"

import {
  Box, Typography, Paper, Switch, Button, Divider,
  CircularProgress, Chip, TextField, InputAdornment,
  Alert, Collapse, Tab, Tabs, Avatar, IconButton, Tooltip,
} from "@mui/material"

import SettingsIcon       from "@mui/icons-material/Settings"
import SaveIcon           from "@mui/icons-material/Save"
import CheckCircleIcon    from "@mui/icons-material/CheckCircle"
import ApartmentIcon      from "@mui/icons-material/Apartment"
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
import AutorenewIcon      from "@mui/icons-material/Autorenew"
import VisibilityIcon     from "@mui/icons-material/Visibility"
import ContentCopyIcon    from "@mui/icons-material/ContentCopy"
import WhatsAppIcon       from "@mui/icons-material/WhatsApp"
import ShareIcon          from "@mui/icons-material/Share"

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

  const [linkCopied, setLinkCopied] = useState(false)

  // logo upload
  const [logoFile, setLogoFile]       = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoError, setLogoError]     = useState("")
  const fileInputRef                  = useRef(null)

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

  const handleLogoSelect = (e) => {
    const file = e.target.files[0]
    e.target.value = ""
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setLogoError("Only image files are allowed (JPG, PNG, GIF, WebP).")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError(`File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB. Max allowed is 5 MB.`)
      return
    }
    setLogoError("")
    setLogoFile(file)
    if (logoPreview) URL.revokeObjectURL(logoPreview)
    setLogoPreview(URL.createObjectURL(file))
    setPDirty(true)
    setPSaved(false)
  }

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
    try {
      let profileData = { ...p }

      if (logoFile) {
        const fd = new FormData()
        fd.append("logo", logoFile)
        const uploadRes = await API.post(`/upload-logo?token=${getToken()}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        profileData.logo_url = uploadRes.data.logo_url
        setP((prev) => ({ ...prev, logo_url: uploadRes.data.logo_url }))
        setLogoFile(null)
        if (logoPreview) { URL.revokeObjectURL(logoPreview); setLogoPreview(null) }
      }

      await API.put(`/profile?token=${getToken()}`, profileData)
      setPSaved(true); setPDirty(false)
      setTimeout(() => setPSaved(false), 3000)
    } finally {
      setPSave(false)
    }
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
                <Avatar src={logoPreview || p.logo_url || ""} sx={{ width: 56, height: 56, borderRadius: "12px", background: "#eff6ff", border: `2px solid ${border}`, flexShrink: 0 }}>
                  <LocalDrinkIcon sx={{ color: "#2563eb" }} />
                </Avatar>
                <Box flex={1}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                    style={{ display: "none" }}
                    onChange={handleLogoSelect}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<ImageIcon fontSize="small" />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      textTransform: "none", fontWeight: 600, fontSize: 13,
                      borderRadius: 2, borderColor: border, color: textSecondary,
                      justifyContent: "flex-start",
                      "&:hover": { borderColor: "#2563eb", color: "#2563eb", background: "transparent" },
                    }}
                  >
                    {logoFile ? logoFile.name : (p.logo_url ? "Change Logo" : "Upload Logo")}
                  </Button>
                  {logoError && (
                    <Typography fontSize={11} color="#dc2626" mt={0.5}>{logoError}</Typography>
                  )}
                  <Typography fontSize={11} color={textSecondary} mt={0.4}>
                    Images only (JPG, PNG, GIF, WebP) · Max 5 MB
                  </Typography>
                </Box>
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

          {/* WhatsApp Share Link */}
          {(p.whatsapp_api_number || p.whatsapp_number) && (
            <Section title="WhatsApp Share Link" icon={<ShareIcon fontSize="small" />} color="#16a34a" dark={dark}>
              <Box sx={{ px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography fontSize={12} color={textSecondary} lineHeight={1.5}>
                  Share this link with your customers. When they tap it, WhatsApp opens with a "Hi" message sent to your number.
                </Typography>
                <Box sx={{
                  display: "flex", alignItems: "center", gap: 1,
                  px: 1.5, py: 1.2, borderRadius: 2,
                  background: dark ? "#052e16" : "#f0fdf4",
                  border: `1px solid ${dark ? "#14532d" : "#bbf7d0"}`,
                }}>
                  <WhatsAppIcon sx={{ fontSize: 18, color: "#16a34a", flexShrink: 0 }} />
                  <Typography fontSize={12.5} fontWeight={500} color={dark ? "#86efac" : "#15803d"} sx={{ flex: 1, wordBreak: "break-all" }}>
                    {`https://wa.me/${p.whatsapp_api_number || p.whatsapp_number}?text=Hi`}
                  </Typography>
                  <Tooltip title={linkCopied ? "Copied!" : "Copy link"} placement="top">
                    <IconButton size="small" onClick={() => {
                      navigator.clipboard.writeText(`https://wa.me/${p.whatsapp_api_number || p.whatsapp_number}?text=Hi`)
                      setLinkCopied(true)
                      setTimeout(() => setLinkCopied(false), 2000)
                    }}>
                      <ContentCopyIcon sx={{ fontSize: 16, color: linkCopied ? "#16a34a" : textSecondary }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Section>
          )}

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
              { key: "allow_apartments", icon: <ApartmentIcon sx={{ fontSize: 17 }} />, label: "Apartment Delivery",    desc: "Customers can select an apartment from your list. Bot will show apartment options.", color: "#2563eb" },
              { key: "allow_houses",     icon: <HomeIcon sx={{ fontSize: 17 }} />,       label: "House / Villa Delivery", desc: "Allow independent house customers to register with a manual address.",              color: "#16a34a" },
            ].map((row, i, arr) => (
              <Box key={row.key}>
                <SettingRow icon={row.icon} label={row.label} desc={row.desc}
                  checked={!!s[row.key]} onChange={() => toggleS(row.key)} color={row.color} dark={dark} />
                {i < arr.length - 1 && <Divider sx={{ borderColor: border }} />}
              </Box>
            ))}
          </Section>

          {/* Privacy */}
          <Section title="Privacy" icon={<VisibilityIcon fontSize="small" />} color="#7c3aed" dark={dark}>
            <SettingRow
              icon={<VisibilityIcon sx={{ fontSize: 17 }} />}
              label="Show Customer Phone Numbers"
              desc="Display customer phone numbers in the Orders list. Turn off to hide them for privacy."
              checked={!!s.show_phone_numbers}
              onChange={() => toggleS("show_phone_numbers")}
              color="#7c3aed"
              dark={dark}
            />
          </Section>

          {/* Price per unit */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${border}`, background: bg, mb: 2, overflow: "hidden" }}>
            <Box sx={{ px: 2.5, py: 1.5, background: bgCard, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 1 }}>
              <StorefrontIcon fontSize="small" sx={{ color: "#16a34a" }} />
              <Typography fontWeight={700} fontSize={13} color={textPrimary}>Pricing</Typography>
            </Box>
            <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
              <Box flex={1}>
                <Typography fontWeight={600} fontSize={13.5} color={textPrimary}>Price per Packet (₹)</Typography>
                <Typography fontSize={12} color={textSecondary} mt={0.2}>
                  Used to calculate invoice totals for each customer.
                </Typography>
              </Box>
              <TextField size="small" type="number"
                value={s.price_per_unit ?? ""}
                onChange={(e) => { setS((prev) => ({ ...prev, price_per_unit: e.target.value })); setSDirty(true); setSSaved(false) }}
                slotProps={{ input: { min: 0, step: 0.5, startAdornment: <InputAdornment position="start"><Typography fontSize={14} fontWeight={700}>₹</Typography></InputAdornment> } }}
                sx={{ width: 110, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 15, fontWeight: 700 } }} />
            </Box>
          </Paper>

          {/* Auto-generate Time */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${border}`, background: bg, mb: 2, overflow: "hidden" }}>
            <Box sx={{ px: 2.5, py: 1.5, background: bgCard, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 1 }}>
              <AutorenewIcon fontSize="small" sx={{ color: "#2563eb" }} />
              <Typography fontWeight={700} fontSize={13} color={textPrimary}>Auto-generate Orders</Typography>
            </Box>
            <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
              <Box flex={1}>
                <Typography fontWeight={600} fontSize={13.5} color={textPrimary}>Daily Generation Time</Typography>
                <Typography fontSize={12} color={textSecondary} mt={0.2}>
                  Orders will be automatically generated at this time each day based on active subscriptions.
                </Typography>
              </Box>
              <TextField size="small" type="time"
                value={s.auto_generate_time || ""}
                onChange={(e) => { setS((prev) => ({ ...prev, auto_generate_time: e.target.value })); setSDirty(true); setSSaved(false) }}
                sx={{ width: 130, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 15, fontWeight: 700 } }} />
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