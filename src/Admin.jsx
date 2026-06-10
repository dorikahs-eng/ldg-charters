import React, { useState, useEffect, useRef } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from "firebase/firestore";
import { db, auth, fmtDate, fmtCurrency, G, Badge, generatePDF } from './App';

// Generate Google Calendar event link for a booking
function makeGCalLink(b) {
  const isCharter = !!b.charterDate;
  const dateStr = isCharter ? b.charterDate : b.eventDate;
  const [y,mo,d] = dateStr.split('-').map(Number);
  
  const parseTime = t => {
    if(!t) return null;
    const [time, period] = t.split(' ');
    let [h, m] = time.split(':').map(Number);
    if(period==='PM' && h!==12) h+=12;
    if(period==='AM' && h===12) h=0;
    return {h, m};
  };

  const start = parseTime(b.startTime);
  const end   = parseTime(b.endTime);
  if(!start||!end) return null;

  const fmt = (y,mo,d,h,m) =>
    `${y}${String(mo).padStart(2,'0')}${String(d).padStart(2,'0')}T${String(h).padStart(2,'0')}${String(m).padStart(2,'0')}00`;

  const startStr = fmt(y,mo,d,start.h,start.m);
  const endStr   = fmt(y,mo,d,end.h,end.m);

  const title = isCharter
    ? `LDG Charter - ${b.vessel} - ${b.clientName}`
    : `LDG Dock - ${b.celebration} - ${b.clientName}`;

  const details = isCharter
    ? `Guest: ${b.clientName}\nPhone: ${b.clientPhone}\nEmail: ${b.clientEmail}\nVessel: ${b.vessel}\nDestination: ${b.destination}\nDuration: ${b.duration}\nTotal: $${b.totalPrice}\nPayment: ${b.paymentStatus}`
    : `Guest: ${b.clientName}\nPhone: ${b.clientPhone}\nEmail: ${b.clientEmail}\nCelebration: ${b.celebration}\nDuration: ${b.duration}\nDeposit: $${b.depositAmount||50}`;

  const location = 'D-Dock, 31st Street Harbor, 3100 S Lake Shore Drive, Chicago IL';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`,
    details,
    location,
    add: 'charterldg@gmail.com',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}


const GCAL_CLIENT_ID = import.meta.env.VITE_GCAL_CLIENT_ID || "103047972244-gdr54qmo74v4tlm9rt3k4o8rsn7pjm27.apps.googleusercontent.com";
const GCAL_SCOPE = "https://www.googleapis.com/auth/calendar.events";
const GCAL_CALENDAR_ID = "charterldg@gmail.com";

// Load Google Identity Services script dynamically
function loadGISScript() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

// Build Google Calendar event object from booking
function buildCalendarEvent(b) {
  const isCharter = !!b.charterDate;
  const dateStr   = isCharter ? b.charterDate : b.eventDate;
  const [y,mo,d]  = dateStr.split("-").map(Number);

  const parseTime = t => {
    if (!t) return null;
    const [time, period] = t.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return { h, m };
  };

  const start = parseTime(b.startTime);
  const end   = parseTime(b.endTime);

  if(!start || !end) {
    throw new Error("Booking is missing a valid start or end time.");
  }

  const pad = n => String(n).padStart(2, "0");
  const startISO = `${y}-${pad(mo)}-${pad(d)}T${pad(start.h)}:${pad(start.m)}:00`;
  const endISO   = `${y}-${pad(mo)}-${pad(d)}T${pad(end.h)}:${pad(end.m)}:00`;

  const title = isCharter
    ? `LDG Charter - ${b.vessel} - ${b.clientName}`
    : `LDG At The Dock - ${b.celebration} - ${b.clientName}`;

  const notes = isCharter
    ? `GUEST: ${b.clientName}\nPHONE: ${b.clientPhone}\nEMAIL: ${b.clientEmail}\nVESSEL: ${b.vessel}\nDESTINATION: ${b.destination}\nDURATION: ${b.duration}\nTOTAL: $${b.totalPrice}\nPAYMENT: ${b.paymentStatus}`
    : `GUEST: ${b.clientName}\nPHONE: ${b.clientPhone}\nEMAIL: ${b.clientEmail}\nCELEBRATION: ${b.celebration}\nDURATION: ${b.duration}\nDEPOSIT: $${b.depositAmount || 50}`;

  return {
    summary: title,
    location: "D-Dock, 31st Street Harbor, 3100 S Lake Shore Drive, Chicago IL 60616",
    description: notes,
    start: { dateTime: startISO, timeZone: "America/Chicago" },
    end:   { dateTime: endISO,   timeZone: "America/Chicago" },
    attendees: [{ email: GCAL_CALENDAR_ID }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email",  minutes: 1440 }, // 24hr
        { method: "popup",  minutes: 60 },
      ],
    },
  };
}


export function AdminLogin({ onLogin }) {
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const handleLogin=async()=>{
    if(!email||!pass){setErr("Please enter email and password.");return;}
    setLoading(true);setErr("");
    try{await signInWithEmailAndPassword(auth,email,pass);onLogin();}
    catch(e){setErr("Invalid credentials.");}
    setLoading(false);
  };
  return(
    <div style={{fontFamily:"DM Sans,sans-serif",background:"#0a0f1e",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
      <div style={{width:"100%",maxWidth:400,padding:"0 24px"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:24,fontWeight:700,color:"#c9a84c",marginBottom:4}}>LDG CHARTERS</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.4)"}}>Admin Dashboard</div>
        </div>
        <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:32}}>
          <input type="email" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)}
            style={{width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.15)",borderRadius:8,padding:"12px 16px",color:"#fff",fontFamily:"inherit",fontSize:14,outline:"none",marginBottom:14}}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          <input type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)}
            style={{width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.15)",borderRadius:8,padding:"12px 16px",color:"#fff",fontFamily:"inherit",fontSize:14,outline:"none",marginBottom:14}}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
          {err&&<div style={{color:"#ff6b6b",fontSize:12,marginBottom:12,padding:"8px 12px",background:"rgba(255,80,80,.1)",borderRadius:6}}>{err}</div>}
          <button onClick={handleLogin} disabled={loading}
            style={{width:"100%",background:"#c9a84c",color:"#0a0f1e",border:"none",padding:14,borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:600}}>
            {loading?"Signing in...":"Sign In"}
          </button>
        </div>
        <div style={{textAlign:"center",marginTop:20}}>
          <button onClick={()=>window.location.hash=""} style={{background:"none",border:"none",color:"rgba(255,255,255,.3)",cursor:"pointer",fontSize:12}}>Back to Website</button>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [user,setUser]=useState(null);
  const [authed,setAuthed]=useState(false);
  const [checking,setChecking]=useState(true);
  const [bookings,setBookings]=useState([]);
  const [loading,setLoading]=useState(false);
  const [tab,setTab]=useState("charters");
  const [error,setError]=useState(null);
  const [gcalToken,setGcalToken]=useState(null);
  const [gcalLoading,setGcalLoading]=useState(false);
  const [gcalMsg,setGcalMsg]=useState("");
  const tokenClientRef=useRef(null);

  useEffect(()=>{
    try {
      const unsub=onAuthStateChanged(auth,u=>{
        setUser(u);setAuthed(!!u);setChecking(false);
        if(u) loadData("charters");
      });
      return unsub;
    } catch(e){
      setError(e.message);
      setChecking(false);
    }
  },[]);

  useEffect(()=>{if(authed)loadData(tab);},[tab]);

  const loadData=async(t)=>{
    setLoading(true);
    try{
      const col=t==="dock"?"dock_bookings":"bookings";
      const q=query(collection(db,col),orderBy("createdAt","desc"));
      const snap=await getDocs(q);
      setBookings(snap.docs.map(d=>({id:d.id,...d.data()})));
    }catch(e){setError(e.message);}
    setLoading(false);
  };

  const updateField=async(id,field,value)=>{
    try{
      const col=tab==="dock"?"dock_bookings":"bookings";
      await updateDoc(doc(db,col,id),{[field]:value});
      setBookings(prev=>prev.map(b=>b.id===id?{...b,[field]:value}:b));
    }catch(e){console.error(e);}
  };

    const authorizeGCal = async () => {
    setGcalLoading(true);
    setGcalMsg("");
    try {
      await loadGISScript();
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GCAL_CLIENT_ID,
        scope: GCAL_SCOPE,
        hint: "charterldg@gmail.com",
        callback: (resp) => {
          if(resp?.error){ setGcalMsg("Auth failed: "+resp.error); setGcalLoading(false); return; }
          if(!resp?.access_token){ setGcalMsg("No access token returned."); setGcalLoading(false); return; }
          setGcalToken(resp.access_token);
          setGcalMsg("Google Calendar connected");
          setGcalLoading(false);
          setTimeout(()=>setGcalMsg(""),3000);
        },
      });
      tokenClientRef.current.requestAccessToken({
        prompt: "select_account consent",
        hint: "charterldg@gmail.com",
      });
    } catch(e) {
      setGcalMsg("Auth error: "+(e?.message||String(e)));
      setGcalLoading(false);
    }
  };

  const addToGCal = async (b) => {
    if(!gcalToken){
      const link = makeGCalLink(b);
      if(link) window.open(link,"_blank","noopener,noreferrer");
      return;
    }
    setGcalLoading(true);
    setGcalMsg("Adding to calendar...");
    try {
      const event = buildCalendarEvent(b);
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GCAL_CALENDAR_ID)}/events`,
        {method:"POST",headers:{Authorization:`Bearer ${gcalToken}`,"Content-Type":"application/json"},body:JSON.stringify(event)}
      );
      if(!res.ok){
        const body = await res.text();
        throw new Error(body||`Calendar API error ${res.status}`);
      }
      setGcalMsg("Added to Google Calendar!");
      setTimeout(()=>setGcalMsg(""),4000);
    } catch(e) {
      setGcalMsg("Error: "+(e?.message||String(e)));
    }
    setGcalLoading(false);
  };

    const handleLogout=async()=>{await signOut(auth);setAuthed(false);};

  if(checking)return(
    <div style={{background:"#0a0f1e",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#c9a84c",fontFamily:"sans-serif",fontSize:18}}>
      Loading...
    </div>
  );

  if(error)return(
    <div style={{background:"#0a0f1e",minHeight:"100vh",padding:40,color:"#ff5050",fontFamily:"monospace",fontSize:13}}>
      <div style={{color:"#c9a84c",fontSize:18,marginBottom:16,fontFamily:"sans-serif"}}>Admin Error:</div>
      {error}
    </div>
  );

  if(!authed)return <AdminLogin onLogin={()=>{setAuthed(true);loadData("charters");}}/>;

  return(
    <div style={{fontFamily:"DM Sans,sans-serif",background:"#070c18",color:"#fff",minHeight:"100vh",padding:24}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,paddingBottom:16,borderBottom:"1px solid rgba(255,255,255,.1)"}}>
        <div style={{fontSize:22,fontWeight:700,color:"#c9a84c"}}>LDG CHARTERS ADMIN</div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>{user?.email}</span>
          <button onClick={handleLogout} style={{background:"transparent",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.6)",padding:"6px 14px",borderRadius:6,cursor:"pointer",fontSize:12}}>Sign Out</button>
        </div>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[["Charter Bookings","charters"],["At The Dock","dock"]].map(([l,id])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:"8px 18px",borderRadius:20,border:"1px solid",borderColor:tab===id?"#c9a84c":"rgba(255,255,255,.15)",background:tab===id?"rgba(201,168,76,.12)":"transparent",color:tab===id?"#c9a84c":"rgba(255,255,255,.45)",cursor:"pointer",fontSize:13}}>{l}</button>
        ))}
        <button onClick={()=>loadData(tab)} style={{marginLeft:"auto",background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.3)",color:"#c9a84c",padding:"8px 16px",borderRadius:8,cursor:"pointer",fontSize:13}}>Refresh</button>
        {!gcalToken&&<button onClick={authorizeGCal} style={{background:"rgba(74,158,255,.1)",border:"1px solid rgba(74,158,255,.3)",color:"#4a9eff",padding:"8px 16px",borderRadius:8,cursor:"pointer",fontSize:13}}>Connect Google Calendar</button>}
        {gcalToken&&<span style={{fontSize:12,color:"#3aaa66",padding:"8px 12px",background:"rgba(58,170,102,.1)",border:"1px solid rgba(58,170,102,.3)",borderRadius:8}}>Google Calendar Connected</span>}
        {gcalMsg&&<span style={{fontSize:12,color:"#c9a84c",padding:"8px 12px"}}>{gcalMsg}</span>}
      </div>

      {loading&&<div style={{color:"rgba(255,255,255,.4)",padding:40,textAlign:"center"}}>Loading bookings...</div>}

      {!loading&&bookings.length===0&&<div style={{color:"rgba(255,255,255,.25)",padding:60,textAlign:"center",fontSize:16}}>No bookings yet.</div>}

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {bookings.map(b=>(
          <div key={b.id} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,padding:"16px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontWeight:600,fontSize:15}}>{b.clientName}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.45)",marginTop:3}}>{b.clientEmail} - {b.clientPhone}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,.6)",marginTop:6}}>{b.vessel||b.celebration} - {fmtDate(b.charterDate||b.eventDate)} - {b.startTime}–{b.endTime}</div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                <Badge status={b.paymentStatus||"unpaid"}/>
                <Badge status={b.bookingStatus||"pending"}/>
                <select value={b.paymentStatus||"unpaid"} onChange={e=>updateField(b.id,"paymentStatus",e.target.value)}
                  style={{background:"#0d1b2a",border:"1px solid rgba(255,255,255,.15)",color:"#fff",padding:"5px 8px",borderRadius:6,fontSize:11,cursor:"pointer"}}>
                  <option value="unpaid">Unpaid</option>
                  <option value="zelle_pending">Zelle Pending</option>
                  <option value="deposit_paid">Deposit Paid</option>
                  <option value="paid">Paid Full</option>
                  <option value="refunded">Refunded</option>
                </select>
                <select value={b.bookingStatus||"pending"} onChange={e=>updateField(b.id,"bookingStatus",e.target.value)}
                  style={{background:"#0d1b2a",border:"1px solid rgba(255,255,255,.15)",color:"#fff",padding:"5px 8px",borderRadius:6,fontSize:11,cursor:"pointer"}}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
                <button onClick={()=>generatePDF(b)} style={{background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.3)",color:"#c9a84c",padding:"5px 12px",borderRadius:5,cursor:"pointer",fontSize:11}}>PDF</button>
                <button onClick={()=>addToGCal(b)} disabled={gcalLoading} style={{background:"rgba(74,158,255,.1)",border:"1px solid rgba(74,158,255,.3)",color:"#4a9eff",padding:"5px 12px",borderRadius:5,cursor:"pointer",fontSize:11}}>📅 {gcalToken?"Add to Calendar":"Connect Calendar"}</button>
              </div>
            </div>
            <div style={{marginTop:10,fontSize:13,color:"#c9a84c",fontWeight:600}}>{fmtCurrency(b.totalPrice||0)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
