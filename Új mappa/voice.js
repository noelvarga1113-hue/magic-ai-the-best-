// ============================================================
//  MAGIC AI – SAJÁT, EGYEDI HANG  (window.MagicVoice)   v3.1
//  A teljes AI EZEN a hangon beszél (jósgömb + klasszikus app).
//
//  KÉT réteg, közös felület:
//   1) NEURÁLIS hang – igazi, minden gépen UGYANAZ a hang. A böngészőben
//      fut (vits-web / Piper ONNX modell), egyszer letölt egy hangmodellt
//      nyelvenként, utána a gyorsítótárból (offline is) szól. Ez a leginkább
//      „saját, egyedi" hang – nem függ a Windowsra telepített hangoktól.
//      Magyar hang is van (hu_HU-anna-medium) – ez a Magic AI magyar hangja.
//   2) RENDSZERHANG (tartalék) – ha a neurális nem elérhető / nincs letöltve,
//      a böngésző beszédszintézise szólal meg, a legszebb elérhető hangra
//      hangolva. Így SOHA nem marad néma.
//
//  Minden HELYBEN fut, nincs saját szerver/API-kulcs (mint a WebLLM).
// ============================================================

(function () {
  "use strict";

  // ---- vits-web (Piper) neurális motor + nyelvenkénti „saját" hangok ----
  var PIPER_URL = "https://esm.run/@diffusionstudio/vits-web";
  // Előnyben részesített hangok nyelvenként (ha nincs meg, automatikusan a
  // legjobb minőségű elérhető hangot választjuk az adott nyelvhez).
  var PREFERRED = {
    hu: "hu_HU-anna-medium", en: "en_US-hfc_female-medium", de: "de_DE-thorsten-medium",
    ru: "ru_RU-denis-medium", pt: "pt_PT-tugão-medium", es: "es_ES-davefx-medium",
    fr: "fr_FR-siwis-medium", it: "it_IT-paola-medium"
  };
  var BCP = { hu: "hu-HU", en: "en-US", de: "de-DE", ru: "ru-RU", pt: "pt-PT", es: "es-ES", fr: "fr-FR", it: "it-IT" };

  // A gömb „saját" hang-karaktere: enyhén nyugodtabb, melegebb tempó.
  // (A neurális modell hangszíne adja az egyediséget; ez csak finom aláfestés.)
  var SIGNATURE_RATE = 0.98;             // neurális lejátszási sebesség
  var SYS_RATE = 0.98, SYS_PITCH = 1.0;  // rendszerhang finomhangolás
  // ha a saját hang épp töltődik, ennyit várunk rá megszólalás előtt, mielőtt
  // (erre az egy mondatra) a gépi rendszerhangra váltanánk
  var NEURAL_WAIT_MS = 12000;

  var LS_ENABLED = "magic_voice_neural";        // "1"/"0" – neurális hang kérve
  var LS_READY = "magic_voice_ready_langs";     // JSON { "<lang>": true } – letöltve volt
  var LS_VOICE = "orb_voice";                    // a választott RENDSZERHANG voiceURI-ja

  // ---------- állapot ----------
  var piperMod = null;              // a betöltött vits-web modul
  var piperVoices = null;           // a teljes hanglista (egyszer lekérve)
  var pipes = {};                   // lang -> kiválasztott voiceId (letöltve, kész)
  var loading = {};                 // lang -> Promise (épp töltődik)
  var actx = null;                  // Web Audio context (neurális lejátszáshoz)
  var curSource = null;             // épp szóló AudioBufferSourceNode
  var session = 0;                  // minden új speak() növeli → a régi „lejár"
  var pulseTimer = null;            // a beszéd alatti lüktetés-visszahívás
  var speakingNow = false;
  var curLang = "hu";
  var enabled = localStorage.getItem(LS_ENABLED) !== "0";  // a user a neurálist kérte → alapból BE
  var preferredVoiceURI = localStorage.getItem(LS_VOICE) || "";

  function getReady() { try { return JSON.parse(localStorage.getItem(LS_READY)) || {}; } catch (e) { return {}; } }
  function setReady(o) { try { localStorage.setItem(LS_READY, JSON.stringify(o)); } catch (e) {} }
  function markDownloaded(lang) { var r = getReady(); r[lang] = true; setReady(r); }
  function wasDownloaded(lang) { return !!getReady()[lang]; }

  function neuralSupported() { return typeof WebAssembly === "object" && typeof window.fetch === "function"; }
  function systemSupported() { return "speechSynthesis" in window; }
  function langKey(l) { return BCP[l] ? l : "en"; }
  function bcp(l) { return BCP[l] || BCP.en; }

  // ============================================================
  //  RENDSZERHANG (tartalék) – szép hang kiválasztása + felolvasás
  // ============================================================
  function voiceScore(v, code, full) {
    var name = (v.name || "").toLowerCase();
    var vlang = (v.lang || "").toLowerCase().replace("_", "-");
    var s;
    if (vlang === full) s = 50;
    else if (vlang.indexOf(code) === 0) s = 30;
    else return -1;
    if (/natural|neural/.test(name)) s += 120;
    if (/online/.test(name)) s += 70;
    if (/google/.test(name)) s += 60;
    if (/premium|enhanced|wavenet|studio/.test(name)) s += 55;
    if (v.localService === false) s += 15;
    if (/microsoft/.test(name) && !/online|natural/.test(name)) s -= 12;
    return s;
  }
  function voicesForLang(l) {
    if (!systemSupported()) return [];
    l = l || curLang;
    var voices = window.speechSynthesis.getVoices();
    var code = l, full = bcp(l).toLowerCase(), list = [];
    for (var i = 0; i < voices.length; i++) {
      var sc = voiceScore(voices[i], code, full);
      if (sc >= 0) list.push({ v: voices[i], s: sc });
    }
    list.sort(function (a, b) { return b.s - a.s; });
    return list.map(function (x) { return x.v; });
  }
  function pickSystemVoice(l) {
    if (!systemSupported()) return null;
    var voices = window.speechSynthesis.getVoices();
    if (preferredVoiceURI) {
      for (var i = 0; i < voices.length; i++) if (voices[i].voiceURI === preferredVoiceURI) return voices[i];
    }
    var best = voicesForLang(l);
    if (best.length) return best[0];
    for (var j = 0; j < voices.length; j++) if (voices[j].lang && voices[j].lang.toLowerCase().indexOf(l) === 0) return voices[j];
    return null;
  }

  function systemSpeak(clean, mySession, cbs) {
    if (!systemSupported()) { cbs.end(); return; }
    try { window.speechSynthesis.cancel(); } catch (e) {}
    var u = new SpeechSynthesisUtterance(clean);
    u.lang = bcp(curLang);
    var v = pickSystemVoice(curLang);
    if (v) { u.voice = v; u.lang = v.lang || u.lang; }
    u.rate = SYS_RATE; u.pitch = SYS_PITCH;
    var startedAt = Date.now(), everStarted = false, watch = null, cap = null;
    function fin() {
      if (mySession !== session) return;
      clearInterval(watch); clearTimeout(cap);
      cbs.end();
    }
    u.onstart = function () { everStarted = true; cbs.start(); };
    u.onboundary = function () { cbs.pulse(); };
    u.onend = fin; u.onerror = fin;
    window.speechSynthesis.speak(u);
    var words = clean.split(/\s+/).filter(Boolean).length;
    cap = setTimeout(fin, Math.min(90000, words * 600 + 5000));
    watch = setInterval(function () {
      if (mySession !== session) { clearInterval(watch); return; }
      if (!everStarted && Date.now() - startedAt > 1500) { fin(); return; }
      if (everStarted && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) fin();
      else try { window.speechSynthesis.resume(); } catch (e) {}
    }, 600);
  }

  // ============================================================
  //  NEURÁLIS MOTOR – vits-web (Piper ONNX)
  // ============================================================
  function loadPiper() {
    if (piperMod) return Promise.resolve(piperMod);
    return import(/* @vite-ignore */ PIPER_URL).then(function (m) { piperMod = m; return m; });
  }
  function getVoices() {
    if (piperVoices) return Promise.resolve(piperVoices);
    return loadPiper().then(function (m) { return m.voices(); }).then(function (list) { piperVoices = list || []; return piperVoices; });
  }
  // az adott nyelvhez a „saját" hang kiválasztása (előnyben a PREFERRED, különben a legjobb minőség)
  function pickVoiceId(lang, list) {
    var fam = lang;
    var cand = list.filter(function (v) { return v.language && v.language.family === fam; });
    if (!cand.length) cand = list.filter(function (v) { return (v.key || "").indexOf(fam + "_") === 0; });
    if (!cand.length) return PREFERRED.en;
    var pref = PREFERRED[lang];
    for (var i = 0; i < cand.length; i++) if (cand[i].key === pref) return pref;
    var order = { high: 3, medium: 2, low: 1, x_low: 0 };
    cand.sort(function (a, b) { return (order[b.quality] || 0) - (order[a.quality] || 0); });
    return cand[0].key;
  }
  function progFrac(p) {
    if (typeof p === "number") return p > 1 ? p / 100 : p;
    if (p && typeof p === "object") {
      if (typeof p.progress === "number") return p.progress > 1 ? p.progress / 100 : p.progress;
      if (typeof p.loaded === "number" && typeof p.total === "number" && p.total) return p.loaded / p.total;
    }
    return null;
  }

  // Egy nyelv „saját" hangmodelljének letöltése/aktiválása. onProgress(0..1).
  // TÖBB hívó is figyelheti ugyanazt a letöltést (pl. a panel ÉS az indító
  // képernyő) – mindegyik progress-visszahívása megkapja az állást.
  var progressCbs = {};             // lang -> [callback]
  function emitProgress(lang, f) {
    var arr = progressCbs[lang] || [];
    for (var i = 0; i < arr.length; i++) { try { arr[i](f); } catch (e) {} }
  }
  function loadNeural(lang, onProgress) {
    lang = langKey(lang);
    if (pipes[lang]) { if (onProgress) { try { onProgress(1); } catch (e) {} } return Promise.resolve(pipes[lang]); }
    if (onProgress) (progressCbs[lang] = progressCbs[lang] || []).push(onProgress);
    if (loading[lang]) return loading[lang];
    if (!neuralSupported()) return Promise.reject(new Error("neural-unsupported"));

    loading[lang] = loadPiper().then(function (m) {
      return getVoices().then(function (list) {
        var voiceId = pickVoiceId(lang, list);
        return m.stored().then(function (stored) {
          var have = (stored || []).indexOf(voiceId) !== -1;
          if (have) { emitProgress(lang, 1); return voiceId; }
          return m.download(voiceId, function (p) {
            var f = progFrac(p);
            if (f != null) emitProgress(lang, Math.max(0, Math.min(1, f)));
          }).then(function () { emitProgress(lang, 1); return voiceId; });
        });
      });
    }).then(function (voiceId) {
      pipes[lang] = voiceId; markDownloaded(lang); delete loading[lang]; delete progressCbs[lang];
      return voiceId;
    }).catch(function (e) {
      delete loading[lang]; delete progressCbs[lang];
      throw e;
    });
    return loading[lang];
  }

  function ensureCtx() {
    if (!actx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      actx = new AC();
    }
    if (actx.state === "suspended") { try { actx.resume(); } catch (e) {} }
    return actx;
  }

  // szöveg felbontása kezelhető, mondat-szintű darabokra (gyors indulás + megszakíthatóság)
  function chunkText(text, max) {
    max = max || 220;
    var parts = String(text).split(/(?<=[.!?…])\s+|\n+/);
    var out = [], buf = "";
    for (var i = 0; i < parts.length; i++) {
      var s = parts[i].trim();
      if (!s) continue;
      if ((buf + " " + s).trim().length > max && buf) { out.push(buf.trim()); buf = s; }
      else buf = (buf + " " + s).trim();
    }
    if (buf) out.push(buf.trim());
    return out.length ? out : [String(text)];
  }

  function playAudioBuffer(audioBuf, mySession) {
    return new Promise(function (resolve) {
      var ctx = ensureCtx();
      if (!ctx || mySession !== session) { resolve(); return; }
      var src = ctx.createBufferSource();
      src.buffer = audioBuf;
      src.playbackRate.value = SIGNATURE_RATE;
      var gain = ctx.createGain();
      gain.gain.value = 1.0;
      src.connect(gain).connect(ctx.destination);
      curSource = src;
      src.onended = function () { if (curSource === src) curSource = null; resolve(); };
      try { src.start(); } catch (e) { resolve(); }
    });
  }

  // A neurális felolvasás: darabonként szintetizál (WAV), dekódol és játszik.
  function neuralSpeak(clean, mySession, cbs) {
    var voiceId = pipes[langKey(curLang)];
    if (!voiceId || !piperMod) return Promise.reject(new Error("not-ready"));
    var chunks = chunkText(clean);
    var started = false;
    startPulse(cbs);
    return chunks.reduce(function (chain, chunk) {
      return chain.then(function () {
        if (mySession !== session) return;
        return Promise.resolve(piperMod.predict({ text: chunk, voiceId: voiceId })).then(function (blob) {
          if (mySession !== session || !blob || !blob.arrayBuffer) return;
          return blob.arrayBuffer().then(function (ab) {
            var ctx = ensureCtx();
            if (!ctx || mySession !== session) return;
            return ctx.decodeAudioData(ab).then(function (audioBuf) {
              if (mySession !== session) return;
              if (!started) { started = true; cbs.start(); }
              return playAudioBuffer(audioBuf, mySession);
            });
          });
        });
      });
    }, Promise.resolve()).then(function () {
      stopPulse();
      if (mySession === session) cbs.end();
    });
  }

  // beszéd alatti finom lüktetés (a gömb energiájához) – ~7×/mp
  function startPulse(cbs) {
    stopPulse();
    speakingNow = true;
    pulseTimer = setInterval(function () { cbs.pulse(); }, 140);
  }
  function stopPulse() {
    clearInterval(pulseTimer); pulseTimer = null;
    speakingNow = false;
  }

  // ============================================================
  //  KÖZÖS FELÜLET
  // ============================================================
  var EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}️‍]/gu;
  function cleanForSpeech(text) {
    return String(text || "")
      .replace(/\*\*/g, "").replace(/https?:\/\/\S+/g, "")
      .replace(EMOJI_RE, "").replace(/\s+/g, " ").trim();
  }

  function stop() {
    session++;
    stopPulse();
    if (curSource) { try { curSource.stop(); } catch (e) {} curSource = null; }
    if (systemSupported()) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  }

  // A fő belépő. opts: { onStart, onBoundary, onEnd, lang }
  function speak(text, opts) {
    opts = opts || {};
    if (opts.lang) curLang = opts.lang;
    var clean = cleanForSpeech(text);
    var cbs = {
      start: opts.onStart || function () {},
      pulse: opts.onBoundary || function () {},
      end: once(opts.onEnd || function () {})
    };
    if (!clean) { cbs.end(); return; }

    stop();
    var mySession = ++session;

    var useNeural = enabled && neuralSupported();
    var key = langKey(curLang);

    // 1) A saját (neurális) hang KÉSZ → azzal szólunk.
    if (useNeural && pipes[key]) {
      neuralSpeak(clean, mySession, cbs).catch(function () {
        stopPulse();
        if (mySession === session) systemSpeak(clean, mySession, cbs);
      });
      return;
    }
    // 2) A saját hang még nincs kész, de betölthető/letölthető → MEGVÁRJUK
    //    (legfeljebb NEURAL_WAIT_MS-ig), hogy NE a gépi rendszerhang szólaljon
    //    meg. Gyorsítótárból ez pár másodperc; friss letöltésnél ha nem ér
    //    össze időben, erre az egy mondatra a rendszerhang jön, a letöltés
    //    pedig fut tovább a következő mondathoz.
    if (useNeural) {
      var spoken = false;
      var fallback = setTimeout(function () {
        spoken = true;
        if (mySession === session) systemSpeak(clean, mySession, cbs);
      }, NEURAL_WAIT_MS);
      loadNeural(curLang).then(function () {
        clearTimeout(fallback);
        if (spoken || mySession !== session) return;
        spoken = true;
        neuralSpeak(clean, mySession, cbs).catch(function () {
          stopPulse();
          if (mySession === session) systemSpeak(clean, mySession, cbs);
        });
      }).catch(function () {
        clearTimeout(fallback);
        if (!spoken && mySession === session) { spoken = true; systemSpeak(clean, mySession, cbs); }
      });
      return;
    }
    // 3) Neurális kikapcsolva / nem támogatott → rendszerhang
    systemSpeak(clean, mySession, cbs);
  }

  function once(fn) { var done = false; return function () { if (done) return; done = true; try { fn(); } catch (e) {} }; }

  // ---- neurális hang be/ki + állapot ----
  function setNeuralEnabled(on) {
    enabled = !!on;
    localStorage.setItem(LS_ENABLED, enabled ? "1" : "0");
  }
  function setLang(code) { if (code) curLang = code; }
  function setPreferredVoice(uri) { preferredVoiceURI = uri || ""; localStorage.setItem(LS_VOICE, preferredVoiceURI); }

  // Rövid hangminta a beállításban (a kiválasztott hang bemutatása)
  function sample(text, lang) {
    speak(text || "Szia! Én vagyok a Magic AI hangja.", { lang: lang || curLang });
  }

  window.MagicVoice = {
    speak: speak,
    stop: stop,
    sample: sample,
    speaking: function () { return speakingNow || (systemSupported() && window.speechSynthesis.speaking); },
    // nyelv / hang
    setLang: setLang,
    setPreferredVoice: setPreferredVoice,
    preferredVoice: function () { return preferredVoiceURI; },
    voicesForLang: voicesForLang,
    // neurális kezelés
    neuralSupported: neuralSupported,
    systemSupported: systemSupported,
    neuralEnabled: function () { return enabled; },
    setNeuralEnabled: setNeuralEnabled,
    neuralReady: function (lang) { return !!pipes[langKey(lang || curLang)]; },
    neuralDownloaded: function (lang) { return wasDownloaded(lang || curLang); },
    loadNeural: loadNeural,
    cleanForSpeech: cleanForSpeech
  };
})();
