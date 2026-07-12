// ============================================================
//  MAGIC AI – Böngészőben futó nyelvi modell (WebLLM)
//  Egy igazi kis AI-modell, ami HELYBEN, a böngészőben fut
//  (WebGPU), API és szerver NÉLKÜL. Egyszer letölti a modellt,
//  utána offline is működik. window.MagicLLM néven elérhető.
//
//  3.0: NAGYOBB, OKOSABB modellek (a katalógus legnagyobb, valódi modelljei),
//  NYELVENKÉNTI letöltés-élmény (minden nyelvet külön „töltünk le"), külön
//  HÁZI FELADAT modul KÉP-ÉRTŐ (vision) modellel, állítható RENDSZERNYELV
//  és ENERGIATAKARÉKOS mód.
// ============================================================

(function () {
  "use strict";

  // Választható modellek 3 szinten (méret = a tényleges, valódi letöltés mérete).
  // Minél nagyobb, annál okosabb és „megértőbb" – cserébe nagyobb a letöltés és erősebb gép kell.
  // MIND VALÓDI, ellenőrzött WebLLM-modell-ID (a prebuilt configból). A méret a
  // tényleges letöltést tükrözi (nem félrevezető cél-szám). Erős, többnyelvű modellek:
  // angol, orosz, portugál, német, spanyol, francia, olasz, magyar – az idegen szavakat is pontosan írják.
  var MODELS = [
    { id: "Qwen3-8B-q4f32_1-MLC",            tier: "Expert", label: "Expert – a legokosabb, legtöbb tudás (8B)", mb: 6852 },
    { id: "Qwen2.5-7B-Instruct-q4f32_1-MLC", tier: "Normal", label: "Normal – kiegyensúlyozott (7B)",            mb: 5900 },
    { id: "Qwen3-4B-q4f32_1-MLC",            tier: "Fast",   label: "Fast – gyors, gyengébb gépre (4B)",         mb: 4327 }
  ];

  // KÜLÖN HÁZI FELADAT MODUL – KÉP-ÉRTŐ (vision) modell. Külön, választható letöltés:
  // a feladatról készült fotót KÖZVETLENÜL beolvassa (szöveg ÉS ábrák/rajzok), és
  // a beállított rendszernyelven meg is oldja. Saját motorpéldányon fut, hogy a
  // szöveges (chat) modellt ne kelljen lecserélni hozzá.
  var VISION_MODEL = { id: "Phi-3.5-vision-instruct-q4f16_1-MLC", tier: "Vision", label: "Házi modul – kép-értő (vision)", mb: 3952 };

  var CDN = "https://esm.run/@mlc-ai/web-llm";
  var LS_MODEL = "magic_llm_model";   // a kiválasztott modell (akkor is, ha még nincs betöltve)
  var LS_LOADED = "magic_llm_loaded"; // a SIKERESEN betöltött modell – ezt töltjük be automatikusan induláskor
  var LS_LANG = "magicai_lang";       // a rendszer-/válasznyelv kódja
  var LS_ECO = "magicai_eco";         // energiatakarékos mód (1/0)
  var LS_LANGS = "magic_llm_langs_ready"; // NYELVENKÉNTI „letöltött" állapot: { "<modelId>::<lang>": true }
  var LS_VISION = "magic_llm_vision_ready"; // a kép-értő modul sikeresen betöltött-e már

  // Választható rendszer-/válasznyelvek. A `label` a modellnek adott, egyértelmű
  // nyelvmegnevezés (endonimával), hogy biztosan a megfelelő nyelven válaszoljon.
  var LANGS = {
    hu: { label: "Hungarian (magyar)" },
    en: { label: "English" },
    de: { label: "German (Deutsch)" },
    ru: { label: "Russian (русский язык)" },
    pt: { label: "Portuguese (português)" },
    es: { label: "Spanish (español)" },
    fr: { label: "French (français)" },
    it: { label: "Italian (italiano)" }
  };

  // Nyomatékos nyelvi utasítás MAGÁN A CÉLNYELVEN. A modellek a saját nyelvükön
  // megfogalmazott utasítást sokkal jobban követik, mint az angolt – így egy
  // magyarra állított modell NEM vált át angolra.
  var LANG_DIRECTIVE = {
    hu: "FONTOS: A TELJES válaszodat KIZÁRÓLAG magyarul írd meg. Soha, semmilyen körülmények között ne válts angolra vagy más nyelvre. Minden szó és mondat magyar legyen.",
    en: "IMPORTANT: Write your ENTIRE answer ONLY in English. Never switch to another language.",
    de: "WICHTIG: Schreibe deine GESAMTE Antwort AUSSCHLIESSLICH auf Deutsch. Wechsle niemals ins Englische oder eine andere Sprache.",
    ru: "ВАЖНО: Пиши ВЕСЬ ответ ТОЛЬКО на русском языке. Никогда не переходи на английский или другой язык.",
    pt: "IMPORTANTE: Escreve a TUA resposta inteira APENAS em português. Nunca mudes para inglês nem para outra língua.",
    es: "IMPORTANTE: Escribe TODA tu respuesta SOLO en español. Nunca cambies al inglés ni a otro idioma.",
    fr: "IMPORTANT : Rédige TOUTE ta réponse UNIQUEMENT en français. Ne passe jamais à l'anglais ni à une autre langue.",
    it: "IMPORTANTE: Scrivi TUTTA la tua risposta SOLO in italiano. Non passare mai all'inglese o a un'altra lingua."
  };
  function langDirective() { return LANG_DIRECTIVE[getLang()] || LANG_DIRECTIVE.hu; }

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

  var DEFAULT_ID = "Qwen2.5-7B-Instruct-q4f32_1-MLC"; // alapértelmezett: Normal (jó egyensúly); a Group is ezt használja

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

  // ---------- RENDSZERNYELV + ENERGIATAKARÉKOS MÓD ----------
  function getLang() {
    try { var v = localStorage.getItem(LS_LANG); if (v && LANGS[v]) return v; } catch (e) {}
    return "hu";
  }
  function setLang(code) {
    if (!LANGS[code]) return;
    try { localStorage.setItem(LS_LANG, code); } catch (e) {}
  }
  function langLabel() { return (LANGS[getLang()] || LANGS.hu).label; }

  function ecoOn() {
    // Alapból BE (rövidebb válasz = rövidebb GPU-tüske) – csak kifejezett
    // kikapcsolásra ("0") megy teljes hosszal. Az app.js kapcsolója is így számol.
    try { return localStorage.getItem(LS_ECO) !== "0"; } catch (e) { return true; }
  }

  // ---------- BESZÉDSTÍLUS (személyre szabás) ----------
  // A „Személyre szabjuk az élményedet" varázslóban választott hangnem. A run()
  // minden rendszer-prompthoz hozzáteszi, így a chat, a házi, a Game és a Group
  // is ugyanabban a stílusban beszél. A "friendly" az alapértelmezés.
  var LS_STYLE = "magicai_style";
  var STYLES = {
    friendly: {
      label: "😊 Barátságos",
      line: "TONE: Beszélj közvetlen, barátságos, bátorító hangnemben, mint egy jó barát. Nyugodtan tegeződj."
    },
    concise: {
      label: "⚡ Tömör",
      line: "TONE: Válaszolj tömören és lényegre törően. Kerüld a felesleges körítést, udvariassági köröket és ismétlést – csak a lényeget mondd."
    },
    detailed: {
      label: "📚 Részletes",
      line: "TONE: Magyarázz részletesen és érthetően, mint egy türelmes tanár. Ahol segít, hozz példát, és vezesd le lépésről lépésre a gondolatmenetet."
    },
    funny: {
      label: "😄 Vicces",
      line: "TONE: Legyél játékos és humoros, csempéssz a válaszaidba egy kis vidámságot vagy szójátékot – de a tények és a megoldások mindig pontosak maradjanak."
    }
  };
  function getStyle() {
    try { var v = localStorage.getItem(LS_STYLE); if (v && STYLES[v]) return v; } catch (e) {}
    return "friendly";
  }
  function setStyle(code) {
    if (!STYLES[code]) return;
    try { localStorage.setItem(LS_STYLE, code); } catch (e) {}
  }
  function styleLine() { return (STYLES[getStyle()] || STYLES.friendly).line; }

  // ---------- NYELVENKÉNTI LETÖLTÉS-NYILVÁNTARTÁS ----------
  // A user kérése: „amilyen nyelvre van állítva, olyan nyelven kell letölteni az
  // egész verziót" – minden nyelvet KÜLÖN töltünk le. Technikai valóság: a WebLLM-
  // modell EGYETLEN, többnyelvű fájl (a böngésző egyszer gyorsítótárazza), ezért a
  // második és további nyelv „letöltése" gyors (a súlyok már megvannak). Itt
  // modellenként ÉS nyelvenként jegyezzük, mely nyelveket „töltötte le" a felhasználó,
  // hogy a felület nyelvenként külön állapotot mutathasson.
  function readyMap() {
    try { return JSON.parse(localStorage.getItem(LS_LANGS) || "{}") || {}; } catch (e) { return {}; }
  }
  function langKey(modelId, lang) { return modelId + "::" + (lang || getLang()); }
  function langReady(modelId, lang) { return !!readyMap()[langKey(modelId, lang)]; }
  function markLangReady(modelId, lang) {
    var m = readyMap();
    m[langKey(modelId, lang)] = true;
    try { localStorage.setItem(LS_LANGS, JSON.stringify(m)); } catch (e) {}
  }
  // Mely nyelvekre van „letöltve" ez a modell? (kódok tömbje, a LANGS sorrendjében)
  function readyLangs(modelId) {
    var m = readyMap(), out = [];
    Object.keys(LANGS).forEach(function (code) {
      if (m[langKey(modelId, code)]) out.push(code);
    });
    return out;
  }
  function forgetLangs() { try { localStorage.removeItem(LS_LANGS); } catch (e) {} }

  // A modellnek adott, nyelvfüggetlen utasítás a válasz nyelvéről és a hibátlan
  // helyesírásról. Ezt MINDEN rendszer-prompt elé beszúrjuk (lásd run()), így a
  // modell mindig a beállított nyelven, tökéletes helyesírással válaszol – az
  // idegen (pl. angol) szavakat is pontosan leírva.
  function langLine() {
    return "LANGUAGE: Write your ENTIRE answer ONLY in " + langLabel() + ". " +
      "Use flawless spelling, grammar, word inflection, accents/diacritics and punctuation. " +
      "Spell every foreign word (for example English terms, names and brands) correctly and exactly. " +
      "Do NOT switch to another language (especially NOT English) unless the user explicitly asks for it. " +
      langDirective();
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
      // A jelenlegi nyelvet megjelöljük „letöltöttként" ehhez a modellhez
      // (nyelvenkénti letöltés-élmény).
      markLangReady(modelId, getLang());
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

  // ---------- RENDSZER-PROMPTOK ----------
  // A nyelvi utasítást (langLine) NEM ide tesszük, hanem a run() szúrja be minden
  // prompt elé, így a Házi feladat saját promptjai is a beállított nyelvet követik.
  function chatSystem() {
    return "Te a Magic AI vagy – egy okos, barátságos és segítőkész asszisztens. " +
      "MINDIG a fent megadott válasznyelven, kifogástalan és gördülékeny nyelvtannal, ragozással, ékezetekkel/diakritikus jelekkel, egyeztetéssel és központozással válaszolj – " +
      "akkor is, ha a kérdés más nyelven vagy idegen szavakkal érkezik. " +
      "Fogalmazz összefüggő, jól felépített mondatokban: a gondolatok logikusan kövessék egymást, kerüld a széteső, hiányos vagy értelmetlen mondatokat. " +
      "Tartsd végig EGYSÉGES, nyugodt és tárgyilagos hangnemet; ne csapongj a stílusban. " +
      "Először MINDIG értsd meg pontosan, mire kíváncsi a felhasználó, és gondold át a választ lépésről lépésre, mielőtt megírod. " +
      "Adj KONKRÉT, tartalmas és világosan felépített választ: ne csak azt írd le, hogyan lehetne megoldani, hanem oldd is meg, és mondd ki a tényleges választ. " +
      "Légy bátran segítőkész: igyekezz a lehető legtöbb kérdésre érdemben válaszolni – magyarázattal, példával, ötlettel, lépésekkel –, ne hárítsd el a kérést. " +
      "Az összetett kérdést bontsd részekre, és ahol segít, használj rövid felsorolást vagy számozott lépéseket. " +
      "Csak akkor állíts valamit tényként, ha biztos vagy benne; ha valamit nem tudsz, ismerd el őszintén, és SOHA ne találj ki neveket, számokat, dátumokat vagy forrásokat. " +
      "A válasz hossza igazodjon a kérdéshez: egyszerűre tömör, összetettre részletesebb, de mindig lényegre törő és jól érthető.";
  }

  // Web-megalapozott (RAG) válasz: a kérdéshez az alkalmazás friss internetes
  // forrást ad (pl. Wikipédia). Ilyenkor a modell a kapott forrásra TÁMASZKODVA
  // fogalmazza meg a választ – így a saját tudásából nem ismert tényekre
  // (pl. élő közszereplők) is pontos választ ad.
  function webSystem() {
    return "Te a Magic AI vagy – egy okos, segítőkész asszisztens. " +
      "A felhasználói üzenetben kapsz egy, az internetről származó FORRÁS-szöveget és egy KÉRDÉST. " +
      "A választ ELSŐSORBAN a megadott forrásra TÁMASZKODVA írd meg: foglald össze a lényeget a saját szavaiddal, " +
      "a fent megadott válasznyelven, kifogástalan, összefüggő nyelvtannal (helyes ragozással, ékezetekkel, egyeztetéssel). " +
      "Ha a forrás más nyelvű, akkor is a megadott válasznyelven válaszolj. Csak a kérdésre felelj, lényegre törően, ne ismételd szó szerint a forrást. " +
      "Ha a forrás nem tartalmazza a választ, mondd meg őszintén, és NE találj ki adatokat.";
  }

  function compSystem() {
    return "Tapasztalt fogalmazás-segéd vagy egy általános vagy középiskolás diáknak. " +
      "A feladatod, hogy a megadott témáról szép, összefüggő, gondolatgazdag és nyelvtanilag KIFOGÁSTALAN fogalmazást írj a fent megadott válasznyelven – " +
      "helyes ragozással, ékezetekkel, egyeztetéssel és központozással. " +
      "Szerkezet: első sorban egy találó cím, utána Bevezetés, Tárgyalás (2–3 jól kifejtett bekezdés konkrét példákkal) és Befejezés. " +
      "Fogalmazz természetesen, változatos és gördülékeny mondatokkal, végig egységes hangnemben, kerüld az ismétlést és a töltelékszavakat. " +
      "KIZÁRÓLAG a megadott válasznyelven írj, és csak magát a fogalmazást add vissza, magyarázat nélkül.";
  }

  // A „gondolkodó" modellek (pl. Qwen3) a válasz ELÉ egy <think>…</think> blokkban
  // HANGOSAN gondolkodnak (sokszor angolul). A felhasználónak CSAK a kész válasz kell,
  // ezért ezt a blokkot eltávolítjuk – a lezárt blokkokat ÉS a még streamelődő,
  // le nem zárt gondolkodást is (ilyenkor a <think>-től a végéig vágunk).
  function stripThink(text) {
    if (!text) return text;
    var t = String(text);
    t = t.replace(/<think>[\s\S]*?<\/think>/gi, "");      // teljes, lezárt blokkok
    var open = t.toLowerCase().lastIndexOf("<think");      // nyitott / csonka (stream közben)
    if (open !== -1 && t.toLowerCase().indexOf("</think>", open) === -1) t = t.slice(0, open);
    return t.replace(/^\s+/, "");
  }

  // Qwen3 (gondolkodó) modellnél a `/no_think` kapcsoló eleve KIKAPCSOLJA a hangos
  // gondolkodást – így nem is keletkezik az angol levezetés (gyorsabb is). Más
  // modellnél (pl. Qwen2.5, Phi) üres, így ártalmatlan.
  function noThinkTag() {
    return /qwen3/i.test(state.modelId || "") ? "\n\n/no_think" : "";
  }

  // Belső: üzenetlista → streamelt válasz (token-onként hívja az onToken-t a teljes,
  // a gondolkodástól MEGTISZTÍTOTT szöveggel)
  function stream(messages, onToken, opts) {
    if (!state.ready) return Promise.reject(new Error("A modell még nincs betöltve."));
    // ENERGIATAKARÉKOS mód: rövidebb válaszhatár → kevesebb számítás, kisebb
    // gép- és energiaterhelés. Normál módban bővebb válasz fér el.
    var maxTok = ecoOn() ? 640 : 1024;
    return state.engine.chat.completions.create(Object.assign({
      messages: messages, stream: true, temperature: 0.6, top_p: 0.9,
      // Enyhébb ismétlés-büntetés: a ragozó nyelveket (pl. magyar) a túl erős
      // büntetés rontja; ennyi még visszafogja a szóismétlést.
      frequency_penalty: 0.2, presence_penalty: 0.15, max_tokens: maxTok
    }, opts || {})).then(function (s) {
      var full = "";
      function pump(iter) {
        return iter.next().then(function (res) {
          if (res.done) return stripThink(full);
          var chunk = res.value;
          var delta = (chunk && chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content) || "";
          if (delta) { full += delta; if (onToken) onToken(stripThink(full), delta); }
          return pump(iter);
        });
      }
      var iterator = s[Symbol.asyncIterator] ? s[Symbol.asyncIterator]() : s;
      return pump(iterator);
    });
  }

  // Általános feladatmegoldás: tetszőleges rendszer-prompt + felhasználói szöveg.
  // A langLine() MINDEN prompt elé bekerül → a válasz a beállított nyelven, tökéletes
  // helyesírással készül (akkor is, ha a kapott prompt magyarul fogalmaz).
  function run(systemPrompt, userText, onToken, opts) {
    // A nyelvi utasítás a prompt ELEJÉN (langLine) ÉS a VÉGÉN (langDirective) is –
    // a modell a legutolsó utasításra figyel a legjobban, így nem vált át angolra.
    // A noThinkTag() a Qwen3-nál kikapcsolja a hangos „gondolkodást".
    var sys = langLine() + "\n\n" + styleLine() + "\n\n" + (systemPrompt || "") + "\n\n" + langDirective() + noThinkTag();
    return stream([
      { role: "system", content: sys },
      { role: "user", content: userText }
    ], onToken, opts);
  }

  // Fogalmazás (a fogalmazás-rendszerprompttal)
  function writeComposition(userText, onToken) {
    return run(compSystem(), userText, onToken, { temperature: 0.7 });
  }

  // ============================================================
  //  HÁZI FELADAT MODUL – KÉP-ÉRTŐ (VISION) MOTOR
  //  Külön motorpéldányon fut, hogy a szöveges (chat) modellt NE kelljen
  //  lecserélni hozzá. A feladatról készült fotót KÖZVETLENÜL megérti –
  //  a kézírást/nyomtatott szöveget ÉS az ÁBRÁKAT, rajzokat, koordináta-
  //  rendszereket, geometriai alakzatokat is –, és a beállított rendszer-
  //  nyelven oldja meg.
  // ============================================================
  var visionState = { engine: null, ready: false, loading: false, error: null };

  function visionReady() { return visionState.ready; }
  function visionLoading() { return visionState.loading; }
  function visionWasLoaded() {
    try { return localStorage.getItem(LS_VISION) === "1"; } catch (e) { return false; }
  }

  function loadVision(onProgress) {
    if (visionState.ready) return Promise.resolve();
    if (visionState.loading) return Promise.reject(new Error("A kép-értő modul betöltése már folyamatban van."));
    if (!supported()) {
      return Promise.reject(new Error("Ez a böngésző nem támogatja a WebGPU-t, ezért a kép-értő modul nem futtatható."));
    }
    visionState.loading = true;
    visionState.error = null;
    return import(CDN).then(function (webllm) {
      return webllm.CreateMLCEngine(VISION_MODEL.id, {
        initProgressCallback: function (p) {
          if (onProgress) onProgress({ progress: (p && typeof p.progress === "number") ? p.progress : 0, text: (p && p.text) || "" });
        }
      });
    }).then(function (engine) {
      visionState.engine = engine;
      visionState.ready = true;
      visionState.loading = false;
      try { localStorage.setItem(LS_VISION, "1"); } catch (e) {}
      markLangReady(VISION_MODEL.id, getLang());
    }).catch(function (err) {
      visionState.loading = false;
      visionState.error = err;
      try { localStorage.removeItem(LS_VISION); } catch (e) {}
      throw err;
    });
  }

  // Kép → megoldás: a vision-modell megnézi a fotót (szöveg + ábrák) és a
  // megadott utasítás szerint válaszol, a beállított rendszernyelven, streamelve.
  // imageUrl: data:URL (a feltöltött kép). instruction: mit kérünk (pl. olvasd el
  // és oldd meg a feladatot). A langLine()-t ide is beszúrjuk, hogy a nyelv stimmeljen.
  function runVision(imageUrl, instruction, onToken, opts) {
    if (!visionState.ready) return Promise.reject(new Error("A kép-értő modul még nincs betöltve."));
    var sys = langLine() + "\n\n" +
      "Te a Magic AI házi feladat kép-értő modulja vagy. A felhasználó FOTÓT küld egy feladatról. " +
      "FIGYELMESEN olvasd el a képen lévő MINDEN szöveget (kézírást és nyomtatottat is), és értelmezd a hozzá tartozó " +
      "ÁBRÁKAT, rajzokat, koordináta-rendszereket, táblázatokat és geometriai alakzatokat is. " +
      "Először pontosan állapítsd meg, MI a megoldandó feladat és mi az elérni kívánt eredmény, majd OLDD MEG lépésről lépésre, " +
      "a fent megadott válasznyelven, kifogástalan helyesírással. A matek végén add meg a kész eredményt: „Megoldás: …”.\n\n" +
      langDirective();
    var maxTok = ecoOn() ? 768 : 1280;
    return visionState.engine.chat.completions.create(Object.assign({
      messages: [
        { role: "system", content: sys },
        { role: "user", content: [
          { type: "text", text: instruction || "Olvasd el és oldd meg ezt a házi feladatot (az ábrákat is értelmezve)." },
          { type: "image_url", image_url: { url: imageUrl } }
        ] }
      ],
      stream: true, temperature: 0.3, top_p: 0.9, max_tokens: maxTok
    }, opts || {})).then(function (s) {
      var full = "";
      function pump(iter) {
        return iter.next().then(function (res) {
          if (res.done) return stripThink(full);
          var chunk = res.value;
          var delta = (chunk && chunk.choices && chunk.choices[0] && chunk.choices[0].delta && chunk.choices[0].delta.content) || "";
          if (delta) { full += delta; if (onToken) onToken(stripThink(full), delta); }
          return pump(iter);
        });
      }
      var iterator = s[Symbol.asyncIterator] ? s[Symbol.asyncIterator]() : s;
      return pump(iterator);
    });
  }

  var api = {
    MODELS: MODELS,
    VISION_MODEL: VISION_MODEL,
    LANGS: LANGS,
    supported: supported,
    load: load,
    run: run,
    writeComposition: writeComposition,
    isReady: isReady,
    isLoading: isLoading,
    defaultModel: defaultModel,
    currentModel: currentModel,
    lastLoadedModel: lastLoadedModel,
    forgetLoaded: forgetLoaded,
    getLang: getLang,
    setLang: setLang,
    langLabel: langLabel,
    ecoOn: ecoOn,
    // Beszédstílus (személyre szabás)
    STYLES: STYLES,
    getStyle: getStyle,
    setStyle: setStyle,
    // Nyelvenkénti letöltés-nyilvántartás
    langReady: langReady,
    markLangReady: markLangReady,
    readyLangs: readyLangs,
    forgetLangs: forgetLangs,
    // Házi feladat – kép-értő (vision) modul
    loadVision: loadVision,
    visionReady: visionReady,
    visionLoading: visionLoading,
    visionWasLoaded: visionWasLoaded,
    runVision: runVision,
    state: state
  };
  // A rendszer-promptok dinamikusak (a nyelv változhat) → getterként adjuk ki,
  // hogy a hívó (app.js) mindig az aktuális nyelvű promptot kapja.
  Object.defineProperty(api, "CHAT_SYSTEM", { get: chatSystem, enumerable: true });
  Object.defineProperty(api, "WEB_SYSTEM",  { get: webSystem,  enumerable: true });
  Object.defineProperty(api, "COMP_SYSTEM", { get: compSystem, enumerable: true });
  window.MagicLLM = api;
})();
