import { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, getDocs,
  doc, updateDoc, query, orderBy, serverTimestamp
} from "firebase/firestore";
import {
  getAuth, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "firebase/auth";

// ─────────────────────────────────────────────────────────────────────────────
//  FIREBASE CONFIG  ← paste your values from the Firebase Console here
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyD7FXHsL8479v6YQHptUAD5ekeTWgq69pc",
  authDomain:        "ldg-charters.firebaseapp.com",
  projectId:         "ldg-charters",
  storageBucket:     "ldg-charters.firebasestorage.app",
  messagingSenderId: "579038723673",
  appId:             "1:579038723673:web:fee2b780d87c470b867b48",
  measurementId:     "G-1KT945WNFC",
};

const firebaseApp = initializeApp(firebaseConfig);
const db   = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// ─────────────────────────────────────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────────────────────────────────────
const BOATS = [
  { id:"get-down-lo",   name:"Get Down Lo",    subtitle:"Express Cruiser",      tagline:"Sleek. Stylish. Iconic.",         description:"The flagship of the LDG fleet. A premium express cruiser built for unforgettable nights and sun-soaked days on Lake Michigan.", features:["Sun deck & swim platform","Premium sound system","Cups, ice & silverware provided","Up to 12 guests"], bg:"linear-gradient(135deg,#0d2240,#0a1628,#0d2f50)", accent:"#4a9eff" },
  { id:"get-down-lo-ii",name:"Get Down Lo II", subtitle:"Cabin Cruiser",         tagline:"Elevated. Refined. Unforgettable.", description:"The next evolution. Featuring a full premium cabin interior with luxury seating and upscale amenities for the complete Lake Michigan experience.", features:["Full luxury cabin interior","Premium upholstered seating","Entertainment system","Up to 12 guests"], bg:"linear-gradient(135deg,#1e0d40,#120828,#2a1050)", accent:"#a06eff" },
  { id:"tread-lightly",  name:"Tread Lightly",  subtitle:"Performance Bowrider", tagline:"Power. Speed. Freedom.",           description:"A high-performance bowrider that commands the water. For those who want to feel the speed and raw beauty of Lake Michigan at full throttle.", features:["High-performance engine","Open-air bow seating","Swim platform","Up to 12 guests"], bg:"linear-gradient(135deg,#0d2a1a,#081a10,#0d3a22)", accent:"#4aff9a" },
];

const DURATIONS = [
  { id:"tour",   label:"Take A Tour",          hours:2, sub:"Quick escape on the water"       },
  { id:"classic",label:"Classic Lake Day",      hours:3, sub:"The perfect afternoon outing"    },
  { id:"exp",    label:"Enjoy the Experience",  hours:4, sub:"Unhurried luxury on the lake"    },
  { id:"norush", label:"No Rush",               hours:5, sub:"The full Lake Michigan experience"},
  { id:"ext6",   label:"Extended (6 hrs)",      hours:6, sub:"For those who want it all"       },
  { id:"ext7",   label:"Full Day (7 hrs)",       hours:7, sub:"Dawn to dusk on the water"       },
  { id:"ext8",   label:"All Day (8 hrs)",        hours:8, sub:"The ultimate charter day"        },
];

const DESTINATIONS = [
  { id:"skyline",    name:"Chicago Skyline Cruise",icon:"🏙️",desc:"Cruise along the iconic Chicago skyline — the most stunning view in the world." },
  { id:"playpen",    name:"The Playpen",           icon:"⚓",desc:"Anchor at Monroe Harbor's legendary cove where Chicago's boating scene comes alive." },
  { id:"navy-pier",  name:"Navy Pier",             icon:"🎡",desc:"Cruise past Chicago's iconic Navy Pier, Ferris wheel, and vibrant lakefront." },
  { id:"calumet",    name:"Calumet Harbor",        icon:"🌊",desc:"A scenic journey south along the shoreline to the peaceful Calumet Harbor." },
  { id:"open-water", name:"Open Water Adventure",  icon:"🧭",desc:"Head into the deep blue of Lake Michigan with the Chicago skyline on the horizon." },
  { id:"sunset",     name:"Sunset Cruise",         icon:"🌅",desc:"Time your departure for golden hour as the skyline ignites in amber and gold." },
];

const TIMES = ["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM"];

const TERMS = [
  { n:1,  t:"PAYMENT AND BOOKING",          b:"Deposit required to secure vessel. Remaining balance due 48 hours before departure." },
  { n:2,  t:"BOARDING AND DEPARTURE",       b:"Arrive 15–20 minutes early for check-in and safety briefing." },
  { n:3,  t:"PASSENGER LIMITS",             b:"Must comply with U.S. Coast Guard regulations. Maximum 12 guests per vessel." },
  { n:4,  t:"SAFETY RULES AND CONDUCT",     b:"Follow captain instructions at all times. Unsafe behavior may end charter with no refund. Swimming only with captain approval. Children under 13 must wear life jackets." },
  { n:5,  t:"WEATHER POLICY",               b:"Only the captain may cancel or delay. Unsafe conditions include lightning, high winds, fog, or hazardous waves. Weather cancellations receive a reschedule or credit." },
  { n:6,  t:"CANCELLATIONS AND REFUNDS",    b:"Deposits are non-refundable. Cancellation within 48 hours requires full payment. Captain cancellations receive a reschedule or credit. No-shows forfeit all payments." },
  { n:7,  t:"ALCOHOL AND SUBSTANCE POLICY", b:"Alcohol allowed in moderation. Illegal substances prohibited. Smoking only in approved areas. Glass is discouraged." },
  { n:8,  t:"DAMAGE LIABILITY",             b:"Client is responsible for damage, excessive mess, or lost items." },
  { n:9,  t:"FOOD AND OUTSIDE ITEMS",       b:"Food and catering allowed. No open flames. Coolers must not block walkways. Trash must go in bins." },
  { n:10, t:"INDEMNIFICATION",              b:"Client indemnifies LDG Charters for the actions of themselves or their guests." },
  { n:11, t:"HARBOR RULES",                 b:"All guests must comply with harbor and U.S. Coast Guard regulations." },
  { n:12, t:"FINAL TERMS",                  b:"This agreement is governed by Illinois law. Any modification must be in writing." },
];

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const fmtDate = d => { if(!d)return"—"; const[y,m,dy]=d.split("-"); const mo=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; return `${mo[+m-1]} ${+dy}, ${y}`; };
const calcEnd = (t,h) => { if(!t||!h)return"—"; const[tm,ap]=t.split(" "); let[hr]=tm.split(":").map(Number); if(ap==="PM"&&hr!==12)hr+=12; if(ap==="AM"&&hr===12)hr=0; hr+=h; const ea=hr>=12?"PM":"AM"; const eh=hr>12?hr-12:hr===0?12:hr; return `${eh}:00 ${ea}`; };
const fmtCurrency = n => `$${Number(n).toLocaleString()}`;

// ─────────────────────────────────────────────────────────────────────────────
//  GLOBAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}html{scroll-behavior:smooth;}
::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:#0a0f1e;}::-webkit-scrollbar-thumb{background:#c9a84c;border-radius:3px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.fu{animation:fadeUp .6s ease forwards;}
.boat-card:hover{transform:translateY(-7px)!important;box-shadow:0 20px 50px rgba(0,0,0,.55)!important;}
.dest-card:hover{border-color:#c9a84c!important;background:rgba(201,168,76,.05)!important;}
.btn-g:hover{background:#e8d070!important;transform:translateY(-2px);box-shadow:0 8px 22px rgba(201,168,76,.35)!important;}
.btn-o:hover{background:rgba(201,168,76,.1)!important;}
.nav-link:hover{color:#c9a84c!important;}
.tr-row:hover{background:rgba(255,255,255,.04)!important;}
input:focus,select:focus{border-color:#c9a84c!important;outline:none;}
`;

// ─────────────────────────────────────────────────────────────────────────────
//  SIGNATURE CANVAS
// ─────────────────────────────────────────────────────────────────────────────
function SigCanvas({ label, onSigned }) {
  const ref = useRef(null);
  const drawing = useRef(false);
  const [has, setHas] = useState(false);
  const xy = (e,c) => { const r=c.getBoundingClientRect(),sx=c.width/r.width,sy=c.height/r.height; if(e.touches)return{x:(e.touches[0].clientX-r.left)*sx,y:(e.touches[0].clientY-r.top)*sy}; return{x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy}; };
  const start=e=>{e.preventDefault();drawing.current=true;const p=xy(e,ref.current);const ctx=ref.current.getContext("2d");ctx.beginPath();ctx.moveTo(p.x,p.y);};
  const move=e=>{e.preventDefault();if(!drawing.current)return;const p=xy(e,ref.current);const ctx=ref.current.getContext("2d");ctx.lineWidth=2.2;ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#0a0f1e";ctx.lineTo(p.x,p.y);ctx.stroke();setHas(true);};
  const end=()=>{drawing.current=false;if(has)onSigned(ref.current.toDataURL());};
  const clear=()=>{ref.current.getContext("2d").clearRect(0,0,ref.current.width,ref.current.height);setHas(false);onSigned(null);};
  return (
    <div>
      <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"#888",marginBottom:5}}>{label}</div>
      <canvas ref={ref} width={460} height={90} onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchMove={move} onTouchEnd={end} style={{width:"100%",border:"1.5px solid #c9a84c",borderRadius:6,background:"#fff",cursor:"crosshair",display:"block",touchAction:"none"}}/>
      <div style={{display:"flex",gap:10,marginTop:5,alignItems:"center"}}>
        <button onClick={clear} style={{background:"transparent",border:"1px solid #aaa",color:"#888",padding:"3px 10px",borderRadius:4,cursor:"pointer",fontSize:11,fontFamily:"inherit"}}>Clear</button>
        {has&&<span style={{color:"#3aaa66",fontSize:12}}>✓ Signed</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  CALENDAR
// ─────────────────────────────────────────────────────────────────────────────
function Cal({ sel, onSel }) {
  const today=new Date();
  const[view,setView]=useState(new Date(today.getFullYear(),today.getMonth(),1));
  const MO=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const days=new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
  const fd=new Date(view.getFullYear(),view.getMonth(),1).getDay();
  const cells=[...Array(fd).fill(null),...Array.from({length:days},(_,i)=>i+1)];
  const isPast=d=>new Date(view.getFullYear(),view.getMonth(),d)<new Date(today.getFullYear(),today.getMonth(),today.getDate());
  const isSel=d=>{if(!sel||!d)return false;const[y,m,dy]=sel.split("-").map(Number);return d===dy&&view.getMonth()+1===m&&view.getFullYear()===y;};
  const isToday=d=>d===today.getDate()&&view.getMonth()===today.getMonth()&&view.getFullYear()===today.getFullYear();
  const pick=d=>{if(!d||isPast(d))return;onSel(`${view.getFullYear()}-${String(view.getMonth()+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`);};
  return (
    <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(201,168,76,.25)",borderRadius:12,padding:18,display:"inline-block"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <button onClick={()=>setView(new Date(view.getFullYear(),view.getMonth()-1,1))} style={{background:"none",border:"1px solid rgba(201,168,76,.3)",color:"#c9a84c",width:30,height:30,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
        <span style={{color:"#fff",fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:600}}>{MO[view.getMonth()]} {view.getFullYear()}</span>
        <button onClick={()=>setView(new Date(view.getFullYear(),view.getMonth()+1,1))} style={{background:"none",border:"1px solid rgba(201,168,76,.3)",color:"#c9a84c",width:30,height:30,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,34px)",gap:2}}>
        {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",color:"#c9a84c",fontSize:10,fontWeight:700,padding:"5px 0"}}>{d}</div>)}
        {cells.map((d,i)=>(
          <div key={i} onClick={()=>pick(d)} style={{textAlign:"center",padding:"7px 0",borderRadius:6,fontSize:12,cursor:d&&!isPast(d)?"pointer":"default",background:isSel(d)?"#c9a84c":isToday(d)?"rgba(201,168,76,.15)":"transparent",color:!d?"transparent":isPast(d)?"#333":isSel(d)?"#0a0f1e":"#fff",fontWeight:isSel(d)?700:400,border:isToday(d)&&!isSel(d)?"1px solid rgba(201,168,76,.4)":"1px solid transparent",transition:"all .15s"}}>{d||""}</div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_COLORS = { pending:{bg:"rgba(255,190,50,.15)",border:"rgba(255,190,50,.4)",color:"#ffc832"}, confirmed:{bg:"rgba(58,170,102,.15)",border:"rgba(58,170,102,.4)",color:"#3aaa66"}, paid:{bg:"rgba(74,158,255,.15)",border:"rgba(74,158,255,.4)",color:"#4a9eff"}, cancelled:{bg:"rgba(255,80,80,.15)",border:"rgba(255,80,80,.4)",color:"#ff5050"} };
function Badge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return <span style={{background:s.bg,border:`1px solid ${s.border}`,color:s.color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,textTransform:"capitalize",whiteSpace:"nowrap"}}>{status||"pending"}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN LOGIN
// ─────────────────────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [loading, setLoading] = useState(false);
  const inp = { width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.15)",borderRadius:8,padding:"12px 16px",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",transition:"border-color .2s",marginBottom:14 };

  const handleLogin = async () => {
    if (!email || !pass) { setErr("Please enter email and password."); return; }
    setLoading(true); setErr("");
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      onLogin();
    } catch (e) {
      setErr("Invalid credentials. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#0a0f1e",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{G}</style>
      <div style={{width:"100%",maxWidth:400,padding:"0 24px"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:600,letterSpacing:3,color:"#fff",marginBottom:4}}>LDG <span style={{color:"#c9a84c"}}>CHARTERS</span></div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.35)",letterSpacing:2,textTransform:"uppercase"}}>Admin Dashboard</div>
        </div>
        <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:32}}>
          <div style={{fontSize:18,fontFamily:"'Cormorant Garamond',serif",fontWeight:600,marginBottom:24,color:"#fff"}}>Sign In</div>
          <input type="email" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          <input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} style={inp} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          {err && <div style={{fontSize:12,color:"#ff6b6b",marginBottom:12,padding:"8px 12px",background:"rgba(255,80,80,.1)",border:"1px solid rgba(255,80,80,.25)",borderRadius:6}}>{err}</div>}
          <button onClick={handleLogin} disabled={loading} className="btn-g" style={{width:"100%",background:"#c9a84c",color:"#0a0f1e",border:"none",padding:14,borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,letterSpacing:1,transition:"all .2s"}}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </div>
        <div style={{textAlign:"center",marginTop:20}}>
          <button onClick={()=>window.location.hash=""} style={{background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>← Back to Website</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function AdminDashboard() {
  const [user, setUser]       = useState(null);
  const [authed, setAuthed]   = useState(false);
  const [checking, setChecking] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [updating, setUpdating] = useState(null);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u); setAuthed(!!u); setChecking(false);
      if (u) loadBookings();
    });
    return unsub;
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error("Load error:", e);
    }
    setLoading(false);
  };

  const updateStatus = async (id, field, value) => {
    setUpdating(id);
    try {
      await updateDoc(doc(db, "bookings", id), { [field]: value });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
    } catch (e) { console.error(e); }
    setUpdating(null);
  };

  const handleLogout = async () => { await signOut(auth); setAuthed(false); };

  if (checking) return <div style={{background:"#0a0f1e",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#c9a84c",fontFamily:"'DM Sans',sans-serif"}}>Loading…</div>;
  if (!authed)  return <AdminLogin onLogin={() => { setAuthed(true); loadBookings(); }} />;

  // ── Stats ──
  const confirmed  = bookings.filter(b => b.bookingStatus === "confirmed").length;
  const pending    = bookings.filter(b => !b.bookingStatus || b.bookingStatus === "pending").length;
  const paidFull   = bookings.filter(b => b.paymentOption === "full" && b.paymentStatus === "paid");
  const totalRev   = paidFull.reduce((s, b) => s + (b.totalPrice || 0), 0) + bookings.filter(b => b.paymentStatus === "deposit_paid").length * 500;
  const thisMonth  = bookings.filter(b => { if (!b.createdAt) return false; const d = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt); return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear(); }).length;

  // ── Filter + Search ──
  const filtered = bookings.filter(b => {
    const matchFilter = filter === "all" || b.bookingStatus === filter || (filter === "pending" && !b.bookingStatus);
    const q = search.toLowerCase();
    const matchSearch = !q || (b.clientName||"").toLowerCase().includes(q) || (b.vessel||"").toLowerCase().includes(q) || (b.charterDate||"").includes(q);
    return matchFilter && matchSearch;
  });

  const sideLinks = [["📋","Bookings"],["📊","Analytics"],["⚙️","Settings"]];

  return (
    <>
      <style>{G}{`
        .admin-row:hover{background:rgba(255,255,255,.03)!important;cursor:pointer;}
        .status-select{background:#0d1b2a;border:1px solid rgba(255,255,255,.15);color:#fff;padding:5px 8px;borderRadius:6px;fontSize:12px;cursor:pointer;fontFamily:"'DM Sans',sans-serif";}
      `}</style>
      <div style={{fontFamily:"'DM Sans',sans-serif",display:"flex",height:"100vh",background:"#070c18",color:"#fff",overflow:"hidden"}}>

        {/* ── SIDEBAR ── */}
        <div style={{width:220,background:"#0a0f1e",borderRight:"1px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"28px 20px 20px"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600,letterSpacing:2}}>LDG <span style={{color:"#c9a84c"}}>ADMIN</span></div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:3,letterSpacing:1}}>Charter Management</div>
          </div>
          <div style={{flex:1,padding:"0 12px"}}>
            {sideLinks.map(([icon,label])=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,background:label==="Bookings"?"rgba(201,168,76,.1)":"transparent",color:label==="Bookings"?"#c9a84c":"rgba(255,255,255,.5)",fontSize:13,cursor:"pointer",marginBottom:2}}>
                <span>{icon}</span>{label}
              </div>
            ))}
          </div>
          <div style={{padding:20,borderTop:"1px solid rgba(255,255,255,.07)"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:6}}>{user?.email}</div>
            <button onClick={handleLogout} style={{background:"transparent",border:"1px solid rgba(255,255,255,.15)",color:"rgba(255,255,255,.5)",padding:"7px 14px",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:"inherit",width:"100%"}}>Sign Out</button>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div style={{flex:1,overflow:"auto"}}>

          {/* Header */}
          <div style={{padding:"24px 32px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0a0f1e",position:"sticky",top:0,zIndex:10}}>
            <div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:600}}>Bookings</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginTop:2}}>{bookings.length} total reservations</div>
            </div>
            <button onClick={loadBookings} style={{background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.3)",color:"#c9a84c",padding:"8px 18px",borderRadius:8,cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:500}}>
              ↻ Refresh
            </button>
          </div>

          <div style={{padding:32}}>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
              {[["Total Bookings",bookings.length,"📋","rgba(201,168,76,.08)","#c9a84c"],["This Month",thisMonth,"📅","rgba(74,158,255,.08)","#4a9eff"],["Pending",pending,"⏳","rgba(255,190,50,.08)","#ffc832"],["Confirmed",confirmed,"✅","rgba(58,170,102,.08)","#3aaa66"]].map(([label,val,icon,bg,color])=>(
                <div key={label} style={{background:bg,border:`1px solid ${color}33`,borderRadius:12,padding:"18px 20px"}}>
                  <div style={{fontSize:22,marginBottom:6}}>{icon}</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:600,color,lineHeight:1}}>{val}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:4,letterSpacing:.5}}>{label}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
              <input placeholder="Search by name, vessel, or date…" value={search} onChange={e=>setSearch(e.target.value)}
                style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,padding:"9px 14px",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,width:260,outline:"none"}}/>
              <div style={{display:"flex",gap:6}}>
                {["all","pending","confirmed","paid","cancelled"].map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} style={{padding:"7px 14px",borderRadius:20,border:"1px solid",borderColor:filter===f?"#c9a84c":"rgba(255,255,255,.15)",background:filter===f?"rgba(201,168,76,.12)":"transparent",color:filter===f?"#c9a84c":"rgba(255,255,255,.45)",cursor:"pointer",fontSize:12,fontFamily:"inherit",textTransform:"capitalize",transition:"all .2s"}}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,overflow:"hidden"}}>
              {loading ? (
                <div style={{padding:60,textAlign:"center",color:"rgba(255,255,255,.35)",fontSize:14}}>Loading bookings…</div>
              ) : filtered.length === 0 ? (
                <div style={{padding:60,textAlign:"center",color:"rgba(255,255,255,.25)",fontSize:14}}>
                  {bookings.length === 0 ? "No bookings yet — they'll appear here when customers complete checkout." : "No bookings match your filter."}
                </div>
              ) : (
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:"rgba(255,255,255,.04)",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
                      {["Client","Vessel","Charter Date","Duration","Total","Payment","Booking Status",""].map(h=>(
                        <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:10,color:"rgba(255,255,255,.4)",fontWeight:600,letterSpacing:1,textTransform:"uppercase",whiteSpace:"nowrap"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(b => (
                      <>
                        <tr key={b.id} className="admin-row" onClick={()=>setExpanded(expanded===b.id?null:b.id)} style={{borderBottom:"1px solid rgba(255,255,255,.05)",transition:"background .15s"}}>
                          <td style={{padding:"14px 16px"}}>
                            <div style={{fontWeight:600,fontSize:14}}>{b.clientName}</div>
                            <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>{b.clientEmail}</div>
                          </td>
                          <td style={{padding:"14px 16px",fontSize:13,color:"rgba(255,255,255,.7)"}}>{b.vessel}</td>
                          <td style={{padding:"14px 16px"}}>
                            <div style={{fontSize:13}}>{fmtDate(b.charterDate)}</div>
                            <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:1}}>{b.startTime} – {b.endTime}</div>
                          </td>
                          <td style={{padding:"14px 16px",fontSize:13,color:"rgba(255,255,255,.7)"}}>{b.duration}</td>
                          <td style={{padding:"14px 16px"}}>
                            <div style={{fontSize:14,fontWeight:600,color:"#c9a84c"}}>{fmtCurrency(b.totalPrice)}</div>
                            <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:1}}>{b.paymentOption==="full"?"Full payment":"Deposit ($500)"}</div>
                          </td>
                          <td style={{padding:"14px 16px"}}>
                            <select className="status-select" value={b.paymentStatus||"unpaid"} onClick={e=>e.stopPropagation()} onChange={e=>updateStatus(b.id,"paymentStatus",e.target.value)} style={{background:"#0d1b2a",border:"1px solid rgba(255,255,255,.15)",color:"#fff",padding:"5px 8px",borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                              <option value="unpaid">Unpaid</option>
                              <option value="deposit_paid">Deposit Paid</option>
                              <option value="paid">Paid in Full</option>
                              <option value="refunded">Refunded</option>
                            </select>
                          </td>
                          <td style={{padding:"14px 16px"}}>
                            <select className="status-select" value={b.bookingStatus||"pending"} onClick={e=>e.stopPropagation()} onChange={e=>updateStatus(b.id,"bookingStatus",e.target.value)} style={{background:"#0d1b2a",border:"1px solid rgba(255,255,255,.15)",color:"#fff",padding:"5px 8px",borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td style={{padding:"14px 16px",textAlign:"center",color:"rgba(255,255,255,.3)",fontSize:18}}>{expanded===b.id?"▲":"▼"}</td>
                        </tr>

                        {/* Expanded Row */}
                        {expanded===b.id&&(
                          <tr key={b.id+"-exp"} style={{background:"rgba(201,168,76,.03)",borderBottom:"2px solid rgba(201,168,76,.15)"}}>
                            <td colSpan={8} style={{padding:"24px 32px"}}>
                              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24}}>

                                {/* Client Details */}
                                <div>
                                  <div style={{fontSize:10,letterSpacing:2,color:"#c9a84c",textTransform:"uppercase",marginBottom:12}}>Client Details</div>
                                  {[["Name",b.clientName],["Email",b.clientEmail],["Phone",b.clientPhone],["Host",b.hostName||"—"]].map(([k,v])=>(
                                    <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                                      <span style={{color:"rgba(255,255,255,.4)"}}>{k}</span>
                                      <span style={{color:"#fff"}}>{v}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Booking Details */}
                                <div>
                                  <div style={{fontSize:10,letterSpacing:2,color:"#c9a84c",textTransform:"uppercase",marginBottom:12}}>Charter Details</div>
                                  {[["Vessel",b.vessel],["Date",fmtDate(b.charterDate)],["Time",`${b.startTime} – ${b.endTime}`],["Duration",b.duration],["Destination",b.destination],["Booked",b.createdAt?.toDate?b.createdAt.toDate().toLocaleDateString():"—"]].map(([k,v])=>(
                                    <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                                      <span style={{color:"rgba(255,255,255,.4)"}}>{k}</span>
                                      <span style={{color:"#fff"}}>{v}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Financials */}
                                <div>
                                  <div style={{fontSize:10,letterSpacing:2,color:"#c9a84c",textTransform:"uppercase",marginBottom:12}}>Financials</div>
                                  {[["Charter Fee",fmtCurrency(b.totalPrice)],["Deposit",fmtCurrency(b.deposit)],["Balance Due",fmtCurrency(b.balance)],["Payment Option",b.paymentOption==="full"?"Full Payment":"Deposit Only"]].map(([k,v])=>(
                                    <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                                      <span style={{color:"rgba(255,255,255,.4)"}}>{k}</span>
                                      <span style={{color:k==="Charter Fee"?"#c9a84c":"#fff",fontWeight:k==="Charter Fee"?600:400}}>{v}</span>
                                    </div>
                                  ))}
                                  <div style={{marginTop:14,display:"flex",gap:8}}>
                                    <Badge status={b.paymentStatus||"unpaid"}/>
                                    <Badge status={b.bookingStatus||"pending"}/>
                                  </div>
                                </div>

                                {/* Signature */}
                                {b.clientSignature&&(
                                  <div>
                                    <div style={{fontSize:10,letterSpacing:2,color:"#c9a84c",textTransform:"uppercase",marginBottom:12}}>Client Signature</div>
                                    <div style={{background:"#fff",borderRadius:8,padding:8,display:"inline-block",border:"2px solid rgba(201,168,76,.3)"}}>
                                      <img src={b.clientSignature} alt="Client signature" style={{width:220,height:"auto",display:"block"}}/>
                                    </div>
                                    <div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:6}}>Signed on {fmtDate(b.charterDate)}</div>
                                  </div>
                                )}
                              </div>

                              {/* Admin Notes */}
                              <div style={{marginTop:20,paddingTop:16,borderTop:"1px solid rgba(255,255,255,.07)"}}>
                                <div style={{fontSize:10,letterSpacing:2,color:"#c9a84c",textTransform:"uppercase",marginBottom:8}}>Admin Notes</div>
                                <textarea
                                  defaultValue={b.adminNotes||""}
                                  onBlur={e=>updateStatus(b.id,"adminNotes",e.target.value)}
                                  placeholder="Add internal notes about this booking…"
                                  style={{width:"100%",maxWidth:600,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"10px 14px",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,resize:"vertical",minHeight:70,outline:"none"}}
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN APP — PUBLIC SITE + BOOKING FLOW
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  // Hash-based routing
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const h = () => setHash(window.location.hash);
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  if (hash === "#admin" || hash === "#/admin") return <AdminDashboard />;

  return <LDGChartersApp />;
}

// ─────────────────────────────────────────────────────────────────────────────
//  LDG CHARTERS PUBLIC APP
// ─────────────────────────────────────────────────────────────────────────────
function LDGChartersApp() {
  const [view,    setView]    = useState("home");
  const [step,    setStep]    = useState(1);
  const [boat,    setBoat]    = useState(null);
  const [dur,     setDur]     = useState(null);
  const [dest,    setDest]    = useState(null);
  const [date,    setDate]    = useState(null);
  const [time,    setTime]    = useState(null);
  const [info,    setInfo]    = useState({ name:"", email:"", phone:"" });
  const [host,    setHost]    = useState({ name:"", email:"" });
  const [cSig,    setCSig]    = useState(null);
  const [payOpt,  setPayOpt]  = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [saveErr, setSaveErr] = useState("");

  const total   = dur ? dur.hours * 600 : 0;
  const deposit = 500;
  const balance = total - deposit;
  const endT    = calcEnd(time, dur?.hours);

  const canNext = () => {
    if(step===1) return !!boat;
    if(step===2) return !!dur;
    if(step===3) return !!dest;
    if(step===4) return !!date&&!!time;
    if(step===5) return !!(info.name&&info.email&&info.phone);
    if(step===6) return !!cSig;
    return true;
  };

  const startBook = (preBoat=null) => { if(preBoat)setBoat(preBoat); setStep(1); setView("book"); setTimeout(()=>window.scrollTo(0,0),0); };
  const reset = () => { setView("home"); setStep(1); setBoat(null); setDur(null); setDest(null); setDate(null); setTime(null); setInfo({name:"",email:"",phone:""}); setHost({name:"",email:""}); setCSig(null); setPayOpt(null); setSaved(false); setSaveErr(""); };

  // ── Save booking to Firestore ──
  const saveBooking = async (chosenPayOpt) => {
    setSaving(true); setSaveErr("");
    try {
      await addDoc(collection(db, "bookings"), {
        clientName:      info.name,
        clientEmail:     info.email,
        clientPhone:     info.phone,
        hostName:        host.name  || null,
        hostEmail:       host.email || null,
        vessel:          boat.name,
        vesselId:        boat.id,
        duration:        `${dur.label} (${dur.hours} hrs)`,
        hours:           dur.hours,
        destination:     dest.name,
        charterDate:     date,
        startTime:       time,
        endTime:         endT,
        totalPrice:      total,
        deposit:         deposit,
        balance:         balance,
        paymentOption:   chosenPayOpt,
        paymentStatus:   "unpaid",
        bookingStatus:   "pending",
        clientSignature: cSig,
        adminNotes:      "",
        createdAt:       serverTimestamp(),
      });
      setSaved(true);
    } catch (e) {
      console.error(e);
      setSaveErr("Could not save booking. Please call 708‑846‑3132.");
    }
    setSaving(false);
  };

  const inp = { width:"100%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.14)", borderRadius:8, padding:"12px 16px", color:"#fff", fontFamily:"'DM Sans',sans-serif", fontSize:14, outline:"none", transition:"border-color .2s" };

  /* ══ HOME ══ */
  if (view === "home") return (
    <>
      <style>{G}</style>
      <div style={{fontFamily:"'DM Sans',sans-serif",background:"#0a0f1e",color:"#fff",minHeight:"100vh"}}>

        {/* NAV */}
        <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,background:"rgba(10,15,30,.94)",backdropFilter:"blur(18px)",borderBottom:"1px solid rgba(201,168,76,.13)",padding:"0 5%",height:68,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#c9a84c,#7a5a14)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:"#0a0f1e"}}>L</span>
            </div>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:21,fontWeight:600,letterSpacing:2}}>LDG <span style={{color:"#c9a84c"}}>CHARTERS</span></span>
          </div>
          <div style={{display:"flex",gap:26,alignItems:"center"}}>
            {[["Fleet","fleet"],["Destinations","destinations"],["Pricing","pricing"],["Contact","contact"]].map(([l,id])=>(
              <button key={id} className="nav-link" onClick={()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"})} style={{background:"none",border:"none",color:"rgba(255,255,255,.6)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:400,transition:"color .2s"}}>{l}</button>
            ))}
            <button className="btn-g" onClick={()=>startBook()} style={{background:"#c9a84c",color:"#0a0f1e",border:"none",padding:"9px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",transition:"all .22s"}}>Book Now</button>
          </div>
        </nav>

        {/* HERO */}
        <section style={{minHeight:"100vh",background:"linear-gradient(180deg,#0a0f1e 0%,#0c1a2e 55%,#0a0f1e 100%)",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"130px 24px 80px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:"18%",left:"8%",width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,168,76,.07) 0%,transparent 70%)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",bottom:"18%",right:"8%",width:420,height:420,borderRadius:"50%",background:"radial-gradient(circle,rgba(74,158,255,.05) 0%,transparent 70%)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 1px 1px,rgba(201,168,76,.055) 1px,transparent 0)",backgroundSize:"44px 44px",pointerEvents:"none"}}/>
          <div className="fu" style={{maxWidth:780}}>
            <div style={{fontSize:11,letterSpacing:5,color:"#c9a84c",textTransform:"uppercase",marginBottom:18,fontWeight:500}}>Chicago · Lake Michigan · 31st Street Harbor</div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(52px,8vw,92px)",fontWeight:300,lineHeight:1.06,marginBottom:22,letterSpacing:-1}}>Experience<br/><span style={{fontStyle:"italic",color:"#c9a84c"}}>Lake Michigan</span><br/>Like Never Before</h1>
            <p style={{fontSize:17,color:"rgba(255,255,255,.6)",fontWeight:300,maxWidth:500,margin:"0 auto 36px",lineHeight:1.75}}>Whether you're celebrating something big or just want to unwind — our charters are designed to give you the ultimate Chicago experience.</p>
            <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="btn-g" onClick={()=>startBook()} style={{background:"#c9a84c",color:"#0a0f1e",border:"none",padding:"15px 38px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,letterSpacing:2,textTransform:"uppercase",transition:"all .22s"}}>Book Your Charter</button>
              <button className="btn-o" onClick={()=>document.getElementById("fleet")?.scrollIntoView({behavior:"smooth"})} style={{background:"transparent",color:"#fff",border:"1px solid rgba(255,255,255,.28)",padding:"15px 38px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:400,letterSpacing:1,transition:"all .22s"}}>View Fleet</button>
            </div>
            <div style={{marginTop:56,display:"flex",gap:40,justifyContent:"center",flexWrap:"wrap"}}>
              {[["3","Vessels"],["$600","Per Hour"],["12","Max Guests"],["31st St","Harbor"]].map(([n,l])=>(
                <div key={l} style={{textAlign:"center"}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:600,color:"#c9a84c"}}>{n}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.4)",letterSpacing:2.5,textTransform:"uppercase",marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section style={{padding:"100px 5%",maxWidth:880,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:12}}>About LDG Charters</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,5vw,50px)",fontWeight:400,marginBottom:26,lineHeight:1.2}}>Where Adventure Meets Luxury <span style={{fontStyle:"italic"}}>On The Water</span></h2>
          <p style={{fontSize:16,color:"rgba(255,255,255,.6)",lineHeight:1.8,marginBottom:18}}>Explore the breathtaking coastlines and hidden gems of Lake Michigan with LDG Charters. Our impeccable fleet and experienced crew ensure a smooth and memorable experience tailored to your unique needs — whether for a casual family outing or a lavish celebration.</p>
          <p style={{fontSize:16,color:"rgba(255,255,255,.6)",lineHeight:1.8,marginBottom:32}}>Departing from 31st Street Harbor, we provide cups, ice, plastic silverware, and paper towels. You bring the drinks, the people, and the energy. From cruising the iconic Chicago skyline to anchoring at the lively Playpen — every trip is tailored to your vibe.</p>
          <div style={{background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.22)",borderRadius:8,padding:"16px 22px",fontSize:13,color:"#c9a84c",fontStyle:"italic",lineHeight:1.65,maxWidth:600,margin:"0 auto"}}>
            ⚓ Captain services are not included in the listing price. A licensed captain is required and arranged separately — call <strong style={{fontStyle:"normal"}}>708‑846‑3132</strong>
          </div>
        </section>

        {/* FLEET */}
        <section id="fleet" style={{padding:"80px 5%",background:"rgba(255,255,255,.018)"}}>
          <div style={{maxWidth:1180,margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:52}}>
              <div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:10}}>Our Fleet</div>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,5vw,50px)",fontWeight:400}}>Choose Your <span style={{fontStyle:"italic"}}>Vessel</span></h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:22}}>
              {BOATS.map(b=>(
                <div key={b.id} className="boat-card" style={{background:"#0c1928",border:"1px solid rgba(201,168,76,.14)",borderRadius:16,overflow:"hidden",transition:"all .3s"}}>
                  <div style={{height:190,background:b.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                    <div style={{textAlign:"center",animation:"float 4s ease-in-out infinite"}}>
                      <div style={{fontSize:56}}>🛥️</div>
                      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600,color:"rgba(255,255,255,.85)",letterSpacing:2,marginTop:6}}>{b.name}</div>
                    </div>
                    <div style={{position:"absolute",bottom:0,left:0,right:0,height:50,background:`linear-gradient(to bottom,transparent,#0c1928)`}}/>
                  </div>
                  <div style={{padding:26}}>
                    <div style={{fontSize:10,letterSpacing:3,color:b.accent,textTransform:"uppercase",marginBottom:6}}>{b.subtitle}</div>
                    <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:600,marginBottom:6}}>{b.name}</h3>
                    <p style={{fontSize:12,fontStyle:"italic",color:"#c9a84c",marginBottom:14}}>{b.tagline}</p>
                    <p style={{fontSize:13,color:"rgba(255,255,255,.55)",lineHeight:1.7,marginBottom:18}}>{b.description}</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:22}}>
                      {b.features.map(f=><span key={f} style={{fontSize:10,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",padding:"3px 9px",borderRadius:20,color:"rgba(255,255,255,.55)"}}>✓ {f}</span>)}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:18,borderTop:"1px solid rgba(255,255,255,.07)",marginBottom:18}}>
                      <div>
                        <div style={{fontSize:24,fontFamily:"'Cormorant Garamond',serif",fontWeight:600,color:"#c9a84c"}}>$600<span style={{fontSize:13,color:"rgba(255,255,255,.4)",fontFamily:"'DM Sans',sans-serif",fontWeight:300}}>/hour</span></div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>2 hr minimum · $500 deposit</div>
                      </div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.35)",textAlign:"right"}}>Up to 12 guests<br/><span style={{color:"rgba(201,168,76,.45)"}}>31st St Harbor</span></div>
                    </div>
                    <button className="btn-g" onClick={()=>startBook(b)} style={{width:"100%",background:"#c9a84c",color:"#0a0f1e",border:"none",padding:13,borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",transition:"all .22s"}}>Book {b.name}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DESTINATIONS */}
        <section id="destinations" style={{padding:"96px 5%"}}>
          <div style={{maxWidth:1180,margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:52}}>
              <div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:10}}>Where We Go</div>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,5vw,50px)",fontWeight:400}}>Choose Your <span style={{fontStyle:"italic"}}>Destination</span></h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))",gap:18}}>
              {DESTINATIONS.map(d=>(
                <div key={d.id} className="dest-card" style={{background:"rgba(255,255,255,.028)",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,padding:26,transition:"all .25s"}}>
                  <div style={{fontSize:34,marginBottom:14}}>{d.icon}</div>
                  <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600,marginBottom:9}}>{d.name}</h3>
                  <p style={{fontSize:13,color:"rgba(255,255,255,.52)",lineHeight:1.7}}>{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" style={{padding:"80px 5%",background:"rgba(255,255,255,.018)"}}>
          <div style={{maxWidth:860,margin:"0 auto",textAlign:"center"}}>
            <div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:10}}>Pricing</div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,5vw,48px)",fontWeight:400,marginBottom:40}}>Simple, Transparent <span style={{fontStyle:"italic"}}>Pricing</span></h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14,marginBottom:32}}>
              {DURATIONS.slice(0,4).map(d=>(
                <div key={d.id} style={{background:"rgba(201,168,76,.05)",border:"1px solid rgba(201,168,76,.2)",borderRadius:12,padding:"22px 14px",textAlign:"center"}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:600,color:"#c9a84c"}}>${(d.hours*600).toLocaleString()}</div>
                  <div style={{fontSize:14,fontWeight:600,color:"#fff",margin:"8px 0 3px"}}>{d.label}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{d.hours} hours</div>
                </div>
              ))}
            </div>
            <p style={{color:"rgba(255,255,255,.4)",fontSize:13,marginBottom:28}}>$600/hr · 2 hour minimum · $500 non-refundable deposit · Additional hours available</p>
            <button className="btn-g" onClick={()=>startBook()} style={{background:"#c9a84c",color:"#0a0f1e",border:"none",padding:"15px 44px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,letterSpacing:2,textTransform:"uppercase",transition:"all .22s"}}>Book Your Charter</button>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" style={{padding:"96px 5%"}}>
          <div style={{maxWidth:860,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:48}}>
            <div>
              <div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:14}}>Contact Us</div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:500,marginBottom:20}}>Get In Touch</h3>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}><span style={{color:"#c9a84c",marginTop:2}}>📍</span><div style={{color:"rgba(255,255,255,.6)",fontSize:14,lineHeight:1.65}}>3100 South DuSable Lake Shore Drive<br/>Chicago, IL, USA<br/><span style={{color:"rgba(255,255,255,.35)",fontSize:12}}>31st Street Harbor</span></div></div>
                <div style={{display:"flex",gap:12,alignItems:"center"}}><span style={{color:"#c9a84c"}}>📞</span><a href="tel:7088463132" style={{color:"rgba(255,255,255,.6)",fontSize:14,textDecoration:"none"}}>708‑846‑3132</a></div>
              </div>
            </div>
            <div>
              <div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:14}}>Cancellation Policy</div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:500,marginBottom:20}}>Good To Know</h3>
              {["$500 non-refundable deposit secures your booking.","Remaining balance due 48 hours before departure.","Weather cancellations receive a reschedule or credit.","Need to reschedule? Contact us — we're happy to help."].map(p=>(
                <div key={p} style={{display:"flex",gap:10,fontSize:13,color:"rgba(255,255,255,.55)",lineHeight:1.65,marginBottom:10}}><span style={{color:"#c9a84c",flexShrink:0}}>—</span>{p}</div>
              ))}
            </div>
          </div>
        </section>

        <footer style={{borderTop:"1px solid rgba(255,255,255,.07)",padding:"36px 5%",textAlign:"center"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,letterSpacing:3,marginBottom:6}}>LDG <span style={{color:"#c9a84c"}}>CHARTERS</span></div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.28)",letterSpacing:1}}>31st Street Harbor · Chicago, IL · 708‑846‑3132</div>
          <div style={{marginTop:8,fontSize:10,color:"rgba(255,255,255,.15)"}}>© {new Date().getFullYear()} LDG Charters · <span style={{cursor:"pointer",textDecoration:"underline"}} onClick={()=>window.location.hash="admin"}>Admin</span></div>
        </footer>
      </div>
    </>
  );

  /* ══ BOOKING FLOW ══ */
  const SLABELS = ["Vessel","Duration","Destination","Date & Time","Your Info","Agreement","Invoice"];

  return (
    <>
      <style>{G}</style>
      <div style={{fontFamily:"'DM Sans',sans-serif",background:"#0a0f1e",color:"#fff",minHeight:"100vh"}}>
        <nav style={{position:"sticky",top:0,zIndex:200,background:"rgba(10,15,30,.95)",backdropFilter:"blur(18px)",borderBottom:"1px solid rgba(201,168,76,.13)",padding:"0 5%",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={reset} style={{background:"none",border:"none",color:"#c9a84c",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",fontSize:19,fontWeight:600,letterSpacing:2}}>← LDG CHARTERS</button>
          <div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>Step {step}/{SLABELS.length} — <span style={{color:"#c9a84c"}}>{SLABELS[step-1]}</span></div>
        </nav>
        <div style={{height:3,background:"rgba(255,255,255,.07)"}}>
          <div style={{height:"100%",width:`${(step/SLABELS.length)*100}%`,background:"linear-gradient(90deg,#c9a84c,#e8d070)",transition:"width .4s ease"}}/>
        </div>
        <div style={{padding:"16px 5% 0",display:"flex",gap:4,overflowX:"auto",justifyContent:"center",flexWrap:"wrap"}}>
          {SLABELS.map((s,i)=>(
            <div key={s} style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{display:"flex",alignItems:"center",gap:5,opacity:i+1>step?.45:1}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:i+1<step?"#c9a84c":i+1===step?"transparent":"rgba(255,255,255,.08)",border:i+1===step?"2px solid #c9a84c":"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:i+1<step?"#0a0f1e":i+1===step?"#c9a84c":"#555",flexShrink:0}}>
                  {i+1<step?"✓":i+1}
                </div>
                <span style={{fontSize:10,color:i+1===step?"#c9a84c":i+1<step?"rgba(255,255,255,.65)":"rgba(255,255,255,.25)",whiteSpace:"nowrap"}}>{s}</span>
              </div>
              {i<SLABELS.length-1&&<div style={{width:14,height:1,background:"rgba(255,255,255,.12)",flexShrink:0}}/>}
            </div>
          ))}
        </div>

        <div style={{maxWidth:900,margin:"0 auto",padding:"36px 5% 100px"}}>

          {/* S1 */}
          {step===1&&<div className="fu">
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,6vw,44px)",fontWeight:400,marginBottom:6}}>Select Your <span style={{fontStyle:"italic",color:"#c9a84c"}}>Vessel</span></h2>
            <p style={{color:"rgba(255,255,255,.4)",marginBottom:28,fontSize:14}}>All vessels are $600/hr with a 2-hour minimum and $500 deposit.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:18}}>
              {BOATS.map(b=>(
                <div key={b.id} onClick={()=>setBoat(b)} style={{border:boat?.id===b.id?"2px solid #c9a84c":"1px solid rgba(255,255,255,.1)",borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"all .2s",background:boat?.id===b.id?"rgba(201,168,76,.05)":"rgba(255,255,255,.02)",transform:boat?.id===b.id?"scale(1.02)":"scale(1)"}}>
                  <div style={{height:130,background:b.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>🛥️</div>
                  <div style={{padding:18}}>
                    <div style={{fontSize:9,letterSpacing:3,color:b.accent,textTransform:"uppercase",marginBottom:4}}>{b.subtitle}</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,marginBottom:6}}>{b.name}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,.45)",lineHeight:1.65,marginBottom:10}}>{b.description}</div>
                    <div style={{fontSize:20,fontFamily:"'Cormorant Garamond',serif",color:"#c9a84c"}}>$600<span style={{fontSize:11,color:"rgba(255,255,255,.35)",fontFamily:"'DM Sans',sans-serif"}}>/hr</span></div>
                  </div>
                  {boat?.id===b.id&&<div style={{background:"#c9a84c",padding:7,textAlign:"center",fontSize:11,fontWeight:700,color:"#0a0f1e",letterSpacing:1,textTransform:"uppercase"}}>✓ Selected</div>}
                </div>
              ))}
            </div>
          </div>}

          {/* S2 */}
          {step===2&&<div className="fu">
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,6vw,44px)",fontWeight:400,marginBottom:6}}>Select <span style={{fontStyle:"italic",color:"#c9a84c"}}>Duration</span></h2>
            <p style={{color:"rgba(255,255,255,.4)",marginBottom:28,fontSize:14}}>$600 per hour — your price builds as you choose.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr",gap:28}}>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {DURATIONS.map(d=>(
                  <div key={d.id} onClick={()=>setDur(d)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"15px 18px",border:dur?.id===d.id?"1.5px solid #c9a84c":"1px solid rgba(255,255,255,.1)",borderRadius:10,cursor:"pointer",background:dur?.id===d.id?"rgba(201,168,76,.07)":"rgba(255,255,255,.02)",transition:"all .2s"}}>
                    <div><div style={{fontWeight:600,fontSize:15}}>{d.label}</div><div style={{fontSize:11,color:"rgba(255,255,255,.38)",marginTop:2}}>{d.hours} hrs · {d.sub}</div></div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:dur?.id===d.id?"#c9a84c":"rgba(255,255,255,.55)",fontWeight:600}}>${(d.hours*600).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.28)",borderRadius:14,padding:24}}>
                <div style={{fontSize:10,letterSpacing:3,color:"#c9a84c",textTransform:"uppercase",marginBottom:14}}>Live Price Summary</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:52,fontWeight:600,color:"#c9a84c",lineHeight:1,marginBottom:4}}>{dur?`$${(dur.hours*600).toLocaleString()}`:"$—"}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.38)",marginBottom:18}}>{dur?`${dur.hours} hrs × $600/hr`:"Select a duration above"}</div>
                <div style={{display:"flex",flexDirection:"column",gap:8,paddingTop:16,borderTop:"1px solid rgba(255,255,255,.08)"}}>
                  {[["Vessel",boat?.name||"—"],["Rate","$600/hr"],["Hours",dur?`${dur.hours} hrs`:"—"],["Charter Fee",dur?`$${(dur.hours*600).toLocaleString()}`:"—"],["Deposit Due Now","$500"],["Remaining Balance",dur?`$${(dur.hours*600-500).toLocaleString()}`:"—"]].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                      <span style={{color:"rgba(255,255,255,.42)"}}>{k}</span>
                      <span style={{color:k.includes("Deposit")?"#c9a84c":"#fff",fontWeight:k.includes("Fee")||k.includes("Deposit")?600:400}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:12,fontSize:11,color:"rgba(255,255,255,.25)",fontStyle:"italic"}}>* Captain fee arranged separately — call 708‑846‑3132</div>
              </div>
            </div>
          </div>}

          {/* S3 */}
          {step===3&&<div className="fu">
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,6vw,44px)",fontWeight:400,marginBottom:6}}>Choose Your <span style={{fontStyle:"italic",color:"#c9a84c"}}>Destination</span></h2>
            <p style={{color:"rgba(255,255,255,.4)",marginBottom:28,fontSize:14}}>Your captain will guide you to your chosen destination.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:14}}>
              {DESTINATIONS.map(d=>(
                <div key={d.id} onClick={()=>setDest(d)} style={{padding:22,border:dest?.id===d.id?"2px solid #c9a84c":"1px solid rgba(255,255,255,.1)",borderRadius:12,cursor:"pointer",background:dest?.id===d.id?"rgba(201,168,76,.06)":"rgba(255,255,255,.02)",transition:"all .2s"}}>
                  <div style={{fontSize:30,marginBottom:12}}>{d.icon}</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,fontWeight:600,marginBottom:7}}>{d.name}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.48)",lineHeight:1.65}}>{d.desc}</div>
                  {dest?.id===d.id&&<div style={{marginTop:10,fontSize:11,color:"#c9a84c",fontWeight:600}}>✓ Selected</div>}
                </div>
              ))}
            </div>
          </div>}

          {/* S4 */}
          {step===4&&<div className="fu">
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,6vw,44px)",fontWeight:400,marginBottom:6}}>Pick Your <span style={{fontStyle:"italic",color:"#c9a84c"}}>Date & Time</span></h2>
            <p style={{color:"rgba(255,255,255,.4)",marginBottom:28,fontSize:14}}>Departing 31st Street Harbor. Arrive 15–20 minutes early.</p>
            <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:32,flexWrap:"wrap"}}>
              <Cal sel={date} onSel={setDate}/>
              <div>
                <div style={{fontSize:10,letterSpacing:2,color:"#c9a84c",textTransform:"uppercase",marginBottom:14}}>Departure Time</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {TIMES.map(t=>(
                    <button key={t} onClick={()=>setTime(t)} style={{padding:11,border:time===t?"1.5px solid #c9a84c":"1px solid rgba(255,255,255,.1)",borderRadius:8,background:time===t?"rgba(201,168,76,.1)":"rgba(255,255,255,.02)",color:time===t?"#c9a84c":"rgba(255,255,255,.65)",cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:time===t?600:400,transition:"all .2s"}}>{t}</button>
                  ))}
                </div>
                {date&&time&&<div style={{marginTop:20,background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.22)",borderRadius:10,padding:"16px 18px"}}>
                  <div style={{fontSize:10,color:"#c9a84c",letterSpacing:2,textTransform:"uppercase",marginBottom:7}}>Your Charter Window</div>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600}}>{fmtDate(date)}</div>
                  <div style={{fontSize:14,color:"rgba(255,255,255,.55)",marginTop:4}}>{time} → {endT} ({dur?.hours} hrs)</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:3}}>31st Street Harbor · {boat?.name}</div>
                </div>}
              </div>
            </div>
          </div>}

          {/* S5 */}
          {step===5&&<div className="fu">
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,6vw,44px)",fontWeight:400,marginBottom:6}}>Your <span style={{fontStyle:"italic",color:"#c9a84c"}}>Information</span></h2>
            <p style={{color:"rgba(255,255,255,.4)",marginBottom:28,fontSize:14}}>Used to generate your charter agreement — please use your legal name.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:36}}>
              <div>
                <div style={{fontSize:10,letterSpacing:3,color:"#c9a84c",textTransform:"uppercase",marginBottom:16}}>Client Details</div>
                {[["Full Legal Name","name","text","Your full name"],["Email Address","email","email","your@email.com"],["Phone Number","phone","tel","708-000-0000"]].map(([lbl,f,t,ph])=>(
                  <div key={f} style={{marginBottom:14}}>
                    <label style={{fontSize:11,color:"rgba(255,255,255,.45)",display:"block",marginBottom:5}}>{lbl}</label>
                    <input type={t} placeholder={ph} value={info[f]} onChange={e=>setInfo({...info,[f]:e.target.value})} style={inp}/>
                  </div>
                ))}
              </div>
              <div>
                <div style={{fontSize:10,letterSpacing:3,color:"#c9a84c",textTransform:"uppercase",marginBottom:16}}>Host Details <span style={{fontSize:9,color:"rgba(255,255,255,.25)"}}>(optional)</span></div>
                {[["Host Name","name","Event host name"],["Host Email","email","host@email.com"]].map(([lbl,f,ph])=>(
                  <div key={f} style={{marginBottom:14}}>
                    <label style={{fontSize:11,color:"rgba(255,255,255,.45)",display:"block",marginBottom:5}}>{lbl}</label>
                    <input placeholder={ph} value={host[f]} onChange={e=>setHost({...host,[f]:e.target.value})} style={inp}/>
                  </div>
                ))}
                <div style={{marginTop:18,background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.2)",borderRadius:10,padding:18}}>
                  <div style={{fontSize:10,color:"#c9a84c",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Booking Summary</div>
                  {[["Vessel",boat?.name],["Duration",`${dur?.label} (${dur?.hours} hrs)`],["Destination",dest?.name],["Date",fmtDate(date)],["Time",`${time} – ${endT}`],["Charter Fee",`$${total.toLocaleString()}`]].map(([k,v])=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:7}}>
                      <span style={{color:"rgba(255,255,255,.4)"}}>{k}</span>
                      <span style={{color:"#fff",maxWidth:180,textAlign:"right",fontWeight:k==="Charter Fee"?600:400}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>}

          {/* S6 */}
          {step===6&&<div className="fu">
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,6vw,44px)",fontWeight:400,marginBottom:6}}>Charter <span style={{fontStyle:"italic",color:"#c9a84c"}}>Agreement</span></h2>
            <p style={{color:"rgba(255,255,255,.4)",marginBottom:24,fontSize:14}}>Review and sign your agreement to proceed to the invoice.</p>
            <div style={{background:"#fff",borderRadius:12,padding:"38px 32px",color:"#1a1a1a",maxWidth:760,margin:"0 auto 24px",boxShadow:"0 24px 80px rgba(0,0,0,.55)"}}>
              <div style={{textAlign:"center",marginBottom:26,paddingBottom:20,borderBottom:"2.5px solid #0a0f1e"}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,letterSpacing:3,color:"#0a0f1e",marginBottom:3}}>LDG CHARTERS</div>
                <div style={{fontSize:11,letterSpacing:4,color:"#888",textTransform:"uppercase"}}>Master Charter Agreement · Client Contract Form</div>
              </div>
              <section style={{marginBottom:22}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:10,paddingBottom:5,borderBottom:"1px solid #ebebeb"}}>Client Information</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:7}}>
                  {[["Client Name",info.name],["Client Email",info.email],["Phone",info.phone],["Charter Date",fmtDate(date)]].map(([k,v])=>(
                    <div key={k} style={{background:"#f7f7f7",padding:"8px 11px",borderRadius:5}}><div style={{fontSize:9,color:"#999",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{k}</div><div style={{fontSize:13,fontWeight:500}}>{v||"—"}</div></div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
                  {[["Vessel",boat?.name],["Departure","31st Street Harbor, Chicago IL"],["Window",`${time||"—"} – ${endT}`]].map(([k,v])=>(
                    <div key={k} style={{background:"#f7f7f7",padding:"8px 11px",borderRadius:5}}><div style={{fontSize:9,color:"#999",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{k}</div><div style={{fontSize:12,fontWeight:500}}>{v||"—"}</div></div>
                  ))}
                </div>
              </section>
              <section style={{marginBottom:22}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:10,paddingBottom:5,borderBottom:"1px solid #ebebeb"}}>Charter Fees</div>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <tbody>
                    {[["Boat Rental Rate","$600.00 / hour"],["Total Hours",`${dur?.hours} hours`],["Total Charter Fee",`$${total.toLocaleString()}.00`],["Captain Services","Arranged Separately"],["Deposit Required","$500.00 (Non-Refundable)"],["Remaining Balance",`$${balance.toLocaleString()}.00`]].map(([k,v],i)=>(
                      <tr key={k} style={{borderBottom:"1px solid #f2f2f2"}}><td style={{padding:"7px 10px",color:"#555",background:i%2===0?"#fafafa":"#fff"}}>{k}</td><td style={{padding:"7px 10px",fontWeight:600,textAlign:"right",background:i%2===0?"#fafafa":"#fff"}}>{v}</td></tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <section style={{marginBottom:22}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:10,paddingBottom:5,borderBottom:"1px solid #ebebeb"}}>Agreement Terms</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {TERMS.map(t=>(
                    <div key={t.n} style={{display:"flex",gap:9,fontSize:11,lineHeight:1.6}}>
                      <span style={{fontWeight:700,color:"#0a0f1e",minWidth:16,flexShrink:0}}>{t.n}.</span>
                      <div><span style={{fontWeight:700,color:"#0a0f1e"}}>{t.t}: </span><span style={{color:"#555"}}>{t.b}</span></div>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:14,paddingBottom:5,borderBottom:"1px solid #ebebeb"}}>Signatures</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:14}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,marginBottom:5}}>Client: {info.name||"—"}</div>
                    <SigCanvas label="Client Signature" onSigned={setCSig}/>
                    <div style={{fontSize:10,color:"#888",marginTop:4}}>Date: {fmtDate(date)||new Date().toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,marginBottom:5}}>LDG Charters Representative</div>
                    <div style={{border:"1.5px solid #c9a84c",borderRadius:6,background:"#fff",padding:"8px 12px",height:90,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontStyle:"italic",color:"#222"}}>Lorenzo McKinnie</div></div>
                    <div style={{fontSize:10,color:"#888",marginTop:4}}>Lorenzo McKinnie · LDG Charters Representative</div>
                  </div>
                </div>
                <div style={{fontSize:10,color:"#aaa"}}>Guest list (up to 12) will be completed on day of charter.</div>
              </section>
            </div>
            {!cSig&&<div style={{textAlign:"center",color:"rgba(255,200,50,.8)",fontSize:13}}>↑ Please sign the agreement above to continue</div>}
            {cSig&&<div style={{textAlign:"center"}}><span style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(58,170,102,.12)",border:"1px solid rgba(58,170,102,.35)",borderRadius:8,padding:"10px 20px",color:"#3aaa66",fontSize:13}}>✓ Agreement signed — proceed to invoice</span></div>}
          </div>}

          {/* S7 */}
          {step===7&&<div className="fu">
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,6vw,44px)",fontWeight:400,marginBottom:6}}>Your <span style={{fontStyle:"italic",color:"#c9a84c"}}>Invoice</span></h2>
            <p style={{color:"rgba(255,255,255,.4)",marginBottom:24,fontSize:14}}>Agreement signed. Select your payment option to confirm your booking.</p>
            <div style={{background:"#fff",borderRadius:12,padding:"38px 32px",color:"#1a1a1a",maxWidth:660,margin:"0 auto 24px",boxShadow:"0 24px 80px rgba(0,0,0,.55)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:26,paddingBottom:20,borderBottom:"3px solid #0a0f1e"}}>
                <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,letterSpacing:2,color:"#0a0f1e"}}>LDG CHARTERS</div><div style={{fontSize:11,color:"#888",marginTop:3}}>3100 S. DuSable Lake Shore Drive, Chicago IL</div><div style={{fontSize:11,color:"#888"}}>708‑846‑3132</div></div>
                <div style={{textAlign:"right"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:"#c9a84c"}}>INVOICE</div><div style={{fontSize:11,color:"#888",marginTop:3}}>Issued: {new Date().toLocaleDateString()}</div><div style={{fontSize:11,color:"#888"}}>Charter: {fmtDate(date)}</div></div>
              </div>
              <div style={{marginBottom:20}}><div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:8}}>Bill To</div><div style={{fontSize:15,fontWeight:600,color:"#0a0f1e"}}>{info.name}</div><div style={{fontSize:13,color:"#666"}}>{info.email}</div><div style={{fontSize:13,color:"#666"}}>{info.phone}</div></div>
              <table style={{width:"100%",borderCollapse:"collapse",marginBottom:18}}>
                <thead><tr style={{background:"#0a0f1e"}}>{["Description","Qty","Rate","Amount"].map((h,i)=><th key={h} style={{padding:"8px 11px",textAlign:i===0?"left":i===3?"right":"center",color:"#fff",fontSize:10,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
                <tbody>
                  <tr style={{borderBottom:"1px solid #f0f0f0"}}><td style={{padding:12,fontSize:13}}><div style={{fontWeight:600}}>Boat Charter — {boat?.name}</div><div style={{fontSize:11,color:"#888",marginTop:2}}>{dest?.name} · {fmtDate(date)} · {time} – {endT}</div></td><td style={{padding:12,textAlign:"center",fontSize:13}}>{dur?.hours} hrs</td><td style={{padding:12,textAlign:"center",fontSize:13}}>$600.00</td><td style={{padding:12,textAlign:"right",fontSize:13,fontWeight:600}}>${total.toLocaleString()}.00</td></tr>
                  <tr style={{borderBottom:"1px solid #f0f0f0",background:"#fafafa"}}><td style={{padding:12,fontSize:13,color:"#999"}}>Captain Services</td><td style={{padding:12,textAlign:"center",color:"#999"}}>—</td><td style={{padding:12,textAlign:"center",color:"#999"}}>TBD</td><td style={{padding:12,textAlign:"right",color:"#999"}}>Arranged separately</td></tr>
                </tbody>
              </table>
              <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20}}>
                <div style={{width:260}}>
                  {[["Subtotal",`$${total.toLocaleString()}.00`],["Non-Refundable Deposit","($500.00)"],["Balance Due (48 hrs prior)",`$${balance.toLocaleString()}.00`]].map(([k,v],i)=>(
                    <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderTop:i===0?"none":"1px solid #f0f0f0",fontSize:i===2?14:12,fontWeight:i===2?700:400,color:i===2?"#0a0f1e":"#555"}}><span>{k}</span><span>{v}</span></div>
                  ))}
                  <div style={{marginTop:3,padding:"8px 0 0",borderTop:"2.5px solid #0a0f1e",display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:700,color:"#0a0f1e"}}><span>TOTAL</span><span>${total.toLocaleString()}.00</span></div>
                </div>
              </div>
              {!saved&&<>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:12}}>Select Payment Option</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                  <div onClick={()=>setPayOpt("deposit")} style={{border:payOpt==="deposit"?"2.5px solid #c9a84c":"1px solid #ddd",borderRadius:8,padding:14,cursor:"pointer",background:payOpt==="deposit"?"#fffbf0":"#fff",transition:"all .2s"}}>
                    <div style={{fontWeight:700,fontSize:14,color:"#0a0f1e",marginBottom:4}}>Pay Deposit</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"#c9a84c"}}>$500.00</div>
                    <div style={{fontSize:10,color:"#888",marginTop:3}}>Non-refundable · Secures your booking</div>
                  </div>
                  <div onClick={()=>setPayOpt("full")} style={{border:payOpt==="full"?"2.5px solid #0a0f1e":"1px solid #ddd",borderRadius:8,padding:14,cursor:"pointer",background:payOpt==="full"?"#f0f0f5":"#fff",transition:"all .2s"}}>
                    <div style={{fontWeight:700,fontSize:14,color:"#0a0f1e",marginBottom:4}}>Pay in Full</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"#0a0f1e"}}>${total.toLocaleString()}.00</div>
                    <div style={{fontSize:10,color:"#888",marginTop:3}}>Full payment · No remaining balance</div>
                  </div>
                </div>
                {saveErr&&<div style={{background:"rgba(255,80,80,.1)",border:"1px solid rgba(255,80,80,.3)",borderRadius:6,padding:"10px 14px",fontSize:13,color:"#ff5050",marginBottom:12}}>{saveErr}</div>}
                {payOpt&&<button onClick={()=>saveBooking(payOpt)} disabled={saving} style={{width:"100%",background:"#0a0f1e",color:"#fff",border:"none",padding:15,borderRadius:8,cursor:saving?"default":"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,letterSpacing:1.5,textTransform:"uppercase",opacity:saving?.7:1}}>
                  {saving?"Confirming your booking…":payOpt==="deposit"?"Confirm & Pay $500 Deposit →":`Confirm & Pay $${total.toLocaleString()} in Full →`}
                </button>}
              </>}
              {saved&&<div style={{background:"#f0fff5",border:"2px solid #3aaa66",borderRadius:10,padding:22,textAlign:"center"}}><div style={{fontSize:28,marginBottom:8}}>🎉</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:"#1a7a44",marginBottom:6}}>Booking Confirmed!</div><div style={{fontSize:13,color:"#2a5a34",lineHeight:1.65}}>Thank you, <strong>{info.name}</strong>! Your charter of <strong>{boat?.name}</strong> on <strong>{fmtDate(date)}</strong> is confirmed.<br/>A confirmation will be sent to <strong>{info.email}</strong>. Questions? Call <strong>708‑846‑3132</strong>.</div></div>}
              <div style={{marginTop:16,padding:12,background:"#f8f8f8",borderRadius:6,fontSize:10,color:"#999",lineHeight:1.65}}><strong>Note:</strong> Deposit non-refundable. Balance due 48 hrs prior. Captain arranged separately — call 708‑846‑3132.</div>
            </div>
            <div style={{textAlign:"center",marginTop:14}}><button onClick={reset} style={{background:"transparent",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.45)",padding:"9px 22px",borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12}}>← Return to Home</button></div>
          </div>}

          {/* Nav Buttons */}
          {step<7&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:40,paddingTop:20,borderTop:"1px solid rgba(255,255,255,.07)"}}>
            <button onClick={()=>step>1?setStep(step-1):reset()} style={{background:"transparent",border:"1px solid rgba(255,255,255,.18)",color:"rgba(255,255,255,.55)",padding:"11px 26px",borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13}}>← {step===1?"Back to Home":"Previous"}</button>
            {!canNext()&&<div style={{fontSize:12,color:"rgba(255,255,255,.28)",textAlign:"center",flex:1,padding:"0 14px"}}>Select an option to continue</div>}
            <button disabled={!canNext()} onClick={()=>setStep(step+1)} style={{background:canNext()?"#c9a84c":"rgba(255,255,255,.08)",color:canNext()?"#0a0f1e":"rgba(255,255,255,.18)",border:"none",padding:"11px 32px",borderRadius:6,cursor:canNext()?"pointer":"default",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",transition:"all .2s"}}>
              {step===6?"Proceed to Invoice →":"Continue →"}
            </button>
          </div>}
        </div>
      </div>
    </>
  );
}
