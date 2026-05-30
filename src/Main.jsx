import { useState, useRef, useEffect } from "react";
import { fmtDate, calcEnd, fmtCurrency, isTimeBlocked, G, BOATS, DURATIONS, DESTINATIONS, TIMES, CELEBRATIONS, DOCK_DURATIONS, TERMS, BLOG_POSTS, BOAT_RATE, DEPOSIT, DOCK_RATE, BUFFER_MINS, P, SC, WaveIntro, HeroSection, SmartCal, SigCanvas, Badge, generatePDF } from './App';
import { AtTheDockPage, AdminDashboard } from './Admin';
function BlogPage({ setPage, post, setPost }) {
  if(post) {
    const p = BLOG_POSTS.find(b=>b.slug===post);
    if(!p) return null;
    return (
      <><style>{G}</style>
      <div style={{fontFamily:"'DM Sans',sans-serif",background:"#0a0f1e",color:"#fff",minHeight:"100vh"}}>
        <nav style={{position:"sticky",top:0,zIndex:200,background:"rgba(10,15,30,.95)",backdropFilter:"blur(18px)",borderBottom:"1px solid rgba(201,168,76,.13)",padding:"0 5%",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={()=>setPost(null)} style={{background:"none",border:"none",color:"#c9a84c",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:600,letterSpacing:2}}>← Back to Blog</button>
          <button onClick={()=>{setPost(null);setPage("home");}} style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13}}>ldgcharters.com</button>
        </nav>
        <div style={{maxWidth:740,margin:"0 auto",padding:"60px 5% 100px"}}>
          <div style={{fontSize:11,color:"#c9a84c",letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>{p.date} - {p.readTime}</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,5vw,48px)",fontWeight:400,lineHeight:1.2,marginBottom:24,color:"#fff"}}>{p.title}</h1>
          <div style={{height:3,width:60,background:"#c9a84c",marginBottom:32}}/>
          {p.content.split('\n\n').map((para,i)=>{
            if(para.startsWith('**')&&para.endsWith('**')&&!para.includes(' ')===false&&para.split('**').length===3){
              return <h3 key={i} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:"#c9a84c",marginBottom:16,marginTop:i>0?28:0}}>{para.replace(/\*\*/g,'')}</h3>;
            }
            if(para.startsWith('- ')){
              return <ul key={i} style={{paddingLeft:20,marginBottom:20}}>{para.split('\n').map((li,j)=><li key={j} style={{fontSize:15,color:"rgba(255,255,255,.7)",lineHeight:1.8,marginBottom:4}}>{li.replace('- ','')}</li>)}</ul>;
            }
            if(para.includes('|')&&para.includes('---')){
              return null;
            }
            return <p key={i} style={{fontSize:15,color:"rgba(255,255,255,.65)",lineHeight:1.85,marginBottom:20,dangerouslySetInnerHTML:undefined}}>{para.replace(/\*\*(.*?)\*\*/g,'$1')}</p>;
          })}
          <div style={{marginTop:48,padding:"28px 24px",background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.22)",borderRadius:12,textAlign:"center"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,marginBottom:12}}>Ready to Experience Lake Michigan?</div>
            <button onClick={()=>setPage("home")} style={{background:"#c9a84c",color:"#0a0f1e",border:"none",padding:"12px 32px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,letterSpacing:2,textTransform:"uppercase"}}>Book Your Charter</button>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <><style>{G}</style>
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#0a0f1e",color:"#fff",minHeight:"100vh"}}>
      <nav style={{position:"sticky",top:0,zIndex:200,background:"rgba(10,15,30,.95)",backdropFilter:"blur(18px)",borderBottom:"1px solid rgba(201,168,76,.13)",padding:"0 5%",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={()=>setPage("home")} style={{background:"none",border:"none",color:"#c9a84c",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:600,letterSpacing:2}}>← LDG CHARTERS</button>
      </nav>

      <div style={{backgroundImage:`url(${P.skyline})`,backgroundSize:"cover",backgroundPosition:"center",padding:"80px 5%",position:"relative"}}>
        <div style={{position:"absolute",inset:0,background:"rgba(10,15,30,.78)"}}/>
        <div style={{position:"relative",maxWidth:800,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:11,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:12}}>Chicago Boating Guide</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(36px,6vw,58px)",fontWeight:300,color:"#fff",marginBottom:16}}>Everything You Need to Know About <span style={{color:"#c9a84c",fontStyle:"italic"}}>Chicago Boat Rentals</span></h1>
          <p style={{fontSize:15,color:"rgba(255,255,255,.55)",lineHeight:1.75}}>Expert guides from the team at LDG Charters — Chicago's premier boat charter service at 31st Street Harbor.</p>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"60px 5% 100px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:28}}>
          {BLOG_POSTS.map(p=>(
            <div key={p.slug} onClick={()=>setPost(p.slug)} style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.08)",borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"all .25s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#c9a84c"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.08)"}>
              <div style={{padding:"28px 24px 24px"}}>
                <div style={{fontSize:10,color:"#c9a84c",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>{p.date} - {p.readTime}</div>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,lineHeight:1.3,marginBottom:12,color:"#fff"}}>{p.title}</h2>
                <p style={{fontSize:13,color:"rgba(255,255,255,.5)",lineHeight:1.7,marginBottom:18}}>{p.excerpt}</p>
                <span style={{fontSize:12,color:"#c9a84c",fontWeight:600,letterSpacing:.5}}>Read More →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}

// ── GALLERY / DAY ON THE LAKE ─────────────────────────────────────────────────
function GalleryPage({ setPage, startBook }) {
  const GALLERY = [
    {url:P.hero,    caption:"Chicago Skyline from Lake Michigan",   tag:"Skyline"},
    {url:P.sunset,  caption:"Golden Hour at 31st Street Harbor",    tag:"Sunset"},
    {url:P.group,   caption:"Groups & Celebrations on the Water",   tag:"Groups"},
    {url:P.deck,    caption:"On Deck at 31st Street Harbor",        tag:"Boats"},
    {url:P.dusk,    caption:"Chicago at Dusk from the Marina",      tag:"Evening"},
    {url:P.night,   caption:"Chicago Night Skyline from the Dock",  tag:"Night"},
    {url:P.playpen, caption:"The Playpen — Chicago's Lake Party",   tag:"Playpen"},
    {url:P.skyline, caption:"Bow View Approaching the Skyline",     tag:"Skyline"},
    {url:P.crowd,   caption:"The Playpen in Full Swing",            tag:"Playpen"},
  ];

  return (
    <><style>{G}</style>
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#0a0f1e",color:"#fff",minHeight:"100vh"}}>
      <nav style={{position:"sticky",top:0,zIndex:200,background:"rgba(10,15,30,.95)",backdropFilter:"blur(18px)",borderBottom:"1px solid rgba(201,168,76,.13)",padding:"0 5%",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={()=>setPage("home")} style={{background:"none",border:"none",color:"#c9a84c",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:600,letterSpacing:2}}>← LDG CHARTERS</button>
        <button onClick={()=>startBook()} style={{background:"#c9a84c",color:"#0a0f1e",border:"none",padding:"8px 20px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase"}}>Book Now</button>
      </nav>

      {/* Hero banner */}
      <div style={{position:"relative",height:380,backgroundImage:`url(${P.group})`,backgroundSize:"cover",backgroundPosition:"center top"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(10,15,30,.3),rgba(10,15,30,.88))"}}/>
        <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"0 5% 40px",textAlign:"center"}}>
          <div style={{fontSize:11,letterSpacing:5,color:"#c9a84c",textTransform:"uppercase",marginBottom:12}}>Real Photos - Real People - Real Chicago</div>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(38px,7vw,68px)",fontWeight:300,lineHeight:1.1,color:"#fff"}}>A Day on the <span style={{color:"#c9a84c",fontStyle:"italic"}}>Lake</span></h1>
        </div>
      </div>

      {/* Intro */}
      <div style={{maxWidth:800,margin:"0 auto",padding:"60px 5% 20px",textAlign:"center"}}>
        <p style={{fontSize:16,color:"rgba(255,255,255,.6)",lineHeight:1.85}}>These are real photos from real charters on Lake Michigan. This is what your experience looks like — the skyline, the water, the people, and the energy. No stock photos. No filters. Just Chicago.</p>
      </div>

      {/* Gallery grid */}
      <div style={{maxWidth:1200,margin:"0 auto",padding:"40px 5% 60px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16}}>
          {GALLERY.map((img,i)=>(
            <div key={i} className="gallery-img" style={{borderRadius:12,overflow:"hidden",position:"relative",transition:"all .3s",cursor:"pointer",aspectRatio:i===0||i===4?"16/9":"4/3"}}>
              <img src={img.url} alt={img.caption} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
                onError={e=>{e.target.style.background="rgba(10,20,40,1)";e.target.style.display="none";e.target.parentElement.style.background=`linear-gradient(135deg,#0d2240,#0a1628)`;}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(10,15,30,.85) 0%,transparent 60%)",opacity:0,transition:"opacity .3s"}} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=0}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"16px 18px"}}>
                <span style={{display:"inline-block",fontSize:9,letterSpacing:2,background:"rgba(201,168,76,.2)",border:"1px solid rgba(201,168,76,.4)",color:"#c9a84c",padding:"3px 8px",borderRadius:12,textTransform:"uppercase",marginBottom:6}}>{img.tag}</span>
                <div style={{fontSize:12,color:"rgba(255,255,255,.8)",lineHeight:1.4}}>{img.caption}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{backgroundImage:`url(${P.sunset})`,backgroundSize:"cover",backgroundPosition:"center",padding:"80px 5%",position:"relative",textAlign:"center"}}>
        <div style={{position:"absolute",inset:0,background:"rgba(10,15,30,.78)"}}/>
        <div style={{position:"relative"}}>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,5vw,52px)",fontWeight:300,color:"#fff",marginBottom:16}}>Your <span style={{color:"#c9a84c",fontStyle:"italic"}}>Story</span> Starts Here</h2>
          <p style={{fontSize:15,color:"rgba(255,255,255,.55)",marginBottom:32,maxWidth:480,margin:"0 auto 32px"}}>Book your charter today and create memories on Lake Michigan you'll never forget.</p>
          <button onClick={()=>startBook()} style={{background:"#c9a84c",color:"#0a0f1e",border:"none",padding:"15px 44px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,letterSpacing:2,textTransform:"uppercase"}}>Book Your Charter</button>
        </div>
      </div>
    </div>
    </>
  );
}

// ── APP ROUTER ────────────────────────────────────────────────────────────────
export default function App() {
  const [hash,setHash]=useState(window.location.hash);
  useEffect(()=>{const h=()=>setHash(window.location.hash);window.addEventListener("hashchange",h);return()=>window.removeEventListener("hashchange",h);},[]);
  if(hash==="#admin"||hash==="#/admin")return <AdminDashboard/>;
  return <LDGChartersApp/>;
}

// ── MAIN PUBLIC APP ───────────────────────────────────────────────────────────
function LDGChartersApp() {
  const [showWave,setShowWave]=useState(()=>!localStorage.getItem("ldg_visited"));
  const [page,setPage]=useState("home");
  const [blogPost,setBlogPost]=useState(null);

  // Booking state
  const [view,setView]=useState("home");
  const [step,setStep]=useState(1);
  const [boat,setBoat]=useState(null);
  const [dur,setDur]=useState(null);
  const [dest,setDest]=useState(null);
  const [date,setDate]=useState(null);
  const [time,setTime]=useState(null);
  const [info,setInfo]=useState({name:"",email:"",phone:""});
  const [host,setHost]=useState({name:"",email:""});
  const [cSig,setCSig]=useState(null);
  const [payOpt,setPayOpt]=useState(null);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [saveErr,setSaveErr]=useState("");
  const [bookedSlots,setBookedSlots]=useState([]);
  const [loadingSlots,setLoadingSlots]=useState(false);

  const total = dur ? dur.hours * BOAT_RATE : 0;
  const balance = total - DEPOSIT;
  const endT = calcEnd(time, dur?.hours);
  const SLABELS = ["Vessel","Duration","Destination","Date & Time","Your Info","Agreement","Invoice"];

  const canNext = () => {
    if(step===1)return!!boat;
    if(step===2)return!!dur;
    if(step===3)return!!dest;
    if(step===4)return!!date&&!!time&&!isTimeBlocked(time,dur?.hours||0,bookedSlots);
    if(step===5)return!!(info.name&&info.email&&info.phone);
    if(step===6)return!!cSig;
    return true;
  };

  const startBook=(preBoat=null)=>{if(preBoat)setBoat(preBoat);setStep(1);setView("booking");setPage("booking");setTimeout(()=>window.scrollTo(0,0),0);};
  const reset=()=>{setPage("home");setView("home");setStep(1);setBoat(null);setDur(null);setDest(null);setDate(null);setTime(null);setInfo({name:"",email:"",phone:""});setHost({name:"",email:""});setCSig(null);setPayOpt(null);setSaved(false);setSaveErr("");setBookedSlots([]);};

  // Load booked slots when date+vessel selected
  useEffect(()=>{
    if(!date||!boat) return;
    const load=async()=>{
      setLoadingSlots(true);
      try{
        const q=query(collection(db,"bookings"),where("charterDate","==",date),where("vesselId","==",boat.id),where("bookingStatus","!=","cancelled"));
        const snap=await getDocs(q);
        setBookedSlots(snap.docs.map(d=>d.data()));
      }catch(e){console.error(e);}
      setLoadingSlots(false);
    };
    load();
  },[date,boat]);

  const EMAILJS_SERVICE_ID="service_0se585c";
  const EMAILJS_PUBLIC_KEY="jsEvKIVZ10ZQqt-4r";
  const TEMPLATE_CUSTOMER="template_t4td6qc";
  const TEMPLATE_ADMIN="template_swbrijc";

  const sendEmails=async(chosenPayOpt)=>{
    const params={customer_name:info.name,customer_email:info.email,customer_phone:info.phone,vessel:boat.name,charter_date:fmtDate(date),start_time:time,end_time:endT,duration:`${dur.label} (${dur.hours} hrs)`,destination:dest.name,total_price:`$${total.toLocaleString()}.00`,balance:`$${balance.toLocaleString()}.00`,payment_option:chosenPayOpt==="full"?"Full Payment":"Deposit Only ($500)",captain_name:"Arranged Separately — Call 708-846-3132"};
    try{
      await fetch("https://api.emailjs.com/api/v1.0/email/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({service_id:EMAILJS_SERVICE_ID,template_id:TEMPLATE_CUSTOMER,user_id:EMAILJS_PUBLIC_KEY,template_params:params})});
      await fetch("https://api.emailjs.com/api/v1.0/email/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({service_id:EMAILJS_SERVICE_ID,template_id:TEMPLATE_ADMIN,user_id:EMAILJS_PUBLIC_KEY,template_params:params})});
    }catch(e){console.error("Email error:",e);}
  };

  const saveBooking=async(chosenPayOpt)=>{
    setSaving(true);setSaveErr("");
    try{
      const bookingData={clientName:info.name,clientEmail:info.email,clientPhone:info.phone,hostName:host.name||null,hostEmail:host.email||null,vessel:boat.name,vesselId:boat.id,duration:`${dur.label} (${dur.hours} hrs)`,hours:dur.hours,destination:dest.name,charterDate:date,startTime:time,endTime:endT,boatFee:total,totalPrice:total,deposit:DEPOSIT,balance,paymentOption:chosenPayOpt,paymentStatus:"unpaid",bookingStatus:"pending",clientSignature:cSig,adminNotes:"",createdAt:serverTimestamp()};
      const docRef = await addDoc(collection(db,"bookings"),bookingData);
      await sendEmails(chosenPayOpt);
      // Auto-generate PDF
      generatePDF({...bookingData,id:docRef.id});
      setSaved(true);
    }catch(e){console.error(e);setSaveErr("Could not save booking. Please call 708-846-3132.");}
    setSaving(false);
  };

  const inp={width:"100%",background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.14)",borderRadius:8,padding:"12px 16px",color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none",transition:"border-color .2s"};

  // Route to sub-pages
  if(page==="dock") return <AtTheDockPage onBack={()=>setPage("home")}/>;
  if(page==="gallery") return <GalleryPage setPage={setPage} startBook={startBook}/>;
  if(page==="blog") return <BlogPage setPage={setPage} post={blogPost} setPost={setBlogPost}/>;

  // ── HOME PAGE ──
  if(page==="home"&&view==="home")return(
    <><style>{G}</style>
    {showWave&&<WaveIntro onDone={()=>{setShowWave(false);localStorage.setItem("ldg_visited","1");}}/>}
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#0a0f1e",color:"#fff",minHeight:"100vh"}}>

      {/* SEO META TAGS injected via head manipulation */}
      {(() => {
        document.title = "LDG Charters | Chicago Boat Rental | Lake Michigan Charter | $300/hr";
        let m = document.querySelector('meta[name="description"]');
        if(!m){m=document.createElement('meta');m.name="description";document.head.appendChild(m);}
        m.content = "Chicago boat rental starting at $300/hr. Premium Lake Michigan charters departing from 31st Street Harbor. Book online — Get Down Lo I & II available now.";
        return null;
      })()}

      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,background:"rgba(10,15,30,.94)",backdropFilter:"blur(18px)",borderBottom:"1px solid rgba(201,168,76,.13)",padding:"0 5%",height:68,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <div style={{width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#c9a84c,#7a5a14)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:"#0a0f1e"}}>L</span></div>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:21,fontWeight:600,letterSpacing:2}}>LDG <span style={{color:"#c9a84c"}}>CHARTERS</span></span>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div className="nav-desktop" style={{display:"flex",gap:14,alignItems:"center",marginRight:8}}>
            {[["Fleet","fleet"],["Gallery","gallery-sec"],["Destinations","destinations"],["At The Dock","dock-sec"],["Blog","blog-sec"],["Pricing","pricing"]].map(([l,id])=>(
              <button key={id} className="nav-link" onClick={()=>{
                if(id==="gallery-sec"){setPage("gallery");return;}
                if(id==="blog-sec"){setPage("blog");return;}
                document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
              }} style={{background:"none",border:"none",color:"rgba(255,255,255,.6)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:400,transition:"color .2s"}}>{l}</button>
            ))}
          </div>
          <button className="btn-g" onClick={()=>startBook()} style={{background:"#c9a84c",color:"#0a0f1e",border:"none",padding:"9px 20px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",transition:"all .22s",whiteSpace:"nowrap"}}>Book Now</button>
        </div>
      </nav>

      <HeroSection startBook={startBook} setPage={setPage}/>

      {/* ABOUT with photo */}
      <section style={{padding:"0",position:"relative",overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",minHeight:"auto"}}>
          <div style={{backgroundImage:`url(${P.group})`,backgroundSize:"cover",backgroundPosition:"center",minHeight:400,position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"rgba(10,15,30,.35)"}}/>
          </div>
          <div style={{background:"#0c1928",padding:"60px 48px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:14}}>About LDG Charters</div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:400,marginBottom:20,lineHeight:1.2}}>Where Adventure Meets Luxury <span style={{fontStyle:"italic"}}>On The Water</span></h2>
            <p style={{fontSize:15,color:"rgba(255,255,255,.6)",lineHeight:1.8,marginBottom:16}}>Premium boat charters on Lake Michigan departing from 31st Street Harbor. Whether it's a birthday, corporate event, or a day out with friends — we deliver the ultimate Chicago experience.</p>
            <p style={{fontSize:15,color:"rgba(255,255,255,.6)",lineHeight:1.8,marginBottom:28}}>We provide cups, ice, silverware, and paper towels. You bring the drinks, the people, and the energy. Captain services arranged separately — call 708-846-3132.</p>
            <button onClick={()=>setPage("gallery")} style={{display:"inline-flex",alignItems:"center",gap:8,background:"transparent",border:"1px solid rgba(201,168,76,.4)",color:"#c9a84c",padding:"10px 20px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:500,letterSpacing:1,width:"fit-content"}}>View Gallery →</button>
          </div>
        </div>
      </section>

      {/* FLEET */}
      <section id="fleet" style={{padding:"80px 5%",background:"rgba(255,255,255,.018)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:52}}><div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:10}}>Our Fleet</div><h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,5vw,50px)",fontWeight:400}}>Choose Your <span style={{fontStyle:"italic"}}>Vessel</span></h2><p style={{marginTop:12,color:"rgba(255,255,255,.4)",fontSize:14}}>Two identical premium express cruisers — each accommodating up to 12 guests</p></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(480px,100%),1fr))",gap:24}}>
            {BOATS.map(b=>(
              <div key={b.id} className="boat-card" style={{background:"#0c1928",border:"1px solid rgba(201,168,76,.14)",borderRadius:16,overflow:"hidden",transition:"all .3s"}}>
                <div style={{height:260,backgroundImage:`url(${b.photo})`,backgroundSize:"cover",backgroundPosition:"center",position:"relative"}}>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(10,15,30,.1),rgba(10,15,30,.7))"}}/>
                  <div style={{position:"absolute",bottom:20,left:24}}>
                    <div style={{fontSize:9,letterSpacing:3,color:b.accent,textTransform:"uppercase",marginBottom:4}}>{b.subtitle}</div>
                    <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:600,color:"#fff",letterSpacing:1}}>{b.name}</div>
                  </div>
                </div>
                <div style={{padding:28}}>
                  <p style={{fontSize:13,fontStyle:"italic",color:"#c9a84c",marginBottom:12}}>{b.tagline}</p>
                  <p style={{fontSize:14,color:"rgba(255,255,255,.55)",lineHeight:1.7,marginBottom:20}}>{b.description}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:24}}>{b.features.map(f=><span key={f} style={{fontSize:10,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",padding:"4px 10px",borderRadius:20,color:"rgba(255,255,255,.55)"}}>✓ {f}</span>)}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:20,borderTop:"1px solid rgba(255,255,255,.07)",marginBottom:20}}>
                    <div><div style={{fontSize:26,fontFamily:"'Cormorant Garamond',serif",fontWeight:600,color:"#c9a84c"}}>${BOAT_RATE}<span style={{fontSize:13,color:"rgba(255,255,255,.4)",fontFamily:"'DM Sans',sans-serif",fontWeight:300}}>/hr</span></div><div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>2 hr min - $500 deposit</div></div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.35)",textAlign:"right"}}>Up to 12 guests<br/><span style={{color:"rgba(201,168,76,.45)"}}>31st St Harbor</span></div>
                  </div>
                  <button className="btn-g" onClick={()=>startBook(b)} style={{width:"100%",background:"#c9a84c",color:"#0a0f1e",border:"none",padding:13,borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",transition:"all .22s"}}>Book {b.name}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINATIONS with photos */}
      <section id="destinations" style={{padding:"96px 5%"}}>
        <div style={{maxWidth:1180,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:52}}><div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:10}}>Where We Go</div><h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,5vw,50px)",fontWeight:400}}>Choose Your <span style={{fontStyle:"italic"}}>Destination</span></h2></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))",gap:18}}>
            {DESTINATIONS.map(d=>(
              <div key={d.id} className="dest-card" style={{borderRadius:14,overflow:"hidden",border:"1px solid rgba(255,255,255,.08)",transition:"all .25s",cursor:"default"}}>
                <div style={{height:160,backgroundImage:`url(${d.photo})`,backgroundSize:"cover",backgroundPosition:"center",position:"relative"}}>
                  <div style={{position:"absolute",inset:0,background:"rgba(10,15,30,.35)"}}/>
                  <div style={{position:"absolute",top:12,left:12,fontSize:24}}>{d.icon}</div>
                </div>
                <div style={{padding:"18px 20px",background:"rgba(255,255,255,.025)"}}>
                  <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,fontWeight:600,marginBottom:8}}>{d.name}</h3>
                  <p style={{fontSize:13,color:"rgba(255,255,255,.52)",lineHeight:1.7}}>{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AT THE DOCK V2 */}
      <section id="dock-sec" style={{padding:"80px 5%",background:"rgba(255,255,255,.012)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:40}}>
            <div style={{fontSize:10,letterSpacing:4,color:"#4aff9a",textTransform:"uppercase",marginBottom:10}}>New Experience</div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(32px,5vw,52px)",fontWeight:400}}>At The <span style={{fontStyle:"italic",color:"#4aff9a"}}>Dock</span></h2>
            <p style={{fontSize:14,color:"rgba(255,255,255,.45)",marginTop:10,maxWidth:500,margin:"10px auto 0"}}>${DOCK_RATE}/hr dockside at 31st Street Harbor - No deposit required</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:32,alignItems:"start"}}>
            <div style={{display:"flex",flexDirection:"column",gap:16,paddingTop:8}}>
              <p style={{fontSize:15,color:"rgba(255,255,255,.6)",lineHeight:1.85}}>Bring the celebration dockside. No charter required — just show up, set the vibe, and enjoy the harbor atmosphere at 31st Street. Perfect for any occasion.</p>
              <p style={{fontSize:15,color:"rgba(255,255,255,.6)",lineHeight:1.85}}>We set the atmosphere. You bring the celebration.</p>
              <div style={{display:"flex",gap:14,alignItems:"center",marginTop:8,flexWrap:"wrap"}}>
                <button className="btn-g" onClick={()=>setPage("dock")} style={{background:"#4aff9a",color:"#0a0f1e",border:"none",padding:"14px 32px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,letterSpacing:2,textTransform:"uppercase",transition:"all .22s",boxShadow:"0 6px 24px rgba(74,255,154,.25)"}}>Reserve Your Spot</button>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:600,color:"#4aff9a"}}>${DOCK_RATE}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.4)",lineHeight:1.5}}>per hour / no deposit</div>
              </div>
            </div>
            <div style={{position:"relative",borderRadius:16,overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.6),0 0 0 1px rgba(201,168,76,.12)"}}>
              <div style={{position:"absolute",inset:0,backgroundImage:`url(${P.night})`,backgroundSize:"cover",backgroundPosition:"center",filter:"brightness(0.18) saturate(0.5) blur(1px)",transform:"scale(1.05)",zIndex:0}}/>
              <div style={{position:"absolute",inset:0,zIndex:1,background:"radial-gradient(ellipse at 50% 50%,rgba(10,20,45,.35) 0%,rgba(5,10,22,.75) 100%)"}}/>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,transparent,rgba(201,168,76,.5),transparent)",zIndex:3}}/>
              <div style={{position:"relative",zIndex:2,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gridTemplateRows:"1fr 1fr"}}>
                {[["🎂","Birthday"],["💍","Anniversary"],["💼","Corporate"],["🎉","Bach Party"],["🥂","Girls Night"],["✨","Celebrating"]].map(([icon,label])=>(
                  <div key={label} onClick={()=>setPage("dock")}
                    style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,padding:"32px 10px",border:"1px solid rgba(201,168,76,.1)",cursor:"pointer",transition:"all .3s",background:"transparent"}}
                    onMouseEnter={e=>{e.currentTarget.style.background="rgba(201,168,76,.08)";e.currentTarget.style.borderColor="rgba(201,168,76,.35)";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(201,168,76,.1)";}}>
                    <div style={{fontSize:46,lineHeight:1,filter:"drop-shadow(0 3px 14px rgba(201,168,76,.25))",transition:"transform .3s"}}>{icon}</div>
                    <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.75)",letterSpacing:"1px",textTransform:"uppercase"}}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{position:"relative",zIndex:3,padding:"16px 20px",background:"linear-gradient(to top,rgba(6,13,26,.95),transparent)",display:"flex",justifyContent:"center"}}>
                <button onClick={()=>setPage("dock")} style={{background:"linear-gradient(135deg,#4aff9a,#2dd67a)",color:"#030d08",border:"none",padding:"12px 36px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",boxShadow:"0 6px 24px rgba(74,255,154,.3)"}}>Reserve Your Spot</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY TEASER */}
      <section style={{padding:"80px 5%",background:"rgba(255,255,255,.018)"}}>
        <div style={{maxWidth:1180,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:32}}>
            <div><div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:10}}>Real Photos</div><h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:400}}>A Day on the <span style={{fontStyle:"italic"}}>Lake</span></h2></div>
            <button onClick={()=>setPage("gallery")} style={{background:"transparent",border:"1px solid rgba(201,168,76,.35)",color:"#c9a84c",padding:"10px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,letterSpacing:1,whiteSpace:"nowrap"}}>View Full Gallery →</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[
              {url:P.night,label:"Night Skyline"},
              {url:P.sunset,label:"Sunset Harbor"},
              {url:P.group,label:"On The Water"},
              {url:P.deck,label:"The Deck"},
              {url:P.skyline,label:"Chicago Skyline"},
              {url:P.playpen,label:"The Playpen"},
            ].map((img,i)=>(
              <div key={i} onClick={()=>setPage("gallery")} style={{borderRadius:8,cursor:"pointer",overflow:"hidden",background:"rgba(10,20,40,1)",aspectRatio:"1/1",position:"relative"}}>
                <img src={img.url} alt={img.label} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
                  onError={e=>{e.target.style.display="none";e.target.parentElement.style.background="linear-gradient(135deg,#0d2240,#0a1628)";}}/>
                <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"6px 8px",background:"linear-gradient(transparent,rgba(10,15,30,.85))",fontSize:9,color:"rgba(255,255,255,.7)",letterSpacing:.5}}>{img.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:"80px 5%"}}>
        <div style={{maxWidth:960,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:10}}>Pricing</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(34px,5vw,48px)",fontWeight:400,marginBottom:40}}>Simple, Transparent <span style={{fontStyle:"italic"}}>Pricing</span></h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16,marginBottom:32}}>
            {DURATIONS.slice(0,4).map(d=>(
              <div key={d.id} style={{background:"rgba(201,168,76,.05)",border:"1px solid rgba(201,168,76,.2)",borderRadius:12,padding:"22px 14px",textAlign:"center"}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:600,color:"#c9a84c"}}>${(d.hours*BOAT_RATE).toLocaleString()}</div>
                <div style={{fontSize:14,fontWeight:600,color:"#fff",margin:"8px 0 3px"}}>{d.label}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>{d.hours} hrs</div>
              </div>
            ))}
          </div>
          <p style={{color:"rgba(255,255,255,.4)",fontSize:13,marginBottom:8}}>$300/hr - 2 hr minimum - $500 non-refundable deposit - Up to 12 guests</p>
          <p style={{color:"rgba(255,255,255,.3)",fontSize:12,marginBottom:32}}>At The Dock: ${DOCK_RATE}/hr - No deposit required</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn-g" onClick={()=>startBook()} style={{background:"#c9a84c",color:"#0a0f1e",border:"none",padding:"15px 44px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,letterSpacing:2,textTransform:"uppercase",transition:"all .22s"}}>Book A Charter</button>
            <button className="btn-o" onClick={()=>setPage("dock")} style={{background:"transparent",color:"#4aff9a",border:"1px solid rgba(74,255,154,.35)",padding:"15px 44px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:400,letterSpacing:1,transition:"all .22s"}}>At The Dock</button>
          </div>
        </div>
      </section>

      {/* BLOG TEASER */}
      <section id="blog-sec" style={{padding:"80px 5%",background:"rgba(255,255,255,.018)"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:36}}>
            <div><div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:10}}>Chicago Boating Guide</div><h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(28px,4vw,44px)",fontWeight:400}}>Answers to Your <span style={{fontStyle:"italic"}}>Top Questions</span></h2></div>
            <button onClick={()=>setPage("blog")} style={{background:"transparent",border:"1px solid rgba(201,168,76,.35)",color:"#c9a84c",padding:"10px 22px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,letterSpacing:1,whiteSpace:"nowrap"}}>All Articles →</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:20}}>
            {BLOG_POSTS.slice(0,3).map(p=>(
              <div key={p.slug} onClick={()=>{setBlogPost(p.slug);setPage("blog");}} style={{padding:"24px",background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,cursor:"pointer",transition:"border-color .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#c9a84c"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.07)"}>
                <div style={{fontSize:10,color:"#c9a84c",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{p.date} - {p.readTime}</div>
                <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,fontWeight:600,lineHeight:1.3,marginBottom:10,color:"#fff"}}>{p.title}</h3>
                <p style={{fontSize:13,color:"rgba(255,255,255,.45)",lineHeight:1.65}}>{p.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{padding:"96px 5%"}}>
        <div style={{maxWidth:860,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:48}}>
          <div>
            <div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:14}}>Contact Us</div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:500,marginBottom:20}}>Get In Touch</h3>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}><span style={{color:"#c9a84c",marginTop:2}}>📍</span><div style={{color:"rgba(255,255,255,.6)",fontSize:14,lineHeight:1.65}}>3100 South DuSable Lake Shore Drive<br/>Chicago, IL<br/><span style={{color:"rgba(255,255,255,.35)",fontSize:12}}>31st Street Harbor</span></div></div>
              <div style={{display:"flex",gap:12,alignItems:"center"}}><span style={{color:"#c9a84c"}}>📞</span><a href="tel:7088463132" style={{color:"rgba(255,255,255,.6)",fontSize:14,textDecoration:"none"}}>708-846-3132</a></div>
            </div>
          </div>
          <div>
            <div style={{fontSize:10,letterSpacing:4,color:"#c9a84c",textTransform:"uppercase",marginBottom:14}}>Policies</div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:500,marginBottom:20}}>Good To Know</h3>
            {["$500 non-refundable deposit secures charter bookings.","Remaining balance due 48 hours before departure.","Charter times are STRICT — arrive 15-20 min early.","Weather cancellations receive a reschedule or credit.","At The Dock reservations: no deposit required."].map(p=>(
              <div key={p} style={{display:"flex",gap:10,fontSize:13,color:"rgba(255,255,255,.55)",lineHeight:1.65,marginBottom:10}}><span style={{color:"#c9a84c",flexShrink:0}}>—</span>{p}</div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{borderTop:"1px solid rgba(255,255,255,.07)",padding:"36px 5%"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
          <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600,letterSpacing:3,marginBottom:4}}>LDG <span style={{color:"#c9a84c"}}>CHARTERS</span></div><div style={{fontSize:11,color:"rgba(255,255,255,.28)"}}>31st Street Harbor - Chicago, IL - 708-846-3132</div></div>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            {[["Gallery",()=>setPage("gallery")],["Blog",()=>setPage("blog")],["At The Dock",()=>setPage("dock")],["Admin",()=>window.location.hash="admin"]].map(([l,fn])=>(
              <button key={l} onClick={fn} style={{background:"none",border:"none",color:"rgba(255,255,255,.28)",cursor:"pointer",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:20,fontSize:10,color:"rgba(255,255,255,.15)"}}>{new Date().getFullYear()} LDG Charters - Chicago Boat Rental - Lake Michigan Charter - 31st Street Harbor</div>
      </footer>
    </div>
    </>;

  // ── BOOKING FLOW ──
  return (
    <><style>{G}</style>
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#0a0f1e",color:"#fff",minHeight:"100vh"}}>
      <nav style={{position:"sticky",top:0,zIndex:200,background:"rgba(10,15,30,.95)",backdropFilter:"blur(18px)",borderBottom:"1px solid rgba(201,168,76,.13)",padding:"0 5%",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={reset} style={{background:"none",border:"none",color:"#c9a84c",cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:600,letterSpacing:2}}>← LDG CHARTERS</button>
        <div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>Step {step}/{SLABELS.length} — <span style={{color:"#c9a84c"}}>{SLABELS[step-1]}</span></div>
      </nav>
      <div style={{height:3,background:"rgba(255,255,255,.07)"}}><div style={{height:"100%",width:`${(step/SLABELS.length)*100}%`,background:"linear-gradient(90deg,#c9a84c,#e8d070)",transition:"width .4s ease"}}/></div>
      <div style={{padding:"14px 5% 0",display:"flex",gap:3,overflowX:"auto",justifyContent:"center",flexWrap:"wrap"}}>
        {SLABELS.map((s,i)=>(
          <div key={s} style={{display:"flex",alignItems:"center",gap:3}}>
            <div style={{display:"flex",alignItems:"center",gap:4,opacity:i+1>step?.45:1}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:i+1<step?"#c9a84c":i+1===step?"transparent":"rgba(255,255,255,.08)",border:i+1===step?"2px solid #c9a84c":"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:i+1<step?"#0a0f1e":i+1===step?"#c9a84c":"#555",flexShrink:0}}>{i+1<step?"✓":i+1}</div>
              <span style={{fontSize:9,color:i+1===step?"#c9a84c":i+1<step?"rgba(255,255,255,.65)":"rgba(255,255,255,.25)",whiteSpace:"nowrap"}}>{s}</span>
            </div>
            {i<SLABELS.length-1&&<div style={{width:10,height:1,background:"rgba(255,255,255,.12)",flexShrink:0}}/>}
          </div>
        ))}
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"36px 5% 100px"}}>

        {step===1&&<div className="fu">
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,6vw,44px)",fontWeight:400,marginBottom:6}}>Select Your <span style={{fontStyle:"italic",color:"#c9a84c"}}>Vessel</span></h2>
          <p style={{color:"rgba(255,255,255,.4)",marginBottom:28,fontSize:14}}>${BOAT_RATE}/hr - 2 hr minimum - $500 deposit - Up to 12 guests</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:18}}>
            {BOATS.map(b=>(
              <div key={b.id} onClick={()=>setBoat(b)} style={{border:boat?.id===b.id?"2px solid #c9a84c":"1px solid rgba(255,255,255,.1)",borderRadius:14,overflow:"hidden",cursor:"pointer",transition:"all .2s",background:boat?.id===b.id?"rgba(201,168,76,.05)":"rgba(255,255,255,.02)",transform:boat?.id===b.id?"scale(1.02)":"scale(1)"}}>
                <div style={{height:180,backgroundImage:`url(${b.photo})`,backgroundSize:"cover",backgroundPosition:"center",position:"relative"}}>
                  <div style={{position:"absolute",inset:0,background:"rgba(10,15,30,.3)"}}/>
                  <div style={{position:"absolute",bottom:12,left:16,fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600,color:"#fff"}}>{b.name}</div>
                </div>
                <div style={{padding:18}}>
                  <div style={{fontSize:9,letterSpacing:3,color:b.accent,textTransform:"uppercase",marginBottom:6}}>{b.subtitle}</div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,.5)",lineHeight:1.6,marginBottom:14}}>{b.description}</div>
                  <div style={{fontSize:20,fontFamily:"'Cormorant Garamond',serif",color:"#c9a84c",fontWeight:600}}>${BOAT_RATE}<span style={{fontSize:11,color:"rgba(255,255,255,.35)",fontFamily:"'DM Sans',sans-serif"}}>/hr</span></div>
                </div>
                {boat?.id===b.id&&<div style={{background:"#c9a84c",padding:7,textAlign:"center",fontSize:11,fontWeight:700,color:"#0a0f1e",letterSpacing:1,textTransform:"uppercase"}}>✓ Selected</div>}
              </div>
            ))}
          </div>
        </div>}

        {step===2&&<div className="fu">
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,6vw,44px)",fontWeight:400,marginBottom:6}}>Select <span style={{fontStyle:"italic",color:"#c9a84c"}}>Duration</span></h2>
          <p style={{color:"rgba(255,255,255,.4)",marginBottom:28,fontSize:14}}>${BOAT_RATE} per hour — your price builds as you choose.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr",gap:24}}>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {DURATIONS.map(d=>(
                <div key={d.id} onClick={()=>setDur(d)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"15px 18px",border:dur?.id===d.id?"1.5px solid #c9a84c":"1px solid rgba(255,255,255,.1)",borderRadius:10,cursor:"pointer",background:dur?.id===d.id?"rgba(201,168,76,.07)":"rgba(255,255,255,.02)",transition:"all .2s"}}>
                  <div><div style={{fontWeight:600,fontSize:15}}>{d.label}</div><div style={{fontSize:11,color:"rgba(255,255,255,.38)",marginTop:2}}>{d.hours} hrs - {d.sub}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:dur?.id===d.id?"#c9a84c":"rgba(255,255,255,.55)",fontWeight:600}}>${(d.hours*BOAT_RATE).toLocaleString()}</div></div>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.28)",borderRadius:14,padding:24}}>
              <div style={{fontSize:10,letterSpacing:3,color:"#c9a84c",textTransform:"uppercase",marginBottom:14}}>Live Price Summary</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:44,fontWeight:600,color:"#c9a84c",lineHeight:1,marginBottom:4}}>{dur?`$${(dur.hours*BOAT_RATE).toLocaleString()}`:"$—"}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.38)",marginBottom:16}}>{dur?`${dur.hours} hrs × $${BOAT_RATE}/hr`:"Select a duration above"}</div>
              <div style={{display:"flex",flexDirection:"column",gap:7,paddingTop:14,borderTop:"1px solid rgba(255,255,255,.08)"}}>
                {[["Vessel",boat?.name||"—"],["Rate",`$${BOAT_RATE}/hr`],["Hours",dur?`${dur.hours} hrs`:"—"],["Charter Fee",dur?`$${(dur.hours*BOAT_RATE).toLocaleString()}`:"—"],["Deposit Now","$500"],["Balance Due",dur?`$${(dur.hours*BOAT_RATE-DEPOSIT).toLocaleString()}`:"—"]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"rgba(255,255,255,.42)"}}>{k}</span><span style={{color:k==="Charter Fee"||k==="Deposit Now"?"#c9a84c":"#fff",fontWeight:k==="Charter Fee"||k==="Deposit Now"?600:400}}>{v}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>}

        {step===3&&<div className="fu">
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,6vw,44px)",fontWeight:400,marginBottom:6}}>Choose Your <span style={{fontStyle:"italic",color:"#c9a84c"}}>Destination</span></h2>
          <p style={{color:"rgba(255,255,255,.4)",marginBottom:28,fontSize:14}}>Your captain will guide you there.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:14}}>
            {DESTINATIONS.map(d=>(
              <div key={d.id} onClick={()=>setDest(d)} style={{borderRadius:12,overflow:"hidden",border:dest?.id===d.id?"2px solid #c9a84c":"1px solid rgba(255,255,255,.1)",cursor:"pointer",transition:"all .2s",transform:dest?.id===d.id?"scale(1.02)":"scale(1)"}}>
                <div style={{height:130,backgroundImage:`url(${d.photo})`,backgroundSize:"cover",backgroundPosition:"center",position:"relative"}}>
                  <div style={{position:"absolute",inset:0,background:"rgba(10,15,30,.35)"}}/>
                  <div style={{position:"absolute",top:10,left:12,fontSize:22}}>{d.icon}</div>
                </div>
                <div style={{padding:16,background:dest?.id===d.id?"rgba(201,168,76,.06)":"rgba(255,255,255,.02)"}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:600,marginBottom:6}}>{d.name}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.48)",lineHeight:1.6}}>{d.desc}</div>
                  {dest?.id===d.id&&<div style={{marginTop:8,fontSize:11,color:"#c9a84c",fontWeight:600}}>✓ Selected</div>}
                </div>
              </div>
            ))}
          </div>
        </div>}

        {step===4&&<div className="fu">
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,6vw,44px)",fontWeight:400,marginBottom:6}}>Pick Your <span style={{fontStyle:"italic",color:"#c9a84c"}}>Date & Time</span></h2>
          <p style={{color:"rgba(255,255,255,.4)",marginBottom:10,fontSize:14}}>Arrive 15-20 minutes early. Times are strict with a 30-minute buffer between charters.</p>
          <div style={{background:"rgba(255,80,80,.06)",border:"1px solid rgba(255,80,80,.2)",borderRadius:8,padding:"10px 16px",marginBottom:24,fontSize:12,color:"rgba(255,140,140,.8)"}}>⏰ <strong>Important:</strong> Charter times are strict. Late arrivals do not extend your charter window. Please plan to arrive early.</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:24,alignItems:"flex-start"}}>
            <SmartCal sel={date} onSel={setDate} vesselId={boat?.id} hours={dur?.hours||2} bookedSlots={bookedSlots} loadingSlots={loadingSlots}/>
            <div>
              <div style={{fontSize:10,letterSpacing:2,color:"#c9a84c",textTransform:"uppercase",marginBottom:6}}>Departure Time</div>
              {loadingSlots&&<div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:12}}>Checking availability...</div>}
              {!loadingSlots&&date&&bookedSlots.length>0&&<div style={{fontSize:12,color:"rgba(255,190,50,.7)",marginBottom:12}}>⚠️ Some times unavailable for {fmtDate(date)}</div>}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:8}}>
                {TIMES.map(t=>{
                  const blocked = dur ? isTimeBlocked(t,dur.hours,bookedSlots) : false;
                  return (
                    <button key={t} disabled={blocked||!date} onClick={()=>setTime(t)} style={{padding:11,border:time===t?"1.5px solid #c9a84c":blocked?"1px solid rgba(255,80,80,.2)":"1px solid rgba(255,255,255,.1)",borderRadius:8,background:time===t?"rgba(201,168,76,.1)":blocked?"rgba(255,80,80,.04)":"rgba(255,255,255,.02)",color:time===t?"#c9a84c":blocked?"rgba(255,80,80,.4)":"rgba(255,255,255,.65)",cursor:blocked||!date?"not-allowed":"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:time===t?600:400,transition:"all .2s",textAlign:"center"}}>
                      {t}{blocked&&<span style={{display:"block",fontSize:8,color:"rgba(255,80,80,.5)",marginTop:2}}>Booked</span>}
                    </button>
                  );
                })}
              </div>
              {date&&time&&!isTimeBlocked(time,dur?.hours||2,bookedSlots)&&<div style={{marginTop:18,background:"rgba(201,168,76,.08)",border:"1px solid rgba(201,168,76,.22)",borderRadius:10,padding:"14px 16px"}}>
                <div style={{fontSize:10,color:"#c9a84c",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Your Charter Window</div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,fontWeight:600}}>{fmtDate(date)}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,.55)",marginTop:3}}>{time} → {endT} ({dur?.hours} hrs)</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>31st St - {boat?.name}</div>
              </div>}
            </div>
          </div>
        </div>}

        {step===5&&<div className="fu">
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,6vw,44px)",fontWeight:400,marginBottom:6}}>Your <span style={{fontStyle:"italic",color:"#c9a84c"}}>Information</span></h2>
          <p style={{color:"rgba(255,255,255,.4)",marginBottom:28,fontSize:14}}>Used to generate your charter agreement and confirmation email.</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:36}}>
            <div>
              <div style={{fontSize:10,letterSpacing:3,color:"#c9a84c",textTransform:"uppercase",marginBottom:16}}>Client Details</div>
              {[["Full Legal Name","name","text","Your full name"],["Email Address","email","email","your@email.com"],["Phone Number","phone","tel","708-000-0000"]].map(([lbl,f,t,ph])=>(
                <div key={f} style={{marginBottom:14}}><label style={{fontSize:11,color:"rgba(255,255,255,.45)",display:"block",marginBottom:5}}>{lbl}</label><input type={t} placeholder={ph} value={info[f]} onChange={e=>setInfo({...info,[f]:e.target.value})} style={inp}/></div>
              ))}
            </div>
            <div>
              <div style={{fontSize:10,letterSpacing:3,color:"#c9a84c",textTransform:"uppercase",marginBottom:16}}>Host Details <span style={{fontSize:9,color:"rgba(255,255,255,.25)"}}>(optional)</span></div>
              {[["Host Name","name","Event host"],["Host Email","email","host@email.com"]].map(([lbl,f,ph])=>(
                <div key={f} style={{marginBottom:14}}><label style={{fontSize:11,color:"rgba(255,255,255,.45)",display:"block",marginBottom:5}}>{lbl}</label><input placeholder={ph} value={host[f]} onChange={e=>setHost({...host,[f]:e.target.value})} style={inp}/></div>
              ))}
              <div style={{marginTop:18,background:"rgba(201,168,76,.06)",border:"1px solid rgba(201,168,76,.2)",borderRadius:10,padding:18}}>
                <div style={{fontSize:10,color:"#c9a84c",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>Booking Summary</div>
                {[["Vessel",boat?.name],["Duration",`${dur?.label} (${dur?.hours} hrs)`],["Destination",dest?.name],["Date",fmtDate(date)],["Time",`${time} – ${endT}`],["Charter Fee",`$${total.toLocaleString()}`],["Deposit","$500"],["Balance Due",`$${balance.toLocaleString()}`]].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}><span style={{color:"rgba(255,255,255,.4)"}}>{k}</span><span style={{color:k==="Charter Fee"||k==="Deposit"?"#c9a84c":"#fff",fontWeight:k==="Charter Fee"?600:400}}>{v}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>}

        {step===6&&<div className="fu">
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,6vw,44px)",fontWeight:400,marginBottom:6}}>Charter <span style={{fontStyle:"italic",color:"#c9a84c"}}>Agreement</span></h2>
          <p style={{color:"rgba(255,255,255,.4)",marginBottom:24,fontSize:14}}>Review and sign to proceed. A signed PDF will be automatically downloaded upon confirmation.</p>
          <div style={{background:"#fff",borderRadius:12,padding:"34px 28px",color:"#1a1a1a",maxWidth:740,margin:"0 auto 22px",boxShadow:"0 24px 80px rgba(0,0,0,.55)"}}>
            <div style={{textAlign:"center",marginBottom:22,paddingBottom:18,borderBottom:"2.5px solid #0a0f1e"}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,letterSpacing:3,color:"#0a0f1e"}}>LDG CHARTERS</div>
              <div style={{fontSize:11,letterSpacing:3,color:"#888",textTransform:"uppercase",marginTop:3}}>Master Charter Agreement</div>
            </div>
            <section style={{marginBottom:18}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:9,paddingBottom:4,borderBottom:"1px solid #ebebeb"}}>Client Information</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
                {[["Client Name",info.name],["Email",info.email],["Phone",info.phone],["Charter Date",fmtDate(date)]].map(([k,v])=>(
                  <div key={k} style={{background:"#f7f7f7",padding:"7px 10px",borderRadius:4}}><div style={{fontSize:9,color:"#999",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{k}</div><div style={{fontSize:12,fontWeight:500}}>{v||"—"}</div></div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                {[["Vessel",boat?.name],["Window",`${time||"—"} – ${endT}`],["Departure","31st Street Harbor"]].map(([k,v])=>(
                  <div key={k} style={{background:"#f7f7f7",padding:"7px 10px",borderRadius:4}}><div style={{fontSize:9,color:"#999",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>{k}</div><div style={{fontSize:12,fontWeight:500}}>{v||"—"}</div></div>
                ))}
              </div>
            </section>
            <section style={{marginBottom:18}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:9,paddingBottom:4,borderBottom:"1px solid #ebebeb"}}>Charter Fees</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <tbody>
                  {[["Boat Rental Rate",`$${BOAT_RATE}.00/hr`],["Total Hours",`${dur?.hours} hrs`],["Charter Fee",`$${total.toLocaleString()}.00`],["Non-Refundable Deposit","$500.00"],["Remaining Balance",`$${balance.toLocaleString()}.00`]].map(([k,v],i)=>(
                    <tr key={k} style={{borderBottom:"1px solid #f2f2f2"}}><td style={{padding:"6px 9px",color:"#555",background:i%2===0?"#fafafa":"#fff"}}>{k}</td><td style={{padding:"6px 9px",fontWeight:600,textAlign:"right",background:i%2===0?"#fafafa":"#fff"}}>{v}</td></tr>
                  ))}
                </tbody>
              </table>
            </section>
            <div style={{marginBottom:14,padding:"10px 12px",background:"rgba(255,80,80,.05)",border:"1px solid rgba(255,80,80,.15)",borderRadius:6,fontSize:11,color:"#cc4444"}}>⏰ Charter times are STRICT. Arrive 15-20 minutes early. Late arrivals do not extend your charter window.</div>
            <section style={{marginBottom:18}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:9,paddingBottom:4,borderBottom:"1px solid #ebebeb"}}>Agreement Terms</div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {TERMS.map(t=>(
                  <div key={t.n} style={{display:"flex",gap:8,fontSize:11,lineHeight:1.6}}><span style={{fontWeight:700,color:"#0a0f1e",minWidth:14,flexShrink:0}}>{t.n}.</span><div><span style={{fontWeight:700,color:"#0a0f1e"}}>{t.t}: </span><span style={{color:"#555"}}>{t.b}</span></div></div>
                ))}
              </div>
            </section>
            <section>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:12,paddingBottom:4,borderBottom:"1px solid #ebebeb"}}>Signatures</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:10}}>
                <div><div style={{fontSize:12,fontWeight:600,marginBottom:5}}>Client: {info.name||"—"}</div><SigCanvas label="Client Signature" onSigned={setCSig}/><div style={{fontSize:10,color:"#888",marginTop:4}}>Date: {fmtDate(date)||new Date().toLocaleDateString()}</div></div>
                <div><div style={{fontSize:12,fontWeight:600,marginBottom:5}}>LDG Charters Representative</div><div style={{border:"1.5px solid #c9a84c",borderRadius:6,background:"#fff",padding:"8px 12px",height:88,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontStyle:"italic",color:"#222"}}>Lorenzo McKinnie</div></div><div style={{fontSize:10,color:"#888",marginTop:4}}>Lorenzo McKinnie - LDG Charters</div></div>
              </div>
            </section>
          </div>
          {!cSig&&<div style={{textAlign:"center",color:"rgba(255,200,50,.8)",fontSize:13}}>Please sign above to continue</div>}
          {cSig&&<div style={{textAlign:"center"}}><span style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(58,170,102,.12)",border:"1px solid rgba(58,170,102,.35)",borderRadius:8,padding:"10px 20px",color:"#3aaa66",fontSize:13}}>✓ Agreement signed — proceed to invoice</span></div>}
        </div>}

        {step===7&&<div className="fu">
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(30px,6vw,44px)",fontWeight:400,marginBottom:6}}>Your <span style={{fontStyle:"italic",color:"#c9a84c"}}>Invoice</span></h2>
          <p style={{color:"rgba(255,255,255,.4)",marginBottom:24,fontSize:14}}>Select payment option. Your signed agreement PDF downloads automatically on confirmation.</p>
          <div style={{background:"#fff",borderRadius:12,padding:"34px 28px",color:"#1a1a1a",maxWidth:640,margin:"0 auto 22px",boxShadow:"0 24px 80px rgba(0,0,0,.55)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22,paddingBottom:18,borderBottom:"3px solid #0a0f1e"}}>
              <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,letterSpacing:2,color:"#0a0f1e"}}>LDG CHARTERS</div><div style={{fontSize:11,color:"#888",marginTop:3}}>31st Street Harbor - Chicago IL - 708-846-3132</div></div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"#c9a84c"}}>INVOICE</div><div style={{fontSize:11,color:"#888",marginTop:3}}>{new Date().toLocaleDateString()}</div></div>
            </div>
            <div style={{marginBottom:16}}><div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:7}}>Bill To</div><div style={{fontSize:14,fontWeight:600,color:"#0a0f1e"}}>{info.name}</div><div style={{fontSize:12,color:"#666"}}>{info.email}</div><div style={{fontSize:12,color:"#666"}}>{info.phone}</div></div>
            <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}>
              <thead><tr style={{background:"#0a0f1e"}}>{["Description","Qty","Rate","Amount"].map((h,i)=><th key={h} style={{padding:"7px 10px",textAlign:i===0?"left":i===3?"right":"center",color:"#fff",fontSize:10,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
              <tbody>
                <tr style={{borderBottom:"1px solid #f0f0f0"}}><td style={{padding:10,fontSize:12}}><div style={{fontWeight:600}}>{boat?.name} Charter</div><div style={{fontSize:10,color:"#888",marginTop:2}}>{dest?.name} - {fmtDate(date)} - {time} – {endT}</div></td><td style={{padding:10,textAlign:"center",fontSize:12}}>{dur?.hours} hrs</td><td style={{padding:10,textAlign:"center",fontSize:12}}>${BOAT_RATE}</td><td style={{padding:10,textAlign:"right",fontSize:12,fontWeight:600}}>${total.toLocaleString()}</td></tr>
              </tbody>
            </table>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
              <div style={{width:240}}>
                {[["Charter Fee",`$${total.toLocaleString()}`],["Deposit Paid","($500)"],["Balance Due",`$${balance.toLocaleString()}`]].map(([k,v],i)=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderTop:i===0?"none":"1px solid #f0f0f0",fontSize:12,fontWeight:i===2?700:400,color:i===2?"#0a0f1e":"#555"}}><span>{k}</span><span>{v}</span></div>
                ))}
                <div style={{marginTop:3,padding:"7px 0 0",borderTop:"2.5px solid #0a0f1e",display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:700,color:"#0a0f1e"}}><span>TOTAL</span><span>${total.toLocaleString()}</span></div>
              </div>
            </div>
            {!saved&&<>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:12}}>Select Payment Option</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
                <div onClick={()=>setPayOpt("deposit")} style={{border:payOpt==="deposit"?"2.5px solid #c9a84c":"1px solid #ddd",borderRadius:8,padding:14,cursor:"pointer",background:payOpt==="deposit"?"#fffbf0":"#fff",transition:"all .2s"}}><div style={{fontWeight:700,fontSize:13,color:"#0a0f1e",marginBottom:4}}>Pay Deposit</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"#c9a84c"}}>$500.00</div><div style={{fontSize:10,color:"#888",marginTop:3}}>Non-refundable - Secures booking</div></div>
                <div onClick={()=>setPayOpt("full")} style={{border:payOpt==="full"?"2.5px solid #0a0f1e":"1px solid #ddd",borderRadius:8,padding:14,cursor:"pointer",background:payOpt==="full"?"#f0f0f5":"#fff",transition:"all .2s"}}><div style={{fontWeight:700,fontSize:13,color:"#0a0f1e",marginBottom:4}}>Pay in Full</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"#0a0f1e"}}>${total.toLocaleString()}</div><div style={{fontSize:10,color:"#888",marginTop:3}}>No remaining balance</div></div>
              </div>
              {saveErr&&<div style={{background:"rgba(255,80,80,.1)",border:"1px solid rgba(255,80,80,.3)",borderRadius:6,padding:"10px 14px",fontSize:13,color:"#ff5050",marginBottom:12}}>{saveErr}</div>}
              {payOpt&&<button onClick={()=>saveBooking(payOpt)} disabled={saving} style={{width:"100%",background:"#0a0f1e",color:"#fff",border:"none",padding:14,borderRadius:8,cursor:saving?"default":"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,letterSpacing:1.5,textTransform:"uppercase",opacity:saving?.7:1}}>{saving?"Confirming & generating PDF...":payOpt==="deposit"?"Confirm & Pay $500 Deposit →":`Confirm & Pay $${total.toLocaleString()} in Full →`}</button>}
            </>}
            {saved&&<div style={{background:"#f0fff5",border:"2px solid #3aaa66",borderRadius:10,padding:20,textAlign:"center"}}>
              <div style={{fontSize:26,marginBottom:6}}>🎉</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,fontWeight:700,color:"#1a7a44",marginBottom:5}}>Booking Confirmed!</div>
              <div style={{fontSize:13,color:"#2a5a34",lineHeight:1.65,marginBottom:12}}>Thank you <strong>{info.name}</strong>! Your charter of <strong>{boat?.name}</strong> on <strong>{fmtDate(date)}</strong> is confirmed.<br/>Your signed agreement PDF has been downloaded. Call <strong>708-846-3132</strong> with questions.</div>
              <button onClick={()=>generatePDF({clientName:info.name,clientEmail:info.email,clientPhone:info.phone,vessel:boat?.name,charterDate:date,startTime:time,endTime:endT,duration:`${dur?.label}`,destination:dest?.name,boatFee:total,totalPrice:total,deposit:DEPOSIT,balance,paymentOption:payOpt,clientSignature:cSig})} style={{background:"rgba(58,170,102,.15)",border:"1px solid rgba(58,170,102,.4)",color:"#3aaa66",padding:"8px 20px",borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600}}>📄 Re-download Agreement PDF</button>
            </div>}
            <div style={{marginTop:12,padding:10,background:"#f8f8f8",borderRadius:6,fontSize:10,color:"#999",lineHeight:1.6}}>Deposit non-refundable. Balance due 48 hrs prior. Charter times strict — arrive early. 708-846-3132</div>
          </div>
          <div style={{textAlign:"center",marginTop:14}}><button onClick={reset} style={{background:"transparent",border:"1px solid rgba(255,255,255,.2)",color:"rgba(255,255,255,.45)",padding:"9px 22px",borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12}}>Return to Home</button></div>
        </div>}

        {step<7&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:40,paddingTop:20,borderTop:"1px solid rgba(255,255,255,.07)"}}>
          <button onClick={()=>step>1?setStep(step-1):reset()} style={{background:"transparent",border:"1px solid rgba(255,255,255,.18)",color:"rgba(255,255,255,.55)",padding:"11px 26px",borderRadius:6,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13}}>{step===1?"Back to Home":"Previous"}</button>
          {!canNext()&&<div style={{fontSize:12,color:"rgba(255,255,255,.28)",textAlign:"center",flex:1,padding:"0 14px"}}>
            {step===4&&date&&!time?"Select an available time slot":step===4&&time&&isTimeBlocked(time,dur?.hours||2,bookedSlots)?"That time is unavailable — please select another":"Select an option to continue"}
          </div>}
          <button disabled={!canNext()} onClick={()=>setStep(step+1)} style={{background:canNext()?"#c9a84c":"rgba(255,255,255,.08)",color:canNext()?"#0a0f1e":"rgba(255,255,255,.18)",border:"none",padding:"11px 32px",borderRadius:6,cursor:canNext()?"pointer":"default",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",transition:"all .2s"}}>
            {step===6?"Proceed to Invoice →":"Continue →"}
          </button>
        </div>}
      </div>
    </div>
    </>
  );
}
