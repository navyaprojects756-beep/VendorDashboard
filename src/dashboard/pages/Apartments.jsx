import { useEffect, useState, useCallback } from "react"
import API, { getToken } from "../../services/api"

import {
  Box, Typography, Paper, TextField, Button,
  Divider, Switch, Chip, InputAdornment,
  IconButton, Tooltip, CircularProgress, Collapse,
} from "@mui/material"

import AddIcon          from "@mui/icons-material/Add"
import SearchIcon       from "@mui/icons-material/Search"
import ApartmentIcon    from "@mui/icons-material/Apartment"
import EditIcon         from "@mui/icons-material/Edit"
import CheckIcon        from "@mui/icons-material/Check"
import CloseIcon        from "@mui/icons-material/Close"
import LocationOnIcon   from "@mui/icons-material/LocationOn"
import HomeWorkIcon     from "@mui/icons-material/HomeWork"
import ExpandMoreIcon   from "@mui/icons-material/ExpandMore"
import GridViewIcon     from "@mui/icons-material/GridView"

export default function Apartments({ dark }) {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")

  // add apartment form
  const [name,    setName]    = useState("")
  const [address, setAddress] = useState("")
  const [adding,  setAdding]  = useState(false)
  const [saving,  setSaving]  = useState(false)

  // inline edit apartment
  const [editId,      setEditId]      = useState(null)
  const [editName,    setEditName]    = useState("")
  const [editAddress, setEditAddress] = useState("")

  // expanded apartments (Set of apartment_ids)
  const [expanded, setExpanded] = useState(new Set())

  // blocks per apartment: { [apartment_id]: [] }
  const [blocksMap,     setBlocksMap]     = useState({})
  const [blocksLoading, setBlocksLoading] = useState({})

  // add block form per apartment: { [apartment_id]: string }
  const [newBlockName, setNewBlockName] = useState({})
  const [addingBlock,  setAddingBlock]  = useState({})
  const [savingBlock,  setSavingBlock]  = useState({})

  // inline edit block
  const [editBlockId,   setEditBlockId]   = useState(null)
  const [editBlockName, setEditBlockName] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    API.get(`/apartments?token=${getToken()}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const loadBlocks = useCallback((aptId) => {
    setBlocksLoading((p) => ({ ...p, [aptId]: true }))
    API.get(`/blocks/${aptId}?token=${getToken()}`)
      .then((r) => setBlocksMap((p) => ({ ...p, [aptId]: r.data })))
      .finally(() => setBlocksLoading((p) => ({ ...p, [aptId]: false })))
  }, [])

  const toggleExpand = (aptId) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(aptId)) {
        next.delete(aptId)
      } else {
        next.add(aptId)
        if (!blocksMap[aptId]) loadBlocks(aptId)
      }
      return next
    })
  }

  /* ── APARTMENT CRUD ── */
  const addApartment = async () => {
    if (!name.trim()) return
    setSaving(true)
    await API.post(`/apartments?token=${getToken()}`, { name, address })
    setName(""); setAddress(""); setAdding(false)
    load()
    setSaving(false)
  }

  const toggleApartment = (id) =>
    API.patch(`/apartments/${id}/toggle?token=${getToken()}`).then(load)

  const saveEditApartment = async (id) => {
    await API.patch(`/apartments/${id}?token=${getToken()}`, {
      name: editName, address: editAddress,
    })
    setEditId(null)
    load()
  }


  /* ── BLOCK CRUD ── */
  const addBlock = async (aptId) => {
    const bname = (newBlockName[aptId] || "").trim()
    if (!bname) return
    setSavingBlock((p) => ({ ...p, [aptId]: true }))
    await API.post(`/blocks?token=${getToken()}`, { apartment_id: aptId, block_name: bname })
    setNewBlockName((p) => ({ ...p, [aptId]: "" }))
    setAddingBlock((p) => ({ ...p, [aptId]: false }))
    loadBlocks(aptId)
    setSavingBlock((p) => ({ ...p, [aptId]: false }))
  }

  const toggleBlock = (blockId, aptId) =>
    API.patch(`/blocks/${blockId}/toggle?token=${getToken()}`).then(() => loadBlocks(aptId))

  const saveEditBlock = async (blockId, aptId) => {
    await API.patch(`/blocks/${blockId}?token=${getToken()}`, { block_name: editBlockName })
    setEditBlockId(null)
    loadBlocks(aptId)
  }


  /* ── FILTER ── */
  const filtered = data.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.address || "").toLowerCase().includes(search.toLowerCase())
  )

  const active   = data.filter((a) => a.is_active).length
  const inactive = data.length - active

  /* ── THEME ── */
  const border        = dark ? "#1e293b" : "#e5e7eb"
  const bg            = dark ? "#0f172a" : "#ffffff"
  const bgHov         = dark ? "#111827" : "#f9fafb"
  const bgBlock       = dark ? "#0a1628" : "#f8faff"
  const textPrimary   = dark ? "#f1f5f9" : "#111827"
  const textSecondary = dark ? "#94a3b8" : "#6b7280"

  return (
    <Box sx={{ maxWidth: 820, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>

      {/* ── PAGE HEADER ── */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={1.2}>
          <Box sx={{
            width: 36, height: 36, borderRadius: "10px",
            background: "linear-gradient(135deg,#2563eb,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <HomeWorkIcon sx={{ fontSize: 18, color: "white" }} />
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize={17} color={textPrimary} lineHeight={1.2}>
              Apartments & Blocks
            </Typography>
            <Typography fontSize={12} color={textSecondary}>
              Manage delivery locations and blocks
            </Typography>
          </Box>
        </Box>
        <Button
          size="small" variant="contained"
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
          { label: "Total",    value: data.length, color: "#2563eb", bg: dark ? "#1e3a5f" : "#eff6ff" },
          { label: "Active",   value: active,       color: "#16a34a", bg: dark ? "#14532d" : "#f0fdf4" },
          { label: "Inactive", value: inactive,     color: "#dc2626", bg: dark ? "#450a0a" : "#fef2f2" },
        ].map((s) => (
          <Paper key={s.label} elevation={0} sx={{
            flex: 1, p: 1.5, borderRadius: 2,
            background: s.bg, border: `1px solid ${border}`, textAlign: "center",
          }}>
            <Typography fontSize={22} fontWeight={700} color={s.color} lineHeight={1.1}>{s.value}</Typography>
            <Typography fontSize={11} fontWeight={600} color={s.color} sx={{ opacity: 0.8 }}>{s.label}</Typography>
          </Paper>
        ))}
      </Box>

      {/* ── ADD APARTMENT FORM ── */}
      {adding && (
        <Paper elevation={0} sx={{
          p: 2, mb: 2, borderRadius: 3,
          border: `1px solid #2563eb`,
          background: dark ? "#0f172a" : "#eff6ff",
        }}>
          <Typography fontWeight={600} fontSize={13} color={textPrimary} mb={1.5}>New Apartment</Typography>
          <Box display="flex" gap={1.5} flexWrap="wrap">
            <TextField
              size="small" label="Apartment Name *" value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ flex: "1 1 180px", "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <TextField
              size="small" label="Address / Area" value={address}
              onChange={(e) => setAddress(e.target.value)}
              sx={{ flex: "2 1 240px", "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
            <Box display="flex" gap={1} alignItems="flex-start">
              <Button
                variant="contained" size="small" onClick={addApartment}
                disabled={saving || !name.trim()}
                sx={{
                  textTransform: "none", fontWeight: 600, borderRadius: "8px",
                  background: "#2563eb", "&:hover": { background: "#1d4ed8" },
                }}
              >
                {saving ? <CircularProgress size={14} color="inherit" /> : "Save"}
              </Button>
              <Button size="small" onClick={() => { setAdding(false); setName(""); setAddress("") }}
                sx={{ textTransform: "none", color: textSecondary, borderRadius: "8px" }}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* ── SEARCH ── */}
      <Paper elevation={0} sx={{ px: 1.5, py: 1.2, mb: 2, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
        <TextField
          fullWidth size="small" placeholder="Search apartments…"
          value={search} onChange={(e) => setSearch(e.target.value)}
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

      <Typography fontSize={13} color={textSecondary} mb={1} px={0.5}>
        {filtered.length} apartment{filtered.length !== 1 ? "s" : ""}
      </Typography>

      {/* ── APARTMENT LIST ── */}
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

        {!loading && filtered.map((a, i) => {
          const isExpanded = expanded.has(a.apartment_id)
          const blocks     = blocksMap[a.apartment_id] || []
          const bLoading   = blocksLoading[a.apartment_id]
          const isAddingB  = addingBlock[a.apartment_id]
          const isSavingB  = savingBlock[a.apartment_id]

          return (
            <Box key={a.apartment_id}>

              {/* ── APARTMENT ROW ── */}
              {editId === a.apartment_id ? (
                <Box sx={{
                  px: 2.5, py: 1.8,
                  background: dark ? "#111827" : "#f8faff",
                  display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap",
                }}>
                  <TextField
                    size="small" value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Name"
                    sx={{ flex: "1 1 140px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
                  />
                  <TextField
                    size="small" value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Address"
                    sx={{ flex: "2 1 200px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
                  />
                  <Box display="flex" gap={0.5}>
                    <Tooltip title="Save">
                      <IconButton size="small" onClick={() => saveEditApartment(a.apartment_id)} sx={{ color: "#16a34a" }}>
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
                <Box sx={{
                  px: 2.5, py: 1.8,
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2,
                  "&:hover": { background: bgHov }, transition: "background 0.15s",
                  cursor: "pointer",
                }}
                  onClick={() => toggleExpand(a.apartment_id)}
                >
                  {/* LEFT */}
                  <Box display="flex" alignItems="center" gap={1.5} minWidth={0}>
                    <Box sx={{
                      width: 34, height: 34, borderRadius: "9px", flexShrink: 0,
                      background: a.is_active
                        ? dark ? "#14532d" : "#f0fdf4"
                        : dark ? "#1e293b" : "#f9fafb",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <ApartmentIcon sx={{ fontSize: 17, color: a.is_active ? "#16a34a" : textSecondary }} />
                    </Box>
                    <Box minWidth={0}>
                      <Typography fontWeight={600} fontSize={14} color={textPrimary} noWrap>
                        {a.name}
                      </Typography>
                      {a.address && (
                        <Box display="flex" alignItems="center" gap={0.4}>
                          <LocationOnIcon sx={{ fontSize: 11, color: textSecondary, flexShrink: 0 }} />
                          <Typography fontSize={12} color={textSecondary} noWrap>{a.address}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* RIGHT */}
                  <Box display="flex" alignItems="center" gap={0.5} flexShrink={0} onClick={(e) => e.stopPropagation()}>
                    <Switch
                      size="small" checked={!!a.is_active}
                      onChange={() => toggleApartment(a.apartment_id)}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: "#16a34a" },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { background: "#16a34a" },
                      }}
                    />
                    <Tooltip title="Edit">
                      <IconButton size="small"
                        onClick={() => { setEditId(a.apartment_id); setEditName(a.name); setEditAddress(a.address || "") }}
                        sx={{ color: textSecondary, "&:hover": { color: "#2563eb" } }}>
                        <EditIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => toggleExpand(a.apartment_id)}
                      sx={{ color: textSecondary }}>
                      <ExpandMoreIcon sx={{
                        fontSize: 18,
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }} />
                    </IconButton>
                  </Box>
                </Box>
              )}

              {/* ── BLOCKS PANEL ── */}
              <Collapse in={isExpanded} unmountOnExit>
                <Box sx={{ background: bgBlock, borderTop: `1px solid ${border}`, px: 3, py: 2 }}>

                  {/* Apartment detail banner */}
                  <Box sx={{
                    mb: 2, px: 1.5, py: 1.2, borderRadius: 2,
                    background: dark ? "#0f172a" : "#fff",
                    border: `1px solid ${border}`,
                    display: "flex", alignItems: "center", gap: 1.5,
                  }}>
                    <Box sx={{
                      width: 32, height: 32, borderRadius: "8px", flexShrink: 0,
                      background: a.is_active ? dark ? "#14532d" : "#dcfce7" : dark ? "#1e293b" : "#f3f4f6",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <ApartmentIcon sx={{ fontSize: 16, color: a.is_active ? "#16a34a" : textSecondary }} />
                    </Box>
                    <Box minWidth={0} flex={1}>
                      <Typography fontWeight={700} fontSize={14} color={textPrimary} sx={{ wordBreak: "break-word" }}>
                        {a.name}
                      </Typography>
                      {a.address ? (
                        <Box display="flex" alignItems="flex-start" gap={0.4} mt={0.2}>
                          <LocationOnIcon sx={{ fontSize: 12, color: textSecondary, mt: "2px", flexShrink: 0 }} />
                          <Typography fontSize={12} color={textSecondary} sx={{ wordBreak: "break-word" }}>
                            {a.address}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography fontSize={11} color={textSecondary} sx={{ opacity: 0.6 }}>No address set</Typography>
                      )}
                    </Box>
                    <Chip
                      label={a.is_active ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        flexShrink: 0, fontSize: 11, fontWeight: 600,
                        background: a.is_active ? dark ? "#14532d" : "#dcfce7" : dark ? "#1e293b" : "#f3f4f6",
                        color: a.is_active ? "#16a34a" : textSecondary,
                      }}
                    />
                  </Box>

                  {/* Blocks header */}
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                    <Box display="flex" alignItems="center" gap={0.8}>
                      <GridViewIcon sx={{ fontSize: 15, color: "#7c3aed" }} />
                      <Typography fontSize={12} fontWeight={700} color="#7c3aed" letterSpacing="0.3px">
                        BLOCKS
                      </Typography>
                      <Chip
                        label={blocks.length}
                        size="small"
                        sx={{
                          height: 18, fontSize: 10, fontWeight: 700,
                          background: dark ? "#2e1065" : "#ede9fe", color: "#7c3aed",
                        }}
                      />
                    </Box>
                    <Button
                      size="small" variant="outlined"
                      startIcon={<AddIcon sx={{ fontSize: "13px !important" }} />}
                      onClick={() => setAddingBlock((p) => ({ ...p, [a.apartment_id]: !p[a.apartment_id] }))}
                      sx={{
                        textTransform: "none", fontWeight: 600, fontSize: 12,
                        borderRadius: "7px", borderColor: "#7c3aed", color: "#7c3aed",
                        "&:hover": { borderColor: "#6d28d9", background: dark ? "#2e1065" : "#f5f3ff" },
                      }}
                    >
                      Add Block
                    </Button>
                  </Box>

                  {/* Add block form */}
                  {isAddingB && (
                    <Box display="flex" gap={1} mb={1.5} alignItems="center">
                      <TextField
                        size="small" placeholder="Block name *"
                        value={newBlockName[a.apartment_id] || ""}
                        onChange={(e) => setNewBlockName((p) => ({ ...p, [a.apartment_id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && addBlock(a.apartment_id)}
                        sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
                        autoFocus
                      />
                      <Button
                        variant="contained" size="small"
                        onClick={() => addBlock(a.apartment_id)}
                        disabled={isSavingB || !(newBlockName[a.apartment_id] || "").trim()}
                        sx={{
                          textTransform: "none", fontWeight: 600, borderRadius: "7px",
                          background: "#7c3aed", "&:hover": { background: "#6d28d9" },
                        }}
                      >
                        {isSavingB ? <CircularProgress size={13} color="inherit" /> : "Save"}
                      </Button>
                      <Button size="small"
                        onClick={() => { setAddingBlock((p) => ({ ...p, [a.apartment_id]: false })); setNewBlockName((p) => ({ ...p, [a.apartment_id]: "" })) }}
                        sx={{ textTransform: "none", color: textSecondary, borderRadius: "7px" }}>
                        Cancel
                      </Button>
                    </Box>
                  )}

                  {/* Blocks list */}
                  {bLoading && (
                    <Box py={2} textAlign="center">
                      <CircularProgress size={18} sx={{ color: "#7c3aed" }} />
                    </Box>
                  )}

                  {!bLoading && blocks.length === 0 && (
                    <Typography fontSize={12} color={textSecondary} py={1}>
                      No blocks yet. Add one above.
                    </Typography>
                  )}

                  {!bLoading && blocks.map((b, bi) => (
                    <Box key={b.block_id}>
                      {editBlockId === b.block_id ? (
                        <Box display="flex" gap={1} alignItems="center" py={1}>
                          <TextField
                            size="small" value={editBlockName}
                            onChange={(e) => setEditBlockName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveEditBlock(b.block_id, a.apartment_id)}
                            sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
                            autoFocus
                          />
                          <Tooltip title="Save">
                            <IconButton size="small" onClick={() => saveEditBlock(b.block_id, a.apartment_id)} sx={{ color: "#16a34a" }}>
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton size="small" onClick={() => setEditBlockId(null)} sx={{ color: "#dc2626" }}>
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Box
                          display="flex" alignItems="center" justifyContent="space-between"
                          py={0.8} px={0.5}
                          sx={{ borderRadius: 1, "&:hover": { background: dark ? "#111827" : "#f0ebff" }, transition: "background 0.12s" }}
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <GridViewIcon sx={{ fontSize: 13, color: b.is_active ? "#7c3aed" : textSecondary }} />
                            <Typography fontSize={13} fontWeight={500} color={textPrimary}>
                              {b.block_name}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Switch
                              size="small" checked={!!b.is_active}
                              onChange={() => toggleBlock(b.block_id, a.apartment_id)}
                              sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": { color: "#7c3aed" },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { background: "#7c3aed" },
                              }}
                            />
                            <Tooltip title="Edit">
                              <IconButton size="small"
                                onClick={() => { setEditBlockId(b.block_id); setEditBlockName(b.block_name) }}
                                sx={{ color: textSecondary, "&:hover": { color: "#7c3aed" } }}>
                                <EditIcon sx={{ fontSize: 13 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      )}
                      {bi !== blocks.length - 1 && <Divider sx={{ borderColor: dark ? "#1e1e2e" : "#ede9fe" }} />}
                    </Box>
                  ))}
                </Box>
              </Collapse>

              {i !== filtered.length - 1 && <Divider sx={{ borderColor: border }} />}
            </Box>
          )
        })}
      </Paper>
    </Box>
  )
}
