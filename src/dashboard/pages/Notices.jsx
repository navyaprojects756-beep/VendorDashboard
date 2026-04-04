import React, { useEffect, useMemo, useState } from "react"
import API, { getToken } from "../../services/api"
import { formatISTDate, getISTDate, getISTDateStr } from "../../utils/istDate"
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import CampaignIcon from "@mui/icons-material/Campaign"
import SearchIcon from "@mui/icons-material/Search"
import ApartmentIcon from "@mui/icons-material/Apartment"
import HomeIcon from "@mui/icons-material/Home"
import GridViewIcon from "@mui/icons-material/GridView"
import SendIcon from "@mui/icons-material/Send"
import RefreshIcon from "@mui/icons-material/Refresh"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import HistoryIcon from "@mui/icons-material/History"

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

const toNum = (value) => Number.parseFloat(value || 0) || 0

function StatTile({ label, value, tone, dark }) {
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
    <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${dark ? "#1e293b" : "#e5e7eb"}`, background: backgrounds[tone] }}>
      <Typography fontSize={12} color={dark ? "#94a3b8" : "#6b7280"}>{label}</Typography>
      <Typography fontWeight={800} fontSize={{ xs: 24, sm: 28 }} sx={{ color: colors[tone], mt: 0.5, lineHeight: 1.1 }}>{value}</Typography>
    </Paper>
  )
}

export default function Notices({ dark }) {
  const monthRange = getThisMonthRange()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [config, setConfig] = useState({ templates: [], reasons: [], apartments: [] })
  const [audience, setAudience] = useState([])
  const [history, setHistory] = useState([])
  const [summary, setSummary] = useState({ totalCustomers: 0, notPaidCustomers: 0, totalOutstanding: 0 })
  const [search, setSearch] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [blockFilter, setBlockFilter] = useState("")
  const [dateMode, setDateMode] = useState("month")
  const [fromDate, setFromDate] = useState(monthRange.from)
  const [toDate, setToDate] = useState(monthRange.to)
  const [templateKey, setTemplateKey] = useState("delivery_unavailable_date")
  const [reasonCode, setReasonCode] = useState("")
  const [noticeDate, setNoticeDate] = useState(getISTDateStr(1))
  const [noticeFrom, setNoticeFrom] = useState(getISTDateStr(1))
  const [noticeTo, setNoticeTo] = useState(getISTDateStr(1))
  const [blocks, setBlocks] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  const border = dark ? "#1e293b" : "#e5e7eb"
  const bg = dark ? "#0f172a" : "#ffffff"
  const textPrimary = dark ? "#f1f5f9" : "#111827"
  const textSecondary = dark ? "#94a3b8" : "#6b7280"

  const activeTemplate = useMemo(
    () => config.templates.find((t) => t.template_key === templateKey) || null,
    [config.templates, templateKey]
  )

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

  useEffect(() => {
    if (!reasonCode && config.reasons.length) setReasonCode(config.reasons[0].reason_code)
  }, [config.reasons, reasonCode])

  const loadAll = async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    setError("")
    try {
      const [cfg, aud, hist] = await Promise.all([
        API.get(`/notices/config?token=${getToken()}`),
        API.get(`/notices/audience?token=${getToken()}&from=${fromDate}&to=${toDate}&search=${encodeURIComponent(search)}&location=${encodeURIComponent(locationFilter)}&block=${encodeURIComponent(blockFilter)}&template_key=${templateKey}`),
        API.get(`/notices/history?token=${getToken()}`),
      ])
      setConfig(cfg.data)
      setAudience(aud.data.customers || [])
      setSummary(aud.data.summary || { totalCustomers: 0, notPaidCustomers: 0, totalOutstanding: 0 })
      setBlocks(aud.data.blocks || [])
      setHistory(hist.data.history || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load notices")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [fromDate, toDate, templateKey, locationFilter, blockFilter, search])

  const handleSend = async () => {
    setSending(true)
    setError("")
    setResult(null)
    try {
      const payload = {
        template_key: templateKey,
        reason_code: reasonCode || null,
        notice_date: noticeDate,
        notice_from: noticeFrom,
        notice_to: noticeTo,
        filter_from: fromDate,
        filter_to: toDate,
        search,
        location: locationFilter,
        block: blockFilter,
      }
      const res = await API.post(`/notices/send?token=${getToken()}`, payload)
      setResult(res.data)
      await loadAll(true)
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to send notices")
    } finally {
      setSending(false)
    }
  }

  const reasonRequired = templateKey === "delivery_unavailable_date" || templateKey === "delivery_unavailable_from_to"
  const templateLabel = activeTemplate?.display_name || "Notice"

  return (
    <Box sx={{ maxWidth: 1180, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>
      <Box display="flex" alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" mb={2} gap={2} flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={1.2}>
          <Box sx={{ width: 38, height: 38, borderRadius: "12px", background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CampaignIcon sx={{ fontSize: 18, color: "white" }} />
          </Box>
          <Box>
            <Typography fontWeight={800} fontSize={18} color={textPrimary}>Customer Notices</Typography>
            <Typography fontSize={12.5} color={textSecondary}>Send approved operational WhatsApp template notices to filtered customers.</Typography>
          </Box>
        </Box>
        <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={() => loadAll(true)} disabled={refreshing} sx={{ borderRadius: 2, textTransform: "none" }}>Refresh</Button>
      </Box>

      {error ? <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert> : null}
      {result ? <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Sent {result.sent_count} notices{result.failed_count ? `, ${result.failed_count} failed` : ""}.</Alert> : null}

      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={1.5} mb={2}>
        <StatTile label="Filtered Customers" value={summary.totalCustomers} tone="blue" dark={dark} />
        <StatTile label="Need To Pay" value={summary.notPaidCustomers} tone="orange" dark={dark} />
        <StatTile label="Outstanding Total" value={`Rs.${summary.totalOutstanding.toFixed(0)}`} tone="green" dark={dark} />
      </Box>

      <Paper elevation={0} sx={{ p: 1.5, mb: 2, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
        <Stack spacing={1.2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.2}>
            <TextField
              size="small"
              placeholder="Search name, phone or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: textSecondary }} /></InputAdornment> }}
              sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2, fontSize: 13 } }}
            />
            <Select
              size="small"
              value={locationFilter}
              displayEmpty
              onChange={(e) => { setLocationFilter(e.target.value); setBlockFilter("") }}
              startAdornment={<InputAdornment position="start">{locationFilter === INDIVIDUAL_VALUE ? <HomeIcon fontSize="small" sx={{ color: textSecondary, ml: 0.5 }} /> : <ApartmentIcon fontSize="small" sx={{ color: textSecondary, ml: 0.5 }} />}</InputAdornment>}
              sx={{ minWidth: { xs: "100%", md: 210 }, borderRadius: 2, fontSize: 13 }}
            >
              <MenuItem value="">All Locations</MenuItem>
              <MenuItem value={INDIVIDUAL_VALUE}>Individual Houses</MenuItem>
              {(config.apartments || []).map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
            </Select>
            <Select
              size="small"
              value={blockFilter}
              displayEmpty
              disabled={!locationFilter || locationFilter === INDIVIDUAL_VALUE}
              onChange={(e) => setBlockFilter(e.target.value)}
              startAdornment={<InputAdornment position="start"><GridViewIcon fontSize="small" sx={{ color: textSecondary, ml: 0.5 }} /></InputAdornment>}
              sx={{ minWidth: { xs: "100%", md: 180 }, borderRadius: 2, fontSize: 13 }}
            >
              <MenuItem value="">All Blocks</MenuItem>
              {blocks.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
            </Select>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ xs: "stretch", md: "center" }}>
            <ToggleButtonGroup size="small" exclusive value={dateMode} onChange={(_, value) => value && setDateMode(value)} sx={{ flexWrap: "wrap" }}>
              <ToggleButton value="today">Today</ToggleButton>
              <ToggleButton value="month">This Month</ToggleButton>
              <ToggleButton value="custom">Custom</ToggleButton>
            </ToggleButtonGroup>
            {dateMode === "custom" ? (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                <TextField size="small" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} sx={{ minWidth: 160 }} />
                <TextField size="small" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} sx={{ minWidth: 160 }} />
              </Stack>
            ) : (
              <Chip icon={<HistoryIcon />} label={monthRange.label && dateMode === "month" ? monthRange.label : formatISTDate(fromDate)} variant="outlined" sx={{ borderRadius: 2 }} />
            )}
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
        <Stack spacing={1.5}>
          <Typography fontWeight={800} fontSize={16} color={textPrimary}>Send Notice</Typography>
          <Select size="small" value={templateKey} onChange={(e) => setTemplateKey(e.target.value)} sx={{ borderRadius: 2 }}>
            {(config.templates || []).map((template) => (
              <MenuItem key={template.template_key} value={template.template_key}>{template.display_name}</MenuItem>
            ))}
          </Select>

          {reasonRequired ? (
            <Select size="small" value={reasonCode} onChange={(e) => setReasonCode(e.target.value)} sx={{ borderRadius: 2 }}>
              {(config.reasons || []).map((reason) => (
                <MenuItem key={reason.reason_code} value={reason.reason_code}>{reason.display_name}</MenuItem>
              ))}
            </Select>
          ) : null}

          {templateKey === "delivery_unavailable_date" ? (
            <TextField size="small" type="date" label="Delivery Date" value={noticeDate} onChange={(e) => setNoticeDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          ) : null}

          {templateKey === "delivery_unavailable_from_to" ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <TextField size="small" type="date" label="From Date" value={noticeFrom} onChange={(e) => setNoticeFrom(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField size="small" type="date" label="To Date" value={noticeTo} onChange={(e) => setNoticeTo(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>
          ) : null}

          {templateKey === "payment_due_reminder" ? (
            <Alert severity="info" icon={<WarningAmberIcon />} sx={{ borderRadius: 2 }}>
              Amount is calculated in backend from the selected date range and filtered customers. Only customers with outstanding balance will receive this reminder.
            </Alert>
          ) : null}

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, background: dark ? "#111827" : "#f8fafc", border: `1px dashed ${border}` }}>
            <Typography fontWeight={700} fontSize={13} color={textPrimary}>{templateLabel}</Typography>
            <Typography fontSize={12} color={textSecondary} sx={{ mt: 0.5 }}>Recipients: {summary.totalCustomers}</Typography>
            {templateKey === "payment_due_reminder" ? <Typography fontSize={12} color={textSecondary}>Need To Pay: {summary.notPaidCustomers}</Typography> : null}
          </Paper>

          <Button variant="contained" startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />} disabled={sending || summary.totalCustomers === 0} onClick={handleSend} sx={{ alignSelf: "flex-start", borderRadius: 2, textTransform: "none", px: 2.2 }}>
            {sending ? "Sending..." : "Send Notice"}
          </Button>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
          <Typography fontWeight={800} fontSize={16} color={textPrimary} mb={1}>Recipients</Typography>
          {loading ? <Box py={5} textAlign="center"><CircularProgress /></Box> : audience.length === 0 ? <Typography color={textSecondary}>No customers match the selected filters.</Typography> : (
            <Stack spacing={1.2}>
              {audience.map((row) => (
                <Paper key={`${row.customer_id}-${row.customer_phone}`} elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${dark ? "#1f2937" : "#e5e7eb"}`, background: dark ? "#0b1220" : "#ffffff" }}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography fontWeight={800} fontSize={14} color={textPrimary}>{row.customer_name || row.customer_phone}</Typography>
                      <Typography fontSize={12} color={textSecondary}>{row.customer_phone}</Typography>
                      <Typography fontSize={12.5} color={textSecondary} sx={{ mt: 0.5 }}>{row.address || "No address"}</Typography>
                    </Box>
                    <Stack alignItems={{ xs: "flex-start", sm: "flex-end" }} spacing={0.5}>
                      {toNum(row.outstanding) > 0 ? <Chip size="small" color="warning" label={`Outstanding Rs.${toNum(row.outstanding).toFixed(0)}`} /> : <Chip size="small" color="success" label="No outstanding" />}
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>

        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${border}`, background: bg }}>
          <Typography fontWeight={800} fontSize={16} color={textPrimary} mb={1}>Recent Notice History</Typography>
          {!history.length ? <Typography color={textSecondary}>No notices sent yet.</Typography> : (
            <Stack spacing={1.2}>
              {history.map((item) => (
                <Paper key={item.notice_batch_id} elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: `1px solid ${dark ? "#1f2937" : "#e5e7eb"}`, background: dark ? "#0b1220" : "#ffffff" }}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                    <Box>
                      <Typography fontWeight={800} fontSize={14} color={textPrimary}>{item.template_display_name || item.template_key}</Typography>
                      <Typography fontSize={12} color={textSecondary}>{formatISTDate(item.created_on)} • Sent {item.sent_count} • Failed {item.failed_count}</Typography>
                      {item.reason_display_name ? <Typography fontSize={12.5} color={textSecondary}>Reason: {item.reason_display_name}</Typography> : null}
                    </Box>
                    <Chip size="small" color={item.status === "completed" ? "success" : "warning"} label={item.status} />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Box>
  )
}

