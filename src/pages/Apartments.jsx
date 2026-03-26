import { useEffect, useState } from "react"
import API, { getToken } from "../services/api"

import {
  Box, Typography, Paper, TextField, Button,
  Divider, Switch, Chip, InputAdornment,
  IconButton, Tooltip, CircularProgress,
} from "@mui/material"

import AddIcon           from "@mui/icons-material/Add"
import SearchIcon        from "@mui/icons-material/Search"
import ApartmentIcon     from "@mui/icons-material/Apartment"
import EditIcon          from "@mui/icons-material/Edit"
import CheckIcon         from "@mui/icons-material/Check"
import CloseIcon         from "@mui/icons-material/Close"
import LocationOnIcon    from "@mui/icons-material/LocationOn"
import HomeWorkIcon      from "@mui/icons-material/HomeWork"

export default function Apartments({ dark }) {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")

  // add form
  const [name,    setName]    = useState("")
  const [address, setAddress] = useState("")
  const [adding,  setAdding]  = useState(false)
  const [saving,  setSaving]  = useState(false)

  // inline edit
  const [editId,      setEditId]      = useState(null)
  const [editName,    setEditName]    = useState("")
  const [editAddress, setEditAddress] = useState("")

  const load = () => {
    setLoading(true)
    API.get(`/apartments?token=${getToken()}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    if (!name.trim()) return
    setSaving(true)
    await API.post(`/apartments?token=${getToken()}`, { name, address })
    setName(""); setAddress(""); setAdding(false)
    load()
    setSaving(false)
  }

  const toggle = (id) =>
    API.patch(`/apartments/${id}/toggle?token=${getToken()}`).then(load)

  const saveEdit = async (id) => {
    await API.patch(`/apartments/${id}?token=${getToken()}`, {
      name: editName, address: editAddress,
    })
    setEditId(null)
    load()
  }

  const filtered = data.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.address || "").toLowerCase().includes(search.toLowerCase())
  )

  const active   = data.filter((a) => a.is_active).length
  const inactive = data.length - active

  const border = dark ? "#1e293b" : "#e5e7eb"
  const bg     = dark ? "#0f172a" : "#ffffff"
  const bgHov  = dark ? "#111827" : "#f9fafb"
  const textPrimary   = dark ? "#f1f5f9" : "#111827"
  const textSecondary = dark ? "#94a3b8" : "#6b7280"

  return (
    <Box sx={{ maxWidth: 780, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>

      {/* ── PAGE HEADER ── */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={1.2}>
          <Box
            sx={{
              width: 36, height: 36, borderRadius: "10px",
              background: "linear-gradient(135deg,#2563eb,#3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <HomeWorkIcon sx={{ fontSize: 18, color: "white" }} />
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize={17} color={textPrimary} lineHeight={1.2}>
              Apartments
            </Typography>
            <Typography fontSize={12} color={textSecondary}>
              Manage delivery locations
            </Typography>
          </Box>
        </Box>

        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon fontSize="small" />}
          onClick={() => setAdding((p) => !p)}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: 13,
            borderRadius: "8px", background: "#2563eb",
            "&:hover": { background: "#1d4ed8" },
          }}
        >
          Add Apartment
        </Button>
      </Box>

      {/* ── STATS ── */}
      <Box display="flex" gap={2} mb={2}>
        {[
          { label: "Total",    value: data.length,  color: "#2563eb", bg: dark ? "#1e3a5f" : "#eff6ff" },
          { label: "Active",   value: active,        color: "#16a34a", bg: dark ? "#14532d" : "#f0fdf4" },
          { label: "Inactive", value: inactive,      color: "#dc2626", bg: dark ? "#450a0a" : "#fef2f2" },
        ].map((s) => (
          <Paper
            key={s.label}
            elevation={0}
            sx={{
              flex: 1, p: 1.5, borderRadius: 2,
              background: s.bg, border: `1px solid ${border}`,
              textAlign: "center",
            }}
          >
            <Typography fontSize={22} fontWeight={700} color={s.color} lineHeight={1.1}>
              {s.value}
            </Typography>
            <Typography fontSize={11} fontWeight={600} color={s.color} sx={{ opacity: 0.8 }}>
              {s.label}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* ── ADD FORM ── */}
      {adding && (
        <Paper
          elevation={0}
          sx={{ p: 2, mb: 2, borderRadius: 3, border: `1px solid #2563eb`, background: dark ? "#0f172a" : "#eff6ff" }}
        >
          <Typography fontWeight={600} fontSize={13} color={textPrimary} mb={1.5}>
            New Apartment
          </Typography>
          <Box display="flex" gap={1.5} flexWrap="wrap">
            <TextField
              size="small"
              label="Apartment Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ flex: "1 1 180px", "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              size="small"
              label="Address / Area"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              sx={{ flex: "2 1 240px", "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <Box display="flex" gap={1} alignItems="flex-start">
              <Button
                variant="contained"
                size="small"
                onClick={add}
                disabled={saving || !name.trim()}
                sx={{
                  textTransform: "none", fontWeight: 600, borderRadius: "8px",
                  background: "#2563eb", "&:hover": { background: "#1d4ed8" },
                }}
              >
                {saving ? <CircularProgress size={14} color="inherit" /> : "Save"}
              </Button>
              <Button
                size="small"
                onClick={() => { setAdding(false); setName(""); setAddress("") }}
                sx={{ textTransform: "none", color: textSecondary, borderRadius: "8px" }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* ── SEARCH ── */}
      <Paper elevation={0} sx={{ px: 1.5, py: 1.2, mb: 2, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search apartments…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: textSecondary }} />
              </InputAdornment>
            ),
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 }, "& fieldset": { border: "none" } }}
        />
      </Paper>

      {/* ── COUNT ── */}
      <Typography fontSize={13} color={textSecondary} mb={1} px={0.5}>
        {filtered.length} apartment{filtered.length !== 1 ? "s" : ""}
      </Typography>

      {/* ── LIST ── */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${border}`, overflow: "hidden", background: bg }}>

        {loading && (
          <Box py={6} textAlign="center">
            <CircularProgress size={24} sx={{ color: "#2563eb" }} />
          </Box>
        )}

        {!loading && filtered.length === 0 && (
          <Box py={6} textAlign="center">
            <ApartmentIcon sx={{ fontSize: 36, color: border, mb: 1, display: "block", mx: "auto" }} />
            <Typography color={textSecondary} fontSize={14}>No apartments found.</Typography>
          </Box>
        )}

        {!loading && filtered.map((a, i) => (
          <Box key={a.apartment_id}>

            {editId === a.apartment_id ? (
              /* ── EDIT ROW ── */
              <Box sx={{ px: 2.5, py: 1.8, background: dark ? "#111827" : "#f8faff", display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                <TextField
                  size="small"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Name"
                  sx={{ flex: "1 1 140px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
                />
                <TextField
                  size="small"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Address"
                  sx={{ flex: "2 1 200px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
                />
                <Box display="flex" gap={0.5}>
                  <Tooltip title="Save">
                    <IconButton size="small" onClick={() => saveEdit(a.apartment_id)} sx={{ color: "#16a34a" }}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <IconButton size="small" onClick={() => setEditId(null)} sx={{ color: "#dc2626" }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ) : (
              /* ── NORMAL ROW ── */
              <Box
                sx={{
                  px: 2.5, py: 1.8,
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2,
                  "&:hover": { background: bgHov }, transition: "background 0.15s",
                }}
              >
                {/* LEFT */}
                <Box display="flex" alignItems="center"  gap={1.5} minWidth={0}>
                  <Box
                    sx={{
                      width: 34, height: 34, borderRadius: "9px", flexShrink: 0,
                      background: a.is_active
                        ? dark ? "#14532d" : "#f0fdf4"
                        : dark ? "#1e293b" : "#f9fafb",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <ApartmentIcon sx={{ fontSize: 17, color: a.is_active ? "#16a34a" : textSecondary }} />
                  </Box>
                  <Box minWidth={0}>
                    <Typography fontWeight={600} fontSize={14} color={textPrimary} noWrap>
                      {a.name}
                    </Typography>
                    {a.address && (
                      <Box display="flex" alignItems="center" gap={0.4}>
                        <LocationOnIcon sx={{ fontSize: 11, color: textSecondary, flexShrink: 0 }} />
                        <Typography fontSize={12} color={textSecondary} noWrap>
                          {a.address}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* RIGHT */}
                <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
                  <Chip
                    label={a.is_active ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                      fontSize: 11, fontWeight: 600,
                      background: a.is_active
                        ? dark ? "#14532d" : "#dcfce7"
                        : dark ? "#1e293b" : "#f3f4f6",
                      color: a.is_active ? "#16a34a" : textSecondary,
                    }}
                  />
                  <Switch
                    size="small"
                    checked={!!a.is_active}
                    onChange={() => toggle(a.apartment_id)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#16a34a" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { background: "#16a34a" },
                    }}
                  />
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => { setEditId(a.apartment_id); setEditName(a.name); setEditAddress(a.address || "") }}
                      sx={{ color: textSecondary, "&:hover": { color: "#2563eb" } }}
                    >
                      <EditIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            )}

            {i !== filtered.length - 1 && <Divider sx={{ borderColor: border }} />}
          </Box>
        ))}
      </Paper>
    </Box>
  )
}