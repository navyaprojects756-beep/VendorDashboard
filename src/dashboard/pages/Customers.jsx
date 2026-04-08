import { useEffect, useMemo, useState } from "react"
import API, { getToken } from "../../services/api"
import Toast from "../../components/Toast"
import { formatISTDate, getISTDate, toISTDateStr } from "../../utils/istDate"

import {
  Box, Typography, Paper, Chip, TextField, Select, MenuItem,
  InputAdornment, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Divider, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton, Tooltip,
} from "@mui/material"

import SearchIcon               from "@mui/icons-material/Search"
import ApartmentIcon            from "@mui/icons-material/Apartment"
import HomeIcon                 from "@mui/icons-material/Home"
import GridViewIcon             from "@mui/icons-material/GridView"
import PeopleIcon               from "@mui/icons-material/People"
import ReceiptLongIcon          from "@mui/icons-material/ReceiptLong"
import DownloadIcon             from "@mui/icons-material/Download"
import LocationOnIcon           from "@mui/icons-material/LocationOn"
import CloseIcon                from "@mui/icons-material/Close"
import RefreshIcon              from "@mui/icons-material/Refresh"
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import DeleteOutlineIcon        from "@mui/icons-material/DeleteOutline"
import AttachFileIcon           from "@mui/icons-material/AttachFile"
import CheckIcon                from "@mui/icons-material/Check"
import BlockIcon                from "@mui/icons-material/Block"
import CalendarTodayIcon        from "@mui/icons-material/CalendarToday"

/* â”€â”€ date helpers â”€â”€ */
const toDateStr = (d) => {
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, "0")
  const dy = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dy}`
}
const getThisMonth = () => {
  const now = getISTDate(0)
  return {
    from:  toDateStr(new Date(now.getFullYear(), now.getMonth(), 1)),
    to:    toDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    label: formatISTDate(toISTDateStr(new Date(now.getFullYear(), now.getMonth(), 1)), { month: "long", year: "numeric" }),
  }
}
const getLastMonth = () => {
  const now = getISTDate(0)
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return {
    from:  toDateStr(start),
    to:    toDateStr(new Date(now.getFullYear(), now.getMonth(), 0)),
    label: formatISTDate(toISTDateStr(start), { month: "long", year: "numeric" }),
  }
}
const fmtDate = (str) => formatISTDate(str)
const INDIVIDUAL_VALUE = "__individual__"

const toNum = (value) => Number.parseFloat(value || 0) || 0
const getOrderDelivery = (order) => {
  const direct = toNum(order?.delivery_charge_amount)
  if (direct > 0) return direct
  return (order?.items || []).reduce((sum, item) => sum + toNum(item.delivery_charge_at_order), 0)
}
const getOrderTotal = (order, rate) => {
  const items = order?.items || []
  const itemTotal = items.length > 0
    ? items.reduce((sum, item) => sum + (toNum(item.quantity) * toNum(item.price_at_order)), 0)
    : (toNum(order?.quantity) * toNum(rate))
  return itemTotal + getOrderDelivery(order)
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function Customers({ dark }) {
  const [customers,  setCustomers]  = useState([])
  const [filtered,   setFiltered]   = useState([])
  const [loading,    setLoading]    = useState(true)

  const [search,     setSearch]     = useState("")
  const [aptFilter,  setAptFilter]  = useState("")
  const [blockFilter, setBlockFilter] = useState("")
  const [apartments, setApartments] = useState([])

  /* bill period: "all" | "this" | "last" */
  const initialMonth = getThisMonth()
  const [period, setPeriod] = useState("all")
  const [fromDate, setFromDate] = useState(initialMonth.from)
  const [toDate, setToDate] = useState(initialMonth.to)
  const range = useMemo(() => {
    if (period === "all") return { from: "", to: "", label: "All" }
    if (period === "last") return getLastMonth()
    if (period === "custom") return { from: fromDate, to: toDate, label: "Custom" }
    return getThisMonth()
  }, [period, fromDate, toDate])

  /* individual invoice dialog */
  const [dialogOpen,  setDialogOpen]  = useState(false)
  const [selCustomer, setSelCustomer] = useState(null)
  const [invoiceData, setInvoiceData] = useState(null)
  const [invLoading,  setInvLoading]  = useState(false)

  /* per-customer download */
  const [downloadingCustomer, setDownloadingCustomer] = useState(null)
  const [toast, setToast] = useState({ open: false, message: "", type: "success" })

  /* payment dialog */
  const [payDialogOpen, setPayDialogOpen] = useState(false)
  const [payCustomer,   setPayCustomer]   = useState(null)
  const [payData,       setPayData]       = useState(null)
  const [payLoading,    setPayLoading]    = useState(false)
  const [payAmount,     setPayAmount]     = useState("")
  const [payMethod,     setPayMethod]     = useState("cash")
  const [payNotes,      setPayNotes]      = useState("")
  const [payScreenshot, setPayScreenshot] = useState(null)
  const [paySubmitting, setPaySubmitting] = useState(false)
  const [payUploading,  setPayUploading]  = useState(false)

  /* theme */
  const border        = dark ? "#1e293b" : "#e5e7eb"
  const bg            = dark ? "#0f172a" : "#ffffff"
  const bgCard        = dark ? "#111827" : "#f9fafb"
  const textPrimary   = dark ? "#f1f5f9" : "#111827"
  const textSecondary = dark ? "#94a3b8" : "#6b7280"

  /* â”€â”€ load customers â”€â”€ */
  useEffect(() => {
    API.get(`/customers?token=${getToken()}`)
      .then((r) => {
        setCustomers(r.data)
        setApartments([...new Set(r.data.map((c) => c.apartment_name).filter(Boolean))])
      })
      .finally(() => setLoading(false))
  }, [])

  /* â”€â”€ filter â”€â”€ */
  useEffect(() => {
    let data = [...customers]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter((c) =>
        c.phone.includes(search) ||
        (c.customer_name || "").toLowerCase().includes(q) ||
        (c.address || "").toLowerCase().includes(q)
      )
    }
    if (aptFilter === INDIVIDUAL_VALUE) data = data.filter((c) => c.address_type !== "apartment")
    else if (aptFilter) data = data.filter((c) => c.apartment_name === aptFilter)
    if (blockFilter) data = data.filter((c) => c.block_name === blockFilter)
    setFiltered(data)
  }, [search, aptFilter, blockFilter, customers])

  const blocks = aptFilter && aptFilter !== INDIVIDUAL_VALUE
    ? [...new Set(customers.filter((c) => c.apartment_name === aptFilter).map((c) => c.block_name).filter(Boolean))]
    : []

  /* â”€â”€ invoice dialog â”€â”€ */
  const fetchInvoice = async (customerId) => {
    setInvLoading(true); setInvoiceData(null)
    try {
      const r = await API.get(`/customers/${customerId}/invoice?token=${getToken()}&from=${range.from}&to=${range.to}`)
      setInvoiceData(r.data)
    } finally { setInvLoading(false) }
  }

  const openInvoice = (customer) => {
    setSelCustomer(customer); setDialogOpen(true)
    fetchInvoice(customer.customer_id)
  }

  /* â”€â”€ PDF download â”€â”€ */
  const downloadPDF = async (customerId, phone) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/customers/${customerId}/invoice/pdf?token=${getToken()}&from=${range.from}&to=${range.to}`
    const res = await fetch(url)
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Download failed") }
    const blob = await res.blob()
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `bill_${phone}_${range.from}_${range.to}.pdf`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const downloadCustomerInvoice = async (customer) => {
    setDownloadingCustomer(customer.customer_id)
    try { await downloadPDF(customer.customer_id, customer.phone) }
    catch (err) { setToast({ open: true, message: err.message, type: "error" }) }
    finally { setDownloadingCustomer(null) }
  }

  const downloadSinglePDF = async () => {
    if (!invoiceData) return
    try { await downloadPDF(invoiceData.customer.customer_id, invoiceData.customer.phone) }
    catch (err) { setToast({ open: true, message: err.message, type: "error" }) }
  }

  /* â”€â”€ payment helpers â”€â”€ */
  const fetchPayments = async (customerId) => {
    setPayLoading(true); setPayData(null)
    try {
      const r = await API.get(`/payments/${customerId}?token=${getToken()}`)
      setPayData(r.data)
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.message || "Failed to load payments", type: "error" })
    } finally { setPayLoading(false) }
  }

  const openPayDialog = (customer) => {
    setPayCustomer(customer)
    setPayAmount(""); setPayMethod("cash"); setPayNotes(""); setPayScreenshot(null)
    setPayDialogOpen(true)
    fetchPayments(customer.customer_id)
  }

  const submitPayment = async () => {
    if (!payAmount || isNaN(parseFloat(payAmount))) {
      setToast({ open: true, message: "Enter a valid amount", type: "error" }); return
    }
    setPaySubmitting(true)
    try {
      let screenshotUrl = null
      if (payScreenshot) {
        setPayUploading(true)
        const fd = new FormData()
        fd.append("screenshot", payScreenshot)
        const upRes = await API.post(`/upload-payment-screenshot?token=${getToken()}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        screenshotUrl = upRes.data.screenshot_url
        setPayUploading(false)
      }
      await API.post(`/payments?token=${getToken()}`, {
        customer_id:    payCustomer.customer_id,
        amount:         parseFloat(payAmount),
        payment_method: payMethod,
        notes:          payNotes || undefined,
        screenshot_url: screenshotUrl || undefined,
        period_from:    range.from,
        period_to:      range.to,
      })
      setToast({ open: true, message: "Payment recorded!", type: "success" })
      setPayAmount(""); setPayNotes(""); setPayScreenshot(null)
      fetchPayments(payCustomer.customer_id)
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.message || "Failed to record payment", type: "error" })
    } finally { setPaySubmitting(false); setPayUploading(false) }
  }

  const deletePayment = async (paymentId) => {
    try {
      await API.delete(`/payments/${paymentId}?token=${getToken()}`)
      fetchPayments(payCustomer.customer_id)
    } catch {
      setToast({ open: true, message: "Failed to delete payment", type: "error" })
    }
  }

  const verifyPayment = async (paymentId) => {
    try {
      await API.patch(`/payments/${paymentId}/verify?token=${getToken()}`)
      setToast({ open: true, message: "Payment verified!", type: "success" })
      fetchPayments(payCustomer.customer_id)
    } catch {
      setToast({ open: true, message: "Failed to verify payment", type: "error" })
    }
  }

  const revokePayment = async (paymentId) => {
    try {
      await API.patch(`/payments/${paymentId}/revoke?token=${getToken()}`)
      setToast({ open: true, message: "Payment revoked - orders reset to unpaid.", type: "success" })
      fetchPayments(payCustomer.customer_id)
    } catch {
      setToast({ open: true, message: "Failed to revoke payment", type: "error" })
    }
  }

  /* â”€â”€ stats â”€â”€ */
  const activeCount = customers.filter((c) => c.subscription_status === "active").length

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ RENDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  return (
    <Box sx={{ maxWidth: 780, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>

      <Paper elevation={0} sx={{ px: 1.5, py: 1.2, mb: 2, borderRadius: 4, border: `1px solid ${border}`, background: "linear-gradient(135deg, #ffffff 0%, #f7fbff 60%, #fffaf0 100%)", boxShadow: "0 10px 28px rgba(15,23,42,0.04)" }}>
        <Box display="flex" alignItems="center" gap={0.8} mb={1.1}>
          <CalendarTodayIcon sx={{ fontSize: 17, color: "#64748b" }} />
          <Typography fontSize={13} fontWeight={800} color="#334155">Filters</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <TextField size="small" placeholder="Search name, phone or address..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: textSecondary }} /></InputAdornment> }}
            sx={{ flex: "1 1 170px", "& .MuiOutlinedInput-root": { borderRadius: 3, fontSize: 13, background: "#f8fafc" } }} />
          <Select size="small" value={aptFilter} displayEmpty
            onChange={(e) => { setAptFilter(e.target.value); setBlockFilter("") }}
            startAdornment={<InputAdornment position="start">{aptFilter === INDIVIDUAL_VALUE ? <HomeIcon fontSize="small" sx={{ color: textSecondary, ml: 0.5 }} /> : <ApartmentIcon fontSize="small" sx={{ color: textSecondary, ml: 0.5 }} />}</InputAdornment>}
            sx={{ flex: "1 1 150px", borderRadius: 3, fontSize: 13, background: "#f8fafc" }}>
            <MenuItem value="">All Locations</MenuItem>
            <MenuItem value={INDIVIDUAL_VALUE}>Individual Houses</MenuItem>
            {apartments.map((a) => <MenuItem key={a} value={a} sx={{ fontSize: 13 }}>{a}</MenuItem>)}
          </Select>
          <Select size="small" value={blockFilter} displayEmpty
            disabled={!aptFilter || aptFilter === INDIVIDUAL_VALUE}
            onChange={(e) => setBlockFilter(e.target.value)}
            startAdornment={<InputAdornment position="start"><GridViewIcon fontSize="small" sx={{ color: textSecondary, ml: 0.5 }} /></InputAdornment>}
            sx={{ flex: "1 1 130px", borderRadius: 3, fontSize: 13, background: "#f8fafc" }}>
            <MenuItem value="">All Blocks</MenuItem>
            {blocks.map((b) => <MenuItem key={b} value={b} sx={{ fontSize: 13 }}>{b}</MenuItem>)}
          </Select>
        </Box>
        <Box mt={1.1} sx={{ border: "1px solid #e2e8f0", borderRadius: 3, px: 1, py: 1, background: "#fffdf8" }}>
          <Typography fontSize={11.5} fontWeight={700} color="#64748b" px={0.2} mb={0.7}>
            Filter for bill
          </Typography>
          <Box display="flex" gap={0.8} flexWrap="wrap">
              {[{ key: "all", label: "All" }, { key: "this", label: "This Month" }, { key: "last", label: "Last Month" }, { key: "custom", label: "Custom" }].map((p) => (
                <Box key={p.key}
                  onClick={() => setPeriod(p.key)}
                  sx={{
                    px: 1.4, py: 0.7, borderRadius: 2.5, cursor: "pointer", fontSize: 12, fontWeight: 700,
                    border: `1px solid ${period === p.key ? "#1d4ed8" : "#d7e0ea"}`,
                    background: period === p.key ? "#1d4ed8" : "#fff",
                    color: period === p.key ? "#fff" : "#475569",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                  }}>
                  {p.label}
                </Box>
              ))}
          </Box>
        </Box>
        {period === "custom" ? (
          <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
            <TextField
              type="date"
              size="small"
              label="From"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: "1 1 170px", "& .MuiOutlinedInput-root": { borderRadius: 3, background: "#f8fafc" } }}
            />
            <TextField
              type="date"
              size="small"
              label="To"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              inputProps={{ min: fromDate }}
              InputLabelProps={{ shrink: true }}
              sx={{ flex: "1 1 170px", "& .MuiOutlinedInput-root": { borderRadius: 3, background: "#f8fafc" } }}
            />
          </Box>
        ) : null}
        <Typography fontSize={11.5} color={textSecondary} mt={1} px={0.5}>
          Bill period: <Box component="span" fontWeight={700} color={textPrimary}>{period === "all" ? "All" : `${range.label} | ${fmtDate(range.from)} to ${fmtDate(range.to)}`}</Box>
        </Typography>
      </Paper>

      {/* Page header */}
      <Box display="flex" alignItems="center" gap={1.2} mb={3}>
        <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PeopleIcon sx={{ fontSize: 18, color: "white" }} />
        </Box>
        <Box>
          <Typography fontWeight={700} fontSize={17} color={textPrimary} lineHeight={1.2}>Customers</Typography>
          <Typography fontSize={12} color={textSecondary}>View customers and manage bills</Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        {[
          { label: "Total",    value: customers.length,               color: "#2563eb", bg: dark ? "#1e3a5f" : "#eff6ff" },
          { label: "Active",   value: activeCount,                    color: "#16a34a", bg: dark ? "#14532d" : "#f0fdf4" },
          { label: "Inactive", value: customers.length - activeCount, color: "#f97316", bg: dark ? "#431407" : "#fff7ed" },
        ].map((s) => (
          <Paper key={s.label} elevation={0} sx={{ flex: "1 1 100px", p: 1.5, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
            <Typography fontSize={11} color={textSecondary}>{s.label}</Typography>
            <Typography fontWeight={800} fontSize={24} color={s.color} lineHeight={1.1}>{s.value}</Typography>
          </Paper>
        ))}
      </Box>
      <Typography fontSize={13} color={textSecondary} mb={1} px={0.5}>
        {filtered.length} customer{filtered.length !== 1 ? "s" : ""}{aptFilter ? ` - ${aptFilter === INDIVIDUAL_VALUE ? "Individual Houses" : aptFilter}` : ""}{blockFilter ? ` - ${blockFilter}` : ""}
      </Typography>
      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${border}`, overflow: "hidden", background: bg }}>
        {loading && <Box py={8} textAlign="center"><CircularProgress size={24} sx={{ color: "#2563eb" }} /></Box>}
        {!loading && filtered.length === 0 && (
          <Box py={7} textAlign="center">
            <PeopleIcon sx={{ fontSize: 36, color: border, mb: 1, display: "block", mx: "auto" }} />
            <Typography color={textSecondary} fontSize={14}>No customers found.</Typography>
          </Box>
        )}

        {!loading && filtered.map((c, i) => {
          const isActive    = c.subscription_status === "active"
          const isDlLoading = downloadingCustomer === c.customer_id

          return (
            <Box key={c.customer_id}>
              <Box sx={{ px: 2, py: 1.8, display: "flex", alignItems: "center", gap: 2, "&:hover": { background: bgCard }, transition: "background 0.15s" }}>

                {/* LEFT */}
                <Box flex={1} minWidth={0}>
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={0.4}>
                    <Typography fontWeight={700} fontSize={14} color={textPrimary} sx={{ wordBreak: "break-all" }}>
                      {c.phone}
                    </Typography>
                    {c.customer_name && (
                      <Typography fontWeight={700} fontSize={14} color={textPrimary}>
                        {c.customer_name}
                      </Typography>
                    )}
                    <Chip label={isActive ? "Active" : "Inactive"} size="small"
                      sx={{
                        fontSize: 10, fontWeight: 700, height: 18, flexShrink: 0,
                        background: isActive ? (dark ? "#14532d" : "#dcfce7") : (dark ? "#450a0a" : "#fee2e2"),
                        color: isActive ? "#16a34a" : "#dc2626",
                      }} />
                  </Box>
                  {c.address && (
                    <Box display="flex" alignItems="center" gap={0.4}>
                      <LocationOnIcon sx={{ fontSize: 12, color: textSecondary, flexShrink: 0 }} />
                      <Typography fontSize={12} color={textSecondary}
                        sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>
                        {c.address}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* RIGHT â€” icon buttons only */}
                <Box display="flex" alignItems="center" gap={0.6} flexShrink={0}>
                  {/* Download PDF */}
                  <Tooltip title="Download bill PDF" arrow>
                    <span>
                      <IconButton size="small" onClick={() => downloadCustomerInvoice(c)} disabled={isDlLoading}
                        sx={{ border: `1px solid ${border}`, borderRadius: "7px", p: 0.6, color: textSecondary,
                          "&:hover": { borderColor: "#7c3aed", color: "#7c3aed", background: dark ? "#2e1065" : "#faf5ff" } }}>
                        {isDlLoading
                          ? <CircularProgress size={14} sx={{ color: "#7c3aed" }} />
                          : <DownloadIcon sx={{ fontSize: 16 }} />}
                      </IconButton>
                    </span>
                  </Tooltip>

                  {/* Bill details */}
                  <Tooltip title="View bill details" arrow>
                    <IconButton size="small" onClick={() => openInvoice(c)}
                      sx={{ border: `1px solid ${border}`, borderRadius: "7px", p: 0.6, color: textSecondary,
                        "&:hover": { borderColor: "#7c3aed", color: "#7c3aed", background: dark ? "#2e1065" : "#faf5ff" } }}>
                      <ReceiptLongIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>

                  {/* Payment details */}
                  <Tooltip title="Payment details" arrow>
                    <IconButton size="small" onClick={() => openPayDialog(c)}
                      sx={{ border: `1px solid ${border}`, borderRadius: "7px", p: 0.6, color: textSecondary,
                        "&:hover": { borderColor: "#16a34a", color: "#16a34a", background: dark ? "#14532d" : "#f0fdf4" } }}>
                      <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              {i < filtered.length - 1 && <Divider sx={{ borderColor: border }} />}
            </Box>
          )
        })}
      </Paper>

      {/* â•â•â• BILL DETAILS DIALOG â•â•â• */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, background: bg } }}>

        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography fontWeight={700} fontSize={15} color={textPrimary}>Bill - {selCustomer?.phone}</Typography>
            {selCustomer?.address && <Typography fontSize={11.5} color={textSecondary}>{selCustomer.address}</Typography>}
          </Box>
          <IconButton size="small" onClick={() => setDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: border }}>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={2}>
            <Box sx={{ px: 1.5, py: 0.4, borderRadius: 2, background: bgCard, border: `1px solid ${border}` }}>
              <Typography fontSize={12} fontWeight={700} color={textPrimary}>{range.label} | {fmtDate(range.from)} to {fmtDate(range.to)}</Typography>
            </Box>
            <IconButton size="small" onClick={() => fetchInvoice(selCustomer?.customer_id)}
              sx={{ border: `1px solid ${border}`, borderRadius: "7px", p: 0.5, color: textSecondary }}>
              <RefreshIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>

          {invLoading && <Box py={6} textAlign="center"><CircularProgress size={24} sx={{ color: "#2563eb" }} /></Box>}

          {!invLoading && invoiceData && (() => {
            const { orders, price_per_unit } = invoiceData
            const delivered  = orders.filter((o) => o.is_delivered)
            const rate       = Number(price_per_unit)
            const hasItems   = delivered.some(o => o.items && o.items.length > 0)

            // Compute totals
            const totalAmt = delivered.reduce((sum, o) => sum + getOrderTotal(o, rate), 0)

            const unpaidDelivered = delivered.filter(o => o.payment_status !== "paid")
            const unpaidAmt = unpaidDelivered.reduce((sum, o) => sum + getOrderTotal(o, rate), 0)

            const headerCell = { fontWeight: 700, fontSize: 11, color: "white", borderColor: "#1d4ed8", py: 1, px: 1, background: "#2563eb" }
            const cell = (extra={}) => ({ fontSize: 12, color: textPrimary, borderColor: border, py: 0.8, px: 1, ...extra })

            return (
              <>
                {/* â”€â”€ Summary chips â”€â”€ */}
                <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                  {[
                    { label: `${delivered.length} deliveries`, color: "#2563eb", bg: dark ? "#1e3a5f" : "#eff6ff" },
                    { label: `Rs.${totalAmt.toFixed(2)} total`,  color: "#16a34a", bg: dark ? "#14532d" : "#f0fdf4" },
                    unpaidAmt > 0
                      ? { label: `Rs.${unpaidAmt.toFixed(2)} due`, color: "#dc2626", bg: dark ? "#450a0a" : "#fee2e2" }
                      : { label: "Fully Paid", color: "#16a34a", bg: dark ? "#14532d" : "#f0fdf4" },
                  ].map((s) => (
                    <Box key={s.label} sx={{ px: 1.5, py: 0.5, borderRadius: 2, background: s.bg }}>
                      <Typography fontSize={12} fontWeight={700} color={s.color}>{s.label}</Typography>
                    </Box>
                  ))}
                </Box>

                {delivered.length === 0 ? (
                  <Box py={4} textAlign="center">
                    <Typography color={textSecondary} fontSize={13}>No delivered orders in this period.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={headerCell}>Date</TableCell>
                          {hasItems ? (
                            <>
                              <TableCell sx={headerCell}>Product</TableCell>
                              <TableCell sx={{ ...headerCell, textAlign: "center" }}>Type</TableCell>
                              <TableCell sx={{ ...headerCell, textAlign: "center" }}>Qty</TableCell>
                              <TableCell sx={{ ...headerCell, textAlign: "right" }}>Price</TableCell>
                              <TableCell sx={{ ...headerCell, textAlign: "right" }}>Del.</TableCell>
                              <TableCell sx={{ ...headerCell, textAlign: "right" }}>Amount</TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell sx={{ ...headerCell, textAlign: "center" }}>Qty</TableCell>
                              <TableCell sx={{ ...headerCell, textAlign: "right" }}>Rate</TableCell>
                              <TableCell sx={{ ...headerCell, textAlign: "right" }}>Amount</TableCell>
                            </>
                          )}
                          <TableCell sx={headerCell}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {delivered.map((o, oi) => {
                          const isPaid   = o.payment_status === "paid"
                          const items    = o.items || []
                          const rowBg    = isPaid ? (dark ? "#0a1f0f" : "#f0fdf4") : "inherit"
                          const dateStr  = fmtDate(String(o.order_date).slice(0, 10))

                          if (hasItems && items.length > 0) {
                            return items.map((it, ii) => {
                              const isAdhoc = it.order_type === "adhoc"
                              const dc      = ii === 0 ? getOrderDelivery(o) : 0
                              const amt     = (it.quantity * parseFloat(it.price_at_order)) + dc
                              return (
                                <TableRow key={`${oi}-${ii}`} sx={{ background: isAdhoc ? (dark ? "#1c1500" : "#fefce8") : rowBg, "&:hover": { filter: "brightness(0.97)" } }}>
                                  <TableCell sx={cell({ fontWeight: 600 })}>{ii === 0 ? dateStr : ""}</TableCell>
                                  <TableCell sx={cell()}>
                                    {it.product_name}
                                    {it.unit && <Box component="span" fontSize={10} color={textSecondary} ml={0.4}>({it.unit})</Box>}
                                  </TableCell>
                                  <TableCell sx={cell({ textAlign: "center" })}>
                                    <Chip label={isAdhoc ? "Adhoc" : "Sub"} size="small"
                                      sx={{ fontSize: 9, fontWeight: 700, height: 16, px: 0.2,
                                        background: isAdhoc ? "#fbbf24" : "#bae6fd",
                                        color: isAdhoc ? "#78350f" : "#0369a1" }} />
                                  </TableCell>
                                  <TableCell sx={cell({ textAlign: "center", fontWeight: 600 })}>{it.quantity}</TableCell>
                                  <TableCell sx={cell({ textAlign: "right", color: textSecondary })}>Rs.{parseFloat(it.price_at_order).toFixed(2)}</TableCell>
                                  <TableCell sx={cell({ textAlign: "right", color: textSecondary })}>{dc > 0 ? `Rs.${dc.toFixed(2)}` : "-"}</TableCell>
                                  <TableCell sx={cell({ textAlign: "right", fontWeight: 700, color: "#2563eb" })}>Rs.{amt.toFixed(2)}</TableCell>
                                  <TableCell sx={cell()}>
                                    {ii === 0 && (
                                      <Chip label={isPaid ? "Paid" : "Unpaid"} size="small"
                                        sx={{ fontSize: 10, fontWeight: 700, height: 18,
                                          background: isPaid ? (dark ? "#14532d" : "#dcfce7") : (dark ? "#450a0a" : "#fee2e2"),
                                          color: isPaid ? "#16a34a" : "#dc2626" }} />
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          }

                          // Legacy row (no items)
                          const amt = getOrderTotal(o, rate)
                          return (
                            <TableRow key={oi} sx={{ background: rowBg, "&:hover": { background: bgCard } }}>
                              <TableCell sx={cell({ fontWeight: 600 })}>{dateStr}</TableCell>
                              <TableCell sx={cell({ textAlign: "center" })}>{o.quantity}</TableCell>
                              <TableCell sx={cell({ textAlign: "right", color: textSecondary })}>Rs.{rate.toFixed(2)}</TableCell>
                              <TableCell sx={cell({ textAlign: "right", fontWeight: 700, color: "#2563eb" })}>Rs.{amt.toFixed(2)}</TableCell>
                              <TableCell sx={cell()}>
                                <Chip label={isPaid ? "Paid" : "Unpaid"} size="small"
                                  sx={{ fontSize: 10, fontWeight: 700, height: 18,
                                    background: isPaid ? (dark ? "#14532d" : "#dcfce7") : (dark ? "#450a0a" : "#fee2e2"),
                                    color: isPaid ? "#16a34a" : "#dc2626" }} />
                              </TableCell>
                            </TableRow>
                          )
                        })}

                        {/* Total row */}
                        <TableRow sx={{ background: dark ? "#1e293b" : "#f8fafc", borderTop: "2px solid #2563eb" }}>
                          <TableCell colSpan={hasItems ? 6 : 3}
                            sx={{ fontWeight: 800, fontSize: 13, color: textPrimary, borderColor: border, py: 1, px: 1 }}>
                            Total
                          </TableCell>
                          <TableCell sx={{ fontWeight: 800, fontSize: 14, color: "#16a34a", borderColor: border, textAlign: "right", py: 1, px: 1 }}>
                            Rs.{totalAmt.toFixed(2)}
                          </TableCell>
                          <TableCell sx={{ borderColor: border }} />
                        </TableRow>

                        {/* Outstanding row */}
                        {unpaidAmt > 0 && unpaidAmt < totalAmt && (
                          <TableRow sx={{ background: dark ? "#2d0a0a" : "#fff5f5" }}>
                            <TableCell colSpan={hasItems ? 6 : 3}
                              sx={{ fontWeight: 700, fontSize: 12, color: "#dc2626", borderColor: border, py: 0.8, px: 1 }}>
                              Outstanding (Unpaid)
                            </TableCell>
                            <TableCell sx={{ fontWeight: 800, fontSize: 13, color: "#dc2626", borderColor: border, textAlign: "right", py: 0.8, px: 1 }}>
                              Rs.{unpaidAmt.toFixed(2)}
                            </TableCell>
                            <TableCell sx={{ borderColor: border }} />
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </>
            )
          })()}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: "none", color: textSecondary }}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon fontSize="small" />}
            disabled={!invoiceData || invLoading || invoiceData?.orders?.filter((o) => o.is_delivered).length === 0}
            onClick={downloadSinglePDF}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px", background: "#7c3aed", "&:hover": { background: "#6d28d9" } }}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* â•â•â• PAYMENTS DIALOG â•â•â• */}
      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, background: bg } }}>

        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography fontWeight={700} fontSize={15} color={textPrimary}>Payments - {payCustomer?.phone}</Typography>
            {payCustomer?.address && <Typography fontSize={11.5} color={textSecondary}>{payCustomer.address}</Typography>}
          </Box>
          <IconButton size="small" onClick={() => setPayDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: border }}>

          {/* Balance summary */}
          {payData && (
            <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
              {[
                { label: "Total Billed", value: `Rs.${Number(payData.totalBilled).toFixed(2)}`,  color: "#2563eb", bg: dark ? "#1e3a5f" : "#eff6ff" },
                { label: "Total Paid",   value: `Rs.${Number(payData.totalPaid).toFixed(2)}`,    color: "#16a34a", bg: dark ? "#14532d" : "#f0fdf4" },
                { label: "Outstanding",  value: `Rs.${Number(payData.outstanding).toFixed(2)}`,  color: payData.outstanding > 0 ? "#dc2626" : "#16a34a", bg: payData.outstanding > 0 ? (dark ? "#450a0a" : "#fee2e2") : (dark ? "#14532d" : "#f0fdf4") },
              ].map((s) => (
                <Box key={s.label} sx={{ flex: "1 1 100px", px: 1.5, py: 0.8, borderRadius: 2, background: s.bg }}>
                  <Typography fontSize={10} color={textSecondary}>{s.label}</Typography>
                  <Typography fontSize={14} fontWeight={800} color={s.color}>{s.value}</Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Mark Paid form */}
          <Box sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${border}`, background: bgCard, mb: 2 }}>
            <Typography fontWeight={700} fontSize={13} color={textPrimary} mb={1.5}>Mark Payment</Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
              <TextField size="small" label="Amount (Rs.)" type="number" value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                sx={{ flex: "1 1 100px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              <Select size="small" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                sx={{ flex: "1 1 110px", borderRadius: 2, fontSize: 13 }}>
                <MenuItem value="cash" sx={{ fontSize: 13 }}>Cash</MenuItem>
                <MenuItem value="phonePe" sx={{ fontSize: 13 }}>PhonePe</MenuItem>
                <MenuItem value="upi" sx={{ fontSize: 13 }}>UPI</MenuItem>
                <MenuItem value="other" sx={{ fontSize: 13 }}>Other</MenuItem>
              </Select>
            </Box>
            <TextField size="small" label="Notes (optional)" value={payNotes}
              onChange={(e) => setPayNotes(e.target.value)} fullWidth multiline rows={1}
              sx={{ mb: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <Button component="label" size="small" variant="outlined"
                startIcon={<AttachFileIcon fontSize="small" />}
                sx={{ textTransform: "none", fontSize: 12, borderRadius: "7px", borderColor: border, color: textSecondary }}>
                {payScreenshot ? payScreenshot.name : "Attach Screenshot"}
                <input type="file" hidden accept="image/*" onChange={(e) => setPayScreenshot(e.target.files[0] || null)} />
              </Button>
              {payScreenshot && (
                <IconButton size="small" onClick={() => setPayScreenshot(null)} sx={{ p: 0.3 }}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>
            <Button variant="contained" fullWidth disabled={paySubmitting || !payAmount} onClick={submitPayment}
              startIcon={paySubmitting ? <CircularProgress size={14} color="inherit" /> : <AccountBalanceWalletIcon fontSize="small" />}
              sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, borderRadius: "8px", background: "#16a34a", "&:hover": { background: "#15803d" } }}>
              {payUploading ? "Uploading..." : paySubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </Box>

          {/* Payment history */}
          <Typography fontWeight={700} fontSize={13} color={textPrimary} mb={1}>Payment History</Typography>
          {payLoading && <Box py={4} textAlign="center"><CircularProgress size={22} sx={{ color: "#16a34a" }} /></Box>}
          {!payLoading && payData?.payments?.length === 0 && (
            <Box py={3} textAlign="center">
              <Typography fontSize={13} color={textSecondary}>No payments recorded yet.</Typography>
            </Box>
          )}
          {!payLoading && payData?.payments?.length > 0 && (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: bgCard }}>
                    {["Date", "Amount", "Method", "Status", "Notes", "Actions"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, color: textSecondary, borderColor: border }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payData.payments.map((p) => {
                    const ml = { cash: "Cash", phonePe: "PhonePe", upi: "UPI", other: "Other" }[p.payment_method] || p.payment_method
                    const isRevoked  = p.is_revoked
                    const isVerified = p.is_verified && !p.is_revoked
                    const isPending  = !p.is_verified && !p.is_revoked
                    return (
                      <TableRow key={p.payment_id}
                        sx={{ background: isRevoked ? (dark ? "#1a0a0a" : "#fff5f5") : isVerified ? (dark ? "#0f2d1a" : "#f0fdf4") : "inherit", "&:hover": { background: bgCard } }}>
                        <TableCell sx={{ fontSize: 12, color: textPrimary, borderColor: border }}>{fmtDate(String(p.payment_date).slice(0, 10))}</TableCell>
                        <TableCell sx={{ fontSize: 12, fontWeight: 700, color: isRevoked ? "#ef4444" : "#16a34a", borderColor: border, textDecoration: isRevoked ? "line-through" : "none" }}>
                          Rs.{Number(p.amount).toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, color: textPrimary, borderColor: border }}>{ml}</TableCell>
                        <TableCell sx={{ fontSize: 11, borderColor: border }}>
                          <Chip label={isRevoked ? "Revoked" : isVerified ? "Verified" : p.recorded_by === "customer" ? "Customer" : "Vendor"}
                            size="small"
                            sx={{ fontSize: 10, height: 16, fontWeight: 600,
                              background: isRevoked  ? (dark ? "#450a0a" : "#fee2e2") :
                                          isVerified ? (dark ? "#14532d" : "#dcfce7") :
                                          p.recorded_by === "customer" ? (dark ? "#1e3a5f" : "#eff6ff") : (dark ? "#14532d" : "#f0fdf4"),
                              color: isRevoked ? "#dc2626" : isVerified ? "#16a34a" : p.recorded_by === "customer" ? "#2563eb" : "#16a34a" }} />
                        </TableCell>
                        <TableCell sx={{ fontSize: 11, color: textSecondary, borderColor: border, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.notes || "-"}
                        </TableCell>
                        <TableCell sx={{ borderColor: border, p: 0.5, whiteSpace: "nowrap" }}>
                          {p.screenshot_url && (
                            <Tooltip title="View screenshot" arrow>
                              <IconButton size="small" component="a" href={p.screenshot_url} target="_blank" rel="noopener"
                                sx={{ p: 0.3, color: textSecondary }}>
                                <AttachFileIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {isPending && (
                            <Tooltip title="Verify payment" arrow>
                              <IconButton size="small" onClick={() => verifyPayment(p.payment_id)}
                                sx={{ p: 0.3, color: "#16a34a", "&:hover": { background: dark ? "#14532d" : "#f0fdf4" } }}>
                                <CheckIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {!isRevoked && (
                            <Tooltip title="Revoke - reset orders to unpaid" arrow>
                              <IconButton size="small" onClick={() => revokePayment(p.payment_id)}
                                sx={{ p: 0.3, color: "#f97316", "&:hover": { background: dark ? "#431407" : "#fff7ed" } }}>
                                <BlockIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete payment" arrow>
                            <IconButton size="small" onClick={() => deletePayment(p.payment_id)}
                              sx={{ p: 0.3, color: "#ef4444", "&:hover": { background: dark ? "#450a0a" : "#fee2e2" } }}>
                              <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setPayDialogOpen(false)} sx={{ textTransform: "none", color: textSecondary }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Toast
        open={toast.open}
        setOpen={(v) => setToast(t => ({ ...t, open: v }))}
        message={toast.message}
        type={toast.type}
      />

    </Box>
  )
}







