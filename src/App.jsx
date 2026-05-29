import { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, addDoc, getDocs, doc, updateDoc,
  query, orderBy, where, serverTimestamp
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey:"AIzaSyD7FXHsL8479v6YQHptUAD5ekeTWgq69pc",
  authDomain:"ldg-charters.firebaseapp.com",
  projectId:"ldg-charters",
  storageBucket:"ldg-charters.firebasestorage.app",
  messagingSenderId:"579038723673",
  appId:"1:579038723673:web:fee2b780d87c470b867b48",
  measurementId:"G-1KT945WNFC",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// ── PHOTO URLS ───────────────────────────────────────────────────────────────
const P = {
  hero:    "https://drive.google.com/uc?export=view&id=10pokZrXZkrbvna_zlpl0zSQ8KOYzTTRD",
  sunset:  "https://drive.google.com/uc?export=view&id=1-6JYcavMee4mprZgtOk1cKDD4GWxZ-kW",
  group:   "https://drive.google.com/uc?export=view&id=18tboUDO0dccG-0fFycBuiQYnn8SJqWbC",
  deck:    "https://drive.google.com/uc?export=view&id=1z7AbVb5dOPDpRxDu9G63jw6s0SBNLkuo",
  dusk:    "https://drive.google.com/uc?export=view&id=1ii8rHhtiRowPpPYfO--P7JSA9PIeS8XV",
  night:   "https://drive.google.com/uc?export=view&id=1M_aM9W8D98Cph6Kpdixcu0eh6-zx52XR",
  playpen: "https://drive.google.com/uc?export=view&id=1HIhJMwO6FZKn1ut4KwuCwittaK2E3EUK",
  skyline: "https://drive.google.com/uc?export=view&id=1TQ25g1JzxXgDtUO5CHPqAasiKMz1NBEN",
  crowd:   "https://drive.google.com/uc?export=view&id=1Vb1oSduO5fl1xCq0fyn167gdyN5dOmQA",
};

// ── DATA ─────────────────────────────────────────────────────────────────────
const BOATS = [
  {
    id:"get-down-lo",
    name:"Get Down Lo",
    subtitle:"Express Cruiser · Vessel 1",
    tagline:"Sleek. Stylish. Iconic.",
    description:"The flagship of the LDG fleet. A premium express cruiser built for unforgettable moments on Lake Michigan. Open-air luxury with room for up to 12 guests.",
    features:["Sun deck & swim platform","Premium sound system","Cups, ice & silverware included","Up to 12 guests"],
    bg:"linear-gradient(135deg,#0d2240,#0a1628,#0d2f50)", accent:"#4a9eff",
    photo: P.deck,
  },
  {
    id:"get-down-lo-ii",
    name:"Get Down Lo II",
    subtitle:"Express Cruiser · Vessel 2",
    tagline:"Same luxury. Double the availability.",
    description:"Identical twin to the original Get Down Lo. The same premium express cruiser experience — perfect for groups who want the full LDG treatment on Lake Michigan.",
    features:["Sun deck & swim platform","Premium sound system","Cups, ice & silverware included","Up to 12 guests"],
    bg:"linear-gradient(135deg,#1e0d40,#120828,#2a1050)", accent:"#a06eff",
    photo: P.hero,
  },
];

const DURATIONS = [
  {id:"tour",   label:"Take A Tour",          hours:2, sub:"Quick escape on the water"},
  {id:"classic",label:"Classic Lake Day",     hours:3, sub:"The perfect afternoon outing"},
  {id:"exp",    label:"Enjoy the Experience", hours:4, sub:"Unhurried luxury on the lake"},
  {id:"norush", label:"No Rush",              hours:5, sub:"The full Lake Michigan experience"},
  {id:"ext6",   label:"Extended (6 hrs)",     hours:6, sub:"For those who want it all"},
  {id:"ext7",   label:"Full Day (7 hrs)",      hours:7, sub:"Dawn to dusk on the water"},
  {id:"ext8",   label:"All Day (8 hrs)",       hours:8, sub:"The ultimate charter day"},
];

const DESTINATIONS = [
  {id:"skyline",   name:"Chicago Skyline Cruise", icon:"🏙️", desc:"Cruise along the iconic Chicago skyline — the most stunning view in the world.", photo:P.skyline},
  {id:"playpen",   name:"The Playpen",            icon:"⚓",  desc:"Anchor at Monroe Harbor's legendary cove where Chicago's boating scene comes alive.", photo:P.playpen},
  {id:"navy-pier", name:"Navy Pier",              icon:"🎡", desc:"Cruise past Chicago's iconic Navy Pier, Ferris wheel, and vibrant lakefront.", photo:P.deck},
  {id:"calumet",   name:"Calumet Harbor",         icon:"🌊", desc:"A scenic journey south along the shoreline to the peaceful Calumet Harbor.", photo:P.hero},
  {id:"open-water",name:"Open Water Adventure",   icon:"🧭", desc:"Head into the deep blue of Lake Michigan with the Chicago skyline on the horizon.", photo:P.group},
  {id:"sunset",    name:"Sunset Cruise",          icon:"🌅", desc:"Time your departure for golden hour as the skyline ignites in amber and gold.", photo:P.sunset},
];

const TIMES = ["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM"];

const CELEBRATIONS = [
  {id:"birthday",   name:"Birthday",               icon:"🎂", desc:"Make their special day unforgettable on the water."},
  {id:"anniversary",name:"Anniversary",            icon:"💍", desc:"Celebrate your love story on Lake Michigan."},
  {id:"corporate",  name:"Corporate Event",        icon:"💼", desc:"Impress your team or clients with a lakeside experience."},
  {id:"girls-night",name:"Girls Night Out",        icon:"🥂", desc:"The ultimate girls night — vibes, views, and the lake."},
  {id:"bach",       name:"Bachelor / Bachelorette",icon:"🎉", desc:"Send them off in style before the big day."},
  {id:"celebrating",name:"Just Celebrating",       icon:"✨", desc:"No occasion needed — life is worth celebrating."},
];

const DOCK_DURATIONS = [
  {id:"d1",label:"1 Hour",  hours:1, sub:"A quick dockside toast"},
  {id:"d2",label:"2 Hours", hours:2, sub:"The perfect party window"},
  {id:"d3",label:"3 Hours", hours:3, sub:"Full celebration experience"},
  {id:"d4",label:"4 Hours", hours:4, sub:"Go all out at the dock"},
];

const TERMS = [
  {n:1,  t:"PAYMENT AND BOOKING",          b:"Deposit required to secure vessel. Remaining balance due 48 hours before departure."},
  {n:2,  t:"BOARDING AND DEPARTURE",       b:"Arrive 15-20 minutes early for check-in and safety briefing. Charter times are STRICT — late arrivals do not extend the charter window."},
  {n:3,  t:"PASSENGER LIMITS",             b:"Must comply with U.S. Coast Guard regulations. Maximum 12 guests per vessel."},
  {n:4,  t:"SAFETY RULES AND CONDUCT",     b:"Follow captain instructions at all times. Unsafe behavior may end charter with no refund. Swimming only with captain approval. Children under 13 must wear life jackets."},
  {n:5,  t:"WEATHER POLICY",               b:"Only the captain may cancel or delay. Unsafe conditions include lightning, high winds, fog, or hazardous waves. Weather cancellations receive a reschedule or credit."},
  {n:6,  t:"CANCELLATIONS AND REFUNDS",    b:"Deposits are non-refundable. Cancellation within 48 hours requires full payment. Captain cancellations receive a reschedule or credit. No-shows forfeit all payments."},
  {n:7,  t:"ALCOHOL AND SUBSTANCE POLICY", b:"Alcohol allowed in moderation. Illegal substances prohibited. Smoking only in approved areas. Glass is discouraged."},
  {n:8,  t:"DAMAGE LIABILITY",             b:"Client is responsible for damage, excessive mess, or lost items."},
  {n:9,  t:"FOOD AND OUTSIDE ITEMS",       b:"Food and catering allowed. No open flames. Coolers must not block walkways. Trash must go in bins."},
  {n:10, t:"INDEMNIFICATION",              b:"Client indemnifies LDG Charters for the actions of themselves or their guests."},
  {n:11, t:"HARBOR RULES",                 b:"All guests must comply with harbor and U.S. Coast Guard regulations."},
  {n:12, t:"FINAL TERMS",                  b:"This agreement is governed by Illinois law. Any modification must be in writing."},
];

const BLOG_POSTS = [
  {
    slug:"how-much-does-it-cost-to-rent-a-boat-in-chicago",
    title:"How Much Does It Cost to Rent a Boat in Chicago?",
    date:"May 2025",
    readTime:"4 min read",
    excerpt:"Chicago boat rental prices vary widely depending on vessel size, duration, and season. Here's the complete 2025 pricing breakdown.",
    content:`Chicago boat rental prices typically range from $300 to $600+ per hour depending on the vessel and operator. At LDG Charters, we keep it simple — $300 per hour for our premium express cruisers with a 2-hour minimum and a $500 deposit to secure your booking.

**What's included in your rental:**
Most Chicago charter companies, including LDG Charters, provide cups, ice, plastic silverware, and paper towels. You bring your own drinks and food. Captain services are arranged separately and priced per trip.

**Typical Chicago boat rental price ranges (2025):**
- Small pontoon boats: $150–$250/hr
- Express cruisers (10-12 guests): $300–$500/hr  
- Luxury yachts (12+ guests): $500–$1,000+/hr
- Party boats: $600–$1,200/hr flat rate

**What drives the price up?**
Peak season (June–August), weekends, and holidays command premium pricing. Sunset and nighttime charters often carry a premium due to demand. Adding catering, decorations, or specialty equipment also increases costs.

**Is it worth it?**
Absolutely. A 3-hour charter for 10 guests works out to roughly $90 per person — less than a nice dinner out — with an experience that's completely unique to Chicago. There's nothing like seeing the skyline from the water.

**Book your charter at LDG Charters starting at $300/hr →**`,
  },
  {
    slug:"is-lake-michigan-safe-for-boating",
    title:"Is Lake Michigan Safe for Boating?",
    date:"April 2025",
    readTime:"5 min read",
    excerpt:"Lake Michigan is one of America's greatest boating destinations — but like any large body of water, safety awareness is essential. Here's what you need to know.",
    content:`Lake Michigan is absolutely safe for boating when you take the right precautions. As the second-largest of the Great Lakes by surface area, it offers world-class boating conditions most of the season — but it demands respect.

**Why Lake Michigan is excellent for boating:**
- Calm, protected conditions near the Chicago shoreline most summer days
- Spectacular scenery with the Chicago skyline as your backdrop
- Warm water temperatures from June through September
- Well-maintained harbor infrastructure at 31st Street Harbor

**When to be cautious:**
Lake Michigan can generate waves of 6–8 feet or more during storms. Squalls can develop quickly, particularly in spring and fall. Our licensed captains monitor conditions constantly and will cancel or delay a charter if conditions aren't safe — your safety always comes first.

**Safety standards at LDG Charters:**
All charters depart from 31st Street Harbor with life jackets for all passengers. Children under 13 are required to wear life jackets at all times. Swimming is only permitted with captain approval in designated safe areas.

**Best conditions for Lake Michigan boating:**
June, July, and August offer the most consistent, calm conditions with water temperatures reaching 65–75°F. September and early October bring beautiful fall colors and fewer crowds, though weather can be more variable.`,
  },
  {
    slug:"what-is-the-playpen-chicago",
    title:"What Is The Playpen Chicago? The Ultimate Guide",
    date:"June 2025",
    readTime:"6 min read",
    excerpt:"Chicago's legendary Playpen is the city's most iconic boating gathering. Here's everything you need to know about this bucket-list experience.",
    content:`The Playpen is Chicago's iconic weekend boat gathering at Monroe Harbor, just off the Chicago lakefront. Every summer weekend, hundreds of boats raft up together in one of the most epic social gatherings on any American waterway.

**What happens at The Playpen:**
Boats anchor and tie up together in a massive floating party. Music plays from every direction, people swim between boats, and the Chicago skyline provides an unbeatable backdrop. It's a uniquely Chicago experience that you simply can't find anywhere else.

**When does The Playpen happen:**
The Playpen runs on summer weekends, typically from Memorial Day through Labor Day. The busiest and most epic days are Saturday afternoons from about noon to 6 PM. July 4th weekend is legendary.

**How do you get to The Playpen:**
The best way is to charter a boat — like LDG Charters departing from 31st Street Harbor. From the harbor, the run to The Playpen takes about 15-20 minutes. Alternatively, some companies offer water taxi service, but nothing beats arriving on your own private charter.

**What to bring:**
Music (a Bluetooth speaker), drinks, snacks, sunscreen, and good vibes. LDG Charters provides cups, ice, and silverware. You handle the drinks and food.

**Is The Playpen safe:**
The Coast Guard and Chicago Police Marine Unit patrol The Playpen regularly. As with any large gathering on the water, you should swim with a buddy, wear sunscreen, and pace your drinking.

**Book a Playpen charter with LDG Charters →**`,
  },
  {
    slug:"best-time-to-rent-boat-chicago",
    title:"Best Time of Year to Rent a Boat in Chicago",
    date:"March 2025",
    readTime:"4 min read",
    excerpt:"Chicago's boating season runs May through October, but the sweet spot depends on what kind of experience you're after. Here's our insider breakdown.",
    content:`Chicago's boating season officially runs from May through October, with peak season from June through August. Each month offers a different experience on Lake Michigan.

**May — Early Season**
The lake is waking up. Fewer crowds, lower prices. Water is still cool (55–62°F) so swimming isn't ideal, but conditions are often beautiful and the city looks stunning from the water. Perfect for corporate events and intimate charters.

**June — Season Kick-Off**
The sweet spot begins. Water temperatures climb to 65–70°F, the city is buzzing, and the Playpen starts filling up on weekends. Book early — June weekends sell out fast.

**July — Peak Season**
The pinnacle. Water temperatures peak, the Playpen is at full capacity every weekend, and the Chicago skyline looks its absolute best in summer haze. July 4th weekend is legendary. Book 4-6 weeks in advance.

**August — Still Peak**
Essentially identical to July. Late August starts to see slightly cooler evenings, which makes sunset charters especially beautiful. One of our favorite months for the golden-hour experience.

**September — Hidden Gem**
Our honest recommendation for the best overall experience. The lake is warm from summer, crowds thin out, pricing eases, and the fall light on the skyline is breathtaking. Book 2-3 weeks ahead.

**October — Last Call**
Early October can be spectacular — crisp air, dramatic skies, and very few other boats on the water. Water starts to cool quickly after mid-month. By late October, the season is winding down.

**Our recommendation:**
Weekend in June, July, or August for the full Chicago summer experience. Weekday in any of those months if you want a more private, peaceful charter at better pricing. September for the best bang for your buck.`,
  },
  {
    slug:"what-to-bring-on-chicago-boat-rental",
    title:"What to Bring on a Chicago Boat Rental",
    date:"May 2025",
    readTime:"3 min read",
    excerpt:"First time renting a boat in Chicago? Here's the definitive packing list so you show up prepared for the perfect day on the water.",
    content:`Getting ready for your LDG Charters experience? Here's exactly what to bring — and what we handle for you.

**What LDG Charters provides:**
- Cups, ice, plastic silverware, and paper towels
- Life jackets for all passengers
- Safety equipment as required by U.S. Coast Guard

**What you bring:**

**Drinks & Food:**
BYOB — bring whatever beverages your group enjoys. A cooler with ice is perfect. Food is welcome too: charcuterie boards, sandwiches, and snacks are popular. Avoid glass bottles.

**Sun Protection:**
Sunscreen (SPF 50+ recommended — the sun reflects off the water and intensifies). Sunglasses. A hat if you're sensitive to sun. The reflection off Lake Michigan is intense even on cloudy days.

**Clothing:**
Dress for the weather but bring a light layer — it can be 5-10 degrees cooler on the water. Non-slip shoes are recommended. If you plan to swim, bring a swimsuit and towel.

**Tech & Entertainment:**
A Bluetooth speaker for music. Fully charged phones — the photo opportunities are endless. A portable charger if you're on a longer charter.

**Payment:**
Your deposit secures the boat. Bring the remaining balance if you haven't paid in full. Tipping your captain is customary — typically 15-20% of the charter cost.

**What to leave behind:**
Glass bottles (breakage hazard on a boat). Open flames or grills. Anything you'd be devastated to lose overboard. Pets (unless pre-approved).

**Arrive 15-20 minutes early:**
Charter times are strict. We have back-to-back bookings and cannot extend your time for late arrivals. 31st Street Harbor is easily accessible from the lakefront path.`,
  },
  {
    slug:"chicago-boat-rental-vs-boat-tour",
    title:"Chicago Boat Rental vs. Boat Tour: Which Is Right For You?",
    date:"June 2025",
    readTime:"4 min read",
    excerpt:"Trying to decide between a private boat rental and a group boat tour in Chicago? Here's the honest comparison.",
    content:`Chicago offers two primary ways to experience Lake Michigan and the skyline from the water: private charter boat rentals and group boat tours. They serve very different purposes.

**Group Boat Tours in Chicago:**
Companies like Shoreline Sightseeing and Chicago Architecture Foundation offer group tours on larger vessels (50-400 passengers). These are excellent for architecture buffs, tourists wanting a narrated experience, or solo travelers. Prices are typically $30-$50 per person.

*Best for:* First-time visitors, architecture enthusiasts, solo travelers, tight budgets.

**Private Charter Rentals (like LDG Charters):**
You get the entire boat for your group. You choose your destination, your schedule, your music, and your vibe. No strangers, no tour guide narration, no fixed route. Just your group and Lake Michigan.

*Best for:* Birthday parties, anniversary celebrations, bachelorette parties, corporate events, family gatherings, or anyone who wants a truly customized experience.

**The key differences:**

| | Group Tour | Private Charter |
|---|---|---|
| Boat | Shared with strangers | Yours exclusively |
| Route | Fixed | Customizable |
| Music | None/background | Your playlist |
| Drinks | Usually no BYOB | Bring your own |
| Privacy | None | Complete |
| Price | $30-50/person | $300/hr split by group |

**The math on private charters:**
A 3-hour LDG Charters rental at $300/hr = $900 total. Split among 10 guests = $90/person. You get a private boat, your own music, BYOB, and the ability to anchor at The Playpen for as long as you want. For a group of 8-12, private charters are often the better value.

**Our honest take:**
If you're visiting Chicago solo or with 1-2 people, a group architecture tour is probably right for you. If you have a group of 4 or more, especially for a celebration, a private charter is the move every time.`,
  },
];

const BOAT_RATE = 300;
const DEPOSIT = 500;
const DOCK_RATE = 150;
const BUFFER_MINS = 30;

// ── HELPERS ───────────────────────────────────────────────────────────────────
const fmtDate = d => {
  if(!d) return "—";
  const[y,m,dy] = d.split("-");
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${mo[+m-1]} ${+dy}, ${y}`;
};
const calcEnd = (t,h) => {
  if(!t||!h) return "—";
  const[tm,ap] = t.split(" ");
  let[hr] = tm.split(":").map(Number);
  if(ap==="PM"&&hr!==12) hr+=12;
  if(ap==="AM"&&hr===12) hr=0;
  hr+=h;
  const ea = hr>=12?"PM":"AM";
  const eh = hr>12?hr-12:hr===0?12:hr;
  return `${eh}:00 ${ea}`;
};
const fmtCurrency = n => `$${Number(n).toLocaleString()}`;

const timeToMins = t => {
  if(!t) return 0;
  const[tm,ap] = t.split(" ");
  let[h] = tm.split(":").map(Number);
  if(ap==="PM"&&h!==12) h+=12;
  if(ap==="AM"&&h===12) h=0;
  return h*60;
};

const isTimeBlocked = (timeStr, hours, bookedSlots) => {
  const startM = timeToMins(timeStr);
  const endM = startM + hours*60;
  for(const slot of bookedSlots){
    const bs = timeToMins(slot.startTime);
    const be = timeToMins(slot.endTime);
    if(startM < be + BUFFER_MINS && endM + BUFFER_MINS > bs) return true;
  }
  return false;
};

// ── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}html{scroll-behavior:smooth;}
::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:#0a0f1e;}::-webkit-scrollbar-thumb{background:#c9a84c;border-radius:3px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes waveRise{from{transform:translateY(100%)}to{transform:translateY(0%)}}
@keyframes waveMove{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes waveMove2{0%{transform:translateX(-50%)}100%{transform:translateX(0%)}}
@keyframes logoReveal{0%{opacity:0;transform:scale(.85) translateY(16px)}60%{opacity:1;transform:scale(1.04)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes splashOut{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.06)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.fu{animation:fadeUp .6s ease forwards;}
.boat-card:hover{transform:translateY(-7px)!important;box-shadow:0 24px 60px rgba(0,0,0,.65)!important;}
.dest-card:hover{border-color:#c9a84c!important;transform:translateY(-3px);}
.btn-g:hover{background:#e8d070!important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,168,76,.4)!important;}
.btn-o:hover{background:rgba(201,168,76,.1)!important;}
.nav-link:hover{color:#c9a84c!important;}
.gallery-img:hover{transform:scale(1.04);z-index:2;}
input:focus,select:focus,textarea:focus{border-color:#c9a84c!important;outline:none;}
`;

// ── WAVE INTRO ────────────────────────────────────────────────────────────────
function WaveIntro({ onDone }) {
  const [phase, setPhase] = useState("rising");
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for(let i=0;i<bufferSize;i++) data[i]=Math.random()*2-1;
      const source = ctx.createBufferSource();
      source.buffer = buffer; source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass"; filter.frequency.value = 380;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.1;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = 160;
      lfo.connect(lfoGain); lfoGain.connect(filter.frequency); lfo.start();
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1.2);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 3.0);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 4.2);
      source.connect(filter); filter.connect(gainNode); gainNode.connect(ctx.destination);
      source.start();
      setTimeout(()=>{try{source.stop();ctx.close();}catch(e){}},4600);
    } catch(e){}
    setTimeout(()=>setPhase("logo"),1100);
    setTimeout(()=>setPhase("splash"),2900);
    setTimeout(()=>{setPhase("done");onDone();},3800);
  },[]);
  if(phase==="done") return null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,overflow:"hidden",background:"#040810",animation:phase==="splash"?"splashOut .85s ease forwards":"none",pointerEvents:phase==="splash"?"none":"all"}}>
      <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 80%,#0d2a4a 0%,#040810 70%)"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"68%",animation:"waveRise 1.5s cubic-bezier(.25,.46,.45,.94) forwards",overflow:"hidden"}}>
        {[{w:"200%",h:110,b:"58%",anim:"waveMove2 7s linear infinite",fill:"rgba(13,42,80,0.55)",d:"M0,55 C180,95 360,15 540,55 C720,95 900,15 1080,55 C1260,95 1440,15 1440,55 L1440,110 L0,110 Z"},
          {w:"200%",h:130,b:"28%",anim:"waveMove 5s linear infinite",fill:"rgba(10,30,70,0.7)",d:"M0,65 C240,115 480,15 720,65 C960,115 1200,15 1440,65 L1440,130 L0,130 Z"},
          {w:"200%",h:150,b:"4%",anim:"waveMove2 4s linear infinite",fill:"#0a0f1e",d:"M0,75 C200,130 400,20 600,75 C800,130 1000,20 1200,75 C1350,115 1440,55 1440,75 L1440,150 L0,150 Z"}
        ].map((l,i)=>(
          <div key={i} style={{position:"absolute",bottom:0,left:0,right:0,height:"100%",overflow:"hidden"}}>
            <div style={{position:"absolute",bottom:l.b,width:l.w,height:l.h,animation:l.anim}}>
              <svg viewBox={`0 0 1440 ${l.h}`} preserveAspectRatio="none" style={{width:"100%",height:"100%"}}>
                <path d={l.d} fill={l.fill}/>
              </svg>
            </div>
          </div>
        ))}
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:"38%",background:"#0a0f1e"}}/>
      </div>
      {(phase==="logo"||phase==="splash")&&(
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"logoReveal .65s cubic-bezier(.34,1.56,.64,1) forwards"}}>
          <div style={{width:68,height:68,borderRadius:"50%",background:"linear-gradient(135deg,#c9a84c,#7a5a14)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,boxShadow:"0 0 40px rgba(201,168,76,.45)"}}>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:700,color:"#0a0f1e"}}>L</span>
          </div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:600,letterSpacing:5,color:"#fff"}}>LDG <span style={{color:"#c9a84c"}}>CHARTERS</span></div>
          <div style={{fontSize:10,letterSpacing:4,color:"rgba(255,255,255,.3)",marginTop:8,textTransform:"uppercase"}}>Chicago · Lake Michigan</div>
        </div>
      )}
    </div>
  );
}

// ── HERO SECTION ──────────────────────────────────────────────────────────────
function HeroSection({ startBook, setPage }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    let t = 0;
    const resize=()=>{canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;};
    resize();
    window.addEventListener("resize",resize);

    const LAYERS=[
      {speed:.007,amp:28,freq:.011,phase:0,   yBase:.62,color:"rgba(4,18,48,0.82)"},
      {speed:.011,amp:22,freq:.017,phase:2.1, yBase:.66,color:"rgba(5,24,60,0.80)"},
      {speed:.016,amp:17,freq:.023,phase:4.3, yBase:.70,color:"rgba(7,32,75,0.85)",foam:true},
      {speed:.022,amp:13,freq:.030,phase:1.1, yBase:.74,color:"rgba(9,40,90,0.88)",foam:true},
      {speed:.030,amp:9, freq:.038,phase:3.7, yBase:.78,color:"rgba(10,48,105,0.92)",foam:true},
      {speed:.040,amp:6, freq:.047,phase:.9,  yBase:.82,color:"rgba(7,30,72,0.96)",foam:true},
    ];
    const STARS=Array.from({length:55},()=>({x:Math.random(),y:Math.random()*.52,r:Math.random()*1.1+.3,phase:Math.random()*Math.PI*2}));
    const BLDGS=[[.06,.52,.04,.08],[.11,.47,.03,.11],[.15,.42,.05,.16],[.21,.44,.04,.14],[.26,.38,.04,.20],[.31,.44,.06,.14],[.38,.40,.05,.18],[.44,.35,.04,.23],[.49,.41,.05,.17],[.55,.45,.04,.13],[.60,.47,.03,.11],[.64,.44,.04,.14],[.69,.46,.05,.12],[.75,.44,.04,.14],[.80,.48,.03,.10],[.84,.45,.04,.13],[.89,.47,.05,.11]];

    const drawSky=(W,H)=>{
      const g=ctx.createLinearGradient(0,0,0,H*.68);
      g.addColorStop(0,"#010508");g.addColorStop(.35,"#030c1a");g.addColorStop(.7,"#071528");g.addColorStop(1,"#0a1c3a");
      ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      STARS.forEach(s=>{const tw=.35+.65*Math.abs(Math.sin(t*.7+s.phase));ctx.globalAlpha=tw*.6;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();});
      ctx.globalAlpha=1;
    };
    const drawCity=(W,H)=>{
      ctx.fillStyle="rgba(5,14,35,0.94)";
      BLDGS.forEach(([bx,by,bw,bh])=>ctx.fillRect(bx*W,by*H,bw*W,bh*H));
      ctx.fillRect(.452*W,.27*H,2,.07*H);
      [[.28,.42],[.30,.40],[.32,.42],[.45,.39],[.46,.37],[.47,.35],[.39,.44],[.41,.42],[.66,.47],[.68,.45],[.77,.48]].forEach(([wx,wy])=>{
        const f=.5+.5*Math.abs(Math.sin(t*.25+wx*8));
        ctx.fillStyle=`rgba(255,215,130,${.3*f})`;ctx.fillRect(wx*W,wy*H,2,3);
      });
    };
    const wy=(layer,x)=>layer.yBase*canvas.height+layer.amp*Math.sin(layer.freq*x+t*layer.speed*100+layer.phase)+layer.amp*.28*Math.sin(layer.freq*1.8*x-t*layer.speed*65+layer.phase+1.3);
    const drawWave=(layer,W,H)=>{
      ctx.beginPath();ctx.moveTo(0,H);
      for(let x=0;x<=W;x+=3)ctx.lineTo(x,wy(layer,x));
      ctx.lineTo(W,H);ctx.closePath();ctx.fillStyle=layer.color;ctx.fill();
      if(layer.foam){
        ctx.beginPath();
        for(let x=0;x<=W;x+=3){const fo=1.8*Math.abs(Math.sin(layer.freq*3.2*x+t*layer.speed*85));if(x===0)ctx.moveTo(x,wy(layer,x)-fo);else ctx.lineTo(x,wy(layer,x)-fo);}
        ctx.strokeStyle=`rgba(255,255,255,${.05+.03*Math.abs(Math.sin(t*.4))})`;ctx.lineWidth=1.4;ctx.stroke();
      }
    };
    const drawDeep=(W,H)=>{const g=ctx.createLinearGradient(0,H*.58,0,H);g.addColorStop(0,"rgba(3,12,30,0)");g.addColorStop(1,"#010508");ctx.fillStyle=g;ctx.fillRect(0,H*.58,W,H*.42);};

    const frame=()=>{
      const W=canvas.width,H=canvas.height;
      if(!W||!H){animRef.current=requestAnimationFrame(frame);return;}
      t+=.011;ctx.clearRect(0,0,W,H);
      drawSky(W,H);drawCity(W,H);
      LAYERS.forEach(l=>drawWave(l,W,H));
      drawDeep(W,H);
      animRef.current=requestAnimationFrame(frame);
    };
    animRef.current=requestAnimationFrame(frame);
    return()=>{cancelAnimationFrame(animRef.current);window.removeEventListener("resize",resize);};
  },[]);

  return (
    <section style={{minHeight:"100vh",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"130px 24px 80px"}}>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",display:"block"}}/>
      <div style={{position:"relative",zIndex:10,maxWidth:780}} className="fu">
        <div style={{fontSize:11,letterSpacing:5,color:"#c9a84c",textTransform:"uppercase",marginBottom:18,fontWeight:500}}>Chicago · Lake Michigan · 31st Street Harbor</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(52px,8vw,92px)",fontWeight:300,lineHeight:1.06,marginBottom:22,letterSpacing:-1}}>
          Experience<br/><span style={{fontStyle:"italic",color:"#c9a84c"}}>Lake Michigan</span><br/>Like Never Before
        </h1>
        <p style={{fontSize:17,color:"rgba(255,255,255,.7)",fontWeight:300,maxWidth:500,margin:"0 auto 36px",lineHeight:1.75}}>
          Whether you're celebrating something big or just want to unwind — our charters are designed to give you the ultimate Chicago experience.
        </p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="btn-g" onClick={()=>startBook()} style={{background:"#c9a84c",color:"#0a0f1e",border:"none",padding:"15px 38px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,letterSpacing:2,textTransform:"uppercase",transition:"all .22s"}}>Book Your Charter</button>
          <button className="btn-o" onClick={()=>setPage("dock")} style={{background:"transparent",color:"#4aff9a",border:"1px solid rgba(74,255,154,.35)",padding:"15px 38px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:400,letterSpacing:1,transition:"all .22s"}}>At The Dock</button>
        </div>
        <div style={{marginTop:56,display:"flex",gap:40,justifyContent:"center",flexWrap:"wrap"}}>
          {[["2","Vessels"],["$300","Per Hour"],["12","Max Guests"],["31st St","Harbor"]].map(([n,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:600,color:"#c9a84c"}}>{n}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.45)",letterSpacing:2.5,textTransform:"uppercase",marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── SMART CALENDAR ────────────────────────────────────────────────────────────
function SmartCal({ sel, onSel, vesselId, hours, bookedSlots, loadingSlots }) {
  const today = new Date();
  const [view,setView] = useState(new Date(today.getFullYear(),today.getMonth(),1));
  const MO = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const days = new Date(view.getFullYear(),view.getMonth()+1,0).getDate();
  const fd = new Date(view.getFullYear(),view.getMonth(),1).getDay();
  const cells = [...Array(fd).fill(null),...Array.from({length:days},(_,i)=>i+1)];
  const isPast = d => new Date(view.getFullYear(),view.getMonth(),d) < new Date(today.getFullYear(),today.getMonth(),today.getDate());
  const isSel = d => { if(!sel||!d)return false;const[y,m,dy]=sel.split("-").map(Number);return d===dy&&view.getMonth()+1===m&&view.getFullYear()===y; };
  const isToday = d => d===today.getDate()&&view.getMonth()===today.getMonth()&&view.getFullYear()===today.getFullYear();
  const pick = d => { if(!d||isPast(d))return; onSel(`${view.getFullYear()}-${String(view.getMonth()+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`); };

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

// ── SIGNATURE CANVAS ──────────────────────────────────────────────────────────
function SigCanvas({ label, onSigned }) {
  const ref = useRef(null); const drawing = useRef(false); const [has, setHas] = useState(false);
  const xy=(e,c)=>{const r=c.getBoundingClientRect(),sx=c.width/r.width,sy=c.height/r.height;if(e.touches)return{x:(e.touches[0].clientX-r.left)*sx,y:(e.touches[0].clientY-r.top)*sy};return{x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy};};
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

const SC={pending:{bg:"rgba(255,190,50,.15)",border:"rgba(255,190,50,.4)",color:"#ffc832"},confirmed:{bg:"rgba(58,170,102,.15)",border:"rgba(58,170,102,.4)",color:"#3aaa66"},paid:{bg:"rgba(74,158,255,.15)",border:"rgba(74,158,255,.4)",color:"#4a9eff"},cancelled:{bg:"rgba(255,80,80,.15)",border:"rgba(255,80,80,.4)",color:"#ff5050"}};
function Badge({status}){const s=SC[status]||SC.pending;return <span style={{background:s.bg,border:`1px solid ${s.border}`,color:s.color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,textTransform:"capitalize",whiteSpace:"nowrap"}}>{status||"pending"}</span>;}

// ── PDF GENERATOR ─────────────────────────────────────────────────────────────
function generatePDF(booking) {
  const { clientName, clientEmail, clientPhone, vessel, charterDate, startTime, endTime,
          duration, destination, boatFee, totalPrice, deposit, balance,
          paymentOption, clientSignature } = booking;

  const lines = [];
  const W = 595, H = 842;
  const gold = "#c9a84c", navy = "#0a0f1e";

  // Build SVG-based PDF content as data URL
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="white"/>
  <rect width="${W}" height="8" fill="${navy}"/>
  <text x="${W/2}" y="60" text-anchor="middle" font-family="Georgia,serif" font-size="28" font-weight="bold" fill="${navy}" letter-spacing="4">LDG CHARTERS</text>
  <text x="${W/2}" y="82" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" fill="#888" letter-spacing="3">MASTER CHARTER AGREEMENT</text>
  <line x1="40" y1="100" x2="${W-40}" y2="100" stroke="${gold}" stroke-width="1.5"/>

  <text x="40" y="130" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="#999" letter-spacing="2">CLIENT INFORMATION</text>
  <rect x="40" y="138" width="${(W-90)/2}" height="52" rx="4" fill="#f7f7f7"/>
  <rect x="${40+(W-90)/2+10}" y="138" width="${(W-90)/2}" height="52" rx="4" fill="#f7f7f7"/>
  <text x="52" y="152" font-family="Arial,sans-serif" font-size="8" fill="#999">CLIENT NAME</text>
  <text x="52" y="166" font-family="Arial,sans-serif" font-size="11" font-weight="bold" fill="${navy}">${clientName||""}</text>
  <text x="52" y="180" font-family="Arial,sans-serif" font-size="9" fill="#666">${clientEmail||""}</text>
  <text x="${40+(W-90)/2+22}" y="152" font-family="Arial,sans-serif" font-size="8" fill="#999">PHONE</text>
  <text x="${40+(W-90)/2+22}" y="166" font-family="Arial,sans-serif" font-size="11" font-weight="bold" fill="${navy}">${clientPhone||""}</text>

  <text x="40" y="220" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="#999" letter-spacing="2">CHARTER DETAILS</text>
  ${[
    ["Vessel", vessel||""],
    ["Charter Date", fmtDate(charterDate)||""],
    ["Charter Window", startTime&&endTime?`${startTime} – ${endTime}`:""],
    ["Duration", duration||""],
    ["Destination", destination||""],
    ["Departure", "31st Street Harbor, Chicago IL"],
  ].map(([k,v],i) => `
  <rect x="40" y="${228+i*36}" width="${W-80}" height="28" rx="3" fill="${i%2===0?"#fafafa":"white"}"/>
  <text x="52" y="${246+i*36}" font-family="Arial,sans-serif" font-size="9" fill="#666">${k}</text>
  <text x="${W-52}" y="${246+i*36}" text-anchor="end" font-family="Arial,sans-serif" font-size="11" font-weight="bold" fill="${navy}">${v}</text>
  `).join("")}

  <text x="40" y="${228+6*36+20}" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="#999" letter-spacing="2">FINANCIAL SUMMARY</text>
  ${[
    ["Charter Rate", "$300.00 / hour"],
    ["Boat Rental Fee", `$${(boatFee||totalPrice||0).toLocaleString()}.00`],
    ["Non-Refundable Deposit", "$500.00"],
    ["Remaining Balance Due", `$${(balance||0).toLocaleString()}.00`],
    ["Payment Option", paymentOption==="full"?"Paid in Full":"Deposit Only"],
  ].map(([k,v],i) => `
  <rect x="40" y="${228+6*36+28+i*32}" width="${W-80}" height="24" rx="3" fill="${i%2===0?"#fafafa":"white"}"/>
  <text x="52" y="${244+6*36+28+i*32}" font-family="Arial,sans-serif" font-size="9" fill="#666">${k}</text>
  <text x="${W-52}" y="${244+6*36+28+i*32}" text-anchor="end" font-family="Arial,sans-serif" font-size="10" font-weight="bold" fill="${k.includes("Balance")||k.includes("Fee")?gold:navy}">${v}</text>
  `).join("")}

  <text x="40" y="640" font-family="Arial,sans-serif" font-size="8" fill="#999" letter-spacing="2" font-weight="bold">AGREEMENT TERMS (SUMMARY)</text>
  <text x="40" y="658" font-family="Arial,sans-serif" font-size="8" fill="#555">Charter times are STRICT. Arrive 15-20 min early. Deposits non-refundable. Cancellations within 48hrs require full payment.</text>
  <text x="40" y="672" font-family="Arial,sans-serif" font-size="8" fill="#555">Max 12 guests. Follow captain instructions. Alcohol in moderation. Client responsible for damage. Illinois law governs.</text>
  <text x="40" y="686" font-family="Arial,sans-serif" font-size="8" fill="#555">Full terms provided at booking. By signing below, client agrees to all LDG Charters terms and conditions.</text>

  <line x1="40" y1="705" x2="${W-40}" y2="705" stroke="${gold}" stroke-width="1"/>

  <text x="40" y="725" font-family="Arial,sans-serif" font-size="9" fill="#999" letter-spacing="1">CLIENT SIGNATURE</text>
  ${clientSignature ? `<image href="${clientSignature}" x="40" y="730" width="200" height="50"/>` : '<rect x="40" y="730" width="220" height="50" rx="4" fill="#f9f9f9" stroke="#ddd" stroke-width="1"/>'}
  <text x="40" y="795" font-family="Arial,sans-serif" font-size="9" fill="${navy}" font-weight="bold">${clientName||""}</text>
  <text x="40" y="808" font-family="Arial,sans-serif" font-size="8" fill="#888">Date: ${fmtDate(charterDate)||new Date().toLocaleDateString()}</text>

  <text x="${W-200}" y="725" font-family="Arial,sans-serif" font-size="9" fill="#999" letter-spacing="1">LDG CHARTERS REP</text>
  <text x="${W-200}" y="760" font-family="Georgia,serif" font-size="20" font-style="italic" fill="${navy}">Lorenzo McKinnie</text>
  <text x="${W-200}" y="795" font-family="Arial,sans-serif" font-size="9" fill="${navy}" font-weight="bold">Lorenzo McKinnie</text>
  <text x="${W-200}" y="808" font-family="Arial,sans-serif" font-size="8" fill="#888">LDG Charters Representative</text>

  <rect width="${W}" height="6" y="${H-6}" fill="${navy}"/>
  <text x="${W/2}" y="${H-14}" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" fill="#888" letter-spacing="1">LDG CHARTERS · 31st Street Harbor, Chicago IL · 708-846-3132 · ldg-charters.vercel.app</text>
</svg>`;

  const blob = new Blob([svg], {type:"image/svg+xml"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `LDG-Charter-Agreement-${clientName?.replace(/\s+/g,"-") || "Client"}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── AT THE DOCK BOOKING ───────────────────────────────────────────────────────
function AtTheDockPage({ onBack }) {
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
          <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:28,flexWrap:"wrap"}}>
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
function AdminLogin({ onLogin }) {
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
function AdminDashboard() {
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
                          <div style={{display:"flex",gap:6",alignItems:"center"}}>
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
          <div style={{fontSize:11,color:"#c9a84c",letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>{p.date} · {p.readTime}</div>
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
                <div style={{fontSize:10,color:"#c9a84c",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>{p.date} · {p.readTime}</div>
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
          <div style={{fontSize:11,letterSpacing:5,color:"#c9a84c",textTransform:"uppercase",marginBottom:12}}>Real Photos · Real People · Real Chicago</div>
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
        <div style={{display:"flex",gap:18,alignItems:"center",flexWrap:"wrap"}}>
          {[["Fleet","fleet"],["Gallery","gallery-sec"],["Destinations","destinations"],["At The Dock","dock-sec"],["Blog","blog-sec"],["Pricing","pricing"],["Contact","contact"]].map(([l,id])=>(
            <button key={id} className="nav-link" onClick={()=>{
              if(id==="gallery-sec"){setPage("gallery");return;}
              if(id==="blog-sec"){setPage("blog");return;}
              document.getElementById(id)?.scrollIntoView({behavior:"smooth"});
            }} style={{background:"none",border:"none",color:"rgba(255,255,255,.6)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:400,transition:"color .2s"}}>{l}</button>
          ))}
          <button className="btn-g" onClick={()=>startBook()} style={{background:"#c9a84c",color:"#0a0f1e",border:"none",padding:"9px 20px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",transition:"all .22s"}}>Book Now</button>
        </div>
      </nav>

      <HeroSection startBook={startBook} setPage={setPage}/>

      {/* ABOUT with photo */}
      <section style={{padding:"0",position:"relative",overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:500}}>
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
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(480px,1fr))",gap:24}}>
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
                    <div><div style={{fontSize:26,fontFamily:"'Cormorant Garamond',serif",fontWeight:600,color:"#c9a84c"}}>${BOAT_RATE}<span style={{fontSize:13,color:"rgba(255,255,255,.4)",fontFamily:"'DM Sans',sans-serif",fontWeight:300}}>/hr</span></div><div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>2 hr min · $500 deposit</div></div>
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

      {/* AT THE DOCK */}
      <section id="dock-sec" style={{padding:"0",position:"relative",overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:500}}>
          <div style={{background:"rgba(5,18,40,1)",padding:"60px 48px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <div style={{fontSize:10,letterSpacing:4,color:"#4aff9a",textTransform:"uppercase",marginBottom:14}}>New Experience</div>
            <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(32px,4vw,52px)",fontWeight:400,marginBottom:18,lineHeight:1.15}}>At The <span style={{fontStyle:"italic",color:"#4aff9a"}}>Dock</span></h2>
            <p style={{fontSize:15,color:"rgba(255,255,255,.6)",lineHeight:1.8,marginBottom:18}}>Bring the celebration dockside. No charter required — just show up, set the vibe, and enjoy the harbor atmosphere at 31st Street.</p>
            <p style={{fontSize:15,color:"rgba(255,255,255,.6)",lineHeight:1.8,marginBottom:28}}>Birthdays, corporate events, anniversaries, girls nights and more — at just <strong style={{color:"#4aff9a"}}>${DOCK_RATE}/hr</strong>. No deposit required.</p>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              <button className="btn-g" onClick={()=>setPage("dock")} style={{background:"#4aff9a",color:"#0a0f1e",border:"none",padding:"14px 32px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,letterSpacing:2,textTransform:"uppercase",transition:"all .22s"}}>Reserve Your Spot</button>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:600,color:"#4aff9a"}}>${DOCK_RATE}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>per hour<br/>no deposit</div>
              </div>
            </div>
          </div>
          <div style={{backgroundImage:`url(${P.night})`,backgroundSize:"cover",backgroundPosition:"center",minHeight:400,position:"relative"}}>
            <div style={{position:"absolute",inset:0,background:"rgba(10,15,30,.25)"}}/>
            <div style={{position:"absolute",bottom:24,right:24,display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["🎂","Birthdays"],["💍","Anniversaries"],["💼","Corporate"],["🎉","Bach Parties"]].map(([icon,label])=>(
                <div key={label} style={{background:"rgba(10,15,30,.75)",backdropFilter:"blur(10px)",border:"1px solid rgba(74,255,154,.2)",borderRadius:8,padding:"10px 14px",textAlign:"center"}}>
                  <div style={{fontSize:18,marginBottom:4}}>{icon}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.6)"}}>{label}</div>
                </div>
              ))}
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
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gridTemplateRows:"200px 200px",gap:12}}>
            {[P.hero,P.sunset,P.group,P.deck,P.dusk].map((url,i)=>(
              <div key={i} onClick={()=>setPage("gallery")} style={{backgroundImage:`url(${url})`,backgroundSize:"cover",backgroundPosition:"center",borderRadius:8,cursor:"pointer",gridRow:i===0?"1/3":"auto",position:"relative",overflow:"hidden"}}
                onMouseEnter={e=>{e.currentTarget.querySelector('.overlay').style.opacity=1;}}
                onMouseLeave={e=>{e.currentTarget.querySelector('.overlay').style.opacity=0;}}>
                <div className="overlay" style={{position:"absolute",inset:0,background:"rgba(201,168,76,.2)",transition:"opacity .3s",opacity:0}}/>
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
          <p style={{color:"rgba(255,255,255,.4)",fontSize:13,marginBottom:8}}>$300/hr · 2 hr minimum · $500 non-refundable deposit · Up to 12 guests</p>
          <p style={{color:"rgba(255,255,255,.3)",fontSize:12,marginBottom:32}}>At The Dock: ${DOCK_RATE}/hr · No deposit required</p>
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
                <div style={{fontSize:10,color:"#c9a84c",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{p.date} · {p.readTime}</div>
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
          <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600,letterSpacing:3,marginBottom:4}}>LDG <span style={{color:"#c9a84c"}}>CHARTERS</span></div><div style={{fontSize:11,color:"rgba(255,255,255,.28)"}}>31st Street Harbor · Chicago, IL · 708-846-3132</div></div>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            {[["Gallery",()=>setPage("gallery")],["Blog",()=>setPage("blog")],["At The Dock",()=>setPage("dock")],["Admin",()=>window.location.hash="admin"]].map(([l,fn])=>(
              <button key={l} onClick={fn} style={{background:"none",border:"none",color:"rgba(255,255,255,.28)",cursor:"pointer",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:20,fontSize:10,color:"rgba(255,255,255,.15)"}}>{new Date().getFullYear()} LDG Charters · Chicago Boat Rental · Lake Michigan Charter · 31st Street Harbor</div>
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
          <p style={{color:"rgba(255,255,255,.4)",marginBottom:28,fontSize:14}}>${BOAT_RATE}/hr · 2 hr minimum · $500 deposit · Up to 12 guests</p>
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
                  <div><div style={{fontWeight:600,fontSize:15}}>{d.label}</div><div style={{fontSize:11,color:"rgba(255,255,255,.38)",marginTop:2}}>{d.hours} hrs · {d.sub}</div></div>
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
          <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:32,flexWrap:"wrap"}}>
            <SmartCal sel={date} onSel={setDate} vesselId={boat?.id} hours={dur?.hours||2} bookedSlots={bookedSlots} loadingSlots={loadingSlots}/>
            <div>
              <div style={{fontSize:10,letterSpacing:2,color:"#c9a84c",textTransform:"uppercase",marginBottom:6}}>Departure Time</div>
              {loadingSlots&&<div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:12}}>Checking availability...</div>}
              {!loadingSlots&&date&&bookedSlots.length>0&&<div style={{fontSize:12,color:"rgba(255,190,50,.7)",marginBottom:12}}>⚠️ Some times unavailable for {fmtDate(date)}</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
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
                <div style={{fontSize:11,color:"rgba(255,255,255,.3)",marginTop:2}}>31st St · {boat?.name}</div>
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
                <div><div style={{fontSize:12,fontWeight:600,marginBottom:5}}>LDG Charters Representative</div><div style={{border:"1.5px solid #c9a84c",borderRadius:6,background:"#fff",padding:"8px 12px",height:88,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontStyle:"italic",color:"#222"}}>Lorenzo McKinnie</div></div><div style={{fontSize:10,color:"#888",marginTop:4}}>Lorenzo McKinnie · LDG Charters</div></div>
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
              <div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,letterSpacing:2,color:"#0a0f1e"}}>LDG CHARTERS</div><div style={{fontSize:11,color:"#888",marginTop:3}}>31st Street Harbor · Chicago IL · 708-846-3132</div></div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,color:"#c9a84c"}}>INVOICE</div><div style={{fontSize:11,color:"#888",marginTop:3}}>{new Date().toLocaleDateString()}</div></div>
            </div>
            <div style={{marginBottom:16}}><div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:7}}>Bill To</div><div style={{fontSize:14,fontWeight:600,color:"#0a0f1e"}}>{info.name}</div><div style={{fontSize:12,color:"#666"}}>{info.email}</div><div style={{fontSize:12,color:"#666"}}>{info.phone}</div></div>
            <table style={{width:"100%",borderCollapse:"collapse",marginBottom:14}}>
              <thead><tr style={{background:"#0a0f1e"}}>{["Description","Qty","Rate","Amount"].map((h,i)=><th key={h} style={{padding:"7px 10px",textAlign:i===0?"left":i===3?"right":"center",color:"#fff",fontSize:10,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
              <tbody>
                <tr style={{borderBottom:"1px solid #f0f0f0"}}><td style={{padding:10,fontSize:12}}><div style={{fontWeight:600}}>{boat?.name} Charter</div><div style={{fontSize:10,color:"#888",marginTop:2}}>{dest?.name} · {fmtDate(date)} · {time} – {endT}</div></td><td style={{padding:10,textAlign:"center",fontSize:12}}>{dur?.hours} hrs</td><td style={{padding:10,textAlign:"center",fontSize:12}}>${BOAT_RATE}</td><td style={{padding:10,textAlign:"right",fontSize:12,fontWeight:600}}>${total.toLocaleString()}</td></tr>
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
                <div onClick={()=>setPayOpt("deposit")} style={{border:payOpt==="deposit"?"2.5px solid #c9a84c":"1px solid #ddd",borderRadius:8,padding:14,cursor:"pointer",background:payOpt==="deposit"?"#fffbf0":"#fff",transition:"all .2s"}}><div style={{fontWeight:700,fontSize:13,color:"#0a0f1e",marginBottom:4}}>Pay Deposit</div><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"#c9a84c"}}>$500.00</div><div style={{fontSize:10,color:"#888",marginTop:3}}>Non-refundable · Secures booking</div></div>
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
