import { useEffect, useState } from "react"
import API, { getToken, getRole } from "../../services/api"
import { formatISTDateTime, getISTDate, getISTDateStr, toISTDateStr } from "../../utils/istDate"

import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  TextField,
  Grid,
  Switch,
  MenuItem,
  Select,
  InputAdornment,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  CircularProgress,
} from "@mui/material"

import SearchIcon         from "@mui/icons-material/Search"
import ApartmentIcon      from "@mui/icons-material/Apartment"
import GridViewIcon       from "@mui/icons-material/GridView"
import HomeIcon           from "@mui/icons-material/Home"
import ExpandMoreIcon     from "@mui/icons-material/ExpandMore"
import LocalShippingIcon  from "@mui/icons-material/LocalShipping"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import CalendarTodayIcon  from "@mui/icons-material/CalendarToday"
import AutorenewIcon      from "@mui/icons-material/Autorenew"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import HighlightOffIcon   from "@mui/icons-material/HighlightOff"
import LinkOffIcon        from "@mui/icons-material/LinkOff"

/* ── date helpers ── */
const toDateStr = (d) => toISTDateStr(d)

const getOffset = (days) => {
  return getISTDateStr(days)
}

const TODAY     = getOffset(0)
const YESTERDAY = getOffset(-1)
const TOMORROW  = getOffset(1)

const isSameDay = (orderDate, targetStr) => {
  if (!orderDate) return false
  return String(orderDate).slice(0, 10) === targetStr
}

const toNum = (value) => Number.parseFloat(value || 0) || 0
const INDIVIDUAL_VALUE = "__individual__"
const getOrderDelivery = (order) => {
  const direct = toNum(order?.delivery_charge_amount)
  if (direct > 0) return direct
  return (order?.items || []).reduce((sum, item) => sum + toNum(item.delivery_charge_at_order), 0)
}

/* ─────────────────────────────────────── */

/* ── token expiry helper ── */
const isTokenExpired = () => {
  try {
    const token = getToken()
    if (!token) return false
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.exp && payload.exp * 1000 < Date.now()
  } catch {
    return false
  }
}

export default function Orders({ dark }) {
  const isAdmin = getRole() === "admin"
  const [orders,       setOrders]       = useState([])
  const [filtered,     setFiltered]     = useState([])
  const [generating,   setGenerating]   = useState(false)
  const [showPhone,    setShowPhone]    = useState(true)
  const [tokenExpired, setTokenExpired] = useState(false)
  const [bulkLoading,  setBulkLoading]  = useState(false)

  const fetchOrders = () => {
    API.get(`/orders?token=${getToken()}`).then((res) => {
      setOrders(res.data.orders)
      const uniqueApts = [
        ...new Set(res.data.orders.map((o) => o.apartment_name || o.apartment).filter(Boolean)),
      ]
      setApartments(uniqueApts)
    }).catch((err) => {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setTokenExpired(true)
      }
    })
  }

  const generate = async () => {
    setGenerating(true)
    try {
      await API.post(`/generate-orders?token=${getToken()}`)
      fetchOrders()
    } finally {
      setGenerating(false)
    }
  }

  const [search,     setSearch]     = useState("")
  const [apartment,  setApartment]  = useState("")
  const [block,      setBlock]      = useState("")

  const [apartments, setApartments] = useState([])
  const [blocks,     setBlocks]     = useState([])

  const [expanded,   setExpanded]   = useState({})

  // date filter — default TODAY
  const [dateMode,   setDateMode]   = useState("today")
  const [fromDate,   setFromDate]   = useState(TODAY)
  const [toDate,     setToDate]     = useState(TODAY)

  /* ── LOAD ── */
  useEffect(() => {
    if (isTokenExpired()) { setTokenExpired(true); return }
    API.get(`/settings?token=${getToken()}`).then((r) => {
      setShowPhone(r.data.show_phone_numbers !== false)
    }).catch(() => {})
    fetchOrders()
  }, [])

  /* ── FILTER ── */
  useEffect(() => {
    let data = [...orders]

    // date
    const getWeekRange = () => {
      const now = getISTDate(0)
      const day = now.getDay() // 0=Sun
      const mon = new Date(now); mon.setDate(now.getDate() - ((day + 6) % 7))
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
      return { from: toDateStr(mon), to: toDateStr(sun) }
    }
    const getMonthRange = () => {
      const now = getISTDate(0)
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return { from: toDateStr(from), to: toDateStr(to) }
    }

    let rangeFrom, rangeTo
    if (dateMode === "today")     { rangeFrom = TODAY;     rangeTo = TODAY }
    else if (dateMode === "yesterday") { rangeFrom = YESTERDAY; rangeTo = YESTERDAY }
    else if (dateMode === "tomorrow")  { rangeFrom = TOMORROW;  rangeTo = TOMORROW }
    else if (dateMode === "week")  { ({ from: rangeFrom, to: rangeTo } = getWeekRange()) }
    else if (dateMode === "month") { ({ from: rangeFrom, to: rangeTo } = getMonthRange()) }
    else { rangeFrom = fromDate; rangeTo = toDate }   // custom

    data = data.filter((o) => {
      const d = (o.order_date || "").slice(0, 10)
      return d >= rangeFrom && d <= rangeTo
    })

    // search
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (o) =>
          o.phone.includes(search) ||
          (o.customer_name || "").toLowerCase().includes(q) ||
          (o.address || "").toLowerCase().includes(q)
      )
    }

    // apartment / individual
    if (apartment === INDIVIDUAL_VALUE) {
      data = data.filter((o) => o.address_type !== "apartment")
      setBlocks([])
    } else if (apartment) {
      data = data.filter((o) => (o.apartment_name || o.apartment) === apartment)
      setBlocks([
        ...new Set(
          orders
            .filter((o) => (o.apartment_name || o.apartment) === apartment)
            .map((o) => o.block_name)
            .filter(Boolean)
        ),
      ])
    } else {
      setBlocks([])
    }

    // block
    if (block) {
      data = data.filter((o) => o.block_name === block)
    }

    setFiltered(data)
  }, [search, apartment, block, orders, dateMode, fromDate, toDate])

  /* ── TOGGLE DELIVERY ── */
  const toggleDelivered = async (id) => {
    const res = await API.patch(`/orders/${id}/delivered?token=${getToken()}`)
    setOrders((prev) =>
      prev.map((o) =>
        o.order_id === id
          ? {
              ...o,
              is_delivered: res.data?.is_delivered ?? !o.is_delivered,
              delivered_at: res.data?.delivered_at  || o.delivered_at,
            }
          : o
      )
    )
  }

  /* ── BULK TOGGLE ── */
  const bulkToggle = async (targetDelivered) => {
    const toUpdate = filtered.filter((o) => !!o.is_delivered !== targetDelivered)
    if (toUpdate.length === 0) return
    setBulkLoading(true)
    try {
      const results = await Promise.allSettled(
        toUpdate.map((o) => API.patch(`/orders/${o.order_id}/delivered?token=${getToken()}`))
      )
      const updates = {}
      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          updates[toUpdate[i].order_id] = {
            is_delivered: r.value.data?.is_delivered ?? targetDelivered,
            delivered_at: r.value.data?.delivered_at || null,
          }
        }
      })
      setOrders((prev) =>
        prev.map((o) =>
          updates[o.order_id]
            ? { ...o, ...updates[o.order_id] }
            : o
        )
      )
    } finally {
      setBulkLoading(false)
    }
  }

  /* ── EXPAND ADDRESS ── */
  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  const expandAllRows = () => {
    const next = {}
    filtered.forEach((o) => { next[o.order_id] = true })
    setExpanded(next)
  }
  const collapseAllRows = () => {
    const next = {}
    filtered.forEach((o) => { next[o.order_id] = false })
    setExpanded(next)
  }

  /* ── STATS ── */
  const delivered = filtered.filter((o) => o.is_delivered).length
  const pending   = filtered.length - delivered

  /* ── PRODUCT SUMMARY — aggregate qty per product across filtered orders ── */
  const productSummary = (() => {
    const map = {}
    for (const o of filtered) {
      for (const it of (o.items || [])) {
        if (!map[it.product_name]) {
          map[it.product_name] = { name: it.product_name, unit: it.unit, sub: 0, adhoc: 0 }
        }
        if (it.order_type === "adhoc") map[it.product_name].adhoc += it.quantity
        else                           map[it.product_name].sub   += it.quantity
      }
    }
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name))
  })()

  /* ── LABEL for count row ── */
  const dateLabel =
    dateMode === "today"     ? "Today"      :
    dateMode === "yesterday" ? "Yesterday"  :
    dateMode === "tomorrow"  ? "Tomorrow"   :
    dateMode === "week"      ? "This Week"  :
    dateMode === "month"     ? "This Month" :
    `${fromDate} → ${toDate}`

  /* ═══════════════════ RENDER ═══════════════════ */
  if (tokenExpired) {
    return (
      <Box sx={{ maxWidth: 780, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4, borderRadius: 3, border: "1px solid #fca5a5",
            background: "#fff7f7", textAlign: "center",
          }}
        >
          <LinkOffIcon sx={{ fontSize: 48, color: "#ef4444", mb: 1.5 }} />
          <Typography fontWeight={700} fontSize={17} mb={1}>
            Link Expired
          </Typography>
          <Typography color="text.secondary" fontSize={14} lineHeight={1.6}>
            Your access link has expired or is no longer valid.
            <br />
            Please ask your vendor to regenerate and share a new link.
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 780, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>

      {/* ══ PAGE HEADER ══ */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography fontWeight={700} fontSize={17}>Orders</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            size="small"
            onClick={generate}
            disabled={generating}
            startIcon={
              <AutorenewIcon
                fontSize="small"
                sx={{
                  animation: generating ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
                }}
              />
            }
            sx={{
              textTransform: "none", fontWeight: 600, fontSize: 13, borderRadius: "8px",
              background: "#2563eb", "&:hover": { background: "#1d4ed8" },
              "&.Mui-disabled": { background: "#93c5fd", color: "white" },
            }}
          >
            {generating ? "Generating…" : "Generate Orders"}
          </Button>
        )}
      </Box>

      {/* ══ DATE FILTER ══ */}
      <Paper
        elevation={0}
        sx={{ p: 1.5, mb: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}
      >
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">

          <Box display="flex" alignItems="center" gap={0.6}>
            <CalendarTodayIcon sx={{ fontSize: 16, color: "text.disabled" }} />
            <Typography fontSize={12} fontWeight={600} color="text.secondary">
              Date
            </Typography>
          </Box>

          <ToggleButtonGroup
            size="small"
            exclusive
            value={dateMode}
            onChange={(_, val) => { if (val) setDateMode(val) }}
            sx={{
              flexWrap: "wrap",
              "& .MuiToggleButton-root": {
                border: "1px solid #e5e7eb",
                color: "text.secondary",
              },
              "& .MuiToggleButton-root.Mui-selected": {
                background: "#2563eb",
                color: "white",
                borderColor: "#2563eb",
              },
            }}
          >
            {[
              { value: "yesterday", label: "Yesterday" },
              { value: "today",     label: "Today"     },
              { value: "tomorrow",  label: "Tomorrow"  },
              { value: "week",      label: "This Week" },
              { value: "month",     label: "This Month"},
              { value: "custom",    label: "Custom"    },
            ].map(({ value, label }) => (
              <ToggleButton
                key={value}
                value={value}
                sx={{
                  px: 1.6,
                  py: 0.45,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "none",
                  "&.Mui-selected": {
                    background: "#2563eb",
                    color: "white",
                    "&:hover": { background: "#1d4ed8" },
                  },
                }}
              >
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {dateMode === "custom" && (
            <Box display="flex" alignItems="center" gap={0.8} flexWrap="wrap">
              <TextField
                type="date"
                size="small"
                label="From"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 145, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
              />
              <Typography fontSize={13} color="text.disabled">→</Typography>
              <TextField
                type="date"
                size="small"
                label="To"
                value={toDate}
                inputProps={{ min: fromDate }}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 145, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
              />
            </Box>
          )}

        </Box>
      </Paper>

      {/* ══ STATS ══ */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              background: "linear-gradient(135deg,#16a34a,#22c55e)",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <LocalShippingIcon sx={{ fontSize: 30, opacity: 0.85 }} />
            <Box>
              <Typography fontSize={12} fontWeight={500} sx={{ opacity: 0.9 }}>
                Delivered
              </Typography>
              <Typography variant="h4" fontWeight={700} lineHeight={1.1}>
                {delivered}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              background: "linear-gradient(135deg,#f97316,#fb923c)",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <HourglassEmptyIcon sx={{ fontSize: 30, opacity: 0.85 }} />
            <Box>
              <Typography fontSize={12} fontWeight={500} sx={{ opacity: 0.9 }}>
                Pending
              </Typography>
              <Typography variant="h4" fontWeight={700} lineHeight={1.1}>
                {pending}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ══ PRODUCT SUMMARY TILES ══ */}
      {productSummary.length > 0 && (
        <Paper
          elevation={0}
          sx={{ p: 1.5, mb: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}
        >
          <Typography fontSize={11} fontWeight={700} letterSpacing="0.6px"
            color="text.secondary" mb={1}>
            PRODUCT TOTALS — {dateLabel.toUpperCase()}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {productSummary.map((p) => (
              <Box
                key={p.name}
                sx={{
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  minWidth: 120,
                  flex: "1 1 120px",
                  maxWidth: 200,
                }}
              >
                {/* Product name header */}
                <Box sx={{ px: 1.2, py: 0.7, background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                  <Typography fontSize={12.5} fontWeight={700} color="text.primary" noWrap>
                    {p.name}
                  </Typography>
                  {p.unit && (
                    <Typography fontSize={10.5} color="text.secondary">{p.unit}</Typography>
                  )}
                </Box>

                {/* Dailyscription row */}
                {p.sub > 0 && (
                  <Box
                    display="flex" justifyContent="space-between" alignItems="center"
                    sx={{ px: 1.2, py: 0.5, background: "#eff6ff" }}
                  >
                    <Typography fontSize={11} fontWeight={600} color="#1d4ed8">
                      📦 Daily
                    </Typography>
                    <Typography fontSize={14} fontWeight={800} color="#1d4ed8">
                      {p.sub}
                    </Typography>
                  </Box>
                )}

                {/* Tomorrow row */}
                {p.adhoc > 0 && (
                  <Box
                    display="flex" justifyContent="space-between" alignItems="center"
                    sx={{ px: 1.2, py: 0.5, background: "#fefce8" }}
                  >
                    <Typography fontSize={11} fontWeight={600} color="#a16207">
                      ⚡ Tomorrow
                    </Typography>
                    <Typography fontSize={14} fontWeight={800} color="#a16207">
                      {p.adhoc}
                    </Typography>
                  </Box>
                )}

                {/* Total if both exist */}
                {p.sub > 0 && p.adhoc > 0 && (
                  <Box
                    display="flex" justifyContent="space-between" alignItems="center"
                    sx={{ px: 1.2, py: 0.5, background: "#f1f5f9", borderTop: "1px solid #e5e7eb" }}
                  >
                    <Typography fontSize={11} fontWeight={600} color="text.secondary">
                      Total
                    </Typography>
                    <Typography fontSize={14} fontWeight={800} color="text.primary">
                      {p.sub + p.adhoc}
                    </Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* ══ COMPACT FILTER ROW ══ */}
      <Paper
        elevation={0}
        sx={{ px: 1.5, py: 1.2, mb: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}
      >
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">

          <TextField
            size="small"
            placeholder="Phone or address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: "1 1 150px",
              minWidth: 130,
              "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 },
            }}
          />

          <Select
            size="small"
            value={apartment}
            displayEmpty
            onChange={(e) => { setApartment(e.target.value); setBlock("") }}
            startAdornment={
              <InputAdornment position="start">
                {apartment === INDIVIDUAL_VALUE ? <HomeIcon fontSize="small" sx={{ color: "text.disabled", ml: 0.5 }} /> : <ApartmentIcon fontSize="small" sx={{ color: "text.disabled", ml: 0.5 }} />}
              </InputAdornment>
            }
            sx={{ flex: "1 1 120px", minWidth: 110, borderRadius: 2, fontSize: 13 }}
          >
            <MenuItem value="">All Locations</MenuItem>
            <MenuItem value={INDIVIDUAL_VALUE}>Individual Houses</MenuItem>
            {apartments.map((a) => (
              <MenuItem key={a} value={a} sx={{ fontSize: 13 }}>{a}</MenuItem>
            ))}
          </Select>

          <Select
            size="small"
            value={block}
            displayEmpty
            disabled={!apartment || apartment === INDIVIDUAL_VALUE}
            onChange={(e) => setBlock(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <GridViewIcon fontSize="small" sx={{ color: "text.disabled", ml: 0.5 }} />
              </InputAdornment>
            }
            sx={{ flex: "1 1 110px", minWidth: 100, borderRadius: 2, fontSize: 13 }}
          >
            <MenuItem value="">All Blocks</MenuItem>
            {blocks.map((b) => (
              <MenuItem key={b} value={b} sx={{ fontSize: 13 }}>{b}</MenuItem>
            ))}
          </Select>

        </Box>
      </Paper>

      {/* ══ COUNT + BULK ACTIONS ROW ══ */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1} px={0.5} flexWrap="wrap" gap={1}>
        <Typography fontSize={13} color="text.secondary">
          {filtered.length} order{filtered.length !== 1 ? "s" : ""} —{" "}
          <Box component="span" fontWeight={700} color="text.primary">
            {dateLabel}
          </Box>
        </Typography>

        {filtered.length > 0 && (
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              size="small"
              variant="outlined"
              onClick={expandAllRows}
              sx={{
                textTransform: "none", fontWeight: 600, fontSize: 12,
                borderRadius: "8px", borderColor: "#cbd5e1", color: "#334155",
                "&:hover": { borderColor: "#94a3b8", background: "#f8fafc" },
              }}
            >
              Expand All
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={collapseAllRows}
              sx={{
                textTransform: "none", fontWeight: 600, fontSize: 12,
                borderRadius: "8px", borderColor: "#cbd5e1", color: "#334155",
                "&:hover": { borderColor: "#94a3b8", background: "#f8fafc" },
              }}
            >
              Collapse All
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={bulkLoading}
              onClick={() => bulkToggle(true)}
              startIcon={bulkLoading ? <CircularProgress size={13} /> : <CheckCircleOutlineIcon fontSize="small" />}
              sx={{
                textTransform: "none", fontWeight: 600, fontSize: 12,
                borderRadius: "8px", borderColor: "#22c55e", color: "#16a34a",
                "&:hover": { borderColor: "#16a34a", background: "#f0fdf4" },
              }}
            >
              All Delivered
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={bulkLoading}
              onClick={() => bulkToggle(false)}
              startIcon={bulkLoading ? <CircularProgress size={13} /> : <HighlightOffIcon fontSize="small" />}
              sx={{
                textTransform: "none", fontWeight: 600, fontSize: 12,
                borderRadius: "8px", borderColor: "#f97316", color: "#ea580c",
                "&:hover": { borderColor: "#ea580c", background: "#fff7ed" },
              }}
            >
              All Pending
            </Button>
          </Box>
        )}
      </Box>

      {/* ══ ORDER LIST ══ */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}
      >
        {filtered.length === 0 && (
          <Box py={7} textAlign="center">
            <CalendarTodayIcon sx={{ fontSize: 36, color: "#d1d5db", mb: 1, display: "block", mx: "auto" }} />
            <Typography color="text.secondary" fontSize={14}>
              No orders for {dateLabel}.
            </Typography>
          </Box>
        )}

        {filtered.map((o, i) => {
          const isLong     = (o.address || "").length > 45
          const isExpanded = !!expanded[o.order_id]
          const items      = o.items || []
          const hasItems   = items.length > 0
          const canToggle  = hasItems || isLong
          const orderDelivery = getOrderDelivery(o)
          const orderTotal = items.reduce((sum, it) =>
            sum + (it.quantity * parseFloat(it.price_at_order)), 0) + orderDelivery

          return (
            <Box key={o.order_id}>
              <Box
                sx={{
                  px: 2.5,
                  py: 2,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 2,
                  "&:hover": { background: "#f9fafb" },
                  transition: "background 0.15s",
                }}
              >
                {/* LEFT */}
                <Box flex={1} minWidth={0}>
                  <Typography fontWeight={700} fontSize={15} mb={0.4} color={showPhone ? "text.primary" : "text.disabled"}
                    sx={{ letterSpacing: showPhone ? "normal" : "0.1em" }}>
                    {showPhone ? o.phone : `••••••• ${String(o.phone).slice(-3)}`}
                  </Typography>

                  {o.address && (
                    <Box
                      display="flex"
                      alignItems="flex-start"
                      gap={0.3}
                      sx={{ cursor: canToggle ? "pointer" : "default" }}
                      onClick={() => canToggle && toggleExpand(o.order_id)}
                    >
                      <Typography
                        fontSize={12.5}
                        color="text.secondary"
                        sx={{
                          flex: 1,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: isExpanded ? "unset" : 2,
                          wordBreak: "break-word",
                        }}
                      >
                        {(() => {
                          const addr = o.address || ""
                          const match = addr.match(/^(Flat\s+\S+)(,?\s*)(.*)/i)
                          if (match) return (
                            <>
                              <Box component="span" fontWeight={700} color="text.primary">{match[1]}</Box>
                              {match[2]}{match[3]}
                            </>
                          )
                          return addr
                        })()}
                      </Typography>

                      {canToggle && (
                        <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
                          <IconButton
                            size="small"
                            sx={{ mt: "-2px", flexShrink: 0 }}
                            onClick={(e) => { e.stopPropagation(); toggleExpand(o.order_id) }}
                          >
                            <ExpandMoreIcon
                              fontSize="small"
                              sx={{
                                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s",
                                color: "text.disabled",
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  )}

                  {/* ── ORDER ITEMS ── */}
                  {hasItems && !isExpanded && (
                    <Box mt={0.9} display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                      <Typography fontSize={12} color="text.secondary">
                        {items.length} product{items.length > 1 ? "s" : ""} - Total Rs.{orderTotal.toFixed(0)}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => toggleExpand(o.order_id)}
                        sx={{
                          minWidth: 0,
                          px: 1,
                          py: 0.25,
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: 11.5,
                          color: "#2563eb",
                        }}
                      >
                        View Products
                      </Button>
                    </Box>
                  )}

                  {hasItems && isExpanded && (
                    <Box mt={1} display="flex" flexDirection="column" gap={0.5}>
                      {items.map((it) => (
                        <Box
                          key={it.item_id}
                          display="flex"
                          alignItems="center"
                          gap={0.8}
                          sx={{
                            px: 1, py: 0.4, borderRadius: "6px",
                            background: it.order_type === "adhoc" ? "#fef9c3" : "#f0f9ff",
                            border: `1px solid ${it.order_type === "adhoc" ? "#fde047" : "#bae6fd"}`,
                          }}
                        >
                          <Typography fontSize={12} fontWeight={700} color="text.primary" sx={{ flex: 1 }}>
                            {it.product_name}
                            <Box component="span" fontWeight={400} color="text.secondary" ml={0.4}>
                              {it.unit}
                            </Box>
                          </Typography>
                          <Typography fontSize={12} fontWeight={600} color="text.secondary">
                            ×{it.quantity}
                          </Typography>
                          <Typography fontSize={12} fontWeight={700} color="#1d4ed8">
                            ₹{(it.quantity * parseFloat(it.price_at_order)).toFixed(0)}
                            {orderDelivery > 0 && it === items[0] && (
                              <Box component="span" fontWeight={400} color="text.secondary" fontSize={10.5}>
                                {" "}+₹{orderDelivery.toFixed(0)} del
                              </Box>
                            )}
                          </Typography>
                          <Chip
                            label={it.order_type === "adhoc" ? "Tomorrow" : "Daily"}
                            size="small"
                            sx={{
                              height: 16, fontSize: 10, fontWeight: 700,
                              background: it.order_type === "adhoc" ? "#fbbf24" : "#38bdf8",
                              color: "white", px: 0.2,
                            }}
                          />
                        </Box>
                      ))}
                      {items.length > 1 && (
                        <Typography fontSize={11.5} fontWeight={700} color="#1d4ed8" textAlign="right" mt={0.2}>
                          Total: ₹{orderTotal.toFixed(0)}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>

                {/* RIGHT */}
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-end"
                  gap={0.8}
                  flexShrink={0}
                >
                  {hasItems && (
                    <Button
                      size="small"
                      onClick={() => toggleExpand(o.order_id)}
                      endIcon={
                        <ExpandMoreIcon
                          fontSize="small"
                          sx={{
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s",
                          }}
                        />
                      }
                      sx={{
                        minWidth: 0,
                        px: 1,
                        py: 0.15,
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: 11.5,
                        color: "#475569",
                      }}
                    >
                      {isExpanded ? "Collapse" : "Expand"}
                    </Button>
                  )}

                  {!hasItems && (
                    <Chip
                      label={`Qty: ${o.quantity}`}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 600, fontSize: 12 }}
                    />
                  )}

                  <Box display="flex" alignItems="center" gap={0.8}>
                    <Switch
                      size="small"
                      checked={!!o.is_delivered}
                      onChange={() => toggleDelivered(o.order_id)}
                    />
                    <Chip
                      label={o.is_delivered ? "Delivered" : "Pending"}
                      size="small"
                      sx={{
                        background: o.is_delivered ? "#22c55e" : "#fb923c",
                        color: "white",
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                  </Box>

                  {o.is_delivered && o.delivered_at && (
                    <Typography variant="caption" color="text.disabled" fontSize={10.5}>
                      {formatISTDateTime(o.delivered_at)}
                    </Typography>
                  )}
                </Box>
              </Box>

              {i !== filtered.length - 1 && <Divider />}
            </Box>
          )
        })}
      </Paper>
    </Box>
  )
}



