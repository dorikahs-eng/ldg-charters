import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { fmtDate, calcEnd, isTimeBlocked, G, CELEBRATIONS, DOCK_DURATIONS, DOCK_RATE, DOCK_DEPOSIT, BUFFER_MINS, db, SmartCal, TIMES, SigCanvas } from './App';

export function AtTheDockPage({ onBack }) {
  const [step, setStep] = useState(1);
  const [celeb, setCeleb] = useState(null);
  const [dur, setDur] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [info, setInfo] = useState({ name: "", email: "", phone: "" });
  const [cSig, setCSig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  const total = dur ? dur.hours * DOCK_RATE : 0;
  const endT = calcEnd(time, dur?.hours);
  const STEPS = ["Celebration", "Duration", "Date & Time", "Your Info", "Agreement", "Confirm"];

  const canNext = () => {
    if (step === 1) return !!celeb;
    if (step === 2) return !!dur;
    if (step === 3) return !!date && !!time;
    if (step === 4) return !!(info.name && info.email && info.phone);
    if (step === 5) return !!cSig;
    return true;
  };

  const goNext = () => { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); };

  useEffect(() => {
    if (!date) return;
    const load = async () => {
      try {
        const q1 = query(collection(db, "dock_bookings"), where("eventDate", "==", date), where("bookingStatus", "!=", "cancelled"));
        const snap1 = await getDocs(q1);
        const q2 = query(collection(db, "bookings"), where("charterDate", "==", date), where("bookingStatus", "!=", "cancelled"));
        const snap2 = await getDocs(q2);
        setBookedSlots([...snap1.docs.map(d => d.data()), ...snap2.docs.map(d => d.data())]);
      } catch (e) { console.error(e); }
    };
    load();
  }, [date]);

  const timeBlocked = t => dur ? isTimeBlocked(t, dur.hours, bookedSlots) : false;
  const inp = { width: "100%", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 8, padding: "12px 16px", color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: "none" };

  const save = async () => {
    setSaving(true); setErr("");
    try {
      await addDoc(collection(db, "dock_bookings"), {
        type: "at_the_dock", clientName: info.name, clientEmail: info.email, clientPhone: info.phone,
        celebration: celeb.name, duration: dur.label, hours: dur.hours,
        eventDate: date, startTime: time, endTime: endT, totalPrice: total,
        depositAmount: DOCK_DEPOSIT, clientSignature: cSig,
        bookingStatus: "pending", paymentStatus: "deposit_pending", createdAt: serverTimestamp(),
      });
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_id: "service_0se585c", template_id: "template_swbrijc", user_id: "jsEvKIVZ10ZQqt-4r", template_params: { customer_name: info.name, customer_email: info.email, customer_phone: info.phone, vessel: "At The Dock", charter_date: fmtDate(date), start_time: time, end_time: endT, duration: dur.label, destination: celeb.name, total_price: `$${total}`, balance: `$${total}`, payment_option: `At The Dock - $${DOCK_DEPOSIT} deposit` } })
      });
      setSaved(true);
    } catch (e) { setErr("Could not save. Please call 708-846-3132."); }
    setSaving(false);
  };

  return (
    <>
      <style>{G}</style>
      <div style={{ fontFamily: "'DM Sans',sans-serif", background: "#0a0f1e", color: "#fff", minHeight: "100vh" }}>
        <nav style={{ position: "sticky", top: 0, zIndex: 200, background: "rgba(10,15,30,.95)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(74,255,154,.15)", padding: "0 5%", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#4aff9a", cursor: "pointer", fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 600, letterSpacing: 2 }}>← LDG CHARTERS</button>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>At The Dock · Step {step}/{STEPS.length} — <span style={{ color: "#4aff9a" }}>{STEPS[step - 1]}</span></div>
        </nav>
        <div style={{ height: 3, background: "rgba(255,255,255,.07)" }}>
          <div style={{ height: "100%", width: `${(step / STEPS.length) * 100}%`, background: "linear-gradient(90deg,#4aff9a,#c9a84c)", transition: "width .4s ease" }} />
        </div>
        <div style={{ padding: "28px 5% 16px", background: "linear-gradient(135deg,#050f20,#0a1a30)", borderBottom: "1px solid rgba(74,255,154,.1)" }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#4aff9a", textTransform: "uppercase", marginBottom: 6 }}>Dockside Experience</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,4vw,36px)", fontWeight: 300, color: "#fff" }}>At The <span style={{ color: "#4aff9a", fontStyle: "italic" }}>Dock</span> — ${DOCK_RATE}/hr</h2>
        </div>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 5% 100px" }}>

          {step === 1 && (
            <div className="fu">
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(26px,5vw,40px)", fontWeight: 400, marginBottom: 20 }}>What Are You <span style={{ fontStyle: "italic", color: "#4aff9a" }}>Celebrating?</span></h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                {CELEBRATIONS.map(c => (
                  <div key={c.id} onClick={() => setCeleb(c)} style={{ padding: 20, border: celeb?.id === c.id ? "2px solid #4aff9a" : "1px solid rgba(255,255,255,.1)", borderRadius: 12, cursor: "pointer", background: celeb?.id === c.id ? "rgba(74,255,154,.06)" : "rgba(255,255,255,.02)", transition: "all .2s" }}>
                    <div style={{ fontSize: 30, marginBottom: 8 }}>{c.icon}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", lineHeight: 1.6 }}>{c.desc}</div>
                    {celeb?.id === c.id && <div style={{ marginTop: 8, fontSize: 11, color: "#4aff9a", fontWeight: 600 }}>Selected</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fu">
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(26px,5vw,40px)", fontWeight: 400, marginBottom: 6 }}>How Long Is <span style={{ fontStyle: "italic", color: "#4aff9a" }}>Your Event?</span></h2>
              <p style={{ color: "rgba(255,255,255,.4)", marginBottom: 20, fontSize: 14 }}>${DOCK_RATE}/hr · ${DOCK_DEPOSIT} deposit · Dockside at 31st Street Harbor.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 500, marginBottom: 20 }}>
                {DOCK_DURATIONS.map(d => (
                  <div key={d.id} onClick={() => setDur(d)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", border: dur?.id === d.id ? "1.5px solid #4aff9a" : "1px solid rgba(255,255,255,.1)", borderRadius: 10, cursor: "pointer", background: dur?.id === d.id ? "rgba(74,255,154,.07)" : "rgba(255,255,255,.02)", transition: "all .2s" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{d.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.38)", marginTop: 2 }}>{d.sub}</div>
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: dur?.id === d.id ? "#4aff9a" : "rgba(255,255,255,.55)", fontWeight: 600 }}>${d.hours * DOCK_RATE}</div>
                  </div>
                ))}
              </div>
              {dur && (
                <div style={{ background: "rgba(74,255,154,.05)", border: "1px solid rgba(74,255,154,.25)", borderRadius: 12, padding: "16px 20px", maxWidth: 500 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 600, color: "#4aff9a" }}>${total}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.38)", marginTop: 4 }}>{dur.hours} hr{dur.hours > 1 ? "s" : ""} x ${DOCK_RATE}/hr · ${DOCK_DEPOSIT} deposit due</div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="fu">
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(26px,5vw,40px)", fontWeight: 400, marginBottom: 6 }}>Pick Your <span style={{ fontStyle: "italic", color: "#4aff9a" }}>Date & Time</span></h2>
              <p style={{ color: "rgba(255,255,255,.4)", marginBottom: 20, fontSize: 14 }}>Times are strict. Arrive 15-20 min early.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "flex-start" }}>
                <SmartCal sel={date} onSel={setDate} bookedSlots={bookedSlots} hours={dur?.hours || 1} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 10, letterSpacing: 2, color: "#4aff9a", textTransform: "uppercase", marginBottom: 12 }}>Start Time</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {TIMES.map(t => {
                      const blocked = timeBlocked(t);
                      return (
                        <button key={t} disabled={blocked} onClick={() => setTime(t)} style={{ padding: 10, border: time === t ? "1.5px solid #4aff9a" : blocked ? "1px solid rgba(255,80,80,.2)" : "1px solid rgba(255,255,255,.1)", borderRadius: 8, background: time === t ? "rgba(74,255,154,.1)" : blocked ? "rgba(255,80,80,.05)" : "rgba(255,255,255,.02)", color: time === t ? "#4aff9a" : blocked ? "rgba(255,80,80,.4)" : "rgba(255,255,255,.65)", cursor: blocked ? "not-allowed" : "pointer", fontSize: 12, fontFamily: "'DM Sans',sans-serif", fontWeight: time === t ? 600 : 400 }}>
                          {t}{blocked && <span style={{ display: "block", fontSize: 8, color: "rgba(255,80,80,.5)" }}>Unavailable</span>}
                        </button>
                      );
                    })}
                  </div>
                  {date && time && !timeBlocked(time) && (
                    <div style={{ marginTop: 16, background: "rgba(74,255,154,.07)", border: "1px solid rgba(74,255,154,.2)", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 600 }}>{fmtDate(date)}</div>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,.55)", marginTop: 2 }}>{time} to {endT}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="fu">
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(26px,5vw,40px)", fontWeight: 400, marginBottom: 20 }}>Your <span style={{ fontStyle: "italic", color: "#4aff9a" }}>Details</span></h2>
              <div style={{ maxWidth: 460, display: "flex", flexDirection: "column", gap: 14 }}>
                {[["Full Name", "name", "text", "Your full name"], ["Email", "email", "email", "your@email.com"], ["Phone", "phone", "tel", "708-000-0000"]].map(([lbl, f, t, ph]) => (
                  <div key={f}>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,.45)", display: "block", marginBottom: 5 }}>{lbl}</label>
                    <input type={t} placeholder={ph} value={info[f]} onChange={e => setInfo({ ...info, [f]: e.target.value })} style={inp} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="fu">
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(26px,5vw,40px)", fontWeight: 400, marginBottom: 6 }}>Dockside <span style={{ fontStyle: "italic", color: "#4aff9a" }}>Agreement</span></h2>
              <p style={{ color: "rgba(255,255,255,.4)", marginBottom: 20, fontSize: 14 }}>Review and sign to confirm your reservation.</p>
              <div style={{ background: "#fff", borderRadius: 12, padding: "22px 18px", color: "#1a1a1a", maxWidth: 620, boxShadow: "0 24px 80px rgba(0,0,0,.55)" }}>
                <div style={{ textAlign: "center", marginBottom: 14, paddingBottom: 12, borderBottom: "2px solid #0a0f1e" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 700, letterSpacing: 3, color: "#0a0f1e" }}>LDG CHARTERS</div>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginTop: 3 }}>At The Dock — Reservation Agreement</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 12 }}>
                  {[["Guest", info.name], ["Email", info.email], ["Phone", info.phone], ["Celebration", celeb?.name], ["Date", fmtDate(date)], ["Duration", dur?.label]].map(([k, v]) => (
                    <div key={k} style={{ background: "#f7f7f7", padding: "6px 9px", borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: "#999", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{v || "—"}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 12, padding: "9px 12px", background: "rgba(74,255,154,.06)", border: "1px solid rgba(74,255,154,.2)", borderRadius: 6 }}>
                  {[["Hourly Rate", `$${DOCK_RATE}/hr`], ["Total", `$${total}`], ["Deposit Due Now", `$${DOCK_DEPOSIT}`]].map(([k, v], i) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderTop: i > 0 ? "1px solid rgba(0,0,0,.06)" : "none" }}>
                      <span style={{ color: "#555", fontWeight: i === 2 ? 700 : 400 }}>{k}</span>
                      <span style={{ fontWeight: 700, color: i === 2 ? "#2a8a5a" : "#1a1a1a" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 14 }}>
                  {["Charter times are STRICT. Arrive 15-20 min early. Late arrivals do not extend your window.", "Deposits are non-refundable. Cancellations within 48 hours forfeit full deposit.", "Maximum 12 guests. Follow all harbor and Coast Guard regulations.", "Client is responsible for any damage or excessive mess.", "Alcohol in moderation. No illegal substances. No glass bottles."].map((term, i) => (
                    <div key={i} style={{ display: "flex", gap: 7, fontSize: 11, lineHeight: 1.6, marginBottom: 5 }}>
                      <span style={{ color: "#4aff9a", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ color: "#444" }}>{term}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5, color: "#0a0f1e" }}>Client Signature — {info.name || "—"}</div>
                  <SigCanvas label="Sign to confirm your reservation" onSigned={setCSig} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5, color: "#0a0f1e" }}>LDG Charters Representative</div>
                  <div style={{ border: "1.5px solid #4aff9a", borderRadius: 6, background: "#fff", padding: "8px 12px", height: 64, display: "flex", alignItems: "flex-end" }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontStyle: "italic", color: "#222" }}>Lorenzo McKinnie</div>
                  </div>
                </div>
              </div>
              {!cSig && <div style={{ textAlign: "center", marginTop: 10, color: "rgba(255,200,50,.8)", fontSize: 13 }}>Please sign above to continue</div>}
              {cSig && <div style={{ textAlign: "center", marginTop: 10 }}><span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(58,170,102,.12)", border: "1px solid rgba(58,170,102,.35)", borderRadius: 8, padding: "9px 18px", color: "#3aaa66", fontSize: 13 }}>Agreement signed — proceed to confirm</span></div>}
            </div>
          )}

          {step === 6 && (
            <div className="fu">
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(26px,5vw,40px)", fontWeight: 400, marginBottom: 20 }}>Confirm Your <span style={{ fontStyle: "italic", color: "#4aff9a" }}>Reservation</span></h2>
              <div style={{ background: "#fff", borderRadius: 12, padding: "22px 18px", color: "#1a1a1a", maxWidth: 500, boxShadow: "0 24px 80px rgba(0,0,0,.5)", marginBottom: 16 }}>
                <div style={{ textAlign: "center", paddingBottom: 12, marginBottom: 12, borderBottom: "2px solid #0a0f1e" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 700, letterSpacing: 3, color: "#0a0f1e" }}>LDG CHARTERS</div>
                  <div style={{ fontSize: 10, letterSpacing: 3, color: "#888", textTransform: "uppercase", marginTop: 3 }}>At The Dock Reservation</div>
                </div>
                {[["Guest", info.name], ["Email", info.email], ["Phone", info.phone], ["Celebration", celeb?.name], ["Date", fmtDate(date)], ["Time", `${time} to ${endT}`], ["Duration", dur?.label], ["Location", "31st Street Harbor, Chicago IL"], ["Deposit Due", `$${DOCK_DEPOSIT}`], ["Total", `$${total}`]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f2f2f2", fontSize: 13 }}>
                    <span style={{ color: "#888" }}>{k}</span>
                    <span style={{ fontWeight: k === "Total" || k === "Deposit Due" ? 700 : 500, color: k === "Total" ? "#c9a84c" : k === "Deposit Due" ? "#2a8a5a" : "#1a1a1a" }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop: 10, padding: "9px 10px", background: "rgba(255,80,80,.06)", border: "1px solid rgba(255,80,80,.2)", borderRadius: 6, fontSize: 11, color: "#cc4444" }}>
                  Times are strict. Arrive 15-20 min early. Late arrivals do not extend your window.
                </div>
                {err && <div style={{ color: "#ff5050", fontSize: 13, marginTop: 8, padding: "7px 10px", background: "rgba(255,80,80,.08)", borderRadius: 6 }}>{err}</div>}
                {!saved && (
                  <button onClick={save} disabled={saving} style={{ width: "100%", background: "#0a0f1e", color: "#fff", border: "none", padding: 13, borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 14 }}>
                    {saving ? "Confirming..." : `Confirm & Pay $${DOCK_DEPOSIT} Deposit`}
                  </button>
                )}
                {saved && (
                  <div style={{ background: "#f0fff5", border: "2px solid #3aaa66", borderRadius: 10, padding: 16, textAlign: "center", marginTop: 12 }}>
                    <div style={{ fontSize: 22, marginBottom: 5 }}>🎉</div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700, color: "#1a7a44", marginBottom: 5 }}>Reservation Confirmed!</div>
                    <div style={{ fontSize: 13, color: "#2a5a34", lineHeight: 1.65 }}>Thank you <strong>{info.name}</strong>! See you at the dock on <strong>{fmtDate(date)}</strong> at <strong>{time}</strong>. Call <strong>708-846-3132</strong> with questions.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!saved && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.07)" }}>
              <button onClick={() => step > 1 ? setStep(step - 1) : onBack()} style={{ background: "transparent", border: "1px solid rgba(255,255,255,.18)", color: "rgba(255,255,255,.55)", padding: "11px 26px", borderRadius: 6, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>Back</button>
              {step < 6 && (
                <button disabled={!canNext()} onClick={goNext} style={{ background: canNext() ? "#4aff9a" : "rgba(255,255,255,.08)", color: canNext() ? "#0a0f1e" : "rgba(255,255,255,.18)", border: "none", padding: "11px 32px", borderRadius: 6, cursor: canNext() ? "pointer" : "default", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", transition: "all .2s" }}>Continue</button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
    </>
  );
}
