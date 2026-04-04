import React, { useEffect, useMemo, useState } from "react"
import API, { getRole, getToken } from "../../services/api"
import { formatISTDate, formatISTDateTime, getISTDate, toISTDateStr } from "../../utils/istDate"
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import ApartmentIcon from "@mui/icons-material/Apartment"
import GridViewIcon from "@mui/icons-material/GridView"
import HomeIcon from "@mui/icons-material/Home"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import AutorenewIcon from "@mui/icons-material/Autorenew"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import HighlightOffIcon from "@mui/icons-material/HighlightOff"
import LinkOffIcon from "@mui/icons-material/LinkOff"

const INDIVIDUAL_VALUE = "__individual__"

const toDateStr = (d) => toISTDateStr(d)
const getOffset = (days) => toISTDateStr(getISTDate(days))

const TODAY = getOffset(0)
const YESTERDAY = getOffset(-1)
const TOMORROW = getOffset(1)

const getWeekRange = () => {
  const now = getISTDate(0)
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { from: toDateStr(monday), to: toDateStr(sunday) }
}

const getMonthRange = () => {
  const now = getISTDate(0)
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { from: toDateStr(from), to: toDateStr(to) }
}

const toNum = (value) => Number.parseFloat(value || 0) || 0

const getOrderDelivery = (order) => {
  const direct = toNum(order?.delivery_charge_amount)
  if (direct > 0) return direct
  return (order?.items || []).reduce((sum, item) => sum + toNum(item.delivery_charge_at_order), 0)
}

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

function StatCard({ label, value, color, icon }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        background: color,
        color: "white",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      {icon}
      <Box>
        <Typography fontSize={12} fontWeight={600} sx={{ opacity: 0.92 }}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={800} lineHeight={1.1}>
          {value}
        </Typography>
      </Box>
    </Paper>
  )
}

function ProductSummaryCard({ item }) {
  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: "1px solid #e5e7eb",
        overflow: "hidden",
        minWidth: 145,
        flex: "1 1 145px",
        maxWidth: 220,
      }}
    >
      <Box sx={{ px: 1.2, py: 0.85, background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
        <Typography fontSize={12.5} fontWeight={700} color="text.primary" noWrap>
          {item.name}
        </Typography>
        {item.unit ? <Typography fontSize={10.5} color="text.secondary">{item.unit}</Typography> : null}
      </Box>
      {item.sub > 0 ? (
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1.2, py: 0.55, background: "#eff6ff" }}>
          <Typography fontSize={11} fontWeight={700} color="#1d4ed8">Daily</Typography>
          <Typography fontSize={14} fontWeight={800} color="#1d4ed8">{item.sub}</Typography>
        </Box>
      ) : null}
      {item.adhoc > 0 ? (
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1.2, py: 0.55, background: "#fefce8" }}>
          <Typography fontSize={11} fontWeight={700} color="#a16207">Tomorrow</Typography>
          <Typography fontSize={14} fontWeight={800} color="#a16207">{item.adhoc}</Typography>
        </Box>
      ) : null}
      {item.sub > 0 && item.adhoc > 0 ? (
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1.2, py: 0.55, background: "#f8fafc", borderTop: "1px solid #e5e7eb" }}>
          <Typography fontSize={11} fontWeight={700} color="text.secondary">Total</Typography>
          <Typography fontSize={14} fontWeight={800} color="text.primary">{item.sub + item.adhoc}</Typography>
        </Box>
      ) : null}
    </Box>
  )
}

export default function Orders({ dark }) {
  const isAdmin = getRole() === "admin"
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState("")
  const [apartment, setApartment] = useState("")
  const [block, setBlock] = useState("")
  const [apartments, setApartments] = useState([])
  const [blocks, setBlocks] = useState([])
  const [expanded, setExpanded] = useState({})
  const [dateMode, setDateMode] = useState("today")
  const [fromDate, setFromDate] = useState(TODAY)
  const [toDate, setToDate] = useState(TODAY)
  const [generating, setGenerating] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [showPhone, setShowPhone] = useState(true)
  const [tokenExpired, setTokenExpired] = useState(false)

  const fetchOrders = async () => {
    const res = await API.get(`/orders?token=${getToken()}`)
    const nextOrders = res.data.orders || []
    setOrders(nextOrders)
    setApartments([
      ...new Set(nextOrders.map((o) => o.apartment_name || o.apartment).filter(Boolean)),
    ])
  }

  useEffect(() => {
    if (isTokenExpired()) {
      setTokenExpired(true)
      return
    }
    API.get(`/settings?token=${getToken()}`)
      .then((r) => setShowPhone(r.data.show_phone_numbers !== false))
      .catch(() => {})
    fetchOrders().catch((err) => {
      if (err.response?.status === 401 || err.response?.status === 403) setTokenExpired(true)
    })
  }, [])

  const effectiveRange = useMemo(() => {
    if (dateMode === "today") return { from: TODAY, to: TODAY, label: "Today" }
    if (dateMode === "yesterday") return { from: YESTERDAY, to: YESTERDAY, label: "Yesterday" }
    if (dateMode === "tomorrow") return { from: TOMORROW, to: TOMORROW, label: "Tomorrow" }
    if (dateMode === "week") {
      const range = getWeekRange()
      return { ...range, label: "This Week" }
    }
    if (dateMode === "month") {
      const range = getMonthRange()
      return { ...range, label: "This Month" }
    }
    return { from: fromDate, to: toDate, label: `${fromDate} to ${toDate}` }
  }, [dateMode, fromDate, toDate])

  const filtered = useMemo(() => {
    let data = [...orders]
    data = data.filter((o) => {
      const d = String(o.order_date || "").slice(0, 10)
      return d >= effectiveRange.from && d <= effectiveRange.to
    })

    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter((o) => [o.phone, o.customer_name, o.address].some((v) => String(v || "").toLowerCase().includes(q)))
    }

    if (apartment === INDIVIDUAL_VALUE) {
      data = data.filter((o) => o.address_type !== "apartment")
    } else if (apartment) {
      data = data.filter((o) => (o.apartment_name || o.apartment) === apartment)
    }

    if (block) {
      data = data.filter((o) => o.block_name === block)
    }

    return data
  }, [orders, effectiveRange, search, apartment, block])

  useEffect(() => {
    if (!apartment || apartment === INDIVIDUAL_VALUE) {
      setBlocks([])
      return
    }
    setBlocks([
      ...new Set(
        orders
          .filter((o) => (o.apartment_name || o.apartment) === apartment)
          .map((o) => o.block_name)
          .filter(Boolean)
      ),
    ])
  }, [apartment, orders])

  const delivered = filtered.filter((o) => o.is_delivered).length
  const pending = filtered.length - delivered

  const productSummary = useMemo(() => {
    const map = {}
    filtered.forEach((order) => {
      ;(order.items || []).forEach((item) => {
        if (!map[item.product_name]) map[item.product_name] = { name: item.product_name, unit: item.unit, sub: 0, adhoc: 0 }
        if (item.order_type === "adhoc") map[item.product_name].adhoc += toNum(item.quantity)
        else map[item.product_name].sub += toNum(item.quantity)
      })
    })
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name))
  }, [filtered])

  const toggleDelivered = async (id) => {
    const res = await API.patch(`/orders/${id}/delivered?token=${getToken()}`)
    setOrders((prev) => prev.map((o) => o.order_id === id ? {
      ...o,
      is_delivered: res.data?.is_delivered ?? !o.is_delivered,
      delivered_at: res.data?.delivered_at || o.delivered_at,
    } : o))
  }

  const bulkToggle = async (targetDelivered) => {
    const toUpdate = filtered.filter((o) => !!o.is_delivered !== targetDelivered)
    if (!toUpdate.length) return
    setBulkLoading(true)
    try {
      const results = await Promise.allSettled(toUpdate.map((o) => API.patch(`/orders/${o.order_id}/delivered?token=${getToken()}`)))
      const updates = {}
      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          updates[toUpdate[i].order_id] = {
            is_delivered: r.value.data?.is_delivered ?? targetDelivered,
            delivered_at: r.value.data?.delivered_at || null,
          }
        }
      })
      setOrders((prev) => prev.map((o) => updates[o.order_id] ? { ...o, ...updates[o.order_id] } : o))
    } finally {
      setBulkLoading(false)
    }
  }

  const generate = async () => {
    setGenerating(true)
    try {
      await API.post(`/generate-orders?token=${getToken()}`)
      await fetchOrders()
    } finally {
      setGenerating(false)
    }
  }

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
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

  if (tokenExpired) {
    return (
      <Box sx={{ maxWidth: 820, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #fca5a5", background: "#fff7f7", textAlign: "center" }}>
          <LinkOffIcon sx={{ fontSize: 48, color: "#ef4444", mb: 1.5 }} />
          <Typography fontWeight={700} fontSize={17} mb={1}>Link Expired</Typography>
          <Typography color="text.secondary" fontSize={14} lineHeight={1.6}>Your access link has expired or is no longer valid.<br />Please ask your vendor to regenerate and share a new link.</Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1080, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>
      <Box display="flex" alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" mb={2} gap={1.5} flexWrap="wrap">
        <Box>
          <Typography fontWeight={800} fontSize={20}>Orders</Typography>
          <Typography fontSize={12.5} color="text.secondary">Daily and tomorrow orders in one mobile-friendly list.</Typography>
        </Box>
        {isAdmin ? (
          <Button
            variant="contained"
            size="small"
            onClick={generate}
            disabled={generating}
            startIcon={<AutorenewIcon fontSize="small" sx={{ animation: generating ? "spin 1s linear infinite" : "none", "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } } }} />}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, background: "#2563eb" }}
          >
            {generating ? "Generating..." : "Generate Orders"}
          </Button>
        ) : null}
      </Box>

      <Paper elevation={0} sx={{ p: 1.5, mb: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
        <Stack spacing={1.2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ xs: "stretch", md: "center" }}>
            <Box display="flex" alignItems="center" gap={0.6}>
              <CalendarTodayIcon sx={{ fontSize: 16, color: "text.disabled" }} />
              <Typography fontSize={12} fontWeight={700} color="text.secondary">Date</Typography>
            </Box>
            <ToggleButtonGroup size="small" exclusive value={dateMode} onChange={(_, val) => val && setDateMode(val)} sx={{ flexWrap: "wrap" }}>
              <ToggleButton value="yesterday">Yesterday</ToggleButton>
              <ToggleButton value="today">Today</ToggleButton>
              <ToggleButton value="tomorrow">Tomorrow</ToggleButton>
              <ToggleButton value="week">This Week</ToggleButton>
              <ToggleButton value="month">This Month</ToggleButton>
              <ToggleButton value="custom">Custom</ToggleButton>
            </ToggleButtonGroup>
            {dateMode === "custom" ? (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <TextField type="date" size="small" label="From" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 155 }} />
                <TextField type="date" size="small" label="To" value={toDate} onChange={(e) => setToDate(e.target.value)} inputProps={{ min: fromDate }} InputLabelProps={{ shrink: true }} sx={{ width: 155 }} />
              </Stack>
            ) : null}
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.2}>
            <TextField
              size="small"
              placeholder="Search name, phone or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: "text.disabled" }} /></InputAdornment> }}
              sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
            />
            <Select
              size="small"
              value={apartment}
              displayEmpty
              onChange={(e) => { setApartment(e.target.value); setBlock("") }}
              startAdornment={<InputAdornment position="start">{apartment === INDIVIDUAL_VALUE ? <HomeIcon fontSize="small" sx={{ color: "text.disabled", ml: 0.5 }} /> : <ApartmentIcon fontSize="small" sx={{ color: "text.disabled", ml: 0.5 }} />}</InputAdornment>}
              sx={{ minWidth: { xs: "100%", md: 210 }, borderRadius: 2, fontSize: 13 }}
            >
              <MenuItem value="">All Locations</MenuItem>
              <MenuItem value={INDIVIDUAL_VALUE}>Individual Houses</MenuItem>
              {apartments.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
            </Select>
            <Select
              size="small"
              value={block}
              displayEmpty
              disabled={!apartment || apartment === INDIVIDUAL_VALUE}
              onChange={(e) => setBlock(e.target.value)}
              startAdornment={<InputAdornment position="start"><GridViewIcon fontSize="small" sx={{ color: "text.disabled", ml: 0.5 }} /></InputAdornment>}
              sx={{ minWidth: { xs: "100%", md: 170 }, borderRadius: 2, fontSize: 13 }}
            >
              <MenuItem value="">All Blocks</MenuItem>
              {blocks.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
            </Select>
          </Stack>
        </Stack>
      </Paper>

      <Grid container spacing={1.5} mb={2}>
        <Grid item xs={6} md={3}>
          <StatCard label="Delivered" value={delivered} color="linear-gradient(135deg,#16a34a,#22c55e)" icon={<LocalShippingIcon sx={{ fontSize: 30, opacity: 0.88 }} />} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Pending" value={pending} color="linear-gradient(135deg,#f97316,#fb923c)" icon={<HourglassEmptyIcon sx={{ fontSize: 30, opacity: 0.88 }} />} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, border: "1px solid #e5e7eb", height: "100%" }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }}>
              <Typography fontSize={12} fontWeight={700} color="text.secondary">{filtered.length} order{filtered.length !== 1 ? "s" : ""} - {effectiveRange.label}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button size="small" variant="outlined" onClick={expandAllRows} sx={{ textTransform: "none", borderRadius: 2 }}>Expand All</Button>
                <Button size="small" variant="outlined" onClick={collapseAllRows} sx={{ textTransform: "none", borderRadius: 2 }}>Collapse All</Button>
                <Button size="small" variant="outlined" disabled={bulkLoading} onClick={() => bulkToggle(true)} startIcon={bulkLoading ? <CircularProgress size={13} /> : <CheckCircleOutlineIcon fontSize="small" />} sx={{ textTransform: "none", borderRadius: 2, color: "#16a34a", borderColor: "#22c55e" }}>All Delivered</Button>
                <Button size="small" variant="outlined" disabled={bulkLoading} onClick={() => bulkToggle(false)} startIcon={bulkLoading ? <CircularProgress size={13} /> : <HighlightOffIcon fontSize="small" />} sx={{ textTransform: "none", borderRadius: 2, color: "#ea580c", borderColor: "#f97316" }}>All Pending</Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {productSummary.length > 0 ? (
        <Paper elevation={0} sx={{ p: 1.5, mb: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
          <Typography fontSize={11} fontWeight={800} letterSpacing="0.6px" color="text.secondary" mb={1}>PRODUCT TOTALS - {effectiveRange.label.toUpperCase()}</Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {productSummary.map((item) => <ProductSummaryCard key={item.name} item={item} />)}
          </Box>
        </Paper>
      ) : null}

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <Box py={7} textAlign="center">
            <CalendarTodayIcon sx={{ fontSize: 36, color: "#d1d5db", mb: 1, display: "block", mx: "auto" }} />
            <Typography color="text.secondary" fontSize={14}>No orders for {effectiveRange.label}.</Typography>
          </Box>
        ) : filtered.map((order, index) => {
          const items = order.items || []
          const isExpanded = !!expanded[order.order_id]
          const orderDelivery = getOrderDelivery(order)
          const orderTotal = items.reduce((sum, item) => sum + (toNum(item.quantity) * toNum(item.price_at_order)), 0) + orderDelivery
          const canToggle = items.length > 0 || String(order.address || "").length > 60

          return (
            <Box key={order.order_id}>
              <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 1.75, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5, flexDirection: { xs: "column", md: "row" }, "&:hover": { background: dark ? "#111827" : "#f9fafb" } }}>
                <Box flex={1} minWidth={0}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mb={0.4}>
                    <Typography fontWeight={800} fontSize={15}>{order.customer_name || "Customer"}</Typography>
                    <Typography fontSize={13} color="text.secondary">{showPhone ? order.phone : `******* ${String(order.phone).slice(-3)}`}</Typography>
                  </Stack>

                  {order.address ? (
                    <Box display="flex" alignItems="flex-start" gap={0.3} onClick={() => canToggle && toggleExpand(order.order_id)} sx={{ cursor: canToggle ? "pointer" : "default" }}>
                      <Typography fontSize={12.5} color="text.secondary" sx={{ flex: 1, overflow: "hidden", display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: isExpanded ? "unset" : 2, wordBreak: "break-word" }}>
                        {order.address}
                      </Typography>
                      {canToggle ? (
                        <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
                          <IconButton size="small" sx={{ mt: "-2px", flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); toggleExpand(order.order_id) }}>
                            <ExpandMoreIcon fontSize="small" sx={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", color: "text.disabled" }} />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </Box>
                  ) : null}

                  {items.length > 0 && !isExpanded ? (
                    <Box mt={0.9} display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                      <Typography fontSize={12} color="text.secondary">{items.length} product{items.length > 1 ? "s" : ""} - Total Rs.{orderTotal.toFixed(0)}</Typography>
                      <Button size="small" onClick={() => toggleExpand(order.order_id)} sx={{ minWidth: 0, px: 1, py: 0.25, textTransform: "none", fontWeight: 700, fontSize: 11.5, color: "#2563eb" }}>View Products</Button>
                    </Box>
                  ) : null}

                  {items.length > 0 && isExpanded ? (
                    <Box mt={1} display="flex" flexDirection="column" gap={0.55}>
                      {items.map((item) => (
                        <Box key={item.item_id} display="flex" alignItems="center" gap={0.8} sx={{ px: 1, py: 0.5, borderRadius: 2, background: item.order_type === "adhoc" ? "#fef9c3" : "#f0f9ff", border: `1px solid ${item.order_type === "adhoc" ? "#fde047" : "#bae6fd"}` }}>
                          <Typography fontSize={12} fontWeight={700} color="text.primary" sx={{ flex: 1 }}>
                            {item.product_name}
                            {item.unit ? <Box component="span" fontWeight={400} color="text.secondary" ml={0.4}>{item.unit}</Box> : null}
                          </Typography>
                          <Typography fontSize={12} fontWeight={600} color="text.secondary">x{item.quantity}</Typography>
                          <Typography fontSize={12} fontWeight={700} color="#1d4ed8">Rs.{(toNum(item.quantity) * toNum(item.price_at_order)).toFixed(0)}</Typography>
                          <Chip label={item.order_type === "adhoc" ? "Tomorrow" : "Daily"} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, background: item.order_type === "adhoc" ? "#fbbf24" : "#38bdf8", color: "white" }} />
                        </Box>
                      ))}
                      <Typography fontSize={11.5} fontWeight={700} color="#1d4ed8" textAlign="right">Delivery: {orderDelivery > 0 ? `Rs.${orderDelivery.toFixed(0)}` : "Free"}</Typography>
                      <Typography fontSize={11.5} fontWeight={800} color="#1d4ed8" textAlign="right">Total: Rs.{orderTotal.toFixed(0)}</Typography>
                    </Box>
                  ) : null}
                </Box>

                <Box display="flex" flexDirection={{ xs: "row", md: "column" }} alignItems={{ xs: "center", md: "flex-end" }} justifyContent="space-between" gap={1} flexShrink={0} width={{ xs: "100%", md: "auto" }}>
                  {items.length > 0 ? (
                    <Button size="small" onClick={() => toggleExpand(order.order_id)} endIcon={<ExpandMoreIcon fontSize="small" sx={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />} sx={{ minWidth: 0, px: 1, py: 0.15, textTransform: "none", fontWeight: 700, fontSize: 11.5, color: "#475569" }}>
                      {isExpanded ? "Collapse" : "Expand"}
                    </Button>
                  ) : (
                    <Chip label={`Qty: ${order.quantity}`} size="small" color="primary" sx={{ fontWeight: 700, fontSize: 12 }} />
                  )}

                  <Box display="flex" alignItems="center" gap={0.8}>
                    <Switch size="small" checked={!!order.is_delivered} onChange={() => toggleDelivered(order.order_id)} />
                    <Chip label={order.is_delivered ? "Delivered" : "Pending"} size="small" sx={{ background: order.is_delivered ? "#22c55e" : "#fb923c", color: "white", fontWeight: 700, fontSize: 11 }} />
                  </Box>

                  {order.is_delivered && order.delivered_at ? <Typography variant="caption" color="text.disabled" fontSize={10.5}>{formatISTDateTime(order.delivered_at)}</Typography> : null}
                  {!order.is_delivered ? <Typography variant="caption" color="text.secondary">{formatISTDate(order.order_date)}</Typography> : null}
                </Box>
              </Box>
              {index !== filtered.length - 1 ? <Divider /> : null}
            </Box>
          )
        })}
      </Paper>
    </Box>
  )
}
