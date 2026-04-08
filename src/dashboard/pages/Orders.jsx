import React, { useEffect, useMemo, useState } from "react"
import API, { getRole, getToken } from "../../services/api"
import { formatISTDate, formatISTDateTime, getISTDate, toISTDateStr } from "../../utils/istDate"
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import ApartmentIcon from "@mui/icons-material/Apartment"
import GridViewIcon from "@mui/icons-material/GridView"
import HomeIcon from "@mui/icons-material/Home"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
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

function ProductSummaryCard({ item }) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid #dbe3ef",
        overflow: "hidden",
        minWidth: 155,
        flex: "1 1 155px",
        maxWidth: 230,
        background: "#fff",
        boxShadow: "0 8px 20px rgba(15,23,42,0.05)",
      }}
    >
      <Box sx={{ px: 1.25, py: 1, background: "#f8fbff", borderBottom: "1px solid #e5edf6" }}>
        <Typography fontSize={12.5} fontWeight={700} color="text.primary" noWrap>
          {item.name}
        </Typography>
        {item.unit ? <Typography fontSize={10.5} color="text.secondary">{item.unit}</Typography> : null}
      </Box>
      {item.sub > 0 ? (
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1.25, py: 0.7, background: "#edf6ff" }}>
          <Typography fontSize={11} fontWeight={700} color="#1d4ed8">Daily</Typography>
          <Typography fontSize={14} fontWeight={800} color="#1d4ed8">{item.sub}</Typography>
        </Box>
      ) : null}
      {item.adhoc > 0 ? (
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1.25, py: 0.7, background: "#fff8db" }}>
          <Typography fontSize={11} fontWeight={700} color="#a16207">Tomorrow</Typography>
          <Typography fontSize={14} fontWeight={800} color="#a16207">{item.adhoc}</Typography>
        </Box>
      ) : null}
      {item.sub > 0 && item.adhoc > 0 ? (
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 1.25, py: 0.7, background: "#f8fafc", borderTop: "1px solid #e5edf6" }}>
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
    return { from: fromDate, to: toDate, label: `${formatISTDate(fromDate)} to ${formatISTDate(toDate)}` }
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

    return data.sort((a, b) => {
      const deliveryRank = Number(!!a.is_delivered) - Number(!!b.is_delivered)
      if (deliveryRank !== 0) return deliveryRank
      return String(a.customer_name || "").localeCompare(String(b.customer_name || ""))
    })
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
  const hasFilters = Boolean(search.trim() || apartment || block || dateMode === "custom")

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

  const clearFilters = () => {
    setSearch("")
    setApartment("")
    setBlock("")
    setDateMode("today")
    setFromDate(TODAY)
    setToDate(TODAY)
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
    <Box
      sx={{
        maxWidth: 1080,
        margin: "auto",
        px: { xs: 1, sm: 2 },
        py: { xs: 1.5, sm: 2.5 },
        background: "linear-gradient(180deg, #fff8ef 0%, #eef6ff 140px, #f6fffb 280px, #ffffff 420px)",
      }}
    >
      {isAdmin ? (
        <Paper
          elevation={0}
        sx={{
          mb: 2,
          p: 1.2,
          borderRadius: 4,
          border: "1px solid #d7e7ff",
          background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 55%, #eefcf6 100%)",
          boxShadow: "0 12px 28px rgba(37,99,235,0.08)",
        }}
      >
          <Button
            fullWidth
            variant="contained"
            onClick={generate}
            disabled={generating}
            startIcon={<AutorenewIcon fontSize="small" sx={{ animation: generating ? "spin 1s linear infinite" : "none", "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } } }} />}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              borderRadius: 3,
              px: 2,
              py: 1.05,
              background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
              boxShadow: "0 12px 24px rgba(37,99,235,0.24)",
            }}
          >
            {generating ? "Generating..." : "Generate Orders"}
          </Button>
        </Paper>
      ) : null}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.25, sm: 1.5 },
          mb: 2,
          borderRadius: 4,
          border: "1px solid #dbe7f3",
          background: "linear-gradient(135deg, #ffffff 0%, #f7fbff 60%, #fffaf0 100%)",
          boxShadow: "0 12px 28px rgba(15,23,42,0.05)",
        }}
      >
        <Stack spacing={1.4}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
            <Box display="flex" alignItems="center" gap={0.8}>
              <CalendarTodayIcon sx={{ fontSize: 17, color: "#64748b" }} />
              <Typography fontSize={13} fontWeight={800} color="#334155">Filters</Typography>
            </Box>
            {hasFilters ? (
              <Button size="small" onClick={clearFilters} sx={{ textTransform: "none", fontWeight: 700, color: "#2563eb" }}>
                Clear
              </Button>
            ) : null}
          </Stack>

          <ToggleButtonGroup
            size="small"
            exclusive
            value={dateMode}
            onChange={(_, val) => val && setDateMode(val)}
            sx={{
              display: "flex",
              flexWrap: "nowrap",
              gap: 0.65,
              overflowX: "auto",
              pb: 0.25,
              "& .MuiToggleButton-root": {
                borderRadius: 2.5,
                border: "1px solid #d7e0ea !important",
                textTransform: "none",
                px: 1.2,
                py: 0.7,
                fontSize: 12,
                fontWeight: 700,
                color: "#475569",
                background: "#fff",
                whiteSpace: "nowrap",
                flexShrink: 0,
              },
              "& .Mui-selected": {
                background: "#1d4ed8 !important",
                color: "#fff !important",
                boxShadow: "0 8px 18px rgba(29,78,216,0.22)",
              },
            }}
          >
            <ToggleButton value="yesterday">Yesterday</ToggleButton>
            <ToggleButton value="today">Today</ToggleButton>
            <ToggleButton value="tomorrow">Tomorrow</ToggleButton>
            <ToggleButton value="month">This Month</ToggleButton>
            <ToggleButton value="custom">Custom</ToggleButton>
          </ToggleButtonGroup>

          {dateMode === "custom" ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <TextField
                type="date"
                size="small"
                label="From"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
              />
              <TextField
                type="date"
                size="small"
                label="To"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                inputProps={{ min: fromDate }}
                InputLabelProps={{ shrink: true }}
                sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
              />
            </Stack>
          ) : null}

          <Stack spacing={1.1}>
            <TextField
              size="small"
              placeholder="Search customer, phone or address"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} /></InputAdornment> }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  fontSize: 14,
                  background: "#f8fafc",
                },
              }}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.1}>
              <Select
                size="small"
                value={apartment}
                displayEmpty
                onChange={(e) => { setApartment(e.target.value); setBlock("") }}
                startAdornment={<InputAdornment position="start">{apartment === INDIVIDUAL_VALUE ? <HomeIcon fontSize="small" sx={{ color: "#94a3b8", ml: 0.5 }} /> : <ApartmentIcon fontSize="small" sx={{ color: "#94a3b8", ml: 0.5 }} />}</InputAdornment>}
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  fontSize: 13.5,
                  background: "#f8fafc",
                }}
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
                startAdornment={<InputAdornment position="start"><GridViewIcon fontSize="small" sx={{ color: "#94a3b8", ml: 0.5 }} /></InputAdornment>}
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  fontSize: 13.5,
                  background: "#f8fafc",
                }}
              >
                <MenuItem value="">All Blocks</MenuItem>
                {blocks.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
              </Select>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          mb: 2,
          p: { xs: 1.5, sm: 2 },
          borderRadius: 5,
          border: "1px solid #d7e7ff",
          background: "linear-gradient(135deg, #fff8ef 0%, #ffffff 40%, #eef6ff 100%)",
          boxShadow: "0 18px 38px rgba(59,130,246,0.12)",
        }}
      >
        <Stack spacing={1.2}>
          <Box>
            <Typography fontWeight={900} fontSize={{ xs: 24, sm: 28 }} lineHeight={1.05} color="#16325c">
              Orders
            </Typography>
            <Typography fontSize={13} color="#51627f" mt={0.6}>
              Clear, simple order list for quick mobile use.
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
            <Chip
              size="small"
              label={`${filtered.length} orders`}
              sx={{ height: 28, borderRadius: 2.5, fontSize: 12, fontWeight: 800, background: "#fff", border: "1px solid #dbe7f3" }}
            />
            <Chip
              size="small"
              label={`${pending} pending`}
              sx={{ height: 28, borderRadius: 2.5, fontSize: 12, fontWeight: 800, background: "#fff7ed", color: "#c2410c", border: "1px solid #fdba74" }}
            />
            <Chip
              size="small"
              label={`${delivered} delivered`}
              sx={{ height: 28, borderRadius: 2.5, fontSize: 12, fontWeight: 800, background: "#ecfdf5", color: "#15803d", border: "1px solid #86efac" }}
            />
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 1.1, mb: 2, borderRadius: 4, border: "1px solid #dce8f7", background: "linear-gradient(135deg, #ffffff 0%, #f5fbff 100%)" }}>
        <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
          <Button size="small" variant="outlined" onClick={expandAllRows} sx={{ minWidth: "auto", textTransform: "none", borderRadius: 2.5, fontWeight: 700, px: 1.15, py: 0.45 }}>Expand</Button>
          <Button size="small" variant="outlined" onClick={collapseAllRows} sx={{ minWidth: "auto", textTransform: "none", borderRadius: 2.5, fontWeight: 700, px: 1.15, py: 0.45 }}>Collapse</Button>
          <Button size="small" variant="outlined" disabled={bulkLoading} onClick={() => bulkToggle(true)} startIcon={bulkLoading ? <CircularProgress size={13} /> : <CheckCircleOutlineIcon fontSize="small" />} sx={{ minWidth: "auto", textTransform: "none", borderRadius: 2.5, fontWeight: 700, px: 1.15, py: 0.45, color: "#15803d", borderColor: "#4ade80" }}>All delivered</Button>
          <Button size="small" variant="outlined" disabled={bulkLoading} onClick={() => bulkToggle(false)} startIcon={bulkLoading ? <CircularProgress size={13} /> : <HighlightOffIcon fontSize="small" />} sx={{ minWidth: "auto", textTransform: "none", borderRadius: 2.5, fontWeight: 700, px: 1.15, py: 0.45, color: "#c2410c", borderColor: "#fb923c" }}>All pending</Button>
        </Stack>
      </Paper>

      {productSummary.length > 0 ? (
        <Paper elevation={0} sx={{ p: 1.5, mb: 2, borderRadius: 4, border: "1px solid #dce8f7", background: "linear-gradient(135deg, #ffffff 0%, #f9fcff 60%, #fefbf3 100%)" }}>
          <Typography fontSize={11.5} fontWeight={800} letterSpacing="0.5px" color="#64748b" mb={1}>
            PRODUCT TOTALS - {effectiveRange.label.toUpperCase()}
          </Typography>
          <Box display="flex" flexWrap={{ xs: "nowrap", md: "wrap" }} gap={1} sx={{ overflowX: { xs: "auto", md: "visible" }, pb: { xs: 0.5, md: 0 } }}>
            {productSummary.map((item) => <ProductSummaryCard key={item.name} item={item} />)}
          </Box>
        </Paper>
      ) : null}

      <Paper elevation={0} sx={{ p: 1, borderRadius: 4, border: "1px solid #dbe7f3", background: "linear-gradient(180deg, #f9fcff 0%, #f6fbff 100%)" }}>
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

          return (
            <Box
              key={order.order_id}
              sx={{
                mb: index !== filtered.length - 1 ? 1 : 0,
                borderRadius: 3,
                border: "1px solid #d7e5f5",
                overflow: "hidden",
                background: "linear-gradient(135deg, #ffffff 0%, #fbfdff 100%)",
              }}
            >
              <Box
                sx={{
                  px: { xs: 1.1, sm: 1.4 },
                  py: 1.1,
                  background: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.8,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Box minWidth={0} flex={1}>
                    <Typography fontWeight={900} fontSize={16.5} color="#0f172a" lineHeight={1.15} noWrap>
                      {`${order.customer_name || "Customer"} - ${showPhone ? order.phone : `******* ${String(order.phone).slice(-3)}`}`}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.6} useFlexGap flexWrap="wrap" justifyContent="flex-end" sx={{ maxWidth: "52%" }}>
                    <Chip
                      label={order.is_delivered ? "Delivered" : "Pending"}
                      size="small"
                      sx={{
                        height: 22,
                        background: order.is_delivered ? "#dcfce7" : "#ffedd5",
                        color: order.is_delivered ? "#166534" : "#c2410c",
                        fontSize: 10.5,
                        fontWeight: 800,
                      }}
                    />
                    <Chip
                      label={formatISTDate(order.order_date)}
                      size="small"
                      sx={{
                        height: 22,
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        fontSize: 10.5,
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                </Stack>

                {order.address ? (
                  <Typography
                    fontSize={12.5}
                    color="#475569"
                    textAlign="left"
                    sx={{
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: isExpanded ? "unset" : 1,
                      wordBreak: "break-word",
                    }}
                  >
                    {order.address}
                  </Typography>
                ) : null}

                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
                  <Stack direction="row" spacing={0.8} alignItems="center" useFlexGap flexWrap="wrap">
                    <Typography fontSize={12} fontWeight={700} color="#334155">
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </Typography>
                    <Typography fontSize={12} color="#cbd5e1">•</Typography>
                    <Typography fontSize={12.5} fontWeight={800} color="#1d4ed8">
                      Rs.{orderTotal.toFixed(0)}
                    </Typography>
                    {orderDelivery > 0 ? (
                      <>
                        <Typography fontSize={12} color="#cbd5e1">•</Typography>
                        <Typography fontSize={12} fontWeight={700} color="#c2410c">
                          Delivery Rs.{orderDelivery.toFixed(0)}
                        </Typography>
                      </>
                    ) : null}
                  </Stack>
                  <Box display="flex" alignItems="center" gap={0.6}>
                    <Button
                      size="small"
                      onClick={() => toggleExpand(order.order_id)}
                      endIcon={<ExpandMoreIcon fontSize="small" sx={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />}
                      sx={{ minWidth: "auto", textTransform: "none", fontWeight: 800, color: "#334155", px: 0.5 }}
                    >
                      {isExpanded ? "Less" : "Details"}
                    </Button>
                    <Switch size="small" checked={!!order.is_delivered} onChange={() => toggleDelivered(order.order_id)} />
                  </Box>
                </Stack>

                <Box
                  sx={{
                    px: 1,
                    py: 0.55,
                    borderRadius: 2.5,
                    background: order.is_delivered ? "#f0fdf4" : "#fff8f1",
                    border: `1px solid ${order.is_delivered ? "#bbf7d0" : "#fdba74"}`,
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                    <Typography fontSize={12} fontWeight={800} color={order.is_delivered ? "#166534" : "#9a3412"}>
                      {order.is_delivered ? "Delivered" : "Waiting for delivery"}
                    </Typography>
                    {order.is_delivered && order.delivered_at ? (
                      <Typography fontSize={11} fontWeight={700} color="#166534" sx={{ opacity: 0.82 }}>
                        {formatISTDateTime(order.delivered_at)}
                      </Typography>
                    ) : null}
                  </Stack>
                </Box>

                {items.length > 0 && isExpanded ? (
                  <Box display="flex" flexDirection="column" gap={0.55} sx={{ pt: 0.2 }}>
                    {items.map((item) => (
                      <Box
                        key={item.item_id}
                        display="flex"
                        alignItems="center"
                        gap={0.8}
                        sx={{
                          px: 0.9,
                          py: 0.65,
                          borderRadius: 2.5,
                          background: item.order_type === "adhoc" ? "#fff8db" : "#edf6ff",
                          border: `1px solid ${item.order_type === "adhoc" ? "#fde68a" : "#bfdbfe"}`,
                        }}
                      >
                        <Typography fontSize={12} fontWeight={800} color="text.primary" sx={{ flex: 1, minWidth: 0 }}>
                          {item.product_name}
                          {item.unit ? <Box component="span" fontWeight={500} color="text.secondary" ml={0.45}>{item.unit}</Box> : null}
                        </Typography>
                        <Typography fontSize={11.5} fontWeight={700} color="text.secondary">x{item.quantity}</Typography>
                        <Typography fontSize={12} fontWeight={800} color="#1d4ed8">Rs.{(toNum(item.quantity) * toNum(item.price_at_order)).toFixed(0)}</Typography>
                        <Chip label={item.order_type === "adhoc" ? "Tomorrow" : "Daily"} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 800, background: item.order_type === "adhoc" ? "#f59e0b" : "#3b82f6", color: "white" }} />
                      </Box>
                    ))}
                  </Box>
                ) : null}
              </Box>
            </Box>
          )
        })}
      </Paper>
    </Box>
  )
}
