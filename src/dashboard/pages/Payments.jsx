import { useEffect, useMemo, useState } from "react"
import API, { getToken } from "../../services/api"
import { formatISTDate, formatISTDateTime, getISTDate, getISTDateStr } from "../../utils/istDate"
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import PaymentsIcon from "@mui/icons-material/Payments"
import SearchIcon from "@mui/icons-material/Search"
import ApartmentIcon from "@mui/icons-material/Apartment"
import HomeIcon from "@mui/icons-material/Home"
import GridViewIcon from "@mui/icons-material/GridView"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import BlockIcon from "@mui/icons-material/Block"
import RefreshIcon from "@mui/icons-material/Refresh"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import PersonIcon from "@mui/icons-material/Person"
import PhoneIcon from "@mui/icons-material/Phone"
import CloseIcon from "@mui/icons-material/Close"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

const INDIVIDUAL_VALUE = "__individual__"

const toDateStr = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

const getThisMonthRange = () => {
  const now = getISTDate(0)
  const from = toDateStr(new Date(now.getFullYear(), now.getMonth(), 1))
  const to = toDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  return { from, to, label: formatISTDate(from, { month: "long", year: "numeric" }) }
}

function toNum(value) {
  return Number.parseFloat(value || 0) || 0
}

function paymentStatus(payment) {
  if (payment.is_revoked) return "rejected"
  if (payment.is_verified) return "accepted"
  return "pending"
}

function statusChipProps(status) {
  if (status === "accepted") return { label: "Accepted", color: "success" }
  if (status === "rejected") return { label: "Rejected", color: "error" }
  return { label: "Pending", color: "warning" }
}

function PaymentTile({ label, value, tone, dark, formatter }) {
  const border = dark ? "#1e293b" : "#e5e7eb"
  const backgrounds = {
    blue: dark ? "#0f172a" : "#ffffff",
    green: dark ? "#052e16" : "#f0fdf4",
    orange: dark ? "#431407" : "#fff7ed",
  }
  const colors = {
    blue: "#2563eb",
    green: "#16a34a",
    orange: "#ea580c",
  }
  return (
    <Paper elevation={0} sx={{ p: { xs: 1, sm: 1.8 }, borderRadius: 3, border: `1px solid ${border}`, background: backgrounds[tone], minWidth: 0 }}>
      <Typography fontSize={{ xs: 9.5, sm: 11.5 }} color={dark ? "#94a3b8" : "#6b7280"} sx={{ lineHeight: 1.15 }}>{label}</Typography>
      <Typography fontWeight={800} fontSize={{ xs: 12, sm: 26 }} sx={{ color: colors[tone], mt: 0.3, lineHeight: 1.05, wordBreak: "break-word" }}>
        {formatter ? formatter(value) : `Rs.${value.toFixed(0)}`}
      </Typography>
    </Paper>
  )
}

export default function Payments({ dark }) {
  const monthRange = getThisMonthRange()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [payments, setPayments] = useState([])
  const [customerTotals, setCustomerTotals] = useState([])
  const [search, setSearch] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [blockFilter, setBlockFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateMode, setDateMode] = useState("month")
  const [fromDate, setFromDate] = useState(monthRange.from)
  const [toDate, setToDate] = useState(monthRange.to)
  const [previewImage, setPreviewImage] = useState("")
  const [actionBusy, setActionBusy] = useState("")
  const [expanded, setExpanded] = useState({})

  const border = dark ? "#1e293b" : "#e5e7eb"
  const bg = dark ? "#0f172a" : "#ffffff"
  const textPrimary = dark ? "#f1f5f9" : "#111827"
  const textSecondary = dark ? "#94a3b8" : "#6b7280"

  useEffect(() => {
    if (dateMode === "today") {
      const today = getISTDateStr(0)
      setFromDate(today)
      setToDate(today)
    } else if (dateMode === "month") {
      const current = getThisMonthRange()
      setFromDate(current.from)
      setToDate(current.to)
    }
  }, [dateMode])

  const loadPayments = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const r = await API.get(`/payments-history?token=${getToken()}&from=${fromDate}&to=${toDate}`)
      setPayments(r.data.payments || [])
      setCustomerTotals(r.data.customerTotals || [])
    } finally {
      if (!silent) setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [fromDate, toDate])

  const sourceRows = useMemo(() => {
    const rows = [...payments, ...customerTotals]
    const seen = new Set()
    return rows.filter((row) => {
      const key = `${row.customer_id || ""}-${row.customer_phone || ""}-${row.address || ""}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [payments, customerTotals])

  const apartments = useMemo(
    () => [...new Set(sourceRows.filter((row) => row.address_type === "apartment").map((row) => row.apartment_name).filter(Boolean))],
    [sourceRows]
  )

  const blocks = useMemo(() => {
    if (!locationFilter || locationFilter === INDIVIDUAL_VALUE) return []
    return [...new Set(sourceRows.filter((row) => row.apartment_name === locationFilter).map((row) => row.block_name).filter(Boolean))]
  }, [sourceRows, locationFilter])

  const matchesBaseFilters = (row) => {
    if (locationFilter === INDIVIDUAL_VALUE && row.address_type === "apartment") return false
    if (locationFilter && locationFilter !== INDIVIDUAL_VALUE && row.apartment_name !== locationFilter) return false
    if (blockFilter && row.block_name !== blockFilter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return [row.customer_name, row.customer_phone, row.address, row.apartment_name, row.block_name, row.payment_method, row.notes]
      .some((value) => String(value || "").toLowerCase().includes(q))
  }

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => matchesBaseFilters(payment) && (statusFilter === "all" || statusFilter === "need_to_pay" || paymentStatus(payment) === statusFilter))
  }, [payments, search, locationFilter, blockFilter, statusFilter])

  const needToPayRows = useMemo(() => {
    return customerTotals.filter((row) => matchesBaseFilters(row) && toNum(row.outstanding) > 0)
  }, [customerTotals, search, locationFilter, blockFilter])

  const visibleCustomerIds = useMemo(() => {
    if (statusFilter === "all") return null
    if (statusFilter === "need_to_pay") return new Set(needToPayRows.map((row) => row.customer_id).filter(Boolean))
    return new Set(filteredPayments.map((payment) => payment.customer_id).filter(Boolean))
  }, [filteredPayments, needToPayRows, statusFilter])

  const filteredCustomerTotals = useMemo(() => {
    return customerTotals.filter((row) => {
      if (!matchesBaseFilters(row)) return false
      if (!visibleCustomerIds) return true
      return visibleCustomerIds.has(row.customer_id)
    })
  }, [customerTotals, search, locationFilter, blockFilter, visibleCustomerIds])

  const totals = useMemo(() => {
    return filteredCustomerTotals.reduce((acc, row) => {
      acc.totalBilled += toNum(row.total_billed)
      acc.received += toNum(row.received_amount)
      acc.outstanding += toNum(row.outstanding)
      return acc
    }, { totalBilled: 0, received: 0, outstanding: 0 })
  }, [filteredCustomerTotals])

  const customersNeedToPay = useMemo(
    () => filteredCustomerTotals.filter((row) => toNum(row.outstanding) > 0).length,
    [filteredCustomerTotals]
  )

  const handleAction = async (paymentId, action) => {
    setActionBusy(`${action}-${paymentId}`)
    try {
      await API.patch(`/payments/${paymentId}/${action}?token=${getToken()}`)
      await loadPayments(true)
    } finally {
      setActionBusy("")
    }
  }

  const renderPayments = statusFilter === "need_to_pay" ? [] : filteredPayments
  const renderNeedToPay = statusFilter === "need_to_pay" ? needToPayRows : []

  const toggleExpanded = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
  const expandAll = () => {
    const next = {}
    if (statusFilter === "need_to_pay") {
      renderNeedToPay.forEach((row) => { next[`due-${row.customer_id}`] = true })
    } else {
      renderPayments.forEach((payment) => { next[payment.payment_id] = true })
    }
    setExpanded(next)
  }
  const collapseAll = () => {
    const next = {}
    if (statusFilter === "need_to_pay") {
      renderNeedToPay.forEach((row) => { next[`due-${row.customer_id}`] = false })
    } else {
      renderPayments.forEach((payment) => { next[payment.payment_id] = false })
    }
    setExpanded(next)
  }

  return (
    <Box sx={{ maxWidth: 1180, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>
      <Paper elevation={0} sx={{ p: 1.25, mb: 2, borderRadius: 4, border: `1px solid ${border}`, background: "linear-gradient(135deg, #ffffff 0%, #f7fbff 60%, #fffaf0 100%)", boxShadow: "0 10px 28px rgba(15,23,42,0.04)" }}>
        <Stack spacing={1.2}>
          <Box display="flex" alignItems="center" gap={0.8}>
            <CalendarTodayIcon sx={{ fontSize: 17, color: "#64748b" }} />
            <Typography fontSize={13} fontWeight={800} color="#334155">Filters</Typography>
          </Box>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.2}>
            <TextField size="small" placeholder="Search name, phone or address..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: textSecondary }} /></InputAdornment> }} sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 3, fontSize: 13, background: "#f8fafc" } }} />
            <Select size="small" value={locationFilter} displayEmpty onChange={(e) => { setLocationFilter(e.target.value); setBlockFilter("") }} startAdornment={<InputAdornment position="start">{locationFilter === INDIVIDUAL_VALUE ? <HomeIcon fontSize="small" sx={{ color: textSecondary, ml: 0.5 }} /> : <ApartmentIcon fontSize="small" sx={{ color: textSecondary, ml: 0.5 }} />}</InputAdornment>} sx={{ minWidth: { xs: "100%", md: 210 }, borderRadius: 3, fontSize: 13, background: "#f8fafc" }}>
              <MenuItem value="">All Locations</MenuItem>
              <MenuItem value={INDIVIDUAL_VALUE}>Individual Houses</MenuItem>
              {apartments.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
            </Select>
            <Select size="small" value={blockFilter} displayEmpty disabled={!locationFilter || locationFilter === INDIVIDUAL_VALUE} onChange={(e) => setBlockFilter(e.target.value)} startAdornment={<InputAdornment position="start"><GridViewIcon fontSize="small" sx={{ color: textSecondary, ml: 0.5 }} /></InputAdornment>} sx={{ minWidth: { xs: "100%", md: 180 }, borderRadius: 3, fontSize: 13, background: "#f8fafc" }}>
              <MenuItem value="">All Blocks</MenuItem>
              {blocks.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
            </Select>
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ xs: "stretch", md: "center" }}>
            <ToggleButtonGroup size="small" exclusive value={dateMode} onChange={(_, value) => value && setDateMode(value)} sx={{ display: "flex", flexWrap: "nowrap", gap: 0.65, overflowX: "auto", pb: 0.25, "& .MuiToggleButton-root": { borderRadius: 2.5, border: "1px solid #d7e0ea !important", textTransform: "none", px: 1.2, py: 0.7, fontSize: 12, fontWeight: 700, color: "#475569", background: "#fff", whiteSpace: "nowrap", flexShrink: 0 }, "& .Mui-selected": { background: "#1d4ed8 !important", color: "#fff !important", boxShadow: "0 8px 18px rgba(29,78,216,0.22)" } }}>
              <ToggleButton value="today">Today</ToggleButton>
              <ToggleButton value="month">This Month</ToggleButton>
              <ToggleButton value="custom">Custom</ToggleButton>
            </ToggleButtonGroup>
            <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: { xs: "100%", md: 190 }, borderRadius: 3, fontSize: 13, background: "#f8fafc" }}>
              <MenuItem value="all">All Payments</MenuItem>
              <MenuItem value="pending">Pending To Accept</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="need_to_pay">Need To Pay</MenuItem>
            </Select>
            {dateMode === "custom" ? (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <TextField size="small" type="date" label="From" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 160, "& .MuiOutlinedInput-root": { borderRadius: 3 } }} />
                <TextField size="small" type="date" label="To" value={toDate} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 160, "& .MuiOutlinedInput-root": { borderRadius: 3 } }} />
              </Stack>
            ) : (
              <Chip icon={<CalendarTodayIcon />} label={dateMode === "month" ? monthRange.label : formatISTDate(fromDate)} sx={{ borderRadius: 2.5, fontWeight: 700, alignSelf: { xs: "flex-start", md: "center" }, background: "#eef4ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }} />
            )}
          </Stack>
        </Stack>
      </Paper>

      <Box display="flex" alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" mb={1.5} gap={1.25} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={1.2}>
          <Box sx={{ width: 38, height: 38, borderRadius: "12px", background: "linear-gradient(135deg,#0f766e,#14b8a6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PaymentsIcon sx={{ fontSize: 18, color: "white" }} />
          </Box>
          <Box>
            <Typography fontWeight={800} fontSize={18} color={textPrimary}>Payments</Typography>
            <Typography fontSize={12.5} color={textSecondary}>Track payment history, approvals, rejected proofs, and outstanding balances.</Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={0.8} flexWrap="wrap">
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={() => loadPayments(true)} disabled={refreshing} sx={{ borderRadius: 2, textTransform: "none", px: 1.2, py: 0.45 }}>Refresh</Button>
          <Button size="small" variant="outlined" onClick={expandAll} sx={{ borderRadius: 2, textTransform: "none", px: 1.2, py: 0.45 }}>Expand</Button>
          <Button size="small" variant="outlined" onClick={collapseAll} sx={{ borderRadius: 2, textTransform: "none", px: 1.2, py: 0.45 }}>Collapse</Button>
        </Stack>
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(4, minmax(0, 1fr))" gap={0.8} mb={1.6}>
        <PaymentTile label="Total Amount" value={totals.totalBilled} tone="blue" dark={dark} />
        <PaymentTile label="Received Amount" value={totals.received} tone="green" dark={dark} />
        <PaymentTile label="Outstanding Amount" value={totals.outstanding} tone="orange" dark={dark} />
        <PaymentTile label="Customers Need To Pay" value={customersNeedToPay} tone="orange" dark={dark} formatter={(value) => `${value}`} />
      </Box>

      {loading ? (
        <Box py={10} textAlign="center"><CircularProgress size={26} /></Box>
      ) : (statusFilter === "need_to_pay" ? renderNeedToPay.length === 0 : renderPayments.length === 0) ? (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
          <Typography fontWeight={700} color={textPrimary}>{statusFilter === "need_to_pay" ? "No unpaid customers found for these filters" : "No payments found for these filters"}</Typography>
          <Typography fontSize={13} color={textSecondary} mt={0.6}>Try changing the month, status, location, or search filters.</Typography>
        </Paper>
      ) : (
        <Stack spacing={1.3}>
          {statusFilter === "need_to_pay" ? renderNeedToPay.map((row) => {
            const cardKey = `due-${row.customer_id}`
            const isExpanded = !!expanded[cardKey]
            return (
              <Paper key={cardKey} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${border}`, background: bg, overflow: "hidden" }}>
                <Box sx={{ px: 1.5, py: 1.4 }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                    <Box minWidth={0} flex={1}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mb={0.8}>
                        <Typography fontWeight={800} color={textPrimary} fontSize={18}>Rs.{toNum(row.outstanding).toFixed(0)}</Typography>
                        <Chip size="small" color="error" label="Need To Pay" />
                      </Stack>
                      <Typography fontWeight={700} color={textPrimary} fontSize={14}><PersonIcon sx={{ fontSize: 15, verticalAlign: "-2px", mr: 0.4 }} />{row.customer_name || "Customer"}</Typography>
                      <Typography fontSize={12.5} color={textSecondary}><PhoneIcon sx={{ fontSize: 14, verticalAlign: "-2px", mr: 0.4 }} />{row.customer_phone}</Typography>
                      <Typography fontSize={12} color={textSecondary} mt={0.35}>{dateMode === "month" ? monthRange.label : `${formatISTDate(fromDate)} to ${formatISTDate(toDate)}`}</Typography>
                    </Box>
                    <Button size="small" onClick={() => toggleExpanded(cardKey)} endIcon={<ExpandMoreIcon sx={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
                      {isExpanded ? "Collapse" : "Expand"}
                    </Button>
                  </Stack>
                </Box>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ px: 1.5, pb: 1.5, pt: 0, borderTop: `1px solid ${border}` }}>
                    <Stack spacing={1.2} mt={1.4}>
                      <Typography fontSize={13} color={textSecondary}>{row.address || "Address not available"}</Typography>
                      <Typography fontSize={13} color={textSecondary}>Total Billed: <Box component="span" fontWeight={700} color={textPrimary}>Rs.{toNum(row.total_billed).toFixed(0)}</Box></Typography>
                      <Typography fontSize={13} color={textSecondary}>Received: <Box component="span" fontWeight={700} color="#16a34a">Rs.{toNum(row.received_amount).toFixed(0)}</Box></Typography>
                      <Typography fontSize={13} color={textSecondary}>Outstanding: <Box component="span" fontWeight={800} color="#dc2626">Rs.{toNum(row.outstanding).toFixed(0)}</Box></Typography>
                    </Stack>
                  </Box>
                </Collapse>
              </Paper>
            )
          }) : renderPayments.map((payment) => {
            const status = paymentStatus(payment)
            const chip = statusChipProps(status)
            const isExpanded = !!expanded[payment.payment_id]
            const busyVerify = actionBusy === `verify-${payment.payment_id}`
            const busyRevoke = actionBusy === `revoke-${payment.payment_id}`
            return (
              <Paper key={payment.payment_id} elevation={0} sx={{ borderRadius: 3, border: `1px solid ${border}`, background: bg, overflow: "hidden" }}>
                <Box sx={{ px: 1.5, py: 1.4 }}>
                  <Stack direction="row" spacing={1.2} justifyContent="space-between" alignItems="flex-start">
                    <Box minWidth={0} flex={1}>
                      <Typography fontWeight={700} color={textPrimary} fontSize={14}><PersonIcon sx={{ fontSize: 15, verticalAlign: "-2px", mr: 0.4 }} />{payment.customer_name || "Customer"}</Typography>
                      <Typography fontSize={12.5} color={textSecondary}><PhoneIcon sx={{ fontSize: 14, verticalAlign: "-2px", mr: 0.4 }} />{payment.customer_phone}</Typography>
                      <Typography fontSize={12} color={textSecondary} mt={0.35}>{formatISTDate(payment.payment_date)} - {formatISTDateTime(payment.created_at, { hour: "2-digit", minute: "2-digit" })}</Typography>
                    </Box>
                    <Stack alignItems="flex-end" spacing={0.8} flexShrink={0}>
                      <Stack direction="row" spacing={0.8} alignItems="center" useFlexGap flexWrap="wrap" justifyContent="flex-end">
                        <Typography fontWeight={800} color={textPrimary} fontSize={18}>Rs.{toNum(payment.amount).toFixed(0)}</Typography>
                        <Chip size="small" label={chip.label} color={chip.color} />
                      </Stack>
                      <Button size="small" onClick={() => toggleExpanded(payment.payment_id)} endIcon={<ExpandMoreIcon sx={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />} sx={{ minWidth: "auto", textTransform: "none", fontWeight: 700, borderRadius: 2, px: 0.4 }}>
                        {isExpanded ? "Collapse" : "Details"}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ px: 1.5, pb: 1.5, pt: 0, borderTop: `1px solid ${border}` }}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "flex-start" }} mt={1.4}>
                      <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                        <Typography fontSize={13} color={textSecondary} sx={{ textAlign: "left" }}>{payment.address || "Address not available"}</Typography>
                        {payment.period_from && payment.period_to && (
                          <Typography fontSize={13} color={textSecondary} sx={{ textAlign: "left" }}>
                            Covers: <Box component="span" fontWeight={700} color={textPrimary}>{formatISTDate(payment.period_from)} to {formatISTDate(payment.period_to)}</Box>
                          </Typography>
                        )}
                        {!!payment.notes && (
                          <Typography fontSize={13} color={textSecondary} sx={{ textAlign: "left" }}>
                            Note: <Box component="span" color={textPrimary}>{payment.notes}</Box>
                          </Typography>
                        )}
                        {payment.screenshot_url ? (
                          <Button size="small" variant="outlined" startIcon={<AttachFileIcon />} onClick={() => setPreviewImage(payment.screenshot_url)} sx={{ borderRadius: 2, textTransform: "none", alignSelf: "flex-start" }}>Open Attachment</Button>
                        ) : (
                          <Chip size="small" variant="outlined" label="No attachment" sx={{ alignSelf: "flex-start" }} />
                        )}
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={{ xs: "flex-start", sm: "flex-end" }} sx={{ minWidth: { sm: 170 } }}>
                          {(!payment.is_verified || payment.is_revoked) && (
                            <Button size="small" variant="contained" startIcon={<CheckCircleIcon />} disabled={busyVerify || busyRevoke} onClick={() => handleAction(payment.payment_id, "verify")} sx={{ borderRadius: 2, textTransform: "none", background: "#16a34a" }}>Accept</Button>
                          )}
                          {!payment.is_revoked && (
                            <Button size="small" variant="outlined" color="error" startIcon={<BlockIcon />} disabled={busyVerify || busyRevoke} onClick={() => handleAction(payment.payment_id, "revoke")} sx={{ borderRadius: 2, textTransform: "none" }}>Reject</Button>
                          )}
                      </Stack>
                    </Stack>
                  </Box>
                </Collapse>
              </Paper>
            )
          })}
        </Stack>
      )}

      <Dialog open={!!previewImage} onClose={() => setPreviewImage("")} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Payment Attachment
          <IconButton onClick={() => setPreviewImage("")}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ textAlign: "center", background: dark ? "#0f172a" : "#fff" }}>
          {previewImage ? <Box component="img" src={previewImage} alt="Payment proof" sx={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: 2 }} /> : null}
        </DialogContent>
      </Dialog>
    </Box>
  )
}





