import { useEffect, useState } from "react"
import API, { getToken } from "../services/api"

import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  TextField,
  Grid,
  Switch,
  MenuItem,
  Select,
  InputAdornment,
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material"

import SearchIcon from "@mui/icons-material/Search"
import ApartmentIcon from "@mui/icons-material/Apartment"
import GridViewIcon from "@mui/icons-material/GridView"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [filtered, setFiltered] = useState([])

  const [search, setSearch] = useState("")
  const [apartment, setApartment] = useState("")
  const [block, setBlock] = useState("")

  const [apartments, setApartments] = useState([])
  const [blocks, setBlocks] = useState([])

  const [expanded, setExpanded] = useState({})

  /* LOAD */
  useEffect(() => {
    API.get(`/orders?token=${getToken()}`).then((res) => {
      setOrders(res.data.orders)
      setFiltered(res.data.orders)
      const uniqueApts = [
        ...new Set(res.data.orders.map((o) => o.apartment).filter(Boolean)),
      ]
      setApartments(uniqueApts)
    })
  }, [])

  /* FILTER */
  useEffect(() => {
    let data = orders

    if (search) {
      data = data.filter(
        (o) =>
          o.phone.includes(search) ||
          (o.address || "").toLowerCase().includes(search.toLowerCase())
      )
    }

    if (apartment) {
      data = data.filter((o) => o.apartment === apartment)
      const b = [...new Set(data.map((o) => o.block_name).filter(Boolean))]
      setBlocks(b)
    }

    if (block) {
      data = data.filter((o) => o.block_name === block)
    }

    setFiltered(data)
  }, [search, apartment, block, orders])

  /* TOGGLE DELIVERY */
  const toggleDelivered = async (id) => {
    const res = await API.patch(`/orders/${id}/delivered?token=${getToken()}`)
    setOrders((prev) =>
      prev.map((o) =>
        o.order_id === id
          ? {
              ...o,
              is_delivered: res.data?.is_delivered ?? !o.is_delivered,
              delivered_at: res.data?.delivered_at || o.delivered_at,
            }
          : o
      )
    )
  }

  /* EXPAND ADDRESS */
  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  /* STATS */
  const delivered = filtered.filter((o) => o.is_delivered).length
  const pending = filtered.length - delivered

  return (
    <Box sx={{ maxWidth: 780, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>

      {/* ── STATS ── */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: "linear-gradient(135deg,#16a34a,#22c55e)",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <LocalShippingIcon sx={{ fontSize: 36, opacity: 0.85 }} />
            <Box>
              <Typography fontSize={13} fontWeight={500} sx={{ opacity: 0.9 }}>
                Delivered
              </Typography>
              <Typography variant="h4" fontWeight={700} lineHeight={1.1}>
                {delivered}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: "linear-gradient(135deg,#f97316,#fb923c)",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <HourglassEmptyIcon sx={{ fontSize: 36, opacity: 0.85 }} />
            <Box>
              <Typography fontSize={13} fontWeight={500} sx={{ opacity: 0.9 }}>
                Pending
              </Typography>
              <Typography variant="h4" fontWeight={700} lineHeight={1.1}>
                {pending}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── FILTERS ── */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: "1px solid #e5e7eb" }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by phone or address…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          <Grid item xs={6}>
            <Select
              fullWidth
              size="small"
              value={apartment}
              displayEmpty
              onChange={(e) => {
                setApartment(e.target.value)
                setBlock("")
              }}
              startAdornment={
                <InputAdornment position="start">
                  <ApartmentIcon fontSize="small" sx={{ color: "text.disabled", ml: 0.5 }} />
                </InputAdornment>
              }
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">All Apartments</MenuItem>
              {apartments.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={6}>
            <Select
              fullWidth
              size="small"
              value={block}
              displayEmpty
              disabled={!apartment}
              onChange={(e) => setBlock(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <GridViewIcon fontSize="small" sx={{ color: "text.disabled", ml: 0.5 }} />
                </InputAdornment>
              }
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">All Blocks</MenuItem>
              {blocks.map((b) => (
                <MenuItem key={b} value={b}>
                  {b}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      </Paper>

      {/* ── ORDER COUNT ── */}
      <Typography
        fontSize={13}
        color="text.secondary"
        mb={1}
        pl={0.5}
      >
        Showing {filtered.length} order{filtered.length !== 1 ? "s" : ""}
      </Typography>

      {/* ── ORDER LIST ── */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        {filtered.length === 0 && (
          <Box py={6} textAlign="center">
            <Typography color="text.secondary">No orders found.</Typography>
          </Box>
        )}

        {filtered.map((o, i) => {
          const isLong = (o.address || "").length > 45
          const isExpanded = !!expanded[o.order_id]

          return (
            <Box key={o.order_id}>
              <Box
                sx={{
                  px: 2.5,
                  py: 2,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 2,
                  "&:hover": { background: "#f9fafb" },
                  transition: "background 0.15s",
                }}
              >
                {/* ── LEFT: phone + address ── */}
                <Box flex={1} minWidth={0}>
                  <Typography fontWeight={700} fontSize={15} mb={0.4}>
                    {o.phone}
                  </Typography>

                  {o.address && (
                    <Box>
                      <Box
                        display="flex"
                        alignItems="flex-start"
                        gap={0.3}
                        sx={{ cursor: isLong ? "pointer" : "default" }}
                        onClick={() => isLong && toggleExpand(o.order_id)}
                      >
                        <Typography
                          fontSize={12.5}
                          color="text.secondary"
                          sx={{
                            flex: 1,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: isExpanded ? "unset" : 2,
                            wordBreak: "break-word",
                          }}
                        >
                          {o.address}
                        </Typography>

                        {isLong && (
                          <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
                            <IconButton
                              size="small"
                              sx={{ mt: "-2px", flexShrink: 0 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleExpand(o.order_id)
                              }}
                            >
                              <ExpandMoreIcon
                                fontSize="small"
                                sx={{
                                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                  transition: "transform 0.2s",
                                  color: "text.disabled",
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* ── RIGHT: qty + toggle + status ── */}
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-end"
                  gap={0.8}
                  flexShrink={0}
                >
                  <Chip
                    label={`Qty: ${o.quantity}`}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 600, fontSize: 12 }}
                  />

                  <Box display="flex" alignItems="center" gap={0.8}>
                    <Switch
                      size="small"
                      checked={!!o.is_delivered}
                      onChange={() => toggleDelivered(o.order_id)}
                    />
                    <Chip
                      label={o.is_delivered ? "Delivered" : "Pending"}
                      size="small"
                      sx={{
                        background: o.is_delivered ? "#22c55e" : "#fb923c",
                        color: "white",
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                  </Box>

                  {o.is_delivered && o.delivered_at && (
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      fontSize={10.5}
                    >
                      {new Date(o.delivered_at).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              </Box>

              {i !== filtered.length - 1 && <Divider />}
            </Box>
          )
        })}
      </Paper>
    </Box>
  )
}