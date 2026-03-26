import CompanyLayout from "./CompanyLayout"

const services = [
  { icon: "🤖", color: "#4F46E5", light: "#EEF2FF", border: "#C7D2FE", title: "WhatsApp Automation",   desc: "Smart bots that handle customer orders, notifications, and communication — powered by the official WhatsApp Business API." },
  { icon: "📊", color: "#0EA5E9", light: "#E0F2FE", border: "#BAE6FD", title: "Vendor Dashboards",      desc: "Web dashboards for vendors to manage orders, track customers, and run their business from any device." },
  { icon: "🛒", color: "#F97316", light: "#FFF7ED", border: "#FED7AA", title: "Supply Chain Tools",     desc: "Connect suppliers and customers — subscriptions, deliveries, and payments managed in one place." },
  { icon: "💡", color: "#10B981", light: "#ECFDF5", border: "#A7F3D0", title: "Custom Software",        desc: "Have an idea? We turn it into a working product — web apps, automation tools, and business-specific solutions." },
]

const whyItems = [
  { icon: "🎯", color: "#4F46E5", bg: "#EEF2FF", title: "Problem-First",     desc: "We understand your problem before writing a single line of code." },
  { icon: "⚡", color: "#F97316", bg: "#FFF7ED", title: "Fast & Lean",        desc: "Clean, minimal code that does exactly what's needed — nothing more." },
  { icon: "🔒", color: "#0EA5E9", bg: "#E0F2FE", title: "Secure by Default", desc: "Security and privacy are built in from day one, not added later." },
  { icon: "🤝", color: "#10B981", bg: "#ECFDF5", title: "Personal Attention", desc: "Direct communication with the founder — no middlemen, no delays." },
]

const techs = ["React", "Node.js", "PostgreSQL", "WhatsApp API", "Express", "Vite", "REST APIs", "JavaScript"]

const stats = [
  { val: "2026", label: "Active Since",  color: "#4F46E5" },
  { val: "1+",   label: "Live Products", color: "#F97316" },
  { val: "100%", label: "Commitment",    color: "#10B981" },
  { val: "∞",    label: "Ideas Brewing", color: "#0EA5E9" },
]

const contactItems = [
  { icon: "📧", color: "#4F46E5", bg: "#EEF2FF", label: "Email",         value: "navyaapps756@gmail.com",         href: "mailto:navyaapps756@gmail.com" },
  { icon: "📍", color: "#0EA5E9", bg: "#E0F2FE", label: "Location",      value: "Ameenpur, Hyderabad, Telangana", href: null },
  { icon: "⏰", color: "#F97316", bg: "#FFF7ED", label: "Response Time", value: "Within 24 hours",                href: null },
  { icon: "🏢", color: "#10B981", bg: "#ECFDF5", label: "Business",      value: "Sole Proprietorship",            href: null },
]

export default function HomePage() {
  return (
    <CompanyLayout>

      {/* ── HERO (dark section) ── */}
      <section style={{ minHeight: "88vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 6%", background: "#0F172A", position: "relative", overflow: "hidden" }}>
        {/* Subtle blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "5%", left: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(79,70,229,.18) 0%,transparent 65%)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", bottom: "5%", right: "5%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(14,165,233,.14) 0%,transparent 65%)", filter: "blur(52px)" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: .03, backgroundImage: "radial-gradient(#fff 1px,transparent 1px)", backgroundSize: "32px 32px" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 820 }}>
          <div className="anim-badge" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 28, background: "rgba(79,70,229,.15)", border: "1px solid rgba(79,70,229,.35)", color: "#A5B4FC", padding: "7px 18px", borderRadius: 50, fontSize: "0.82rem", fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "softPulse 2s ease-in-out infinite" }} />
            Hyderabad, India · Est. 2026
          </div>

          <h1 className="anim-up d1" style={{ fontSize: "clamp(2.4rem,6.5vw,4.8rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 6, letterSpacing: -2, color: "white" }}>Building Smart</h1>
          <h1 className="anim-up d2" style={{ fontSize: "clamp(2.4rem,6.5vw,4.8rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 6, letterSpacing: -2 }}>
            <span className="anim-shimmer">Digital Products</span>
          </h1>
          <h1 className="anim-up d3" style={{ fontSize: "clamp(2.4rem,6.5vw,4.8rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: -2, color: "white" }}>for Real Needs</h1>

          <p className="anim-up d4" style={{ fontSize: "1.1rem", color: "#94A3B8", maxWidth: 500, margin: "0 auto 44px", lineHeight: 1.8 }}>
            We design and develop practical software that helps businesses grow and customers get better service.
          </p>

          <div className="anim-up d5" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#services"
              style={{ padding: "14px 36px", background: "linear-gradient(135deg,#4F46E5,#0EA5E9)", color: "white", borderRadius: 10, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none", boxShadow: "0 4px 20px rgba(79,70,229,.4)", transition: "all .25s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(79,70,229,.55)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(79,70,229,.4)" }}
            >Explore Our Work ↓</a>
            <a href="#contact"
              onClick={e => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }) }}
              style={{ padding: "14px 36px", border: "1px solid rgba(255,255,255,.2)", color: "#CBD5E1", borderRadius: 10, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", transition: "all .25s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(165,180,252,.5)"; e.currentTarget.style.color = "#A5B4FC" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.2)"; e.currentTarget.style.color = "#CBD5E1" }}
            >Get in Touch</a>
          </div>
        </div>
      </section>

      {/* ── SERVICES (light) ── */}
      <section id="services" style={{ padding: "100px 6%", background: "#F8FAFC" }}>
        <div className="anim-up" style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ display: "inline-block", background: "#EEF2FF", color: "#4F46E5", padding: "5px 18px", borderRadius: 50, fontSize: "0.76rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>What We Do</div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 900, color: "#0F172A", marginBottom: 12, letterSpacing: -1 }}>Products &amp; Services</h2>
          <p style={{ color: "#64748B", fontSize: "1rem", maxWidth: 440, margin: "0 auto", lineHeight: 1.8 }}>Software tools built to solve real problems — practical, reliable, built with care.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 20 }}>
          {services.map((sv, i) => (
            <div key={sv.title} className={`s-card anim-up d${i + 2}`} style={{ background: "#FFFFFF", borderRadius: 16, padding: "32px 26px", border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
              <div className="anim-float" style={{ animationDelay: `${i * .9}s`, width: 52, height: 52, borderRadius: 14, background: sv.light, border: `1px solid ${sv.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.55rem", marginBottom: 20 }}>{sv.icon}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>{sv.title}</h3>
              <p style={{ fontSize: "0.87rem", color: "#64748B", lineHeight: 1.78 }}>{sv.desc}</p>
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 600, color: sv.color }}>
                <span>Learn more</span><span>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS (indigo dark band) ── */}
      <div style={{ padding: "64px 6%", background: "#4F46E5" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 24, maxWidth: 900, margin: "0 auto", textAlign: "center" }} className="four-col">
          {stats.map((st, i) => (
            <div key={st.label} className={`anim-up d${i + 1}`}>
              <div style={{ fontSize: "2.8rem", fontWeight: 900, color: "white", marginBottom: 6 }}>{st.val}</div>
              <div style={{ color: "rgba(255,255,255,.65)", fontSize: "0.85rem" }}>{st.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHY US (white) ── */}
      <section style={{ padding: "100px 6%", background: "#FFFFFF" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", maxWidth: 1100, margin: "0 auto" }} className="two-col">
          <div className="anim-left">
            <div style={{ display: "inline-block", background: "#FFF7ED", color: "#F97316", padding: "5px 18px", borderRadius: 50, fontSize: "0.76rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Why Choose Us</div>
            <h2 style={{ fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 900, color: "#0F172A", marginBottom: 14, letterSpacing: -1, lineHeight: 1.2 }}>
              We build with purpose,<br />
              <span style={{ color: "#4F46E5" }}>not just code.</span>
            </h2>
            <p style={{ color: "#64748B", marginBottom: 32, fontSize: "0.97rem", lineHeight: 1.82 }}>
              Every product solves a genuine problem. Simple, practical, and reliable — always.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {whyItems.map((w, i) => (
                <div key={w.title} className={`w-item anim-left d${i + 2}`} style={{ display: "flex", gap: 14, alignItems: "center", background: "#F8FAFC", padding: "16px 18px", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, background: w.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.15rem" }}>{w.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.9rem", marginBottom: 2 }}>{w.title}</div>
                    <div style={{ fontSize: "0.83rem", color: "#64748B" }}>{w.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="anim-right" style={{ background: "#0F172A", borderRadius: 24, padding: "48px 40px", textAlign: "center", boxShadow: "0 20px 60px rgba(15,23,42,.15)" }}>
            <div className="anim-float" style={{ fontSize: "2.8rem", marginBottom: 18 }}>⚙️</div>
            <h3 style={{ fontSize: "1.55rem", fontWeight: 900, color: "white", marginBottom: 10, letterSpacing: -.5 }}>Built with Modern Tech</h3>
            <p style={{ color: "#64748B", fontSize: "0.88rem", marginBottom: 32, lineHeight: 1.8 }}>
              The right tools for every job — proven technologies that scale with your business.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 36 }}>
              {techs.map((t, i) => {
                const colors = ["#A5B4FC","#67E8F9","#FED7AA","#6EE7B7","#FCA5A5","#C4B5FD","#93C5FD","#FDE68A"]
                const bgs    = ["rgba(79,70,229,.15)","rgba(14,165,233,.15)","rgba(249,115,22,.15)","rgba(16,185,129,.15)","rgba(239,68,68,.15)","rgba(139,92,246,.15)","rgba(59,130,246,.15)","rgba(245,158,11,.15)"]
                return (
                  <span key={t} style={{ padding: "6px 14px", borderRadius: 50, fontSize: "0.79rem", fontWeight: 600, background: bgs[i], color: colors[i], transition: "transform .2s", cursor: "default" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                    onMouseLeave={e => e.currentTarget.style.transform = ""}
                  >{t}</span>
                )
              })}
            </div>
            <div style={{ paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.06)" }}>
              <div style={{ fontSize: "0.74rem", color: "#475569", marginBottom: 10, letterSpacing: .8, textTransform: "uppercase" }}>Currently Live</div>
              <div style={{ background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.25)", borderRadius: 10, padding: "11px 16px", color: "#6EE7B7", fontSize: "0.86rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "softPulse 2s infinite" }} />
                Milk Vendor Management System
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT (light gray, no form) ── */}
      <section id="contact" style={{ padding: "100px 6%", background: "#F1F5F9" }}>
        <div className="anim-up" style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-block", background: "#ECFDF5", color: "#10B981", padding: "5px 18px", borderRadius: 50, fontSize: "0.76rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 }}>Get in Touch</div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 900, color: "#0F172A", marginBottom: 12, letterSpacing: -1 }}>Let's Build Something</h2>
          <p style={{ color: "#64748B", fontSize: "1rem", maxWidth: 400, margin: "0 auto 32px", lineHeight: 1.8 }}>
            Have a project idea or a question? Reach out directly.
          </p>
          <a href="mailto:navyaapps756@gmail.com"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 36px", background: "linear-gradient(135deg,#4F46E5,#0EA5E9)", color: "white", borderRadius: 10, fontWeight: 700, fontSize: "0.97rem", textDecoration: "none", boxShadow: "0 4px 20px rgba(79,70,229,.35)", transition: "all .25s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(79,70,229,.5)" }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(79,70,229,.35)" }}
          >📧 Send me an Email</a>
        </div>

        {/* 4 info cards — fixed alignment */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, maxWidth: 1000, margin: "0 auto" }} className="four-col">
          {contactItems.map((c, i) => (
            <div key={c.label} className={`c-item anim-up d${i + 2}`} style={{ background: "#FFFFFF", padding: "24px 20px", borderRadius: 14, border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", marginBottom: 14 }}>{c.icon}</div>
              <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 1, color: "#94A3B8", marginBottom: 6 }}>{c.label}</div>
              {c.href
                ? <a href={c.href} style={{ fontWeight: 700, color: c.color, fontSize: "0.85rem", textDecoration: "none", wordBreak: "break-all" }}>{c.value}</a>
                : <div style={{ fontWeight: 700, color: "#1E293B", fontSize: "0.85rem" }}>{c.value}</div>
              }
            </div>
          ))}
        </div>
      </section>

    </CompanyLayout>
  )
}
