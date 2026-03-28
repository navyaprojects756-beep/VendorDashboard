import { motion } from "framer-motion"
import CompanyLayout from "./CompanyLayout"

const PAGE_CSS = `
  @keyframes ppBlob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(45px,-35px) scale(1.14)} 66%{transform:translate(-28px,28px) scale(.93)} }
  @keyframes ppBlob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-38px,32px) scale(1.1)} 66%{transform:translate(32px,-22px) scale(1.05)} }
  @keyframes ppRing1 { from{transform:rotate(0deg)}  to{transform:rotate(360deg)}  }
  @keyframes ppRing2 { from{transform:rotate(0deg)}  to{transform:rotate(-360deg)} }
`

const sections = [
  { icon:"📋", color:"#8B5CF6", glow:"rgba(139,92,246,.25)", grad:"linear-gradient(135deg,#8B5CF6,#6D28D9)", title:"Information We Collect",
    points:["Customer name and WhatsApp phone number","Vendor business name and contact details","Order history, subscription plans, and delivery records","Messages sent to our WhatsApp bots","Basic device and browser information"] },
  { icon:"⚙️", color:"#A78BFA", glow:"rgba(167,139,250,.25)", grad:"linear-gradient(135deg,#A78BFA,#7C3AED)", title:"How We Use It",
    points:["To operate and manage our products and services","To process customer orders and subscriptions","To send order confirmations and notifications via WhatsApp","To allow vendors to manage their customer relationships","To respond to support enquiries"] },
  { icon:"💬", color:"#8B5CF6", glow:"rgba(139,92,246,.25)", grad:"linear-gradient(135deg,#8B5CF6,#6D28D9)", title:"WhatsApp Data & Vendor Sharing",
    points:["Customer phone numbers and WhatsApp IDs are shared with the respective vendor to manage orders","Customer names, addresses, and location details are shared with vendors for accurate delivery","Order details, subscription plans, and delivery schedules are visible to the vendor through the dashboard","Vendors can view full customer profiles including contact number, address, and order history","Data is not shared with any unrelated third parties outside of Meta (WhatsApp platform requirement)"] },
  { icon:"✅", color:"#C4B5FD", glow:"rgba(196,181,253,.25)", grad:"linear-gradient(135deg,#C4B5FD,#8B5CF6)", title:"Your Rights",
    points:["Request to view the data we hold about you","Request correction of inaccurate information","Request deletion of your personal data","Withdraw consent by contacting us directly","Reach us anytime at cheritechcompany@gmail.com"] },
]

const fadeUp = (d=0) => ({ initial:{opacity:0,y:40}, whileInView:{opacity:1,y:0}, transition:{duration:.7,delay:d,ease:[.22,1,.36,1]}, viewport:{once:true,amount:.15} })

export default function PrivacyPage() {
  return (
    <CompanyLayout>
      <style>{PAGE_CSS}</style>

      {/* ── PAGE HERO ── */}
      <section style={{ background:"linear-gradient(155deg,#080412 0%,#0E0820 55%,#080412 100%)",padding:"100px 6% 80px",textAlign:"center",position:"relative",overflow:"hidden" }}>
        {/* Blobs */}
        <div style={{ position:"absolute",inset:0,pointerEvents:"none" }}>
          <div style={{ position:"absolute",top:"12%",left:"12%",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,.2) 0%,transparent 70%)",filter:"blur(60px)",animation:"ppBlob1 18s ease-in-out infinite" }} />
          <div style={{ position:"absolute",bottom:"8%",right:"10%",width:330,height:330,borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,250,.15) 0%,transparent 70%)",filter:"blur(50px)",animation:"ppBlob2 24s ease-in-out infinite" }} />
        </div>
        {/* Dot grid */}
        <div style={{ position:"absolute",inset:0,opacity:.04,backgroundImage:"radial-gradient(rgba(196,181,253,.9) 1px,transparent 1px)",backgroundSize:"30px 30px",pointerEvents:"none" }} />
        {/* Rings */}
        <div style={{ position:"absolute",top:"14%",right:"10%",width:140,height:140,borderRadius:"50%",border:"1px solid rgba(139,92,246,.12)",animation:"ppRing1 20s linear infinite",pointerEvents:"none" }}>
          <div style={{ position:"absolute",top:-4,left:"50%",width:8,height:8,borderRadius:"50%",background:"rgba(167,139,250,.7)",transform:"translateX(-50%)",boxShadow:"0 0 8px rgba(167,139,250,.8)" }} />
        </div>
        <div style={{ position:"absolute",bottom:"20%",left:"7%",width:80,height:80,borderRadius:"50%",border:"1px solid rgba(139,92,246,.14)",animation:"ppRing2 13s linear infinite",pointerEvents:"none" }} />
        <div style={{ position:"absolute",top:"40%",left:"3%",width:46,height:46,borderRadius:"50%",border:"1px dashed rgba(139,92,246,.18)",animation:"ppRing1 9s linear infinite",pointerEvents:"none" }} />

        <div style={{ position:"relative",zIndex:1 }}>
          <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.7 }}>
            <div style={{ display:"inline-block",background:"rgba(139,92,246,.1)",border:"1px solid rgba(139,92,246,.28)",color:"#C4B5FD",padding:"7px 20px",borderRadius:50,fontSize:"0.78rem",fontWeight:700,textTransform:"uppercase",letterSpacing:2,marginBottom:22 }}>Legal</div>
          </motion.div>
          <motion.h1 initial={{ opacity:0, y:50, filter:"blur(10px)" }} animate={{ opacity:1, y:0, filter:"blur(0px)" }} transition={{ duration:.9, delay:.1, ease:[.22,1,.36,1] }}
            style={{ fontSize:"clamp(2.2rem,5.5vw,4rem)",fontWeight:900,color:"white",marginBottom:18,letterSpacing:-2 }}>Privacy Policy</motion.h1>
          <motion.p initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:.7, delay:.25 }}
            style={{ color:"rgba(255,255,255,.4)",fontSize:"1.05rem",maxWidth:440,margin:"0 auto",lineHeight:1.8 }}>
            Simple and clear — how we collect, use, and share your information.
          </motion.p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section style={{ padding:"80px 6%",background:"#0E0820" }}>
        <div style={{ maxWidth:900,margin:"0 auto" }}>

          {/* Date badge */}
          <motion.div {...fadeUp()} style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(139,92,246,.08)",border:"1px solid rgba(139,92,246,.22)",color:"#C4B5FD",padding:"9px 20px",borderRadius:10,fontSize:"0.82rem",fontWeight:600,marginBottom:44 }}>
            📅 Last Updated: March 2026
          </motion.div>

          {/* Intro card */}
          <motion.div {...fadeUp(.05)} style={{ background:"#150E35",borderRadius:18,padding:"28px 32px",border:"1px solid rgba(139,92,246,.18)",marginBottom:32,position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#8B5CF6,#A78BFA,#C4B5FD)" }} />
            <p style={{ color:"rgba(255,255,255,.5)",fontSize:"0.97rem",lineHeight:1.85,margin:0 }}>
              This Privacy Policy explains how <strong style={{ color:"white" }}>Cheritech</strong> — a sole proprietorship by Vedullapalli Naga Durga Satya Sai Navya — collects and uses your information when you use our products and services. By using our services, you agree to this policy.
            </p>
          </motion.div>

          {/* Warning notice */}
          <motion.div {...fadeUp(.1)} style={{ background:"rgba(196,181,253,.06)",borderRadius:18,padding:"22px 28px",border:"1px solid rgba(196,181,253,.18)",marginBottom:36,display:"flex",gap:16,alignItems:"flex-start" }}>
            <span style={{ fontSize:"1.4rem",flexShrink:0 }}>⚠️</span>
            <div>
              <div style={{ fontWeight:700,color:"#DDD6FE",fontSize:"0.9rem",marginBottom:6 }}>Important — Vendor Data Sharing</div>
              <p style={{ color:"rgba(255,255,255,.43)",fontSize:"0.88rem",lineHeight:1.75,margin:0 }}>Our core service involves sharing customer WhatsApp phone numbers, names, and order details with their respective vendor. This is essential for order management and delivery — vendors must have this information to serve their customers.</p>
            </div>
          </motion.div>

          {/* 4 section cards */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:24 }} className="two-col">
            {sections.map((sec,i)=>(
              <motion.div key={sec.title}
                initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
                transition={{ duration:.65, delay:i*.1, ease:[.22,1,.36,1] }}
                viewport={{ once:true, amount:.12 }}
                style={{ background:"#150E35",borderRadius:20,padding:"30px 26px",border:"1px solid rgba(139,92,246,.15)",position:"relative",overflow:"hidden" }}>
                <div style={{ position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:sec.glow,filter:"blur(24px)",opacity:.6 }} />
                <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
                  <div style={{ width:44,height:44,borderRadius:12,flexShrink:0,background:sec.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",boxShadow:`0 6px 20px ${sec.glow}` }}>{sec.icon}</div>
                  <h3 style={{ color:"white",fontWeight:800,fontSize:"0.92rem",margin:0,lineHeight:1.3 }}>{sec.title}</h3>
                </div>
                <ul style={{ padding:0,listStyle:"none",margin:0,display:"flex",flexDirection:"column",gap:9 }}>
                  {sec.points.map((p,j)=>(
                    <li key={j} style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
                      <span style={{ color:sec.color,marginTop:4,flexShrink:0,fontSize:"0.6rem" }}>◆</span>
                      <span style={{ fontSize:"0.84rem",color:"rgba(255,255,255,.43)",lineHeight:1.65 }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Bottom row */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }} className="two-col">
            <motion.div {...fadeUp()} style={{ background:"#150E35",borderRadius:16,padding:"26px 26px",border:"1px solid rgba(139,92,246,.15)" }}>
              <div style={{ fontSize:"1.4rem",marginBottom:12 }}>🔄</div>
              <h3 style={{ color:"white",fontWeight:800,fontSize:"0.92rem",marginBottom:10 }}>Policy Updates</h3>
              <p style={{ fontSize:"0.84rem",color:"rgba(255,255,255,.4)",lineHeight:1.75,margin:0 }}>We may update this policy from time to time. The date at the top reflects the latest revision. Continued use of our services means you accept any updates.</p>
            </motion.div>
            <motion.div {...fadeUp(.1)} style={{ background:"linear-gradient(145deg,#150E35,#0A1830)",borderRadius:16,padding:"26px 26px",border:"1px solid rgba(139,92,246,.25)" }}>
              <div style={{ fontSize:"1.4rem",marginBottom:12 }}>📬</div>
              <h3 style={{ color:"white",fontWeight:800,fontSize:"0.92rem",marginBottom:10 }}>Contact Us</h3>
              <p style={{ fontSize:"0.84rem",color:"rgba(255,255,255,.4)",lineHeight:1.75,marginBottom:14 }}>Questions or data requests? Reach out directly.</p>
              <div style={{ fontSize:"0.85rem",color:"#C4B5FD",fontWeight:600,marginBottom:4 }}>cheritechcompany@gmail.com</div>
              <div style={{ fontSize:"0.8rem",color:"rgba(255,255,255,.22)" }}>Ameenpur, Hyderabad, Telangana, India</div>
            </motion.div>
          </div>

        </div>
      </section>

    </CompanyLayout>
  )
}
