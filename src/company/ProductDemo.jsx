import { useState, useEffect, useRef } from "react"
import CompanyLayout from "./CompanyLayout"
import API from "../services/api"

const INITIAL_VENDOR_FORM = {
  fullName: "",
  shopName: "",
  shopAddress: "",
  contactNumber: "",
  apiNumber: "",
  acceptedTerms: false,
}

/* ── extra css ── */
const CSS = `
  @keyframes slidePhone { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes typingDot  { 0%,80%,100%{transform:scale(0);opacity:.4} 40%{transform:scale(1);opacity:1} }
  @keyframes scanLine   { from{top:0%} to{top:100%} }
  @keyframes popIn      { from{opacity:0;transform:scale(.85) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes slideRight { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideLeft  { from{opacity:0;transform:translateX(30px)}  to{opacity:1;transform:translateX(0)} }
  @keyframes fadeUp     { from{opacity:0;transform:translateY(20px)}  to{opacity:1;transform:translateY(0)} }
  @keyframes shimmerBg  { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes ripple     { to{transform:scale(3);opacity:0} }
  @keyframes blink      { 0%,100%{opacity:1} 50%{opacity:0} }

  .phone-float { animation: slidePhone 4s ease-in-out infinite }
  .dot1 { animation: typingDot 1.2s .0s infinite }
  .dot2 { animation: typingDot 1.2s .2s infinite }
  .dot3 { animation: typingDot 1.2s .4s infinite }
  .step-card { transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease }
  .step-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(124,58,237,.15); border-color: #c4b5fd }
  .feat-tab { transition: all .22s ease; cursor: pointer }
  .feat-tab:hover { background: #ede9fe; color: #7c3aed }
  .feat-tab.active { background: #7c3aed; color: white }
  .screen-row { transition: background .2s }
  .screen-row:hover { background: rgba(124,58,237,.05) }
  .demo-btn { transition: all .22s ease }
  .demo-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,58,237,.35) }
  .vendor-input { width: 100%; padding: 14px 15px; border-radius: 14px; border: 1px solid #d8d3f7; background: rgba(255,255,255,.92); color: #0f172a; font-size: .95rem; outline: none; transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; box-sizing: border-box }
  .vendor-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 4px rgba(124,58,237,.14); transform: translateY(-1px) }
  .vendor-input::placeholder { color: #94a3b8 }
  .vendor-textarea { min-height: 120px; resize: vertical }
  .vendor-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18px }

  @media(max-width:768px) {
    .demo-grid { grid-template-columns: 1fr !important }
    .feat-tabs { flex-direction: column !important }
    .hero-phones { flex-direction: column !important; align-items: center !important }
    .vendor-grid { grid-template-columns: 1fr !important }
  }
`

/* ── Mock WhatsApp phone ── */
function WhatsAppPhone({ messages = [], title = "Milk Vendor 🥛", typing = false }) {
  return (
    <div className="phone-float" style={{
      width: 220, background: "#fff", borderRadius: 28,
      boxShadow: "0 24px 60px rgba(0,0,0,.22), 0 0 0 8px #1a1a2e",
      overflow: "hidden", flexShrink: 0
    }}>
      {/* status bar */}
      <div style={{ background: "#1a1a2e", height: 24, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px" }}>
        <span style={{ color: "white", fontSize: 9, fontWeight: 700 }}>9:41</span>
        <span style={{ color: "white", fontSize: 9 }}>● ● ●</span>
      </div>
      {/* WA header */}
      <div style={{ background: "#075e54", padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#25d366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🥛</div>
        <div>
          <div style={{ color: "white", fontSize: 11, fontWeight: 700 }}>{title}</div>
          <div style={{ color: "#b2dfdb", fontSize: 9 }}>online</div>
        </div>
      </div>
      {/* chat */}
      <div style={{ background: "#ece5dd", padding: "10px 8px", minHeight: 240, display: "flex", flexDirection: "column", gap: 6 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start", animation: `popIn .4s ${i * .12}s both` }}>
            <div style={{
              maxWidth: "80%", padding: "6px 9px", borderRadius: m.from === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              background: m.from === "user" ? "#dcf8c6" : "white",
              fontSize: 10, lineHeight: 1.4, color: "#1a1a2e",
              boxShadow: "0 1px 2px rgba(0,0,0,.1)",
              whiteSpace: "pre-wrap"
            }}>
              {m.text}
              <div style={{ fontSize: 8, color: "#8696a0", textAlign: "right", marginTop: 2 }}>{m.time || "9:41"} ✓✓</div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ background: "white", padding: "8px 12px", borderRadius: "12px 12px 12px 2px", display: "flex", gap: 4, alignItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,.1)" }}>
              <span className="dot1" style={{ width: 5, height: 5, borderRadius: "50%", background: "#8696a0", display: "inline-block" }} />
              <span className="dot2" style={{ width: 5, height: 5, borderRadius: "50%", background: "#8696a0", display: "inline-block" }} />
              <span className="dot3" style={{ width: 5, height: 5, borderRadius: "50%", background: "#8696a0", display: "inline-block" }} />
            </div>
          </div>
        )}
      </div>
      {/* input bar */}
      <div style={{ background: "#f0f0f0", padding: "6px 8px", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ flex: 1, background: "white", borderRadius: 20, padding: "5px 10px", fontSize: 10, color: "#8696a0" }}>Message…</div>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#075e54", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>▶</div>
      </div>
    </div>
  )
}

/* ── Mock Dashboard screen ── */
function DashboardScreen({ feature = "orders" }) {
  const screens = {
    orders: (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>Today's Orders</span>
          <span style={{ background: "#2563eb", color: "white", padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>28 Mar 2026</span>
        </div>
        {[
          { name: "91*****3210", addr: "Green Meadows – Flat 102", qty: 3, done: true },
          { name: "91*****6789", addr: "Block A – Flat 201",        qty: 2, done: true },
          { name: "91*****1222", addr: "Blue Ridge – Flat 305",     qty: 5, done: false },
          { name: "91*****4555", addr: "Sunrise Apt – Flat 12",     qty: 2, done: false },
        ].map((r, i) => (
          <div key={i} className="screen-row" style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 6px", borderBottom: "1px solid #f1f5f9", borderRadius: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: r.done ? "#16a34a" : "#f59e0b", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#1e293b" }}>+{r.name}</div>
              <div style={{ fontSize: 9, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.addr}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#2563eb" }}>×{r.qty}</span>
            <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 10, background: r.done ? "#dcfce7" : "#fef9c3", color: r.done ? "#16a34a" : "#ca8a04", fontWeight: 600 }}>
              {r.done ? "✓ Done" : "Pending"}
            </span>
          </div>
        ))}
        <div style={{ marginTop: 8, padding: "6px 8px", background: "#eff6ff", borderRadius: 6, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: "#2563eb", fontWeight: 600 }}>Total packets today</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#2563eb" }}>12</span>
        </div>
      </div>
    ),
    customers: (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>Customers</span>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ background: "#dcfce7", color: "#16a34a", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>6 Active</span>
            <span style={{ background: "#fee2e2", color: "#dc2626", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>0 Inactive</span>
          </div>
        </div>
        {[
          { phone: "91*****3210", addr: "Green Meadows – Flat 102", qty: 3 },
          { phone: "91*****6789", addr: "Block A – Flat 201",        qty: 2 },
          { phone: "91*****1222", addr: "Blue Ridge – Flat 305",     qty: 5 },
        ].map((c, i) => (
          <div key={i} className="screen-row" style={{ padding: "8px 6px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#1e293b" }}>+{c.phone}</div>
              <div style={{ fontSize: 9, color: "#64748b" }}>📍 {c.addr}</div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", background: "#f5f3ff", padding: "2px 7px", borderRadius: 8 }}>Qty {c.qty}</span>
            <span style={{ fontSize: 9, color: "#7c3aed", cursor: "pointer", fontWeight: 600, background: "#ede9fe", padding: "2px 8px", borderRadius: 8 }}>Bill</span>
          </div>
        ))}
      </div>
    ),
    pauses: (
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 10 }}>Paused Deliveries</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          {[["Total Paused", "2", "#f59e0b"], ["Auto-Resume", "1", "#3b82f6"], ["Manual", "1", "#8b5cf6"]].map(([l, v, c]) => (
            <div key={l} style={{ flex: 1, background: "white", border: `1px solid #e5e7eb`, borderRadius: 8, padding: "6px 8px" }}>
              <div style={{ fontSize: 8, color: "#6b7280", fontWeight: 600 }}>{l.toUpperCase()}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{v}</div>
            </div>
          ))}
        </div>
        {[
          { phone: "91*****3210", from: "26 Mar", to: "1 Apr", days: "4 days left" },
          { phone: "91*****1222", from: "28 Mar", to: "Manual", days: "Manual" },
        ].map((p, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${i === 0 ? "#f59e0b" : "#8b5cf6"}`, background: "white", borderRadius: "0 8px 8px 0", padding: "8px 10px", marginBottom: 6, boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
            <div style={{ fontWeight: 700, fontSize: 10, color: "#1e293b" }}>+{p.phone}</div>
            <div style={{ fontSize: 9, color: "#64748b", marginTop: 3 }}>
              🗒 {p.from} → {p.to} · <span style={{ color: i === 0 ? "#d97706" : "#7c3aed", fontWeight: 600 }}>{p.days}</span>
            </div>
          </div>
        ))}
      </div>
    ),
    bills: (
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 8 }}>Bill Preview</div>
        <div style={{ background: "linear-gradient(135deg,#0f2057,#1a56db)", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
          <div style={{ color: "white", fontWeight: 800, fontSize: 14 }}>MILK BILL</div>
          <div style={{ color: "#a0b4e0", fontSize: 9, marginTop: 2 }}>BILL-20260301-9405 · 29 Mar 2026</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, color: "white" }}>
            <div><div style={{ fontSize: 8, color: "#a0b4e0" }}>BILL TO</div><div style={{ fontSize: 10, fontWeight: 700 }}>+91*****9405</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 8, color: "#a0b4e0" }}>PERIOD</div><div style={{ fontSize: 10, fontWeight: 700 }}>Mar 2026</div></div>
          </div>
        </div>
        <div style={{ background: "#1a56db", borderRadius: "6px 6px 0 0", padding: "5px 8px", display: "flex" }}>
          {["#", "Date", "Pkts", "Amount"].map(h => <div key={h} style={{ flex: 1, color: "white", fontSize: 9, fontWeight: 700 }}>{h}</div>)}
        </div>
        {[[1,"24 Mar",3,"₹120"],[2,"25 Mar",4,"₹160"],[3,"26 Mar",4,"₹160"]].map(([n,d,p,a],i) => (
          <div key={i} style={{ display: "flex", padding: "5px 8px", background: i%2===0?"white":"#f8f9ff" }}>
            {[n,d,p,a].map((v,j) => <div key={j} style={{ flex: 1, fontSize: 9, color: j===3?"#1a56db":"#374151", fontWeight: j===3?700:400 }}>{v}</div>)}
          </div>
        ))}
        <div style={{ background: "#eff6ff", padding: "6px 8px", borderRadius: "0 0 6px 6px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#1a56db" }}>Total Amount</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#1a56db" }}>₹ 440.00</span>
        </div>
      </div>
    ),
    settings: (
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 10 }}>Vendor Settings</div>
        {[
          { label: "Price per Packet", value: "₹ 40.00", badge: "Pricing" },
          { label: "Max Packets / Order", value: "10", badge: "Limits" },
          { label: "Order Window", value: "7:00 – 10:00 AM", badge: "Timing" },
          { label: "Allow Apartments", value: "✓ Enabled", badge: "Address" },
          { label: "Auto-generate Orders", value: "6:00 AM daily", badge: "Automation" },
        ].map((s, i) => (
          <div key={i} className="screen-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 6px", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#1e293b" }}>{s.label}</div>
              <span style={{ fontSize: 8, background: "#ede9fe", color: "#7c3aed", padding: "1px 6px", borderRadius: 8, fontWeight: 600 }}>{s.badge}</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#2563eb" }}>{s.value}</span>
          </div>
        ))}
      </div>
    ),
  }
  return (
    <div style={{
      background: "#f8fafc", borderRadius: 12, padding: "14px 12px",
      border: "1px solid #e5e7eb", minHeight: 260, boxShadow: "0 4px 20px rgba(0,0,0,.06)"
    }}>
      {/* fake browser chrome */}
      <div style={{ display: "flex", gap: 5, marginBottom: 10, alignItems: "center" }}>
        {["#f87171","#fbbf24","#34d399"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}
        <div style={{ flex: 1, background: "#e5e7eb", borderRadius: 4, height: 10, marginLeft: 6, display: "flex", alignItems: "center", padding: "0 8px" }}>
          <span style={{ fontSize: 7, color: "#9ca3af" }}>dashboard.milkroute.app</span>
        </div>
      </div>
      {screens[feature]}
    </div>
  )
}

/* ── feature tabs data ── */
const FEATURES = [
  {
    id: "orders",
    icon: "📦",
    label: "Daily Orders",
    headline: "Auto-generate & track every delivery",
    desc: "Orders are generated automatically each morning based on active subscriptions. Mark deliveries done with one tap — the dashboard tracks everything in real time.",
    points: ["Auto-order generation at your set time", "Mark delivered / pending per customer", "See total packets for the day at a glance", "Filter by apartment or block"],
  },
  {
    id: "customers",
    icon: "👥",
    label: "Customers",
    headline: "All your customers in one place",
    desc: "See every customer who subscribed via WhatsApp — their address, quantity, and subscription status — with easy search and filtering.",
    points: ["Apartment & house customers", "Search by phone or address", "Active / Inactive status", "One-click bill generation"],
  },
  {
    id: "pauses",
    icon: "⏸",
    label: "Pauses",
    headline: "Know who paused and when they're back",
    desc: "Customers can pause delivery from WhatsApp for 1 day to 1 month. The Pauses page shows all paused customers, their pause dates, and auto-resumes.",
    points: ["See all paused deliveries", "Auto-resume vs manual-resume", "Days remaining badge", "Orders skipped automatically during pause"],
  },
  {
    id: "bills",
    icon: "🧾",
    label: "Bills",
    headline: "Professional PDF bills — instantly",
    desc: "Customers request their bill directly on WhatsApp. A branded PDF is generated and sent automatically. The vendor can also download any customer's bill from the dashboard.",
    points: ["Customer requests bill via WhatsApp", "PDF auto-generated & sent", "This Month / Last Month / Custom period", "Download all bills in bulk from dashboard"],
  },
  {
    id: "settings",
    icon: "⚙️",
    label: "Settings",
    headline: "Full control over how your service works",
    desc: "Configure pricing, order timing, allowed address types, auto-generation, and more — no code needed.",
    points: ["Set price per packet", "Define order acceptance hours", "Manage apartments & blocks", "Enable/disable features per vendor"],
  },
]

/* ── how it works steps ── */
const HOW = [
  { n: "01", icon: "📲", title: "Customer says Hi", desc: "Customer opens WhatsApp and messages your business number. The bot greets them instantly." },
  { n: "02", icon: "🏠", title: "Address & Quantity", desc: "Customer selects their apartment or enters their house address, then picks how many packets per day." },
  { n: "03", icon: "✅", title: "Subscription Confirmed", desc: "Subscription is saved. Customer gets a confirmation message with all details." },
  { n: "04", icon: "🌅", title: "Orders Auto-Generated", desc: "Every morning at your set time, orders are created automatically for all active subscribers." },
  { n: "05", icon: "🚚", title: "Vendor Delivers & Marks Done", desc: "Vendor opens the dashboard, sees the list, and marks each delivery as done." },
  { n: "06", icon: "🧾", title: "Customer Gets Bill on WhatsApp", desc: "Customer taps 'Get Bill', picks a period, and the PDF arrives on WhatsApp in seconds." },
]

/* ── WhatsApp flow messages for different scenarios ── */
const WA_FLOWS = {
  subscribe: [
    { from: "user", text: "Hi", time: "9:30" },
    { from: "bot",  text: "👋 Welcome to Milk Vendor!\n\nFresh milk delivered daily. 🥛", time: "9:30" },
    { from: "bot",  text: "🥛 Subscribe Now\n📋 My Subscription\n✏️ Change Quantity\n📍 Update Address\n⏸ Pause Delivery\n🧾 Get Bill", time: "9:30" },
    { from: "user", text: "Subscribe Now", time: "9:31" },
    { from: "bot",  text: "Select your quantity:\n2 Packets – ₹80/day\n3 Packets – ₹120/day\n✏️ Custom Packets", time: "9:31" },
  ],
  pause: [
    { from: "user", text: "Pause Delivery", time: "10:05" },
    { from: "bot",  text: "⏸ Pause Delivery\n\nHow long to pause?", time: "10:05" },
    { from: "user", text: "1 Week", time: "10:05" },
    { from: "bot",  text: "⏸ Delivery Paused for 1 Week!\n\n🗒 From: 29 Mar 2026\n🗒 To: 4 Apr 2026\n\nResumes automatically on 5 Apr 2026. 🥛", time: "10:06" },
  ],
  bill: [
    { from: "user", text: "Get Bill", time: "11:00" },
    { from: "bot",  text: "🧾 Get Bill\n\nSelect period:", time: "11:00" },
    { from: "user", text: "This Month", time: "11:01" },
    { from: "bot",  text: "⏳ Generating your bill…", time: "11:01" },
    { from: "bot",  text: "📄 milk_bill_Mar2026.pdf\n🧾 Your milk bill (1 Mar – 31 Mar 2026)", time: "11:01" },
  ],
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function ProductDemo() {
  const [activeFeature, setActiveFeature] = useState("orders")
  const [waFlow, setWaFlow]               = useState("subscribe")
  const [visible, setVisible]             = useState({})
  const [vendorForm, setVendorForm]       = useState(INITIAL_VENDOR_FORM)
  const [fieldErrors, setFieldErrors]     = useState({})
  const [showTerms, setShowTerms]         = useState(false)
  const [vendorSubmitState, setVendorSubmitState] = useState({ status: "idle", message: "" })

  const sectionRefs = useRef({})
  const vendorFormSectionRef = useRef(null)
  const firstVendorInputRef = useRef(null)
  const registerRef = (id) => (el) => { if (el) sectionRefs.current[id] = el }

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.dataset.id]: true })) })
    }, { threshold: 0.15 })
    Object.values(sectionRefs.current).forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const feat = FEATURES.find(f => f.id === activeFeature)

  function scrollToVendorForm() {
    vendorFormSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    window.setTimeout(() => firstVendorInputRef.current?.focus(), 450)
  }

  function updateVendorField(field, value) {
    setVendorForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: "" }))
    if (vendorSubmitState.status !== "idle") {
      setVendorSubmitState({ status: "idle", message: "" })
    }
  }

  function validateVendorForm() {
    const nextErrors = {}

    if (!vendorForm.fullName.trim()) nextErrors.fullName = "Full name is required."
    if (!vendorForm.shopName.trim()) nextErrors.shopName = "Shop name is required."
    if (!vendorForm.shopAddress.trim()) nextErrors.shopAddress = "Shop address is required."
    if (!vendorForm.contactNumber.trim()) nextErrors.contactNumber = "Contact number is required."
    else if (!/^\d{10,15}$/.test(vendorForm.contactNumber.replace(/[^\d]/g, ""))) nextErrors.contactNumber = "Enter a valid contact number."
    if (!vendorForm.apiNumber.trim()) nextErrors.apiNumber = "API number is required."
    else if (!/^\d{10,15}$/.test(vendorForm.apiNumber.replace(/[^\d]/g, ""))) nextErrors.apiNumber = "Enter a valid WhatsApp API number."
    if (!vendorForm.acceptedTerms) nextErrors.acceptedTerms = "Please accept the terms and conditions."

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleVendorSubmit(event) {
    event.preventDefault()

    if (!validateVendorForm()) {
      setVendorSubmitState({ status: "error", message: "Please correct the highlighted fields." })
      return
    }

    setVendorSubmitState({ status: "loading", message: "Submitting vendor details..." })

    try {
      const response = await API.post("/register-interest", {
        full_name: vendorForm.fullName,
        shop_name: vendorForm.shopName,
        shop_address: vendorForm.shopAddress,
        contact_number: vendorForm.contactNumber,
        whatsapp_api_number: vendorForm.apiNumber,
        accepted_terms: vendorForm.acceptedTerms,
      })

      setVendorSubmitState({ status: "success", message: response.data?.message || "Thank you. Our vendor team will contact you soon." })
      setVendorForm(INITIAL_VENDOR_FORM)
      setFieldErrors({})
      vendorFormSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    } catch (error) {
      const message = error.response?.data?.message || "Could not submit vendor details right now."
      setVendorSubmitState({ status: "error", message })
    }
  }

  return (
    <CompanyLayout>
      <style>{CSS}</style>

      {/* ══ HERO ══ */}
      <section style={{
        background: "linear-gradient(145deg,#0f172a 0%,#1e1b4b 55%,#312e81 100%)",
        padding: "80px 6% 70px", position: "relative", overflow: "hidden"
      }}>
        {/* blobs */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,.25),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(99,102,241,.2),transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }} className="demo-grid">
          {/* left text */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.25)", border: "1px solid rgba(124,58,237,.4)", borderRadius: 20, padding: "5px 14px", marginBottom: 20 }}>
              <span style={{ fontSize: 12 }}>🥛</span>
              <span style={{ color: "#c4b5fd", fontSize: 12, fontWeight: 600 }}>MilkRoute · Product Demo</span>
            </div>
            <h1 style={{ color: "white", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, lineHeight: 1.2, margin: "0 0 18px" }}>
              WhatsApp Milk Delivery,{" "}
              <span style={{ background: "linear-gradient(90deg,#a78bfa,#818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Fully Automated</span>
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "1rem", lineHeight: 1.8, margin: "0 0 28px", maxWidth: 480 }}>
              Customers subscribe, pause, and request bills — all via WhatsApp. Vendors manage orders, customers, and deliveries from a clean dashboard. No app downloads. No cash collection surprises.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {["🤖 WhatsApp Bot", "📊 Vendor Dashboard", "🧾 Auto PDF Bills", "⏸ Pause & Resume"].map(t => (
                <span key={t} style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", color: "#e2e8f0", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
            <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
              <button
                type="button"
                onClick={scrollToVendorForm}
                className="demo-btn"
                style={{ border: "none", borderRadius: 14, padding: "15px 24px", cursor: "pointer", fontWeight: 800, fontSize: ".98rem", color: "#fff", background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 14px 34px rgba(249,115,22,.28)" }}
              >
                Register to Become a Vendor
              </button>
              <span style={{ color: "#cbd5e1", fontSize: ".9rem", lineHeight: 1.7, maxWidth: 360 }}>
                Share your basic details and we will use this form as the starting point for vendor onboarding.
              </span>
            </div>
          </div>

          {/* right: two phones */}
          <div className="hero-phones" style={{ display: "flex", gap: 20, justifyContent: "center", alignItems: "flex-end" }}>
            <div style={{ animation: "slidePhone 4s ease-in-out infinite" }}>
              <WhatsAppPhone
                title="Milk Vendor 🥛"
                messages={[
                  { from: "user", text: "Hi", time: "9:30" },
                  { from: "bot",  text: "👋 Welcome back!\nYour delivery: 3 packets/day\n📍 Sample Apartment – Flat ***", time: "9:30" },
                  { from: "bot",  text: "📋 My Subscription\n✏️ Change Quantity\n⏸ Pause Delivery\n🧾 Get Bill", time: "9:30" },
                ]}
              />
            </div>
            <div style={{ animation: "slidePhone 4s 1.5s ease-in-out infinite" }}>
              <WhatsAppPhone
                title="Milk Vendor 🥛"
                messages={[
                  { from: "user", text: "Get Bill", time: "11:00" },
                  { from: "bot",  text: "🧾 Get Bill\n\nSelect period:\n• This Month\n• Last Month\n• Last 7 Days\n• Last 30 Days", time: "11:00" },
                ]}
                typing
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section ref={registerRef("how")} data-id="how" style={{ padding: "80px 6%", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50, animation: visible.how ? "fadeUp .6s both" : "none" }}>
            <span style={{ background: "#ede9fe", color: "#7c3aed", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>HOW IT WORKS</span>
            <h2 style={{ fontSize: "clamp(1.5rem,3vw,2.1rem)", fontWeight: 800, color: "#0f172a", margin: "14px 0 8px" }}>From Hi to Delivered in 6 Steps</h2>
            <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: 520, margin: "0 auto" }}>Everything is automated — the customer does it all on WhatsApp, you just deliver.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="demo-grid">
            {HOW.map((s, i) => (
              <div key={i} className="step-card" style={{
                border: "1px solid #e5e7eb", borderRadius: 14, padding: "22px 20px",
                background: "#fff", position: "relative", overflow: "hidden",
                animation: visible.how ? `fadeUp .55s ${i * .1}s both` : "none"
              }}>
                <div style={{ position: "absolute", top: 14, right: 14, fontSize: 28, fontWeight: 900, color: "#f1f5f9", lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", marginBottom: 6 }}>{s.title}</div>
                <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHATSAPP FLOW DEMO ══ */}
      <section ref={registerRef("wa")} data-id="wa" style={{ padding: "80px 6%", background: "linear-gradient(135deg,#f8fafc,#ede9fe22)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40, animation: visible.wa ? "fadeUp .6s both" : "none" }}>
            <span style={{ background: "#dcfce7", color: "#16a34a", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>📲 WHATSAPP EXPERIENCE</span>
            <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, color: "#0f172a", margin: "14px 0 8px" }}>See Exactly What Customers Experience</h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Switch between flows to see how it looks on WhatsApp</p>
          </div>

          {/* flow selector */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 40, flexWrap: "wrap" }}>
            {[
              { id: "subscribe", label: "🥛 Subscribe",       color: "#2563eb" },
              { id: "pause",     label: "⏸ Pause Delivery",  color: "#f59e0b" },
              { id: "bill",      label: "🧾 Get Bill",         color: "#7c3aed" },
            ].map(f => (
              <button key={f.id} onClick={() => setWaFlow(f.id)} style={{
                padding: "9px 22px", borderRadius: 24, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
                background: waFlow === f.id ? f.color : "white",
                color: waFlow === f.id ? "white" : "#374151",
                boxShadow: waFlow === f.id ? `0 4px 16px ${f.color}55` : "0 2px 8px rgba(0,0,0,.08)",
                transition: "all .22s ease",
              }}>{f.label}</button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }} className="demo-grid">
            {/* phone */}
            <div style={{ display: "flex", justifyContent: "center", animation: visible.wa ? "slideRight .6s both" : "none" }}>
              <WhatsAppPhone
                title="Milk Vendor 🥛"
                messages={WA_FLOWS[waFlow]}
                key={waFlow}
              />
            </div>

            {/* explanation */}
            <div style={{ animation: visible.wa ? "slideLeft .6s both" : "none" }}>
              {{
                subscribe: {
                  title: "Subscribing is instant",
                  desc: "Customer sends 'Hi', picks their address type, selects their apartment and flat number, chooses packets per day — subscription saved. No forms, no apps.",
                  steps: ["Customer messages 'Hi'", "Bot shows menu options", "Customer picks address", "Selects daily packet count", "Confirmation sent automatically"],
                },
                pause: {
                  title: "Pause without calling",
                  desc: "Going on vacation? Customer taps 'Pause Delivery', picks a duration (1 day to 1 month), and deliveries pause automatically. Orders are not generated during the pause period.",
                  steps: ["Customer taps 'Pause Delivery'", "Picks duration from list", "Pause confirmed with exact dates", "Orders auto-skipped", "Resumes automatically after pause ends"],
                },
                bill: {
                  title: "Bill in seconds on WhatsApp",
                  desc: "No need to call the vendor or wait for end of month. Customer taps 'Get Bill', picks the month, and a professional PDF arrives on WhatsApp in seconds.",
                  steps: ["Customer taps 'Get Bill'", "Selects This Month / Last Month", "PDF generated on server", "Bill sent on WhatsApp instantly", "Only delivered packets are billed"],
                },
              }[waFlow] && (() => {
                const info = { subscribe: { title:"Subscribing is instant",desc:"Customer sends 'Hi', picks their address type, selects their apartment and flat number, chooses packets per day — subscription saved. No forms, no apps.",steps:["Customer messages 'Hi'","Bot shows menu options","Customer picks address","Selects daily packet count","Confirmation sent automatically"]}, pause:{title:"Pause without calling",desc:"Going on vacation? Customer taps 'Pause Delivery', picks a duration (1 day to 1 month), and deliveries pause automatically. Orders are not generated during the pause period.",steps:["Customer taps 'Pause Delivery'","Picks duration from list","Pause confirmed with exact dates","Orders auto-skipped","Resumes automatically after pause ends"]}, bill:{title:"Bill in seconds on WhatsApp",desc:"No need to call the vendor or wait for end of month. Customer taps 'Get Bill', picks the month, and a professional PDF arrives on WhatsApp in seconds.",steps:["Customer taps 'Get Bill'","Selects This Month / Last Month","PDF generated on server","Bill sent on WhatsApp instantly","Only delivered packets are billed"]}}[waFlow]
                return (
                  <>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", margin: "0 0 12px" }}>{info.title}</h3>
                    <p style={{ color: "#64748b", lineHeight: 1.75, margin: "0 0 20px", fontSize: "0.92rem" }}>{info.desc}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {info.steps.map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, animation: `slideLeft .4s ${i * .08}s both` }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#7c3aed", color: "white", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                          <span style={{ fontSize: "0.88rem", color: "#374151", fontWeight: 500 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* ══ DASHBOARD FEATURES ══ */}
      <section ref={registerRef("dash")} data-id="dash" style={{ padding: "80px 6%", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40, animation: visible.dash ? "fadeUp .6s both" : "none" }}>
            <span style={{ background: "#eff6ff", color: "#2563eb", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>📊 VENDOR DASHBOARD</span>
            <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, color: "#0f172a", margin: "14px 0 8px" }}>Everything You Need to Run Your Business</h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem", maxWidth: 520, margin: "0 auto" }}>Click any section to see a live preview of the dashboard.</p>
          </div>

          {/* tabs */}
          <div className="feat-tabs" style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
            {FEATURES.map(f => (
              <button key={f.id} className={`feat-tab ${activeFeature === f.id ? "active" : ""}`}
                onClick={() => setActiveFeature(f.id)}
                style={{
                  padding: "8px 18px", borderRadius: 24, border: "1px solid #e5e7eb",
                  background: activeFeature === f.id ? "#7c3aed" : "white",
                  color: activeFeature === f.id ? "white" : "#374151",
                  fontWeight: 600, fontSize: 13, cursor: "pointer",
                  boxShadow: activeFeature === f.id ? "0 4px 16px rgba(124,58,237,.35)" : "none",
                  transition: "all .22s ease"
                }}>
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50, alignItems: "start" }} className="demo-grid">
            {/* mock screen */}
            <div style={{ animation: visible.dash ? "slideRight .5s both" : "none" }} key={activeFeature}>
              <DashboardScreen feature={activeFeature} />
            </div>

            {/* feature description */}
            <div style={{ animation: visible.dash ? "slideLeft .5s both" : "none" }} key={activeFeature + "_desc"}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{feat.icon}</div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>{feat.headline}</h3>
              <p style={{ color: "#64748b", lineHeight: 1.75, margin: "0 0 20px", fontSize: "0.92rem" }}>{feat.desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {feat.points.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "#16a34a", fontSize: 10, fontWeight: 800 }}>✓</span>
                    </div>
                    <span style={{ fontSize: "0.88rem", color: "#374151", fontWeight: 500 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURE GRID ══ */}
      <section ref={registerRef("grid")} data-id="grid" style={{ padding: "80px 6%", background: "linear-gradient(135deg,#0f172a,#1e1b4b)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50, animation: visible.grid ? "fadeUp .6s both" : "none" }}>
            <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, color: "white", margin: "0 0 10px" }}>Built for Milk Vendors, by Design</h2>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Every feature was built around a real problem vendors face daily.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="demo-grid">
            {[
              { icon: "🤖", title: "Zero App Installs",      desc: "Customers use WhatsApp — nothing to download, nothing to learn." },
              { icon: "🌅", title: "Auto Order Generation",  desc: "Orders created automatically every morning. No manual work needed." },
              { icon: "📍", title: "Apartment Management",   desc: "Manage apartments, blocks, and flat numbers with full vendor control." },
              { icon: "⏸", title: "Smart Pause System",      desc: "Customer pauses delivery — orders are automatically skipped for that period." },
              { icon: "🧾", title: "WhatsApp Bills",          desc: "Customer requests bill on WhatsApp, PDF arrives in seconds." },
              { icon: "🔒", title: "Secure & Private",        desc: "JWT-based vendor login, no customer data shared across vendors." },
              { icon: "📊", title: "Real-time Dashboard",    desc: "See all orders, customers, and pauses from any device, any browser." },
              { icon: "💰", title: "Accurate Billing",        desc: "Only delivered packets are billed. Paused days are automatically excluded." },
              { icon: "⚙️", title: "Fully Configurable",     desc: "Set pricing, order times, address rules, and auto-generation — all from settings." },
            ].map((f, i) => (
              <div key={i} className="step-card" style={{
                background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)",
                borderRadius: 12, padding: "20px 18px",
                animation: visible.grid ? `fadeUp .5s ${i * .07}s both` : "none"
              }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{f.icon}</div>
                <div style={{ color: "white", fontWeight: 700, fontSize: "0.92rem", marginBottom: 6 }}>{f.title}</div>
                <div style={{ color: "#64748b", fontSize: "0.82rem", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SAMPLE DISCLAIMER ══ */}
      <div style={{
        background: "#fffbeb", borderTop: "1px solid #fde68a", borderBottom: "1px solid #fde68a",
        padding: "10px 6%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8
      }}>
        <span style={{ fontSize: 15 }}>⚠️</span>
        <span style={{ fontSize: 13, color: "#92400e", fontWeight: 500 }}>
          All screens, data, and phone numbers shown here are <strong>sample illustrations only.</strong> Actual features, UI, and flows may vary based on your configuration.
        </span>
      </div>

      {/* ══ CTA ══ */}

      {/* VENDOR ENQUIRY FORM */}
      <section ref={vendorFormSectionRef} style={{ padding: "96px 6%", background: "radial-gradient(circle at top left,rgba(255,255,255,.98),rgba(243,232,255,.94) 48%,rgba(237,233,254,.88) 100%)" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 15px", borderRadius: 999, background: "rgba(124,58,237,.08)", border: "1px solid rgba(124,58,237,.15)", color: "#7c3aed", fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" }}>
              Vendor Onboarding
            </div>
            <h2 style={{ margin: "18px 0 10px", fontSize: "clamp(2rem,4vw,3rem)", lineHeight: 1.05, letterSpacing: "-0.05em", color: "#0f172a", fontWeight: 900 }}>
              Register your shop and let our team take it from there.
            </h2>
            <p style={{ margin: "0 auto", maxWidth: 700, color: "#64748b", fontSize: "1rem", lineHeight: 1.8 }}>
              Share your core business details below. We will review the request, contact you soon, and guide you through the vendor onboarding process.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 14, marginBottom: 24 }} className="demo-grid">
            {[
              ["Business details", "Full name, shop name, and address are captured in one clean step."],
              ["Separate numbers", "Keep contact number and WhatsApp API onboarding number separate."],
              ["Manual review", "Our team checks the request before activating your vendor account."],
            ].map(([title, desc]) => (
              <div key={title} style={{ background: "rgba(255,255,255,.72)", border: "1px solid rgba(196,181,253,.35)", borderRadius: 22, padding: "18px 18px", boxShadow: "0 10px 30px rgba(124,58,237,.06)" }}>
                <div style={{ color: "#0f172a", fontSize: ".98rem", fontWeight: 800, marginBottom: 6 }}>{title}</div>
                <div style={{ color: "#64748b", fontSize: ".88rem", lineHeight: 1.65 }}>{desc}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleVendorSubmit} style={{ background: "rgba(255,255,255,.97)", border: "1px solid rgba(196,181,253,.38)", borderRadius: 32, padding: "34px 32px", boxShadow: "0 28px 80px rgba(109,40,217,.12)", backdropFilter: "blur(18px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 10 }}>Register As Vendor</div>
                <h3 style={{ margin: "0 0 8px", fontSize: "1.85rem", color: "#0f172a", fontWeight: 900, letterSpacing: "-0.04em" }}>Basic vendor details</h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: ".95rem", lineHeight: 1.75, maxWidth: 560 }}>Complete the form once. We will save it, keep the vendor inactive by default, and our team will contact you for the next setup steps.</p>
              </div>
              <div style={{ minWidth: 220, background: "linear-gradient(135deg,#f8fafc,#f5f3ff)", border: "1px solid #e9d5ff", borderRadius: 22, padding: "14px 16px" }}>
                <div style={{ color: "#7c3aed", fontSize: ".76rem", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>What happens next</div>
                <div style={{ color: "#334155", fontSize: ".9rem", lineHeight: 1.7 }}>Your request goes to our vendor onboarding queue and our team will contact you soon.</div>
              </div>
            </div>
            {vendorSubmitState.status !== "idle" && (
              <div style={{ marginBottom: 18, padding: "14px 16px", borderRadius: 16, border: vendorSubmitState.status === "success" ? "1px solid #86efac" : vendorSubmitState.status === "loading" ? "1px solid #c4b5fd" : "1px solid #fca5a5", background: vendorSubmitState.status === "success" ? "#f0fdf4" : vendorSubmitState.status === "loading" ? "#f5f3ff" : "#fef2f2", color: vendorSubmitState.status === "success" ? "#166534" : vendorSubmitState.status === "loading" ? "#5b21b6" : "#b91c1c", fontSize: ".9rem", lineHeight: 1.7, fontWeight: 600 }}>
                {vendorSubmitState.message}
              </div>
            )}
            <div className="vendor-grid">
              <label style={{ display: "block" }}>
                <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Full Name</div>
                <input ref={firstVendorInputRef} className="vendor-input" type="text" placeholder="Enter your full name" value={vendorForm.fullName} onChange={(event) => updateVendorField("fullName", event.target.value)} />
                {fieldErrors.fullName && <div style={{ color: "#dc2626", fontSize: ".8rem", marginTop: 6 }}>{fieldErrors.fullName}</div>}
              </label>
              <label style={{ display: "block" }}>
                <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Shop Name</div>
                <input className="vendor-input" type="text" placeholder="Enter your shop name" value={vendorForm.shopName} onChange={(event) => updateVendorField("shopName", event.target.value)} />
                {fieldErrors.shopName && <div style={{ color: "#dc2626", fontSize: ".8rem", marginTop: 6 }}>{fieldErrors.shopName}</div>}
              </label>
            </div>
            <label style={{ display: "block", marginTop: 18 }}>
              <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Shop Address</div>
              <textarea className="vendor-input vendor-textarea" placeholder="Enter complete shop address" value={vendorForm.shopAddress} onChange={(event) => updateVendorField("shopAddress", event.target.value)} />
              {fieldErrors.shopAddress && <div style={{ color: "#dc2626", fontSize: ".8rem", marginTop: 6 }}>{fieldErrors.shopAddress}</div>}
            </label>
            <div className="vendor-grid" style={{ marginTop: 18 }}>
              <label style={{ display: "block" }}>
                <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>Contact Number</div>
                <input className="vendor-input" type="tel" inputMode="tel" placeholder="Enter your contact number" value={vendorForm.contactNumber} onChange={(event) => updateVendorField("contactNumber", event.target.value)} />
                {fieldErrors.contactNumber && <div style={{ color: "#dc2626", fontSize: ".8rem", marginTop: 6 }}>{fieldErrors.contactNumber}</div>}
              </label>
              <label style={{ display: "block" }}>
                <div style={{ fontSize: ".88rem", fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>API Number</div>
                <input className="vendor-input" type="tel" inputMode="tel" placeholder="Enter WhatsApp API number" value={vendorForm.apiNumber} onChange={(event) => updateVendorField("apiNumber", event.target.value)} />
                {fieldErrors.apiNumber && <div style={{ color: "#dc2626", fontSize: ".8rem", marginTop: 6 }}>{fieldErrors.apiNumber}</div>}
              </label>
            </div>
            <div style={{ marginTop: 16, background: "linear-gradient(135deg,#fff7ed,#fff1f2)", border: "1px solid #fdba74", borderRadius: 20, padding: "15px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fed7aa", color: "#c2410c", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, flexShrink: 0 }}>!</div>
              <div>
                <div style={{ fontSize: ".92rem", fontWeight: 800, color: "#9a3412", marginBottom: 4 }}>Important note for API number</div>
                <div style={{ color: "#9a3412", fontSize: ".89rem", lineHeight: 1.7 }}>For this number, normal WhatsApp will not work after moving to the WhatsApp Business API setup. Please use a dedicated number for API onboarding.</div>
              </div>
            </div>
            <label style={{ marginTop: 18, display: "flex", gap: 12, alignItems: "flex-start", background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 20, padding: "15px 16px", cursor: "pointer" }}>
              <input type="checkbox" checked={vendorForm.acceptedTerms} onChange={(event) => updateVendorField("acceptedTerms", event.target.checked)} style={{ marginTop: 4, accentColor: "#7c3aed", width: 16, height: 16 }} />
              <span style={{ color: "#4c1d95", fontSize: ".92rem", lineHeight: 1.8 }}><strong>I approve the <button type="button" onClick={() => setShowTerms(true)} style={{ border: "none", background: "transparent", color: "#6d28d9", fontWeight: 800, padding: 0, cursor: "pointer", textDecoration: "underline" }}>terms and conditions</button></strong> for moving ahead with vendor registration and setup discussion.</span>
            </label>
            {fieldErrors.acceptedTerms && <div style={{ color: "#dc2626", fontSize: ".8rem", marginTop: 8 }}>{fieldErrors.acceptedTerms}</div>}
            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
              <button type="submit" disabled={vendorSubmitState.status === "loading"} className="demo-btn" style={{ border: "none", borderRadius: 16, padding: "15px 26px", cursor: vendorSubmitState.status === "loading" ? "wait" : "pointer", fontWeight: 800, fontSize: ".98rem", color: "white", background: vendorSubmitState.status === "loading" ? "#a78bfa" : "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 16px 34px rgba(124,58,237,.24)", opacity: vendorSubmitState.status === "loading" ? 0.9 : 1 }}>
                {vendorSubmitState.status === "loading" ? "Submitting..." : "Submit Vendor Details"}
              </button>
              <span style={{ color: "#64748b", fontSize: ".88rem", fontWeight: 500 }}>Your details go directly to our vendor onboarding queue.</span>
            </div>
          </form>
        </div>
      </section>
      {showTerms && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 50 }} onClick={() => setShowTerms(false)}>
          <div style={{ width: "min(680px,100%)", maxHeight: "85vh", overflowY: "auto", background: "white", borderRadius: 24, padding: "28px 24px", boxShadow: "0 28px 80px rgba(15,23,42,.28)" }} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#7c3aed", marginBottom: 6 }}>Terms and Conditions</div>
                <h3 style={{ margin: 0, fontSize: "1.45rem", color: "#0f172a", fontWeight: 900 }}>Vendor registration terms</h3>
              </div>
              <button type="button" onClick={() => setShowTerms(false)} style={{ border: "none", background: "#f3f4f6", color: "#111827", width: 36, height: 36, borderRadius: 999, cursor: "pointer", fontWeight: 800 }}>X</button>
            </div>
            <div style={{ color: "#475569", lineHeight: 1.85, fontSize: ".94rem", display: "grid", gap: 14 }}>
              <p style={{ margin: 0 }}>By submitting this form, you confirm that the details provided for vendor onboarding are correct to the best of your knowledge.</p>
              <p style={{ margin: 0 }}>You agree that our team may contact you on the provided contact number or WhatsApp API number to continue onboarding and business setup discussions.</p>
              <p style={{ margin: 0 }}>You understand that the WhatsApp API number should be a dedicated number. Normal personal WhatsApp use may not continue on that number after Business API onboarding.</p>
              <p style={{ margin: 0 }}>Submitting this form does not guarantee activation. Vendor records may remain inactive until review, verification, and onboarding setup are completed.</p>
              <p style={{ margin: 0 }}>You consent to the storage of the submitted business and contact details for onboarding, support, and operational communication.</p>
            </div>
            <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowTerms(false)} className="demo-btn" style={{ border: "none", borderRadius: 14, padding: "12px 20px", cursor: "pointer", fontWeight: 800, color: "white", background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      <section style={{ padding: "80px 6%", background: "#fff", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>🥛</div>
          <h2 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 800, color: "#0f172a", margin: "0 0 14px" }}>Ready to automate your milk delivery?</h2>
          <p style={{ color: "#64748b", lineHeight: 1.75, margin: "0 0 28px", fontSize: "0.95rem" }}>
            MilkRoute handles subscriptions, orders, pauses, and bills — so you focus on delivery, not admin.
          </p>
          <a href="mailto:cheritechcompany@gmail.com" className="demo-btn" style={{
            display: "inline-block", padding: "14px 36px", borderRadius: 12,
            background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
            color: "white", textDecoration: "none", fontWeight: 700, fontSize: "1rem",
            boxShadow: "0 6px 24px rgba(124,58,237,.35)"
          }}>
            Get Started → Contact Us
          </a>
          <div style={{ marginTop: 20, fontSize: "0.85rem", color: "#94a3b8" }}>cheritechcompany@gmail.com · Hyderabad, India</div>
        </div>
      </section>
    </CompanyLayout>
  )
}
