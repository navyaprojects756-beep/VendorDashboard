import { useEffect, useState } from "react"
import API, { getToken } from "../../services/api"
import Toast from "../../components/Toast"

import {
  Box, Typography, Paper, Chip, TextField, Select, MenuItem,
  InputAdornment, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Divider, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton, Tooltip,
} from "@mui/material"

import SearchIcon               from "@mui/icons-material/Search"
import ApartmentIcon            from "@mui/icons-material/Apartment"
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

/* ── date helpers ── */
const toDateStr = (d) => {
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, "0")
  const dy = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dy}`
}
const getThisMonth = () => {
  const now = new Date()
  return {
    from:  toDateStr(new Date(now.getFullYear(), now.getMonth(), 1)),
    to:    toDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    label: now.toLocaleString("en-IN", { month: "long", year: "numeric" }),
  }
}
const getLastMonth = () => {
  const now = new Date()
  return {
    from:  toDateStr(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
    to:    toDateStr(new Date(now.getFullYear(), now.getMonth(), 0)),
    label: new Date(now.getFullYear(), now.getMonth() - 1, 1)
             .toLocaleString("en-IN", { month: "long", year: "numeric" }),
  }
}
const fmtDate = (str) =>
  new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
export default function Customers({ dark }) {
  const [customers,  setCustomers]  = useState([])
  const [filtered,   setFiltered]   = useState([])
  const [loading,    setLoading]    = useState(true)

  const [search,     setSearch]     = useState("")
  const [aptFilter,  setAptFilter]  = useState("")
  const [apartments, setApartments] = useState([])

  /* bill period: "this" | "last" */
  const [period, setPeriod] = useState("this")
  const range = period === "this" ? getThisMonth() : getLastMonth()

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

  /* ── load customers ── */
  useEffect(() => {
    API.get(`/customers?token=${getToken()}`)
      .then((r) => {
        setCustomers(r.data)
        setApartments([...new Set(r.data.map((c) => c.apartment_name).filter(Boolean))])
      })
      .finally(() => setLoading(false))
  }, [])

  /* ── filter ── */
  useEffect(() => {
    let data = [...customers]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter((c) => c.phone.includes(search) || (c.address || "").toLowerCase().includes(q))
    }
    if (aptFilter) data = data.filter((c) => c.apartment_name === aptFilter)
    setFiltered(data)
  }, [search, aptFilter, customers])

  /* ── invoice dialog ── */
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

  /* ── PDF download ── */
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

  /* ── payment helpers ── */
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
      setToast({ open: true, message: "Payment revoked — orders reset to unpaid.", type: "success" })
      fetchPayments(payCustomer.customer_id)
    } catch {
      setToast({ open: true, message: "Failed to revoke payment", type: "error" })
    }
  }

  /* ── stats ── */
  const activeCount = customers.filter((c) => c.subscription_status === "active").length

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <Box sx={{ maxWidth: 780, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>

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

      {/* ── Filters + period ── */}
      <Paper elevation={0} sx={{ px: 1.5, py: 1.2, mb: 2, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">

          {/* Search */}
          <TextField size="small" placeholder="Search phone or address…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: textSecondary }} /></InputAdornment> }}
            sx={{ flex: "1 1 170px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />

          {/* Apartment filter */}
          <Select size="small" value={aptFilter} displayEmpty
            onChange={(e) => setAptFilter(e.target.value)}
            startAdornment={<InputAdornment position="start"><ApartmentIcon fontSize="small" sx={{ color: textSecondary, ml: 0.5 }} /></InputAdornment>}
            sx={{ flex: "1 1 150px", borderRadius: 2, fontSize: 13 }}>
            <MenuItem value="">All Apartments</MenuItem>
            {apartments.map((a) => <MenuItem key={a} value={a} sx={{ fontSize: 13 }}>{a}</MenuItem>)}
          </Select>

          {/* Month pills */}
          <Box display="flex" gap={0.8} flexShrink={0}>
            {[{ key: "this", label: "This Month" }, { key: "last", label: "Last Month" }].map((p) => (
              <Box key={p.key}
                onClick={() => setPeriod(p.key)}
                sx={{
                  px: 1.5, py: 0.5, borderRadius: "20px", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  border: `1px solid ${period === p.key ? "#2563eb" : border}`,
                  background: period === p.key ? "#2563eb" : "transparent",
                  color: period === p.key ? "#fff" : textSecondary,
                  transition: "all 0.15s",
                  userSelect: "none",
                }}>
                {p.label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Period label */}
        <Typography fontSize={11.5} color={textSecondary} mt={1} px={0.5}>
          Bill period: <Box component="span" fontWeight={700} color={textPrimary}>{range.label} &nbsp;·&nbsp; {fmtDate(range.from)} → {fmtDate(range.to)}</Box>
        </Typography>
      </Paper>

      <Typography fontSize={13} color={textSecondary} mb={1} px={0.5}>
        {filtered.length} customer{filtered.length !== 1 ? "s" : ""}{aptFilter ? ` · ${aptFilter}` : ""}
      </Typography>

      {/* ── Customer list ── */}
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

                {/* RIGHT — icon buttons only */}
                <Box display="flex" alignItems="center" gap={0.6} flexShrink={0}>
                  {c.subscription_quantity && (
                    <Chip label={`×${c.subscription_quantity}`} size="small"
                      sx={{ fontWeight: 700, fontSize: 11, height: 20, background: dark ? "#1e3a5f" : "#eff6ff", color: "#2563eb", mr: 0.5 }} />
                  )}

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

      {/* ═══ BILL DETAILS DIALOG ═══ */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, background: bg } }}>

        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography fontWeight={700} fontSize={15} color={textPrimary}>Bill — {selCustomer?.phone}</Typography>
            {selCustomer?.address && <Typography fontSize={11.5} color={textSecondary}>{selCustomer.address}</Typography>}
          </Box>
          <IconButton size="small" onClick={() => setDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: border }}>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={2}>
            <Box sx={{ px: 1.5, py: 0.4, borderRadius: 2, background: bgCard, border: `1px solid ${border}` }}>
              <Typography fontSize={12} fontWeight={700} color={textPrimary}>{range.label} &nbsp;·&nbsp; {fmtDate(range.from)} → {fmtDate(range.to)}</Typography>
            </Box>
            <IconButton size="small" onClick={() => fetchInvoice(selCustomer?.customer_id)}
              sx={{ border: `1px solid ${border}`, borderRadius: "7px", p: 0.5, color: textSecondary }}>
              <RefreshIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>

          {invLoading && <Box py={6} textAlign="center"><CircularProgress size={24} sx={{ color: "#2563eb" }} /></Box>}

          {!invLoading && invoiceData && (() => {
            const { orders, price_per_unit } = invoiceData
            const delivered = orders.filter((o) => o.is_delivered)
            const rate      = Number(price_per_unit)
            const totalQty  = delivered.reduce((s, o) => s + o.quantity, 0)
            const totalAmt  = delivered.reduce((s, o) => s + o.quantity * rate, 0)
            return (
              <>
                <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
                  {[
                    { label: `${delivered.length} deliveries`, color: "#2563eb", bg: dark ? "#1e3a5f" : "#eff6ff" },
                    { label: `${totalQty} packets`,            color: "#7c3aed", bg: dark ? "#2e1065" : "#faf5ff" },
                    { label: `₹${totalAmt.toFixed(2)} total`,  color: "#16a34a", bg: dark ? "#14532d" : "#f0fdf4" },
                    { label: `₹${rate.toFixed(2)} / packet`,   color: "#f97316", bg: dark ? "#431407" : "#fff7ed" },
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
                ) : (() => {
                  const paidRows   = delivered.filter(o => o.payment_status === "paid")
                  const unpaidRows = delivered.filter(o => o.payment_status !== "paid")
                  const unpaidAmt  = unpaidRows.reduce((s, o) => s + o.quantity * rate, 0)
                  return (
                    <Box sx={{ overflowX: "auto" }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ background: bgCard }}>
                            {["#", "Date", "Packets", "Rate", "Amount", "Status"].map((h) => (
                              <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11.5, color: textSecondary, borderColor: border }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {delivered.map((o, i) => {
                            const isPaid = o.payment_status === "paid"
                            return (
                              <TableRow key={i} sx={{ background: isPaid ? (dark ? "#0f2d1a" : "#f0fdf4") : "inherit", "&:hover": { background: bgCard } }}>
                                <TableCell sx={{ fontSize: 12, color: textSecondary, borderColor: border }}>{i + 1}</TableCell>
                                <TableCell sx={{ fontSize: 12, fontWeight: 600, color: textPrimary, borderColor: border }}>{fmtDate(String(o.order_date).slice(0, 10))}</TableCell>
                                <TableCell sx={{ fontSize: 12, color: textPrimary, borderColor: border }}>{o.quantity}</TableCell>
                                <TableCell sx={{ fontSize: 12, color: textSecondary, borderColor: border }}>₹{rate.toFixed(2)}</TableCell>
                                <TableCell sx={{ fontSize: 12, fontWeight: 700, color: isPaid ? "#16a34a" : "#2563eb", borderColor: border }}>₹{(o.quantity * rate).toFixed(2)}</TableCell>
                                <TableCell sx={{ borderColor: border }}>
                                  <Chip label={isPaid ? "Paid" : "Unpaid"} size="small"
                                    sx={{ fontSize: 10, fontWeight: 700, height: 18,
                                      background: isPaid ? (dark ? "#14532d" : "#dcfce7") : (dark ? "#450a0a" : "#fee2e2"),
                                      color: isPaid ? "#16a34a" : "#dc2626" }} />
                                </TableCell>
                              </TableRow>
                            )
                          })}
                          {/* Totals row */}
                          <TableRow sx={{ background: bgCard }}>
                            <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: 13, color: textPrimary, borderColor: border }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 13, color: textPrimary, borderColor: border }}>{totalQty}</TableCell>
                            <TableCell sx={{ borderColor: border }} />
                            <TableCell sx={{ fontWeight: 800, fontSize: 13, color: "#16a34a", borderColor: border }}>₹{totalAmt.toFixed(2)}</TableCell>
                            <TableCell sx={{ borderColor: border }} />
                          </TableRow>
                          {/* Outstanding row — only if some unpaid */}
                          {unpaidRows.length > 0 && paidRows.length > 0 && (
                            <TableRow sx={{ background: dark ? "#2d0a0a" : "#fff5f5" }}>
                              <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: 12, color: "#dc2626", borderColor: border }}>Outstanding</TableCell>
                              <TableCell sx={{ fontWeight: 700, fontSize: 12, color: "#dc2626", borderColor: border }}>{unpaidRows.reduce((s,o)=>s+o.quantity,0)}</TableCell>
                              <TableCell sx={{ borderColor: border }} />
                              <TableCell sx={{ fontWeight: 800, fontSize: 12, color: "#dc2626", borderColor: border }}>₹{unpaidAmt.toFixed(2)}</TableCell>
                              <TableCell sx={{ borderColor: border }} />
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </Box>
                  )
                })()}
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

      {/* ═══ PAYMENTS DIALOG ═══ */}
      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, background: bg } }}>

        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography fontWeight={700} fontSize={15} color={textPrimary}>Payments — {payCustomer?.phone}</Typography>
            {payCustomer?.address && <Typography fontSize={11.5} color={textSecondary}>{payCustomer.address}</Typography>}
          </Box>
          <IconButton size="small" onClick={() => setPayDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: border }}>

          {/* Balance summary */}
          {payData && (
            <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
              {[
                { label: "Total Billed", value: `₹${Number(payData.totalBilled).toFixed(2)}`,  color: "#2563eb", bg: dark ? "#1e3a5f" : "#eff6ff" },
                { label: "Total Paid",   value: `₹${Number(payData.totalPaid).toFixed(2)}`,    color: "#16a34a", bg: dark ? "#14532d" : "#f0fdf4" },
                { label: "Outstanding",  value: `₹${Number(payData.outstanding).toFixed(2)}`,  color: payData.outstanding > 0 ? "#dc2626" : "#16a34a", bg: payData.outstanding > 0 ? (dark ? "#450a0a" : "#fee2e2") : (dark ? "#14532d" : "#f0fdf4") },
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
              <TextField size="small" label="Amount (₹)" type="number" value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                sx={{ flex: "1 1 100px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              <Select size="small" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                sx={{ flex: "1 1 110px", borderRadius: 2, fontSize: 13 }}>
                <MenuItem value="cash"    sx={{ fontSize: 13 }}>💵 Cash</MenuItem>
                <MenuItem value="phonePe" sx={{ fontSize: 13 }}>📱 PhonePe</MenuItem>
                <MenuItem value="upi"     sx={{ fontSize: 13 }}>🔗 UPI</MenuItem>
                <MenuItem value="other"   sx={{ fontSize: 13 }}>🏦 Other</MenuItem>
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
              {payUploading ? "Uploading…" : paySubmitting ? "Recording…" : "Record Payment"}
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
                          ₹{Number(p.amount).toFixed(2)}
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
                          {p.notes || "—"}
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
                            <Tooltip title="Revoke — reset orders to unpaid" arrow>
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
