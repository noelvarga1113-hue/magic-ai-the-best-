// ============================================================
//  MAGIC AI – SAJÁT, BEÉPÍTETT HALLÁS  (window.MagicEars)  v3.0.6
//  Helyi beszédfelismerés: a Whisper modell a BÖNGÉSZŐDBEN fut
//  (transformers.js, WebGPU-gyorsítással; tartalék: WASM).
//  Egyszer letölt egy hallás-modellt, a böngésző gyorsítótárazza,
//  utána OFFLINE is ért – minden nyelven, minden böngészőben.
//  Nem függ a Google/Microsoft felismerőjétől (Web Speech API).
//
//  Minden HELYBEN fut, nincs szerver/API-kulcs (mint a WebLLM + vits).
// ============================================================

(function () {
  "use strict";

  var TF_URL = "https://esm.run/@huggingface/transformers";

  // VALÓDI, ellenőrzött modellek (HF onnx-community, fájlméretek a repóból):
  //  - small:  encoder fp16 ~177 MB + decoder q4 ~222 MB  (WASM: q8 ~240 MB)
  //  - turbo:  encoder fp16 ~1,2 GB + decoder q4 ~319 MB
  var MODELS = [
    { id: "onnx-community/whisper-small", tier: "Normál", mb: 400 },
    { id: "onnx-community/whisper-large-v3-turbo", tier: "Pontos", mb: 1550 }
  ];
  // Alapértelmezés: WebGPU-s (erős) gépen a Pontos – mérve pontosabb ÉS gyorsabb;
  // WebGPU nélkül a kisebb Normál (a nagy modell WASM-on lassú volna).
  function defaultId() { return navigator.gpu ? MODELS[1].id : MODELS[0].id; }

  // Whisper nyelv-nevek a rendszernyelv-kódokhoz
  var WHISPER_LANG = {
    hu: "hungarian", en: "english", de: "german", ru: "russian",
    pt: "portuguese", es: "spanish", fr: "french", it: "italian"
  };

  var LS_ON = "magic_ears_on";        // "1"/"0" – beépített hallás kérve (alapból BE)
  var LS_MODEL = "magic_ears_model";  // a választott modell id-ja
  var LS_READY = "magic_ears_ready";  // JSON { "<modelId>": true } – volt-e már letöltve

  var SR_RATE = 16000;                // a Whisper 16 kHz-es hangot vár

  var state = { asr: null, modelId: null, loading: null, device: null, lang: "hu" };
  var mic = { stream: null, ctx: null, src: null, proc: null };
  var current = null;                 // az épp futó listen()-munkamenet

  function supported() {
    return typeof WebAssembly === "object" && typeof window.fetch === "function" &&
      !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  function enabled() { return localStorage.getItem(LS_ON) !== "0"; }
  function setEnabled(on) { try { localStorage.setItem(LS_ON, on ? "1" : "0"); } catch (e) {} }
  function currentModel() { return localStorage.getItem(LS_MODEL) || defaultId(); }
  function setModel(id) { if (id) { try { localStorage.setItem(LS_MODEL, id); } catch (e) {} } }
  function ready() { return !!state.asr && state.modelId === currentModel(); }
  function isLoading() { return !!state.loading; }
  function getReady() { try { return JSON.parse(localStorage.getItem(LS_READY)) || {}; } catch (e) { return {}; } }
  function wasDownloaded(id) { return !!getReady()[id || currentModel()]; }
  function markDownloaded(id) { var r = getReady(); r[id] = true; try { localStorage.setItem(LS_READY, JSON.stringify(r)); } catch (e) {} }

  // ============================================================
  //  MODELL BETÖLTÉSE (több progress-figyelő is követheti)
  // ============================================================
  var progressCbs = [];
  function emitProgress(f) { for (var i = 0; i < progressCbs.length; i++) { try { progressCbs[i](f); } catch (e) {} } }

  function load(onProgress) {
    var id = currentModel();
    if (state.asr && state.modelId === id) { if (onProgress) { try { onProgress(1); } catch (e) {} } return Promise.resolve(id); }
    if (onProgress) progressCbs.push(onProgress);
    if (state.loading) return state.loading;
    if (!supported()) return Promise.reject(new Error("ears-unsupported"));

    // fájlonkénti letöltés-állás → összesített arány (encoder+decoder+tokenizer…)
    var files = {};
    function fileProgress(p) {
      if (!p || !p.file) return;
      if (p.status === "progress" && p.total) files[p.file] = { loaded: p.loaded || 0, total: p.total };
      else if (p.status === "done" && files[p.file]) files[p.file].loaded = files[p.file].total;
      var loaded = 0, total = 0;
      for (var k in files) { loaded += files[k].loaded; total += files[k].total; }
      if (total > 0) emitProgress(Math.max(0, Math.min(1, loaded / total)));
    }

    // a régi modellt elengedjük (memória), ha másikra váltunk
    if (state.asr) { try { state.asr.dispose && state.asr.dispose(); } catch (e) {} state.asr = null; state.modelId = null; }

    var useGpu = !!navigator.gpu;
    function make(device) {
      return import(/* @vite-ignore */ TF_URL).then(function (m) {
        return m.pipeline("automatic-speech-recognition", id, {
          device: device,
          // WebGPU: pontosabb fp16/q4; WASM: kisebb-gyorsabb q8
          dtype: device === "webgpu" ? { encoder_model: "fp16", decoder_model_merged: "q4" } : "q8",
          progress_callback: fileProgress
        }).then(function (asr) { return { asr: asr, device: device }; });
      });
    }
    state.loading = make(useGpu ? "webgpu" : "wasm").catch(function (e) {
      if (!useGpu) throw e;
      return make("wasm");   // WebGPU-hiba → WASM tartalék
    }).then(function (r) {
      state.asr = r.asr; state.modelId = id; state.device = r.device; state.loading = null;
      markDownloaded(id);
      emitProgress(1); progressCbs = [];
      return id;
    }).catch(function (e) {
      state.loading = null; progressCbs = [];
      throw e;
    });
    return state.loading;
  }

  // ============================================================
  //  MIKROFON + CSEND-FIGYELÉS (VAD)
  // ============================================================
  function openMic() {
    if (mic.stream && mic.ctx) return Promise.resolve();
    return navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    }).then(function (stream) {
      mic.stream = stream;
      var AC = window.AudioContext || window.webkitAudioContext;
      try { mic.ctx = new AC({ sampleRate: SR_RATE }); } catch (e) { mic.ctx = new AC(); }
      mic.src = mic.ctx.createMediaStreamSource(stream);
    });
  }
  function closeMic() {
    stopSession();
    if (mic.stream) { try { mic.stream.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {} mic.stream = null; }
    if (mic.ctx) { try { mic.ctx.close(); } catch (e) {} mic.ctx = null; }
    mic.src = null;
  }
  function startCapture(onFrame) {
    stopCapture();
    var proc = mic.ctx.createScriptProcessor(4096, 1, 1);
    proc.onaudioprocess = function (ev) { onFrame(ev.inputBuffer.getChannelData(0)); };
    mic.src.connect(proc);
    proc.connect(mic.ctx.destination);   // Chrome csak bekötve futtatja (a kimenet néma)
    mic.proc = proc;
  }
  function stopCapture() {
    if (mic.proc) {
      try { mic.proc.disconnect(); } catch (e) {}
      try { mic.src && mic.src.disconnect(mic.proc); } catch (e) {}
      mic.proc = null;
    }
  }
  function rms(f) { var s = 0; for (var i = 0; i < f.length; i++) s += f[i] * f[i]; return Math.sqrt(s / f.length); }

  // 16 kHz-re alakítás, ha a hangkártya más mintavételt adott
  function toWhisperRate(f32, fromRate) {
    if (fromRate === SR_RATE) return f32;
    var ratio = fromRate / SR_RATE, n = Math.floor(f32.length / ratio), out = new Float32Array(n);
    for (var i = 0; i < n; i++) out[i] = f32[Math.floor(i * ratio)] || 0;
    return out;
  }

  // EGY megszólalás felvétele: adaptív zajszinttel várja a beszédet, a mondat
  // végi (~0,9 mp) csendnél lezárja, majd a Whisper átírja szöveggé.
  // opts: { lang, onLevel(rms), onSpeechStart, onStatus("transcribe"), onText(text), onError(err) }
  function listen(opts) {
    opts = opts || {};
    stopSession();
    if (!ready()) { if (opts.onError) opts.onError("not-ready"); return; }
    var ses = { alive: true };
    current = ses;
    function fail(err) {
      if (!ses.alive) return;
      ses.alive = false; if (current === ses) current = null;
      stopCapture();
      if (opts.onError) opts.onError(err);
    }
    openMic().then(function () {
      if (!ses.alive) return;
      if (mic.ctx.state === "suspended") { try { mic.ctx.resume(); } catch (e) {} }
      var frames = [], pre = [];
      var speaking = false, silentFrames = 0, speechFrames = 0;
      var noise = 0.008;                                  // adaptív zajszint
      var frameSec = 4096 / mic.ctx.sampleRate;
      var maxFrames = Math.ceil(14 / frameSec);           // max ~14 mp / mondat
      var endSilence = Math.max(2, Math.ceil(0.9 / frameSec)); // ~0,9 mp csend = vége

      startCapture(function (chunk) {
        if (!ses.alive) return;
        var level = rms(chunk);
        if (opts.onLevel) { try { opts.onLevel(level); } catch (e) {} }
        if (!speaking) {
          if (level > Math.max(0.010, noise * 3)) {
            speaking = true; speechFrames = 1; silentFrames = 0;
            frames = pre.slice();                          // a szó eleje ne vesszen el
            frames.push(new Float32Array(chunk));
            if (opts.onSpeechStart) { try { opts.onSpeechStart(); } catch (e) {} }
          } else {
            noise = noise * 0.95 + level * 0.05;
            pre.push(new Float32Array(chunk));
            if (pre.length > 2) pre.shift();
          }
        } else {
          frames.push(new Float32Array(chunk));
          if (level > Math.max(0.007, noise * 2)) { silentFrames = 0; speechFrames++; }
          else silentFrames++;
          if (silentFrames >= endSilence || frames.length >= maxFrames) {
            if (speechFrames < 2 && frames.length < maxFrames) {
              // rövid pukkanás/zaj volt, nem beszéd → figyelünk tovább
              speaking = false; silentFrames = 0; speechFrames = 0; frames = [];
              return;
            }
            stopCapture();                                 // mondat kész → átírás
            if (opts.onStatus) { try { opts.onStatus("transcribe"); } catch (e) {} }
            var total = 0, i;
            for (i = 0; i < frames.length; i++) total += frames[i].length;
            var f32 = new Float32Array(total), off = 0;
            for (i = 0; i < frames.length; i++) { f32.set(frames[i], off); off += frames[i].length; }
            f32 = toWhisperRate(f32, mic.ctx.sampleRate);
            transcribe(f32, opts.lang).then(function (text) {
              if (!ses.alive) return;
              ses.alive = false; if (current === ses) current = null;
              if (opts.onText) opts.onText(text || "");
            }).catch(function (e) { fail((e && e.message) || "transcribe"); });
          }
        }
      });
    }).catch(function (e) { fail((e && e.name) || "mic"); });
  }
  function stopSession() {
    if (current) { current.alive = false; current = null; }
    stopCapture();
  }

  // ============================================================
  //  ÁTÍRÁS (hang → szöveg)
  // ============================================================
  // A Whisper üres/zajos hangra időnként „kitalál” tipikus mondatokat – ezeket szűrjük.
  var HALLUC_RE = /^(köszönöm( szépen)?( a figyelmet| a nézést)?\W*$|feliratozta|felirat[:\s]|subtitles? by|thank you( for watching)?\W*$|thanks for watching|www\.|http)/i;

  function transcribe(f32, langCode) {
    if (!state.asr) return Promise.reject(new Error("not-ready"));
    var wl = WHISPER_LANG[langCode || state.lang] || "hungarian";
    return Promise.resolve(state.asr(f32, { language: wl, task: "transcribe" })).then(function (out) {
      var t = out && out.text ? String(out.text).trim() : "";
      if (HALLUC_RE.test(t)) return "";
      return t;
    });
  }

  // ============================================================
  //  NYILVÁNOS FELÜLET
  // ============================================================
  window.MagicEars = {
    MODELS: MODELS,
    supported: supported,
    enabled: enabled, setEnabled: setEnabled,
    currentModel: currentModel, setModel: setModel,
    ready: ready, loading: isLoading,
    wasDownloaded: wasDownloaded,
    device: function () { return state.device; },
    load: load,
    listen: listen,
    stop: stopSession,
    closeMic: closeMic,
    setLang: function (c) { if (c) state.lang = c; },
    transcribe: transcribe          // közvetlen hang→szöveg (teszthez is)
  };
})();
