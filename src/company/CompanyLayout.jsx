import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

const NAV = [
  { label: "Home",           path: "/" },
  { label: "About",          path: "/about" },
  { label: "Privacy Policy", path: "/privacy" },
]

const GLOBAL_STYLES = `
  body.company-page #root {
    width: 100% !important; max-width: 100% !important;
    margin: 0 !important; border: none !important;
    text-align: left !important; display: block !important;
  }
  body.company-page { background: #F8FAFC !important; }

  @keyframes fadeInUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeInLeft  { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes fadeInRight { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes fadeInDown  { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes float       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes softPulse   { 0%,100%{opacity:.6} 50%{opacity:1} }
  @keyframes shimmer     { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes badgePop    { from{opacity:0;transform:scale(.9) translateY(-6px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes lineGrow    { from{width:0} to{width:100%} }

  .anim-up    { animation: fadeInUp    .65s cubic-bezier(.22,1,.36,1) both }
  .anim-left  { animation: fadeInLeft  .65s cubic-bezier(.22,1,.36,1) both }
  .anim-right { animation: fadeInRight .65s cubic-bezier(.22,1,.36,1) both }
  .anim-float { animation: float 5s ease-in-out infinite }
  .anim-badge { animation: badgePop .55s cubic-bezier(.22,1,.36,1) both }
  .anim-shimmer {
    background: linear-gradient(90deg,#4F46E5,#0EA5E9,#F97316,#10B981,#4F46E5);
    background-size: 300% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 5s linear infinite;
  }
  .d1{animation-delay:.08s} .d2{animation-delay:.16s} .d3{animation-delay:.24s}
  .d4{animation-delay:.32s} .d5{animation-delay:.40s} .d6{animation-delay:.48s}
  .d7{animation-delay:.56s} .d8{animation-delay:.64s}

  .s-card { transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s ease, border-color .3s ease !important }
  .s-card:hover { transform: translateY(-6px) !important; box-shadow: 0 16px 48px rgba(79,70,229,.12) !important; border-color: #C7D2FE !important }
  .w-item { transition: transform .22s ease, box-shadow .22s ease !important }
  .w-item:hover { transform: translateX(5px) !important; box-shadow: 0 4px 20px rgba(79,70,229,.08) !important }
  .c-item { transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease !important }
  .c-item:hover { transform: translateY(-4px) !important; box-shadow: 0 8px 28px rgba(79,70,229,.1) !important; border-color: #C7D2FE !important }
  .v-card { transition: transform .3s ease, box-shadow .3s ease !important }
  .v-card:hover { transform: translateY(-5px) !important; box-shadow: 0 12px 36px rgba(79,70,229,.1) !important }

  @media(max-width:768px){
    .desk-nav{display:none !important}
    .burger{display:block !important}
    .two-col{grid-template-columns:1fr !important}
    .four-col{grid-template-columns:1fr 1fr !important}
  }
  @media(max-width:480px){ .four-col{grid-template-columns:1fr !important} }
`

export default function CompanyLayout({ children }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    document.body.classList.add("company-page")
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => {
      document.body.classList.remove("company-page")
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  function goToContact(e) {
    e.preventDefault()
    setMenuOpen(false)
    if (pathname === "/") {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
    } else {
      navigate("/")
      setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 300)
    }
  }

  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: "#F8FAFC", minHeight: "100vh", width: "100%", overflowX: "hidden" }}>
      <style>{GLOBAL_STYLES}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, height: 68,
        padding: "0 6%", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(255,255,255,.97)" : "rgba(255,255,255,.85)",
        backdropFilter: "blur(20px)",
        borderBottom: scrolled ? "1px solid #E2E8F0" : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,.06)" : "none",
        transition: "all .3s ease",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg,#4F46E5,#0EA5E9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 900, fontSize: "1.1rem",
            boxShadow: "0 4px 14px rgba(79,70,229,.35)"
          }}>N</div>
          <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0F172A", letterSpacing: -.3 }}>
            Navya<span style={{ color: "#4F46E5" }}>Tech</span>
          </span>
        </Link>

        <ul style={{ display: "flex", alignItems: "center", gap: 2, listStyle: "none", margin: 0, padding: 0 }} className="desk-nav">
          {NAV.map(n => (
            <li key={n.path}>
              <Link to={n.path} style={{
                padding: "7px 18px", borderRadius: 8, fontWeight: 500,
                fontSize: "0.9rem", textDecoration: "none", display: "block",
                background: pathname === n.path ? "#EEF2FF" : "transparent",
                color: pathname === n.path ? "#4F46E5" : "#475569",
                transition: "all .2s"
              }}
                onMouseEnter={e => { if (pathname !== n.path) { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.color = "#1E293B" }}}
                onMouseLeave={e => { if (pathname !== n.path) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#475569" }}}
              >{n.label}</Link>
            </li>
          ))}
          <li style={{ marginLeft: 8 }}>
            <a href="#contact" onClick={goToContact} style={{
              padding: "8px 22px", borderRadius: 8, fontWeight: 600, fontSize: "0.9rem",
              textDecoration: "none", background: "#4F46E5", color: "white",
              boxShadow: "0 2px 12px rgba(79,70,229,.3)", display: "block",
              transition: "all .2s"
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#4338CA"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(79,70,229,.45)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "#4F46E5"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(79,70,229,.3)" }}
            >Contact Us</a>
          </li>
        </ul>

        <button onClick={() => setMenuOpen(v => !v)} className="burger" style={{
          display: "none", background: "none", border: "1px solid #E2E8F0",
          borderRadius: 8, padding: "6px 10px", fontSize: "1.1rem", cursor: "pointer", color: "#475569"
        }}>{menuOpen ? "✕" : "☰"}</button>
      </nav>

      {menuOpen && (
        <div style={{
          position: "fixed", top: 68, left: 0, right: 0, zIndex: 999,
          background: "rgba(255,255,255,.98)", borderBottom: "1px solid #E2E8F0",
          padding: "12px 6%", display: "flex", flexDirection: "column", gap: 4,
          boxShadow: "0 8px 24px rgba(0,0,0,.06)", animation: "fadeInDown .25s ease both"
        }}>
          {NAV.map(n => (
            <Link key={n.path} to={n.path} onClick={() => setMenuOpen(false)} style={{
              padding: "11px 16px", borderRadius: 8, textDecoration: "none", fontWeight: 500, fontSize: "0.95rem",
              color: pathname === n.path ? "#4F46E5" : "#475569",
              background: pathname === n.path ? "#EEF2FF" : "transparent"
            }}>{n.label}</Link>
          ))}
          <a href="#contact" onClick={goToContact} style={{ padding: "11px 16px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: "0.95rem", color: "#4F46E5", background: "#EEF2FF" }}>Contact Us</a>
        </div>
      )}

      <div style={{ paddingTop: 68 }}>
        <main>{children}</main>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#0F172A", padding: "60px 6% 30px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, paddingBottom: 44, borderBottom: "1px solid rgba(255,255,255,.07)", marginBottom: 28 }} className="two-col">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#4F46E5,#0EA5E9)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900 }}>N</div>
              <span style={{ color: "white", fontWeight: 800, fontSize: "1rem" }}>Navya<span style={{ color: "#818CF8" }}>Tech</span> Solutions</span>
            </div>
            <p style={{ fontSize: "0.87rem", lineHeight: 1.85, color: "#64748B", maxWidth: 300 }}>
              Building practical digital products for businesses and customers. Based in Hyderabad, serving clients everywhere.
            </p>
          </div>
          <div>
            <h4 style={{ color: "#94A3B8", fontSize: "0.78rem", fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1.2 }}>Pages</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {NAV.map(n => (
                <li key={n.path}>
                  <Link to={n.path} style={{ fontSize: "0.87rem", color: "#64748B", textDecoration: "none", transition: "color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#818CF8"}
                    onMouseLeave={e => e.currentTarget.style.color = "#64748B"}
                  >{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: "#94A3B8", fontSize: "0.78rem", fontWeight: 700, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1.2 }}>Contact</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10, fontSize: "0.87rem", color: "#64748B" }}>
              <li>navyaapps756@gmail.com</li>
              <li>Ameenpur, Hyderabad</li>
              <li>Telangana, India</li>
            </ul>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#334155", flexWrap: "wrap", gap: 10 }}>
          <span>© 2026 Navya Tech Solutions. All rights reserved.</span>
          <Link to="/privacy" style={{ color: "#818CF8", textDecoration: "none" }}>Privacy Policy</Link>
        </div>
      </footer>
    </div>
  )
}
