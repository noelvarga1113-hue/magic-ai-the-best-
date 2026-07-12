// ============================================================
//  MAGIC AI 3.0 – JÓSGÖMB (crystal ball) vezérlés
//  Hangvezérelt élmény: a felhasználó a gömbhöz beszél, az AI
//  (ai.js / window.MagicLLM) válaszol és hangosan felolvassa.
//  A talált YouTube-videó a gömb körül kering.
//
//  Minden HELYBEN fut: a modell a böngészőben (WebGPU), a
//  felolvasás a böngésző hangszintézisével. A beszédfelismerés
//  a böngésző Web Speech API-ját használja (Chrome/Edge).
// ============================================================

(function () {
  "use strict";

  var L = window.MagicLLM;
  var $ = function (id) { return document.getElementById(id); };

  // ---------- ELEMEK ----------
  var orbSystem = $("orb-system");
  var orbEl = $("orb");
  var canvas = $("orb-canvas");
  var orbitLayer = $("orbit-layer");
  var capUser = $("cap-user");
  var capBot = $("cap-bot");
  var statusChip = $("status-chip");
  var statusTxt = $("status-txt");
  var statusBar = $("status-bar");
  var statusBarFill = $("status-bar-fill");
  var hint = $("hint");
  var startBtn = $("orb-start");
  var stopBtn = $("orb-stop");

  // ---------- ÁLLAPOT ----------
  var STATE = "idle"; // idle | listening | thinking | speaking | loading
  var started = false;       // az első indítás megtörtént-e (hang engedélyezve)
  var lastAnswer = "";
  var lastQuestion = "";
  var busy = false;          // épp dolgozik-e (gondolkodás/válasz)
  var convOn = false;        // beszélgetés-mód: a Start után FOLYAMATOSAN figyel

  // ============================================================
  //  TÖBBNYELVŰ SZÖVEGEK
  // ============================================================
  var T = {
    hu: {
      hint: "Nyomd meg a Start gombot, és beszélgess velem",
      start: "Start", stop: "Stop",
      voicePrep: "A saját hangom letöltése…",
      earsPrep: "A hallásom letöltése…",
      hear: "Értelmezem…",
      convOff: "Beszélgetés vége. Nyomd meg a Startot, ha újra kellek. 👋",
      listen: "Hallgatlak…", think: "Gondolkodom…", speak: "Beszélek…",
      load: "Modell betöltése", loaded: "Modell kész ✨",
      greet: "Üdvözöllek! Tedd fel a kérdésed, és belenézek a jövőbe. 🔮",
      noSpeech: "Nem hallottam semmit – koppints, és próbáld újra.",
      noMic: "Ez a böngésző nem támogatja a beszédfelismerést. Próbáld Chrome-mal vagy Edge-dzsel.",
      micDenied: "A mikrofon le van tiltva. Engedélyezd a böngészőben (címsor melletti 🔒), vagy írd be a kérdésed. ⌨️",
      micInsecure: "A hangfelismeréshez indítsd a Magic AI-t a „Magic AI indítása” parancsikonnal. Addig nyugodtan írd be a kérdésed. ⌨️",
      noMicDevice: "Nem találok mikrofont. Csatlakoztass egyet, vagy írd be a kérdésed. ⌨️",
      noAnswer: "Erre most nem találtam biztos választ. 🙈",
      thinkingOf: "Megnézem ezt…", modelLoading: "Modell betöltése",
      cmdLoad: "Betöltöm a(z) {m} modellt…", cmdStop: "Rendben, elhallgatok. 🤫",
      cmdLang: "Mostantól ezen a nyelven beszélek. 🗣️",
      veil: "Koppints, és beszélj a jósgömbhöz",
      veilFile: "🎙️ A beszédhez indítsd a „Magic AI indítása” ikonnal. Addig koppints, és írd be a kérdésed. ⌨️",
      foundVideo: "Találtam egy videót is a témáról! 🎬"
    },
    en: {
      hint: "Press Start and talk to me",
      start: "Start", stop: "Stop",
      voicePrep: "Downloading my voice…",
      earsPrep: "Downloading my hearing…",
      hear: "Making sense of it…",
      convOff: "Conversation ended. Press Start when you need me. 👋",
      listen: "Listening…", think: "Thinking…", speak: "Speaking…",
      load: "Loading model", loaded: "Model ready ✨",
      greet: "Welcome! Ask your question and I'll gaze into the future. 🔮",
      noSpeech: "I didn't hear anything – tap and try again.",
      noMic: "This browser doesn't support speech recognition. Try Chrome or Edge.",
      micDenied: "The microphone is blocked. Allow it in your browser (🔒 next to the address bar), or just type your question. ⌨️",
      micInsecure: "Speech recognition needs a secure start – use the “Start Magic AI” shortcut. Until then, just type your question. ⌨️",
      noMicDevice: "No microphone found. Plug one in or type your question. ⌨️",
      noAnswer: "I couldn't find a sure answer for that. 🙈",
      thinkingOf: "Let me look into this…", modelLoading: "Loading model",
      cmdLoad: "Loading the {m} model…", cmdStop: "Okay, I'll be quiet. 🤫",
      cmdLang: "I'll speak this language from now on. 🗣️",
      veil: "Tap and speak to the crystal ball",
      veilFile: "🎙️ For voice, start with the “Start Magic AI” shortcut. Until then, tap and type your question. ⌨️",
      foundVideo: "I also found a video about this! 🎬"
    },
    de: { hint: "Drück Start und sprich mit mir", start: "Start", stop: "Stopp", voicePrep: "Meine Stimme wird geladen…", convOff: "Gespräch beendet. Drück Start, wenn du mich brauchst. 👋", listen: "Ich höre zu…", think: "Ich denke nach…", speak: "Ich spreche…", load: "Modell wird geladen", loaded: "Modell bereit ✨", greet: "Willkommen! Stell deine Frage, und ich blicke in die Zukunft. 🔮", noSpeech: "Ich habe nichts gehört – tippe und versuch es erneut.", noMic: "Dieser Browser unterstützt keine Spracherkennung. Versuche Chrome oder Edge.", micDenied: "Das Mikrofon ist blockiert. Erlaube es im Browser.", noAnswer: "Darauf habe ich keine sichere Antwort gefunden. 🙈", thinkingOf: "Schauen wir mal…", modelLoading: "Modell wird geladen", cmdLoad: "Lade das {m}-Modell…", cmdStop: "Gut, ich bin still. 🤫", cmdLang: "Ab jetzt spreche ich diese Sprache. 🗣️", veil: "Tippe und sprich zur Kristallkugel", foundVideo: "Ich habe auch ein Video dazu gefunden! 🎬" },
    ru: { hint: "Нажми «Старт» и говори со мной", start: "Старт", stop: "Стоп", voicePrep: "Загружаю свой голос…", convOff: "Разговор завершён. Нажми «Старт», когда я понадоблюсь. 👋", listen: "Слушаю…", think: "Думаю…", speak: "Говорю…", load: "Загрузка модели", loaded: "Модель готова ✨", greet: "Привет! Задай вопрос, и я загляну в будущее. 🔮", noSpeech: "Я ничего не услышал — коснись и попробуй снова.", noMic: "Этот браузер не поддерживает распознавание речи. Попробуй Chrome или Edge.", micDenied: "Микрофон заблокирован. Разреши его в браузере.", noAnswer: "Я не нашёл точного ответа. 🙈", thinkingOf: "Сейчас посмотрю…", modelLoading: "Загрузка модели", cmdLoad: "Загружаю модель {m}…", cmdStop: "Хорошо, молчу. 🤫", cmdLang: "Теперь я говорю на этом языке. 🗣️", veil: "Коснись и говори с хрустальным шаром", foundVideo: "Я также нашёл видео по теме! 🎬" },
    pt: { hint: "Carrega em Start e fala comigo", start: "Start", stop: "Stop", voicePrep: "A transferir a minha voz…", convOff: "Conversa terminada. Carrega em Start quando precisares. 👋", listen: "A ouvir…", think: "A pensar…", speak: "A falar…", load: "A carregar o modelo", loaded: "Modelo pronto ✨", greet: "Bem-vindo! Faz a tua pergunta e vou ver o futuro. 🔮", noSpeech: "Não ouvi nada – toca e tenta de novo.", noMic: "Este navegador não suporta reconhecimento de voz. Tenta o Chrome ou Edge.", micDenied: "O microfone está bloqueado. Permite-o no navegador.", noAnswer: "Não encontrei uma resposta segura. 🙈", thinkingOf: "Deixa-me ver…", modelLoading: "A carregar o modelo", cmdLoad: "A carregar o modelo {m}…", cmdStop: "Está bem, fico calado. 🤫", cmdLang: "A partir de agora falo esta língua. 🗣️", veil: "Toca e fala com a bola de cristal", foundVideo: "Também encontrei um vídeo sobre isto! 🎬" },
    es: { hint: "Pulsa Start y habla conmigo", start: "Start", stop: "Stop", voicePrep: "Descargando mi voz…", convOff: "Conversación terminada. Pulsa Start cuando me necesites. 👋", listen: "Escuchando…", think: "Pensando…", speak: "Hablando…", load: "Cargando modelo", loaded: "Modelo listo ✨", greet: "¡Bienvenido! Haz tu pregunta y miraré el futuro. 🔮", noSpeech: "No oí nada – toca e inténtalo de nuevo.", noMic: "Este navegador no admite reconocimiento de voz. Prueba Chrome o Edge.", micDenied: "El micrófono está bloqueado. Permítelo en el navegador.", noAnswer: "No encontré una respuesta segura. 🙈", thinkingOf: "Déjame ver…", modelLoading: "Cargando modelo", cmdLoad: "Cargando el modelo {m}…", cmdStop: "Vale, me callo. 🤫", cmdLang: "A partir de ahora hablo este idioma. 🗣️", veil: "Toca y habla con la bola de cristal", foundVideo: "¡También encontré un vídeo sobre esto! 🎬" },
    fr: { hint: "Appuie sur Start et parle-moi", start: "Start", stop: "Stop", voicePrep: "Téléchargement de ma voix…", convOff: "Conversation terminée. Appuie sur Start quand tu as besoin de moi. 👋", listen: "J'écoute…", think: "Je réfléchis…", speak: "Je parle…", load: "Chargement du modèle", loaded: "Modèle prêt ✨", greet: "Bienvenue ! Pose ta question et je regarderai l'avenir. 🔮", noSpeech: "Je n'ai rien entendu – touche et réessaie.", noMic: "Ce navigateur ne gère pas la reconnaissance vocale. Essaie Chrome ou Edge.", micDenied: "Le micro est bloqué. Autorise-le dans le navigateur.", noAnswer: "Je n'ai pas trouvé de réponse sûre. 🙈", thinkingOf: "Voyons voir…", modelLoading: "Chargement du modèle", cmdLoad: "Chargement du modèle {m}…", cmdStop: "D'accord, je me tais. 🤫", cmdLang: "Désormais je parle cette langue. 🗣️", veil: "Touche et parle à la boule de cristal", foundVideo: "J'ai aussi trouvé une vidéo à ce sujet ! 🎬" },
    it: { hint: "Premi Start e parla con me", start: "Start", stop: "Stop", voicePrep: "Sto scaricando la mia voce…", convOff: "Conversazione terminata. Premi Start quando ti servo. 👋", listen: "Ascolto…", think: "Sto pensando…", speak: "Sto parlando…", load: "Caricamento modello", loaded: "Modello pronto ✨", greet: "Benvenuto! Fai la tua domanda e guarderò nel futuro. 🔮", noSpeech: "Non ho sentito nulla – tocca e riprova.", noMic: "Questo browser non supporta il riconoscimento vocale. Prova Chrome o Edge.", micDenied: "Il microfono è bloccato. Abilitalo nel browser.", noAnswer: "Non ho trovato una risposta sicura. 🙈", thinkingOf: "Fammi vedere…", modelLoading: "Caricamento modello", cmdLoad: "Carico il modello {m}…", cmdStop: "Va bene, sto zitto. 🤫", cmdLang: "D'ora in poi parlo questa lingua. 🗣️", veil: "Tocca e parla con la sfera di cristallo", foundVideo: "Ho trovato anche un video a riguardo! 🎬" }
  };
  function lang() { return (L && L.getLang && L.getLang()) || "hu"; }
  function tr(key) { var l = lang(); return (T[l] && T[l][key]) || T.en[key] || T.hu[key]; }

  // beszédfelismerés / felolvasás nyelvkódjai
  var BCP = { hu: "hu-HU", en: "en-US", de: "de-DE", ru: "ru-RU", pt: "pt-PT", es: "es-ES", fr: "fr-FR", it: "it-IT" };
  function bcp() { return BCP[lang()] || "hu-HU"; }

  // ============================================================
  //  KOZMIKUS GÖMB – CANVAS GALAXIS
  // ============================================================
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, R = 0, CX = 0, CY = 0;
  var particles = [];
  var nebulae = [];
  var energyCur = 0.16, energyTarget = 0.16;
  var speakPulse = 0;
  var hueShift = 0;
  var rafId = null;

  function ecoOn() { return document.body.classList.contains("eco"); }

  function buildParticles() {
    var count = ecoOn() ? 70 : 150;
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        a: Math.random() * Math.PI * 2,
        r: Math.pow(Math.random(), 0.7),          // sűrűbb a közép felé
        z: Math.random(),
        spd: 0.0006 + Math.random() * 0.0016,
        dir: Math.random() < 0.5 ? 1 : -1,
        tw: Math.random() * Math.PI * 2,
        twSpd: 0.02 + Math.random() * 0.05,
        hue: Math.random()                          // 0..1 → szín-keverés
      });
    }
    nebulae = [];
    for (var n = 0; n < 4; n++) {
      nebulae.push({
        a: Math.random() * Math.PI * 2,
        r: 0.25 + Math.random() * 0.4,
        size: 0.4 + Math.random() * 0.35,
        spd: 0.0004 + Math.random() * 0.0009,
        dir: n % 2 ? 1 : -1,
        hue: [[167,139,250], [232,121,249], [103,232,249], [252,211,77]][n % 4]
      });
    }
  }

  function resizeCanvas() {
    var rect = orbEl.getBoundingClientRect();
    W = Math.max(2, Math.round(rect.width));
    H = Math.max(2, Math.round(rect.height));
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(W, H) / 2;
    CX = W / 2; CY = H / 2;
  }

  function drawFrame() {
    energyCur += (energyTarget - energyCur) * 0.07;
    speakPulse *= 0.9;
    hueShift += 0.0015 + energyCur * 0.004;

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    // ködfelhők (lágy színtest)
    for (var n = 0; n < nebulae.length; n++) {
      var nb = nebulae[n];
      nb.a += nb.spd * nb.dir * (0.5 + energyCur);
      var nx = CX + Math.cos(nb.a) * nb.r * R;
      var ny = CY + Math.sin(nb.a) * nb.r * R;
      var nr = nb.size * R;
      var g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
      var col = nb.hue;
      var alpha = 0.10 + energyCur * 0.10;
      g.addColorStop(0, "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + alpha + ")");
      g.addColorStop(1, "rgba(" + col[0] + "," + col[1] + "," + col[2] + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(nx, ny, nr, 0, Math.PI * 2);
      ctx.fill();
    }

    // részecskék (kavargó galaxis)
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.a += p.spd * p.dir * (0.4 + energyCur * 2.2);
      p.tw += p.twSpd;
      var rr = p.r * R * 0.94;
      var x = CX + Math.cos(p.a) * rr;
      var y = CY + Math.sin(p.a) * rr;
      var tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(p.tw));
      var size = (0.5 + (1 - p.r) * 2.0 + p.z * 1.2) * (1 + energyCur * 0.6);
      // szín: a hue alapján violet→magenta→cyan, egy lassú elcsúszással
      var hh = (p.hue + hueShift) % 1;
      var r1, g1, b1;
      if (hh < 0.5) { var t = hh / 0.5; r1 = 167 + (232 - 167) * t; g1 = 139 + (121 - 139) * t; b1 = 250 + (249 - 250) * t; }
      else { var t2 = (hh - 0.5) / 0.5; r1 = 232 + (103 - 232) * t2; g1 = 121 + (232 - 121) * t2; b1 = 249 + (249 - 249) * t2; }
      var alpha2 = tw * (0.5 + energyCur * 0.5);
      var gr = ctx.createRadialGradient(x, y, 0, x, y, size * 2.6);
      gr.addColorStop(0, "rgba(255,255,255," + (alpha2 * 0.9) + ")");
      gr.addColorStop(0.35, "rgba(" + (r1 | 0) + "," + (g1 | 0) + "," + (b1 | 0) + "," + alpha2 + ")");
      gr.addColorStop(1, "rgba(" + (r1 | 0) + "," + (g1 | 0) + "," + (b1 | 0) + ",0)");
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(x, y, size * 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // mag-pulzálás CSS-en keresztül (beszéd közben lüktet)
    var core = 1 + speakPulse * 0.5 + (STATE === "thinking" ? 0.12 : 0);
    orbSystem.style.setProperty("--core", core.toFixed(3));

    ctx.globalCompositeOperation = "source-over";
    rafId = requestAnimationFrame(drawFrame);
  }

  function startRaf() { if (!rafId) rafId = requestAnimationFrame(drawFrame); }
  function stopRaf() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopRaf(); else startRaf();
  });

  // ============================================================
  //  ÁLLAPOT + UI
  // ============================================================
  function setState(s) {
    STATE = s;
    orbSystem.classList.remove("is-listening", "is-thinking", "is-speaking", "is-loading");
    if (s === "listening") { orbSystem.classList.add("is-listening"); energyTarget = 0.5; }
    else if (s === "thinking") { orbSystem.classList.add("is-thinking"); energyTarget = 0.85; }
    else if (s === "speaking") { orbSystem.classList.add("is-speaking"); energyTarget = 0.6; }
    else if (s === "loading") { orbSystem.classList.add("is-loading"); energyTarget = 0.7; }
    else { energyTarget = 0.16; }
  }

  var statusTimer = null;
  function showStatus(text, opts) {
    opts = opts || {};
    statusTxt.textContent = text;
    statusChip.classList.toggle("err", !!opts.err);
    if (opts.progress != null) {
      statusBar.hidden = false;
      statusBarFill.style.width = Math.round(opts.progress * 100) + "%";
    } else {
      statusBar.hidden = true;
    }
    statusChip.classList.add("show");
    clearTimeout(statusTimer);
    if (opts.sticky !== true) {
      statusTimer = setTimeout(hideStatus, opts.ms || 3200);
    }
  }
  function hideStatus() { statusChip.classList.remove("show"); }

  function showUser(text) {
    capUser.textContent = text;
    capUser.classList.add("show");
  }
  function setBot(text) {
    if (!text) {
      // üres → tiszta gömb (pl. gondolkodás közben), fátyol le
      capBot.innerHTML = "";
      capBot.classList.remove("show");
      orbSystem.classList.remove("has-text");
      return;
    }
    capBot.innerHTML = formatBot(text);
    capBot.classList.add("show");
    orbSystem.classList.add("has-text");   // sötét fátyol a gömb közepén
    capBot.scrollTop = capBot.scrollHeight;
  }
  function clearCaptions() {
    capUser.classList.remove("show");
    capBot.classList.remove("show");
    orbSystem.classList.remove("has-text");
  }
  function formatBot(text) {
    var esc = String(text || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    esc = esc.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    esc = esc.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    return esc.replace(/\n/g, "<br>");
  }

  function hideHint() { hint.classList.add("gone"); }

  // ============================================================
  //  FELOLVASÁS (Text-to-Speech)
  // ============================================================
  var speakOn = localStorage.getItem("orb_speak") !== "0";
  var ttsSession = 0, ttsWatch = null;

  var preferredVoiceURI = localStorage.getItem("orb_voice") || "";

  function ttsSupported() { return "speechSynthesis" in window; }

  // mennyire „természetes”/szép egy hang az adott nyelvhez (nagyobb = jobb).
  // A régi Microsoft SAPI5 hangok (pl. „Microsoft Szabolcs”) gépiesek; a Windows
  // 11 „Natural/Online”, a Google és a prémium hangok sokkal élethűbbek.
  function voiceScore(v, code, full) {
    var name = (v.name || "").toLowerCase();
    var vlang = (v.lang || "").toLowerCase().replace("_", "-");
    var s;
    if (vlang === full) s = 50;
    else if (vlang.indexOf(code) === 0) s = 30;
    else return -1; // nem a kívánt nyelv → kizárva
    if (/natural|neural/.test(name)) s += 120;
    if (/online/.test(name)) s += 70;
    if (/google/.test(name)) s += 60;
    if (/premium|enhanced|wavenet|studio/.test(name)) s += 55;
    if (v.localService === false) s += 15;
    if (/microsoft/.test(name) && !/online|natural/.test(name)) s -= 12; // régi gépies hang
    return s;
  }
  function voicesForLang() {
    var voices = ttsSupported() ? window.speechSynthesis.getVoices() : [];
    var code = lang(), full = bcp().toLowerCase(), list = [];
    for (var i = 0; i < voices.length; i++) {
      var sc = voiceScore(voices[i], code, full);
      if (sc >= 0) list.push({ v: voices[i], s: sc });
    }
    list.sort(function (a, b) { return b.s - a.s; });
    return list.map(function (x) { return x.v; });
  }
  function pickVoice() {
    var voices = window.speechSynthesis.getVoices();
    // 1) a felhasználó által kiválasztott hang, ha elérhető
    if (preferredVoiceURI) {
      for (var i = 0; i < voices.length; i++) if (voices[i].voiceURI === preferredVoiceURI) return voices[i];
    }
    // 2) a legszebb elérhető hang az adott nyelvhez
    var best = voicesForLang();
    if (best.length) return best[0];
    // 3) tartalék: bármilyen, a nyelvhez közeli hang
    var code = lang();
    for (var j = 0; j < voices.length; j++) if (voices[j].lang && voices[j].lang.toLowerCase().indexOf(code) === 0) return voices[j];
    return null;
  }
  var EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️‍]/gu;
  function cleanForSpeech(text) {
    return String(text || "")
      .replace(/\*\*/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(EMOJI_RE, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  // A teljes AI EGY közös hangon szól: window.MagicVoice (voice.js) – neurális,
  // saját, minden gépen ugyanaz a hang; ha nincs letöltve, a legszebb rendszerhang.
  var MV = window.MagicVoice || null;
  if (MV) MV.setLang(lang());
  // A SAJÁT, BEÉPÍTETT HALLÁS (stt.js / window.MagicEars): helyi Whisper-modell.
  // Ha le van töltve, a felismerés HELYBEN fut – nem függ a böngészőtől.
  var EARS = window.MagicEars || null;
  if (EARS) EARS.setLang(lang());

  function stopSpeaking() {
    if (MV) MV.stop();
    speakPulse = 0;
  }
  function speak(text, onDone) {
    onDone = onDone || function () {};
    if (!speakOn || !MV) { onDone(); return; }
    setState("speaking");
    MV.speak(text, {
      lang: lang(),
      onStart: function () { if (STATE !== "speaking") setState("speaking"); },
      onBoundary: function () { speakPulse = 1; },
      onEnd: function () { speakPulse = 0; onDone(); }
    });
  }

  // ============================================================
  //  WEBES KERESÉS + YOUTUBE (ai.js-en kívüli képességek, app.js-ből portolva)
  // ============================================================
  function fetchWithTimeout(url, ms) {
    var ctl = ("AbortController" in window) ? new AbortController() : null;
    var t = setTimeout(function () { if (ctl) ctl.abort(); }, ms || 8000);
    return fetch(url, ctl ? { signal: ctl.signal } : {}).finally(function () { clearTimeout(t); });
  }
  var CORS_PROXIES = [
    function (u) { return "https://corsproxy.io/?url=" + encodeURIComponent(u); },
    function (u) { return "https://api.allorigins.win/raw?url=" + encodeURIComponent(u); }
  ];
  function fetchViaProxy(url, ms) {
    function attempt(i) {
      if (i >= CORS_PROXIES.length) return Promise.reject(new Error("nincs proxy"));
      return fetchWithTimeout(CORS_PROXIES[i](url), ms).then(function (r) {
        if (!r.ok) throw new Error("proxy-hiba"); return r;
      }).catch(function () { return attempt(i + 1); });
    }
    return attempt(0);
  }
  function deAccent(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function normalize(s) { return deAccent(String(s || "").toLowerCase()).replace(/\s+/g, " ").trim(); }

  function extractTopic(q) {
    return String(q || "").replace(/[?!.]+$/g, "")
      .replace(/^(mi az a|mi az|mik az|mi a|mik a|ki az a|ki az|ki volt|kik voltak|mit jelent|mesélj|mondd el|magyarázd el|mutasd be|mit tudsz|what is|who is|who was|tell me about)\s+/i, "")
      .trim();
  }
  function parsePersonQuery(text) {
    var t = String(text || "").trim().replace(/\?+\s*$/, "").trim();
    var low = t.toLowerCase();
    var intent = /^ki\s+(az\s+a|az|volt|ez\s+a|ez|ő|o)\b/.test(low) || /^kicsoda\b/.test(low) ||
      /[ée]letrajz/.test(low) || /^(mutasd be|mes[ée]lj|besz[ée]lj)\b/.test(low) || /^ki\s+volt\b/.test(low) ||
      /^who\s+(is|was)\b/.test(low) || /^tell me about\b/.test(low);
    if (!intent) return null;
    var name = t.replace(/^ki\s+volt\s+/i, "").replace(/^ki\s+(az\s+a|az|ez\s+a|ez|ő|o)\s+/i, "")
      .replace(/^kicsoda\s+/i, "").replace(/^(mutasd be|mes[ée]lj|besz[ée]lj)\s+(nekem\s+)?/i, "")
      .replace(/^who\s+(is|was)\s+/i, "").replace(/^tell me about\s+/i, "")
      .replace(/^ki\s+/i, "").replace(/(-?\s*r[őo]l)\s*$/i, "").trim();
    if (!name || name.length < 2 || /\d/.test(name) || name.split(/\s+/).length > 5) return null;
    return name;
  }
  function needsWebLookup(text) {
    var t = String(text || "").trim(); if (!t) return false;
    var low = normalize(t);
    if (parsePersonQuery(t)) return true;
    if (/\b(jelenleg|jelenlegi|mostani|aktualis|legutobbi|legujabb|legfrissebb|friss|tavaly|iden|napjainkban|arfolyam|mennyibe kerul|ki a |kik a |current|latest|nowadays|price of)\b/.test(low)) return true;
    if (/\b20[1-9]\d\b/.test(low)) return true;
    return false;
  }
  function searchWikipedia(query, lng) {
    var base = "https://" + lng + ".wikipedia.org";
    var topic = extractTopic(query), title;
    var api = base + "/w/api.php?action=query&list=search&format=json&origin=*&srlimit=1&srsearch=" + encodeURIComponent(topic);
    return fetchWithTimeout(api, 8000).then(function (r) { return r.json(); }).then(function (d) {
      var hits = d.query && d.query.search;
      if (!hits || !hits.length) throw new Error("nincs találat");
      title = hits[0].title;
      return fetchWithTimeout(base + "/api/rest_v1/page/summary/" + encodeURIComponent(title), 8000);
    }).then(function (r) { if (!r.ok) throw new Error("nincs összefoglaló"); return r.json(); }).then(function (s) {
      var text = s.extract || "";
      if (!text || s.type === "disambiguation") throw new Error("nincs kivonat");
      if (text.length > 600) text = text.slice(0, 600).replace(/\s+\S*$/, "") + "…";
      var url = (s.content_urls && s.content_urls.desktop && s.content_urls.desktop.page) || base + "/wiki/" + encodeURIComponent(title);
      return { title: s.title || title, text: text, url: url };
    });
  }
  function searchDuckDuckGo(query) {
    var topic = extractTopic(query);
    var url = "https://api.duckduckgo.com/?format=json&no_html=1&skip_disambig=1&q=" + encodeURIComponent(topic);
    return fetchViaProxy(url, 8000).then(function (r) { return r.json(); }).then(function (d) {
      var text = d.AbstractText || d.Definition || "";
      if (!text && d.RelatedTopics && d.RelatedTopics.length && d.RelatedTopics[0].Text) text = d.RelatedTopics[0].Text;
      if (!text) throw new Error("nincs találat");
      if (text.length > 600) text = text.slice(0, 600).replace(/\s+\S*$/, "") + "…";
      return { title: d.Heading || topic, text: text, url: d.AbstractURL || "https://duckduckgo.com/?q=" + encodeURIComponent(topic) };
    });
  }
  function searchEncyclopedia(query) {
    var l = lang(), order = [l];
    if (order.indexOf("en") < 0) order.push("en");
    if (order.indexOf("hu") < 0) order.push("hu");
    function tryLang(i) {
      if (i >= order.length) return searchDuckDuckGo(query).then(function (d) { return { kind: "ddg", title: d.title, text: d.text, url: d.url }; });
      return searchWikipedia(query, order[i]).then(function (w) { return { kind: "wiki-" + order[i], title: w.title, text: w.text, url: w.url }; })
        .catch(function () { return tryLang(i + 1); });
    }
    return tryLang(0);
  }
  function buildGroundedPrompt(text, ctx2) {
    return "Az alábbi, internetről származó FORRÁS segíthet a válaszban. Ha releváns, támaszkodj rá; ha nem tartalmazza a választ, mondd meg őszintén.\n\n" +
      "--- FORRÁS (" + (ctx2.title || "internet") + ") ---\n" + ctx2.text + "\n--- forrás vége ---\n\nKÉRDÉS: " + text;
  }

  // ---- YOUTUBE ----
  // Kulcs (API) nélküli videókeresés. A nyilvános Invidious/Piped-példányok
  // gyakran változnak/leállnak, ezért EGYSZERRE sokat próbálunk – Invidious ÉS
  // Piped több tükre, közvetlenül és CORS-proxyn át, plusz a YouTube HTML-oldala.
  // Az első sikeres találat nyer.
  var INVIDIOUS = [
    "https://inv.nadeko.net", "https://invidious.nerdvpn.de", "https://yewtu.be",
    "https://invidious.privacyredirect.com", "https://iv.melmac.space", "https://inv.tux.pizza"
  ];
  var PIPED = [
    "https://pipedapi.kavin.rocks", "https://pipedapi.adminforge.de",
    "https://api.piped.private.coffee", "https://pipedapi.reallyaweso.me"
  ];
  function trimTitle(t) { t = String(t || "").trim(); if (t.length > 80) t = t.slice(0, 80).replace(/\s+\S*$/, "") + "…"; return t; }
  function ytIdFromUrl(u) { var m = String(u || "").match(/[?&/]v[=/]([\w-]{11})/) || String(u || "").match(/([\w-]{11})/); return m ? m[1] : null; }

  function searchYouTube(topic) {
    var q = encodeURIComponent(topic);
    function pick(promiseR, parse) {
      return promiseR.then(function (r) { if (!r.ok) throw new Error("yt"); return r.json(); }).then(parse);
    }
    function viaInvidious(base, proxied) {
      var url = base + "/api/v1/search?type=video&q=" + q;
      return pick(proxied ? fetchViaProxy(url, 15000) : fetchWithTimeout(url, 7000), function (list) {
        var v = (list || []).filter(function (x) { return x && x.type === "video" && x.videoId; })[0];
        if (!v) throw new Error("nincs videó");
        return { id: v.videoId, title: trimTitle(v.title) };
      });
    }
    function viaPiped(base, proxied) {
      var url = base + "/search?filter=videos&q=" + q;
      return pick(proxied ? fetchViaProxy(url, 15000) : fetchWithTimeout(url, 7000), function (d) {
        var items = (d && d.items) || [];
        for (var i = 0; i < items.length; i++) {
          var id = ytIdFromUrl(items[i].url || "");
          if (id) return { id: id, title: trimTitle(items[i].title) };
        }
        throw new Error("nincs videó");
      });
    }
    function viaHtml() {
      var url = "https://www.youtube.com/results?search_query=" + q;
      return fetchViaProxy(url, 15000).then(function (r) { return r.text(); }).then(function (html) {
        var m = html.match(/"videoId":"([\w-]{11})".{0,900}?"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/);
        if (!m) throw new Error("nincs videó");
        var title = m[2]; try { title = JSON.parse('"' + m[2] + '"'); } catch (e) {}
        return { id: m[1], title: trimTitle(title) };
      });
    }
    var attempts = [];
    INVIDIOUS.forEach(function (b) { attempts.push(function () { return viaInvidious(b, false); }); });
    PIPED.forEach(function (b) { attempts.push(function () { return viaPiped(b, false); }); });
    // proxyn át is, ha a közvetlen CORS-blokkolt
    attempts.push(function () { return viaInvidious(INVIDIOUS[0], true); });
    attempts.push(function () { return viaPiped(PIPED[0], true); });
    attempts.push(viaHtml);

    return new Promise(function (resolve, reject) {
      var pending = attempts.length, done = false;
      attempts.forEach(function (a) {
        try {
          a().then(function (v) { if (v && v.id && !done) { done = true; resolve(v); } else { tick(); } })
            .catch(tick);
        } catch (e) { tick(); }
      });
      function tick() { pending--; if (pending <= 0 && !done) reject(new Error("nincs videó")); }
    });
  }
  function isTopicQuestion(input) {
    var n = normalize(input);
    if (n.length < 8) return false;
    return /^(mi az|mi a|mik az|mik a|ki volt|ki az|kik voltak|mit jelent|hogyan|miert|mesel|mondd el|magyarazd|mutasd be|mit tudsz|what is|who is|who was|how does|why|tell me|explain)/.test(n) ||
      /(mukodik|tortent|keszul|jelent|works|happened)\b/.test(n);
  }
  function wantsVideo(input) {
    var n = normalize(input);
    return /\b(video|videot|videok|youtube|zene|zenet|dal|dalt|klip|nota|song|music|clip|watch)\b/.test(n);
  }

  // ============================================================
  //  KERINGŐ YOUTUBE-VIDEÓK
  // ============================================================
  var orbits = [];
  function orbitRadius() { return (orbSystem.clientWidth / 2) * 1.16; }
  function spawnOrbit(video) {
    var orbit = document.createElement("div");
    orbit.className = "yt-orbit";
    var dur = (18 + Math.random() * 12).toFixed(1);
    orbit.style.setProperty("--a", (Math.random() * 360).toFixed(0) + "deg");
    orbit.style.setProperty("--dur", dur + "s");
    orbit.style.setProperty("--rx", orbitRadius().toFixed(0) + "px");
    orbit.style.setProperty("--tilt", (Math.random() * 16 - 8).toFixed(1) + "deg");

    var card = document.createElement("div");
    card.className = "yt-card show";
    card.style.opacity = "0";
    card.innerHTML =
      '<img src="https://i.ytimg.com/vi/' + video.id + '/hqdefault.jpg" alt="" loading="lazy">' +
      '<div class="yt-play">▶</div>' +
      '<div class="yt-title"></div>';
    card.querySelector(".yt-title").textContent = video.title;
    card.addEventListener("click", function (e) { e.stopPropagation(); openPlayer(video.id); });

    orbit.appendChild(card);
    orbitLayer.appendChild(orbit);
    requestAnimationFrame(function () { card.style.opacity = "1"; });

    orbits.push(orbit);
    while (orbits.length > 3) { var old = orbits.shift(); if (old && old.parentNode) old.parentNode.removeChild(old); }
  }
  function updateOrbitRadii() {
    var rx = orbitRadius().toFixed(0) + "px";
    orbits.forEach(function (o) { o.style.setProperty("--rx", rx); });
  }

  // YouTube lejátszó overlay
  function openPlayer(id) {
    var pl = $("yt-player"), mount = $("yt-player-mount");
    mount.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
      '?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>';
    pl.classList.add("open");
    stopSpeaking();
  }
  function closePlayer() {
    var pl = $("yt-player"), mount = $("yt-player-mount");
    pl.classList.remove("open");
    mount.innerHTML = "";
  }

  // ============================================================
  //  VÁLASZADÁS (az AI-motor + web)
  // ============================================================
  // helyi, modell nélkül is működő gyors válaszok (idő, dátum, köszönés)
  function localQuick(text) {
    var n = normalize(text);
    if (/\b(hany ora|mennyi az ido|what time|how late|pontos ido)\b/.test(n)) {
      var d = new Date();
      return tr("greet") && (lang() === "hu"
        ? "Most " + d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2) + " van. ⏰"
        : "It's " + d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2) + " now. ⏰");
    }
    if (/\b(milyen nap van|hanyadika van|what day|what.s the date|datum)\b/.test(n)) {
      return new Date().toLocaleDateString(bcp(), { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    }
    return null;
  }

  // a teljes válasz-pipeline: modell (+web) → web-tartalék
  function answer(text) {
    return new Promise(function (resolve) {
      var quick = localQuick(text);
      if (quick) { resolve({ text: quick, source: "local" }); return; }

      function viaWeb() {
        searchEncyclopedia(text)
          .then(function (r) { resolve({ text: "**" + r.title + "** – " + r.text, source: r.kind, link: r.url }); })
          .catch(function () { resolve({ text: tr("noAnswer"), source: "none" }); });
      }

      if (L && L.isReady && L.isReady()) {
        function viaAI() {
          L.run(L.CHAT_SYSTEM, text, function (partial) { setBot(partial); }, { temperature: 0.5 })
            .then(function (full) { full = String(full || "").trim(); if (full) resolve({ text: full, source: "ai" }); else viaWeb(); })
            .catch(viaWeb);
        }
        if (needsWebLookup(text)) {
          fetchWebContext(text).then(function (ctx2) {
            L.run(L.WEB_SYSTEM, buildGroundedPrompt(text, ctx2), function (partial) { setBot(partial); }, { temperature: 0.4 })
              .then(function (full) { full = String(full || "").trim(); if (full) resolve({ text: full, source: "ai-web", link: ctx2.url }); else viaAI(); })
              .catch(viaAI);
          }).catch(viaAI);
        } else { viaAI(); }
        return;
      }
      viaWeb();
    });
  }
  function fetchWebContext(text) {
    var person = parsePersonQuery(text);
    return searchEncyclopedia(person || text);
  }

  // a kérdés feldolgozása elejétől a végéig
  function handleQuestion(text) {
    text = String(text || "").trim();
    if (!text) return;
    if (busy) stopSpeaking();
    busy = true;
    lastQuestion = text;
    showUser(text);
    setBot("");
    setState("thinking");
    showStatus(tr("think"), { sticky: true });

    answer(text).then(function (res) {
      lastAnswer = res.text || "";
      // a forráslinket SZÁNDÉKOSAN nem írjuk ki (a user kérése): a gömb tiszta
      // marad, a videó pedig kattintható a gömb körül
      setBot(res.text || tr("noAnswer"));
      hideStatus();
      // YouTube-keresés: tudás-jellegű kérdésnél vagy explicit videókérésnél
      maybeYouTube(text, res.source);
      // felolvasás, majd (beszélgetés-módban) magától újra figyelés
      showStatus(tr("speak"), { sticky: true });
      speak(res.text, function () {
        busy = false;
        hideStatus();
        if (STATE === "speaking") setState("idle");
        resumeListen();
      });
    }).catch(function () {
      busy = false;
      setState("idle");
      setBot(tr("noAnswer"));
      showStatus(tr("noAnswer"), { err: true });
      resumeListen();
    });
  }

  function maybeYouTube(text, source) {
    var explicit = wantsVideo(text);
    if (!explicit && !isTopicQuestion(text)) return;
    var topic = explicit ? text.replace(/[?!.]+$/, "").trim() : extractTopic(text);
    if (!topic || topic.length < 3) topic = text;
    searchYouTube(topic).then(function (v) {
      spawnOrbit(v);
      showStatus(tr("foundVideo"), { ms: 2600 });
    }).catch(function () { /* nincs videó – nem gond */ });
  }

  // ============================================================
  //  HANGPARANCSOK (modell betöltése, leállítás, nyelv, ismétlés)
  // ============================================================
  function detectTier(n) {
    if (/\b(expert|legokosabb|legjobb|biggest|smartest|grosste|samyj umnyj)\b/.test(n)) return "Expert";
    if (/\b(gyors|fast|kicsi|small|schnell|bystr)\b/.test(n)) return "Fast";
    if (/\b(normal|kozepes|atlagos|medium|balanced|normale)\b/.test(n)) return "Normal";
    return null;
  }
  function modelByTier(tier) {
    var arr = (L && L.MODELS) || [];
    for (var i = 0; i < arr.length; i++) if (arr[i].tier === tier) return arr[i];
    return null;
  }
  function detectLangSwitch(n) {
    if (!/\b(valts|valtas|beszelj|nyelv|switch|speak|change|language|sprich|sprache|govori|parla|parle|habla|fala)\b/.test(n)) return null;
    if (/\b(magyar|hungarian|ungarisch)\b/.test(n)) return "hu";
    if (/\b(angol|english|englisch)\b/.test(n)) return "en";
    if (/\b(nemet|german|deutsch)\b/.test(n)) return "de";
    if (/\b(orosz|russian|russisch|russkij)\b/.test(n)) return "ru";
    if (/\b(portugal|portuguese|portugues)\b/.test(n)) return "pt";
    if (/\b(spanyol|spanish|espanol|spanisch)\b/.test(n)) return "es";
    if (/\b(francia|french|francais|franzosisch)\b/.test(n)) return "fr";
    if (/\b(olasz|italian|italiano|italienisch)\b/.test(n)) return "it";
    return null;
  }
  // rövid szóbeli visszajelzés, majd (beszélgetés-módban) újra figyelés
  function respond(text) {
    busy = true;
    setBot(text);
    speak(text, function () {
      busy = false;
      if (STATE === "speaking") setState("idle");
      resumeListen();
    });
  }
  // ha hangparancs volt, lekezeli és true-t ad vissza
  function handleVoiceCommand(text) {
    var n = normalize(text);

    // leállítás / elhallgatás
    if (/\b(allj|all meg|eleg|csend|hallgass|stop|silence|cancel|quiet|halt|schweig|ticho)\b/.test(n) && n.split(" ").length <= 4) {
      stopSpeaking(); busy = false; setState("idle");
      respond(tr("cmdStop"));
      return true;
    }
    // ismétlés
    if (/\b(ismeteld|megegyszer|ismet|repeat|again|noch mal|otra vez|encore)\b/.test(n) && lastAnswer) {
      respond(lastAnswer);
      return true;
    }
    // nyelvváltás
    var ls = detectLangSwitch(n);
    if (ls && ls !== lang()) {
      applyLang(ls);
      respond(tr("cmdLang"));
      return true;
    }
    // modell betöltése
    var tier = detectTier(n);
    var loadIntent = /\b(tolts|toltsd|betolt|betoltes|letolt|aktivalj|valts|load|download|activate|switch|lade|laden|zagruzi)\b/.test(n) &&
      /\b(model|modell|ai|modell|modelt)\b/.test(n);
    if (tier || loadIntent) {
      var m = tier ? modelByTier(tier) : (L && modelByTier("Normal"));
      if (m) { startModelLoad(m.id, m); return true; }
    }
    return false;
  }

  // ============================================================
  //  MODELL BETÖLTÉS
  // ============================================================
  function startModelLoad(id, meta) {
    if (!L) return;
    if (!L.supported || !L.supported()) {
      showStatus("WebGPU nem elérhető – a modell nem futtatható.", { err: true, ms: 5000 });
      return;
    }
    if (L.isLoading && L.isLoading()) return;
    var name = meta ? meta.tier : "";
    setState("loading");
    showStatus(tr("modelLoading") + (name ? " · " + name : "") + " 0%", { progress: 0, sticky: true });
    if (modelSelect) modelSelect.value = id;
    var msg = tr("cmdLoad").replace("{m}", name || "AI");
    setBot(msg);
    L.load(id, function (p) {
      var pr = p && p.progress ? p.progress : 0;
      showStatus(tr("modelLoading") + (name ? " · " + name : "") + " " + Math.round(pr * 100) + "%", { progress: pr, sticky: true });
      if (modelBar) { modelBar.hidden = false; modelBarFill.style.width = Math.round(pr * 100) + "%"; }
    }).then(function () {
      setState("idle");
      showStatus(tr("loaded"), { ms: 3000 });
      if (modelStatus) modelStatus.textContent = tr("loaded");
      if (modelBar) modelBar.hidden = true;
      refreshModelBtn();
      var done = lang() === "hu" ? "Kész, betöltöttem a modellt. Most már kérdezhetsz! ✨" : tr("loaded");
      if (started) { stopListening(); speak(done, function () { resumeListen(); }); }
    }).catch(function (err) {
      setState("idle");
      showStatus((err && err.message) || "Hiba a betöltéskor.", { err: true, ms: 5000 });
      if (modelBar) modelBar.hidden = true;
    });
  }

  // ============================================================
  //  BESZÉDFELISMERÉS (Speech-to-Text)
  // ============================================================
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recog = null, listening = false;
  var finalBuf = "";                 // az elhangzott VÉGLEGES szövegrészek gyűjtője
  var silenceTimer = null;           // rövid csend után zárjuk le a mondatot
  var srRestarts = 0, srRestartAt = 0; // újraindulás-őr (hibahurok ellen)
  var srErrors = 0;                  // network/nyelvi hibák számlálója
  var srBroken = false;              // a böngésző felismerője nem működik → beépített hallás
  var micBlocked = false;            // a böngésző megtagadta a mikrofont → ne kérjük újra
  var micReady = false;              // az engedélyt MÁR megkaptuk (getUserMedia) → nincs újrakérdezés
  // ---- beépített hallás (MagicEars) ----
  function earsWanted() { return !!(EARS && EARS.supported() && EARS.enabled()); }
  function earsReady() { return earsWanted() && EARS.ready(); }
  function srSupported() { return !!SR; }
  // FONTOS BUGFIX: a Chrome a file://-t is „biztonságos kontextusnak" jelenti
  // (window.isSecureContext === true), PEDIG ott a beszédfelismerés MINDEN
  // indításkor újra engedélyt kér és nem is működik. Ezért a protokollt KÖZVETLENÜL
  // nézzük: a mikrofon csak https-en vagy http://localhost-on használható.
  function isFileProto() { return location.protocol === "file:"; }
  function micUsableOrigin() { return !isFileProto() && window.isSecureContext !== false; }
  function secureCtx() { return micUsableOrigin(); }   // visszafelé kompatibilis a régi hívásokhoz
  // hallgatni a beépített hallással VAGY a böngésző felismerőjével lehet
  function canListen() { return micUsableOrigin() && !micBlocked && (srSupported() || earsWanted()); }
  function focusAsk() { var i = $("ask-input"); if (i) { try { i.focus(); } catch (e) {} } }

  // EGYSZERI mikrofon-engedély: a getUserMedia enged tartósan (biztonságos
  // eredeten megjegyzi a böngésző), így a felismerő NEM kérdez minden koppintáskor.
  function ensureMic() {
    if (micReady) return Promise.resolve(true);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.resolve(true);
    return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      try { stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}  // csak az engedély kellett
      micReady = true; micBlocked = false; return true;
    }).catch(function (e) {
      var name = e && (e.name || e.error || "");
      if (name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError") micBlocked = true;
      return false;
    });
  }

  // a felismerő TÖBB jelöltje közül a LEGBIZTOSABBAT választjuk – ettől sokkal
  // pontosabb a megértés, mint az első (sokszor téves) tippel
  function bestAlternative(res) {
    var best = res[0];
    for (var j = 1; j < res.length; j++) {
      if ((res[j].confidence || 0) > ((best && best.confidence) || 0)) best = res[j];
    }
    return (best && best.transcript) || "";
  }
  // rövid csend után zárjuk le a mondatot – így NEM vágjuk el félúton,
  // ha a beszélő csak levegőt vesz vagy gondolkodik egy pillanatra
  function armSilence() {
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(finalizeUtterance, finalBuf ? 1100 : 2600);
  }
  function finalizeUtterance() {
    clearTimeout(silenceTimer); silenceTimer = null;
    var text = finalBuf.trim();
    finalBuf = "";
    if (!text || text.replace(/\s+/g, "").length < 2) return;  // zaj – figyelünk tovább
    stopListening();                 // feldolgozás + felolvasás alatt nem hallgatózunk
    showUser(text);
    if (!handleVoiceCommand(text)) handleQuestion(text);
  }
  function buildRecognizer() {
    if (!SR) return null;
    var r = new SR();
    r.lang = bcp();
    r.interimResults = true;
    r.continuous = true;         // NE álljon le az első kis szünetnél – végighallgatja a mondatot
    r.maxAlternatives = 4;       // több jelölt → a legbiztosabb nyer
    r.onstart = function () {
      listening = true; finalBuf = "";
      if (!busy) { setState("listening"); showStatus(tr("listen"), { sticky: true }); }
    };
    r.onresult = function (e) {
      srRestarts = 0; srErrors = 0;
      var interim = "", gotFinal = false;
      for (var i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) { finalBuf = (finalBuf + " " + bestAlternative(e.results[i])).trim(); gotFinal = true; }
        else interim += e.results[i][0].transcript;
      }
      var shown = (finalBuf + " " + interim).replace(/\s+/g, " ").trim();
      if (shown) showUser(shown);
      if (gotFinal || interim) armSilence();
    };
    r.onerror = function (e) {
      var err = e && e.error;
      if (err === "not-allowed" || err === "service-not-allowed") {
        micBlocked = true; listening = false;
        stopConversation(true);
        showStatus(secureCtx() ? tr("micDenied") : tr("micInsecure"), { err: true, ms: 6000 });
        focusAsk();
      } else if (err === "audio-capture") {
        listening = false;
        stopConversation(true);
        showStatus(tr("noMicDevice"), { err: true, ms: 5000 });
        focusAsk();
      } else if (err === "network" || err === "language-not-supported") {
        // a böngésző felismerője (Google/Microsoft szerver) nem működik –
        // NE némán haljon el: jelezzük, és áttérünk a beépített hallásra
        srErrors++;
        if (srErrors >= 2 && !srBroken) {
          srBroken = true;
          if (earsWanted()) {
            showStatus(lang() === "hu"
              ? "A böngésző felismerője nem működik – áttérek a beépített hallásra… 👂"
              : "Browser recognition failed – switching to built-in hearing… 👂", { ms: 5000 });
          } else {
            showStatus((lang() === "hu" ? "Beszédfelismerési hiba: " : "Speech recognition error: ") + err, { err: true, ms: 7000 });
            focusAsk();
          }
        }
      }
      // "no-speech" / "aborted": csendben újraindulunk (az onend intézi)
    };
    r.onend = function () {
      listening = false;
      // ha maradt lezáratlan szöveg, dolgozzuk fel most
      if (finalBuf.trim()) { finalizeUtterance(); return; }
      if (STATE === "listening") setState("idle");
      // beszélgetés-módban MAGÁTÓL újraindul (a böngésző időnként leállítja)
      if (convOn && !busy && canListen()) {
        var now = Date.now();
        if (now - srRestartAt > 15000) { srRestartAt = now; srRestarts = 0; }
        srRestarts++;
        if (srRestarts > 10) { stopConversation(true); showStatus(tr("noSpeech"), { err: true, ms: 5000 }); return; }
        setTimeout(function () { if (convOn && !busy && !listening) startListening(); }, 300);
      }
    };
    return r;
  }
  function startListening() {
    if (!canListen() || busy || listening) return;
    // 1) BEÉPÍTETT HALLÁS (helyi Whisper), ha kész – ez a legpontosabb út
    if (earsReady()) { startEars(); return; }
    // 2) ha a böngésző felismerője nem járható, a beépített hallás kell → letöltés
    if (!srSupported() || srBroken) {
      if (earsWanted()) ensureEars(false);
      else { stopConversation(true); showStatus(tr("noMic"), { err: true, ms: 6000 }); focusAsk(); }
      return;
    }
    // 3) böngésző felismerője MOST + a beépített hallás letöltése a HÁTTÉRBEN
    ensureMic().then(function (ok) {
      if (!ok) {
        showStatus(micBlocked ? tr("micDenied") : tr("noMicDevice"), { err: true, ms: 5000 });
        focusAsk();
        return;
      }
      if (busy || listening || !convOn) return;
      if (!recog) recog = buildRecognizer();
      recog.lang = bcp();
      try { recog.start(); } catch (e) { /* már fut */ }
    });
    if (earsWanted() && !earsReady()) ensureEars(true);
  }
  function stopListening() {
    clearTimeout(silenceTimer); silenceTimer = null;
    finalBuf = "";
    if (EARS) EARS.stop();
    if (recog && listening) { try { recog.stop(); } catch (e) {} }
    listening = false;
  }

  // ---- hallgatás a BEÉPÍTETT hallással (helyi Whisper) ----
  function startEars() {
    if (!earsReady() || listening) return;
    listening = true;
    EARS.setLang(lang());
    setState("listening");
    showStatus(tr("listen"), { sticky: true });
    EARS.listen({
      lang: lang(),
      onSpeechStart: function () { speakPulse = 0.6; },    // kis vizuális jel: hall téged
      onStatus: function (s) {
        if (s === "transcribe") { setState("thinking"); showStatus(tr("hear"), { sticky: true }); }
      },
      onText: function (text) {
        listening = false;
        text = String(text || "").trim();
        if (!text || text.replace(/\s+/g, "").length < 2) {
          if (STATE !== "idle") setState("idle");
          if (convOn) { showStatus(tr("listen"), { sticky: true }); resumeListen(120); }
          return;
        }
        showUser(text);
        if (!handleVoiceCommand(text)) handleQuestion(text);
      },
      onError: function (err) {
        listening = false;
        if (err === "NotAllowedError" || err === "SecurityError") {
          micBlocked = true;
          stopConversation(true);
          showStatus(tr("micDenied"), { err: true, ms: 6000 });
          focusAsk();
          return;
        }
        showStatus((lang() === "hu" ? "Hallás-hiba: " : "Hearing error: ") + err, { err: true, ms: 4000 });
        resumeListen(800);
      }
    });
  }
  // a hallás-modell letöltése/aktiválása (background=true → csendben, a háttérben)
  var earsFetching = false;
  function ensureEars(background) {
    if (!earsWanted() || earsReady() || earsFetching) return;
    earsFetching = true;
    if (!background) showStatus(tr("earsPrep"), { progress: 0, sticky: true });
    refreshEarsUI();
    EARS.load(function (p) {
      if (!background) showStatus(tr("earsPrep") + " " + Math.round(p * 100) + "%", { progress: p, sticky: true });
      if (earsBar && earsBarFill) { earsBar.hidden = false; earsBarFill.style.width = Math.round(p * 100) + "%"; }
    }).then(function () {
      earsFetching = false;
      if (!background) hideStatus();
      if (earsBar) earsBar.hidden = true;
      refreshEarsUI();
      if (convOn && !busy && !listening) startListening();
    }).catch(function () {
      earsFetching = false;
      if (earsBar) earsBar.hidden = true;
      if (!background) showStatus(lang() === "hu"
        ? "Nem sikerült letölteni a hallás-modellt (internet?)."
        : "Couldn't download the hearing model (internet?).", { err: true, ms: 6000 });
      refreshEarsUI();
    });
  }

  // ============================================================
  //  NYELV ALKALMAZÁSA
  // ============================================================
  function applyLang(code) {
    if (L && L.setLang) L.setLang(code);
    if (MV) MV.setLang(code);
    if (EARS) EARS.setLang(code);   // a hallás-modell EGY fájl, minden nyelvet ért
    document.documentElement.lang = code;
    if (langSelect) langSelect.value = code;
    applyUITexts();
    populateVoiceSelect();   // a hanglista a nyelvhez igazodjon
    refreshNeuralUI();       // a neurális hang gombja/állapota a nyelvhez igazodjon
    autoLoadNeural();        // ha erre a nyelvre már le volt töltve, töltsük a cache-ből
    refreshEarsUI();
    if (recog) recog.lang = bcp();
  }
  function applyUITexts() {
    $("hint-txt").textContent = tr("hint");
    if (startBtn) { var st = startBtn.querySelector(".os-txt"); if (st) st.textContent = tr("start"); }
    if (stopBtn) { var sp = stopBtn.querySelector(".os-txt"); if (sp) sp.textContent = tr("stop"); }
    // panel feliratok (hu/en, máshol angol tartalék már a panelben)
  }

  // ============================================================
  //  BEÁLLÍTÁS PANEL
  // ============================================================
  var langSelect = $("lang-select");
  var modelSelect = $("model-select");
  var modelLoadBtn = $("model-load");
  var modelBar = $("model-bar");
  var modelBarFill = $("model-bar-fill");
  var modelStatus = $("model-status");
  var voiceToggle = $("voice-toggle");
  var voiceSelect = $("voice-select");
  var neuralToggle = $("neural-toggle");
  var neuralLoadBtn = $("neural-load");
  var neuralBar = $("neural-bar");
  var neuralBarFill = $("neural-bar-fill");
  var neuralStatus = $("neural-status");
  var neuralBusy = false;
  var earsToggle = $("ears-toggle");
  var earsSelect = $("ears-select");
  var earsLoadBtn = $("ears-load");
  var earsBar = $("ears-bar");
  var earsBarFill = $("ears-bar-fill");
  var earsStatus = $("ears-status");
  var ecoToggle = $("eco-toggle");

  function populateVoiceSelect() {
    if (!voiceSelect) return;
    var list = voicesForLang();
    voiceSelect.innerHTML = "";
    var auto = document.createElement("option");
    auto.value = "";
    auto.textContent = lang() === "hu" ? "✨ Automatikus (legszebb elérhető)" : "✨ Automatic (best available)";
    voiceSelect.appendChild(auto);
    list.forEach(function (v) {
      var o = document.createElement("option");
      o.value = v.voiceURI;
      var star = /natural|neural|online|google|premium|enhanced|wavenet|studio/i.test(v.name) ? " ⭐" : "";
      o.textContent = v.name + star;
      voiceSelect.appendChild(o);
    });
    var hasPref = preferredVoiceURI && list.some(function (v) { return v.voiceURI === preferredVoiceURI; });
    voiceSelect.value = hasPref ? preferredVoiceURI : "";
    if (!list.length) {
      var none = document.createElement("option");
      none.value = ""; none.disabled = true;
      none.textContent = lang() === "hu" ? "(nincs telepített hang ehhez a nyelvhez)" : "(no installed voice for this language)";
      voiceSelect.appendChild(none);
    }
  }

  // ---- SAJÁT (neurális) HANG kezelése a panelben ----
  function neuralAvail() { return !!(MV && MV.neuralSupported()); }
  function refreshNeuralUI() {
    if (!neuralToggle) return;
    var hu = lang() === "hu";
    if (!neuralAvail()) {
      neuralToggle.checked = false; neuralToggle.disabled = true;
      if (neuralLoadBtn) neuralLoadBtn.disabled = true;
      if (neuralStatus) neuralStatus.textContent = hu
        ? "Ebben a böngészőben nem érhető el a neurális hang – a rendszerhang szól."
        : "Neural voice isn't available here – the system voice is used.";
      return;
    }
    neuralToggle.disabled = false;
    neuralToggle.checked = MV.neuralEnabled();
    if (neuralBusy || !neuralLoadBtn) return;
    var ready = MV.neuralReady(lang()), downloaded = MV.neuralDownloaded(lang());
    neuralLoadBtn.disabled = false;
    if (ready) neuralLoadBtn.textContent = hu ? "✅ Saját hang kész – kipróbálom" : "✅ Custom voice ready – try it";
    else if (downloaded) neuralLoadBtn.textContent = hu ? "✨ Saját hang aktiválása" : "✨ Activate custom voice";
    else neuralLoadBtn.textContent = hu ? "⬇️ Saját hang letöltése" : "⬇️ Download custom voice";
    if (neuralStatus) neuralStatus.textContent = ready
      ? (hu ? "A gömb a saját neurális hangján beszél. ✨" : "The orb speaks in its own neural voice. ✨")
      : "";
  }
  function startNeuralLoad(withSample) {
    if (!neuralAvail() || neuralBusy) return;
    var hu = lang() === "hu";
    if (MV.neuralReady(lang())) {
      if (withSample !== false) MV.sample(hu ? "Szia! Ez az én saját hangom." : "Hi! This is my own voice.", lang());
      return;
    }
    neuralBusy = true;
    MV.setNeuralEnabled(true);
    if (neuralToggle) neuralToggle.checked = true;
    if (neuralLoadBtn) { neuralLoadBtn.disabled = true; neuralLoadBtn.textContent = hu ? "⏳ Letöltés…" : "⏳ Downloading…"; }
    if (neuralBar) neuralBar.hidden = false;
    if (neuralStatus) neuralStatus.textContent = hu ? "A saját hang letöltése folyamatban…" : "Downloading the custom voice…";
    MV.loadNeural(lang(), function (p) { if (neuralBarFill) neuralBarFill.style.width = Math.round(p * 100) + "%"; })
      .then(function () {
        neuralBusy = false;
        if (neuralBar) neuralBar.hidden = true;
        refreshNeuralUI();
        if (withSample !== false) MV.sample(hu ? "Kész! Mostantól ezen a saját hangon beszélek." : "Done! I'll speak in my own voice now.", lang());
      })
      .catch(function () {
        neuralBusy = false;
        if (neuralBar) neuralBar.hidden = true;
        if (neuralStatus) neuralStatus.textContent = hu
          ? "Nem sikerült letölteni a saját hangot (internet?). Marad a rendszerhang."
          : "Couldn't download the custom voice (internet?). Using the system voice.";
        if (neuralLoadBtn) { neuralLoadBtn.disabled = false; neuralLoadBtn.textContent = hu ? "⬇️ Újra: saját hang letöltése" : "⬇️ Retry: download custom voice"; }
      });
  }
  // a saját hang MAGÁTÓL betöltődik: ha már le volt töltve → gyors visszatöltés a
  // gyorsítótárból; ha még SOSEM → most töltjük le a háttérben, hogy az első
  // megszólalás már a saját (nem gépi) hangon szóljon
  function autoLoadNeural() {
    if (!neuralAvail() || neuralBusy) return;
    if (!MV.neuralEnabled() || MV.neuralReady(lang())) return;
    MV.loadNeural(lang(), function (p) {
      if (neuralBar && neuralBarFill && !neuralBusy) { neuralBar.hidden = false; neuralBarFill.style.width = Math.round(p * 100) + "%"; }
    }).then(function () {
      if (neuralBar && !neuralBusy) neuralBar.hidden = true;
      refreshNeuralUI();
    }).catch(function () {
      if (neuralBar && !neuralBusy) neuralBar.hidden = true;
    });
  }

  // ---- BEÉPÍTETT HALLÁS kezelése a panelben ----
  function earsGb(id) {
    var m = ((EARS && EARS.MODELS) || []).filter(function (x) { return x.id === id; })[0];
    return m ? (m.mb / 1000).toFixed(1) + " GB" : "";
  }
  function fillEarsSelect() {
    if (!earsSelect || !EARS) return;
    earsSelect.innerHTML = "";
    EARS.MODELS.forEach(function (m) {
      var o = document.createElement("option");
      o.value = m.id;
      o.textContent = m.tier + " · " + (m.mb / 1000).toFixed(1) + " GB";
      earsSelect.appendChild(o);
    });
    earsSelect.value = EARS.currentModel();
  }
  function refreshEarsUI() {
    if (!earsToggle) return;
    var hu = lang() === "hu";
    if (!EARS || !EARS.supported()) {
      earsToggle.checked = false; earsToggle.disabled = true;
      if (earsSelect) earsSelect.disabled = true;
      if (earsLoadBtn) earsLoadBtn.disabled = true;
      if (earsStatus) earsStatus.textContent = hu
        ? "Ebben a böngészőben nem érhető el a beépített hallás."
        : "Built-in hearing isn't available in this browser.";
      return;
    }
    earsToggle.disabled = false;
    earsToggle.checked = EARS.enabled();
    if (earsSelect) earsSelect.disabled = earsFetching;
    if (earsLoadBtn) {
      earsLoadBtn.disabled = earsFetching;
      if (earsFetching) earsLoadBtn.textContent = hu ? "⏳ Letöltés…" : "⏳ Downloading…";
      else if (EARS.ready()) earsLoadBtn.textContent = hu ? "✅ Beépített hallás kész" : "✅ Built-in hearing ready";
      else if (EARS.wasDownloaded()) earsLoadBtn.textContent = hu ? "✨ Hallás aktiválása" : "✨ Activate hearing";
      else earsLoadBtn.textContent = (hu ? "⬇️ Hallás letöltése · " : "⬇️ Download hearing · ") + earsGb(EARS.currentModel());
    }
    if (earsStatus) earsStatus.textContent = EARS.ready()
      ? (hu ? "A felismerés HELYBEN fut – nem függ a böngészőtől. 👂✅" : "Recognition runs locally – browser-independent. 👂✅")
      : (hu ? "Amíg nincs letöltve, a böngésző felismerőjét használom (ahhoz Chrome ajánlott)." : "Until downloaded, the browser recognizer is used (Chrome recommended).");
  }

  function fillModels() {
    if (!modelSelect || !L || !L.MODELS) return;
    modelSelect.innerHTML = "";
    L.MODELS.forEach(function (m) {
      var o = document.createElement("option");
      o.value = m.id;
      o.textContent = m.tier + " · " + (m.mb / 1000).toFixed(1) + " GB";
      modelSelect.appendChild(o);
    });
    modelSelect.value = (L.currentModel && L.currentModel()) || (L.lastLoadedModel && L.lastLoadedModel()) || (L.defaultModel && L.defaultModel());
    refreshModelBtn();
  }
  function refreshModelBtn() {
    if (!modelLoadBtn || !L) return;
    var sel = modelSelect.value;
    var cur = L.currentModel && L.currentModel();
    if (cur && cur === sel) modelLoadBtn.textContent = "✅ " + tr("loaded");
    else if (cur) modelLoadBtn.textContent = "🔄 " + (lang() === "hu" ? "Váltás erre a modellre" : "Switch to this model");
    else modelLoadBtn.textContent = "⬇️ " + tr("load");
  }

  function openPanel() { $("panel").classList.add("open"); }
  function closePanel() { $("panel").classList.remove("open"); }

  function setupPanel() {
    fillModels();
    langSelect.value = lang();
    voiceToggle.checked = speakOn;
    ecoToggle.checked = localStorage.getItem("magicai_eco") === "1";
    if (ecoToggle.checked) document.body.classList.add("eco");

    $("gear").addEventListener("click", openPanel);
    $("panel-x").addEventListener("click", closePanel);
    $("panel-back").addEventListener("click", closePanel);

    langSelect.addEventListener("change", function () { applyLang(langSelect.value); refreshModelBtn(); });
    modelSelect.addEventListener("change", refreshModelBtn);
    modelLoadBtn.addEventListener("click", function () {
      var id = modelSelect.value;
      var meta = (L.MODELS || []).filter(function (m) { return m.id === id; })[0];
      startModelLoad(id, meta);
    });
    voiceToggle.addEventListener("change", function () {
      speakOn = voiceToggle.checked;
      localStorage.setItem("orb_speak", speakOn ? "1" : "0");
      if (!speakOn) stopSpeaking();
    });
    if (voiceSelect) {
      populateVoiceSelect();
      voiceSelect.addEventListener("change", function () {
        preferredVoiceURI = voiceSelect.value;
        localStorage.setItem("orb_voice", preferredVoiceURI);
        if (MV) MV.setPreferredVoice(preferredVoiceURI);
        // rövid hangminta a kiválasztott hangból
        if (speakOn && ttsSupported()) { stopSpeaking(); speak(lang() === "hu" ? "Szia! Így hangzik ez a hang." : "Hi! This is how I sound."); }
      });
    }
    if (neuralToggle) {
      refreshNeuralUI();
      neuralToggle.addEventListener("change", function () {
        if (MV) MV.setNeuralEnabled(neuralToggle.checked);
        if (neuralToggle.checked) autoLoadNeural();
        refreshNeuralUI();
      });
    }
    if (neuralLoadBtn) neuralLoadBtn.addEventListener("click", function () { startNeuralLoad(true); });
    // beépített hallás (helyi Whisper)
    if (earsToggle) {
      fillEarsSelect();
      refreshEarsUI();
      earsToggle.addEventListener("change", function () {
        if (EARS) EARS.setEnabled(earsToggle.checked);
        refreshEarsUI();
      });
      if (earsSelect) earsSelect.addEventListener("change", function () {
        if (EARS) EARS.setModel(earsSelect.value);
        refreshEarsUI();
      });
      if (earsLoadBtn) earsLoadBtn.addEventListener("click", function () {
        if (!EARS) return;
        EARS.setEnabled(true);
        earsToggle.checked = true;
        ensureEars(false);
      });
    }
    ecoToggle.addEventListener("change", function () {
      var on = ecoToggle.checked;
      document.body.classList.toggle("eco", on);
      localStorage.setItem("magicai_eco", on ? "1" : "0");
      buildParticles();
    });

    $("yt-player-x").addEventListener("click", closePlayer);
    $("yt-player-back").addEventListener("click", closePlayer);
  }

  // beírható kérdés – mindig működik, akkor is, ha a mikrofon nem elérhető
  function setupAsk() {
    var bar = $("ask-bar"), input = $("ask-input");
    if (!bar || !input) return;
    bar.addEventListener("submit", function (e) {
      e.preventDefault();
      var t = input.value.trim();
      if (!t) return;
      input.value = "";
      input.blur();
      // a beírás is „elindítja” az élményt (a hang engedélyezve, de a mikrofon nem indul)
      if (!started) started = true;
      hideHint();
      if (!handleVoiceCommand(t)) handleQuestion(t);
    });
  }

  // ============================================================
  //  INDÍTÁS – START/STOP BESZÉLGETÉS-MÓD
  //  A Start gomb egyszer indít, utána a gömb FOLYAMATOSAN hallgat;
  //  a kis Stop gombbal fejezhető be a beszélgetés.
  // ============================================================
  function updateConvButtons() {
    if (startBtn) startBtn.hidden = convOn;
    if (stopBtn) stopBtn.hidden = !convOn;
  }
  // (beszélgetés-módban) kis szünet után újra figyelünk
  function resumeListen(delay) {
    if (!convOn || busy) return;
    setTimeout(function () { if (convOn && !busy && !listening) startListening(); }, delay == null ? 350 : delay);
  }
  // ha a saját (neurális) hang be van kapcsolva, de még nincs kész: MOST töltjük
  // le/be, hogy már az üdvözlő is a saját hangon szóljon – ne a gépi tartalékon
  function prepareVoiceThen(next) {
    var canNeural = MV && speakOn && MV.neuralSupported && MV.neuralSupported() && MV.neuralEnabled();
    if (!canNeural || MV.neuralReady(lang())) { next(); return; }
    var done = false;
    function go() { if (done) return; done = true; hideStatus(); refreshNeuralUI(); next(); }
    showStatus(tr("voicePrep"), { progress: 0, sticky: true });
    setTimeout(go, 60000);   // biztonsági korlát: 60 mp után enélkül is indulunk
    MV.loadNeural(lang(), function (p) {
      if (!done) showStatus(tr("voicePrep") + " " + Math.round(p * 100) + "%", { progress: p, sticky: true });
    }).then(go).catch(go);
  }
  function startConversation() {
    hideHint();
    if (!srSupported()) { showStatus(tr("noMic"), { err: true, ms: 6000 }); focusAsk(); }
    else if (!micUsableOrigin()) { showStatus(tr("micInsecure"), { err: true, ms: 7000 }); focusAsk(); }
    else if (micBlocked) { showStatus(tr("micDenied"), { err: true, ms: 5000 }); focusAsk(); }
    convOn = canListen();
    updateConvButtons();
    if (convOn) ensureMic();   // engedélykérés MOST, a gombnyomás (user-gesztus) alatt
    if (!started) {
      started = true;
      prepareVoiceThen(function () {
        setBot(tr("greet"));
        speak(tr("greet"), function () {
          setState("idle");
          resumeListen();
        });
      });
    } else {
      resumeListen(100);
    }
  }
  function stopConversation(silent) {
    var was = convOn;
    convOn = false;
    stopListening();
    if (EARS) EARS.closeMic();   // a mikrofont is elengedjük (a „felvétel” jelző eltűnik)
    stopSpeaking();
    busy = false;
    setState("idle");
    hideStatus();
    updateConvButtons();
    if (!silent && was) { setBot(tr("convOff")); showStatus(tr("convOff"), { ms: 3500 }); }
  }
  function onOrbActivate() {
    hideHint();
    if (busy || STATE === "speaking") {   // a beszéd megszakítása koppintással
      stopSpeaking(); busy = false; setState("idle");
      resumeListen(150);
      return;
    }
    if (!convOn) startConversation();
  }

  function autoLoadModel() {
    if (!L || !L.supported || !L.supported()) {
      if (modelStatus) modelStatus.textContent = "WebGPU nélkül a modell nem fut – a válaszok az internetről jönnek.";
      return;
    }
    var last = L.lastLoadedModel && L.lastLoadedModel();
    if (!last) {
      if (modelStatus) modelStatus.textContent = lang() === "hu" ? "Nincs még betöltött modell – válassz egyet, vagy mondd: „tölts be egy modellt”." : "No model loaded yet.";
      return;
    }
    var meta = (L.MODELS || []).filter(function (m) { return m.id === last; })[0];
    // a böngésző gyorsítótárából tölt → gyors; háttérben
    startModelLoad(last, meta);
  }

  function init() {
    // energiatakarékos mód MÁR a részecskék felépítése előtt (kevesebb részecske)
    if (localStorage.getItem("magicai_eco") === "1") document.body.classList.add("eco");
    resizeCanvas();
    buildParticles();
    startRaf();
    applyUITexts();
    setupPanel();
    setupAsk();

    // hangok előtöltése (Chrome a getVoices-t lustán adja) – amint megérkeznek,
    // frissítjük a hanglistát is, hogy a természetes hangok közül lehessen választani
    if (ttsSupported()) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = function () { window.speechSynthesis.getVoices(); populateVoiceSelect(); };
    }

    // gömb-interakció + Start/Stop gombok
    orbEl.addEventListener("click", onOrbActivate);
    orbEl.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOrbActivate(); } });
    if (startBtn) startBtn.addEventListener("click", startConversation);
    if (stopBtn) stopBtn.addEventListener("click", function () { stopConversation(false); });
    updateConvButtons();

    // átméretezés
    var rsz;
    window.addEventListener("resize", function () {
      clearTimeout(rsz);
      rsz = setTimeout(function () { resizeCanvas(); updateOrbitRadii(); }, 150);
    });
    // a gömb mérete a layout/betűk beállása után, illetve viewport megjelenésekor
    // is változhat (pl. 0 → valós méret) – ekkor újra kell mérni a canvast
    if ("ResizeObserver" in window) {
      var ro = new ResizeObserver(function () { resizeCanvas(); updateOrbitRadii(); });
      ro.observe(orbEl);
    }
    // biztos, ami biztos: a következő képkockában és kicsit később is újramérünk
    requestAnimationFrame(function () { resizeCanvas(); });
    setTimeout(function () { resizeCanvas(); updateOrbitRadii(); }, 400);

    // a korábban használt modell magától betöltődik
    autoLoadModel();
    // a korábban letöltött SAJÁT hang is magától visszatöltődik (a gyorsítótárból)
    autoLoadNeural();

    if (!srSupported() && !earsWanted()) {
      // se böngészős felismerő, se beépített hallás – jelezzük (a beírás megy)
      setTimeout(function () { $("hint-txt").textContent = tr("noMic"); }, 100);
    } else if (isFileProto()) {
      // file://-ról nyitva (dupla katt az index.html-re): a mikrofon NEM tud
      // működni (a böngésző minden induláskor kérdez). A hangfelismeréshez a
      // „Magic AI indítása" parancsikon kell (localhost). A beírás így is megy.
      setTimeout(function () {
        $("hint-txt").textContent = tr("micInsecure");
      }, 100);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // Nyilvános, kis API (a régi window.MagicAI mintájára) – kívülről is feltehető
  // kérdés, kereshető videó stb.
  window.MagicOrb = {
    ask: handleQuestion,
    answer: answer,
    searchYouTube: searchYouTube,
    searchEncyclopedia: searchEncyclopedia,
    spawnOrbit: spawnOrbit,
    setLang: applyLang,
    loadModel: startModelLoad
  };
})();
