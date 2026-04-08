import { useEffect, useMemo, useRef, useState } from "react"
import API, { getToken } from "../../services/api"
import {
  Box, Typography, Paper, Chip, CircularProgress,
  Badge, Divider, IconButton, Tooltip, TextField,
  InputAdornment, Select, MenuItem, ToggleButtonGroup,
  ToggleButton, Button,
} from "@mui/material"
import MessageIcon from "@mui/icons-material/Message"
import RefreshIcon from "@mui/icons-material/Refresh"
import ImageIcon from "@mui/icons-material/Image"
import MicIcon from "@mui/icons-material/Mic"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import SearchIcon from "@mui/icons-material/Search"
import ApartmentIcon from "@mui/icons-material/Apartment"
import GridViewIcon from "@mui/icons-material/GridView"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import HomeIcon from "@mui/icons-material/Home"
import PersonIcon from "@mui/icons-material/Person"
import { formatISTDate, formatISTDateTime, getISTDateStr, getISTNow, toISTDateStr } from "../../utils/istDate"

const INDIVIDUAL_VALUE = "__individual__"

function msgIcon(type) {
  if (type === "image") return <ImageIcon sx={{ fontSize: 14 }} />
  if (type === "audio") return <MicIcon sx={{ fontSize: 14 }} />
  if (type === "document") return <InsertDriveFileIcon sx={{ fontSize: 14 }} />
  return null
}

function fmtTime(val) {
  if (!val) return ""
  const d = new Date(val)
  const now = getISTNow()
  const isToday = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) === now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })
  if (isToday) return formatISTDateTime(val, { hour: "2-digit", minute: "2-digit" })
  return formatISTDate(val, { day: "numeric", month: "short" })
}

function fmtFull(val) {
  if (!val) return ""
  return formatISTDateTime(val)
}

function msgPreview(m) {
  if (m.content) return m.content
  if (m.message_type === "image") return "Photo"
  if (m.message_type === "audio") return "Voice message"
  if (m.message_type === "document") return "Document"
  if (m.message_type === "video") return "Video"
  return "Message"
}

function safeText(value, fallback = "") {
  const text = String(value || "").trim()
  return text || fallback
}

function locationLabel(convo) {
  if (convo?.address_type === "apartment") return convo.apartment_name || "Apartment"
  return "Individual"
}

export default function Messages() {
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [selectedMeta, setSelectedMeta] = useState(null)
  const [thread, setThread] = useState([])
  const [loading, setLoading] = useState(true)
  const [threadLoading, setThreadLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 700)
  const [search, setSearch] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [blockFilter, setBlockFilter] = useState("")
  const [dateMode, setDateMode] = useState("all")
  const [fromDate, setFromDate] = useState(getISTDateStr(0))
  const [toDate, setToDate] = useState(getISTDateStr(0))
  const [replyText, setReplyText] = useState("")
  const [sendingReply, setSendingReply] = useState(false)
  const bottomRef = useRef(null)

  const loadConvos = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const r = await API.get(`/messages?token=${getToken()}`)
      setConversations(r.data.conversations || [])
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const loadThread = async (phone) => {
    setThreadLoading(true)
    try {
      const r = await API.get(`/messages/thread/${encodeURIComponent(phone)}?token=${getToken()}`)
      setThread(r.data.messages || [])
      setSelectedMeta(r.data.conversation || { phone })
      setConversations((prev) => prev.map((c) =>
        c.phone === phone ? { ...c, unread_count: 0, is_read: true } : c
      ))
    } finally {
      setThreadLoading(false)
    }
  }

  useEffect(() => {
    loadConvos()
    const interval = setInterval(() => loadConvos(true), 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (selected) loadThread(selected)
  }, [selected])

  useEffect(() => {
    setReplyText("")
  }, [selected])

  useEffect(() => {
    if (!selected) {
      setSelectedMeta(null)
      return
    }
    const convo = conversations.find((c) => c.phone === selected)
    if (convo) setSelectedMeta(convo)
  }, [selected, conversations])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [thread])

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 700)
    window.addEventListener("resize", handle)
    return () => window.removeEventListener("resize", handle)
  }, [])

  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0)

  const apartments = useMemo(
    () => [...new Map(conversations.filter((c) => c.address_type === "apartment" && c.apartment_id).map((c) => [String(c.apartment_id), { apartment_id: String(c.apartment_id), apartment_name: c.apartment_name }])).values()],
    [conversations]
  )

  const blocks = useMemo(() => {
    if (!locationFilter || locationFilter === INDIVIDUAL_VALUE) return []
    return [...new Map(conversations.filter((c) => String(c.apartment_id || "") === String(locationFilter) && c.block_id).map((c) => [String(c.block_id), { block_id: String(c.block_id), block_name: c.block_name }])).values()]
  }, [conversations, locationFilter])

  const filteredConversations = useMemo(() => {
    const today = getISTDateStr(0)
    return conversations.filter((c) => {
      const createdAt = new Date(c.created_at)
      if (Number.isNaN(createdAt.getTime())) return false
      const convoDate = toISTDateStr(createdAt)
      const inDateRange = dateMode === "all"
        ? true
        : dateMode === "custom"
          ? convoDate >= fromDate && convoDate <= toDate
          : convoDate === today
      if (!inDateRange) return false

      if (locationFilter === INDIVIDUAL_VALUE && c.address_type === "apartment") return false
      if (locationFilter && locationFilter !== INDIVIDUAL_VALUE && String(c.apartment_id || "") !== String(locationFilter)) return false
      if (blockFilter && String(c.block_id || "") !== String(blockFilter)) return false

      if (!search.trim()) return true
      const q = search.toLowerCase()
      return [
        c.phone,
        c.customer_name,
        c.address,
        c.apartment_name,
        c.block_name,
        msgPreview(c),
      ].some((value) => String(value || "").toLowerCase().includes(q))
    })
  }, [blockFilter, conversations, dateMode, fromDate, locationFilter, search, toDate])

  const showList = !isMobile || !selected
  const showThread = !isMobile || !!selected

  const sendReply = async () => {
    const text = replyText.trim()
    if (!selected || !text || sendingReply) return
    setSendingReply(true)
    try {
      const r = await API.post(
        `/messages/thread/${encodeURIComponent(selected)}/reply?token=${getToken()}`,
        { text }
      )
      if (r.data?.message) {
        setThread((prev) => [...prev, r.data.message])
        setConversations((prev) => prev.map((c) =>
          c.phone === selected
            ? { ...c, content: text, direction: "outbound", message_type: "text", created_at: r.data.message.created_at }
            : c
        ))
      } else {
        await loadThread(selected)
      }
      setReplyText("")
    } catch (err) {
      window.alert(err.response?.data?.message || "Failed to send reply")
    } finally {
      setSendingReply(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 1080, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>
      <Paper elevation={0} sx={{ px: 1.5, py: 1.25, mb: 2, borderRadius: 4, border: "1px solid #dde5ef", background: "linear-gradient(135deg, #ffffff 0%, #f7fbff 60%, #fffaf0 100%)", boxShadow: "0 10px 28px rgba(15,23,42,0.04)" }}>
        <Box display="flex" alignItems="center" gap={0.8} mb={1.1}>
          <CalendarTodayIcon sx={{ fontSize: 17, color: "#64748b" }} />
          <Typography fontSize={13} fontWeight={800} color="#334155">Filters</Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search name, phone, message or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: "text.disabled" }} /></InputAdornment>) }}
            sx={{ flex: "1 1 220px", minWidth: 190, "& .MuiOutlinedInput-root": { borderRadius: 3, fontSize: 13, background: "#f8fafc" } }}
          />
          <ToggleButtonGroup
            size="small"
            exclusive
            value={dateMode}
            onChange={(_, value) => {
              if (!value) return
              setDateMode(value)
              if (value !== "custom") {
                const today = getISTDateStr(0)
                setFromDate(today)
                setToDate(today)
              }
            }}
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
            }}>
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="today">Today</ToggleButton>
            <ToggleButton value="custom">Custom</ToggleButton>
          </ToggleButtonGroup>
          {dateMode === "custom" && (
            <Box display="flex" alignItems="center" gap={0.8} flexWrap="wrap">
              <TextField type="date" size="small" label="From" value={fromDate} onChange={(e) => setFromDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 142, "& .MuiOutlinedInput-root": { borderRadius: 3, fontSize: 13 } }} />
              <TextField type="date" size="small" label="To" value={toDate} inputProps={{ min: fromDate }} onChange={(e) => setToDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 142, "& .MuiOutlinedInput-root": { borderRadius: 3, fontSize: 13 } }} />
            </Box>
          )}
          <Select size="small" value={locationFilter} displayEmpty onChange={(e) => { setLocationFilter(e.target.value); setBlockFilter("") }} startAdornment={(<InputAdornment position="start">{locationFilter === INDIVIDUAL_VALUE ? <HomeIcon fontSize="small" sx={{ color: "text.disabled", ml: 0.5 }} /> : <ApartmentIcon fontSize="small" sx={{ color: "text.disabled", ml: 0.5 }} />}</InputAdornment>)} sx={{ minWidth: 180, borderRadius: 3, fontSize: 13, background: "#f8fafc" }}>
            <MenuItem value="">All Locations</MenuItem>
            <MenuItem value={INDIVIDUAL_VALUE}>Individual Houses</MenuItem>
            {apartments.map((item) => (<MenuItem key={item.apartment_id} value={item.apartment_id}>{item.apartment_name}</MenuItem>))}
          </Select>
          <Select size="small" value={blockFilter} displayEmpty disabled={!locationFilter || locationFilter === INDIVIDUAL_VALUE} onChange={(e) => setBlockFilter(e.target.value)} startAdornment={(<InputAdornment position="start"><GridViewIcon fontSize="small" sx={{ color: "text.disabled", ml: 0.5 }} /></InputAdornment>)} sx={{ minWidth: 150, borderRadius: 3, fontSize: 13, background: "#f8fafc" }}>
            <MenuItem value="">All Blocks</MenuItem>
            {blocks.map((item) => (<MenuItem key={item.block_id} value={item.block_id}>{item.block_name}</MenuItem>))}
          </Select>
        </Box>
      </Paper>

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Badge badgeContent={totalUnread || null} color="error">
            <MessageIcon sx={{ color: "#2563eb" }} />
          </Badge>
          <Typography fontWeight={700} fontSize={17}>Messages</Typography>
          {totalUnread > 0 && (
            <Chip label={`${totalUnread} unread`} size="small" color="error" sx={{ fontWeight: 600, fontSize: 11, height: 20 }} />
          )}
        </Box>
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={() => loadConvos()}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden", display: "flex", height: "calc(100vh - 280px)", minHeight: 470 }}>
        {showList && (
          <Box sx={{ width: isMobile ? "100%" : 340, borderRight: isMobile ? "none" : "1px solid #e5e7eb", overflowY: "auto", flexShrink: 0 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" pt={4}><CircularProgress size={28} /></Box>
            ) : filteredConversations.length === 0 ? (
              <Box py={6} textAlign="center" px={2}>
                <MessageIcon sx={{ fontSize: 40, color: "#d1d5db", mb: 1 }} />
                <Typography color="text.secondary" fontSize={13}>
                  No conversations match the current filters.
                </Typography>
              </Box>
            ) : (
              filteredConversations.map((c, i) => {
                const isActive = selected === c.phone
                const hasUnread = (c.unread_count || 0) > 0
                const title = safeText(c.customer_name, c.phone)
                const subtitle = c.customer_name ? c.phone : "WhatsApp"
                return (
                  <Box key={c.phone}>
                    <Box
                      onClick={() => setSelected(c.phone)}
                      sx={{
                        px: 2, py: 1.5, cursor: "pointer",
                        background: isActive ? "#eff6ff" : "transparent",
                        "&:hover": { background: isActive ? "#eff6ff" : "#f9fafb" },
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                        <Box minWidth={0} flex={1}>
                          <Box display="flex" alignItems="center" gap={0.7} flexWrap="wrap">
                            <Typography fontWeight={hasUnread ? 700 : 600} fontSize={13.5} color={isActive ? "#2563eb" : "text.primary"} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
                              {title}
                            </Typography>
                            <Chip label={locationLabel(c)} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, background: c.address_type === "apartment" ? "#eff6ff" : "#f3f4f6", color: c.address_type === "apartment" ? "#2563eb" : "#475569" }} />
                          </Box>
                          <Typography fontSize={11} color="text.secondary" sx={{ mt: 0.15 }}>
                            {subtitle}
                          </Typography>
                        </Box>
                        <Typography fontSize={11} color="text.disabled" flexShrink={0}>
                          {fmtTime(c.created_at)}
                        </Typography>
                      </Box>

                      {c.address && (
                        <Typography fontSize={11.5} color="text.secondary" sx={{ mt: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.address}
                        </Typography>
                      )}

                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5} gap={1}>
                        <Typography fontSize={12} color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                          {msgPreview(c)}
                        </Typography>
                        {hasUnread && (
                          <Chip label={c.unread_count} size="small" color="primary" sx={{ fontSize: 10, height: 18, minWidth: 18, fontWeight: 700 }} />
                        )}
                      </Box>
                    </Box>
                    {i < filteredConversations.length - 1 && <Divider />}
                  </Box>
                )
              })
            )}
          </Box>
        )}

        {showThread && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {!selected ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={1} color="text.disabled">
                <MessageIcon sx={{ fontSize: 48 }} />
                <Typography fontSize={14}>Select a conversation</Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 1 }}>
                  {isMobile && (
                    <IconButton size="small" onClick={() => setSelected(null)}>
                      <ArrowBackIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Box minWidth={0}>
                    <Box display="flex" alignItems="center" gap={0.8} flexWrap="wrap">
                      <Typography fontWeight={700} fontSize={14}>{safeText(selectedMeta?.customer_name, selected)}</Typography>
                      {selectedMeta?.address_type === "apartment" ? (
                        <Chip size="small" icon={<ApartmentIcon sx={{ fontSize: "14px !important" }} />} label={selectedMeta?.apartment_name || "Apartment"} sx={{ height: 20, fontSize: 10, fontWeight: 700, background: "#eff6ff", color: "#2563eb" }} />
                      ) : (
                        <Chip size="small" icon={<HomeIcon sx={{ fontSize: "14px !important" }} />} label="Individual" sx={{ height: 20, fontSize: 10, fontWeight: 700, background: "#f3f4f6", color: "#475569" }} />
                      )}
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.6} mt={0.3} flexWrap="wrap">
                      <PersonIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                      <Typography fontSize={11} color="text.secondary">{selectedMeta?.phone || selected}</Typography>
                    </Box>
                    {selectedMeta?.address && (
                      <Typography fontSize={11} color="text.secondary" sx={{ mt: 0.25 }}>{selectedMeta.address}</Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {threadLoading ? (
                    <Box display="flex" justifyContent="center" pt={4}><CircularProgress size={24} /></Box>
                  ) : thread.length === 0 ? (
                    <Typography color="text.secondary" fontSize={13} textAlign="center" mt={4}>
                      No messages in this conversation.
                    </Typography>
                  ) : (
                    thread.map((m) => {
                      const isInbound = m.direction === "inbound"
                      return (
                        <Box key={m.message_id} display="flex" justifyContent={isInbound ? "flex-start" : "flex-end"}>
                          <Box sx={{ maxWidth: "75%", px: 1.5, py: 1, borderRadius: isInbound ? "4px 12px 12px 12px" : "12px 4px 12px 12px", background: isInbound ? "#f3f4f6" : "#dbeafe", position: "relative" }}>
                            {m.message_type !== "text" && (
                              <Box display="flex" alignItems="center" gap={0.5} mb={0.3} color="text.secondary">
                                {msgIcon(m.message_type)}
                                <Typography fontSize={11} color="text.secondary" textTransform="capitalize">
                                  {m.message_type}
                                </Typography>
                              </Box>
                            )}
                            {m.content ? (
                              <Typography fontSize={13.5} sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                                {m.content}
                              </Typography>
                            ) : (
                              <Typography fontSize={12} color="text.secondary" fontStyle="italic">
                                {m.message_type === "image" ? "Photo" :
                                 m.message_type === "audio" ? "Voice message" :
                                 m.message_type === "document" ? "Document" : "Media"}
                              </Typography>
                            )}
                            <Typography fontSize={10} color="text.disabled" textAlign="right" mt={0.3}>
                              {fmtFull(m.created_at)}
                            </Typography>
                          </Box>
                        </Box>
                      )
                    })
                  )}
                  <div ref={bottomRef} />
                </Box>

                <Box sx={{ px: 1.5, py: 1.2, borderTop: "1px solid #e5e7eb", background: "#fafafa" }}>
                  <Box display="flex" gap={1} alignItems="flex-end">
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      maxRows={4}
                      placeholder="Type a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          sendReply()
                        }
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          background: "white",
                          fontSize: 13,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={sendReply}
                      disabled={!replyText.trim() || sendingReply}
                      sx={{
                        minWidth: 90,
                        height: 40,
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 3,
                        background: "#22c55e",
                        "&:hover": { background: "#16a34a" },
                      }}
                    >
                      {sendingReply ? "Sending..." : "Send"}
                    </Button>
                  </Box>
                  <Typography fontSize={11.5} color="text.secondary" mt={0.8}>
                    Vendor replies are sent directly on WhatsApp while the customer conversation window is active.
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  )
}




