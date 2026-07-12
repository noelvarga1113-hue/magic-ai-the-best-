/* Magic AI 3.0 — 30s trailer scenes + WebAudio score */
const { Stage, Sprite, useTime, useTimeline, useSprite, Easing, interpolate, animate, clamp } = window;
const { useRef, useEffect, useMemo } = React;

const GRAD = "linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#d946ef 100%)";
const INK = "#f2eefc";
const W = 1920, H = 1080;

/* ---------- helpers ---------- */
function rand(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function Stars() {
  const t = useTime();
  const stars = useMemo(() => { const r = rand(1234); return Array.from({ length: 70 }, () => ({ x: r() * W, y: r() * H, s: 1 + r() * 2.4, o: 0.25 + r() * 0.6, v: 4 + r() * 10 })); }, []);
  return <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
    {stars.map((st, i) => <div key={i} style={{ position: "absolute", left: st.x, top: ((st.y + t * st.v) % (H + 20)) - 10, width: st.s, height: st.s, borderRadius: "50%", background: "#fff", opacity: st.o * (0.6 + 0.4 * Math.sin(t * 2 + i)) }} />)}
  </div>;
}

function Aurora({ shift = 0 }) {
  const t = useTime();
  const b = (x, y, c, sz, ph) => <div style={{ position: "absolute", left: x + Math.sin(t * 0.25 + ph) * 60, top: y + Math.cos(t * 0.2 + ph) * 50, width: sz, height: sz, borderRadius: "50%", background: `radial-gradient(circle,${c} 0%,transparent 65%)`, filter: "blur(40px)", opacity: 0.5 }} />;
  return <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
    {b(-200 + shift, -150, "#7c3aed", 900, 0)}{b(1200 - shift, 500, "#d946ef", 800, 2)}{b(500, 700, "#4c1d95", 900, 4)}
  </div>;
}

function Cap({ text }) {
  const { localTime: lt, duration: d } = useSprite();
  const inP = Easing.easeOutBack(clamp(lt / 0.5, 0, 1));
  const out = Easing.easeInQuad(clamp((lt - (d - 0.4)) / 0.4, 0, 1));
  return <div style={{ position: "absolute", top: 92, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: (1 - out) * clamp(lt / 0.3, 0, 1), transform: `translateY(${(1 - inP) * -40}px)` }}>
    <div style={{ fontFamily: "Inter,sans-serif", fontWeight: 800, fontSize: 46, letterSpacing: -0.5, color: INK, background: "rgba(21,24,43,.75)", border: "1px solid rgba(168,85,247,.4)", borderRadius: 999, padding: "20px 46px", boxShadow: "0 0 60px rgba(124,58,237,.45)" }}>{text}</div>
  </div>;
}

function Flash({ color = "#fff" }) {
  const { localTime: lt } = useSprite();
  return <div style={{ position: "absolute", inset: 0, background: color, opacity: 0.85 * (1 - clamp(lt / 0.3, 0, 1)), pointerEvents: "none" }} />;
}

function Bubble({ side, name, color, children, w = 560 }) {
  const { localTime: lt } = useSprite();
  const p = Easing.easeOutBack(clamp(lt / 0.45, 0, 1));
  const mine = side === "right";
  return <div style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start", opacity: clamp(lt / 0.2, 0, 1), transform: `translateY(${(1 - p) * 30}px) scale(${0.7 + p * 0.3})`, transformOrigin: mine ? "bottom right" : "bottom left" }}>
    {name && <div style={{ fontSize: 22, fontWeight: 700, color: color || "#a855f7", margin: "0 10px 6px", fontFamily: "Inter,sans-serif" }}>{name}</div>}
    <div style={{ maxWidth: w, fontFamily: "Inter,sans-serif", fontSize: 30, lineHeight: 1.45, color: mine ? "#fff" : INK, background: mine ? GRAD : "rgba(255,255,255,.08)", border: mine ? "none" : "1px solid rgba(255,255,255,.12)", borderRadius: mine ? "22px 22px 6px 22px" : "22px 22px 22px 6px", padding: "18px 26px", boxShadow: mine ? "0 10px 30px rgba(124,58,237,.4)" : "0 8px 24px rgba(0,0,0,.3)" }}>{children}</div>
  </div>;
}

function TypeText({ text, cps = 26 }) {
  const { localTime: lt } = useSprite();
  const n = Math.floor(lt * cps);
  return <span>{text.slice(0, n)}{n < text.length && <span style={{ opacity: 0.7 }}>|</span>}</span>;
}

function Dots() {
  const t = useTime();
  return <span style={{ display: "inline-flex", gap: 8, alignItems: "center", height: 20 }}>
    {[0, 1, 2].map(i => <span key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: "#a855f7", display: "inline-block", transform: `translateY(${Math.sin(t * 7 + i) * 5}px)` }} />)}
  </span>;
}

function Panel({ children, w = 980, zoomFrom = 0.92, zoomTo = 1.0 }) {
  const { localTime: lt, duration: d } = useSprite();
  const inP = Easing.easeOutCubic(clamp(lt / 0.6, 0, 1));
  const z = zoomFrom + (zoomTo - zoomFrom) * (lt / d);
  return <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ width: w, background: "rgba(16,18,36,.92)", border: "1px solid rgba(168,85,247,.28)", borderRadius: 28, boxShadow: "0 40px 120px rgba(0,0,0,.6), 0 0 80px rgba(124,58,237,.25)", opacity: inP, transform: `translateY(${(1 - inP) * 60}px) scale(${z})`, overflow: "hidden" }}>{children}</div>
  </div>;
}

function PanelHead({ title }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 30px", borderBottom: "1px solid rgba(255,255,255,.08)", fontFamily: "Inter,sans-serif" }}>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🪄</div>
    <div style={{ fontWeight: 800, fontSize: 28, color: INK, whiteSpace: "nowrap", flexShrink: 0 }}>{title}</div>
    <div style={{ marginLeft: "auto", fontSize: 18, fontWeight: 700, color: "#a855f7", background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.35)", borderRadius: 999, padding: "6px 16px" }}>v3.0</div>
  </div>;
}

/* ---------- scenes ---------- */
function SceneIntro() { // 0–4.5
  const { localTime: lt } = useSprite();
  const logoP = Easing.easeOutBack(clamp((lt - 0.3) / 0.7, 0, 1));
  const titleP = Easing.easeOutCubic(clamp((lt - 0.9) / 0.6, 0, 1));
  const badgeP = Easing.easeOutBack(clamp((lt - 2.3) / 0.4, 0, 1));
  const tagP = clamp((lt - 3.0) / 0.5, 0, 1);
  const glow = 0.5 + 0.5 * Math.sin(lt * 3);
  return <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30, fontFamily: "Inter,sans-serif" }}>
    <div style={{ fontSize: 170, transform: `scale(${logoP}) rotate(${(1 - logoP) * -30}deg)`, filter: `drop-shadow(0 0 ${40 + glow * 30}px rgba(168,85,247,.9))` }}>🪄</div>
    <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -4, background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", opacity: titleP, transform: `translateY(${(1 - titleP) * 50}px)`, filter: `drop-shadow(0 0 30px rgba(124,58,237,.5))` }}>Magic AI</div>
    <div style={{ fontSize: 74, fontWeight: 800, color: "#fff", background: GRAD, borderRadius: 24, padding: "10px 46px", transform: `scale(${badgeP * 1.0}) rotate(${(1 - badgeP) * 12}deg)`, boxShadow: "0 0 80px rgba(217,70,239,.7)" }}>3.0</div>
    <div style={{ fontSize: 34, fontWeight: 500, color: "rgba(242,238,252,.8)", opacity: tagP, transform: `translateY(${(1 - tagP) * 20}px)` }}>a saját fejlesztésű mesterséges intelligenciád</div>
  </div>;
}

function SceneChat() { // 4.5–11 (nested Sprite times are GLOBAL)
  const B = 4.5;
  return <>
    <Sprite start={B} end={11}><Cap text="💬 Beszélgess vele – teljesen helyben, API nélkül" /></Sprite>
    <Sprite start={B} end={11}>
      <Panel w={1060} zoomFrom={0.9} zoomTo={1.04}>
        <PanelHead title="Magic AI" />
        <div style={{ display: "flex", flexDirection: "column", gap: 26, padding: "34px 40px 44px", minHeight: 420 }}>
          <Sprite start={B + 0.5} end={11}><Bubble side="right"><TypeText text="Mondj egy viccet! 😄" cps={22} /></Bubble></Sprite>
          <Sprite start={B + 1.9} end={B + 3.1}><Bubble side="left" name="Magic AI"><Dots /></Bubble></Sprite>
          <Sprite start={B + 3.1} end={11}><Bubble side="left" name="Magic AI" w={700}><TypeText text="Miért vitt létrát az AI az iskolába? Mert felsőbb szinten akart tanulni! 🪜✨" cps={40} /></Bubble></Sprite>
        </div>
      </Panel>
    </Sprite>
  </>;
}

function SceneGroup() { // 11–17
  const B = 11;
  return <>
    <Sprite start={B} end={B + 0.35}><Flash color="#a855f7" /></Sprite>
    <Sprite start={B} end={17}><Cap text="👥 Group – chatelj a barátaiddal és az AI-jal" /></Sprite>
    <Sprite start={B} end={17}>
      <Panel w={1060} zoomFrom={0.92} zoomTo={1.05}>
        <PanelHead title="Group szoba" />
        <div style={{ padding: "18px 40px 0", fontFamily: "Inter,sans-serif" }}>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: 4, color: "#a855f7", background: "rgba(124,58,237,.15)", border: "1px dashed rgba(168,85,247,.5)", borderRadius: 12, padding: "8px 18px" }}>KÓD: MAGIC1</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, padding: "26px 40px 44px", minHeight: 400 }}>
          <Sprite start={B + 0.6} end={17}><Bubble side="left" name="Bence" color="#38bdf8">Sziasztok! Ki jön gamelni? 🎮</Bubble></Sprite>
          <Sprite start={B + 1.5} end={17}><Bubble side="right" name="Te" color="#d946ef">Én! @ai szerinted ki nyer? 😎</Bubble></Sprite>
          <Sprite start={B + 2.6} end={17}><Bubble side="left" name="🪄 Magic AI" color="#a855f7" w={640}><TypeText text="Aki engem kérdez, az biztosan! 😉" cps={35} /></Bubble></Sprite>
        </div>
      </Panel>
    </Sprite>
  </>;
}

function ScanCard() {
  const { localTime: lt } = useSprite();
  const scanY = interpolate([0.4, 1.8], [0, 300], Easing.easeInOutQuad)(lt);
  const done = lt > 1.9;
  return <div style={{ display: "flex", gap: 36, padding: "36px 40px 46px", fontFamily: "Inter,sans-serif" }}>
    <div style={{ position: "relative", width: 430, height: 320, borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.14)", background: "repeating-linear-gradient(45deg,#1c1f38 0 18px,#22264a 18px 36px)", flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "rgba(242,238,252,.65)", fontSize: 24, fontWeight: 600 }}>
        <span style={{ fontSize: 52 }}>📸</span><span style={{ fontFamily: "monospace", fontSize: 20 }}>matek házi fotó</span>
        <span style={{ fontSize: 34, fontWeight: 800, color: INK }}>12x + 8 = 44</span>
      </div>
      {lt < 2 && <div style={{ position: "absolute", left: 0, right: 0, top: scanY, height: 5, background: GRAD, boxShadow: "0 0 30px 8px rgba(217,70,239,.8)" }} />}
    </div>
    <div style={{ flex: 1, opacity: done ? 1 : 0.25, transform: `translateX(${done ? 0 : 30}px)`, transition: "none" }}>
      {done ? <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#a855f7", marginBottom: 14 }}>✅ MEGOLDÁS</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: INK, marginBottom: 14 }}>x = 3</div>
        <div style={{ fontSize: 26, lineHeight: 1.5, color: "rgba(242,238,252,.75)" }}><TypeText text="12x = 44 − 8 = 36, tehát x = 36 ÷ 12 = 3. Lépésről lépésre elmagyarázom! 🧠" cps={45} /></div>
      </div> : <div style={{ fontSize: 26, color: "rgba(242,238,252,.5)", display: "flex", gap: 14, alignItems: "center", marginTop: 30 }}>Elemzés <Dots /></div>}
    </div>
  </div>;
}

function SceneHomework() { // 17–22.7
  const B = 17;
  return <>
    <Sprite start={B} end={B + 0.35}><Flash color="#7c3aed" /></Sprite>
    <Sprite start={B} end={22.7}><Cap text="📸 Fotózd le a házit – megoldja és elmagyarázza" /></Sprite>
    <Sprite start={B} end={22.7}>
      <Panel w={1060} zoomFrom={0.94} zoomTo={1.06}>
        <PanelHead title="Házi feladat" />
        <ScanCard />
      </Panel>
    </Sprite>
  </>;
}

function BigCard({ icon, title, sub, hue }) {
  const { localTime: lt } = useSprite();
  const p = Easing.easeOutBack(clamp(lt / 0.35, 0, 1));
  return <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22, fontFamily: "Inter,sans-serif", background: `radial-gradient(circle at 50% 45%, oklch(0.3 0.12 ${hue}) 0%, #05030f 75%)` }}>
    <div style={{ fontSize: 150, transform: `scale(${p})`, filter: "drop-shadow(0 0 40px rgba(168,85,247,.8))" }}>{icon}</div>
    <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: -2, color: INK, transform: `translateY(${(1 - p) * 40}px)`, opacity: p }}>{title}</div>
    <div style={{ fontSize: 34, fontWeight: 500, color: "rgba(242,238,252,.7)", opacity: p }}>{sub}</div>
  </div>;
}

function SceneCuts() { // 22.7–26.6 — rapid cuts
  const B = 22.7;
  return <>
    <Sprite start={B} end={B + 1.3}><BigCard icon="🎮" title="Game" sub="játssz az AI ellen" hue={300} /></Sprite>
    <Sprite start={B + 1.3} end={B + 2.6}><BigCard icon="🤖" title="Saját AI-modellek" sub="válts modellt egy kattintással" hue={280} /></Sprite>
    <Sprite start={B + 2.6} end={B + 3.9}><BigCard icon="🌐" title="9 nyelven" sub="magyar, angol, német és még több" hue={320} /></Sprite>
    <Sprite start={B} end={B + 0.3}><Flash /></Sprite>
    <Sprite start={B + 1.3} end={B + 1.6}><Flash /></Sprite>
    <Sprite start={B + 2.6} end={B + 2.9}><Flash /></Sprite>
  </>;
}

function SceneEnd() { // 26.6–30
  const { localTime: lt } = useSprite();
  const p = Easing.easeOutBack(clamp(lt / 0.6, 0, 1));
  const tagP = clamp((lt - 0.8) / 0.5, 0, 1);
  const glow = 0.5 + 0.5 * Math.sin(lt * 2.5);
  return <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, fontFamily: "Inter,sans-serif" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 34, transform: `scale(${p})` }}>
      <span style={{ fontSize: 130, filter: "drop-shadow(0 0 40px rgba(168,85,247,.9))" }}>🪄</span>
      <span style={{ fontSize: 130, fontWeight: 800, letterSpacing: -3, background: GRAD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: `drop-shadow(0 0 ${20 + glow * 35}px rgba(168,85,247,${0.5 + glow * 0.4}))` }}>Magic AI 3.0</span>
    </div>
    <div style={{ fontSize: 46, fontWeight: 700, color: INK, opacity: tagP, transform: `translateY(${(1 - tagP) * 26}px)` }}>Már elérhető. Varázsold újra a chatet. ✨</div>
  </div>;
}

/* ---------- music ---------- */
function buildScore() {
  const ev = [];
  const A = 110, F = 87.31, C = 130.81, G = 98;
  const chords = [
    { root: A, arp: [220, 261.6, 329.6, 440] },
    { root: F, arp: [174.6, 220, 261.6, 349.2] },
    { root: C, arp: [261.6, 329.6, 392, 523.3] },
    { root: G, arp: [196, 246.9, 293.7, 392] },
  ];
  const chordAt = t => chords[Math.floor(t / 2) % 4];
  // pads: whole track, every 2s
  for (let t = 0; t < 30; t += 2) ev.push({ t, type: "pad", f: chordAt(t).root, d: 2.1 });
  // intro pulse
  for (let t = 0; t < 4.5; t += 1) ev.push({ t, type: "kick", g: 0.5 });
  ev.push({ t: 2.3, type: "hit" });
  // arps from 4.5
  for (let t = 4.5; t < 26.6; t += 0.25) {
    const c = chordAt(t); const idx = Math.round(t * 4) % 4;
    ev.push({ t, type: "pluck", f: c.arp[idx], g: t < 11 ? 0.14 : 0.18 });
  }
  // bass
  for (let t = 4.5; t < 26.6; t += 0.5) ev.push({ t, type: "bass", f: chordAt(t).root / 2, d: 0.4 });
  // kick
  for (let t = 4.5; t < 11; t += 1) ev.push({ t, type: "kick", g: 0.8 });
  for (let t = 11; t < 22.7; t += 0.5) ev.push({ t, type: "kick", g: 0.9 });
  for (let t = 22.7; t < 26.6; t += 0.5) ev.push({ t, type: "kick", g: 1 });
  // hats
  for (let t = 11.25; t < 22.7; t += 0.5) ev.push({ t, type: "hat" });
  for (let t = 22.95; t < 26.6; t += 0.5) ev.push({ t, type: "hat" });
  // scene-cut stabs
  [11, 17, 22.7, 24, 25.3].forEach(t => ev.push({ t, type: "hit" }));
  ev.push({ t: 24.8, type: "riser", d: 1.8 });
  ev.push({ t: 26.6, type: "final" });
  // outro shimmer
  [27.0, 27.25, 27.5, 27.75].forEach((t, i) => ev.push({ t, type: "pluck", f: [880, 659.3, 523.3, 440][i], g: 0.12 }));
  return ev.sort((a, b) => a.t - b.t);
}

function playEvent(ctx, master, e, at) {
  const t0 = Math.max(at, ctx.currentTime + 0.005);
  const g = ctx.createGain(); g.connect(master);
  const env = (peak, dur, attack = 0.005) => { g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(peak, t0 + attack); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); };
  if (e.type === "kick") {
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(150, t0); o.frequency.exponentialRampToValueAtTime(42, t0 + 0.13); o.connect(g); env(0.9 * (e.g || 1), 0.25); o.start(t0); o.stop(t0 + 0.3);
  } else if (e.type === "hat") {
    const len = 0.05, buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ctx.createBufferSource(); s.buffer = buf; const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 7000; s.connect(hp); hp.connect(g); env(0.12, 0.06); s.start(t0);
  } else if (e.type === "pluck") {
    const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = e.f; o.connect(g); env(e.g || 0.16, 0.4); o.start(t0); o.stop(t0 + 0.45);
    const o2 = ctx.createOscillator(); const g2 = ctx.createGain(); g2.connect(master); o2.type = "triangle"; o2.frequency.value = e.f; o2.connect(g2);
    g2.gain.setValueAtTime(0.0001, t0 + 0.25); g2.gain.linearRampToValueAtTime((e.g || 0.16) * 0.35, t0 + 0.26); g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6); o2.start(t0 + 0.25); o2.stop(t0 + 0.65);
  } else if (e.type === "bass") {
    const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = e.f; const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 380; o.connect(lp); lp.connect(g); env(0.3, e.d || 0.4, 0.01); o.start(t0); o.stop(t0 + (e.d || 0.4) + 0.05);
  } else if (e.type === "pad") {
    [0, 5].forEach(det => { const o = ctx.createOscillator(); o.type = "sawtooth"; o.frequency.value = e.f * 2; o.detune.value = det; const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 750; o.connect(lp); lp.connect(g); o.start(t0); o.stop(t0 + e.d + 0.1); });
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.07, t0 + 0.6); g.gain.linearRampToValueAtTime(0.0001, t0 + e.d);
  } else if (e.type === "riser") {
    const len = e.d, buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = ctx.createBufferSource(); s.buffer = buf; const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(300, t0); bp.frequency.exponentialRampToValueAtTime(6000, t0 + len);
    s.connect(bp); bp.connect(g); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.22, t0 + len); g.gain.linearRampToValueAtTime(0.0001, t0 + len + 0.05); s.start(t0);
  } else if (e.type === "hit" || e.type === "final") {
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(180, t0); o.frequency.exponentialRampToValueAtTime(50, t0 + 0.3); o.connect(g); env(e.type === "final" ? 1 : 0.6, e.type === "final" ? 1.6 : 0.5); o.start(t0); o.stop(t0 + 1.7);
    if (e.type === "final") { const o2 = ctx.createOscillator(); const g2 = ctx.createGain(); g2.connect(master); o2.type = "sine"; o2.frequency.value = 220; o2.connect(g2); g2.gain.setValueAtTime(0.0001, t0); g2.gain.linearRampToValueAtTime(0.25, t0 + 0.02); g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.2); o2.start(t0); o2.stop(t0 + 2.3); }
  }
}

function MusicEngine() {
  const { time, playing } = useTimeline();
  const timeRef = useRef(time); timeRef.current = time;
  const score = useMemo(buildScore, []);
  const ref = useRef({});
  useEffect(() => {
    if (!playing) return;
    const S = ref.current;
    if (!S.ctx) { S.ctx = new (window.AudioContext || window.webkitAudioContext)(); S.master = S.ctx.createGain(); S.master.gain.value = 0.3; S.master.connect(S.ctx.destination); }
    S.ctx.resume();
    let epochA = S.ctx.currentTime, epochT = timeRef.current;
    const done = new Set();
    const tick = () => {
      const tlNow = epochT + (S.ctx.currentTime - epochA);
      if (Math.abs(timeRef.current - tlNow) > 0.35) { epochA = S.ctx.currentTime; epochT = timeRef.current; done.clear(); score.forEach((e, i) => { if (e.t < epochT - 0.05) done.add(i); }); return; }
      score.forEach((e, i) => {
        if (done.has(i)) return;
        if (e.t < tlNow - 0.05) { done.add(i); return; }
        if (e.t <= tlNow + 0.35) { done.add(i); playEvent(S.ctx, S.master, e, epochA + (e.t - epochT)); }
      });
    };
    score.forEach((e, i) => { if (e.t < timeRef.current - 0.05) done.add(i); });
    const iv = setInterval(tick, 90); tick();
    return () => clearInterval(iv);
  }, [playing]);
  return null;
}

function ScreenLabel() {
  const t = Math.floor(useTime());
  useEffect(() => { document.querySelector("[data-om-exportable-video-with-duration-secs]")?.setAttribute("data-screen-label", "t=" + t + "s"); }, [t]);
  return null;
}

/* ---------- root ---------- */
function MagicTrailer() {
  return <Stage width={W} height={H} duration={30} background="#05030f">
    <MusicEngine />
    <ScreenLabel />
    <Sprite start={0} end={30} keepMounted><Aurora /></Sprite>
    <Sprite start={0} end={30} keepMounted><Stars /></Sprite>
    <Sprite start={0} end={4.5}><SceneIntro /></Sprite>
    <Sprite start={4.5} end={11}><SceneChat /></Sprite>
    <Sprite start={11} end={17}><SceneGroup /></Sprite>
    <Sprite start={17} end={22.7}><SceneHomework /></Sprite>
    <Sprite start={22.7} end={26.6}><SceneCuts /></Sprite>
    <Sprite start={26.6} end={30}><SceneEnd /></Sprite>
  </Stage>;
}
window.MagicTrailer = MagicTrailer;
