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
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);

// ── PHOTO URLS ───────────────────────────────────────────────────────────────
export const P = {
  hero: "https://lh3.googleusercontent.com/d/10pokZrXZkrbvna_zlpl0zSQ8KOYzTTRD=w1200",
  sunset: "https://lh3.googleusercontent.com/d/1-6JYcavMee4mprZgtOk1cKDD4GWxZ-kW=w1200",
  group: "https://lh3.googleusercontent.com/d/18tboUDO0dccG-0fFycBuiQYnn8SJqWbC=w1200",
  deck: "https://lh3.googleusercontent.com/d/1z7AbVb5dOPDpRxDu9G63jw6s0SBNLkuo=w1200",
  dusk: "https://lh3.googleusercontent.com/d/1ii8rHhtiRowPpPYfO--P7JSA9PIeS8XV=w1200",
  night: "https://lh3.googleusercontent.com/d/1M_aM9W8D98Cph6Kpdixcu0eh6-zx52XR=w1200",
  playpen: "https://lh3.googleusercontent.com/d/1HIhJMwO6FZKn1ut4KwuCwittaK2E3EUK=w1200",
  skyline: "https://lh3.googleusercontent.com/d/1TQ25g1JzxXgDtUO5CHPqAasiKMz1NBEN=w1200",
  crowd: "https://lh3.googleusercontent.com/d/1Vb1oSduO5fl1xCq0fyn167gdyN5dOmQA=w1200",
};

// ── DATA ─────────────────────────────────────────────────────────────────────
export const BOATS = [
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

export const DURATIONS = [
  {id:"tour",   label:"Take A Tour",          hours:2, sub:"Quick escape on the water"},
  {id:"classic",label:"Classic Lake Day",     hours:3, sub:"The perfect afternoon outing"},
  {id:"exp",    label:"Enjoy the Experience", hours:4, sub:"Unhurried luxury on the lake"},
  {id:"norush", label:"No Rush",              hours:5, sub:"The full Lake Michigan experience"},
  {id:"ext6",   label:"Extended (6 hrs)",     hours:6, sub:"For those who want it all"},
  {id:"ext7",   label:"Full Day (7 hrs)",      hours:7, sub:"Dawn to dusk on the water"},
  {id:"ext8",   label:"All Day (8 hrs)",       hours:8, sub:"The ultimate charter day"},
];

export const DESTINATIONS = [
  {id:"skyline",   name:"Chicago Skyline Cruise", icon:"🏙️", desc:"Cruise along the iconic Chicago skyline — the most stunning view in the world.", photo:P.skyline},
  {id:"playpen",   name:"The Playpen",            icon:"⚓",  desc:"Anchor at Monroe Harbor's legendary cove where Chicago's boating scene comes alive.", photo:P.playpen},
  {id:"navy-pier", name:"Navy Pier",              icon:"🎡", desc:"Cruise past Chicago's iconic Navy Pier, Ferris wheel, and vibrant lakefront.", photo:P.deck},
  {id:"calumet",   name:"Calumet Harbor",         icon:"🌊", desc:"A scenic journey south along the shoreline to the peaceful Calumet Harbor.", photo:P.hero},
  {id:"open-water",name:"Open Water Adventure",   icon:"🧭", desc:"Head into the deep blue of Lake Michigan with the Chicago skyline on the horizon.", photo:P.group},
  {id:"sunset",    name:"Sunset Cruise",          icon:"🌅", desc:"Time your departure for golden hour as the skyline ignites in amber and gold.", photo:P.sunset},
];

export const TIMES = ["8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM"];

export const CELEBRATIONS = [
  {id:"birthday",   name:"Birthday",               icon:"🎂", desc:"Make their special day unforgettable on the water."},
  {id:"anniversary",name:"Anniversary",            icon:"💍", desc:"Celebrate your love story on Lake Michigan."},
  {id:"corporate",  name:"Corporate Event",        icon:"💼", desc:"Impress your team or clients with a lakeside experience."},
  {id:"girls-night",name:"Girls Night Out",        icon:"🥂", desc:"The ultimate girls night — vibes, views, and the lake."},
  {id:"bach",       name:"Bachelor / Bachelorette",icon:"🎉", desc:"Send them off in style before the big day."},
  {id:"celebrating",name:"Just Celebrating",       icon:"✨", desc:"No occasion needed — life is worth celebrating."},
];

export const DOCK_DURATIONS = [
  {id:"d1",label:"1 Hour",  hours:1, sub:"A quick dockside toast"},
  {id:"d2",label:"2 Hours", hours:2, sub:"The perfect party window"},
  {id:"d3",label:"3 Hours", hours:3, sub:"Full celebration experience"},
  {id:"d4",label:"4 Hours", hours:4, sub:"Go all out at the dock"},
];

export const TERMS = [
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

export const BLOG_POSTS = [
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

export const BOAT_RATE = 300;
export const DEPOSIT = 500;
export const DOCK_RATE = 150;
export const BUFFER_MINS = 30;

// ── HELPERS ───────────────────────────────────────────────────────────────────
export const fmtDate = d => {
  if(!d) return "—";
  const[y,m,dy] = d.split("-");
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${mo[+m-1]} ${+dy}, ${y}`;
};
export const calcEnd = (t,h) => {
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
export const fmtCurrency = n => `$${Number(n).toLocaleString()}`;

const timeToMins = t => {
  if(!t) return 0;
  const[tm,ap] = t.split(" ");
  let[h] = tm.split(":").map(Number);
  if(ap==="PM"&&h!==12) h+=12;
  if(ap==="AM"&&h===12) h=0;
  return h*60;
};

export const isTimeBlocked = (timeStr, hours, bookedSlots) => {
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
export const G = `
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

@media(max-width:768px){
  .nav-desktop{display:none!important;}
  .hero-h1{font-size:clamp(42px,12vw,72px)!important;}
  .grid-2col{grid-template-columns:1fr!important;}
  .boat-grid{grid-template-columns:1fr!important;}
  .dest-grid{grid-template-columns:1fr!important;}
  .stats-row{gap:24px!important;}
  .section-pad{padding:60px 6%!important;}
}
@media(max-width:480px){
  .hero-h1{font-size:38px!important;line-height:1.1!important;}
}

`;

// ── WAVE INTRO ────────────────────────────────────────────────────────────────
export function WaveIntro({ onDone }) {
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
  return (
    <section style={{minHeight:"100vh",position:"relative",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"130px 24px 80px"}}>

      {/* Real wave video background */}
      <video
        autoPlay muted loop playsInline
        style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.38,zIndex:0}}
      >
        <source src="/waves.mp4" type="video/mp4"/>
      </video>

      {/* Dark gradient overlay so text is readable */}
      <div style={{position:"absolute",inset:0,zIndex:1,background:"linear-gradient(to bottom,rgba(6,13,26,0.72) 0%,rgba(6,13,26,0.55) 40%,rgba(6,13,26,0.78) 100%)"}}/>

      {/* Gold shimmer at top */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,transparent,#c9a84c,transparent)",zIndex:2,opacity:0.6}}/>

      <div style={{position:"relative",zIndex:3,maxWidth:780}} className="fu">
        <div style={{fontSize:11,letterSpacing:5,color:"#c9a84c",textTransform:"uppercase",marginBottom:18,fontWeight:500}}>Chicago · Lake Michigan · 31st Street Harbor</div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(48px,8vw,92px)",fontWeight:300,lineHeight:1.06,marginBottom:22,letterSpacing:-1,textShadow:"0 2px 40px rgba(0,0,0,.5)"}}>
          Experience<br/><span style={{fontStyle:"italic",color:"#c9a84c"}}>Lake Michigan</span><br/>Like Never Before
        </h1>
        <p style={{fontSize:17,color:"rgba(255,255,255,.75)",fontWeight:300,maxWidth:500,margin:"0 auto 36px",lineHeight:1.75,textShadow:"0 1px 12px rgba(0,0,0,.6)"}}>
          Whether you are celebrating something big or just want to unwind — our charters are designed to give you the ultimate Chicago experience.
        </p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="btn-g" onClick={()=>startBook()} style={{background:"#c9a84c",color:"#0a0f1e",border:"none",padding:"15px 38px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,letterSpacing:2,textTransform:"uppercase",transition:"all .22s",boxShadow:"0 8px 32px rgba(201,168,76,.35)"}}>Book Your Charter</button>
          <button className="btn-o" onClick={()=>setPage("dock")} style={{background:"rgba(6,13,26,0.5)",color:"#4aff9a",border:"1px solid rgba(74,255,154,.4)",padding:"15px 38px",borderRadius:4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:400,letterSpacing:1,transition:"all .22s",backdropFilter:"blur(8px)"}}>At The Dock</button>
        </div>
        <div style={{marginTop:56,display:"flex",gap:40,justifyContent:"center",flexWrap:"wrap"}}>
          {[["2","Vessels"],["$300","Per Hour"],["12","Max Guests"],["31st St","Harbor"]].map(([n,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:30,fontWeight:600,color:"#c9a84c",textShadow:"0 2px 16px rgba(201,168,76,.4)"}}>{n}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.5)",letterSpacing:2.5,textTransform:"uppercase",marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── SMART CALENDAR ────────────────────────────────────────────────────────────
export function SmartCal({ sel, onSel, vesselId, hours, bookedSlots, loadingSlots }) {
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
    <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(201,168,76,.25)",borderRadius:12,padding:18,display:"inline-block",maxWidth:"100%",overflowX:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <button onClick={()=>setView(new Date(view.getFullYear(),view.getMonth()-1,1))} style={{background:"none",border:"1px solid rgba(201,168,76,.3)",color:"#c9a84c",width:30,height:30,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
        <span style={{color:"#fff",fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:600}}>{MO[view.getMonth()]} {view.getFullYear()}</span>
        <button onClick={()=>setView(new Date(view.getFullYear(),view.getMonth()+1,1))} style={{background:"none",border:"1px solid rgba(201,168,76,.3)",color:"#c9a84c",width:30,height:30,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(30px,34px))",gap:2}}>
        {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",color:"#c9a84c",fontSize:10,fontWeight:700,padding:"5px 0"}}>{d}</div>)}
        {cells.map((d,i)=>(
          <div key={i} onClick={()=>pick(d)} style={{textAlign:"center",padding:"7px 0",borderRadius:6,fontSize:12,cursor:d&&!isPast(d)?"pointer":"default",background:isSel(d)?"#c9a84c":isToday(d)?"rgba(201,168,76,.15)":"transparent",color:!d?"transparent":isPast(d)?"#333":isSel(d)?"#0a0f1e":"#fff",fontWeight:isSel(d)?700:400,border:isToday(d)&&!isSel(d)?"1px solid rgba(201,168,76,.4)":"1px solid transparent",transition:"all .15s"}}>{d||""}</div>
        ))}
      </div>
    </div>
  );
}

// ── SIGNATURE CANVAS ──────────────────────────────────────────────────────────
export function SigCanvas({ label, onSigned }) {
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
export function Badge({status}){const s=SC[status]||SC.pending;return <span style={{background:s.bg,border:`1px solid ${s.border}`,color:s.color,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,textTransform:"capitalize",whiteSpace:"nowrap"}}>{status||"pending"}</span>;}

// ── PDF GENERATOR ─────────────────────────────────────────────────────────────
export function generatePDF(booking) {
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
