import CompanyLayout from "./CompanyLayout"

const sections = [
  {
    icon: "📋", color: "#00C896", glow: "rgba(0,200,150,0.25)",
    grad: "linear-gradient(135deg,#00C896,#059669)",
    title: "Information We Collect",
    points: [
      "Customer name and WhatsApp phone number",
      "Vendor business name and contact details",
      "Order history, subscription plans, and delivery records",
      "Messages sent to our WhatsApp bots",
      "Basic device and browser information",
    ]
  },
  {
    icon: "⚙️", color: "#06B6D4", glow: "rgba(75,158,255,0.25)",
    grad: "linear-gradient(135deg,#06B6D4,#2563EB)",
    title: "How We Use It",
    points: [
      "To operate and manage our products and services",
      "To process customer orders and subscriptions",
      "To send order confirmations and notifications via WhatsApp",
      "To allow vendors to manage their customer relationships",
      "To respond to support enquiries",
    ]
  },
  {
    icon: "💬", color: "#00C896", glow: "rgba(0,200,150,0.25)",
    grad: "linear-gradient(135deg,#00C896,#059669)",
    title: "WhatsApp Data & Vendor Sharing",
    points: [
      "Customer phone numbers and WhatsApp IDs are shared with the respective vendor to manage orders and deliveries",
      "Customer names, addresses, and location details are shared with vendors for accurate delivery management",
      "Order details, subscription plans, and delivery schedules are visible to the vendor through the dashboard",
      "Vendors can view full customer profiles including contact number, address, and order history",
      "This sharing is essential to operate the service — vendors need this information to serve their customers",
      "Data is not shared with any unrelated third parties outside of Meta (WhatsApp platform requirement)",
    ]
  },
  {
    icon: "✅", color: "#FFC542", glow: "rgba(255,197,66,0.25)",
    grad: "linear-gradient(135deg,#FFC542,#DC2626)",
    title: "Your Rights",
    points: [
      "Request to view the data we hold about you",
      "Request correction of inaccurate information",
      "Request deletion of your personal data",
      "Withdraw consent by contacting us directly",
      "Reach us anytime at navyaapps756@gmail.com",
    ]
  },
]

export default function PrivacyPage() {
  return (
    <CompanyLayout>

      {/* PAGE HERO */}
      <section style={{ background: "#070C0A", padding: "90px 6% 70px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div className="anim-glowPulse" style={{ position: "absolute", top: "10%", left: "15%", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,200,150,0.18) 0%,transparent 70%)", filter: "blur(50px)" }} />
          <div className="anim-glowPulse delay-3" style={{ position: "absolute", bottom: "5%", right: "10%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(75,158,255,0.13) 0%,transparent 70%)", filter: "blur(45px)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="anim-badge" style={{ display: "inline-block", background: "rgba(0,200,150,0.08)", border: "1px solid rgba(0,200,150,0.28)", color: "#5EFFD3", padding: "7px 20px", borderRadius: 50, fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 22 }}>Legal</div>
          <h1 className="anim-fadeInUp delay-1" style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 900, color: "white", marginBottom: 18, letterSpacing: -1.8 }}>Privacy Policy</h1>
          <p className="anim-fadeInUp delay-2" style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.05rem", maxWidth: 440, margin: "0 auto", lineHeight: 1.8 }}>
            Simple and clear — how we collect, use, and share your information.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section style={{ padding: "80px 6%", background: "#090E0C" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          {/* Badge */}
          <div className="anim-fadeInUp" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,200,150,0.08)", border: "1px solid rgba(0,200,150,0.22)", color: "#5EFFD3", padding: "9px 20px", borderRadius: 10, fontSize: "0.82rem", fontWeight: 600, marginBottom: 44 }}>
            📅 Last Updated: March 2026
          </div>

          {/* Intro card */}
          <div className="anim-fadeInUp delay-1 anim-borderGlow" style={{ background: "#0D1610", borderRadius: 18, padding: "28px 32px", border: "1px solid rgba(0,200,150,0.15)", marginBottom: 32, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#00C896,#06B6D4,#FFC542)" }} />
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.97rem", lineHeight: 1.85, margin: 0 }}>
              This Privacy Policy explains how <strong style={{ color: "white" }}>Cheritech</strong> — a sole proprietorship by Vedullapalli Naga Durga Satya Sai Navya — collects and uses your information when you use our products and services. By using our services, you agree to this policy.
            </p>
          </div>

          {/* Important notice about vendor sharing */}
          <div className="anim-fadeInUp delay-2" style={{ background: "rgba(255,197,66,0.06)", borderRadius: 18, padding: "22px 28px", border: "1px solid rgba(255,197,66,0.2)", marginBottom: 36, display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: "#FFE08A", fontSize: "0.9rem", marginBottom: 6 }}>Important — Vendor Data Sharing</div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.88rem", lineHeight: 1.75, margin: 0 }}>
                Our core service involves sharing customer WhatsApp phone numbers, names, and order details with their respective vendor. This is essential for order management and delivery — vendors must have this information to serve their customers.
              </p>
            </div>
          </div>

          {/* 4 section cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }} className="two-col">
            {sections.map((sec, i) => (
              <div key={sec.title} className={`value-card anim-fadeInUp delay-${i + 2}`} style={{ background: "#0D1610", borderRadius: 20, padding: "30px 26px", border: "1px solid rgba(0,200,150,0.12)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: sec.glow, filter: "blur(24px)", opacity: 0.6 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: sec.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", boxShadow: `0 6px 20px ${sec.glow}` }}>{sec.icon}</div>
                  <h3 style={{ color: "white", fontWeight: 800, fontSize: "0.92rem", margin: 0, lineHeight: 1.3 }}>{sec.title}</h3>
                </div>
                <ul style={{ padding: 0, listStyle: "none", margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
                  {sec.points.map((p, j) => (
                    <li key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: sec.color, marginTop: 4, flexShrink: 0, fontSize: "0.6rem" }}>◆</span>
                      <span style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="two-col">
            <div className="anim-fadeInUp delay-6" style={{ background: "#0D1610", borderRadius: 16, padding: "26px 26px", border: "1px solid rgba(0,200,150,0.12)" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: 12 }}>🔄</div>
              <h3 style={{ color: "white", fontWeight: 800, fontSize: "0.92rem", marginBottom: 10 }}>Policy Updates</h3>
              <p style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.75, margin: 0 }}>
                We may update this policy from time to time. The date at the top reflects the latest revision. Continued use of our services means you accept any updates.
              </p>
            </div>
            <div className="anim-fadeInUp delay-7 anim-borderGlow" style={{ background: "linear-gradient(145deg,#0C1A12,#041222)", borderRadius: 16, padding: "26px 26px", border: "1px solid rgba(0,200,150,0.2)" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: 12 }}>📬</div>
              <h3 style={{ color: "white", fontWeight: 800, fontSize: "0.92rem", marginBottom: 10 }}>Contact Us</h3>
              <p style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.75, marginBottom: 14 }}>
                Questions or data requests? Reach out directly.
              </p>
              <div style={{ fontSize: "0.85rem", color: "#5EFFD3", fontWeight: 600, marginBottom: 4 }}>navyaapps756@gmail.com</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.25)" }}>Ameenpur, Hyderabad, Telangana, India</div>
            </div>
          </div>

        </div>
      </section>

    </CompanyLayout>
  )
}
