import { useEffect, useState } from "react"
import API, { getToken } from "../../services/api"
import Toast from "../../components/Toast"

import {
  Box, Typography, Paper, Chip, TextField, Select, MenuItem,
  InputAdornment, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, ToggleButtonGroup, ToggleButton,
  Divider, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, LinearProgress, Tooltip,
} from "@mui/material"

import SearchIcon         from "@mui/icons-material/Search"
import ApartmentIcon      from "@mui/icons-material/Apartment"
import PeopleIcon         from "@mui/icons-material/People"
import ReceiptLongIcon    from "@mui/icons-material/ReceiptLong"
import DownloadIcon       from "@mui/icons-material/Download"
import LocationOnIcon     from "@mui/icons-material/LocationOn"
import CloseIcon          from "@mui/icons-material/Close"
import CheckCircleIcon    from "@mui/icons-material/CheckCircle"
import RefreshIcon        from "@mui/icons-material/Refresh"
import FileDownloadIcon   from "@mui/icons-material/FileDownload"
import CloudDownloadIcon  from "@mui/icons-material/CloudDownload"

/* ── date helpers ── */
const toDateStr = (d) => {
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, "0")
  const dy = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dy}`
}
const getWeekRange = () => {
  const now = new Date()
  const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  return { from: toDateStr(mon), to: toDateStr(sun) }
}
const getMonthRange = () => {
  const now = new Date()
  return {
    from: toDateStr(new Date(now.getFullYear(), now.getMonth(), 1)),
    to:   toDateStr(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  }
}
const getRange = (mode, cFrom, cTo) => {
  if (mode === "week")  return getWeekRange()
  if (mode === "month") return getMonthRange()
  return { from: cFrom, to: cTo }
}
const fmtDate = (str) => {
  const d = new Date(str)
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

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

  /* shared date range */
  const [dateMode, setDateMode] = useState("month")
  const [fromDate, setFromDate] = useState(getMonthRange().from)
  const [toDate,   setToDate]   = useState(getMonthRange().to)

  /* individual invoice dialog */
  const [dialogOpen,  setDialogOpen]  = useState(false)
  const [selCustomer, setSelCustomer] = useState(null)
  const [invoiceData, setInvoiceData] = useState(null)
  const [invLoading,  setInvLoading]  = useState(false)

  /* bulk generate state */
  const [bulkRunning, setBulkRunning] = useState(false)
  const [bulkDone,    setBulkDone]    = useState(0)
  const [bulkTotal,   setBulkTotal]   = useState(0)
  const [bulkSkipped, setBulkSkipped] = useState(0)

  /* stored generated invoice data */
  const [generatedData,   setGeneratedData]   = useState(new Map()) // customerId -> invoiceData (delivered only)
  const [generatedPeriod, setGeneratedPeriod] = useState(null)      // { from, to }

  /* bulk download state */
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [dlDone,         setDlDone]         = useState(0)
  const [dlTotal,        setDlTotal]        = useState(0)
  const [dlFinished,     setDlFinished]     = useState(false)

  /* per-customer download */
  const [downloadingCustomer, setDownloadingCustomer] = useState(null)
  const [toast, setToast] = useState({ open: false, message: "", type: "success" })

  /* theme */
  const border        = dark ? "#1e293b" : "#e5e7eb"
  const bg            = dark ? "#0f172a" : "#ffffff"
  const bgCard        = dark ? "#111827" : "#f9fafb"
  const textPrimary   = dark ? "#f1f5f9" : "#111827"
  const textSecondary = dark ? "#94a3b8" : "#6b7280"

  /* clear generated data when period changes */
  useEffect(() => {
    setGeneratedData(new Map())
    setGeneratedPeriod(null)
    setDlFinished(false)
  }, [dateMode, fromDate, toDate])

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

  /* ── fetch one invoice (dialog) ── */
  const fetchInvoice = async (customerId) => {
    setInvLoading(true); setInvoiceData(null)
    const { from, to } = getRange(dateMode, fromDate, toDate)
    try {
      const r = await API.get(`/customers/${customerId}/invoice?token=${getToken()}&from=${from}&to=${to}`)
      setInvoiceData(r.data)
    } finally { setInvLoading(false) }
  }

  const openInvoice = (customer) => {
    setSelCustomer(customer); setDialogOpen(true)
    fetchInvoice(customer.customer_id)
  }

  /* ── shared: download PDF from backend ── */
  const downloadPDFFromBackend = async (customerId, phone, from, to) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/customers/${customerId}/invoice/pdf?token=${getToken()}&from=${from}&to=${to}`
    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || "Download failed")
    }
    const blob   = await res.blob()
    const link   = document.createElement("a")
    link.href    = URL.createObjectURL(blob)
    link.download = `bill_${phone}_${from}_${to}.pdf`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  /* ── download single PDF from dialog ── */
  const downloadSinglePDF = async () => {
    if (!invoiceData) return
    const { from, to } = getRange(dateMode, fromDate, toDate)
    try {
      await downloadPDFFromBackend(invoiceData.customer.customer_id, invoiceData.customer.phone, from, to)
    } catch (err) {
      setToast({ open: true, message: err.message, type: "error" })
    }
  }

  /* ── per-customer download icon ── */
  const downloadCustomerInvoice = async (customer) => {
    const { from, to } = generatedPeriod || getRange(dateMode, fromDate, toDate)
    setDownloadingCustomer(customer.customer_id)
    try {
      await downloadPDFFromBackend(customer.customer_id, customer.phone, from, to)
    } catch (err) {
      setToast({ open: true, message: err.message, type: "error" })
    } finally {
      setDownloadingCustomer(null)
    }
  }

  /* ── GENERATE all: check who has deliveries in period ── */
  const generateAllInvoices = async () => {
    setBulkRunning(true)
    setBulkDone(0); setBulkSkipped(0); setBulkTotal(filtered.length)
    setGeneratedData(new Map())
    setGeneratedPeriod(null)
    setDlFinished(false)

    const { from, to } = getRange(dateMode, fromDate, toDate)
    const newMap = new Map()
    let skipped = 0

    for (let i = 0; i < filtered.length; i++) {
      const c = filtered[i]
      try {
        const r = await API.get(`/customers/${c.customer_id}/invoice?token=${getToken()}&from=${from}&to=${to}`)
        const hasDeliveries = r.data.orders.some((o) => o.is_delivered)
        if (hasDeliveries) {
          newMap.set(c.customer_id, { phone: c.phone })  // just track who is ready
        } else {
          skipped++
        }
      } catch { skipped++ }

      setBulkDone(i + 1)
      setBulkSkipped(skipped)
    }

    setGeneratedData(newMap)
    setGeneratedPeriod({ from, to })
    setBulkRunning(false)
  }

  /* ── DOWNLOAD all: fetch PDF from backend per customer ── */
  const downloadAllInvoices = async () => {
    if (!generatedPeriod || generatedData.size === 0) return
    setDownloadingAll(true)
    setDlFinished(false)
    setDlDone(0)
    const entries = [...generatedData.entries()]
    setDlTotal(entries.length)
    const { from, to } = generatedPeriod

    for (let i = 0; i < entries.length; i++) {
      const [customerId, { phone }] = entries[i]
      try {
        await downloadPDFFromBackend(customerId, phone, from, to)
        await new Promise((r) => setTimeout(r, 700))
      } catch { /* skip failed */ }
      setDlDone(i + 1)
    }

    setDownloadingAll(false)
    setDlFinished(true)
  }

  /* ── stats ── */
  const activeCount = customers.filter((c) => c.subscription_status === "active").length
  const { from: rFrom, to: rTo } = getRange(dateMode, fromDate, toDate)
  const readyCount = generatedData.size

  /* after generation, only show customers who have orders in the period */
  const displayCustomers = generatedPeriod
    ? filtered.filter((c) => generatedData.has(c.customer_id))
    : filtered

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
          <Typography fontSize={12} color={textSecondary}>View customers and generate bills</Typography>
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

      {/* ── Period + Bulk Invoice ── */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
        <Typography fontWeight={700} fontSize={13} color={textPrimary} mb={1.5}>Bill Period</Typography>

        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={1.5}>
          <ToggleButtonGroup size="small" exclusive value={dateMode}
            onChange={(_, v) => { if (v) setDateMode(v) }}
            sx={{
              "& .MuiToggleButton-root": { border: `1px solid ${border}`, color: textSecondary, px: 1.8, py: 0.5, fontSize: 12, fontWeight: 600, textTransform: "none" },
              "& .Mui-selected": { background: "#2563eb !important", color: "white !important", borderColor: "#2563eb !important" },
            }}>
            <ToggleButton value="week">This Week</ToggleButton>
            <ToggleButton value="month">This Month</ToggleButton>
            <ToggleButton value="custom">Custom</ToggleButton>
          </ToggleButtonGroup>

          {dateMode === "custom" && (
            <Box display="flex" alignItems="center" gap={0.8} flexWrap="wrap">
              <TextField type="date" size="small" label="From" value={fromDate}
                onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }}
                sx={{ width: 140, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
              <Typography fontSize={13} color={textSecondary}>→</Typography>
              <TextField type="date" size="small" label="To" value={toDate}
                onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }}
                inputProps={{ min: fromDate }}
                sx={{ width: 140, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
            </Box>
          )}
        </Box>

        <Box sx={{ p: 1.2, borderRadius: 2, background: bgCard, border: `1px solid ${border}`, mb: 1.5 }}>
          <Typography fontSize={12} color={textSecondary}>
            Period: <Box component="span" fontWeight={700} color={textPrimary}>{fmtDate(rFrom)} → {fmtDate(rTo)}</Box>
          </Typography>
        </Box>

        {/* Generation progress */}
        {bulkRunning && (
          <Box mb={1.5}>
            <Typography fontSize={12} color={textSecondary} mb={0.5}>
              Fetching bills… {bulkDone} / {bulkTotal}
              {bulkSkipped > 0 && ` (${bulkSkipped} skipped — no deliveries)`}
            </Typography>
            <LinearProgress variant="determinate" value={(bulkDone / bulkTotal) * 100}
              sx={{ borderRadius: 4, height: 6, backgroundColor: dark ? "#1e293b" : "#e5e7eb", "& .MuiLinearProgress-bar": { background: "#2563eb" } }} />
          </Box>
        )}

        {/* Generation done — invoices ready */}
        {!bulkRunning && generatedPeriod && readyCount > 0 && (
          <Box sx={{ px: 1.5, py: 0.8, borderRadius: 2, background: dark ? "#1e3a5f" : "#eff6ff", border: `1px solid ${dark ? "#1d4ed8" : "#bfdbfe"}`, mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 15, color: "#2563eb" }} />
            <Typography fontSize={12} color="#2563eb" fontWeight={600}>
              {readyCount} bill{readyCount !== 1 ? "s" : ""} ready
              {bulkSkipped > 0 ? ` · ${bulkSkipped} skipped (no deliveries)` : ""}
            </Typography>
          </Box>
        )}

        {/* Download progress */}
        {downloadingAll && (
          <Box mb={1.5}>
            <Typography fontSize={12} color={textSecondary} mb={0.5}>
              Downloading… {dlDone} / {dlTotal}
            </Typography>
            <LinearProgress variant="determinate" value={(dlDone / dlTotal) * 100}
              sx={{ borderRadius: 4, height: 6, backgroundColor: dark ? "#1e293b" : "#e5e7eb", "& .MuiLinearProgress-bar": { background: "#7c3aed" } }} />
          </Box>
        )}

        {/* Download complete */}
        {dlFinished && !downloadingAll && (
          <Box sx={{ px: 1.5, py: 0.8, borderRadius: 2, background: dark ? "#14532d" : "#f0fdf4", border: `1px solid ${dark ? "#166534" : "#bbf7d0"}`, mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon sx={{ fontSize: 15, color: "#16a34a" }} />
            <Typography fontSize={12} color="#16a34a" fontWeight={600}>
              All {dlTotal} bill{dlTotal !== 1 ? "s" : ""} downloaded successfully.
            </Typography>
          </Box>
        )}

        {/* Action buttons */}
        <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
          <Button variant="contained"
            startIcon={bulkRunning ? <CircularProgress size={14} color="inherit" /> : <FileDownloadIcon fontSize="small" />}
            disabled={bulkRunning || downloadingAll || filtered.length === 0}
            onClick={generateAllInvoices}
            sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, borderRadius: "8px", background: "#2563eb", "&:hover": { background: "#1d4ed8" } }}>
            {bulkRunning ? `Fetching ${bulkDone}/${bulkTotal}…` : `Generate All Bills (${filtered.length})`}
          </Button>

          {readyCount > 0 && !bulkRunning && (
            <Button variant="contained"
              startIcon={downloadingAll ? <CircularProgress size={14} color="inherit" /> : <CloudDownloadIcon fontSize="small" />}
              disabled={downloadingAll}
              onClick={downloadAllInvoices}
              sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, borderRadius: "8px", background: "#7c3aed", "&:hover": { background: "#6d28d9" } }}>
              {downloadingAll ? `Downloading ${dlDone}/${dlTotal}…` : `Download All Bills (${readyCount})`}
            </Button>
          )}
        </Box>
      </Paper>

      {/* ── Filters ── */}
      <Paper elevation={0} sx={{ px: 1.5, py: 1.2, mb: 2, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <TextField size="small" placeholder="Search phone or address…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: textSecondary }} /></InputAdornment> }}
            sx={{ flex: "1 1 170px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
          <Select size="small" value={aptFilter} displayEmpty
            onChange={(e) => setAptFilter(e.target.value)}
            startAdornment={<InputAdornment position="start"><ApartmentIcon fontSize="small" sx={{ color: textSecondary, ml: 0.5 }} /></InputAdornment>}
            sx={{ flex: "1 1 150px", borderRadius: 2, fontSize: 13 }}>
            <MenuItem value="">All Apartments</MenuItem>
            {apartments.map((a) => <MenuItem key={a} value={a} sx={{ fontSize: 13 }}>{a}</MenuItem>)}
          </Select>
        </Box>
      </Paper>

      <Typography fontSize={13} color={textSecondary} mb={1} px={0.5}>
        {displayCustomers.length} customer{displayCustomers.length !== 1 ? "s" : ""}{aptFilter ? ` · ${aptFilter}` : ""}
        {generatedPeriod && filtered.length !== displayCustomers.length && (
          <Box component="span" sx={{ ml: 1, fontSize: 12, color: dark ? "#475569" : "#9ca3af" }}>
            ({filtered.length - displayCustomers.length} hidden — no orders in period)
          </Box>
        )}
      </Typography>

      {/* ── Customer list ── */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${border}`, overflow: "hidden", background: bg }}>
        {loading && <Box py={8} textAlign="center"><CircularProgress size={24} sx={{ color: "#2563eb" }} /></Box>}
        {!loading && displayCustomers.length === 0 && (
          <Box py={7} textAlign="center">
            <PeopleIcon sx={{ fontSize: 36, color: border, mb: 1, display: "block", mx: "auto" }} />
            <Typography color={textSecondary} fontSize={14}>
              {generatedPeriod ? "No customers with orders in this period." : "No customers found."}
            </Typography>
          </Box>
        )}

        {!loading && displayCustomers.map((c, i) => {
          const isActive    = c.subscription_status === "active"
          const isGenerated = generatedData.has(c.customer_id)
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
                    <Chip
                      label={isActive ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        fontSize: 10, fontWeight: 700, height: 18, flexShrink: 0,
                        background: isActive ? (dark ? "#14532d" : "#dcfce7") : (dark ? "#450a0a" : "#fee2e2"),
                        color: isActive ? "#16a34a" : "#dc2626",
                      }}
                    />
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

                {/* RIGHT */}
                <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.8} flexShrink={0}>
                  {c.subscription_quantity && (
                    <Chip label={`Qty: ${c.subscription_quantity}`} size="small"
                      sx={{ fontWeight: 700, fontSize: 11, background: dark ? "#1e3a5f" : "#eff6ff", color: "#2563eb" }} />
                  )}
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {/* Per-customer download icon */}
                    <Tooltip title={isGenerated ? "Download bill (ready)" : "Download bill"} arrow>
                      <span>
                        <IconButton size="small"
                          onClick={() => downloadCustomerInvoice(c)}
                          disabled={isDlLoading || downloadingAll}
                          sx={{
                            border: `1px solid ${isGenerated ? "#7c3aed" : border}`,
                            borderRadius: "7px",
                            p: 0.5,
                            color: isGenerated ? "#7c3aed" : textSecondary,
                            background: isGenerated ? (dark ? "#2e1065" : "#faf5ff") : "transparent",
                            "&:hover": { background: dark ? "#2e1065" : "#faf5ff", borderColor: "#7c3aed", color: "#7c3aed" },
                          }}>
                          {isDlLoading
                            ? <CircularProgress size={14} sx={{ color: "#7c3aed" }} />
                            : <DownloadIcon sx={{ fontSize: 16 }} />
                          }
                        </IconButton>
                      </span>
                    </Tooltip>

                    {/* View invoice dialog */}
                    <Button size="small" variant="outlined" startIcon={<ReceiptLongIcon sx={{ fontSize: "14px !important" }} />}
                      onClick={() => openInvoice(c)}
                      sx={{ textTransform: "none", fontWeight: 600, fontSize: 11.5, borderRadius: "7px", borderColor: "#7c3aed", color: "#7c3aed", py: 0.4, "&:hover": { background: dark ? "#2e1065" : "#faf5ff" } }}>
                      Bill
                    </Button>
                  </Box>
                </Box>
              </Box>
              {i < displayCustomers.length - 1 && <Divider sx={{ borderColor: border }} />}
            </Box>
          )
        })}
      </Paper>

      {/* ═══ INDIVIDUAL INVOICE DIALOG ═══ */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, background: bg } }}>

        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography fontWeight={700} fontSize={15} color={textPrimary}>
              Bill — {selCustomer?.phone}
            </Typography>
            {selCustomer?.address && (
              <Typography fontSize={11.5} color={textSecondary}>{selCustomer.address}</Typography>
            )}
          </Box>
          <IconButton size="small" onClick={() => setDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: border }}>
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={2}>
            <Typography fontSize={12} color={textSecondary}>Period:</Typography>
            <Box sx={{ px: 1.5, py: 0.4, borderRadius: 2, background: bgCard, border: `1px solid ${border}` }}>
              <Typography fontSize={12} fontWeight={700} color={textPrimary}>{fmtDate(rFrom)} → {fmtDate(rTo)}</Typography>
            </Box>
            <Button size="small" variant="outlined" startIcon={<RefreshIcon fontSize="small" />}
              onClick={() => fetchInvoice(selCustomer?.customer_id)}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: 12, borderRadius: "7px", borderColor: border, color: textSecondary }}>
              Refresh
            </Button>
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
                    { label: `Rs. ${totalAmt.toFixed(2)} total`, color: "#16a34a", bg: dark ? "#14532d" : "#f0fdf4" },
                    { label: `Rs. ${rate.toFixed(2)} / packet`, color: "#f97316", bg: dark ? "#431407" : "#fff7ed" },
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
                        <TableRow sx={{ background: bgCard }}>
                          {["#", "Delivery Date", "Packets", "Rate / Packet", "Amount"].map((h) => (
                            <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11.5, color: textSecondary, borderColor: border }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {delivered.map((o, i) => {
                          const amt = o.quantity * rate
                          return (
                            <TableRow key={i} sx={{ "&:hover": { background: bgCard } }}>
                              <TableCell sx={{ fontSize: 12, color: textSecondary, borderColor: border }}>{i + 1}</TableCell>
                              <TableCell sx={{ fontSize: 12, fontWeight: 600, color: textPrimary, borderColor: border }}>
                                {fmtDate(String(o.order_date).slice(0, 10))}
                              </TableCell>
                              <TableCell sx={{ fontSize: 12, color: textPrimary, borderColor: border }}>{o.quantity}</TableCell>
                              <TableCell sx={{ fontSize: 12, color: textSecondary, borderColor: border }}>Rs. {rate.toFixed(2)}</TableCell>
                              <TableCell sx={{ fontSize: 12, fontWeight: 700, color: "#2563eb", borderColor: border }}>Rs. {amt.toFixed(2)}</TableCell>
                            </TableRow>
                          )
                        })}
                        <TableRow sx={{ background: bgCard }}>
                          <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: 13, color: textPrimary, borderColor: border }}>Total</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 13, color: textPrimary, borderColor: border }}>{totalQty}</TableCell>
                          <TableCell sx={{ borderColor: border }} />
                          <TableCell sx={{ fontWeight: 800, fontSize: 13, color: "#16a34a", borderColor: border }}>Rs. {totalAmt.toFixed(2)}</TableCell>
                        </TableRow>
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
            Download Bill PDF
          </Button>
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
