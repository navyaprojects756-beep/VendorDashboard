import { useEffect, useState } from "react"
import API, { getToken } from "../services/api"

import {
  Box, Typography, Paper, TextField, Button,
  Divider, Switch, Chip, InputAdornment,
  IconButton, Tooltip, CircularProgress,
  Select, MenuItem, FormControl, InputLabel,
} from "@mui/material"

import AddIcon        from "@mui/icons-material/Add"
import SearchIcon     from "@mui/icons-material/Search"
import GridViewIcon   from "@mui/icons-material/GridView"
import ApartmentIcon  from "@mui/icons-material/Apartment"
import EditIcon       from "@mui/icons-material/Edit"
import CheckIcon      from "@mui/icons-material/Check"
import CloseIcon      from "@mui/icons-material/Close"

export default function Blocks({ dark }) {
  const [apts,    setApts]    = useState([])
  const [aptId,   setAptId]   = useState("")
  const [blocks,  setBlocks]  = useState([])
  const [loading, setLoading] = useState(false)
  const [search,  setSearch]  = useState("")

  // add form
  const [adding,    setAdding]    = useState(false)
  const [newBlock,  setNewBlock]  = useState("")
  const [saving,    setSaving]    = useState(false)

  // inline edit
  const [editId,   setEditId]   = useState(null)
  const [editName, setEditName] = useState("")

  useEffect(() => {
    API.get(`/apartments?token=${getToken()}`).then((r) => setApts(r.data))
  }, [])

  const loadBlocks = (id) => {
    if (!id) return
    setLoading(true)
    API.get(`/blocks/${id}?token=${getToken()}`)
      .then((r) => setBlocks(r.data))
      .finally(() => setLoading(false))
  }

  const handleApt = (id) => {
    setAptId(id)
    setBlocks([])
    setSearch("")
    loadBlocks(id)
  }

  const addBlock = async () => {
    if (!newBlock.trim() || !aptId) return
    setSaving(true)
    await API.post(`/blocks?token=${getToken()}`, { apartment_id: aptId, block_name: newBlock })
    setNewBlock(""); setAdding(false)
    loadBlocks(aptId)
    setSaving(false)
  }

  const toggle = (id) =>
    API.patch(`/blocks/${id}/toggle?token=${getToken()}`).then(() => loadBlocks(aptId))

  const saveEdit = async (id) => {
    await API.patch(`/blocks/${id}?token=${getToken()}`, { block_name: editName })
    setEditId(null)
    loadBlocks(aptId)
  }

  const filtered = blocks.filter((b) =>
    b.block_name.toLowerCase().includes(search.toLowerCase())
  )

  const active   = blocks.filter((b) => b.is_active).length
  const inactive = blocks.length - active

  const border        = dark ? "#1e293b" : "#e5e7eb"
  const bg            = dark ? "#0f172a" : "#ffffff"
  const bgHov         = dark ? "#111827" : "#f9fafb"
  const textPrimary   = dark ? "#f1f5f9" : "#111827"
  const textSecondary = dark ? "#94a3b8" : "#6b7280"

  const selectedApt = apts.find((a) => a.apartment_id === aptId)

  return (
    <Box sx={{ maxWidth: 780, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>

      {/* ── PAGE HEADER ── */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={1.2}>
          <Box
            sx={{
              width: 36, height: 36, borderRadius: "10px",
              background: "linear-gradient(135deg,#7c3aed,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <GridViewIcon sx={{ fontSize: 18, color: "white" }} />
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize={17} color={textPrimary} lineHeight={1.2}>
              Blocks
            </Typography>
            <Typography fontSize={12} color={textSecondary}>
              Manage blocks within apartments
            </Typography>
          </Box>
        </Box>

        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon fontSize="small" />}
          disabled={!aptId}
          onClick={() => setAdding((p) => !p)}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: 13,
            borderRadius: "8px", background: "#7c3aed",
            "&:hover": { background: "#6d28d9" },
            "&.Mui-disabled": { background: border },
          }}
        >
          Add Block
        </Button>
      </Box>

      {/* ── APARTMENT SELECTOR ── */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
        <Typography fontSize={12} fontWeight={600} color={textSecondary} mb={1} letterSpacing="0.4px">
          SELECT APARTMENT
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {apts.map((a) => (
            <Chip
              key={a.apartment_id}
              label={a.name}
              icon={<ApartmentIcon sx={{ fontSize: "14px !important" }} />}
              onClick={() => handleApt(a.apartment_id)}
              variant={aptId === a.apartment_id ? "filled" : "outlined"}
              sx={{
                fontSize: 12, fontWeight: 500, borderRadius: "8px",
                cursor: "pointer",
                background: aptId === a.apartment_id ? "#7c3aed" : "transparent",
                color: aptId === a.apartment_id ? "white" : textSecondary,
                borderColor: aptId === a.apartment_id ? "#7c3aed" : border,
                "& .MuiChip-icon": {
                  color: aptId === a.apartment_id ? "white" : textSecondary,
                },
                "&:hover": {
                  background: aptId === a.apartment_id ? "#6d28d9" : dark ? "#1e293b" : "#f9fafb",
                },
              }}
            />
          ))}
          {apts.length === 0 && (
            <Typography fontSize={13} color={textSecondary}>
              No apartments available. Add one first.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Only show rest if apartment selected */}
      {aptId && (
        <>
          {/* ── STATS ── */}
          <Box display="flex" gap={2} mb={2}>
            {[
              { label: "Total",    value: blocks.length, color: "#7c3aed", bg: dark ? "#2e1065" : "#f5f3ff" },
              { label: "Active",   value: active,         color: "#16a34a", bg: dark ? "#14532d" : "#f0fdf4" },
              { label: "Inactive", value: inactive,       color: "#dc2626", bg: dark ? "#450a0a" : "#fef2f2" },
            ].map((s) => (
              <Paper key={s.label} elevation={0} sx={{ flex: 1, p: 1.5, borderRadius: 2, background: s.bg, border: `1px solid ${border}`, textAlign: "center" }}>
                <Typography fontSize={22} fontWeight={700} color={s.color} lineHeight={1.1}>{s.value}</Typography>
                <Typography fontSize={11} fontWeight={600} color={s.color} sx={{ opacity: 0.8 }}>{s.label}</Typography>
              </Paper>
            ))}
          </Box>

          {/* ── ADD FORM ── */}
          {adding && (
            <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: `1px solid #7c3aed`, background: dark ? "#0f172a" : "#f5f3ff" }}>
              <Typography fontWeight={600} fontSize={13} color={textPrimary} mb={1.5}>
                New Block in <b>{selectedApt?.name}</b>
              </Typography>
              <Box display="flex" gap={1.5} alignItems="flex-start">
                <TextField
                  size="small"
                  label="Block Name *"
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addBlock()}
                  sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={addBlock}
                  disabled={saving || !newBlock.trim()}
                  sx={{
                    textTransform: "none", fontWeight: 600, borderRadius: "8px",
                    background: "#7c3aed", "&:hover": { background: "#6d28d9" },
                  }}
                >
                  {saving ? <CircularProgress size={14} color="inherit" /> : "Save"}
                </Button>
                <Button size="small" onClick={() => { setAdding(false); setNewBlock("") }}
                  sx={{ textTransform: "none", color: textSecondary, borderRadius: "8px" }}>
                  Cancel
                </Button>
              </Box>
            </Paper>
          )}

          {/* ── SEARCH ── */}
          <Paper elevation={0} sx={{ px: 1.5, py: 1.2, mb: 2, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
            <TextField
              fullWidth size="small"
              placeholder={`Search blocks in ${selectedApt?.name}…`}
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
            {filtered.length} block{filtered.length !== 1 ? "s" : ""} in {selectedApt?.name}
          </Typography>

          {/* ── LIST ── */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${border}`, overflow: "hidden", background: bg }}>
            {loading && (
              <Box py={6} textAlign="center">
                <CircularProgress size={24} sx={{ color: "#7c3aed" }} />
              </Box>
            )}

            {!loading && filtered.length === 0 && (
              <Box py={6} textAlign="center">
                <GridViewIcon sx={{ fontSize: 36, color: border, mb: 1, display: "block", mx: "auto" }} />
                <Typography color={textSecondary} fontSize={14}>No blocks found.</Typography>
              </Box>
            )}

            {!loading && filtered.map((b, i) => (
              <Box key={b.block_id}>
                {editId === b.block_id ? (
                  <Box sx={{ px: 2.5, py: 1.8, background: dark ? "#111827" : "#f8f5ff", display: "flex", gap: 1.5, alignItems: "center" }}>
                    <TextField
                      size="small" value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(b.block_id)}
                      sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
                    />
                    <Tooltip title="Save">
                      <IconButton size="small" onClick={() => saveEdit(b.block_id)} sx={{ color: "#16a34a" }}>
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel">
                      <IconButton size="small" onClick={() => setEditId(null)} sx={{ color: "#dc2626" }}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      px: 2.5, py: 1.8,
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2,
                      "&:hover": { background: bgHov }, transition: "background 0.15s",
                    }}
                  >
                    {/* LEFT */}
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 32, height: 32, borderRadius: "8px", flexShrink: 0,
                          background: b.is_active
                            ? dark ? "#2e1065" : "#f5f3ff"
                            : dark ? "#1e293b" : "#f9fafb",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <GridViewIcon sx={{ fontSize: 15, color: b.is_active ? "#7c3aed" : textSecondary }} />
                      </Box>
                      <Box>
                        <Typography fontWeight={600} fontSize={14} color={textPrimary}>
                          {b.block_name}
                        </Typography>
                        <Typography fontSize={11} color={textSecondary}>
                          {selectedApt?.name}
                        </Typography>
                      </Box>
                    </Box>

                    {/* RIGHT */}
                    <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
                      <Chip
                        label={b.is_active ? "Active" : "Inactive"}
                        size="small"
                        sx={{
                          fontSize: 11, fontWeight: 600,
                          background: b.is_active
                            ? dark ? "#2e1065" : "#ede9fe"
                            : dark ? "#1e293b" : "#f3f4f6",
                          color: b.is_active ? "#7c3aed" : textSecondary,
                        }}
                      />
                      <Switch
                        size="small"
                        checked={!!b.is_active}
                        onChange={() => toggle(b.block_id)}
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": { color: "#7c3aed" },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { background: "#7c3aed" },
                        }}
                      />
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => { setEditId(b.block_id); setEditName(b.block_name) }}
                          sx={{ color: textSecondary, "&:hover": { color: "#7c3aed" } }}
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
        </>
      )}

      {/* Prompt to pick apartment */}
      {!aptId && (
        <Paper elevation={0} sx={{ py: 8, borderRadius: 3, border: `1px solid ${border}`, background: bg, textAlign: "center" }}>
          <ApartmentIcon sx={{ fontSize: 40, color: border, mb: 1.5, display: "block", mx: "auto" }} />
          <Typography fontWeight={600} color={textSecondary} fontSize={14}>
            Select an apartment above to view its blocks
          </Typography>
        </Paper>
      )}

    </Box>
  )
}