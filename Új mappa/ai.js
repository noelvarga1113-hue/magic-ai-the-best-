// ============================================================
//  MAGIC AI – Böngészőben futó nyelvi modell (WebLLM)
//  Egy igazi kis AI-modell, ami HELYBEN, a böngészőben fut
//  (WebGPU), API és szerver NÉLKÜL. Egyszer letölti a modellt,
//  utána offline is működik. window.MagicLLM néven elérhető.
// ============================================================

(function () {
  "use strict";

  // Választható modellek 3 szinten (méret kb. az első letöltéskor).
  // Minél nagyobb, annál okosabb és „megértőbb" – cserébe nagyobb a letöltés és erősebb gép kell.
  // Egységes Qwen2.5 család, hogy a magyar minőség lépcsőzetesen nőjön.
  var MODELS = [
    { id: "Qwen2.5-7B-Instruct-q4f16_1-MLC",    tier: "Expert", label: "Expert – a legokosabb (7B)",        mb: 4700 },
    { id: "Qwen2.5-3B-Instruct-q4f16_1-MLC",    tier: "Normal", label: "Normal – kiegyensúlyozott (3B)",     mb: 2200 },
    { id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",  tier: "Fast",   label: "Fast – gyors, gyengébb gépre (1.5B)", mb: 1200 }
  ];

  var CDN = "https://esm.run/@mlc-ai/web-llm";
  var LS_MODEL = "magic_llm_model";   // a kiválasztott modell (akkor is, ha még nincs betöltve)
  var LS_LOADED = "magic_llm_loaded"; // a SIKERESEN betöltött modell – ezt töltjük be automatikusan induláskor

  var state = {
    engine: null,
    modelId: null,
    loading: false,
    ready: false,
    error: null
  };

  // WebGPU támogatás (ez kell a modell futtatásához)
  function supported() {
    return (typeof navigator !== "undefined") && !!navigator.gpu;
  }

  var DEFAULT_ID = "Qwen2.5-3B-Instruct-q4f16_1-MLC"; // alapértelmezett: Normal (jó egyensúly)

  function defaultModel() {
    try {
      var saved = localStorage.getItem(LS_MODEL);
      if (saved && MODELS.some(function (m) { return m.id === saved; })) return saved;
    } catch (e) {}
    return DEFAULT_ID;
  }

  function setModel(id) {
    try { localStorage.setItem(LS_MODEL, id); } catch (e) {}
  }

  // A modell betöltése – AKKOR IS, ha már egy másik be van töltve (modellváltás):
  // ilyenkor előbb leállítjuk a régit, majd betöltjük az újat.
  // onProgress: { progress: 0..1, text: "..." }
  function load(modelId, onProgress) {
    modelId = modelId || defaultModel();
    if (state.ready && state.modelId === modelId) return Promise.resolve(); // már ez fut
    if (state.loading) return Promise.reject(new Error("Épp egy modell betöltése folyik."));
    if (!supported()) {
      return Promise.reject(new Error("Ez a böngésző nem támogatja a WebGPU-t, ezért a helyi AI-modell nem futtatható."));
    }
    state.loading = true;
    state.ready = false; // váltás közben nem szabad használni
    state.error = null;
    // Ha már van betöltött modell, előbb felszabadítjuk (memória + GPU)
    var prep = (state.engine && state.engine.unload)
      ? Promise.resolve().then(function () { return state.engine.unload(); }).catch(function () {})
      : Promise.resolve();
    return prep.then(function () { return import(CDN); }).then(function (webllm) {
      return webllm.CreateMLCEngine(modelId, {
        initProgressCallback: function (p) {
          if (onProgress) onProgress({ progress: (p && typeof p.progress === "number") ? p.progress : 0, text: (p && p.text) || "" });
        }
      });
    }).then(function (engine) {
      state.engine = engine;
      state.modelId = modelId;
      state.ready = true;
      state.loading = false;
      setModel(modelId);
      try { localStorage.setItem(LS_LOADED, modelId); } catch (e) {}
    }).catch(function (err) {
      state.loading = false;
      state.error = err;
      throw err;
    });
  }

  // A jelenleg betöltött modell azonosítója (vagy null)
  function currentModel() { return state.ready ? state.modelId : null; }

  // A legutóbb SIKERESEN betöltött modell azonosítója (induláskori automatikus betöltéshez), vagy null
  function lastLoadedModel() {
    try {
      var id = localStorage.getItem(LS_LOADED);
      if (id && MODELS.some(function (m) { return m.id === id; })) return id;
    } catch (e) {}
    return null;
  }
  function forgetLoaded() { try { localStorage.removeItem(LS_LOADED); } catch (e) {} }

  function isReady() { return state.ready; }
  function isLoading() { return state.loading; }

  var CHAT_SYSTEM =
    "Te a Magic AI vagy – egy okos, barátságos és segítőkész magyar asszisztens. " +
    "MINDIG kifogástalan, természetes MAGYAR nyelven válaszolj: helyes nyelvtannal, ragozással, ékezetekkel és központozással – " +
    "akkor is, ha a kérdés más nyelven vagy idegen szavakkal érkezik (csak akkor válts nyelvet, ha a felhasználó kifejezetten kéri). " +
    "Először MINDIG értsd meg pontosan, mire kíváncsi a felhasználó, és gondold át a választ lépésről lépésre, mielőtt megírod. " +
    "Adj KONKRÉT, tartalmas és világosan felépített választ: ne csak azt írd le, hogyan lehetne megoldani, hanem oldd is meg, és mondd ki a tényleges választ. " +
    "Légy bátran segítőkész: igyekezz a lehető legtöbb kérdésre érdemben válaszolni – magyarázattal, példával, ötlettel, lépésekkel –, ne hárítsd el a kérést. " +
    "Az összetett kérdést bontsd részekre, és ahol segít, használj rövid felsorolást vagy számozott lépéseket. " +
    "Csak akkor állíts valamit tényként, ha biztos vagy benne; ha valamit nem tudsz, ismerd el őszintén, és SOHA ne találj ki neveket, számokat, dátumokat vagy forrásokat. " +
    "A válasz hossza igazodjon a kérdéshez: egyszerűre tömör, összetettre részletesebb, de mindig lényegre törő és jól érthető magyar.";

  var COMP_SYSTEM =
    "Tapasztalt magyar fogalmazás-segéd vagy egy általános vagy középiskolás diáknak. " +
    "A feladatod, hogy a megadott témáról szép, összefüggő, gondolatgazdag és nyelvtanilag KIFOGÁSTALAN MAGYAR fogalmazást írj – " +
    "helyes ragozással, ékezetekkel, egyeztetéssel és központozással. " +
    "Szerkezet: első sorban egy találó cím, utána Bevezetés, Tárgyalás (2–3 jól kifejtett bekezdés konkrét példákkal) és Befejezés. " +
    "Fogalmazz természetesen, változatos és gördülékeny mondatokkal, kerüld az ismétlést, az anglicizmusokat és a töltelékszavakat. " +
    "KIZÁRÓLAG magyarul írj, és csak magát a fogalmazást add vissza, magyarázat nélkül.";

  // Belső: üzenetlista → streamelt válasz (token-onként hívja az onToken-t a teljes szöveggel)
  function stream(messages, onToken, opts) {
    if (!state.ready) return Promise.reject(new Error("A modell még nincs betöltve."));
    return state.engine.chat.completions.create(Object.assign({
      messages: messages, stream: true, temperature: 0.6, top_p: 0.9,
      // Enyhébb ismétlés-büntetés: a magyar ragozó nyelv miatt a túl erős
      // büntetés rontja a nyelvtant; ennyi még visszafogja a szóismétlést.
      frequency_penalty: 0.2, presence_penalty: 0.15, max_tokens: 1024
    }, opts || {})).then(function (s) {
      var full = "";
      function pump(iter) {
        return iter.next().then(function (res) {
          if (res.done) return full;
          var chunk = res.value;
          var delta = (chunk && chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content) || "";
          if (delta) { full += delta; if (onToken) onToken(full, delta); }
          return pump(iter);
        });
      }
      var iterator = s[Symbol.asyncIterator] ? s[Symbol.asyncIterator]() : s;
      return pump(iterator);
    });
  }

  // Általános feladatmegoldás: tetszőleges rendszer-prompt + felhasználói szöveg
  function run(systemPrompt, userText, onToken, opts) {
    return stream([
      { role: "system", content: systemPrompt },
      { role: "user", content: userText }
    ], onToken, opts);
  }

  // Fogalmazás (a fogalmazás-rendszerprompttal)
  function writeComposition(userText, onToken) {
    return run(COMP_SYSTEM, userText, onToken, { temperature: 0.7 });
  }

  window.MagicLLM = {
    MODELS: MODELS,
    supported: supported,
    load: load,
    run: run,
    writeComposition: writeComposition,
    COMP_SYSTEM: COMP_SYSTEM,
    CHAT_SYSTEM: CHAT_SYSTEM,
    isReady: isReady,
    isLoading: isLoading,
    defaultModel: defaultModel,
    currentModel: currentModel,
    lastLoadedModel: lastLoadedModel,
    forgetLoaded: forgetLoaded,
    state: state
  };
})();
