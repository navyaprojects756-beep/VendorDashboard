import { useEffect, useMemo, useState } from "react"
import API, { getToken } from "../../services/api"
import { formatISTDate, formatISTDateTime, getISTDate, getISTDateStr, toISTDateStr } from "../../utils/istDate"

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material"

import PaymentsIcon from "@mui/icons-material/Payments"
import SearchIcon from "@mui/icons-material/Search"
import ApartmentIcon from "@mui/icons-material/Apartment"
import HomeIcon from "@mui/icons-material/Home"
import GridViewIcon from "@mui/icons-material/GridView"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import VisibilityIcon from "@mui/icons-material/Visibility"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import BlockIcon from "@mui/icons-material/Block"
import RefreshIcon from "@mui/icons-material/Refresh"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import PersonIcon from "@mui/icons-material/Person"
import PhoneIcon from "@mui/icons-material/Phone"
import CloseIcon from "@mui/icons-material/Close"

const INDIVIDUAL_VALUE = "__individual__"

const toDateStr = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

const getThisMonthRange = () => {
  const now = getISTDate(0)
  return {
    from: toDateStr(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: toDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    label: formatISTDate(toISTDateStr(new Date(now.getFullYear(), now.getMonth(), 1)), { month: "long", year: "numeric" }),
  }
}

function toNum(value) {
  return Number.parseFloat(value || 0) || 0
}

function PaymentTile({ label, value, color, bg, dark }) {
  const border = dark ? "#1e293b" : "#e5e7eb"
  return (
    <Paper elevation={0} sx={{ flex: "1 1 180px", p: 1.6, borderRadius: 3, border: `1px solid ${border}`, background: dark ? "#0f172a" : "#fff" }}>
      <Typography fontSize={11} color={dark ? "#94a3b8" : "#6b7280"}>{label}</Typography>
      <Typography fontWeight={800} fontSize={24} sx={{ color, lineHeight: 1.1, mt: 0.4 }}>
        Rs.{value.toFixed(0)}
      </Typography>
      <Box sx={{ mt: 1, height: 6, borderRadius: 999, background: bg }} />
    </Paper>
  )
}

function statusChip(payment) {
  if (payment.is_revoked) return { label: "Rejected", color: "error" }
  if (payment.is_verified) return { label: "Accepted", color: "success" }
  return { label: "Pending", color: "warning" }
}

export default function Payments({ dark }) {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [payments, setPayments] = useState([])
  const [customerTotals, setCustomerTotals] = useState([])
  const [search, setSearch] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [blockFilter, setBlockFilter] = useState("")
  const [dateMode, setDateMode] = useState("month")
  const monthRange = getThisMonthRange()
  const [fromDate, setFromDate] = useState(monthRange.from)
  const [toDate, setToDate] = useState(monthRange.to)
  const [previewImage, setPreviewImage] = useState("")
  const [actionBusy, setActionBusy] = useState("")

  const border = dark ? "#1e293b" : "#e5e7eb"
  const bg = dark ? "#0f172a" : "#ffffff"
  const bgCard = dark ? "#111827" : "#f9fafb"
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

  const matchFilters = (row) => {
    if (locationFilter === INDIVIDUAL_VALUE && row.address_type === "apartment") return false
    if (locationFilter && locationFilter !== INDIVIDUAL_VALUE && row.apartment_name !== locationFilter) return false
    if (blockFilter && row.block_name !== blockFilter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return [
      row.customer_name,
      row.customer_phone,
      row.address,
      row.apartment_name,
      row.block_name,
      row.payment_method,
      row.notes,
    ].some((value) => String(value || "").toLowerCase().includes(q))
  }

  const filteredCustomerTotals = useMemo(
    () => customerTotals.filter(matchFilters),
    [customerTotals, search, locationFilter, blockFilter]
  )

  const filteredPayments = useMemo(
    () => payments.filter(matchFilters),
    [payments, search, locationFilter, blockFilter]
  )

  const totals = useMemo(() => {
    return filteredCustomerTotals.reduce((acc, row) => {
      acc.totalBilled += toNum(row.total_billed)
      acc.received += toNum(row.received_amount)
      acc.outstanding += toNum(row.outstanding)
      return acc
    }, { totalBilled: 0, received: 0, outstanding: 0 })
  }, [filteredCustomerTotals])

  const handleAction = async (paymentId, action) => {
    setActionBusy(`${action}-${paymentId}`)
    try {
      await API.patch(`/payments/${paymentId}/${action}?token=${getToken()}`)
      await loadPayments(true)
    } finally {
      setActionBusy("")
    }
  }

  return (
    <Box sx={{ maxWidth: 1100, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} gap={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={1.2}>
          <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#0f766e,#14b8a6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PaymentsIcon sx={{ fontSize: 18, color: "white" }} />
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize={17} color={textPrimary} lineHeight={1.2}>Payments</Typography>
            <Typography fontSize={12} color={textSecondary}>Track received payments, outstanding balances, and proof attachments</Typography>
          </Box>
        </Box>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          variant="outlined"
          onClick={() => loadPayments(true)}
          disabled={refreshing}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          Refresh
        </Button>
      </Box>

      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <PaymentTile label="Total Amount" value={totals.totalBilled} color="#2563eb" bg={dark ? "#172554" : "#dbeafe"} dark={dark} />
        <PaymentTile label="Received Amount" value={totals.received} color="#16a34a" bg={dark ? "#14532d" : "#dcfce7"} dark={dark} />
        <PaymentTile label="Outstanding Amount" value={totals.outstanding} color="#ea580c" bg={dark ? "#431407" : "#ffedd5"} dark={dark} />
      </Box>

      <Paper elevation={0} sx={{ p: 1.5, mb: 2, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ xs: "stretch", md: "center" }}>
          <TextField
            size="small"
            placeholder="Search customer, phone or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: textSecondary }} /></InputAdornment>
            }}
            sx={{ flex: "1 1 240px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
          />

          <Select
            size="small"
            value={locationFilter}
            displayEmpty
            onChange={(e) => { setLocationFilter(e.target.value); setBlockFilter("") }}
            startAdornment={<InputAdornment position="start">{locationFilter === INDIVIDUAL_VALUE ? <HomeIcon fontSize="small" sx={{ color: textSecondary, ml: 0.5 }} /> : <ApartmentIcon fontSize="small" sx={{ color: textSecondary, ml: 0.5 }} />}</InputAdornment>}
            sx={{ minWidth: 170, borderRadius: 2, fontSize: 13 }}
          >
            <MenuItem value="">All Locations</MenuItem>
            <MenuItem value={INDIVIDUAL_VALUE}>Individual Houses</MenuItem>
            {apartments.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </Select>

          <Select
            size="small"
            value={blockFilter}
            displayEmpty
            disabled={!locationFilter || locationFilter === INDIVIDUAL_VALUE}
            onChange={(e) => setBlockFilter(e.target.value)}
            startAdornment={<InputAdornment position="start"><GridViewIcon fontSize="small" sx={{ color: textSecondary, ml: 0.5 }} /></InputAdornment>}
            sx={{ minWidth: 150, borderRadius: 2, fontSize: 13 }}
          >
            <MenuItem value="">All Blocks</MenuItem>
            {blocks.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
          </Select>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} mt={1.5} alignItems={{ xs: "stretch", md: "center" }}>
          <ToggleButtonGroup
            exclusive
            value={dateMode}
            onChange={(_, value) => value && setDateMode(value)}
            size="small"
            sx={{ flexWrap: "wrap" }}
          >
            <ToggleButton value="today">Today</ToggleButton>
            <ToggleButton value="month">This Month</ToggleButton>
            <ToggleButton value="custom">Custom</ToggleButton>
          </ToggleButtonGroup>
          {dateMode === "custom" && (
            <>
              <TextField
                size="small"
                type="date"
                label="From"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 160 }}
              />
              <TextField
                size="small"
                type="date"
                label="To"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 160 }}
              />
            </>
          )}
          <Chip
            icon={<CalendarTodayIcon />}
            label={dateMode === "month" ? monthRange.label : `${formatISTDate(fromDate)} - ${formatISTDate(toDate)}`}
            sx={{ borderRadius: 2, fontWeight: 600 }}
          />
        </Stack>
      </Paper>

      {loading ? (
        <Box py={10} textAlign="center"><CircularProgress size={26} /></Box>
      ) : (
        <Stack spacing={1.5}>
          {filteredPayments.length === 0 && (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
              <Typography fontWeight={700} color={textPrimary}>No payment history found</Typography>
              <Typography fontSize={13} color={textSecondary} mt={0.6}>
                Try changing the date range or location filters.
              </Typography>
            </Paper>
          )}

          {filteredPayments.map((payment) => {
            const status = statusChip(payment)
            const busyVerify = actionBusy === `verify-${payment.payment_id}`
            const busyRevoke = actionBusy === `revoke-${payment.payment_id}`
            return (
              <Paper key={payment.payment_id} elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} justifyContent="space-between">
                  <Box flex={1}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mb={0.8}>
                      <Typography fontWeight={800} color={textPrimary} fontSize={16}>Rs.{toNum(payment.amount).toFixed(0)}</Typography>
                      <Chip size="small" label={status.label} color={status.color} />
                      <Chip size="small" variant="outlined" label={payment.payment_method || "other"} />
                      <Typography fontSize={12} color={textSecondary}>
                        {formatISTDate(payment.payment_date)} · {formatISTDateTime(payment.created_at, { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                      </Typography>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
                      <Box>
                        <Typography fontWeight={700} color={textPrimary}><PersonIcon sx={{ fontSize: 15, verticalAlign: "-2px", mr: 0.4 }} />{payment.customer_name || "Customer"}</Typography>
                        <Typography fontSize={13} color={textSecondary}><PhoneIcon sx={{ fontSize: 14, verticalAlign: "-2px", mr: 0.4 }} />{payment.customer_phone}</Typography>
                        <Typography fontSize={13} color={textSecondary}>{payment.address || "Address not available"}</Typography>
                      </Box>
                      <Box>
                        {payment.period_from && payment.period_to && (
                          <Typography fontSize={13} color={textSecondary}>
                            Covers: <Box component="span" fontWeight={700} color={textPrimary}>{formatISTDate(payment.period_from)} - {formatISTDate(payment.period_to)}</Box>
                          </Typography>
                        )}
                        {!!payment.notes && (
                          <Typography fontSize={13} color={textSecondary} mt={0.5}>
                            Note: <Box component="span" color={textPrimary}>{payment.notes}</Box>
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>

                  <Stack spacing={1} alignItems={{ xs: "stretch", md: "flex-end" }} minWidth={{ md: 180 }}>
                    {payment.screenshot_url ? (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AttachFileIcon />}
                        onClick={() => setPreviewImage(payment.screenshot_url)}
                        sx={{ borderRadius: 2, textTransform: "none" }}
                      >
                        View Attachment
                      </Button>
                    ) : (
                      <Chip size="small" variant="outlined" label="No attachment" />
                    )}

                    <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                      {(!payment.is_verified || payment.is_revoked) && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircleIcon />}
                          disabled={busyVerify || busyRevoke}
                          onClick={() => handleAction(payment.payment_id, "verify")}
                          sx={{ borderRadius: 2, textTransform: "none", background: "#16a34a" }}
                        >
                          Accept
                        </Button>
                      )}
                      {!payment.is_revoked && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<BlockIcon />}
                          disabled={busyVerify || busyRevoke}
                          onClick={() => handleAction(payment.payment_id, "revoke")}
                          sx={{ borderRadius: 2, textTransform: "none" }}
                        >
                          Reject
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
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
          {previewImage ? (
            <Box component="img" src={previewImage} alt="Payment proof" sx={{ maxWidth: "100%", maxHeight: "75vh", borderRadius: 2 }} />
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
