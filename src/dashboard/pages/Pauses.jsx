import { useEffect, useState } from "react"
import {
  Box, Typography, Card, CardContent, Chip,
  Skeleton, Divider, TextField, InputAdornment, Alert
} from "@mui/material"
import PauseCircleIcon from "@mui/icons-material/PauseCircle"
import SearchIcon     from "@mui/icons-material/Search"
import EventIcon      from "@mui/icons-material/Event"
import HomeIcon       from "@mui/icons-material/Home"
import ApartmentIcon  from "@mui/icons-material/Apartment"
import AllInboxIcon   from "@mui/icons-material/AllInbox"
import API, { getToken } from "../../services/api"
import Toast from "../../components/Toast"

function fmtDate(val) {
  if (!val) return "—"
  // handles both ISO strings ("2026-04-02T00:00:00.000Z") and plain "YYYY-MM-DD"
  const iso = String(val)
  const [yr, mo, dy] = iso.slice(0, 10).split("-").map(Number)
  return new Date(yr, mo - 1, dy).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function daysRemaining(pause) {
  if (!pause.pause_until) return null
  const end   = new Date(String(pause.pause_until).slice(0, 10) + "T00:00:00")
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const diff  = Math.ceil((end - today) / 86400000)
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

  const filtered = pauses.filter(p =>
    p.phone?.includes(search) ||
    formatAddress(p).toLowerCase().includes(search.toLowerCase())
  )

  const indefinite = pauses.filter(p => !p.pause_until).length
  const scheduled  = pauses.filter(p =>  p.pause_until).length

  const cardBg   = dark ? "#1e293b" : "#ffffff"
  const border   = dark ? "#334155" : "#e5e7eb"
  const subText  = dark ? "#94a3b8" : "#6b7280"
  const pageBg   = dark ? "#0f172a" : "#f8fafc"

  return (
    <Box sx={{ background: pageBg, minHeight: "100vh", p: { xs: 1.5, sm: 2.5 } }}>

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

      {/* Search */}
      <Box mb={2.5}>
        <TextField
          size="small"
          placeholder="Search by phone or address…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          fullWidth
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: subText }} /></InputAdornment>,
              sx: { background: cardBg, borderRadius: 2, fontSize: 13 }
            }
          }}
          sx={{ "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: border } } }}
        />
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
                                  return next.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
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
