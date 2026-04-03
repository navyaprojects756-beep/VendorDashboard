import { useEffect, useState } from "react"
import API, { getToken } from "../../services/api"
import {
  Box, Typography, Paper, Button, IconButton, Chip, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, InputLabel, FormControl,
  Tooltip, Divider, CircularProgress, Alert,
} from "@mui/material"
import AddIcon           from "@mui/icons-material/Add"
import EditIcon          from "@mui/icons-material/Edit"
import DeleteIcon        from "@mui/icons-material/Delete"
import HistoryIcon       from "@mui/icons-material/History"
import InventoryIcon     from "@mui/icons-material/Inventory"
import { formatISTDate } from "../../utils/istDate"

const ORDER_TYPE_LABELS = {
  subscription: "Daily",
  adhoc:        "One-time",
  both:         "Both",
}
const ORDER_TYPE_COLORS = {
  subscription: "primary",
  adhoc:        "warning",
  both:         "success",
}

const EMPTY_FORM = {
  name: "", unit: "", price: "", delivery_charge: "0",
  order_type: "both", sort_order: "0",
}

export default function Products({ dark }) {
  const [products,    setProducts]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState("")
  const [dialogOpen,  setDialogOpen]  = useState(false)
  const [deleteOpen,  setDeleteOpen]  = useState(false)
  const [histOpen,    setHistOpen]    = useState(false)
  const [histData,    setHistData]    = useState([])
  const [histProduct, setHistProduct] = useState(null)
  const [editing,     setEditing]     = useState(null)
  const [deletingId,  setDeletingId]  = useState(null)
  const [saving,      setSaving]      = useState(false)
  const [form,        setForm]        = useState(EMPTY_FORM)

  const load = () => {
    setLoading(true)
    API.get(`/products?token=${getToken()}`)
      .then(r => setProducts(r.data.products))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name:            p.name,
      unit:            p.unit || "",
      price:           String(p.price),
      delivery_charge: "0",
      order_type:      p.order_type,
      sort_order:      String(p.sort_order),
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || form.price === "") return
    setSaving(true)
    try {
      const body = {
        name:            form.name.trim(),
        unit:            form.unit.trim(),
        price:           parseFloat(form.price),
        delivery_charge: 0,
        order_type:      form.order_type,
        sort_order:      parseInt(form.sort_order || 0),
        is_active:       editing ? editing.is_active : true,
      }
      if (editing) {
        await API.put(`/products/${editing.product_id}?token=${getToken()}`, body)
      } else {
        await API.post(`/products?token=${getToken()}`, body)
      }
      setDialogOpen(false)
      load()
    } catch (e) {
      setError(e.response?.data?.message || e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (p) => {
    try {
      await API.patch(`/products/${p.product_id}/toggle?token=${getToken()}`)
      setProducts(prev => prev.map(x => x.product_id === p.product_id ? { ...x, is_active: !x.is_active } : x))
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await API.delete(`/products/${deletingId}?token=${getToken()}`)
      setDeleteOpen(false)
      setDeletingId(null)
      load()
    } catch (e) {
      setError(e.response?.data?.message || e.message)
    }
  }

  const openHistory = async (p) => {
    setHistProduct(p)
    setHistData([])
    setHistOpen(true)
    try {
      const r = await API.get(`/products/${p.product_id}/price-history?token=${getToken()}`)
      setHistData(r.data.history)
    } catch {}
  }

  const fmtDate = (val) => {
    if (!val) return "—"
    return formatISTDate(val, { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>

      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <InventoryIcon sx={{ color: "#2563eb" }} />
          <Typography fontWeight={700} fontSize={17}>Products</Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={openAdd}
          sx={{
            textTransform: "none", fontWeight: 600, fontSize: 13,
            borderRadius: "8px", background: "#2563eb",
            "&:hover": { background: "#1d4ed8" },
          }}
        >
          Add Product
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {loading ? (
        <Box textAlign="center" py={6}><CircularProgress /></Box>
      ) : products.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: 3, border: "1px solid #e5e7eb" }}>
          <InventoryIcon sx={{ fontSize: 48, color: "#d1d5db", mb: 1 }} />
          <Typography color="text.secondary" fontSize={14}>
            No products yet. Add your first product to enable multi-product subscriptions.
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          {products.map((p, i) => (
            <Box key={p.product_id}>
              <Box sx={{
                px: 2.5, py: 1.8, display: "flex", alignItems: "center",
                gap: 2, "&:hover": { background: "#f9fafb" },
                opacity: p.is_active ? 1 : 0.55,
              }}>
                {/* Name + unit */}
                <Box flex={1} minWidth={0}>
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography fontWeight={700} fontSize={14.5}>
                      {p.name}
                    </Typography>
                    {p.unit && (
                      <Typography fontSize={12} color="text.secondary">({p.unit})</Typography>
                    )}
                    <Chip
                      label={ORDER_TYPE_LABELS[p.order_type] || p.order_type}
                      size="small"
                      color={ORDER_TYPE_COLORS[p.order_type] || "default"}
                      sx={{ fontWeight: 600, fontSize: 10.5, height: 20 }}
                    />
                  </Box>
                  <Box display="flex" alignItems="center" gap={1.5} mt={0.4} flexWrap="wrap">
                    <Typography fontSize={13} fontWeight={700} color="#2563eb">
                      ₹{parseFloat(p.price).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                {/* Actions */}
                <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
                  <Tooltip title={p.is_active ? "Active — click to deactivate" : "Inactive — click to activate"}>
                    <Switch
                      size="small"
                      checked={!!p.is_active}
                      onChange={() => handleToggle(p)}
                    />
                  </Tooltip>
                  <Tooltip title="Price history">
                    <IconButton size="small" onClick={() => openHistory(p)} sx={{ color: "#6366f1" }}>
                      <HistoryIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(p)} sx={{ color: "#2563eb" }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small"
                      onClick={() => { setDeletingId(p.product_id); setDeleteOpen(true) }}
                      sx={{ color: "#ef4444" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              {i !== products.length - 1 && <Divider />}
            </Box>
          ))}
        </Paper>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>
          {editing ? "Edit Product" : "Add Product"}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
          <TextField
            label="Product Name *"
            size="small"
            fullWidth
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <TextField
            label="Unit (e.g. 500 ml, 200 g)"
            size="small"
            fullWidth
            value={form.unit}
            onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
          />
          <TextField
            label="Price (₹) *"
            size="small"
            type="number"
            inputProps={{ min: 0, step: "0.01" }}
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            fullWidth
          />
          <Box display="flex" gap={1.5}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Order Type</InputLabel>
              <Select
                label="Order Type"
                value={form.order_type}
                onChange={e => setForm(f => ({ ...f, order_type: e.target.value }))}
              >
                <MenuItem value="subscription">Daily (subscription)</MenuItem>
                <MenuItem value="adhoc">One-time order</MenuItem>
                <MenuItem value="both">Both</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Sort Order"
              size="small"
              type="number"
              inputProps={{ min: 0 }}
              value={form.sort_order}
              onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
              sx={{ flex: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={saving || !form.name.trim() || form.price === ""}
            onClick={handleSave}
            sx={{ textTransform: "none", fontWeight: 600, background: "#2563eb", "&:hover": { background: "#1d4ed8" } }}
          >
            {saving ? <CircularProgress size={16} /> : editing ? "Save Changes" : "Add Product"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700, fontSize: 15 }}>Delete Product?</DialogTitle>
        <DialogContent>
          <Typography fontSize={14} color="text.secondary">
            This will remove the product and all customer subscriptions to it. Orders already placed will keep their prices.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ textTransform: "none", fontWeight: 600 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Price History */}
      <Dialog open={histOpen} onClose={() => setHistOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 15 }}>
          Price History — {histProduct?.name}
        </DialogTitle>
        <DialogContent>
          {histData.length === 0 ? (
            <Typography color="text.secondary" fontSize={13}>No history available.</Typography>
          ) : (
            histData.map((h, i) => (
              <Box key={h.history_id} display="flex" justifyContent="space-between" alignItems="center"
                py={0.8} borderBottom={i < histData.length - 1 ? "1px solid #f3f4f6" : "none"}>
                <Box>
                  <Typography fontSize={14} fontWeight={600} color="#2563eb">₹{parseFloat(h.price).toFixed(2)}</Typography>
                </Box>
                <Typography fontSize={12} color="text.secondary">from {fmtDate(h.effective_from)}</Typography>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistOpen(false)} sx={{ textTransform: "none" }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
