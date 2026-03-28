import { useCallback, useEffect, useRef, useState } from "react"
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion"
import CompanyLayout from "./CompanyLayout"

// ── DATA ──────────────────────────────────────────────────────────────────────
const PHRASES = ["WhatsApp Automation", "Vendor Dashboards", "Custom Software"]

const services = [
  { icon: "🤖", title: "WhatsApp Automation", tag: "Most Popular", grad: "linear-gradient(135deg,#7C3AED,#5B21B6)", glow: "rgba(124,58,237,.35)", desc: "Smart bots that handle customer orders, notifications, and communication — powered by the official WhatsApp Business API." },
  { icon: "📊", title: "Vendor Dashboards",   tag: "Live",         grad: "linear-gradient(135deg,#8B5CF6,#7C3AED)", glow: "rgba(139,92,246,.35)", desc: "Web dashboards for vendors to manage orders, track customers, and run their business from any device." },
  { icon: "💡", title: "Custom Software",     tag: "Custom",       grad: "linear-gradient(135deg,#6D28D9,#4C1D95)", glow: "rgba(109,40,217,.35)", desc: "Have an idea? We turn it into a working product — web apps, automation tools, and business-specific solutions." },
]

const STATS = [
  { label: "Founded",       num: 2026, suffix: ""  },
  { label: "Commitment",    num: 100,  suffix: "%" },
]

const whyItems = [
  { icon: "🎯", title: "Problem-First",      desc: "We understand your problem before writing a single line of code." },
  { icon: "⚡", title: "Fast & Lean",         desc: "Clean, minimal code that does exactly what's needed — nothing more." },
  { icon: "🔒", title: "Secure by Default",  desc: "Security and privacy are built in from day one, not added later." },
  { icon: "🤝", title: "Personal Attention", desc: "Direct communication with the founder — no middlemen, no delays." },
]

const TECHS = ["React", "Node.js", "PostgreSQL", "WhatsApp API", "Express", "Vite", "REST APIs", "JavaScript"]

const contactItems = [
  { icon: "📧", color: "#7C3AED", bg: "#EDE9FE", label: "Email",         value: "cheritechcompany@gmail.com",     href: "mailto:cheritechcompany@gmail.com" },
  { icon: "📍", color: "#8B5CF6", bg: "#EDE9FE", label: "Location",      value: "Ameenpur, Hyderabad, Telangana", href: null },
  { icon: "🏢", color: "#6D28D9", bg: "#EDE9FE", label: "Business",      value: "Sole Proprietorship",            href: null },
]

// Hardcoded particles for first-view bg depth
const PARTICLES = [
  {x:10,y:22,s:2.5,d:0,   dur:18},{x:85,y:14,s:2,  d:2.5,dur:22},
  {x:30,y:9, s:3,  d:1.2, dur:16},{x:72,y:32,s:1.8,d:3.8,dur:20},
  {x:93,y:66,s:3,  d:0.8, dur:25},{x:17,y:72,s:2,  d:4.2,dur:19},
  {x:55,y:91,s:2.5,d:1.8, dur:17},{x:79,y:82,s:2,  d:5,  dur:21},
  {x:5, y:46,s:3,  d:2,   dur:23},{x:42,y:57,s:1.5,d:6.5,dur:28},
  {x:68,y:87,s:2.5,d:3.2, dur:15},{x:22,y:89,s:2,  d:0.5,dur:20},
  {x:60,y:11,s:3,  d:4.8, dur:24},{x:96,y:40,s:1.5,d:1.5,dur:18},
  {x:38,y:38,s:2,  d:7,   dur:22},{x:52,y:50,s:1.5,d:3,  dur:26},
  {x:2, y:80,s:2,  d:1,   dur:20},{x:48,y:3, s:2.5,d:5.5,dur:19},
]

// ── EXTRA CSS ─────────────────────────────────────────────────────────────────
const PAGE_CSS = `
  @keyframes hpBlob1 {
    0%,100%{transform:translate(0,0) scale(1)}
    33%{transform:translate(60px,-50px) scale(1.18)}
    66%{transform:translate(-35px,40px) scale(.92)}
  }
  @keyframes hpBlob2 {
    0%,100%{transform:translate(0,0) scale(1)}
    33%{transform:translate(-55px,45px) scale(1.12)}
    66%{transform:translate(40px,-30px) scale(1.06)}
  }
  @keyframes hpBlob3 {
    0%,100%{transform:translate(-50%,-50%) scale(1)}
    50%{transform:translate(-50%,-50%) scale(1.14)}
  }
  @keyframes hpGradText {
    0%{background-position:0% center}
    100%{background-position:200% center}
  }
  @keyframes hpMarquee {
    from{transform:translateX(0)}
    to{transform:translateX(-50%)}
  }
  @keyframes hpBtnGlow {
    0%,100%{box-shadow:0 4px 28px rgba(124,58,237,.5)}
    50%{box-shadow:0 4px 56px rgba(124,58,237,.9),0 0 90px rgba(124,58,237,.18)}
  }
  @keyframes hpRing1  { from{transform:rotate(0deg)}  to{transform:rotate(360deg)}  }
  @keyframes hpRing2  { from{transform:rotate(0deg)}  to{transform:rotate(-360deg)} }
  @keyframes hpDot    { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.6)} }
  @keyframes hpCursor { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes hpFloat  { 0%,100%{transform:translateY(0);opacity:.3} 50%{transform:translateY(-18px);opacity:.65} }
  @keyframes hpArrow  { 0%,100%{transform:translateX(-50%) translateY(0);opacity:.5} 50%{transform:translateX(-50%) translateY(9px);opacity:.9} }
  @keyframes hpBarIn  { from{scaleY:0} to{scaleY:1} }
  @keyframes hpNotif  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  .hp-svc:hover .hp-svc-icon { transform:scale(1.18) rotate(-6deg) !important }
  .hp-svc-icon { transition:transform .35s cubic-bezier(.22,1,.36,1) !important }
  .hp-tech { transition:transform .2s ease !important; cursor:default }
  .hp-tech:hover { transform:scale(1.1) translateY(-3px) !important }

  @media(max-width:768px) {
    .hp-hero-grid  { text-align:center !important }
    .hp-hero-btns  { justify-content:center !important }
    .hp-hero-visual { display:none !important }
  }
`

// ── STAT COUNTER ──────────────────────────────────────────────────────────────
function StatNum({ num, suffix, text, label, delay }) {
  const ref     = useRef(null)
  const inView  = useInView(ref, { once: true, amount: 0.5 })
  const mv      = useMotionValue(0)
  const display = useTransform(mv, v => Math.floor(v))
  useEffect(() => {
    if (!inView || num === null) return
    const c = animate(mv, num, { duration: 1.8, ease: "easeOut", delay })
    return c.stop
  }, [inView]) // eslint-disable-line
  return (
    <motion.div ref={ref} initial={{ opacity:0, y:35 }} animate={inView?{opacity:1,y:0}:{}}
      transition={{ duration:.7, delay, ease:[.22,1,.36,1] }} style={{ textAlign:"center" }}>
      <div style={{ fontSize:"clamp(2.8rem,5.5vw,4.5rem)",fontWeight:900,color:"white",lineHeight:1,letterSpacing:-2,marginBottom:10 }}>
        {text ? text : <><motion.span>{display}</motion.span>{suffix}</>}
      </div>
      <div style={{ color:"rgba(255,255,255,.5)",fontSize:"0.85rem",fontWeight:600,textTransform:"uppercase",letterSpacing:1.2 }}>{label}</div>
    </motion.div>
  )
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function HomePage() {

  // typewriter
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [charIdx,   setCharIdx]   = useState(0)
  const [deleting,  setDeleting]  = useState(false)
  const [typed,     setTyped]     = useState("")
  useEffect(() => {
    const phrase = PHRASES[phraseIdx]; let t
    if (!deleting && charIdx < phrase.length)   t = setTimeout(() => { setTyped(phrase.slice(0,charIdx+1)); setCharIdx(c=>c+1) }, 70)
    else if (!deleting && charIdx===phrase.length) t = setTimeout(() => setDeleting(true), 2200)
    else if (deleting && charIdx > 0)           t = setTimeout(() => { setTyped(phrase.slice(0,charIdx-1)); setCharIdx(c=>c-1) }, 32)
    else { setDeleting(false); setPhraseIdx(i=>(i+1)%PHRASES.length) }
    return () => clearTimeout(t)
  }, [charIdx, deleting, phraseIdx])

  // mouse glow
  const [mouse, setMouse] = useState({ x:50, y:50 })
  const handleMouse = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect()
    setMouse({ x:((e.clientX-r.left)/r.width)*100, y:((e.clientY-r.top)/r.height)*100 })
  }, [])

  // variants
  const stagger = { hidden:{}, show:{ transition:{ staggerChildren:.13, delayChildren:.05 } } }
  const item    = { hidden:{ opacity:0, y:65, filter:"blur(12px)" }, show:{ opacity:1, y:0, filter:"blur(0px)", transition:{ duration:.9, ease:[.22,1,.36,1] } } }
  const fadeUp  = (d=0) => ({ initial:{opacity:0,y:40}, whileInView:{opacity:1,y:0}, transition:{duration:.7,delay:d,ease:[.22,1,.36,1]}, viewport:{once:true,amount:.2} })

  return (
    <CompanyLayout>
      <style>{PAGE_CSS}</style>

      {/* ══════════════════════════════ HERO ══════════════════════════════ */}
      <section onMouseMove={handleMouse} style={{
        minHeight:"100vh", display:"flex", alignItems:"center",
        padding:"100px 6% 80px",
        background:"linear-gradient(155deg,#080412 0%,#0E0820 55%,#080412 100%)",
        position:"relative", overflow:"hidden",
      }}>
        {/* Animated blobs */}
        <div style={{ position:"absolute",inset:0,pointerEvents:"none" }}>
          <div style={{ position:"absolute",top:"8%",left:"5%",width:580,height:580,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,.22) 0%,transparent 65%)",filter:"blur(80px)",animation:"hpBlob1 20s ease-in-out infinite" }} />
          <div style={{ position:"absolute",bottom:"6%",right:"5%",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(167,139,250,.18) 0%,transparent 65%)",filter:"blur(70px)",animation:"hpBlob2 26s ease-in-out infinite" }} />
          <div style={{ position:"absolute",top:"50%",left:"50%",width:360,height:360,borderRadius:"50%",background:"radial-gradient(circle,rgba(91,33,182,.13) 0%,transparent 65%)",filter:"blur(60px)",animation:"hpBlob3 16s ease-in-out infinite" }} />
          {/* Mouse glow */}
          <div style={{ position:"absolute",left:`${mouse.x}%`,top:`${mouse.y}%`,width:750,height:750,borderRadius:"50%",background:"radial-gradient(circle,rgba(139,92,246,.1) 0%,transparent 58%)",filter:"blur(70px)",transform:"translate(-50%,-50%)",transition:"left .5s ease,top .5s ease",pointerEvents:"none" }} />
        </div>

        {/* Dot grid */}
        <div style={{ position:"absolute",inset:0,opacity:.04,backgroundImage:"radial-gradient(rgba(196,181,253,.9) 1px,transparent 1px)",backgroundSize:"30px 30px",pointerEvents:"none" }} />

        {/* Drifting particles */}
        {PARTICLES.map((p,i) => (
          <div key={i} style={{ position:"absolute",left:`${p.x}%`,top:`${p.y}%`,width:p.s,height:p.s,borderRadius:"50%",background:"rgba(196,181,253,.6)",pointerEvents:"none",animation:`hpFloat ${p.dur}s ease-in-out ${p.d}s infinite`,boxShadow:`0 0 ${p.s*2}px rgba(167,139,250,.5)` }} />
        ))}

        {/* Spinning rings */}
        {[
          { sz:180, top:"12%", right:"8%",  dur:"24s",  dir:"hpRing1", dot:"rgba(167,139,250,.8)" },
          { sz:110, bottom:"20%", left:"6%", dur:"17s", dir:"hpRing2", dot:"rgba(196,181,253,.9)" },
          { sz:60,  top:"42%",  left:"3%",  dur:"11s",  dir:"hpRing1", dot:null },
          { sz:35,  top:"22%",  left:"20%", dur:"8s",   dir:"hpRing2", dot:null },
          { sz:80,  bottom:"35%", right:"22%", dur:"14s", dir:"hpRing1", dot:"rgba(139,92,246,.7)" },
        ].map((r,i) => (
          <div key={i} style={{ position:"absolute",top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.sz,height:r.sz,borderRadius:"50%",border:`1px solid rgba(139,92,246,${r.dot ? .14 : .1})`,animation:`${r.dir} ${r.dur} linear infinite`,pointerEvents:"none",flexShrink:0 }}>
            {r.dot && <div style={{ position:"absolute",top:-4,left:"50%",width:8,height:8,borderRadius:"50%",background:r.dot,transform:"translateX(-50%)",boxShadow:`0 0 10px ${r.dot}` }} />}
          </div>
        ))}

        {/* Two-column grid */}
        <div className="hp-hero-grid two-col" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center",width:"100%",maxWidth:1160,margin:"0 auto",position:"relative",zIndex:1 }}>

          {/* ── Left: text ── */}
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.h1 variants={item} style={{ fontSize:"clamp(2.8rem,6.5vw,5.8rem)",fontWeight:900,lineHeight:1.04,letterSpacing:-3,color:"white",margin:"0 0 6px" }}>
              Building Smart
            </motion.h1>
            <motion.h1 variants={item} style={{ fontSize:"clamp(2.8rem,6.5vw,5.8rem)",fontWeight:900,lineHeight:1.04,letterSpacing:-3,margin:"0 0 6px" }}>
              <span style={{ background:"linear-gradient(90deg,#A78BFA,#7C3AED,#DDD6FE,#8B5CF6,#A78BFA)",backgroundSize:"250% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"hpGradText 5s linear infinite",display:"inline-block" }}>
                Digital Products
              </span>
            </motion.h1>
            <motion.h1 variants={item} style={{ fontSize:"clamp(2.8rem,6.5vw,5.8rem)",fontWeight:900,lineHeight:1.04,letterSpacing:-3,color:"rgba(255,255,255,.8)",margin:"0 0 28px" }}>
              For Real Needs
            </motion.h1>

            <motion.p variants={item} style={{ fontSize:"1.1rem",color:"rgba(255,255,255,.4)",margin:"0 0 44px",lineHeight:1.7 }}>
              We specialize in&nbsp;
              <span style={{ color:"#D8B4FE",fontWeight:700 }}>{typed}</span>
              <span style={{ display:"inline-block",width:2,height:"1.1em",background:"#A78BFA",marginLeft:2,verticalAlign:"text-bottom",animation:"hpCursor .85s step-end infinite" }} />
            </motion.p>

            <motion.div variants={item} className="hp-hero-btns" style={{ display:"flex",gap:16,flexWrap:"wrap" }}>
              <motion.a href="#services" whileHover={{ scale:1.05,y:-3 }} whileTap={{ scale:.97 }}
                style={{ padding:"16px 44px",background:"linear-gradient(135deg,#7C3AED,#5B21B6)",color:"white",borderRadius:14,fontWeight:700,fontSize:"1rem",textDecoration:"none",animation:"hpBtnGlow 3s ease-in-out infinite",display:"inline-block" }}>
                Explore Our Work ↓
              </motion.a>
              <motion.a href="#contact"
                onClick={e=>{e.preventDefault();document.getElementById("contact")?.scrollIntoView({behavior:"smooth"})}}
                whileHover={{ scale:1.04,y:-2 }} whileTap={{ scale:.97 }}
                style={{ padding:"16px 44px",border:"1px solid rgba(196,181,253,.28)",color:"rgba(255,255,255,.72)",borderRadius:14,fontWeight:600,fontSize:"1rem",textDecoration:"none",backdropFilter:"blur(10px)",display:"inline-block" }}>
                Get in Touch
              </motion.a>
            </motion.div>

            <div style={{ position:"relative",marginTop:56,height:20 }}>
              <div style={{ position:"absolute",left:"50%",animation:"hpArrow 2s ease-in-out infinite",color:"rgba(167,139,250,.5)",fontSize:"1.5rem",lineHeight:1 }}>↓</div>
            </div>
          </motion.div>

          {/* ── Right: live dashboard visual ── */}
          <div className="hp-hero-visual" style={{ position:"relative",height:460 }}>

            {/* Main dashboard card */}
            <motion.div initial={{ opacity:0, y:50, rotate:3 }} animate={{ opacity:1, y:0, rotate:3 }} transition={{ duration:1, delay:.55, ease:[.22,1,.36,1] }}
              style={{ position:"absolute",top:40,left:0,right:10,background:"linear-gradient(145deg,rgba(18,10,40,.96),rgba(10,6,24,.98))",border:"1px solid rgba(139,92,246,.28)",borderRadius:22,padding:"26px 22px",backdropFilter:"blur(20px)",boxShadow:"0 24px 80px rgba(124,58,237,.28),0 0 0 1px rgba(139,92,246,.08)" }}>

              {/* Card header */}
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
                <div>
                  <div style={{ color:"white",fontWeight:800,fontSize:"0.9rem",marginBottom:3 }}>🥛 Vendor Dashboard</div>
                  <div style={{ color:"rgba(255,255,255,.3)",fontSize:"0.72rem" }}>Milk Delivery System</div>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:7,background:"rgba(124,58,237,.15)",padding:"5px 12px",borderRadius:50,border:"1px solid rgba(139,92,246,.3)" }}>
                  <span style={{ width:6,height:6,borderRadius:"50%",background:"#A78BFA",animation:"hpDot 2s infinite",boxShadow:"0 0 6px #A78BFA" }} />
                  <span style={{ color:"#C4B5FD",fontSize:"0.72rem",fontWeight:700 }}>LIVE</span>
                </div>
              </div>

              {/* Mini stats */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18 }}>
                {[{l:"Orders",v:"1,234"},{l:"Customers",v:"89"},{l:"Revenue",v:"₹12K"}].map(s=>(
                  <div key={s.l} style={{ background:"rgba(124,58,237,.1)",borderRadius:10,padding:"11px 6px",textAlign:"center",border:"1px solid rgba(139,92,246,.14)" }}>
                    <div style={{ color:"white",fontWeight:800,fontSize:"0.88rem",marginBottom:3 }}>{s.v}</div>
                    <div style={{ color:"rgba(255,255,255,.3)",fontSize:"0.64rem" }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* Animated bar chart */}
              <div style={{ display:"flex",gap:5,alignItems:"flex-end",height:52,marginBottom:6 }}>
                {[60,42,80,55,95,48,72].map((h,i)=>(
                  <motion.div key={i}
                    initial={{ scaleY:0, originY:"bottom" }} animate={{ scaleY:1 }}
                    transition={{ duration:.6, delay:.9+i*.07, ease:"easeOut" }}
                    style={{ flex:1,borderRadius:"3px 3px 0 0",background:`linear-gradient(to top,rgba(109,40,217,.85),rgba(167,139,250,.5))`,height:`${h}%`,transformOrigin:"bottom" }}
                  />
                ))}
              </div>
              <div style={{ color:"rgba(255,255,255,.18)",fontSize:"0.62rem",textAlign:"center" }}>Weekly deliveries</div>
            </motion.div>

            {/* Floating chip: WhatsApp */}
            <motion.div initial={{ opacity:0, scale:.8 }} animate={{ opacity:1, scale:1, y:[0,-8,0] }}
              transition={{ opacity:{duration:.5,delay:1.2}, scale:{duration:.5,delay:1.2}, y:{duration:4,repeat:Infinity,ease:"easeInOut",delay:1.2} }}
              style={{ position:"absolute",top:0,right:0,background:"rgba(124,58,237,.25)",border:"1px solid rgba(139,92,246,.45)",borderRadius:50,padding:"9px 16px",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",gap:8,boxShadow:"0 8px 24px rgba(124,58,237,.3)",zIndex:2 }}>
              <span style={{ fontSize:"1.1rem" }}>🤖</span>
              <span style={{ color:"white",fontSize:"0.78rem",fontWeight:700 }}>WhatsApp Bot</span>
            </motion.div>

            {/* Floating chip: Deliveries */}
            <motion.div initial={{ opacity:0, scale:.8 }} animate={{ opacity:1, scale:1, y:[0,10,0] }}
              transition={{ opacity:{duration:.5,delay:1.5}, scale:{duration:.5,delay:1.5}, y:{duration:3.8,repeat:Infinity,ease:"easeInOut",delay:1.5} }}
              style={{ position:"absolute",bottom:90,left:-10,background:"rgba(76,29,149,.35)",border:"1px solid rgba(139,92,246,.3)",borderRadius:14,padding:"12px 16px",backdropFilter:"blur(16px)",boxShadow:"0 8px 24px rgba(76,29,149,.3)",zIndex:2 }}>
              <div style={{ color:"rgba(255,255,255,.4)",fontSize:"0.62rem",marginBottom:3 }}>Today's Orders</div>
              <div style={{ color:"white",fontWeight:800,fontSize:"0.95rem" }}>📦 47 Deliveries</div>
            </motion.div>

            {/* Slide-in notification */}
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:2.2 }}
              style={{ position:"absolute",bottom:10,left:10,right:0,background:"rgba(18,10,40,.95)",border:"1px solid rgba(139,92,246,.22)",borderRadius:14,padding:"12px 14px",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",gap:10,boxShadow:"0 8px 28px rgba(0,0,0,.35)",zIndex:2 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#7C3AED,#A78BFA)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1rem",flexShrink:0 }}>✅</div>
              <div>
                <div style={{ color:"white",fontSize:"0.78rem",fontWeight:700,marginBottom:2 }}>Order Confirmed</div>
                <div style={{ color:"rgba(255,255,255,.35)",fontSize:"0.68rem" }}>via WhatsApp · just now</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════ SERVICES ══════════ */}
      <section id="services" style={{ padding:"120px 6%",background:"#FAF5FF" }}>
        <motion.div {...fadeUp()} style={{ textAlign:"center",marginBottom:72 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"#EDE9FE",color:"#7C3AED",padding:"7px 22px",borderRadius:50,fontSize:"0.76rem",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:22 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"#7C3AED",display:"inline-block" }} /> What We Do
          </div>
          <h2 style={{ fontSize:"clamp(2rem,4vw,3.2rem)",fontWeight:900,color:"#0F172A",marginBottom:14,letterSpacing:-1.5 }}>Products &amp; Services</h2>
          <p style={{ color:"#64748B",fontSize:"1rem",maxWidth:440,margin:"0 auto",lineHeight:1.8 }}>Software tools built to solve real problems — practical, reliable, built with care.</p>
        </motion.div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24 }}>
          {services.map((sv,i)=>(
            <motion.div key={sv.title} className="hp-svc"
              initial={{ opacity:0, y:60 }} whileInView={{ opacity:1, y:0 }}
              whileHover={{ y:-12, boxShadow:`0 28px 70px ${sv.glow}` }}
              transition={{ duration:.65, delay:i*.12, ease:[.22,1,.36,1] }}
              viewport={{ once:true, amount:.15 }}
              style={{ background:"white",borderRadius:22,padding:"38px 30px",border:"1px solid #EDE9FE",boxShadow:"0 4px 20px rgba(124,58,237,.06)",position:"relative",overflow:"hidden",cursor:"default" }}>
              <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:sv.grad }} />
              <div style={{ position:"absolute",top:18,right:18,background:"#EDE9FE",color:"#7C3AED",padding:"3px 11px",borderRadius:50,fontSize:"0.7rem",fontWeight:700 }}>{sv.tag}</div>
              <div className="hp-svc-icon" style={{ width:64,height:64,borderRadius:18,background:sv.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.8rem",marginBottom:24,boxShadow:`0 10px 28px ${sv.glow}` }}>{sv.icon}</div>
              <h3 style={{ fontSize:"1.08rem",fontWeight:800,color:"#0F172A",marginBottom:12 }}>{sv.title}</h3>
              <p style={{ fontSize:"0.87rem",color:"#64748B",lineHeight:1.82,marginBottom:22 }}>{sv.desc}</p>
              <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:"0.82rem",fontWeight:700,color:"#7C3AED" }}>Learn more <span>→</span></div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <div style={{ padding:"90px 6%",background:"linear-gradient(135deg,#3B0764 0%,#6D28D9 50%,#4C1D95 100%)",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",inset:0,opacity:.06,backgroundImage:"radial-gradient(white 1px,transparent 1px)",backgroundSize:"24px 24px",pointerEvents:"none" }} />
        <div style={{ position:"absolute",top:"50%",left:"50%",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,255,255,.08) 0%,transparent 60%)",transform:"translate(-50%,-50%)",filter:"blur(50px)",pointerEvents:"none" }} />
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:36,maxWidth:960,margin:"0 auto",position:"relative" }} className="four-col">
          {STATS.map((s,i)=><StatNum key={s.label} num={s.num} suffix={s.suffix} text={s.text} label={s.label} delay={i*.13} />)}
        </div>
      </div>

      {/* ══════════ WHY US ══════════ */}
      <section style={{ padding:"120px 6%",background:"#FFFFFF" }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center",maxWidth:1100,margin:"0 auto" }} className="two-col">
          <div>
            <motion.div {...fadeUp()}>
              <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"#EDE9FE",color:"#7C3AED",padding:"5px 18px",borderRadius:50,fontSize:"0.76rem",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:20 }}>Why Choose Us</div>
              <h2 style={{ fontSize:"clamp(1.9rem,3.3vw,2.8rem)",fontWeight:900,color:"#0F172A",marginBottom:16,letterSpacing:-1.3,lineHeight:1.15 }}>
                We build with purpose,<br/>
                <span style={{ background:"linear-gradient(90deg,#7C3AED,#A78BFA)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>not just code.</span>
              </h2>
              <p style={{ color:"#64748B",marginBottom:36,fontSize:"0.97rem",lineHeight:1.85 }}>Every product solves a genuine problem. Simple, practical, and reliable — always.</p>
            </motion.div>
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              {whyItems.map((w,i)=>(
                <motion.div key={w.title}
                  initial={{ opacity:0, x:-40 }} whileInView={{ opacity:1, x:0 }}
                  whileHover={{ x:8, background:"#F5F3FF", boxShadow:"0 4px 24px rgba(124,58,237,.1)" }}
                  transition={{ duration:.6, delay:i*.1, ease:[.22,1,.36,1] }}
                  viewport={{ once:true, amount:.3 }}
                  style={{ display:"flex",gap:16,alignItems:"center",background:"#FAF5FF",padding:"18px 20px",borderRadius:14,border:"1px solid #EDE9FE",cursor:"default" }}>
                  <div style={{ width:46,height:46,borderRadius:13,flexShrink:0,background:"#EDE9FE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.25rem" }}>{w.icon}</div>
                  <div>
                    <div style={{ fontWeight:700,color:"#0F172A",fontSize:"0.93rem",marginBottom:3 }}>{w.title}</div>
                    <div style={{ fontSize:"0.83rem",color:"#64748B",lineHeight:1.58 }}>{w.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity:0, x:60, scale:.96 }} whileInView={{ opacity:1, x:0, scale:1 }} transition={{ duration:.85, delay:.2, ease:[.22,1,.36,1] }} viewport={{ once:true, amount:.2 }}
            style={{ background:"linear-gradient(145deg,#080412,#0E0820)",borderRadius:26,padding:"52px 44px",textAlign:"center",border:"1px solid rgba(139,92,246,.22)",boxShadow:"0 28px 90px rgba(124,58,237,.2)",position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",inset:0,opacity:.04,backgroundImage:"radial-gradient(rgba(167,139,250,1) 1px,transparent 1px)",backgroundSize:"22px 22px" }} />
            <div style={{ position:"absolute",top:-70,right:-70,width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,.28) 0%,transparent 65%)",filter:"blur(35px)" }} />
            <div style={{ fontSize:"3rem",marginBottom:20,position:"relative" }}>⚙️</div>
            <h3 style={{ fontSize:"1.6rem",fontWeight:900,color:"white",marginBottom:12,letterSpacing:-.6,position:"relative" }}>Built with Modern Tech</h3>
            <p style={{ color:"rgba(255,255,255,.38)",fontSize:"0.88rem",marginBottom:34,lineHeight:1.8,position:"relative" }}>The right tools for every job — proven technologies that scale with your business.</p>
            <div style={{ display:"flex",flexWrap:"wrap",gap:9,justifyContent:"center",marginBottom:38,position:"relative" }}>
              {TECHS.map((t,i)=>{
                const c=["#C4B5FD","#DDD6FE","#A78BFA","#E9D5FF","#C4B5FD","#DDD6FE","#A78BFA","#E9D5FF"]
                const b=["rgba(124,58,237,.22)","rgba(139,92,246,.2)","rgba(167,139,250,.2)","rgba(196,181,253,.16)","rgba(124,58,237,.22)","rgba(139,92,246,.2)","rgba(167,139,250,.2)","rgba(196,181,253,.16)"]
                return <span key={t} className="hp-tech" style={{ padding:"7px 15px",borderRadius:50,fontSize:"0.8rem",fontWeight:600,background:b[i],color:c[i] }}>{t}</span>
              })}
            </div>
            <div style={{ paddingTop:26,borderTop:"1px solid rgba(255,255,255,.06)",position:"relative" }}>
              <div style={{ fontSize:"0.72rem",color:"#475569",marginBottom:12,letterSpacing:1,textTransform:"uppercase" }}>Currently Live</div>
              <div style={{ background:"rgba(124,58,237,.14)",border:"1px solid rgba(139,92,246,.32)",borderRadius:11,padding:"12px 18px",color:"#C4B5FD",fontSize:"0.86rem",fontWeight:600,display:"flex",alignItems:"center",gap:9,justifyContent:"center" }}>
                <span style={{ width:8,height:8,borderRadius:"50%",background:"#A78BFA",display:"inline-block",animation:"hpDot 2s infinite",boxShadow:"0 0 8px rgba(167,139,250,.8)" }} />
                Milk Vendor Management System
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════ CONTACT ══════════ */}
      <section id="contact" style={{ padding:"120px 6%",background:"linear-gradient(160deg,#F5F3FF 0%,#EDE9FE 100%)" }}>
        <motion.div {...fadeUp()} style={{ textAlign:"center",marginBottom:64 }}>
          <div style={{ display:"inline-block",background:"white",color:"#7C3AED",padding:"6px 20px",borderRadius:50,fontSize:"0.76rem",fontWeight:700,textTransform:"uppercase",letterSpacing:1.5,marginBottom:22,boxShadow:"0 2px 16px rgba(124,58,237,.12)" }}>Get in Touch</div>
          <h2 style={{ fontSize:"clamp(2rem,4vw,3.3rem)",fontWeight:900,color:"#0F172A",marginBottom:14,letterSpacing:-1.5 }}>
            Let's Build Something<br/>
            <span style={{ background:"linear-gradient(90deg,#7C3AED,#A78BFA)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Amazing Together</span>
          </h2>
          <p style={{ color:"#64748B",fontSize:"1rem",maxWidth:400,margin:"0 auto 40px",lineHeight:1.8 }}>Have a project idea or a question? Reach out directly.</p>
          <motion.a href="mailto:cheritechcompany@gmail.com" whileHover={{ scale:1.05,y:-4,boxShadow:"0 16px 50px rgba(124,58,237,.65)" }} whileTap={{ scale:.97 }}
            style={{ display:"inline-flex",alignItems:"center",gap:10,padding:"17px 48px",background:"linear-gradient(135deg,#7C3AED,#5B21B6)",color:"white",borderRadius:14,fontWeight:700,fontSize:"1rem",textDecoration:"none",boxShadow:"0 6px 30px rgba(124,58,237,.4)" }}>
            <span>📧</span> Send me an Email
          </motion.a>
        </motion.div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18,maxWidth:1020,margin:"0 auto" }} className="four-col">
          {contactItems.map((c,i)=>(
            <motion.div key={c.label}
              initial={{ opacity:0, y:35 }} whileInView={{ opacity:1, y:0 }}
              whileHover={{ y:-8, boxShadow:"0 16px 44px rgba(124,58,237,.14)" }}
              transition={{ duration:.6, delay:i*.1, ease:[.22,1,.36,1] }}
              viewport={{ once:true, amount:.2 }}
              style={{ background:"white",padding:"28px 22px",borderRadius:18,border:"1px solid rgba(139,92,246,.12)",boxShadow:"0 2px 14px rgba(124,58,237,.06)",cursor:"default" }}>
              <div style={{ width:50,height:50,borderRadius:14,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",marginBottom:16 }}>{c.icon}</div>
              <div style={{ fontSize:"0.7rem",textTransform:"uppercase",letterSpacing:1,color:"#94A3B8",marginBottom:7,fontWeight:600 }}>{c.label}</div>
              {c.href ? <a href={c.href} style={{ fontWeight:700,color:c.color,fontSize:"0.84rem",textDecoration:"none",wordBreak:"break-all" }}>{c.value}</a>
                      : <div style={{ fontWeight:700,color:"#1E293B",fontSize:"0.84rem" }}>{c.value}</div>}
            </motion.div>
          ))}
        </div>
      </section>

    </CompanyLayout>
  )
}
