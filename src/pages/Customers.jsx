import { useEffect, useState } from "react"
import API, { getToken } from "../services/api"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import {
  Box, Typography, Paper, Chip, TextField, Select, MenuItem,
  InputAdornment, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, ToggleButtonGroup, ToggleButton,
  Divider, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton,
} from "@mui/material"

import SearchIcon        from "@mui/icons-material/Search"
import ApartmentIcon     from "@mui/icons-material/Apartment"
import PeopleIcon        from "@mui/icons-material/People"
import ReceiptLongIcon   from "@mui/icons-material/ReceiptLong"
import DownloadIcon      from "@mui/icons-material/Download"
import PhoneIcon         from "@mui/icons-material/Phone"
import LocationOnIcon    from "@mui/icons-material/LocationOn"
import CloseIcon         from "@mui/icons-material/Close"
import CheckCircleIcon   from "@mui/icons-material/CheckCircle"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import RefreshIcon       from "@mui/icons-material/Refresh"

/* ── date helpers ── */
const toDateStr = (d) => d.toISOString().split("T")[0]

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
const getRange = (mode, customFrom, customTo) => {
  if (mode === "week")  return getWeekRange()
  if (mode === "month") return getMonthRange()
  return { from: customFrom, to: customTo }
}

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
export default function Customers({ dark }) {
  const [customers, setCustomers] = useState([])
  const [filtered,  setFiltered]  = useState([])
  const [loading,   setLoading]   = useState(true)

  const [search,    setSearch]    = useState("")
  const [aptFilter, setAptFilter] = useState("")
  const [apartments, setApartments] = useState([])

  /* invoice dialog */
  const [dialogOpen,    setDialogOpen]    = useState(false)
  const [selCustomer,   setSelCustomer]   = useState(null)
  const [invoiceData,   setInvoiceData]   = useState(null)
  const [invLoading,    setInvLoading]    = useState(false)

  const [dateMode,  setDateMode]  = useState("month")
  const [fromDate,  setFromDate]  = useState(getMonthRange().from)
  const [toDate,    setToDate]    = useState(getMonthRange().to)

  /* theme */
  const border        = dark ? "#1e293b" : "#e5e7eb"
  const bg            = dark ? "#0f172a" : "#ffffff"
  const bgCard        = dark ? "#111827" : "#f9fafb"
  const textPrimary   = dark ? "#f1f5f9" : "#111827"
  const textSecondary = dark ? "#94a3b8" : "#6b7280"

  /* ── load ── */
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

  /* ── fetch invoice ── */
  const fetchInvoice = async (customerId) => {
    setInvLoading(true)
    setInvoiceData(null)
    const { from, to } = getRange(dateMode, fromDate, toDate)
    try {
      const r = await API.get(`/customers/${customerId}/invoice?token=${getToken()}&from=${from}&to=${to}`)
      setInvoiceData(r.data)
    } finally {
      setInvLoading(false)
    }
  }

  const openInvoice = (customer) => {
    setSelCustomer(customer)
    setDialogOpen(true)
    fetchInvoice(customer.customer_id)
  }

  /* ── PDF ── */
  const downloadPDF = () => {
    if (!invoiceData) return
    const { customer, orders, price_per_unit, vendor } = invoiceData
    const { from, to } = getRange(dateMode, fromDate, toDate)

    const doc = new jsPDF()

    /* header band */
    doc.setFillColor(37, 99, 235)
    doc.rect(0, 0, 210, 34, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22); doc.setFont("helvetica", "bold")
    doc.text("INVOICE", 14, 14)
    doc.setFontSize(11); doc.setFont("helvetica", "normal")
    doc.text(vendor.business_name || "MilkRoute", 14, 23)
    if (vendor.area || vendor.city)
      doc.text([vendor.area, vendor.city].filter(Boolean).join(", "), 14, 30)

    /* bill-to */
    doc.setTextColor(30, 30, 30)
    doc.setFontSize(10); doc.setFont("helvetica", "bold")
    doc.text("Bill To", 14, 46)
    doc.setFont("helvetica", "normal")
    doc.text(customer.phone, 14, 53)
    if (customer.address)
      doc.text(customer.address, 14, 59, { maxWidth: 85 })

    /* period */
    doc.setFont("helvetica", "bold")
    doc.text("Billing Period", 120, 46)
    doc.setFont("helvetica", "normal")
    doc.text(`${from}  →  ${to}`, 120, 53)

    /* table */
    const rows = orders.map((o, i) => [
      i + 1,
      String(o.order_date).slice(0, 10),
      o.quantity,
      `₹${Number(price_per_unit).toFixed(2)}`,
      `₹${(o.quantity * price_per_unit).toFixed(2)}`,
      o.is_delivered ? "Delivered" : "Pending",
    ])

    autoTable(doc, {
      startY: 70,
      head: [["#", "Date", "Qty", "Rate/unit", "Amount", "Status"]],
      body: rows,
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      columnStyles: { 0: { cellWidth: 10 }, 5: { cellWidth: 28 } },
      didParseCell(data) {
        if (data.section === "body" && data.column.index === 5) {
          const val = data.cell.raw
          data.cell.styles.textColor = val === "Delivered" ? [22, 163, 74] : [249, 115, 22]
        }
      },
    })

    const finalY = doc.lastAutoTable.finalY + 10
    const totalQty = orders.reduce((s, o) => s + o.quantity, 0)
    const totalAmt = orders.reduce((s, o) => s + o.quantity * price_per_unit, 0)
    const paidAmt  = orders.filter((o) => o.is_delivered).reduce((s, o) => s + o.quantity * price_per_unit, 0)

    /* summary box */
    doc.setFillColor(239, 246, 255)
    doc.roundedRect(14, finalY - 4, 182, 30, 3, 3, "F")
    doc.setFontSize(10.5); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 30, 30)
    doc.text(`Total Qty: ${totalQty}`, 20, finalY + 4)
    doc.text(`Total Amount: ₹${totalAmt.toFixed(2)}`, 20, finalY + 12)
    doc.setTextColor(22, 163, 74)
    doc.text(`Delivered Amount: ₹${paidAmt.toFixed(2)}`, 20, finalY + 20)
    doc.setTextColor(249, 115, 22)
    doc.text(`Pending Amount: ₹${(totalAmt - paidAmt).toFixed(2)}`, 110, finalY + 12)

    /* footer */
    doc.setTextColor(160, 160, 160); doc.setFontSize(8.5); doc.setFont("helvetica", "normal")
    doc.text("Generated by MilkRoute Vendor Dashboard", 105, 287, { align: "center" })

    doc.save(`invoice_${customer.phone}_${from}_${to}.pdf`)
  }

  /* ── stats ── */
  const activeCount = customers.filter((c) => c.subscription_status === "active").length

  /* ═══ RENDER ═══ */
  return (
    <Box sx={{ maxWidth: 780, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>

      {/* Page header */}
      <Box display="flex" alignItems="center" gap={1.2} mb={3}>
        <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PeopleIcon sx={{ fontSize: 18, color: "white" }} />
        </Box>
        <Box>
          <Typography fontWeight={700} fontSize={17} color={textPrimary} lineHeight={1.2}>Customers</Typography>
          <Typography fontSize={12} color={textSecondary}>View customers and generate invoices</Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        {[
          { label: "Total Customers", value: customers.length, color: "#2563eb", bg: "#eff6ff" },
          { label: "Active Subscriptions", value: activeCount, color: "#16a34a", bg: "#f0fdf4" },
          { label: "Inactive", value: customers.length - activeCount, color: "#f97316", bg: "#fff7ed" },
        ].map((s) => (
          <Paper key={s.label} elevation={0} sx={{ flex: "1 1 130px", p: 1.5, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
            <Typography fontSize={11} color={textSecondary}>{s.label}</Typography>
            <Typography fontWeight={700} fontSize={22} color={s.color}>{s.value}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ px: 1.5, py: 1.2, mb: 2, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <TextField size="small" placeholder="Search phone or address…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: textSecondary }} /></InputAdornment> }}
            sx={{ flex: "1 1 170px", "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }} />
          <Select size="small" value={aptFilter} displayEmpty
            onChange={(e) => setAptFilter(e.target.value)}
            startAdornment={<InputAdornment position="start"><ApartmentIcon fontSize="small" sx={{ color: textSecondary, ml: 0.5 }} /></InputAdornment>}
            sx={{ flex: "1 1 140px", borderRadius: 2, fontSize: 13 }}>
            <MenuItem value="">All Apartments</MenuItem>
            {apartments.map((a) => <MenuItem key={a} value={a} sx={{ fontSize: 13 }}>{a}</MenuItem>)}
          </Select>
        </Box>
      </Paper>

      {/* Count */}
      <Typography fontSize={13} color={textSecondary} mb={1} px={0.5}>
        {filtered.length} customer{filtered.length !== 1 ? "s" : ""}
        {aptFilter ? ` in ${aptFilter}` : ""}
      </Typography>

      {/* List */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${border}`, overflow: "hidden", background: bg }}>
        {loading && (
          <Box py={8} textAlign="center"><CircularProgress size={24} sx={{ color: "#2563eb" }} /></Box>
        )}
        {!loading && filtered.length === 0 && (
          <Box py={7} textAlign="center">
            <PeopleIcon sx={{ fontSize: 36, color: border, mb: 1, display: "block", mx: "auto" }} />
            <Typography color={textSecondary} fontSize={14}>No customers found.</Typography>
          </Box>
        )}
        {!loading && filtered.map((c, i) => (
          <Box key={c.customer_id}>
            <Box sx={{ px: 2.5, py: 1.8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, "&:hover": { background: bgCard }, transition: "background 0.15s" }}>
              <Box flex={1} minWidth={0}>
                <Box display="flex" alignItems="center" gap={1} mb={0.4}>
                  <PhoneIcon sx={{ fontSize: 14, color: textSecondary, flexShrink: 0 }} />
                  <Typography fontWeight={700} fontSize={14} color={textPrimary}>{c.phone}</Typography>
                  <Chip
                    label={c.subscription_status === "active" ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                      fontSize: 10, fontWeight: 600, height: 18,
                      background: c.subscription_status === "active" ? "#dcfce7" : "#fee2e2",
                      color: c.subscription_status === "active" ? "#16a34a" : "#dc2626",
                    }}
                  />
                </Box>
                {c.address && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <LocationOnIcon sx={{ fontSize: 13, color: textSecondary, flexShrink: 0 }} />
                    <Typography fontSize={12} color={textSecondary} noWrap>{c.address}</Typography>
                  </Box>
                )}
              </Box>
              <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
                {c.subscription_quantity && (
                  <Chip label={`Qty: ${c.subscription_quantity}`} size="small" color="primary" sx={{ fontWeight: 600, fontSize: 11 }} />
                )}
                <Button size="small" variant="outlined" startIcon={<ReceiptLongIcon fontSize="small" />}
                  onClick={() => openInvoice(c)}
                  sx={{ textTransform: "none", fontWeight: 600, fontSize: 12, borderRadius: "8px", borderColor: "#7c3aed", color: "#7c3aed", "&:hover": { background: "#faf5ff", borderColor: "#7c3aed" } }}>
                  Invoice
                </Button>
              </Box>
            </Box>
            {i < filtered.length - 1 && <Divider sx={{ borderColor: border }} />}
          </Box>
        ))}
      </Paper>

      {/* ═══ INVOICE DIALOG ═══ */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, background: bg } }}>
        <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography fontWeight={700} fontSize={16} color={textPrimary}>
              Invoice — {selCustomer?.phone}
            </Typography>
            {selCustomer?.address && (
              <Typography fontSize={12} color={textSecondary}>{selCustomer.address}</Typography>
            )}
          </Box>
          <IconButton size="small" onClick={() => setDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: border }}>
          {/* Date range selector */}
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={2}>
            <ToggleButtonGroup size="small" exclusive value={dateMode}
              onChange={(_, v) => { if (v) setDateMode(v) }}
              sx={{ "& .MuiToggleButton-root": { border: `1px solid ${border}`, color: textSecondary, px: 1.6, py: 0.45, fontSize: 12, fontWeight: 600, textTransform: "none" },
                    "& .Mui-selected": { background: "#2563eb !important", color: "white !important", borderColor: "#2563eb !important" } }}>
              {[{ v: "week", l: "This Week" }, { v: "month", l: "This Month" }, { v: "custom", l: "Custom" }].map(({ v, l }) => (
                <ToggleButton key={v} value={v}>{l}</ToggleButton>
              ))}
            </ToggleButtonGroup>

            {dateMode === "custom" && (
              <Box display="flex" alignItems="center" gap={0.8}>
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

            <Button size="small" variant="outlined" startIcon={<RefreshIcon fontSize="small" />}
              onClick={() => fetchInvoice(selCustomer?.customer_id)}
              sx={{ textTransform: "none", fontWeight: 600, fontSize: 12, borderRadius: "8px", borderColor: border, color: textSecondary }}>
              Apply
            </Button>
          </Box>

          {invLoading && <Box py={6} textAlign="center"><CircularProgress size={24} sx={{ color: "#2563eb" }} /></Box>}

          {!invLoading && invoiceData && (() => {
            const { orders, price_per_unit } = invoiceData
            const totalQty = orders.reduce((s, o) => s + o.quantity, 0)
            const totalAmt = orders.reduce((s, o) => s + o.quantity * price_per_unit, 0)
            const paidAmt  = orders.filter((o) => o.is_delivered).reduce((s, o) => s + o.quantity * price_per_unit, 0)

            return (
              <>
                {/* Summary chips */}
                <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
                  {[
                    { label: `${orders.length} orders`, color: "#2563eb", bg: "#eff6ff" },
                    { label: `${totalQty} packets`, color: "#7c3aed", bg: "#faf5ff" },
                    { label: `₹${totalAmt.toFixed(2)} total`, color: "#111827", bg: "#f3f4f6" },
                    { label: `₹${paidAmt.toFixed(2)} delivered`, color: "#16a34a", bg: "#f0fdf4" },
                    { label: `₹${(totalAmt - paidAmt).toFixed(2)} pending`, color: "#f97316", bg: "#fff7ed" },
                  ].map((s) => (
                    <Box key={s.label} sx={{ px: 1.5, py: 0.5, borderRadius: 2, background: s.bg }}>
                      <Typography fontSize={12} fontWeight={700} color={s.color}>{s.label}</Typography>
                    </Box>
                  ))}
                </Box>

                {orders.length === 0 ? (
                  <Box py={4} textAlign="center">
                    <Typography color={textSecondary} fontSize={13}>No orders in this period.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background: bgCard }}>
                          {["#", "Date", "Qty", "Rate/unit", "Amount", "Status"].map((h) => (
                            <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, color: textSecondary, borderColor: border }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((o, i) => {
                          const amt = o.quantity * price_per_unit
                          return (
                            <TableRow key={i} sx={{ "&:hover": { background: bgCard } }}>
                              <TableCell sx={{ fontSize: 12, color: textSecondary, borderColor: border }}>{i + 1}</TableCell>
                              <TableCell sx={{ fontSize: 12, color: textPrimary, borderColor: border, fontWeight: 500 }}>{String(o.order_date).slice(0, 10)}</TableCell>
                              <TableCell sx={{ fontSize: 12, color: textPrimary, borderColor: border }}>{o.quantity}</TableCell>
                              <TableCell sx={{ fontSize: 12, color: textSecondary, borderColor: border }}>₹{Number(price_per_unit).toFixed(2)}</TableCell>
                              <TableCell sx={{ fontSize: 12, fontWeight: 700, color: textPrimary, borderColor: border }}>₹{amt.toFixed(2)}</TableCell>
                              <TableCell sx={{ borderColor: border }}>
                                <Chip
                                  label={o.is_delivered ? "Delivered" : "Pending"}
                                  size="small"
                                  icon={o.is_delivered ? <CheckCircleIcon sx={{ fontSize: "12px !important" }} /> : <HourglassEmptyIcon sx={{ fontSize: "12px !important" }} />}
                                  sx={{
                                    fontSize: 11, fontWeight: 600, height: 20,
                                    background: o.is_delivered ? "#dcfce7" : "#fff7ed",
                                    color: o.is_delivered ? "#16a34a" : "#f97316",
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        {/* Total row */}
                        <TableRow sx={{ background: bgCard }}>
                          <TableCell colSpan={4} sx={{ fontWeight: 700, fontSize: 13, color: textPrimary, borderColor: border }}>Total</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: 13, color: "#2563eb", borderColor: border }}>₹{totalAmt.toFixed(2)}</TableCell>
                          <TableCell sx={{ borderColor: border }} />
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </>
            )
          })()}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${border}` }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: "none", color: textSecondary }}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon fontSize="small" />}
            disabled={!invoiceData || invLoading || (invoiceData?.orders?.length === 0)}
            onClick={downloadPDF}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "8px", background: "#7c3aed", "&:hover": { background: "#6d28d9" } }}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}
