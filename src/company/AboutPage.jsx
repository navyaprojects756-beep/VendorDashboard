import CompanyLayout from "./CompanyLayout"

const COLORS = {
  violet: "#00C896", cyan: "#06B6D4", orange: "#FFC542",
  pink: "#FF6060", green: "#00C896", dark: "#070C0A", darkCard: "#0D1610",
  border: "rgba(0,200,150,0.15)",
}

const values = [
  { icon: "🎯", grad: "linear-gradient(135deg,#00C896,#059669)", glow: "rgba(0,200,150,0.3)", title: "Mission", desc: "Build practical, affordable digital tools that help small businesses and individuals work smarter." },
  { icon: "🔭", grad: "linear-gradient(135deg,#06B6D4,#2563EB)", glow: "rgba(75,158,255,0.3)", title: "Vision", desc: "Become a trusted technology partner for businesses across India, starting from Hyderabad." },
  { icon: "💎", grad: "linear-gradient(135deg,#FF6060,#BE185D)", glow: "rgba(255,96,96,0.3)", title: "Quality", desc: "Clean, reliable, and maintainable products. Quality is a habit, not a checkbox." },
  { icon: "🌱", grad: "linear-gradient(135deg,#00C896,#059669)", glow: "rgba(0,200,150,0.3)", title: "Growth", desc: "We're just getting started. Every product we build teaches us more." },
]

export default function AboutPage() {
  return (
    <CompanyLayout>

      {/* PAGE HERO */}
      <section style={{
        background: COLORS.dark, padding: "90px 6% 70px",
        textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "20%", left: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,200,150,0.2) 0%,transparent 70%)", filter: "blur(50px)" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "15%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(75,158,255,0.15) 0%,transparent 70%)", filter: "blur(40px)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-block", background: "rgba(0,200,150,0.1)", border: "1px solid rgba(0,200,150,0.3)",
            color: "#5EFFD3", padding: "6px 18px", borderRadius: 50, fontSize: "0.8rem",
            fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 20
          }}>About Us</div>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 900, color: "white", marginBottom: 16, letterSpacing: -1.5 }}>Who We Are</h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1.05rem", maxWidth: 460, margin: "0 auto" }}>
            A solo-founded tech company from Hyderabad, building digital products that matter.
          </p>
        </div>
      </section>

      {/* FOUNDER */}
      <section style={{ padding: "90px 6%", background: "#090E0C" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 56, alignItems: "center", maxWidth: 1100, margin: "0 auto" }}>

          {/* Founder card */}
          <div style={{
            background: "linear-gradient(145deg,#1A0533,#0A1018)",
            borderRadius: 24, padding: "44px 32px", textAlign: "center",
            border: "1px solid rgba(0,200,150,0.2)",
            boxShadow: "0 0 60px rgba(0,200,150,0.1)"
          }}>
            <div style={{
              width: 88, height: 88, margin: "0 auto 18px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#00C896,#06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", fontWeight: 900, color: "white",
              boxShadow: "0 0 30px rgba(0,200,150,0.5)"
            }}>N</div>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "white", marginBottom: 6 }}>Navya</h3>
            <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", marginBottom: 14, lineHeight: 1.6 }}>
              Vedullapalli Naga Durga<br />Satya Sai Navya
            </p>
            <span style={{
              display: "inline-block", background: "rgba(0,200,150,0.15)",
              border: "1px solid rgba(0,200,150,0.3)",
              color: "#5EFFD3", padding: "5px 14px", borderRadius: 50, fontSize: "0.78rem", fontWeight: 600
            }}>Founder & Developer</span>

            <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>📍 Ameenpur, Hyderabad</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>📧 navyaapps756@gmail.com</div>
            </div>
          </div>

          <div>
            <div style={{
              display: "inline-block", background: "rgba(75,158,255,0.1)", border: "1px solid rgba(75,158,255,0.3)",
              color: "#93C5FD", padding: "5px 18px", borderRadius: 50, fontSize: "0.78rem",
              fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 18
            }}>The Founder</div>
            <h2 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, color: "white", marginBottom: 20, letterSpacing: -0.8, lineHeight: 1.25 }}>
              Building products from Hyderabad,<br />
              <span style={{ background: "linear-gradient(90deg,#00C896,#06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                one problem at a time.
              </span>
            </h2>
            {[
              "Hi, I'm Navya — the founder of Navya Tech Solutions. I started this company because I wanted to build software that actually helps people, not just impressive-looking demos.",
              "My first product is a WhatsApp-based milk delivery management system — a tool that helps local milk vendors manage customers, orders, and subscriptions through a simple bot and vendor dashboard.",
              "We're just getting started. The goal is to build more tools for supply businesses, local service providers, and anyone who could benefit from smart, affordable technology."
            ].map((p, i) => (
              <p key={i} style={{ color: "rgba(255,255,255,0.5)", marginBottom: 16, fontSize: "0.97rem", lineHeight: 1.8 }}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section style={{ padding: "90px 6%", background: COLORS.dark }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{
            display: "inline-block", background: "rgba(255,197,66,0.1)", border: "1px solid rgba(255,197,66,0.3)",
            color: "#FFE08A", padding: "5px 18px", borderRadius: 50, fontSize: "0.78rem",
            fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16
          }}>Our Foundation</div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 900, color: "white", marginBottom: 14, letterSpacing: -1 }}>
            Mission, Vision &amp; Values
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem", maxWidth: 440, margin: "0 auto" }}>
            The principles that guide every product we build.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
          {values.map(v => (
            <div key={v.title} style={{
              background: COLORS.darkCard, borderRadius: 20, padding: "32px 28px",
              border: `1px solid ${COLORS.border}`, position: "relative", overflow: "hidden"
            }}>
              <div style={{
                position: "absolute", top: -30, right: -30, width: 100, height: 100,
                borderRadius: "50%", background: v.glow, filter: "blur(25px)", opacity: 0.5
              }} />
              <div style={{
                width: 54, height: 54, borderRadius: 14, background: v.grad,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.5rem", marginBottom: 18, boxShadow: `0 6px 20px ${v.glow}`
              }}>{v.icon}</div>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "white", marginBottom: 10 }}>{v.title}</h3>
              <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CURRENT WORK */}
      <section style={{ padding: "90px 6%", background: "#090E0C" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{
            display: "inline-block", background: "rgba(0,200,150,0.1)", border: "1px solid rgba(0,200,150,0.3)",
            color: "#5EFFD3", padding: "5px 18px", borderRadius: 50, fontSize: "0.78rem",
            fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16
          }}>Work</div>
          <h2 style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 900, color: "white", marginBottom: 14, letterSpacing: -1 }}>
            What We're Building
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem", maxWidth: 420, margin: "0 auto" }}>
            We're early, honest about it, and focused on shipping real products.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20, maxWidth: 860, margin: "0 auto" }}>
          <div style={{
            background: COLORS.darkCard, borderRadius: 20, padding: "32px 28px",
            border: "1px solid rgba(0,200,150,0.2)", position: "relative", overflow: "hidden"
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#00C896,#06B6D4)" }} />
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(0,200,150,0.1)", color: "#5EFFD3",
              padding: "4px 12px", borderRadius: 50, fontSize: "0.75rem", fontWeight: 700, marginBottom: 16
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00C896", display: "inline-block" }} />
              Live
            </div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "white", marginBottom: 10 }}>
              🥛 Milk Vendor Management System
            </h3>
            <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
              A WhatsApp bot + vendor dashboard that helps milk delivery businesses manage customers, subscriptions, and daily orders — fully automated.
            </p>
          </div>

          <div style={{
            background: COLORS.darkCard, borderRadius: 20, padding: "32px 28px",
            border: "1px dashed rgba(0,200,150,0.25)"
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,197,66,0.1)", color: "#FFE08A",
              padding: "4px 12px", borderRadius: 50, fontSize: "0.75rem", fontWeight: 700, marginBottom: 16
            }}>◌ Coming Soon</div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "white", marginBottom: 10 }}>
              🚀 More Products in the Pipeline
            </h3>
            <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>
              Tools for supply businesses, local vendors, and customer-facing services. Exciting things are coming.
            </p>
          </div>
        </div>
      </section>

    </CompanyLayout>
  )
}
