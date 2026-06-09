import { useState, useRef, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from "firebase/firestore";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { fmtDate, calcEnd, fmtCurrency, G, DEPOSIT, BUFFER_MINS, db, auth, Badge, generatePDF } from './App';
// ── AT THE DOCK BOOKING ───────────────────────────────────────────────────────

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
  const [crashError,setCrashError]=useState(null);
  const [user,setUser]=useState(null); const [authed,setAuthed]=useState(false); const [checking,setChecking]=useState(true);
  const [bookings,setBookings]=useState([]); const [loading,setLoading]=useState(false); const [expanded,setExpanded]=useState(null);
  const [filter,setFilter]=useState("all"); const [search,setSearch]=useState(""); const [tab,setTab]=useState("charters");

  useEffect(()=>{
    try {
      const unsub=onAuthStateChanged(auth,u=>{setUser(u);setAuthed(!!u);setChecking(false);if(u)loadData("charters");});
      return unsub;
    } catch(e) {
      setCrashError("useEffect error: " + e.message + "\n\nStack: " + e.stack);
      setChecking(false);
    }
  },[]);
  useEffect(()=>{if(authed)loadData(tab);},[tab]);

  const loadData=async(t)=>{setLoading(true);try{const col=t==="dock"?"dock_bookings":"bookings";const q=query(collection(db,col),orderBy("createdAt","desc"));const snap=await getDocs(q);setBookings(snap.docs.map(d=>({id:d.id,...d.data()})));}catch(e){console.error("loadData error:",e);setCrashError("loadData error: "+e.message);}setLoading(false);};
  const updateField=async(id,field,value)=>{try{const col=tab==="dock"?"dock_bookings":"bookings";await updateDoc(doc(db,col,id),{[field]:value});setBookings(prev=>prev.map(b=>b.id===id?{...b,[field]:value}:b));}catch(e){console.error(e);}};
  const handleLogout=async()=>{await signOut(auth);setAuthed(false);};

  const sendReminder=async(b)=>{
    const isCharter = tab !== "dock";
    const params={
      customer_name: b.clientName,
      customer_email: b.clientEmail,
      customer_phone: b.clientPhone,
      vessel: b.vessel || "At The Dock",
      charter_date: fmtDate(isCharter ? b.charterDate : b.eventDate),
      start_time: b.startTime,
      end_time: b.endTime,
      duration: b.duration,
      destination: b.destination || b.celebration || "",
      total_price: fmtCurrency(b.totalPrice),
      balance: fmtCurrency(b.balance || 0),
      payment_option: b.paymentOption || "deposit",
      reminder_type: "48_hour",
    };
    try{
      await fetch("https://api.emailjs.com/api/v1.0/email/send",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          service_id:"service_0se585c",
          template_id:"template_t4td6qc",
          user_id:"jsEvKIVZ10ZQqt-4r",
          template_params:{
            ...params,
            subject_override:`REMINDER: Your LDG Charter is in 48 hours - ${fmtDate(isCharter?b.charterDate:b.eventDate)}`,
            message_type:"reminder",
          }
        })
      });
      alert("Reminder sent to " + b.clientEmail);
    }catch(e){
      alert("Failed to send reminder. Check connection.");
    }
  };

  const sendThankYou=async(b)=>{
    try{
      await fetch("https://api.emailjs.com/api/v1.0/email/send",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          service_id:"service_0se585c",
          template_id:"template_t4td6qc",
          user_id:"jsEvKIVZ10ZQqt-4r",
          template_params:{
            customer_name: b.clientName,
            customer_email: b.clientEmail,
            vessel: b.vessel || "At The Dock",
            charter_date: fmtDate(b.charterDate||b.eventDate),
            subject_override:`Thank you for sailing with LDG Charters!`,
            message_type:"thank_you",
            total_price: fmtCurrency(b.totalPrice),
          }
        })
      });
      alert("Thank you email sent to " + b.clientEmail);
    }catch(e){
      alert("Failed to send email.");
    }
  };

  if(crashError)return <div style={{background:"#0a0f1e",minHeight:"100vh",padding:40,color:"#ff5050",fontFamily:"monospace",fontSize:13,whiteSpace:"pre-wrap"}}><div style={{color:"#c9a84c",fontSize:18,marginBottom:16,fontFamily:"sans-serif"}}>Admin Error — Copy this and send to support:</div>{String(crashError)}</div>;
  if(checking)return <div style={{background:"#0a0f1e",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#c9a84c",fontFamily:"'DM Sans',sans-serif"}}>Loading...</div>;
  if(!authed)return <AdminLogin onLogin={()=>{setAuthed(true);loadData("charters");}}/>;

  const confirmed=bookings.filter(b=>b.bookingStatus==="confirmed").length;
  const pending=bookings.filter(b=>!b.bookingStatus||b.bookingStatus==="pending").length;
  const thisMonth=bookings.filter(b=>{if(!b.createdAt)return false;const d=b.createdAt.toDate?b.createdAt.toDate():new Date(b.createdAt);return d.getMonth()===new Date().getMonth()&&d.getFullYear()===new Date().getFullYear();}).length;
  const revenue=bookings.filter(b=>b.paymentStatus==="paid"||b.paymentStatus==="deposit_paid").reduce((s,b)=>s+(b.paymentStatus==="paid"?(b.totalPrice||0):500),0);
  const filtered=bookings.filter(b=>{const mf=filter==="all"||b.bookingStatus===filter||(filter==="pending"&&!b.bookingStatus);const q=search.toLowerCase();const ms=!q||(b.clientName||"").toLowerCase().includes(q)||(b.vessel||"").toLowerCase().includes(q)||(b.celebration||"").toLowerCase().includes(q);return mf&&ms;});

  const TABS = [["📋","Charters","charters"],["⚓","Dock","dock"],["💰","Revenue","revenue"]];

  return(
    <><style>{G}{`
      .arow:hover{background:rgba(255,255,255,.03)!important;cursor:pointer;}
      .admin-wrap{display:flex;height:100vh;background:#070c18;color:#fff;overflow:hidden;font-family:'DM Sans',sans-serif;}
      .admin-sidebar{width:220px;background:#0a0f1e;border-right:1px solid rgba(255,255,255,.07);display:flex;flex-direction:column;flex-shrink:0;}
      .admin-main{flex:1;overflow:auto;display:flex;flex-direction:column;}
      .admin-bottom-nav{display:none;}
      @media(max-width:700px){
        .admin-sidebar{display:none;}
        .admin-bottom-nav{display:flex;position:fixed;bottom:0;left:0;right:0;z-index:100;background:#0a0f1e;border-top:1px solid rgba(255,255,255,.1);padding:6px 0 10px;}
        .admin-main{padding-bottom:70px;}
        .admin-wrap{overflow:auto;height:100%;}
      }
    `}</style>
    <div className="admin-wrap">
      <div className="admin-sidebar">
        <div style={{padding:"28px 20px 20px"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600,letterSpacing:2}}>LDG <span style={{color:"#c9a84c"}}>ADMIN</span></div><div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:3}}>Charter Management</div></div>
        <div style={{flex:1,padding:"0 12px"}}>
          {[["📋","Charter Bookings","charters"],["⚓","At The Dock","dock"],["💰","Revenue","revenue"],["⚙️","Settings","settings"]].map(([icon,label,id])=>(
            <div key={id} onClick={()=>setTab(id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,background:tab===id?"rgba(201,168,76,.1)":"transparent",color:tab===id?"#c9a84c":"rgba(255,255,255,.5)",fontSize:13,cursor:"pointer",marginBottom:2}}><span>{icon}</span>{label}</div>
          ))}
        </div>
        <div style={{padding:20,borderTop:"1px solid rgba(255,255,255,.07)"}}><div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:6}}>{user?.email}</div><button onClick={handleLogout} style={{background:"transparent",border:"1px solid rgba(255,255,255,.15)",color:"rgba(255,255,255,.5)",padding:"7px 14px",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:"inherit",width:"100%"}}>Sign Out</button></div>
      </div>

      <div className="admin-main">
        <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,.07)",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0a0f1e",position:"sticky",top:0,zIndex:10,flexWrap:"wrap",gap:8}}>
          <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:600}}>{tab==="dock"?"At The Dock":tab==="revenue"?"Revenue":"Charter Bookings"}</div><div style={{fontSize:12,color:"rgba(255,255,255,.35)",marginTop:2}}>{bookings.length} total reservations</div></div>
          <button onClick={()=>loadData(tab)} style={{background:"rgba(201,168,76,.1)",border:"1px solid rgba(201,168,76,.3)",color:"#c9a84c",padding:"8px 18px",borderRadius:8,cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:500}}>↻ Refresh</button>
        </div>

        <div style={{padding:"20px 16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:20}}>
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
                        <td style={{padding:"14px 16px"}}><div style={{fontSize:13}}>{fmtDate(tab==="dock"?b.eventDate:b.charterDate)}</div><div style={{fontSize:11,color:"rgba(255,255,255,.35)",marginTop:1}}>{b.startTime} - {b.endTime}</div></td>
                        <td style={{padding:"14px 16px"}}><div style={{fontSize:14,fontWeight:600,color:"#c9a84c"}}>{fmtCurrency(b.totalPrice)}</div><div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:1}}>{b.paymentOption==="full"?"Full":"Deposit"}</div></td>
                        <td style={{padding:"14px 16px"}}>
                          <select value={b.paymentStatus||"unpaid"} onClick={e=>e.stopPropagation()} onChange={e=>updateField(b.id,"paymentStatus",e.target.value)} style={{background:"#0d1b2a",border:"1px solid rgba(255,255,255,.15)",color:"#fff",padding:"5px 8px",borderRadius:6,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>
                            <option value="unpaid">Unpaid</option><option value="zelle_pending">Zelle Pending</option><option value="deposit_paid">Deposit Paid</option><option value="paid">Paid Full</option><option value="refunded">Refunded</option>
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
                              <div><div style={{fontSize:10,letterSpacing:2,color:"#c9a84c",textTransform:"uppercase",marginBottom:9}}>Client</div>{[["Name",b.clientName],["Email",b.clientEmail],["Phone",b.clientPhone],["Host",b.hostName||"-"]].map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}><span style={{color:"rgba(255,255,255,.4)"}}>{k}</span><span>{v}</span></div>)}</div>
                              <div><div style={{fontSize:10,letterSpacing:2,color:"#c9a84c",textTransform:"uppercase",marginBottom:9}}>Booking</div>
                                {(tab==="dock"?[["Celebration",b.celebration],["Date",fmtDate(b.eventDate)],["Time",`${b.startTime} - ${b.endTime}`],["Duration",b.duration]]:[["Vessel",b.vessel],["Date",fmtDate(b.charterDate)],["Time",`${b.startTime} - ${b.endTime}`],["Destination",b.destination],["Duration",b.duration]]).map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}><span style={{color:"rgba(255,255,255,.4)"}}>{k}</span><span>{v}</span></div>)}
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
              <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:14}}>
                <button onClick={()=>generatePDF(b)} style={{background:"#c9a84c",color:"#0a0f1e",border:"none",padding:"9px 18px",borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:.5,whiteSpace:"nowrap"}}>📄 PDF</button>
                <button onClick={()=>sendReminder(b)} style={{background:"rgba(74,158,255,.1)",border:"1px solid rgba(74,158,255,.3)",color:"#4a9eff",padding:"9px 18px",borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>⏰ Send 48hr Reminder</button>
                <button onClick={()=>sendThankYou(b)} style={{background:"rgba(58,170,102,.1)",border:"1px solid rgba(58,170,102,.3)",color:"#3aaa66",padding:"9px 18px",borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,whiteSpace:"nowrap"}}>🙏 Send Thank You</button>
              </div>
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
      {/* Mobile bottom nav */}
      <div className="admin-bottom-nav">
        {[["📋","Charters","charters"],["⚓","Dock","dock"],["💰","Revenue","revenue"],["👤","Account","account"]].map(([icon,label,id])=>(
          <div key={id} onClick={()=>id==="account"?handleLogout():setTab(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"6px 0",cursor:"pointer",color:tab===id?"#c9a84c":"rgba(255,255,255,.4)",fontSize:10,letterSpacing:.5}}>
            <span style={{fontSize:20}}>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

// ── BLOG PAGE ─────────────────────────────────────────────────────────────────
