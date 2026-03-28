import { motion } from "framer-motion"
import CompanyLayout from "./CompanyLayout"

const PAGE_CSS = `
  @keyframes abBlob1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(50px,-40px) scale(1.15)} 66%{transform:translate(-30px,30px) scale(.92)} }
  @keyframes abBlob2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-40px,35px) scale(1.1)} 66%{transform:translate(35px,-25px) scale(1.06)} }
  @keyframes abRing1 { from{transform:rotate(0deg)}  to{transform:rotate(360deg)}  }
  @keyframes abRing2 { from{transform:rotate(0deg)}  to{transform:rotate(-360deg)} }
  @keyframes abDot   { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.6)} }
`

const values = [
  { icon:"🎯", grad:"linear-gradient(135deg,#8B5CF6,#6D28D9)", glow:"rgba(139,92,246,.3)", title:"Mission", desc:"Build practical, affordable digital tools that help small businesses and individuals work smarter." },
  { icon:"🔭", grad:"linear-gradient(135deg,#A78BFA,#7C3AED)", glow:"rgba(167,139,250,.3)", title:"Vision",  desc:"Become a trusted technology partner for businesses across India, starting from Hyderabad." },
  { icon:"💎", grad:"linear-gradient(135deg,#C4B5FD,#8B5CF6)", glow:"rgba(196,181,253,.3)", title:"Quality", desc:"Clean, reliable, and maintainable products. Quality is a habit, not a checkbox." },
  { icon:"🌱", grad:"linear-gradient(135deg,#8B5CF6,#6D28D9)", glow:"rgba(139,92,246,.3)", title:"Growth",  desc:"We're just getting started. Every product we build teaches us more." },
]

const fadeUp = (d=0) => ({ initial:{opacity:0,y:40}, whileInView:{opacity:1,y:0}, transition:{duration:.7,delay:d,ease:[.22,1,.36,1]}, viewport:{once:true,amount:.15} })

export default function AboutPage() {
  return (
    <CompanyLayout>
      <style>{PAGE_CSS}</style>

      {/* ── PAGE HERO ── */}
      <section style={{ background:"linear-gradient(155deg,#080412 0%,#0E0820 55%,#080412 100%)",padding:"100px 6% 80px",textAlign:"center",position:"relative",overflow:"hidden" }}>
        {/* Blobs */}
        <div style={{ position:"absolute",inset:0,pointerEvents:"none" }}>
          <div style={{ position:"absolute",top:"15%",left:"15%",width:420,height:420,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,.2) 0%,transparent 70%)",filter:"blur(60px)",animation:"abBlob1 18s ease-in-out infinite" }} />
          <div style={{ position:"absolute",bottom:"10%",right:"12%",width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,250,.15) 0%,transparent 70%)",filter:"blur(50px)",animation:"abBlob2 22s ease-in-out infinite" }} />
        </div>
        {/* Dot grid */}
        <div style={{ position:"absolute",inset:0,opacity:.04,backgroundImage:"radial-gradient(rgba(196,181,253,.9) 1px,transparent 1px)",backgroundSize:"30px 30px",pointerEvents:"none" }} />
        {/* Rings */}
        <div style={{ position:"absolute",top:"12%",right:"10%",width:150,height:150,borderRadius:"50%",border:"1px solid rgba(139,92,246,.12)",animation:"abRing1 22s linear infinite",pointerEvents:"none" }}>
          <div style={{ position:"absolute",top:-4,left:"50%",width:8,height:8,borderRadius:"50%",background:"rgba(167,139,250,.7)",transform:"translateX(-50%)",boxShadow:"0 0 8px rgba(167,139,250,.8)" }} />
        </div>
        <div style={{ position:"absolute",bottom:"18%",left:"8%",width:90,height:90,borderRadius:"50%",border:"1px solid rgba(139,92,246,.14)",animation:"abRing2 15s linear infinite",pointerEvents:"none" }} />
        <div style={{ position:"absolute",top:"45%",left:"4%",width:50,height:50,borderRadius:"50%",border:"1px dashed rgba(139,92,246,.18)",animation:"abRing1 10s linear infinite",pointerEvents:"none" }} />

        <div style={{ position:"relative",zIndex:1 }}>
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.7 }}>
            <div style={{ display:"inline-block",background:"rgba(139,92,246,.12)",border:"1px solid rgba(139,92,246,.3)",color:"#C4B5FD",padding:"6px 20px",borderRadius:50,fontSize:"0.8rem",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:22 }}>About Us</div>
          </motion.div>
          <motion.h1 initial={{ opacity:0, y:50, filter:"blur(10px)" }} animate={{ opacity:1, y:0, filter:"blur(0px)" }} transition={{ duration:.9, delay:.1, ease:[.22,1,.36,1] }}
            style={{ fontSize:"clamp(2.2rem,5.5vw,4rem)",fontWeight:900,color:"white",marginBottom:18,letterSpacing:-2 }}>Who We Are</motion.h1>
          <motion.p initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:.7, delay:.25 }}
            style={{ color:"rgba(255,255,255,.42)",fontSize:"1.05rem",maxWidth:460,margin:"0 auto" }}>
            A solo-founded tech company from Hyderabad, building digital products that matter.
          </motion.p>
        </div>
      </section>

      {/* ── FOUNDER ── */}
      <section style={{ padding:"90px 6%",background:"#0E0820" }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 2fr",gap:56,alignItems:"center",maxWidth:1100,margin:"0 auto" }} className="two-col">

          <motion.div {...fadeUp()} style={{ background:"linear-gradient(145deg,#150E35,#0A0618)",borderRadius:24,padding:"44px 32px",textAlign:"center",border:"1px solid rgba(139,92,246,.25)",boxShadow:"0 0 60px rgba(139,92,246,.12)" }}>
            <div style={{ width:88,height:88,margin:"0 auto 18px",borderRadius:"50%",background:"linear-gradient(135deg,#8B5CF6,#A78BFA)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2rem",fontWeight:900,color:"white",boxShadow:"0 0 30px rgba(139,92,246,.5)" }}>N</div>
            <h3 style={{ fontSize:"1rem",fontWeight:800,color:"white",marginBottom:6 }}>Navya</h3>
            <p style={{ fontSize:"0.82rem",color:"rgba(255,255,255,.4)",marginBottom:14,lineHeight:1.6 }}>Vedullapalli Naga Durga<br/>Satya Sai Navya</p>
            <span style={{ display:"inline-block",background:"rgba(139,92,246,.15)",border:"1px solid rgba(139,92,246,.3)",color:"#C4B5FD",padding:"5px 14px",borderRadius:50,fontSize:"0.78rem",fontWeight:600 }}>Founder &amp; Developer</span>
            <div style={{ marginTop:28,paddingTop:24,borderTop:"1px solid rgba(255,255,255,.06)",display:"flex",flexDirection:"column",gap:8 }}>
              <div style={{ fontSize:"0.8rem",color:"rgba(255,255,255,.32)" }}>📍 Ameenpur, Hyderabad</div>
              <div style={{ fontSize:"0.8rem",color:"rgba(255,255,255,.32)" }}>📧 cheritechcompany@gmail.com</div>
            </div>
          </motion.div>

          <div>
            <motion.div {...fadeUp(.1)}>
              <div style={{ display:"inline-block",background:"rgba(167,139,250,.12)",border:"1px solid rgba(167,139,250,.3)",color:"#C4B5FD",padding:"5px 18px",borderRadius:50,fontSize:"0.78rem",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:18 }}>The Founder</div>
              <h2 style={{ fontSize:"clamp(1.6rem,3vw,2.3rem)",fontWeight:900,color:"white",marginBottom:20,letterSpacing:-.8,lineHeight:1.25 }}>
                Building products from Hyderabad,<br/>
                <span style={{ background:"linear-gradient(90deg,#8B5CF6,#A78BFA)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>one problem at a time.</span>
              </h2>
            </motion.div>
            {[
              "Hi, I'm Navya — the founder of Cheritech. I started this company because I wanted to build software that actually helps people, not just impressive-looking demos.",
              "My first product is a WhatsApp-based milk delivery management system — a tool that helps local milk vendors manage customers, orders, and subscriptions through a simple bot and vendor dashboard.",
              "We're just getting started. The goal is to build more tools for local businesses, service providers, and anyone who could benefit from smart, affordable technology."
            ].map((p,i)=>(
              <motion.p key={i} {...fadeUp(i*.1+.15)} style={{ color:"rgba(255,255,255,.48)",marginBottom:16,fontSize:"0.97rem",lineHeight:1.82 }}>{p}</motion.p>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ padding:"90px 6%",background:"#080412" }}>
        <motion.div {...fadeUp()} style={{ textAlign:"center",marginBottom:56 }}>
          <div style={{ display:"inline-block",background:"rgba(167,139,250,.1)",border:"1px solid rgba(167,139,250,.28)",color:"#DDD6FE",padding:"5px 18px",borderRadius:50,fontSize:"0.78rem",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:16 }}>Our Foundation</div>
          <h2 style={{ fontSize:"clamp(1.8rem,3.5vw,2.8rem)",fontWeight:900,color:"white",marginBottom:14,letterSpacing:-1.2 }}>Mission, Vision &amp; Values</h2>
          <p style={{ color:"rgba(255,255,255,.42)",fontSize:"1rem",maxWidth:440,margin:"0 auto" }}>The principles that guide every product we build.</p>
        </motion.div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:20,maxWidth:1100,margin:"0 auto" }}>
          {values.map((v,i)=>(
            <motion.div key={v.title}
              initial={{ opacity:0, y:50 }} whileInView={{ opacity:1, y:0 }}
              whileHover={{ y:-8, boxShadow:`0 20px 50px ${v.glow}` }}
              transition={{ duration:.65, delay:i*.1, ease:[.22,1,.36,1] }}
              viewport={{ once:true, amount:.15 }}
              style={{ background:"#150E35",borderRadius:20,padding:"32px 28px",border:"1px solid rgba(139,92,246,.15)",position:"relative",overflow:"hidden",cursor:"default" }}>
              <div style={{ position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:v.glow,filter:"blur(25px)",opacity:.5 }} />
              <div style={{ width:54,height:54,borderRadius:14,background:v.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.5rem",marginBottom:18,boxShadow:`0 6px 20px ${v.glow}` }}>{v.icon}</div>
              <h3 style={{ fontSize:"1rem",fontWeight:800,color:"white",marginBottom:10 }}>{v.title}</h3>
              <p style={{ fontSize:"0.88rem",color:"rgba(255,255,255,.43)",lineHeight:1.7 }}>{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CURRENT WORK ── */}
      <section style={{ padding:"90px 6%",background:"#0E0820" }}>
        <motion.div {...fadeUp()} style={{ textAlign:"center",marginBottom:56 }}>
          <div style={{ display:"inline-block",background:"rgba(139,92,246,.1)",border:"1px solid rgba(139,92,246,.28)",color:"#C4B5FD",padding:"5px 18px",borderRadius:50,fontSize:"0.78rem",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:16 }}>Work</div>
          <h2 style={{ fontSize:"clamp(1.8rem,3.5vw,2.8rem)",fontWeight:900,color:"white",marginBottom:14,letterSpacing:-1.2 }}>What We're Building</h2>
          <p style={{ color:"rgba(255,255,255,.42)",fontSize:"1rem",maxWidth:420,margin:"0 auto" }}>We're early, honest about it, and focused on shipping real products.</p>
        </motion.div>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:20,maxWidth:860,margin:"0 auto" }}>
          <motion.div {...fadeUp()} style={{ background:"#150E35",borderRadius:20,padding:"32px 28px",border:"1px solid rgba(139,92,246,.22)",position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#8B5CF6,#A78BFA)" }} />
            <div style={{ display:"inline-flex",alignItems:"center",gap:6,background:"rgba(139,92,246,.12)",color:"#C4B5FD",padding:"4px 12px",borderRadius:50,fontSize:"0.75rem",fontWeight:700,marginBottom:16 }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:"#8B5CF6",display:"inline-block",animation:"abDot 2s infinite" }} /> Live
            </div>
            <h3 style={{ fontSize:"1.05rem",fontWeight:800,color:"white",marginBottom:10 }}>🥛 Milk Vendor Management System</h3>
            <p style={{ fontSize:"0.88rem",color:"rgba(255,255,255,.43)",lineHeight:1.7 }}>A WhatsApp bot + vendor dashboard that helps milk delivery businesses manage customers, subscriptions, and daily orders — fully automated.</p>
          </motion.div>

          <motion.div {...fadeUp(.1)} style={{ background:"#150E35",borderRadius:20,padding:"32px 28px",border:"1px dashed rgba(139,92,246,.28)" }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:6,background:"rgba(196,181,253,.1)",color:"#DDD6FE",padding:"4px 12px",borderRadius:50,fontSize:"0.75rem",fontWeight:700,marginBottom:16 }}>◌ Coming Soon</div>
            <h3 style={{ fontSize:"1.05rem",fontWeight:800,color:"white",marginBottom:10 }}>🚀 More Products in the Pipeline</h3>
            <p style={{ fontSize:"0.88rem",color:"rgba(255,255,255,.43)",lineHeight:1.7 }}>Tools for local businesses, vendors, and customer-facing services. Exciting things are coming.</p>
          </motion.div>
        </div>
      </section>

    </CompanyLayout>
  )
}
