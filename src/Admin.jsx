import { useState, useRef, useEffect } from "react";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, query, orderBy, where, serverTimestamp } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { fmtDate, calcEnd, fmtCurrency, isTimeBlocked, G, CELEBRATIONS, DOCK_DURATIONS, DOCK_RATE, DEPOSIT, BUFFER_MINS, db, auth, Badge, SmartCal, TIMES } from './App';
// ── AT THE DOCK BOOKING ───────────────────────────────────────────────────────
export function AtTheDockPage({ onBack }) {
  const [step,setStep]=useState(1);
  const [celeb,setCeleb]=useState(null);
  const [dur,setDur]=useState(null);
  const [date,setDate]=useState(null);
  const [time,setTime]=useState(null);
  const [info,setInfo]=useState({name:"",email:"",phone:""});
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [err,setErr]=useState("");
  const [bookedSlots,setBookedSlots]=useState([]);

  const total = dur ? dur.hours * DOCK_RATE : 0;
  const endT  = calcEnd(time, dur?.hours);
  const STEPS = ["Celebration","Duration","Date & Time","Your Info","Confirm"];

  const canNext = () => {
    if(step===1)return!!celeb;
    if(step===2)return!!dur;
    if(step===3)return!!date&&!!time;
    if(step===4)return!!(info.name&&info.email&&info.phone);
    return true;
  };

  useEffect(()=>{
    if(!date) return;
    const load = async()=>{
      const q = query(collection(db,"dock_bookings"),where("eventDate","==",date),where("bookingStatus","!=","cancelled"));
      const snap = await getDocs(q);
      setBookedSlots(snap.docs.map(d=>d.data()));
    };
    load();
  },[date]);

  const timeBlocked = t => dur ? isTimeBlocked(t, dur.hours, bookedSlots) : false;

  const inp={width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.14)",borderRadius:8,padding:"12px 16px",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none"};

  const save = async () => {
    setSaving(true); setErr("");
    try {
      await addDoc(collection(db,"dock_bookings"),{
        type:"at_the_dock",clientName:info.name,clientEmail:info.email,clientPhone:info.phone,
        celebration:celeb.name,duration:dur.label,hours:dur.hours,
        eventDate:date,startTime:time,endTime:endT,totalPrice:total,
        bookingStatus:"pending",paymentStatus:"unpaid",createdAt:serverTimestamp(),
      });
      setSaved(true);
      // Email notification
      await fetch("https://api.emailjs.com/api/v1.0/email/send",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({service_id:"service_0se585c",template_id:"template_swbrijc",user_id:"jsEvKIVZ10ZQqt-4r",
          template_params:{customer_name:info.name,customer_email:info.email,customer_phone:info.phone,
            vessel:"At The Dock",charter_date:fmtDate(date),start_time:time,end_time:endT,
            duration:dur.label,destination:celeb.name,total_price:`$${total}`,balance:`$${total}`,payment_option:"At The Dock Reservation"}})
      });
    } catch(e){ setErr("Could not save. Please call 708-846-3132."); }
    setSaving(false);
  };

  return (
    <><style>{G}</style>
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#0a0f1e",color:"#fff",minHeight:"100vh"}}>
      <nav style={{position:"sticky",top:0,zIndex:200,background:"rgba(10,15,30,.95)",backdropFilter:"blur(18px)",borderBottom:"1px solid rgba(74,255,154,.15)",padding:"0 5%",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:"#4aff9a",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:600,letterSpacing:2}}>← LDG CHARTERS</button>
        <div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>At The Dock · Step {step}/{STEPS.length} — <span style={{color:"#4aff9a"}}>{STEPS[step-1]}</span></div>
      </nav>
      <div style={{height:3,background:"rgba(255,255,255,.07)"}}><div style={{height:"100%",width:`${(step/STEPS.length)*100}%`,background:"linear-gradient(90deg,#4aff9a,#c9a84c)",transition:"width .4s ease"}}/></div>

      {/* Photo banner */}
      <div style={{height:220,backgroundImage:`url(${P.group})`,backgroundSize:"cover",backgroundPosition:"center",position:"relative"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(10,15,30,.4),rgba(10,15,30,.85))"}}/>
        <div style={{position:"absolute",bottom:24,left:"5%"}}>
          <div style={{fontSize:10,letterSpacing:4,color:"#4aff9a",textTransform:"uppercase",marginBottom:6}}>Dockside Experience</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,5vw,44px)",fontWeight:300,color:"#fff"}}>At The <span style={{color:"#4aff9a",fontStyle:"italic"}}>Dock</span></h2>
        </div>
      </div>

      <div style={{maxWidth:860,margin:"0 auto",padding:"40px 5% 100px"}}>
        {step===1&&<div className="fu">
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:400,marginBottom:6}}>What Are You <span style={{fontStyle:"italic",color:"#4aff9a"}}>Celebrating?</span></h2>
          <p style={{color:"rgba(255,255,255,.4)",marginBottom:28,fontSize:14}}>Choose the vibe for your dockside experience.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14}}>
            {CELEBRATIONS.map(c=>(
              <div key={c.id} onClick={()=>setCeleb(c)} style={{padding:22,border:celeb?.id===c.id?"2px solid #4aff9a":"1px solid rgba(255,255,255,.1)",borderRadius:12,cursor:"pointer",background:celeb?.id===c.id?"rgba(74,255,154,.06)":"rgba(255,255,255,.02)",transition:"all .2s"}}>
                <div style={{fontSize:32,marginBottom:10}}>{c.icon}</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,fontWeight:600,marginBottom:5}}>{c.name}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.45)",lineHeight:1.65}}>{c.desc}</div>
                {celeb?.id===c.id&&<div style={{marginTop:8,fontSize:11,color:"#4aff9a",fontWeight:600}}>✓ Selected</div>}
              </div>
            ))}
          </div>
        </div>}

        {step===2&&<div className="fu">
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:400,marginBottom:6}}>How Long Is <span style={{fontStyle:"italic",color:"#4aff9a"}}>Your Event?</span></h2>
          <p style={{color:"rgba(255,255,255,.4)",marginBottom:28,fontSize:14}}>${DOCK_RATE} per hour · No deposit required · Dockside at 31st Street Harbor.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:520,marginBottom:24}}>
            {DOCK_DURATIONS.map(d=>(
              <div key={d.id} onClick={()=>setDur(d)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"15px 18px",border:dur?.id===d.id?"1.5px solid #4aff9a":"1px solid rgba(255,255,255,.1)",borderRadius:10,cursor:"pointer",background:dur?.id===d.id?"rgba(74,255,154,.07)":"rgba(255,255,255,.02)",transition:"all .2s"}}>
                <div><div style={{fontWeight:600,fontSize:15}}>{d.label}</div><div style={{fontSize:11,color:"rgba(255,255,255,.38)",marginTop:2}}>{d.sub}</div></div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:dur?.id===d.id?"#4aff9a":"rgba(255,255,255,.55)",fontWeight:600}}>${d.hours*DOCK_RATE}</div>
              </div>
            ))}
          </div>
          {dur&&<div style={{background:"rgba(74,255,154,.05)",border:"1px solid rgba(74,255,154,.25)",borderRadius:12,padding:"18px 22px",maxWidth:520}}>
            <div style={{fontSize:10,color:"#4aff9a",letterSpacing:3,textTransform:"uppercase",marginBottom:6}}>Your Price</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:40,fontWeight:600,color:"#4aff9a"}}>${total}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.38)",marginTop:4}}>{dur.hours} hr{dur.hours>1?"s":""} × ${DOCK_RATE}/hr · {celeb?.name}</div>
          </div>}
        </div>}

        {step===3&&<div className="fu">
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:400,marginBottom:6}}>Pick Your <span style={{fontStyle:"italic",color:"#4aff9a"}}>Date & Time</span></h2>
          <p style={{color:"rgba(255,255,255,.4)",marginBottom:28,fontSize:14}}>Dockside at 31st Street Harbor. Times are strict — please arrive on time.</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:20,alignItems:"flex-start",flexWrap:"wrap"}}>
            <SmartCal sel={date} onSel={setDate} bookedSlots={bookedSlots} hours={dur?.hours||1}/>
            <div>
              <div style={{fontSize:10,letterSpacing:2,color:"#4aff9a",textTransform:"uppercase",marginBottom:14}}>Start Time</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {TIMES.map(t=>{
                  const blocked = timeBlocked(t);
                  return <button key={t} disabled={blocked} onClick={()=>setTime(t)} style={{padding:11,border:time===t?"1.5px solid #4aff9a":blocked?"1px solid rgba(255,80,80,.2)":"1px solid rgba(255,255,255,.1)",borderRadius:8,background:time===t?"rgba(74,255,154,.1)":blocked?"rgba(255,80,80,.05)":"rgba(255,255,255,.02)",color:time===t?"#4aff9a":blocked?"rgba(255,80,80,.4)":"rgba(255,255,255,.65)",cursor:blocked?"not-allowed":"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:time===t?600:400,transition:"all .2s",position:"relative"}}>
                    {t}{blocked&&<span style={{display:"block",fontSize:8,color:"rgba(255,80,80,.5)"}}>Unavailable</span>}
                  </button>;
                })}
              </div>
              {date&&time&&!timeBlocked(time)&&<div style={{marginTop:18,background:"rgba(74,255,154,.07)",border:"1px solid rgba(74,255,154,.2)",borderRadius:10,padding:"14px 16px"}}>
                <div style={{fontSize:10,color:"#4aff9a",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Your Event Window</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:600}}>{fmtDate(date)}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,.55)",marginTop:3}}>{time} to {endT}</div>
                <div style={{fontSize:11,color:"rgba(255,80,80,.7)",marginTop:6,fontWeight:500}}>⏰ Charter times are strict. Please arrive on time.</div>
              </div>}
            </div>
          </div>
        </div>}

        {step===4&&<div className="fu">
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:400,marginBottom:6}}>Your <span style={{fontStyle:"italic",color:"#4aff9a"}}>Details</span></h2>
          <div style={{maxWidth:460,display:"flex",flexDirection:"column",gap:14,marginTop:20}}>
            {[["Full Name","name","text","Your full name"],["Email","email","email","your@email.com"],["Phone","phone","tel","708-000-0000"]].map(([lbl,f,t,ph])=>(
              <div key={f}><label style={{fontSize:11,color:"rgba(255,255,255,.45)",display:"block",marginBottom:5}}>{lbl}</label><input type={t} placeholder={ph} value={info[f]} onChange={e=>setInfo({...info,[f]:e.target.value})} style={inp}/></div>
            ))}
          </div>
        </div>}

        {step===5&&<div className="fu">
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:400,marginBottom:20}}>Confirm Your <span style={{fontStyle:"italic",color:"#4aff9a"}}>Reservation</span></h2>
          <div style={{background:"#fff",borderRadius:12,padding:"28px 24px",color:"#1a1a1a",maxWidth:500,boxShadow:"0 24px 80px rgba(0,0,0,.5)",marginBottom:20}}>
            <div style={{textAlign:"center",paddingBottom:14,marginBottom:14,borderBottom:"2px solid #0a0f1e"}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,letterSpacing:3,color:"#0a0f1e"}}>LDG CHARTERS</div>
              <div style={{fontSize:10,letterSpacing:3,color:"#888",textTransform:"uppercase",marginTop:3}}>At The Dock Reservation</div>
            </div>
            {[["Guest",info.name],["Email",info.email],["Phone",info.phone],["Celebration",celeb?.name],["Date",fmtDate(date)],["Time",`${time} to ${endT}`],["Duration",dur?.label],["Location","31st Street Harbor, Chicago IL"],["Total",`$${total}`]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f2f2f2",fontSize:13}}>
                <span style={{color:"#888"}}>{k}</span>
                <span style={{fontWeight:k==="Total"?700:500,color:k==="Total"?"#c9a84c":"#1a1a1a",fontSize:k==="Total"?17:13}}>{v}</span>
              </div>
            ))}
            <div style={{marginTop:14,padding:"10px 12px",background:"rgba(255,80,80,.06)",border:"1px solid rgba(255,80,80,.2)",borderRadius:6,fontSize:11,color:"#cc4444",lineHeight:1.6}}>
              ⏰ <strong>Reminder:</strong> Charter times are strict. Please arrive 15-20 minutes early. Late arrivals do not extend your reservation window.
            </div>
            {err&&<div style={{color:"#ff5050",fontSize:13,marginTop:10,padding:"8px 12px",background:"rgba(255,80,80,.08)",borderRadius:6}}>{err}</div>}
            {!saved&&<button onClick={save} disabled={saving} style={{width:"100%",background:"#0a0f1e",color:"#fff",border:"none",padding:14,borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,letterSpacing:1.5,textTransform:"uppercase",marginTop:18}}>{saving?"Confirming...":"Confirm Reservation"}</button>}
            {saved&&<div style={{background:"#f0fff5",border:"2px solid #3aaa66",borderRadius:10,padding:18,textAlign:"center",marginTop:14}}>
              <div style={{fontSize:22,marginBottom:6}}>🎉</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:"#1a7a44",marginBottom:5}}>Reservation Confirmed!</div>
              <div style={{fontSize:13,color:"#2a5a34",lineHeight:1.65}}>Thank you <strong>{info.name}</strong>! See you at the dock on <strong>{fmtDate(date)}</strong> at <strong>{time}</strong>.<br/>Questions? Call <strong>708-846-3132</strong>.</div>
            </div>}
          </div>
        </div>}

        {!saved&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:36,paddingTop:20,borderTop:"1px solid rgba(255,255,255,.07)"}}>
          <button onClick={()=>step>1?setStep(step-1):onBack()} style={{background:"transparent",border:"1px solid rgba(255,255,255,.18)",color:"rgba(255,255,255,.55)",padding:"11px 26px",borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13}}>Back</button>
          {step<5&&<button disabled={!canNext()} onClick={()=>setStep(step+1)} style={{background:canNext()?"#4aff9a":"rgba(255,255,255,.08)",color:canNext()?"#0a0f1e":"rgba(255,255,255,.18)",border:"none",padding:"11px 32px",borderRadius:6,cursor:canNext()?"pointer":"default",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",transition:"all .2s"}}>Continue</button>}
        </div>}
      </div>
    </div>
    </>
  );
}

// ── ADMIN LOGIN ───────────────────────────────────────────────────────────────
export function AdminLogin({ onLogin }) {
  const [email,setEmail]=useState(""); const [pass,setPass]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const inp={width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.15)",borderRadius:8,padding:"12px 16px",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",marginBottom:14};
  const handleLogin=async()=>{if(!email||!pass){setErr("Please enter email and password.");return;}setLoading(true);setErr("");try{await signInWithEmailAndPassword(auth,email,pass);onLogin();}catch(e){setErr("Invalid credentials.");}setLoading(false);};
  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#0a0f1e",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{G}</style>
      <div style={{width:"100%",maxWidth:400,padding:"0 24px"}}>
        <div style={{textAlign:"center",marginBottom:36}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:600,letterSpacing:3,color:"#fff",marginBottom:4}}>LDG <span style={{color:"#c9a84c"}}>CHARTERS</span></div><div style={{fontSize:12,color:"rgba(255,255,255,.35)",letterSpacing:2,textTransform:"uppercase"}}>Admin Dashboard</div></div>
        <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:32}}>
          <div style={{fontSize:18,fontFamily:"'Cormorant Garamond',serif",fontWeight:600,marginBottom:24,color:"#fff"}}>Sign In</div>
          <input type="email" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          <input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} style={inp} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          {err&&<div style={{fontSize:12,color:"#ff6b6b",marginBottom:12,padding:"8px 12px",background:"rgba(255,80,80,.1)",border:"1px solid rgba(255,80,80,.25)",borderRadius:6}}>{err}</div>}
          <button onClick={handleLogin} disabled={loading} style={{width:"100%",background:"#c9a84c",color:"#0a0f1e",border:"none",padding:14,borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,letterSpacing:1}}>{loading?"Signing in...":"Sign In"}</button>
        </div>
        <div style={{textAlign:"center",marginTop:20}}><button onClick={()=>window.location.hash=""} style={{background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>← Back to Website</button></div>
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [user,setUser]=useState(null); const [authed,setAuthed]=useState(false); const [checking,setChecking]=useState(true);
  const [bookings,setBookings]=useState([]); const [loading,setLoading]=useState(false); const [expanded,setExpanded]=useState(null);
  const [filter,setFilter]=useState("all"); const [search,setSearch]=useState(""); const [tab,setTab]=useState("charters");

  useEffect(()=>{const unsub=onAuthStateChanged(auth,u=>{setUser(u);setAuthed(!!u);setChecking(false);if(u)loadData("charters");});return unsub;},[]);
  useEffect(()=>{if(authed)loadData(tab);},[tab]);

  const loadData=async(t)=>{setLoading(true);try{const col=t==="dock"?"dock_bookings":"bookings";const q=query(collection(db,col),orderBy("createdAt","desc"));const snap=await getDocs(q);setBookings(snap.docs.map(d=>({id:d.id,...d.data()})));}catch(e){console.error(e);}setLoading(false);};
  const updateField=async(id,field,value)=>{try{const col=tab==="dock"?"dock_bookings":"bookings";await updateDoc(doc(db,col,id),{[field]:value});setBookings(prev=>prev.map(b=>b.id===id?{...b,[field]:value}:b));}catch(e){console.error(e);}};
  const handleLogout=async()=>{await signOut(auth);setAuthed(false);};

  if(checking)return <div style={{background:"#0a0f1e",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#c9a84c",fontFamily:"'DM Sans',sans-serif"}}>Loading...</div>;
  if(!authed)return <AdminLogin onLogin={()=>{setAuthed(true);loadData("charters");}}/>;

  const confirmed=bookings.filter(b=>b.bookingStatus==="confirmed").length;
  const pending=bookings.filter(b=>!b.bookingStatus||b.bookingStatus==="pending").length;
  const thisMonth=bookings.filter(b=>{if(!b.createdAt)return false;const d=b.createdAt.toDate?b.createdAt.toDate():new Date(b.createdAt);return d.getMonth()===new Date().getMonth()&&d.getFullYear()===new Date().getFullYear();}).length;
  const revenue=bookings.filter(b=>b.paymentStatus==="paid"||b.paymentStatus==="deposit_paid").reduce((s,b)=>s+(b.paymentStatus==="paid"?(b.totalPrice||0):500),0);
  const filtered=bookings.filter(b=>{const mf=filter==="all"||b.bookingStatus===filter||(filter==="pending"&&!b.bookingStatus);const q=search.toLowerCase();const ms=!q||(b.clientName||"").toLowerCase().includes(q)||(b.vessel||"").toLowerCase().includes(q)||(b.celebration||"").toLowerCase().includes(q);return mf&&ms;});

  return(
    <><style>{G}{`.arow:hover{background:rgba(255,255,255,.03)!important;cursor:pointer;}`}</style>
    <div style={{fontFamily:"'DM Sans',sans-serif",display:"flex",height:"100vh",background:"#070c18",color:"#fff",overflow:"hidden"}}>
      <div style={{width:220,background:"#0a0f1e",borderRight:"1px solid rgba(255,255,255,.07)",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"28px 20px 20px"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600,letterSpacing:2}}>LDG <span style={{color:"#c9a84c"}}>ADMIN</span></div><div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:3}}>Charter Management</div></div>
        <div style={{flex:1,padding:"0 12px"}}>
          {[["📋","Charter Bookings","charters"],["⚓","At The Dock","dock"],["💰","Revenue","revenue"],["⚙️","Settings","settings"]].map(([icon,label,id])=>(
            <div key={id} onClick={()=>setTab(id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,background:tab===id?"rgba(201,168,76,.1)":"transparent",color:tab===id?"#c9a84c":"rgba(255,255,255,.5)",fontSize:13,cursor:"pointer",marginBottom:2}}><span>{icon}</span>{label}</div>
          ))}
        </div>
        <div style={{padding:20,borderTop:"1px solid rgba(255,255,255,.07)"}}><div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:6}}>{user?.email}</div><button onClick={handleLogout} style={{background:"transparent",border:"1px solid rgba(255,255,255,.15)",color:"rgba(255,255,255,.5)",padding:"7px 14px",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:"inherit",width:"100%"}}>Sign Out</button></div>
      </div>

      <div style={{flex:1,overflow:"auto"}}>
        <div style={{padding:"24px 32px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0a0f1e",position:"sticky",top:0,zIndex:10}}>
          <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:600}}>{tab==="dock"?"At The Dock":tab==="revenue"?"Revenue":"Charter Bookings"}</div><div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginTop:2}}>{bookings.length} total reservations</div></div>
          <button onClick={()=>loadData(tab)} style={{background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.3)",color:"#c9a84c",padding:"8px 18px",borderRadius:8,cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:500}}>↻ Refresh</button>
        </div>

        <div style={{padding:32}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}}>
            {[["Total",bookings.length,"#c9a84c","rgba(201,168,76,.08)"],["This Month",thisMonth,"#4a9eff","rgba(74,158,255,.08)"],["Pending",pending,"#ffc832","rgba(255,190,50,.08)"],["Confirmed",confirmed,"#3aaa66","rgba(58,170,102,.08)"]].map(([label,val,color,bg])=>(
              <div key={label} style={{background:bg,border:`1px solid ${color}33`,borderRadius:12,padding:"18px 20px"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:600,color,lineHeight:1}}>{val}</div><div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:4}}>{label}</div></div>
            ))}
          </div>

          <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
            <input placeholder="Search by name, vessel..." value={search} onChange={e=>setSearch(e.target.value)} style={{background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,padding:"9px 14px",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,width:220,outline:"none"}}/>
            <div style={{display:"flex",gap:6}}>
              {["all","pending","confirmed","cancelled","completed"].map(f=>(
                <button key={f} onClick={()=>setFilter(f)} style={{padding:"7px 14px",borderRadius:20,border:"1px solid",borderColor:filter===f?"#c9a84c":"rgba(255,255,255,.15)",background:filter===f?"rgba(201,168,76,.12)":"transparent",color:filter===f?"#c9a84c":"rgba(255,255,255,.45)",cursor:"pointer",fontSize:12,fontFamily:"inherit",textTransform:"capitalize"}}>{f}</button>
              ))}
            </div>
          </div>

          <div style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,overflow:"hidden"}}>
            {loading?<div style={{padding:60,textAlign:"center",color:"rgba(255,255,255,.35)"}}>Loading...</div>:filtered.length===0?<div style={{padding:60,textAlign:"center",color:"rgba(255,255,255,.25)"}}>No bookings yet.</div>:(
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:"rgba(255,255,255,.04)",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
                  {["Client","Details","Date / Time","Amount","Payment","Status","Actions"].map(h=><th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:10,color:"rgba(255,255,255,.4)",fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {filtered.map(b=>(
                    <React.Fragment key={b.id}>
                      <tr className="arow" onClick={()=>setExpanded(expanded===b.id?null:b.id)} style={{borderBottom:"1px solid rgba(255,255,255,.05)",transition:"background .15s"}}>
                        <td style={{padding:"14px 16px"}}><div style={{fontWeight:600,fontSize:14}}>{b.clientName}</div><div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>{b.clientEmail}</div></td>
                        <td style={{padding:"14px 16px",fontSize:13,color:"rgba(255,255,255,.7)"}}>{tab==="dock"?b.celebration:`${b.vessel||""}`}<div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:1}}>{b.duration||b.celebration}</div></td>
                        <td style={{padding:"14px 16px"}}><div style={{fontSize:13}}>{fmtDate(tab==="dock"?b.eventDate:b.charterDate)}</div><div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:1}}>{b.startTime} – {b.endTime}</div></td>
                        <td style={{padding:"14px 16px"}}><div style={{fontSize:14,fontWeight:600,color:"#c9a84c"}}>{fmtCurrency(b.totalPrice)}</div><div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:1}}>{b.paymentOption==="full"?"Full":"Deposit"}</div></td>
                        <td style={{padding:"14px 16px"}}>
                          <select value={b.paymentStatus||"unpaid"} onClick={e=>e.stopPropagation()} onChange={e=>updateField(b.id,"paymentStatus",e.target.value)} style={{background:"#0d1b2a",border:"1px solid rgba(255,255,255,.15)",color:"#fff",padding:"5px 8px",borderRadius:6,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
                            <option value="unpaid">Unpaid</option><option value="deposit_paid">Deposit Paid</option><option value="paid">Paid Full</option><option value="refunded">Refunded</option>
                          </select>
                        </td>
                        <td style={{padding:"14px 16px"}}>
                          <select value={b.bookingStatus||"pending"} onClick={e=>e.stopPropagation()} onChange={e=>updateField(b.id,"bookingStatus",e.target.value)} style={{background:"#0d1b2a",border:"1px solid rgba(255,255,255,.15)",color:"#fff",padding:"5px 8px",borderRadius:6,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
                            <option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option>
                          </select>
                        </td>
                        <td style={{padding:"14px 16px"}}>
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            <button onClick={e=>{e.stopPropagation();generatePDF(b);}} style={{background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.3)",color:"#c9a84c",padding:"5px 10px",borderRadius:5,cursor:"pointer",fontSize:11,fontFamily:"inherit",whiteSpace:"nowrap"}}>📄 PDF</button>
                            <span style={{color:"rgba(255,255,255,.3)",fontSize:18,cursor:"pointer"}}>{expanded===b.id?"▲":"▼"}</span>
                          </div>
                        </td>
                      </tr>
                      {expanded===b.id&&(
                        <tr style={{background:"rgba(201,168,76,.03)",borderBottom:"2px solid rgba(201,168,76,.15)"}}>
                          <td colSpan={7} style={{padding:"22px 28px"}}>
                            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:20}}>
                              <div><div style={{fontSize:10,letterSpacing:2,color:"#c9a84c",textTransform:"uppercase",marginBottom:9}}>Client</div>{[["Name",b.clientName],["Email",b.clientEmail],["Phone",b.clientPhone],["Host",b.hostName||"—"]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}><span style={{color:"rgba(255,255,255,.4)"}}>{k}</span><span>{v}</span></div>)}</div>
                              <div><div style={{fontSize:10,letterSpacing:2,color:"#c9a84c",textTransform:"uppercase",marginBottom:9}}>Booking</div>
                                {(tab==="dock"?[["Celebration",b.celebration],["Date",fmtDate(b.eventDate)],["Time",`${b.startTime} – ${b.endTime}`],["Duration",b.duration]]:[["Vessel",b.vessel],["Date",fmtDate(b.charterDate)],["Time",`${b.startTime} – ${b.endTime}`],["Destination",b.destination],["Duration",b.duration]]).map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}><span style={{color:"rgba(255,255,255,.4)"}}>{k}</span><span>{v}</span></div>)}
                              </div>
                              <div><div style={{fontSize:10,letterSpacing:2,color:"#c9a84c",textTransform:"uppercase",marginBottom:9}}>Financials</div>
                                {[["Charter Fee",fmtCurrency(b.totalPrice)],["Deposit","$500.00"],["Balance",fmtCurrency(b.balance||0)]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}><span style={{color:"rgba(255,255,255,.4)"}}>{k}</span><span style={{color:k==="Charter Fee"?"#c9a84c":"#fff"}}>{v}</span></div>)}
                                <div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}><Badge status={b.paymentStatus||"unpaid"}/><Badge status={b.bookingStatus||"pending"}/></div>
                              </div>
                              {b.clientSignature&&<div><div style={{fontSize:10,letterSpacing:2,color:"#c9a84c",textTransform:"uppercase",marginBottom:9}}>Signature</div><div style={{background:"#fff",borderRadius:6,padding:6,display:"inline-block",border:"1px solid rgba(201,168,76,.3)"}}><img src={b.clientSignature} alt="sig" style={{width:180,height:"auto",display:"block"}}/></div></div>}
                            </div>
                            <div style={{marginTop:14,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",gap:12,alignItems:"flex-start",flexWrap:"wrap"}}>
                              <div style={{flex:1}}>
                                <div style={{fontSize:10,letterSpacing:2,color:"#c9a84c",textTransform:"uppercase",marginBottom:6}}>Admin Notes</div>
                                <textarea defaultValue={b.adminNotes||""} onBlur={e=>updateField(b.id,"adminNotes",e.target.value)} placeholder="Add notes..." style={{width:"100%",maxWidth:500,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"10px 14px",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:13,resize:"vertical",minHeight:60,outline:"none"}}/>
                              </div>
                              <button onClick={()=>generatePDF(b)} style={{background:"#c9a84c",color:"#0a0f1e",border:"none",padding:"10px 20px",borderRadius:8,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,letterSpacing:1,marginTop:20,whiteSpace:"nowrap"}}>📄 Download Agreement PDF</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

// ── BLOG PAGE ─────────────────────────────────────────────────────────────────