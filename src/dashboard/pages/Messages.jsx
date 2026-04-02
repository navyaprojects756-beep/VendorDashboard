import { useEffect, useState, useRef } from "react"
import API, { getToken } from "../../services/api"
import {
  Box, Typography, Paper, Chip, CircularProgress,
  Badge, Divider, IconButton, Tooltip,
} from "@mui/material"
import MessageIcon      from "@mui/icons-material/Message"
import RefreshIcon      from "@mui/icons-material/Refresh"
import ImageIcon        from "@mui/icons-material/Image"
import MicIcon          from "@mui/icons-material/Mic"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"
import ArrowBackIcon    from "@mui/icons-material/ArrowBack"

function msgIcon(type) {
  if (type === "image")    return <ImageIcon sx={{ fontSize: 14 }} />
  if (type === "audio")    return <MicIcon   sx={{ fontSize: 14 }} />
  if (type === "document") return <InsertDriveFileIcon sx={{ fontSize: 14 }} />
  return null
}

function fmtTime(val) {
  if (!val) return ""
  const d = new Date(val)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

function fmtFull(val) {
  if (!val) return ""
  return new Date(val).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

function msgPreview(m) {
  if (m.content) return m.content
  if (m.message_type === "image")    return "📷 Image"
  if (m.message_type === "audio")    return "🎵 Audio"
  if (m.message_type === "document") return "📄 Document"
  if (m.message_type === "video")    return "🎬 Video"
  return "Message"
}

export default function Messages() {
  const [conversations, setConversations]   = useState([])
  const [selected,      setSelected]        = useState(null)  // phone string
  const [thread,        setThread]          = useState([])
  const [loading,       setLoading]         = useState(true)
  const [threadLoading, setThreadLoading]   = useState(false)
  const [isMobile,      setIsMobile]        = useState(window.innerWidth < 700)
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
      // mark as read in local state
      setConversations(prev => prev.map(c =>
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [thread])

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 700)
    window.addEventListener("resize", handle)
    return () => window.removeEventListener("resize", handle)
  }, [])

  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0)

  const showList   = !isMobile || !selected
  const showThread = !isMobile || !!selected

  return (
    <Box sx={{ maxWidth: 900, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>

      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Badge badgeContent={totalUnread || null} color="error">
            <MessageIcon sx={{ color: "#2563eb" }} />
          </Badge>
          <Typography fontWeight={700} fontSize={17}>Messages</Typography>
          {totalUnread > 0 && (
            <Chip label={`${totalUnread} unread`} size="small" color="error"
              sx={{ fontWeight: 600, fontSize: 11, height: 20 }} />
          )}
        </Box>
        <Tooltip title="Refresh">
          <IconButton size="small" onClick={() => loadConvos()}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper elevation={0} sx={{
        borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden",
        display: "flex", height: "calc(100vh - 200px)", minHeight: 400,
      }}>

        {/* Conversation List */}
        {showList && (
          <Box sx={{
            width: isMobile ? "100%" : 280,
            borderRight: isMobile ? "none" : "1px solid #e5e7eb",
            overflowY: "auto",
            flexShrink: 0,
          }}>
            {loading ? (
              <Box display="flex" justifyContent="center" pt={4}><CircularProgress size={28} /></Box>
            ) : conversations.length === 0 ? (
              <Box py={6} textAlign="center" px={2}>
                <MessageIcon sx={{ fontSize: 40, color: "#d1d5db", mb: 1 }} />
                <Typography color="text.secondary" fontSize={13}>
                  No messages yet. Unhandled WhatsApp messages from customers will appear here.
                </Typography>
              </Box>
            ) : (
              conversations.map((c, i) => {
                const isActive = selected === c.phone
                const hasUnread = (c.unread_count || 0) > 0
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
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography fontWeight={hasUnread ? 700 : 600} fontSize={13.5} color={isActive ? "#2563eb" : "text.primary"}>
                          {c.phone}
                        </Typography>
                        <Typography fontSize={11} color="text.disabled" flexShrink={0} ml={1}>
                          {fmtTime(c.created_at)}
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.3}>
                        <Typography fontSize={12} color="text.secondary"
                          sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                          {msgPreview(c)}
                        </Typography>
                        {hasUnread && (
                          <Chip
                            label={c.unread_count}
                            size="small"
                            color="primary"
                            sx={{ fontSize: 10, height: 18, minWidth: 18, ml: 0.5, fontWeight: 700 }}
                          />
                        )}
                      </Box>
                    </Box>
                    {i < conversations.length - 1 && <Divider />}
                  </Box>
                )
              })
            )}
          </Box>
        )}

        {/* Thread Panel */}
        {showThread && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {!selected ? (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center"
                height="100%" gap={1} color="text.disabled">
                <MessageIcon sx={{ fontSize: 48 }} />
                <Typography fontSize={14}>Select a conversation</Typography>
              </Box>
            ) : (
              <>
                {/* Thread header */}
                <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 1 }}>
                  {isMobile && (
                    <IconButton size="small" onClick={() => setSelected(null)}>
                      <ArrowBackIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Box>
                    <Typography fontWeight={700} fontSize={14}>{selected}</Typography>
                    <Typography fontSize={11} color="text.secondary">WhatsApp</Typography>
                  </Box>
                </Box>

                {/* Messages */}
                <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {threadLoading ? (
                    <Box display="flex" justifyContent="center" pt={4}><CircularProgress size={24} /></Box>
                  ) : thread.length === 0 ? (
                    <Typography color="text.secondary" fontSize={13} textAlign="center" mt={4}>
                      No messages in this conversation.
                    </Typography>
                  ) : (
                    thread.map(m => {
                      const isInbound = m.direction === "inbound"
                      return (
                        <Box key={m.message_id} display="flex"
                          justifyContent={isInbound ? "flex-start" : "flex-end"}>
                          <Box sx={{
                            maxWidth: "75%",
                            px: 1.5, py: 1,
                            borderRadius: isInbound ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                            background: isInbound ? "#f3f4f6" : "#dbeafe",
                            position: "relative",
                          }}>
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

                {/* Info bar */}
                <Box sx={{
                  px: 2, py: 1, borderTop: "1px solid #e5e7eb",
                  background: "#fafafa",
                }}>
                  <Typography fontSize={12} color="text.secondary">
                    💡 Replies are sent automatically. Customer receives the auto-reply with your contact number.
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
