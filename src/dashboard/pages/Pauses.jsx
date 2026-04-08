import { useEffect, useState } from "react"
import {
  Box, Typography, Paper, Card, CardContent, Chip,
  Skeleton, Divider, TextField, InputAdornment, Alert, Select, MenuItem
} from "@mui/material"
import PauseCircleIcon from "@mui/icons-material/PauseCircle"
import SearchIcon     from "@mui/icons-material/Search"
import EventIcon      from "@mui/icons-material/Event"
import HomeIcon       from "@mui/icons-material/Home"
import ApartmentIcon  from "@mui/icons-material/Apartment"
import GridViewIcon   from "@mui/icons-material/GridView"
import AllInboxIcon   from "@mui/icons-material/AllInbox"
import API, { getToken } from "../../services/api"
import Toast from "../../components/Toast"
import { formatISTDate, getISTDateStr, parseDateOnly } from "../../utils/istDate"

const INDIVIDUAL_VALUE = "__individual__"

function fmtDate(val) {
  if (!val) return "-"
  return formatISTDate(val, { day: "numeric", month: "short", year: "numeric" })
}

function daysRemaining(pause) {
  if (!pause.pause_until) return null
  const end = parseDateOnly(String(pause.pause_until).slice(0, 10))
  const today = parseDateOnly(getISTDateStr(0))
  const diff = Math.ceil((end - today) / 86400000)
  return diff
}

function formatAddress(p) {
  if (p.address_type === "apartment") {
    const parts = []
    if (p.flat_number)    parts.push(`Flat ${p.flat_number}`)
    if (p.block_name)     parts.push(`Block ${p.block_name}`)
    if (p.apartment_name) parts.push(p.apartment_name)
    return parts.join(", ") || "Apartment"
  }
  return p.manual_address || "House"
}

export default function Pauses({ dark }) {
  const [pauses,  setPauses]  = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState("")
  const [apartmentFilter, setApartmentFilter] = useState("")
  const [blockFilter, setBlockFilter] = useState("")
  const [toast,    setToast]    = useState({ open: false, message: "", type: "success" })

  const token = getToken()

  const load = async () => {
    setLoading(true)
    try {
      const res = await API.get(`/pauses?token=${token}`)
      setPauses(res.data)
    } catch {
      setToast({ open: true, message: "Failed to load pauses", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const apartments = [...new Set(pauses.map((p) => p.apartment_name).filter(Boolean))]
  const blocks = apartmentFilter && apartmentFilter !== INDIVIDUAL_VALUE
    ? [...new Set(pauses.filter((p) => p.apartment_name === apartmentFilter).map((p) => p.block_name).filter(Boolean))]
    : []

  const filtered = pauses.filter((p) => {
    const matchesSearch =
      p.phone?.includes(search) ||
      (p.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      formatAddress(p).toLowerCase().includes(search.toLowerCase())
    const matchesApartment =
      !apartmentFilter ||
      (apartmentFilter === INDIVIDUAL_VALUE
        ? p.address_type !== "apartment"
        : p.apartment_name === apartmentFilter)
    const matchesBlock = !blockFilter || p.block_name === blockFilter
    return matchesSearch && matchesApartment && matchesBlock
  })

  const indefinite = pauses.filter(p => !p.pause_until).length
  const scheduled  = pauses.filter(p =>  p.pause_until).length

  const cardBg   = dark ? "#1e293b" : "#ffffff"
  const border   = dark ? "#334155" : "#e5e7eb"
  const subText  = dark ? "#94a3b8" : "#6b7280"
  const pageBg   = dark ? "#0f172a" : "#f8fafc"

  return (
    <Box sx={{ background: pageBg, minHeight: "100vh", p: { xs: 1.5, sm: 2.5 } }}>

      <Paper elevation={0} sx={{ p: 1.25, mb: 2, borderRadius: 4, border: `1px solid ${border}`, background: "linear-gradient(135deg, #ffffff 0%, #f7fbff 60%, #fffaf0 100%)", boxShadow: "0 10px 28px rgba(15,23,42,0.04)" }}>
        <Box display="flex" alignItems="center" gap={0.8} mb={1.1}>
          <EventIcon sx={{ fontSize: 17, color: "#64748b" }} />
          <Typography fontSize={13} fontWeight={800} color="#334155">Filters</Typography>
        </Box>
        <Box display="flex" gap={1.2} flexWrap="wrap">
          <TextField size="small" placeholder="Search by phone or address..." value={search} onChange={e => setSearch(e.target.value)} fullWidth slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: subText }} /></InputAdornment>, sx: { background: "#f8fafc", borderRadius: 3, fontSize: 13 } } }} sx={{ flex: "1 1 220px", "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: border } } }} />
          <Select size="small" displayEmpty value={apartmentFilter} onChange={(e) => { setApartmentFilter(e.target.value); setBlockFilter("") }} sx={{ minWidth: 180, background: "#f8fafc", borderRadius: 3, fontSize: 13 }}>
            <MenuItem value="">All Locations</MenuItem>
            <MenuItem value={INDIVIDUAL_VALUE}>Individual Houses</MenuItem>
            {apartments.map((name) => (<MenuItem key={name} value={name}>{name}</MenuItem>))}
          </Select>
          <Select size="small" displayEmpty value={blockFilter} disabled={!apartmentFilter || apartmentFilter === INDIVIDUAL_VALUE} onChange={(e) => setBlockFilter(e.target.value)} sx={{ minWidth: 160, background: "#f8fafc", borderRadius: 3, fontSize: 13 }} startAdornment={(<InputAdornment position="start"><GridViewIcon fontSize="small" sx={{ color: subText, ml: 0.5 }} /></InputAdornment>)}>
            <MenuItem value="">All Blocks</MenuItem>
            {blocks.map((name) => (<MenuItem key={name} value={name}>{name}</MenuItem>))}
          </Select>
        </Box>
      </Paper>

      {/* Header */}
      <Box mb={3}>
        <Typography variant="h6" fontWeight={700} color={dark ? "#f1f5f9" : "#111827"}>
          Paused Deliveries
        </Typography>
        <Typography fontSize={13} color={subText}>
          Customers who have paused their milk delivery
        </Typography>
      </Box>

      {/* Stats */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        {[
          { label: "Total Paused",     value: pauses.length, icon: <PauseCircleIcon />, color: "#f59e0b" },
          { label: "Auto-Resume",      value: scheduled,     icon: <EventIcon />,       color: "#3b82f6" },
          { label: "Manual Resume",    value: indefinite,    icon: <AllInboxIcon />,    color: "#8b5cf6" },
        ].map(stat => (
          <Card key={stat.label} sx={{ flex: "1 1 140px", background: cardBg, border: `1px solid ${border}`, borderRadius: 2, boxShadow: "none" }}>
            <CardContent sx={{ p: "14px 16px !important" }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Box sx={{ color: stat.color, fontSize: 18, display: "flex" }}>{stat.icon}</Box>
                <Typography fontSize={11} color={subText} fontWeight={600} letterSpacing="0.5px">
                  {stat.label.toUpperCase()}
                </Typography>
              </Box>
              {loading
                ? <Skeleton width={40} height={32} />
                : <Typography fontSize={26} fontWeight={700} color={dark ? "#f1f5f9" : "#111827"}>
                    {stat.value}
                  </Typography>
              }
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* List */}
      {loading ? (
        <Box display="flex" flexDirection="column" gap={1.5}>
          {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={90} sx={{ borderRadius: 2 }} />)}
        </Box>
      ) : filtered.length === 0 ? (
        <Alert
          severity="info"
          icon={<PauseCircleIcon />}
          sx={{ borderRadius: 2, background: dark ? "#1e293b" : undefined }}
        >
          {pauses.length === 0
            ? "No deliveries are currently paused."
            : "No results match your search."
          }
        </Alert>
      ) : (
        <Box display="flex" flexDirection="column" gap={1.5}>
          {filtered.map(pause => {
            const days     = daysRemaining(pause)
            const isManual = !pause.pause_until
            const isApt    = pause.address_type === "apartment"
            const addr     = formatAddress(pause)

            return (
              <Card
                key={pause.pause_id}
                sx={{
                  background: cardBg,
                  border: `1px solid ${border}`,
                  borderLeft: `4px solid ${isManual ? "#8b5cf6" : "#f59e0b"}`,
                  borderRadius: 2,
                  boxShadow: "none",
                }}
              >
                <CardContent sx={{ p: "14px 16px !important" }}>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>

                    {/* Left: customer info */}
                    <Box flex={1} minWidth={0}>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
                        <Typography fontWeight={700} fontSize={14} color={dark ? "#f1f5f9" : "#111827"}>
                          +{pause.phone}
                        </Typography>
                        {pause.customer_name && (
                          <Typography fontSize={12.5} color={subText} fontWeight={600}>
                            {pause.customer_name}
                          </Typography>
                        )}
                        <Chip
                          size="small"
                          label={isManual ? "Manual Resume" : `${days} day${days !== 1 ? "s" : ""} left`}
                          sx={{
                            fontSize: 11,
                            height: 20,
                            background: isManual ? "#ede9fe" : "#fef3c7",
                            color:      isManual ? "#6d28d9" : "#92400e",
                            fontWeight: 600
                          }}
                        />
                      </Box>

                      <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                        {isApt
                          ? <ApartmentIcon sx={{ fontSize: 13, color: subText }} />
                          : <HomeIcon      sx={{ fontSize: 13, color: subText }} />
                        }
                        <Typography fontSize={12} color={subText} noWrap>{addr}</Typography>
                      </Box>

                      <Divider sx={{ borderColor: border, mb: 1 }} />

                      <Box display="flex" gap={2} flexWrap="wrap">
                        <Box>
                          <Typography fontSize={10} color={subText} fontWeight={600} letterSpacing="0.5px">PAUSED FROM</Typography>
                          <Typography fontSize={12} fontWeight={600} color={dark ? "#e2e8f0" : "#374151"}>
                            {fmtDate(pause.pause_from)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography fontSize={10} color={subText} fontWeight={600} letterSpacing="0.5px">RESUMES ON</Typography>
                          <Typography fontSize={12} fontWeight={600} color={dark ? "#e2e8f0" : "#374151"}>
                            {pause.pause_until
                              ? (() => {
                                  const [yr, mo, dy] = pause.pause_until.slice(0,10).split("-").map(Number)
                                  const next = new Date(yr, mo - 1, dy + 1)
                                  return formatISTDate(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`, { day: "numeric", month: "short", year: "numeric" })
                                })()
                              : "Manual"
                            }
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                  </Box>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      )}

      <Toast
        open={toast.open}
        setOpen={(v) => setToast(t => ({ ...t, open: v }))}
        message={toast.message}
        type={toast.type}
      />
    </Box>
  )
}





