// ============================================================
//  MAGIC AI – Motor és felület
//  Saját fejlesztésű, helyben futó AI: nincs API, nincs internet.
// ============================================================

(function () {
  "use strict";

  // ============================================================
  //  FRISSÍTÉSI BEÁLLÍTÁS
  //  ⚠️ ÁLLÍTSD BE: a saját GitHub-repód neve "felhasznalonev/repo"
  //  formában, pl. "noelvarga/magic-ai". Ettől kezdve az app magától
  //  megtalálja és letölti az új verziókat – GitHubra menni se kell.
  // ============================================================
  var UPDATE_REPO = "noelvarga1113-hue/magic-ai-the-best-";
  var UPDATE_BRANCH = "main";

  // ---------- SZÖVEGFELDOLGOZÁS ----------

  // Kisbetűsítés, ékezetek eltávolítása, írásjelek törlése
  function normalize(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenize(text) {
    return normalize(text).split(" ").filter(function (t) { return t.length > 0; });
  }

  // Levenshtein-távolság – elgépelések felismeréséhez
  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var prev = [], curr = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      curr[0] = i;
      for (j = 1; j <= b.length; j++) {
        var cost = a[i - 1] === b[j - 1] ? 0 : 1;
        curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      }
      var tmp = prev; prev = curr; curr = tmp;
    }
    return prev[b.length];
  }

  function stringSimilarity(a, b) {
    var maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - levenshtein(a, b) / maxLen;
  }

  // Két token hasonló-e (elgépelést is tűrve)
  function tokensAlike(t1, t2) {
    if (t1 === t2) return 1;
    if (t1.length >= 4 && t2.length >= 4) {
      if (t1.indexOf(t2) === 0 || t2.indexOf(t1) === 0) return 0.85; // szótő-egyezés
      var sim = stringSimilarity(t1, t2);
      if (sim >= 0.75) return sim;
    }
    return 0;
  }

  // Töltelék- és kérdőszavak: kis súlyt kapnak az illesztésnél
  var STOPWORDS = {
    a: 1, az: 1, egy: 1, es: 1, is: 1, ki: 1, mi: 1, mit: 1, mik: 1,
    hany: 1, mennyi: 1, milyen: 1, hogy: 1, hogyan: 1, van: 1, volt: 1,
    vagy: 1, te: 1, en: 1, meg: 1, nem: 1, mire: 1, miben: 1, hol: 1,
    mikor: 1, miert: 1, mely: 1, melyik: 1
  };

  function tokenWeight(t) {
    return STOPWORDS[t] ? 0.25 : 1;
  }

  // Pontszám: mennyire illik a kérdés egy mintára (0..1)
  function scoreMatch(input, pattern) {
    var ni = normalize(input), np = normalize(pattern);
    if (!ni || !np) return 0;
    if (ni === np) return 1;

    var ti = tokenize(input), tp = tokenize(pattern);

    // Súlyozott token-átfedés
    var hitMass = 0, patternMass = 0, contentHits = 0;
    for (var i = 0; i < tp.length; i++) {
      var w = tokenWeight(tp[i]);
      patternMass += w;
      var best = 0;
      for (var j = 0; j < ti.length; j++) {
        var s = tokensAlike(tp[i], ti[j]);
        if (s > best) best = s;
      }
      hitMass += best * w;
      if (best > 0 && w === 1) contentHits++;
    }
    var inputMass = 0;
    for (var k = 0; k < ti.length; k++) inputMass += tokenWeight(ti[k]);

    var coverPattern = patternMass > 0 ? hitMass / patternMass : 0;
    var coverInput = inputMass > 0 ? Math.min(hitMass / inputMass, 1) : 0;

    // A minta lefedettsége a fő szempont, de a kérdés lefedettsége
    // szorzóként rontja, ha sok oda nem illő szó van a kérdésben
    var tokenScore = coverPattern * (0.5 + 0.5 * coverInput);

    // Tartalmas szóegyezés nélkül a tokenpontszám nem ér semmit.
    // A csupa töltelékszóból álló minták (pl. "mi az mi") pedig csak
    // pontos vagy szó szerinti egyezésnél találhatnak, különben mindenre ráillenének.
    var patternHasContent = tp.some(function (t) { return tokenWeight(t) === 1; });
    if (!patternHasContent || contentHits === 0) tokenScore = 0;

    // A karakterszintű hasonlóság csak elgépelésekre való:
    // csak nagyon magas egyezésnél vesszük figyelembe
    var stringScore = stringSimilarity(ni, np);
    var score = tokenScore;
    if (stringScore >= 0.8) score = Math.max(score, stringScore);

    // Bónusz: a minta egyben, szóhatáron szerepel a kérdésben
    if (np.length >= 4 && (" " + ni + " ").indexOf(" " + np + " ") !== -1) {
      score = Math.max(score, 0.92);
    }

    return score;
  }

  // ---------- TANULT TUDÁS (localStorage) ----------

  var STORE_KEY = "magicai_learned_v1";
  var THEME_KEY = "magicai_theme";

  // Verziókövetés: első megnyitáskor üdvözlő üzenet az újdonságokkal
  // A látható verzió a felhasználó kérésére 2.2 marad; az asset `?v=` viszont
  // bumpolva van (2.2.3) a friss fájlok betöltéséhez (stale-cache ellen).
  var APP_VERSION = "2.2";
  var VERSION_KEY = "magicai_version_seen";
  var ECO_KEY = "magicai_eco";   // energiatakarékos mód (megosztva az ai.js-szel)
  var LANG_KEY = "magicai_lang"; // rendszer-/válasznyelv (megosztva az ai.js-szel)

  // Az aktuális rendszer-/válasznyelv kódja (az ai.js tárolja, de itt is olvassuk)
  function getLang() {
    if (window.MagicLLM && window.MagicLLM.getLang) return window.MagicLLM.getLang();
    try { var v = localStorage.getItem(LANG_KEY); if (v) return v; } catch (e) {}
    return "hu";
  }

  function loadLearned() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveLearned(list) {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
    updateStats();
    renderLearnedList();
  }

  function teach(question, answer) {
    var list = loadLearned();
    var nq = normalize(question);
    // Ha már tanult ilyet, felülírjuk (javítás)
    var existing = list.findIndex(function (e) { return normalize(e.q) === nq; });
    var entry = { q: question.trim(), a: answer.trim(), date: new Date().toISOString(), confirmed: false };
    if (existing !== -1) list[existing] = entry; else list.push(entry);
    saveLearned(list);
  }

  // 👍 egy tanult válaszra: megerősítés, mostantól jobban bízik benne
  function confirmLearned(question) {
    var list = loadLearned();
    var nq = normalize(question);
    for (var i = 0; i < list.length; i++) {
      if (normalize(list[i].q) === nq) { list[i].confirmed = true; }
    }
    saveLearned(list);
  }

  // ---------- KRITIKUS GONDOLKODÁS ----------
  // Az AI nem hisz el mindent: ellenőrzi, amit tanítani akarnak neki.

  var PROFANITY = /\b(kurva\w*|fasz\w*|geci\w*|picsa\w*|baszd\w*|bazd\w*|baszott|kocsog\w*|buzi\w*|rohadj\w*)\b/;

  // A beépített tudásbázis (MAGIC_KB) MEGSZŰNT – mostantól mindenre az AI-modell
  // válaszol (és ha kell, az internetről néz utána). Ez a függvény megmaradt a
  // hívások kompatibilitása miatt, de már soha nem talál beépített bejegyzést.
  function findBuiltin(question) {
    return { entry: null, score: 0 };
  }

  // Eredmény: {verdict:"ok"} | {verdict:"refuse"} | {verdict:"conflict", builtin:"..."}
  function vetTeaching(question, answer) {
    if (PROFANITY.test(normalize(answer))) return { verdict: "refuse" };
    if (normalize(answer).length < 2) return { verdict: "refuse" };
    var hit = findBuiltin(question);
    if (hit.entry && hit.score >= 0.7) {
      return { verdict: "conflict", builtin: hit.entry.a[0] };
    }
    return { verdict: "ok" };
  }

  // ---------- DINAMIKUS KÉPESSÉGEK ----------

  function tryDynamic(input) {
    var n = normalize(input);

    // Idő
    if (/\b(mennyi az ido|hany ora|hany ora van|pontos ido|ido van)\b/.test(n)) {
      var now = new Date();
      return "Most " + now.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" }) + " van. ⏰";
    }

    // Dátum
    if (/\b(milyen nap van|mi a mai datum|hanyadika van|mai datum|milyen datum)\b/.test(n)) {
      var d = new Date();
      var days = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];
      return "Ma " + d.toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" }) +
             " van, " + days[d.getDay()] + ". 📅";
    }

    // Pénzfeldobás
    if (/\b(fej vagy iras|dobj fel egy ermet|ermefeldobas|penzfeldobas|dobj egy ermet)\b/.test(n)) {
      return Math.random() < 0.5 ? "Feldobtam... 🪙 **FEJ** lett!" : "Feldobtam... 🪙 **ÍRÁS** lett!";
    }

    // Kockadobás
    if (/\b(dobj kockat|kockadobas|dobj egy kockat|gurits)\b/.test(n)) {
      var dice = 1 + Math.floor(Math.random() * 6);
      var faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
      return "Gurítottam... " + faces[dice - 1] + " **" + dice + "** lett!";
    }

    // Véletlenszám: "mondj egy számot 1 és 100 között"
    var rndMatch = n.match(/szamot\s+(\d+)\s+es\s+(\d+)\s+kozott/) || n.match(/random\s*szam.*?(\d+).*?(\d+)/);
    if (rndMatch) {
      var lo = parseInt(rndMatch[1], 10), hi = parseInt(rndMatch[2], 10);
      if (lo > hi) { var t = lo; lo = hi; hi = t; }
      var r = lo + Math.floor(Math.random() * (hi - lo + 1));
      return "A számom: **" + r + "** (" + lo + " és " + hi + " között) 🎲";
    }
    if (/\b(random szam|veletlen szam|mondj egy szamot)\b/.test(n)) {
      return "A számom: **" + (1 + Math.floor(Math.random() * 100)) + "** (1 és 100 között) 🎲";
    }

    // Választás: "válassz: pizza vagy hamburger"
    var chooseMatch = input.match(/v[áa]lassz[:!.\s]+(.+?)\s+vagy\s+(.+?)[?!.]*$/i);
    if (chooseMatch) {
      var opts = [chooseMatch[1].trim(), chooseMatch[2].trim()];
      return "Én ezt választanám: **" + opts[Math.floor(Math.random() * 2)] + "**! 😄";
    }

    // Számolás
    var mathResult = tryMath(input);
    if (mathResult !== null) return mathResult;

    return null;
  }

  function tryMath(input) {
    // Kifejezés kinyerése: "mennyi 25*4?", "számold ki: 3+5", vagy csak "12*12"
    var raw = input
      .replace(/mennyi( az| lesz a?z?)?/i, "")
      .replace(/sz[áa]mold ki:?/i, "")
      .replace(/h[áa]ny( az)?/i, "")
      .replace(/[?=]/g, "")
      .trim();

    raw = raw.replace(/,/g, ".").replace(/x/gi, "*").replace(/:/g, "/").replace(/\^/g, "**");

    // Csak akkor számolunk, ha tényleg műveletnek néz ki
    if (!/^[\d\s+\-*/().%]+$/.test(raw)) return null;
    if (!/\d/.test(raw)) return null;
    if (!/[+\-*/%]/.test(raw) && !/\(/.test(raw)) return null;

    try {
      var value = Function('"use strict"; return (' + raw + ");")();
      if (typeof value !== "number" || !isFinite(value)) return null;
      var pretty = Math.round(value * 1e10) / 1e10;
      return "Az eredmény: **" + pretty.toLocaleString("hu-HU") + "** 🧮";
    } catch (e) {
      return null;
    }
  }

  // ---------- VÁLASZKERESÉS ----------

  var MATCH_THRESHOLD = 0.58;

  function findAnswer(input) {
    // 1. Dinamikus képességek
    var dyn = tryDynamic(input);
    if (dyn !== null) return { text: dyn, source: "dynamic", score: 1 };

    var ni = normalize(input);

    // 2. Tanult tudás – pontos egyezés azonnal nyer (így működik a javítás is)
    var learned = loadLearned();
    var bestLearned = null, bestLearnedScore = 0;
    for (var i = 0; i < learned.length; i++) {
      if (normalize(learned[i].q) === ni) {
        return { text: learned[i].a, source: "learned", score: 1, entry: learned[i] };
      }
      var ls = scoreMatch(input, learned[i].q);
      if (ls > bestLearnedScore) { bestLearnedScore = ls; bestLearned = learned[i]; }
    }

    // 3. Tanult tudás (közelítő egyezés) – a felhasználó által tanított válasz
    //    elsőbbséget élvez. A beépített tudásbázis MEGSZŰNT: ezen túl nincs
    //    helyi tényválasz, a tényszerű kérdéseket az AI-modell / internet kezeli.
    if (bestLearned && bestLearnedScore >= MATCH_THRESHOLD) {
      return { text: bestLearned.a, source: "learned", score: bestLearnedScore, entry: bestLearned };
    }

    return null; // helyben nincs válasz → AI-modell / internet
  }

  var UNKNOWN_REPLIES = [
    "Hmm, erre még nem tudom a választ. 🤔",
    "Ezt sajnos még nem tanultam meg. 😅",
    "Jó kérdés! De ezt még nem tudom. 🙈"
  ];

  // ---------- ÖSSZETETT KÉRDÉSEK, HATÁROZOTT VÁLASZOK (v1.2) ----------
  // Egy üzenetben több kérdés is jöhet ("Mi Párizs? És mennyi 2+2?") –
  // részekre bontjuk, és mindegyikre egyetlen, határozott választ adunk.

  var QUESTION_WORDS = "mi|mik|mit|mire|ki|kik|kit|mennyi|hány|hany|hol|honnan|hova|mikor|miért|miert|hogyan|hogy|milyen|melyik|mely|mondj|mesélj|meselj|számold|szamold|dobj|válassz|valassz|mutasd|mondd|sorold";

  var SPLIT_CONJ = new RegExp(
    ",?\\s+(?:és|valamint|illetve|plusz|aztán|aztan|utána|utana)\\s+(?=(?:azt\\s+)?(?:hogy\\s+)?(?:" + QUESTION_WORDS + ")\\b)", "i");

  function splitQuestions(input) {
    var parts = [];
    input.split(/[?!;]+/).forEach(function (seg) {
      seg.split(SPLIT_CONJ).forEach(function (p) {
        p = p.replace(/^[\s,.\-–]+/, "")
             .replace(/^(és|na és|meg|aztán|aztan|illetve|valamint|plusz)\s+/i, "")
             .trim();
        if (p) parts.push(p);
      });
    });
    return parts.length ? parts : [input.trim()];
  }

  // Második legjobb tudás-találat: kapcsolódó érdekességként fűzzük a válaszhoz
  // A beépített tudásbázis megszűnt, így nincs miből „kapcsolódó érdekességet" ajánlani.
  function findRelatedFact(input, mainEntry, mainText) {
    return null;
  }

  var CONFIDENT_INTROS = [
    "Ezt határozottan tudom! ✅ ",
    "Erre pontos válaszom van: ",
    "Jó kérdés – és tudom is a választ! 💪 ",
    "Ebben biztos vagyok: "
  ];

  // A nyers találatot teljes értékű, határozott válasszá építi:
  // magabiztos felvezetés + fő válasz + kapcsolódó érdekesség
  function decorateAnswer(input, result) {
    var text = result.text;
    if (result.source !== "kb") return text;
    if (result.score >= 0.8 && normalize(input).length >= 12 && Math.random() < 0.45) {
      text = pick(CONFIDENT_INTROS) + text;
    }
    if (normalize(input).length >= 10) {
      var rel = findRelatedFact(input, result.entry, result.text);
      if (rel) text += "\n\n💡 **Kapcsolódó érdekesség:** " + rel;
    }
    return text;
  }

  // ---------- KÖTETLEN BESZÉLGETÉS (v1.1) ----------
  // Rövid, beszélgetős üzenetekre ("ok", "aha", "hmm") NEM keresünk a neten,
  // hanem természetesen válaszolunk – így folyamatos marad a beszélgetés.

  var FILLER_WORDS = {};
  ("ok oke okes oksi okszi oksa okay rendben rendicsek jo jol ja jah aha ahha uhum igen nem ne hat na najo " +
   "mindegy talan persze hogyne ertem vilagos tudom latom szoval hm hmm hmmm haha hihi hehe lol xd wow hu huu huha " +
   "azta ejha kiraly szuper klassz remek nagyszeru zsir franko tenyleg komoly komolyan durva erdekes jaj hoppa " +
   "hopp oh ah eh no nos akkor most semmi sima yes yep nope ugye bizony nana tok jojo de am amugy hadd lassam vagom")
    .split(" ").forEach(function (w) { FILLER_WORDS[w] = 1; });

  var SMALLTALK_REPLIES = [
    "Rendben! 😊 Ha kérdésed van, csak írd be bátran!",
    "Oké! 👍 Miben segíthetek még?",
    "Értem! 😊 Van még valami, ami érdekel?",
    "Vettem! 🪄 Kérdezz bátran bármit – vagy kérj egy viccet! 😄",
    "👍 Itt vagyok, ha bármi kell!",
    "Rendicsek! 😄 Mesélj, mi jár a fejedben?",
    "Oké-zsoké! 😜 Mit szeretnél még tudni?",
    "😊 Szólj, ha kérdésed van – akár az időjárásról, a hírekről vagy bármi másról!"
  ];

  // Ha az üzenet minden szava töltelékszó (vagy csak emoji), az nem keresnivaló
  function trySmallTalk(input) {
    var n = normalize(input);
    if (n === "") return pick(SMALLTALK_REPLIES); // pl. csak emoji érkezett
    var ti = n.split(" ");
    if (ti.length > 4) return null;
    for (var i = 0; i < ti.length; i++) {
      if (!FILLER_WORDS[ti[i]]) return null;
    }
    return pick(SMALLTALK_REPLIES);
  }

  // ---------- BESZÉDSTÍLUSOK ----------
  // A válaszok hangneme átkapcsolható: gombbal vagy chat-paranccsal
  // (pl. "beszélj viccesen", "legyél komoly", "kalóz mód")

  var STYLE_KEY = "magicai_style";
  var currentStyle = localStorage.getItem(STYLE_KEY) || "normal";

  var STYLES = {
    normal: {
      label: "💬 Normál",
      confirm: "Rendben, visszaváltottam normál stílusra. 💬 Kérdezz bátran!"
    },
    vicces: {
      label: "😜 Vicces",
      confirm: "Hehe, oké! 😜 Bekapcsoltam a poéngyárat! Miért fél a robot a vihartól? Mert rövidzárlatos a humora! 🤖⚡ Na, kérdezz valamit!"
    },
    komoly: {
      label: "🧐 Komoly",
      confirm: "Értettem. Mostantól komoly, tárgyilagos stílusban válaszolok. Kérem a kérdését."
    },
    kedves: {
      label: "🥰 Kedves",
      confirm: "Jaj, de örülök! 🥰 Mostantól extra kedvesen beszélek veled, drága barátom! Mit szeretnél tudni? 💜"
    },
    tudos: {
      label: "🤓 Tudós",
      confirm: "Kiváló döntés! 🤓 Mostantól tudományos precizitással fogalmazok. Várom a vizsgálandó kérdést. 📚"
    },
    kaloz: {
      label: "🏴‍☠️ Kalóz",
      confirm: "Arr! 🏴‍☠️ Mostantól úgy beszélek, mint egy igazi tengeri medve! Ezer ördög és egy hordó rum – kérdezz bátran, matróz! ⚓"
    }
  };

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  var EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu;

  // A kész választ a kiválasztott stílusra hangolja
  function applyStyle(text) {
    var pre, suf;
    switch (currentStyle) {
      case "vicces":
        pre = Math.random() < 0.35
          ? pick(["Hehe! ", "Na figyelj, ez jó lesz! 😄 ", "Pillanat, felveszem a bohócorrom... 🤡 "])
          : "";
        suf = pick([" 😜", "\nHehe! 😄", "\n(Ugye milyen okos vagyok? Na jó, csak vicceltem... vagy mégsem? 😏)", " 🤪", "\nBa-dum-tss! 🥁"]);
        return pre + text + suf;
      case "komoly":
        return text
          .replace(EMOJI_RE, "")
          .replace(/!+/g, ".")
          .replace(/ {2,}/g, " ")
          .replace(/ \./g, ".")
          .trim();
      case "kedves":
        pre = Math.random() < 0.4
          ? pick(["Drága barátom! 💜 ", "De jó, hogy ezt kérdezed! 🥰 ", "Jaj, de aranyos kérdés! 🌸 "])
          : "";
        suf = pick([" 💜", "\nRemélem, segítettem, kedves! 🥰", " 🌸", "\nÖlelés! 🤗"]);
        return pre + text + suf;
      case "tudos":
        pre = Math.random() < 0.5
          ? pick(["A rendelkezésemre álló ismeretek alapján: ", "Tudományos megközelítésben: ", "A tényeket áttekintve: "])
          : "";
        suf = pick(["\n📚 Ha mélyebben érdekel a téma, kérdezz bátran tovább!", "\n🔬 (Megjegyzés: a tudomány folyamatosan fejlődik – ahogy én is!)", " 🤓"]);
        return pre + text + suf;
      case "kaloz":
        pre = Math.random() < 0.6
          ? pick(["Arr! ", "Ezer ördög! ", "A hét tengerre mondom! ", "Hé, matróz! "])
          : "";
        suf = pick([" 🏴‍☠️", "\nArr, így van ez a hét tengeren! ⚓", "\nMost pedig vissza a fedélzetre! ⛵", " ☠️⚓"]);
        return pre + text + suf;
      default:
        return text;
    }
  }

  // Stílusváltó parancs felismerése a chatben
  function parseStyleCommand(input) {
    var n = normalize(input);
    if (!/(beszelj|legyel|legy |valts|kapcsolj|valaszolj|stilus|mod\b|modban|modra|modot|uzemmod)/.test(n)) return null;
    if (/vicces|humoros|poenkod|viccelodj/.test(n)) return "vicces";
    if (/komoly|targyilagos|hivatalos/.test(n)) return "komoly";
    if (/kedves|aranyos|baratsagos/.test(n)) return "kedves";
    if (/tudos|tudomanyos|professzor/.test(n)) return "tudos";
    if (/kaloz/.test(n)) return "kaloz";
    if (/normal|alap|sima|szokasos|atlagos/.test(n)) return "normal";
    return null;
  }

  function setStyle(style) {
    currentStyle = style;
    localStorage.setItem(STYLE_KEY, style);
    document.querySelectorAll(".style-chip").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-style") === style);
    });
  }

  // ---------- INTERNETES KERESÉS (Wikipédia) ----------

  function fetchWithTimeout(url, ms) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, ms);
    return fetch(url, { signal: ctrl.signal }).finally(function () { clearTimeout(timer); });
  }

  // Kérdőszavak lehántása, hogy jó keresőkifejezés maradjon
  function extractTopic(input) {
    var t = input.trim().replace(/[?!.]+$/, "").trim();
    t = t.replace(/^(kérlek|kerlek|légyszi|legyszi|légy szíves|legy szives|figyelj|na)\s*,?\s*/i, "");
    t = t.replace(/^(nézz utána|nezz utana|keress rá|keress ra|keresd meg|mi az a|mi az az|ki az a|ki az az|mit tudsz arról, hogy|mit tudsz arrol, hogy|mit tudsz a|mit jelent az, hogy|mit jelent a|mit jelent|magyarázd el|magyarazd el|mesélj nekem a|meselj nekem a|mesélj a|meselj a)\s*:?\s*/i, "");
    t = t.replace(/^(mi|mik|ki|kik|mit|milyen|mikor|hol|hogyan|miért|miert|mesélj|meselj|mondd el)\s+/i, "");
    t = t.replace(/^(az|a|egy)\s+/i, "");
    t = t.replace(/^(volt|van|jelent|található|talalhato|született|szuletett)\s+/i, "");
    t = t.replace(/^(az|a|egy)\s+/i, "");
    return t.trim() || input.trim();
  }

  // ---------- IDŐJÁRÁS (Open-Meteo, ingyenes, kulcs nélkül) ----------

  // Felismeri az időjárás-kérdést, kinyeri a várost és a napot
  function parseWeatherQuery(input) {
    var n = normalize(input);
    if (!/(idojaras|milyen ido|milyen az ido|milyen lesz az ido|hany fok|fok van|fok lesz|esik az eso|esik majd|esni fog|fog esni|lesz eso|fog az eso|havazik|havazni fog)/.test(n)) {
      return null;
    }
    var day = /holnaputan/.test(n) ? 2 : (/holnap/.test(n) ? 1 : 0);

    // Város: ami a kérdésből az időjárás-szavak levonása után megmarad
    var skip = /^(milyen|az|a|ido|idojaras|van|lesz|ma|most|mostani|holnap|holnaputan|kint|kinn|kint|hany|fok|fokot|esik|eso|esot|esni|fog|havazik|havazni|ho|hava|nalunk|itt|otthon|mondd|meg|el|szerinted|es|majd|vajon|epp|eppen|akkor|oda|kerlek)$/;
    var words = input.replace(/[?!.,;:]/g, " ").split(/\s+/).filter(Boolean);
    var cityWords = words.filter(function (w) { return !skip.test(normalize(w)); });
    return { city: cityWords.join(" ").trim(), day: day };
  }

  // Magyar helyragok lehántása: Budapesten → Budapest, Pécsett → Pécs
  function cityCandidates(city) {
    var out = [];
    function add(c) { if (c && c.length >= 2 && out.indexOf(c) === -1) out.push(c); }
    add(city.replace(/(ban|ben)$/i, ""));
    add(city.replace(/(on|en|ön|ön)$/i, ""));
    add(city.replace(/(ott|ett|ött)$/i, ""));
    add(city.replace(/(nal|nel|nál|nél)$/i, ""));
    add(city);
    return out;
  }

  // wttr.in (WWO) időjárás-kód → magyar leírás + emoji
  function wwoText(code) {
    code = parseInt(code, 10);
    if (code === 113) return ["derült, napos idő", "☀️"];
    if (code === 116) return ["enyhén felhős idő", "🌤️"];
    if (code === 119 || code === 122) return ["borult idő", "☁️"];
    if (code === 143 || code === 248 || code === 260) return ["köd", "🌫️"];
    if ([176, 263, 266, 281, 284, 293, 296, 353].indexOf(code) !== -1) return ["kisebb eső, záporok", "🌦️"];
    if ([299, 302, 305, 308, 356, 359].indexOf(code) !== -1) return ["eső", "🌧️"];
    if ([179, 182, 185, 311, 314, 317, 320, 350, 362, 365, 374, 377].indexOf(code) !== -1) return ["havas eső, ónos eső", "🌨️"];
    if ([227, 230, 323, 326, 329, 332, 335, 338, 368, 371, 395].indexOf(code) !== -1) return ["havazás", "❄️"];
    if ([200, 386, 389, 392].indexOf(code) !== -1) return ["zivatar", "⛈️"];
    return ["változékony idő", "🌍"];
  }

  function getWeather(city, day) {
    var candidates = cityCandidates(city || "Budapest");

    function geocode(i) {
      if (i >= candidates.length) return Promise.reject(new Error("nincs ilyen település"));
      var url = "https://geocoding-api.open-meteo.com/v1/search?count=1&language=hu&format=json&name=" +
        encodeURIComponent(candidates[i]);
      return fetchWithTimeout(url, 8000)
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.results && d.results.length) return d.results[0];
          return geocode(i + 1);
        });
    }

    return geocode(0).then(function (loc) {
      var url = "https://wttr.in/" + loc.latitude + "," + loc.longitude + "?format=j1";
      return fetchWithTimeout(url, 9000)
        .then(function (r) {
          if (!r.ok) throw new Error("időjárás-hiba");
          return r.json();
        })
        .then(function (w) {
          var name = loc.name + (loc.country ? " (" + loc.country + ")" : "");
          var d = w.weather[day];
          var rain = Math.max.apply(null, d.hourly.map(function (h) {
            return parseInt(h.chanceofrain, 10) || 0;
          }));
          if (day === 0) {
            var cur = w.current_condition[0];
            var wm = wwoText(cur.weatherCode);
            return wm[1] + " **" + name + "** – most " + wm[0] + ", **" +
              cur.temp_C + " °C** (hőérzet: " + cur.FeelsLikeC + " °C).\n" +
              "💨 Szél: " + cur.windspeedKmph + " km/h • 💧 Páratartalom: " + cur.humidity + "%\n" +
              "Ma várható: " + d.mintempC + "–" + d.maxtempC + " °C, csapadékesély: " + rain + "%.";
          }
          // holnap/holnapután: a déli óra kódja jellemzi a napot
          var wmd = wwoText((d.hourly[4] || d.hourly[0]).weatherCode);
          var label = day === 1 ? "Holnap" : "Holnapután";
          return wmd[1] + " " + label + " **" + name + "** környékén " + wmd[0] +
            " várható, " + d.mintempC + "–" + d.maxtempC + " °C, a csapadék esélye " + rain + "%.";
        });
    });
  }

  // Személyre kérdezés felismerése: visszaadja a kinyert nevet, vagy null-t.
  // Konzervatív: nagybetűs nevet vár, hogy ne tévessze meg a fogalom-kérdéseket.
  function parsePersonQuery(text) {
    var t = String(text || "").trim().replace(/\?+\s*$/, "").trim();
    var low = t.toLowerCase();
    var intent =
      /^ki\s+(az\s+a|az|volt|ez\s+a|ez|ő|o)\b/.test(low) ||
      /^kicsoda\b/.test(low) || /\bkicsoda\s*$/.test(low) ||
      /[ée]letrajz/.test(low) || /\b[ée]let[ée]r[őo]l\b/.test(low) ||
      /^(mutasd be|mes[ée]lj|besz[ée]lj)\b/.test(low) ||
      /^ki\s+volt\b/.test(low);
    if (!intent) return null;
    var name = t
      .replace(/^ki\s+volt\s+/i, "")
      .replace(/^ki\s+(az\s+a|az|ez\s+a|ez|ő|o)\s+/i, "")
      .replace(/^kicsoda\s+/i, "")
      .replace(/\s+kicsoda\s*$/i, "")
      .replace(/^(mutasd be|mes[ée]lj|besz[ée]lj)\s+(nekem\s+)?/i, "")
      .replace(/^ki\s+/i, "")
      .replace(/\s+[ée]letrajz\w*\s*$/i, "")
      .replace(/\s+[ée]let[ée]r[őo]l\s*$/i, "")
      .replace(/(-?\s*r[őo]l)\s*$/i, "")
      .trim();
    if (!name || name.length < 2) return null;
    if (/\d/.test(name)) return null;
    if (name.split(/\s+/).length > 5) return null;
    if (!/[A-ZÁÉÍÓÖŐÚÜŰ]/.test(name)) return null;   // legyen benne tulajdonnév
    return name;
  }

  function searchWikipedia(query, lang) {
    lang = lang || "hu";
    var base = "https://" + lang + ".wikipedia.org";
    var topic = extractTopic(query);
    var title;
    var api = base + "/w/api.php?action=query&list=search&format=json&origin=*&srlimit=1&srsearch=" +
      encodeURIComponent(topic);
    return fetchWithTimeout(api, 8000)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var hits = d.query && d.query.search;
        if (!hits || !hits.length) throw new Error("nincs találat");
        title = hits[0].title;
        return fetchWithTimeout(
          base + "/api/rest_v1/page/summary/" + encodeURIComponent(title), 8000);
      })
      .then(function (r) {
        if (!r.ok) throw new Error("nincs összefoglaló");
        return r.json();
      })
      .then(function (s) {
        var text = s.extract || "";
        if (!text || s.type === "disambiguation") throw new Error("nincs kivonat");
        if (text.length > 550) text = text.slice(0, 550).replace(/\s+\S*$/, "") + "…";
        var url = (s.content_urls && s.content_urls.desktop && s.content_urls.desktop.page) ||
          base + "/wiki/" + encodeURIComponent(title);
        return { title: s.title || title, text: text, url: url };
      });
  }

  // CORS-proxyk olyan forrásokhoz, amelyek nem engedik a böngészős lekérést.
  // Ha az egyik proxy nem elérhető, a következővel próbálkozunk.
  var CORS_PROXIES = [
    function (u) { return "https://corsproxy.io/?url=" + encodeURIComponent(u); },
    function (u) { return "https://api.allorigins.win/raw?url=" + encodeURIComponent(u); }
  ];

  function fetchViaProxy(url, ms) {
    function attempt(i) {
      if (i >= CORS_PROXIES.length) return Promise.reject(new Error("nincs elérhető proxy"));
      return fetchWithTimeout(CORS_PROXIES[i](url), ms)
        .then(function (r) {
          if (!r.ok) throw new Error("proxy-hiba");
          return r;
        })
        .catch(function () { return attempt(i + 1); });
    }
    return attempt(0);
  }

  // DuckDuckGo azonnali válasz – második lexikon-forrás
  function searchDuckDuckGo(query) {
    var topic = extractTopic(query);
    var url = "https://api.duckduckgo.com/?format=json&no_html=1&skip_disambig=1&q=" +
      encodeURIComponent(topic);
    return fetchViaProxy(url, 8000)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var text = d.AbstractText || d.Definition || "";
        if (!text && d.RelatedTopics && d.RelatedTopics.length && d.RelatedTopics[0].Text) {
          text = d.RelatedTopics[0].Text;
        }
        if (!text) throw new Error("nincs találat");
        if (text.length > 550) text = text.slice(0, 550).replace(/\s+\S*$/, "") + "…";
        return {
          title: d.Heading || topic,
          text: text,
          url: d.AbstractURL || "https://duckduckgo.com/?q=" + encodeURIComponent(topic)
        };
      });
  }

  // ---------- A MODELL DÖNTÉSE: HELYBEN VAGY A NETRŐL? ----------
  // A felhasználó kérése: az AI döntse el az egyensúlyt a helyben megválaszolható
  // (a modell saját tudásából / számítással megoldható) kérdések és azok között,
  // amikhez internet kell (pl. élő közszereplők, friss/aktuális tények:
  // „ki volt Magyar Péter?"). Ezt egy gyakorlatias heurisztika dönti el; ha a
  // kérdés netes forrást kíván, előbb lekérünk hozzá egy lexikon-szöveget, és
  // arra TÁMASZKODVA fogalmazza meg a választ a modell (RAG). Minden másra a
  // modell a saját tudásából felel.
  function needsWebLookup(text) {
    var t = String(text || "").trim();
    if (!t) return false;
    var low = normalize(t);

    // Személyre / identitásra kérdezés (ezt jelzi a legbiztosabban a parser)
    if (parsePersonQuery(t)) return true;

    // Aktuális / friss / élő tényekre utaló kulcsszavak
    if (/\b(jelenleg|jelenlegi|mostani|aktualis|legutobbi|legujabb|legfrissebb|friss|tavaly|iden|napjainkban|mostanaban|arfolyam|euro arfolyam|dollar|mennyibe kerul|hany eves most|ki a |kik a |ki most a)\b/.test(low)) return true;

    // Konkrét évszám (2019–2099) → jellemzően friss/aktuális kontextus
    if (/\b20[1-9]\d\b/.test(low)) return true;

    // „ki / mi / melyik …" + tulajdonnév (nem a mondat legelején álló nagybetűs szó)
    if (/^(ki|kik|mi|mik|melyik|kicsoda|mesel|mutasd)/.test(low) &&
        /\s[A-ZÁÉÍÓÖŐÚÜŰ][a-záéíóöőúüű]{2,}/.test(t)) {
      return true;
    }
    return false;
  }

  // A keresés nyelvi sorrendje a beállított rendszernyelv alapján: előbb a
  // választott nyelv Wikipédiája, majd angol, végül magyar (duplikátum nélkül).
  // Így pl. orosz nyelven az orosz Wikipédiában keres elsőként.
  function searchLangs() {
    var l = getLang();
    var order = [l];
    if (order.indexOf("en") < 0) order.push("en");
    if (order.indexOf("hu") < 0) order.push("hu");
    return order;
  }

  // Lexikon-keresés a rendszernyelv szerint: Wikipédia (több nyelven) → DuckDuckGo.
  // Visszaad: { kind, title, text, url } vagy elutasít, ha semmit nem talált.
  function searchEncyclopedia(query) {
    var langs = searchLangs();
    function tryLang(i) {
      if (i >= langs.length) {
        return searchDuckDuckGo(query).then(function (d) {
          return { kind: "ddg", title: d.title, text: d.text, url: d.url };
        });
      }
      return searchWikipedia(query, langs[i]).then(function (w) {
        return { kind: i === 0 ? "wiki" : ("wiki-" + langs[i]), title: w.title, text: w.text, url: w.url };
      }).catch(function () { return tryLang(i + 1); });
    }
    return tryLang(0);
  }

  // Netes háttér-információ a kérdéshez (a rendszernyelv szerinti Wikipédia → … → DuckDuckGo).
  // Visszaad: { title, text, url, kind } vagy elutasít, ha semmit nem talált.
  function fetchWebContext(text) {
    var person = parsePersonQuery(text);
    var query = person || text;
    return searchEncyclopedia(query);
  }

  // A modellnek küldött, web-megalapozott (RAG) felhasználói üzenet összeállítása.
  function buildGroundedPrompt(text, ctx) {
    return "Az alábbi, internetről származó FORRÁS segíthet a válaszban. Ha releváns, " +
      "támaszkodj rá; ha nem tartalmazza a választ, mondd meg őszintén.\n\n" +
      "--- FORRÁS (" + (ctx.title || "internet") + ") ---\n" + ctx.text + "\n--- forrás vége ---\n\n" +
      "KÉRDÉS: " + text + "\n\nVálaszolj röviden, pontosan, természetes magyar nyelven.";
  }

  // ---------- HÍREK, CIKKEK (Google News RSS) ----------

  // Hír-kérés felismerése + téma kinyerése ("hírek a fociról" → "foci")
  function parseNewsQuery(input) {
    var n = normalize(input);
    if (!/(\bhirek\b|\bhirt\b|\bhireket\b|friss hirek|legujabb hirek|legfrissebb hirek|napi hirek|mi tortent ma|mi tortent a vilagban|mit irnak|\bcikkek\b|\bcikket\b|\bcikkeket\b)/.test(n)) {
      return null;
    }
    var skip = /^(mi|mik|a|az|egy|mai|ma|friss|frissek|legfrissebb|legujabb|napi|hir|hirek|hirt|hireket|hirei|cikk|cikkek|cikket|cikkeket|mit|irnak|irtak|tortent|vilagban|mondj|mutass|mutasd|olvass|fel|keress|nezz|utana|van|vannak|errol|arrol|rola|nekem|valami|valamit|kerlek|szerinted|most|legyen|szivesen)$/;
    var words = input.replace(/[?!.,;:]/g, " ").split(/\s+/).filter(Boolean);
    var topicWords = words.filter(function (w) { return !skip.test(normalize(w)); });
    var topic = topicWords.map(function (w) {
      return w.length >= 6 ? w.replace(/(ról|ről|rol|röl)$/i, "") : w;
    }).join(" ").trim();
    return { topic: topic };
  }

  // Friss cikkek lekérése (a Google News RSS-t CORS-proxyn át olvassuk)
  function fetchNews(topic) {
    var rss = topic
      ? "https://news.google.com/rss/search?q=" + encodeURIComponent(topic) + "&hl=hu&gl=HU&ceid=HU:hu"
      : "https://news.google.com/rss?hl=hu&gl=HU&ceid=HU:hu";

    return fetchViaProxy(rss, 10000).then(function (r) { return r.text(); }).then(function (xml) {
      var doc = new DOMParser().parseFromString(xml, "text/xml");
      var items = Array.prototype.slice.call(doc.querySelectorAll("item"), 0, 4);
      if (!items.length) throw new Error("nincs hír");
      return items.map(function (it) {
        var get = function (tag) {
          var el = it.querySelector(tag);
          return el ? el.textContent.trim() : "";
        };
        return { title: get("title"), link: get("link"), source: get("source") };
      });
    });
  }

  function newsList(items) {
    return items.map(function (it, i) {
      var src = it.source ? " (" + it.source + ")" : "";
      return (i + 1) + ". **" + it.title + "**" + src;
    }).join("\n");
  }

  function newsLinks(items) {
    return items.map(function (it, i) {
      return { label: "📄 " + (i + 1) + ". cikk", url: it.link };
    });
  }

  // ---------- WEBOLDAL-AJÁNLÓ (v1.1) ----------
  // "Milyen weboldalon találok recepteket?" → a témával foglalkozó
  // oldalak linkjeit küldjük el, kategóriánként összeválogatva.

  var WEBSITE_DIR = [
    { re: /videojatek|\bjatek|gamel|jatssz/, name: "játékok", sites: [
      { label: "🎮 Steam", url: "https://store.steampowered.com", desc: "a legnagyobb PC-s játékáruház" },
      { label: "🕹️ Poki", url: "https://poki.com/hu", desc: "ingyenes böngészős játékok letöltés nélkül" },
      { label: "🎁 Epic Games", url: "https://store.epicgames.com/hu", desc: "hetente ingyen adnak játékokat" } ] },
    { re: /recept|fozes|fozni|sutes|sutemeny|\betel|gasztro/, name: "receptek, főzés", sites: [
      { label: "🍳 Nosalty", url: "https://www.nosalty.hu", desc: "több tízezer magyar recept, hozzávalók szerint is kereshetsz" },
      { label: "🍲 Mindmegette", url: "https://www.mindmegette.hu", desc: "receptek, konyhai tippek, heti menük" },
      { label: "👨‍🍳 Street Kitchen", url: "https://streetkitchen.hu", desc: "modern receptek videókkal" } ] },
    { re: /\bvideo|videot|videok/, name: "videók", sites: [
      { label: "▶️ YouTube", url: "https://www.youtube.com", desc: "a világ legnagyobb videómegosztója" },
      { label: "🎬 Videa", url: "https://videa.hu", desc: "magyar videómegosztó" } ] },
    { re: /\bfilm|sorozat|mozi|netflix/, name: "filmek, sorozatok", sites: [
      { label: "🎬 Netflix", url: "https://www.netflix.com/hu", desc: "filmek és sorozatok előfizetéssel" },
      { label: "⭐ IMDb", url: "https://www.imdb.com", desc: "filmadatbázis értékelésekkel – itt nézd meg, mi éri meg" },
      { label: "🎞️ Port.hu", url: "https://port.hu", desc: "magyar műsorújság, mozi- és TV-műsor" } ] },
    { re: /\bzene|zenet|zenek|\bdal|szamokat hallgat|koncert/, name: "zene", sites: [
      { label: "🎵 Spotify", url: "https://open.spotify.com", desc: "zenestreamelés, lejátszási listák" },
      { label: "🎧 YouTube Music", url: "https://music.youtube.com", desc: "a YouTube zenei oldala" },
      { label: "🎶 Deezer", url: "https://www.deezer.com/hu", desc: "zenestreamelés, magyarul is" } ] },
    { re: /\bhir\b|\bhirek|hireket|hirportal|ujsag/, name: "hírek", sites: [
      { label: "📰 Telex", url: "https://telex.hu", desc: "friss magyar hírek" },
      { label: "📰 Index", url: "https://index.hu", desc: "az egyik legolvasottabb magyar hírportál" },
      { label: "📰 24.hu", url: "https://24.hu", desc: "hírek, tudomány, kultúra" },
      { label: "📰 HVG", url: "https://hvg.hu", desc: "gazdasági és közéleti hírek" } ] },
    { re: /idojaras|elorejelzes/, name: "időjárás", sites: [
      { label: "⛅ Időkép", url: "https://www.idokep.hu", desc: "a legnépszerűbb magyar időjárás-oldal, élő kamerákkal" },
      { label: "🌦️ met.hu", url: "https://www.met.hu", desc: "a hivatalos magyar meteorológiai szolgálat" } ] },
    { re: /terkep|utvonal|navigaci/, name: "térkép, útvonaltervezés", sites: [
      { label: "🗺️ Google Térkép", url: "https://maps.google.com", desc: "térkép, útvonaltervező, forgalmi adatok" },
      { label: "🚗 Waze", url: "https://www.waze.com/hu/live-map", desc: "közösségi navigáció, dugók elkerülése" } ] },
    { re: /menetrend|vonat|\bbusz|\bbkk\b|\bmav\b/, name: "menetrendek, utazástervezés", sites: [
      { label: "🚆 MÁV", url: "https://jegy.mav.hu", desc: "vonatjegy és menetrend" },
      { label: "🚌 BKK Futár", url: "https://futar.bkk.hu", desc: "budapesti tömegközlekedés élőben" },
      { label: "🚍 Volánbusz", url: "https://www.volanbusz.hu", desc: "távolsági buszok menetrendje" } ] },
    { re: /tanul|lecke|erettsegi|kurzus|tananyag|oktat/, name: "tanulás", sites: [
      { label: "🎓 Khan Academy", url: "https://hu.khanacademy.org", desc: "ingyenes oktatóvideók magyarul, matektól a történelemig" },
      { label: "🦉 Duolingo", url: "https://www.duolingo.com", desc: "ingyenes, játékos nyelvtanulás" },
      { label: "📚 Wikipédia", url: "https://hu.wikipedia.org", desc: "a szabad enciklopédia" } ] },
    { re: /programoz|kodol|webfejleszt|python|javascript/, name: "programozás", sites: [
      { label: "💻 W3Schools", url: "https://www.w3schools.com", desc: "kezdőbarát webfejlesztési leckék" },
      { label: "🆓 freeCodeCamp", url: "https://www.freecodecamp.org", desc: "ingyenes, teljes programozó-tanfolyamok" },
      { label: "❓ Stack Overflow", url: "https://stackoverflow.com", desc: "itt kapsz választ a programozási kérdésekre" },
      { label: "🐙 GitHub", url: "https://github.com", desc: "nyílt forráskódú projektek otthona" } ] },
    { re: /vasarol|vasarlas|webshop|webaruhaz|rendelj?ek|\bolcso|arosszehasonlit|\barak\b/, name: "vásárlás", sites: [
      { label: "🔍 Árukereső", url: "https://www.arukereso.hu", desc: "árösszehasonlítás magyar boltok között" },
      { label: "🛒 eMAG", url: "https://www.emag.hu", desc: "az egyik legnagyobb magyar webáruház" },
      { label: "📦 Alza", url: "https://www.alza.hu", desc: "elektronikai webáruház" } ] },
    { re: /hasznalt|aprohirdetes|turkal/, name: "használt cikkek, apróhirdetések", sites: [
      { label: "🤝 Jófogás", url: "https://www.jofogas.hu", desc: "a legnagyobb magyar apróhirdetési oldal" },
      { label: "🏷️ Vatera", url: "https://www.vatera.hu", desc: "aukciók és fix áras hirdetések" },
      { label: "🛍️ Facebook Marketplace", url: "https://www.facebook.com/marketplace", desc: "helyi adok-veszek" } ] },
    { re: /\ballas|allast|munkat keres|munkahely/, name: "álláskeresés", sites: [
      { label: "💼 Profession.hu", url: "https://www.profession.hu", desc: "a legnagyobb magyar állásportál" },
      { label: "👔 LinkedIn", url: "https://www.linkedin.com/jobs", desc: "nemzetközi karrieroldal és állások" } ] },
    { re: /ingatlan|alberlet|lakast|\blakas\b/, name: "ingatlan, albérlet", sites: [
      { label: "🏠 ingatlan.com", url: "https://ingatlan.com", desc: "a legnagyobb magyar ingatlanhirdetési oldal" },
      { label: "🔑 Albérlet.hu", url: "https://www.alberlet.hu", desc: "kiadó lakások, albérletek" } ] },
    { re: /utaz|nyaral|szallas|hotel|repulojegy|repjegy/, name: "utazás, szállás", sites: [
      { label: "🏨 Szallas.hu", url: "https://szallas.hu", desc: "belföldi szállások, akciók" },
      { label: "🌍 Booking.com", url: "https://www.booking.com", desc: "szállásfoglalás világszerte" },
      { label: "✈️ Skyscanner", url: "https://www.skyscanner.hu", desc: "olcsó repülőjegyek keresése" } ] },
    { re: /fordit|szotar|angolul|nemetul/, name: "fordítás, szótár", sites: [
      { label: "🌐 Google Fordító", url: "https://translate.google.com", desc: "gyors fordítás több mint 100 nyelven" },
      { label: "🤖 DeepL", url: "https://www.deepl.com/translator", desc: "a legtermészetesebb gépi fordító" },
      { label: "📖 SZTAKI Szótár", url: "https://szotar.sztaki.hu", desc: "klasszikus magyar online szótár" } ] },
    { re: /\bkonyv|ekonyv|olvasnivalo|regeny/, name: "könyvek, olvasás", sites: [
      { label: "📚 Moly.hu", url: "https://moly.hu", desc: "magyar könyves közösség, értékelések, ajánlók" },
      { label: "🏛️ MEK", url: "https://mek.oszk.hu", desc: "Magyar Elektronikus Könyvtár – több ezer ingyenes e-könyv" },
      { label: "🛒 Libri", url: "https://www.libri.hu", desc: "könyvvásárlás online" } ] },
    { re: /\bkep\b|kepet|kepek|\bfoto|hatterkep/, name: "képek, fotók", sites: [
      { label: "📷 Unsplash", url: "https://unsplash.com", desc: "ingyenes, profi minőségű fotók" },
      { label: "🖼️ Pixabay", url: "https://pixabay.com/hu", desc: "ingyenes képek, illusztrációk, magyarul is" },
      { label: "📸 Pexels", url: "https://www.pexels.com/hu-hu", desc: "ingyenes stockfotók és videók" } ] },
    { re: /mesterseges intelligencia|\bai\b|chatbot|chatgpt|claude/, name: "mesterséges intelligencia", sites: [
      { label: "🤖 Claude", url: "https://claude.ai", desc: "az Anthropic AI-asszisztense" },
      { label: "💬 ChatGPT", url: "https://chatgpt.com", desc: "az OpenAI chatbotja" },
      { label: "✨ Gemini", url: "https://gemini.google.com", desc: "a Google AI-asszisztense" } ] },
    { re: /egeszseg|betegseg|tunet|gyogyszer|orvos/, name: "egészség", sites: [
      { label: "🩺 WEBBeteg", url: "https://www.webbeteg.hu", desc: "orvosok által írt egészségügyi cikkek" },
      { label: "💊 Házipatika", url: "https://www.hazipatika.com", desc: "betegségek, gyógyszerek, tünetek" },
      { label: "❤️ EgészségKalauz", url: "https://www.egeszsegkalauz.hu", desc: "egészségügyi hírek és tanácsok" } ] },
    { re: /\bauto\b|autot|autokat|\bkocsi/, name: "autók", sites: [
      { label: "🚗 Használtautó.hu", url: "https://www.hasznaltauto.hu", desc: "a legnagyobb magyar autóhirdetési oldal" },
      { label: "🏁 Totalcar", url: "https://totalcar.hu", desc: "autós hírek, tesztek" } ] },
    { re: /arfolyam|reszveny|befektet|tozsde|penzugy/, name: "pénzügyek", sites: [
      { label: "📈 Portfolio", url: "https://www.portfolio.hu", desc: "gazdasági és pénzügyi hírek" },
      { label: "🏦 MNB árfolyamok", url: "https://www.mnb.hu/arfolyamok", desc: "hivatalos devizaárfolyamok" } ] },
    { re: /\bsport|\bfoci|meccs|bajnoksag/, name: "sport", sites: [
      { label: "⚽ Nemzeti Sport", url: "https://www.nemzetisport.hu", desc: "magyar sporthírek" },
      { label: "🏆 Eurosport", url: "https://www.eurosport.hu", desc: "nemzetközi sporthírek, eredmények" },
      { label: "📺 M4 Sport", url: "https://m4sport.hu", desc: "élő sportközvetítések" } ] },
    { re: /lexikon|enciklopedia/, name: "lexikon, enciklopédia", sites: [
      { label: "📚 Wikipédia", url: "https://hu.wikipedia.org", desc: "a szabad enciklopédia magyarul" } ] }
  ];

  // Weboldal-kérdés felismerése + válasz összeállítása
  function parseWebsiteQuery(input) {
    var n = normalize(input);
    var siteWord = /(weboldal|webold|honlap|webhely|website|\boldalon\b|\boldalakon\b|\boldalt\b|\boldalak\b|\boldal\b)/.test(n);
    var askWord = /(milyen|melyik|\bmely\b|\bhol\b|honnan|ajanlj|ajanlasz|ajanlanal|mondj|mutass|keressek|tudok|talalok|talalhatok|nezhetek|erdemes|legjobb)/.test(n);
    var netWhere = /(\bneten\b|\binterneten\b|\bonline\b)/.test(n) &&
                   /(\bhol\b|honnan|talalok|talalhatok|keressek|tudok|nezhetek)/.test(n);
    if (!((siteWord && askWord) || netWhere)) return null;

    // Téma kinyerése: a kérdő- és weboldal-szavak elhagyása után maradó szavak
    var skip = /^(mi|mik|mit|milyen|melyik|mely|hol|honnan|hogyan|weboldalon|weboldalakon|weboldalakat|weboldalt|weboldalak|weboldal|honlapon|honlapokon|honlapok|honlapot|honlap|webhelyen|webhelyek|webhely|website|oldalon|oldalakon|oldalakat|oldalt|oldalak|oldal|neten|interneten|online|net|internet|talalok|talalhatok|talalhato|talalni|talal|keressek|keresek|keress|nezzek|nezhetek|nezni|tudok|tudnek|lehet|vannak|van|jo|jok|jot|legjobb|legjobbak|ajanlj|ajanlasz|ajanlanal|ajanlott|mondj|mutass|nekem|ami|amik|amely|amelyek|amelyik|foglalkozik|foglalkoznak|errol|arrol|rola|szol|szolnak|temaban|temaval|tema|a|az|egy|es|vagy|ilyen|olyan|ahol|sok|par|nehany|kerlek|szerinted|esetleg|erdemes)$/;
    var words = input.replace(/[?!.,;:]/g, " ").split(/\s+/).filter(Boolean);
    var topicWords = words.filter(function (w) { return !skip.test(normalize(w)); });
    var topic = topicWords.map(function (w) {
      return w.length >= 6 ? w.replace(/(ról|ről|rol|röl|hoz|hez|höz)$/i, "") : w;
    }).join(" ").trim();

    // Van ilyen kategóriánk? → kész oldalgyűjtemény
    for (var i = 0; i < WEBSITE_DIR.length; i++) {
      var cat = WEBSITE_DIR[i];
      if (cat.re.test(n)) {
        var body = "Ezeket az oldalakat ajánlom, ha **" + cat.name + "** témában keresel: 🔗\n\n" +
          cat.sites.map(function (s) {
            return "• **" + s.label.replace(/^\S+\s*/, "") + "** – " + s.desc;
          }).join("\n") +
          "\n\nAlul a linkekre kattintva egyből meg is nyithatod őket!";
        return {
          intro: body,
          links: cat.sites.map(function (s) { return { label: s.label, url: s.url }; })
        };
      }
    }

    // Nincs ilyen kategória: előkészített keresőlinkeket adunk a témához
    var qq = encodeURIComponent(topic || extractTopic(input));
    return {
      intro: "Erre a témára" + (topic ? " (**" + topic + "**)" : "") +
        " nincs külön oldalgyűjteményem, de ezekkel a keresőkkel biztosan megtalálod a vele foglalkozó weboldalakat. Előkészítettem neked a keresést – csak kattints az alábbi linkekre! 🔍",
      links: [
        { label: "🔍 Google-keresés", url: "https://www.google.com/search?q=" + qq },
        { label: "🦆 DuckDuckGo-keresés", url: "https://duckduckgo.com/?q=" + qq },
        { label: "🔎 Bing-keresés", url: "https://www.bing.com/search?q=" + qq },
        { label: "📚 Wikipédia-keresés", url: "https://hu.wikipedia.org/w/index.php?search=" + qq }
      ]
    };
  }

  // ---------- YOUTUBE-VIDEÓ A TÉMÁHOZ (v1.2) ----------
  // Tudás-jellegű kérdéseknél megnézzük, van-e a témáról YouTube-videó,
  // és ha találunk, a válasz alá fűzzük a linkjét.

  function trimVideoTitle(title) {
    title = String(title || "").trim();
    if (title.length > 80) title = title.slice(0, 80).replace(/\s+\S*$/, "") + "…";
    return title;
  }

  function searchYouTube(topic) {
    var q = encodeURIComponent(topic);

    // Invidious: nyílt YouTube-előtét kicsi JSON API-val.
    // Proxyn át kérjük, így a CORS sem akadály, és a válasz is apró.
    function viaInvidious(base, proxied) {
      var url = base + "/api/v1/search?type=video&q=" + q;
      var req = proxied ? fetchViaProxy(url, 18000) : fetchWithTimeout(url, 6000);
      return req
        .then(function (r) { if (!r.ok) throw new Error("yt-hiba"); return r.json(); })
        .then(function (list) {
          var v = (list || []).filter(function (x) { return x && x.type === "video" && x.videoId; })[0];
          if (!v) throw new Error("nincs videó");
          return { title: trimVideoTitle(v.title), url: "https://www.youtube.com/watch?v=" + v.videoId };
        });
    }

    // A YouTube keresőoldala proxyn át (nagy oldal, ezért bő időkorláttal)
    function viaHtml() {
      var url = "https://www.youtube.com/results?search_query=" + q;
      return fetchViaProxy(url, 18000)
        .then(function (r) { return r.text(); })
        .then(function (html) {
          var m = html.match(/"videoId":"([\w-]{11})".{0,900}?"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/);
          if (!m) throw new Error("nincs videó");
          var title = m[2];
          try { title = JSON.parse('"' + m[2] + '"'); } catch (e) {}
          return { title: trimVideoTitle(title), url: "https://www.youtube.com/watch?v=" + m[1] };
        });
    }

    // Minden utat egyszerre indítunk: az első sikeres találat nyer
    var attempts = [
      function () { return viaInvidious("https://inv.nadeko.net", false); },
      function () { return viaInvidious("https://yewtu.be", false); },
      function () { return viaInvidious("https://inv.nadeko.net", true); },
      function () { return viaHtml(); }
    ];
    return new Promise(function (resolve, reject) {
      var pending = attempts.length, done = false;
      attempts.forEach(function (attempt) {
        attempt().then(function (v) {
          if (!done) { done = true; resolve(v); }
        }).catch(function () {
          pending--;
          if (pending === 0 && !done) reject(new Error("nincs videó"));
        });
      });
    });
  }

  // Erről a kérdésről érdemes-e videót keresni? (tudás-jellegű kérdés)
  function isTopicQuestion(input) {
    var n = normalize(input);
    if (n.length < 8) return false;
    return /^(mi az|mi a|mik az|mik a|ki volt|ki az|kik voltak|mit jelent|hogyan|hogy mukodik|miert|meselj|mondd el|magyarazd|mutasd be|mit tudsz)/.test(n) ||
           /(mukodik|tortent|keszul|jelent)\b/.test(n);
  }

  // A már megjelent válaszbuborékhoz utólag hozzáfűzi a videólinket
  function maybeAttachYouTube(row, question, source) {
    if (!row) return;
    var s = source || "";
    if (s !== "kb" && s.indexOf("wiki") !== 0 && s !== "ddg") return;
    if (!isTopicQuestion(question)) return;
    // A YouTube-on a teljes, természetes kérdés adja a legjobb találatot
    var topic = question.replace(/[?!.]+$/, "").trim();
    if (!topic || extractTopic(question).length < 4) return;

    searchYouTube(topic).then(function (v) {
      if (!row.isConnected) return;
      var wrap = row.querySelector(".bubble-wrap");
      if (!wrap) return;
      var a = document.createElement("a");
      a.className = "wiki-link yt-link";
      a.href = v.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "▶️ Videó a témáról: " + v.title;
      var fb = wrap.querySelector(".feedback");
      wrap.insertBefore(a, fb || null);
      islandFlash("🎬", "Videót is találtam a témáról!");
      scrollToBottom();
    }).catch(function () { /* nincs videó – nem gond */ });
  }

  // ---------- ALKALMAZÁSON BELÜLI FRISSÍTÉS (v1.3) ----------
  // Az app maga nézi meg a GitHubon, van-e újabb verzió, és egy gombbal
  // le is tölti – nem kell hozzá a GitHub-oldalra menni.
  // (A repó nevét az UPDATE_REPO állítja be, a fájl legtetején.)
  var UPDATE_CHECK_KEY = "magicai_update_checked";

  // Verziók összehasonlítása: 1 ha a > b, -1 ha a < b, 0 ha egyenlő
  function compareVersions(a, b) {
    var pa = String(a).replace(/^v/i, "").split(".");
    var pb = String(b).replace(/^v/i, "").split(".");
    for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
      var x = parseInt(pa[i] || "0", 10), y = parseInt(pb[i] || "0", 10);
      if (x > y) return 1;
      if (x < y) return -1;
    }
    return 0;
  }

  // Legújabb verzió lekérése: először a GitHub Releases-ből, ha ott nincs,
  // akkor közvetlenül a repóból olvassuk ki az APP_VERSION értékét.
  function checkForUpdate() {
    if (!UPDATE_REPO) return Promise.reject(new Error("no-repo"));

    return fetchWithTimeout("https://api.github.com/repos/" + UPDATE_REPO + "/releases/latest", 8000)
      .then(function (r) { if (!r.ok) throw new Error("nincs release"); return r.json(); })
      .then(function (rel) {
        var ver = String(rel.tag_name || rel.name || "").replace(/^v/i, "");
        if (!ver) throw new Error("nincs verzió");
        // Ha a release-hez ZIP-et is feltöltöttek, azt adjuk; különben a forrás-ZIP-et
        var asset = (rel.assets || []).filter(function (a) { return /\.zip$/i.test(a.name || ""); })[0];
        return {
          version: ver,
          notes: (rel.body || "").slice(0, 400),
          zipUrl: asset
            ? asset.browser_download_url
            : "https://github.com/" + UPDATE_REPO + "/archive/refs/tags/" + rel.tag_name + ".zip"
        };
      })
      .catch(function (e) {
        if (e && e.message === "no-repo") throw e;
        // Nincs release: megkeressük az app.js-t a repóban (akármelyik
        // mappában is van), és abból olvassuk ki az APP_VERSION-t
        return fetchWithTimeout("https://api.github.com/repos/" + UPDATE_REPO + "/git/trees/" + UPDATE_BRANCH + "?recursive=1", 8000)
          .then(function (r) { if (!r.ok) throw new Error("nem érem el a repót"); return r.json(); })
          .then(function (tree) {
            var hit = ((tree && tree.tree) || []).filter(function (x) {
              return /(^|\/)app\.js$/.test(x.path);
            })[0];
            if (!hit) throw new Error("nincs app.js a repóban");
            var rawPath = hit.path.split("/").map(encodeURIComponent).join("/");
            return fetchWithTimeout("https://raw.githubusercontent.com/" + UPDATE_REPO + "/" + UPDATE_BRANCH + "/" + rawPath, 8000);
          })
          .then(function (r) { if (!r.ok) throw new Error("nem érem el a repót"); return r.text(); })
          .then(function (src) {
            var m = src.match(/APP_VERSION\s*=\s*"([^"]+)"/);
            if (!m) throw new Error("nem találom a verziót");
            return {
              version: m[1],
              notes: "",
              zipUrl: "https://github.com/" + UPDATE_REPO + "/archive/refs/heads/" + UPDATE_BRANCH + ".zip"
            };
          });
      });
  }

  // A ZIP letöltése közvetlenül a böngészőből.
  // Telefonon a böngészők a más doménről (GitHub) érkező fájlnál
  // figyelmen kívül hagyják a `download` attribútumot, ezért új lapon
  // nyitjuk meg – így a Magic AI nyitva marad, a ZIP külön töltődik le.
  function downloadUpdate(zipUrl) {
    var a = document.createElement("a");
    a.href = zipUrl;
    a.download = "";
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // Chat-parancs: "van új verzió?", "frissítsd magad", "keress frissítést"
  function parseUpdateCommand(input) {
    var n = normalize(input);
    return /(uj verzio|ujabb verzio|frissitest|frissites van|van( e)? frissites|keress frissitest|frissitsd magad|toltsd le az uj|legujabb verzio)/.test(n);
  }

  // A frissítés-kérdés megválaszolása a chatben
  function answerUpdateQuery(text) {
    if (!UPDATE_REPO) {
      addBotMessage("Az alkalmazáson belüli frissítéshez előbb be kell állítani, melyik GitHub-repóból frissüljek: az app.js elején írd be az **UPDATE_REPO** értékét (pl. „felhasznalonev/magic-ai”). Utána már innen, a chatből is letöltheted az új verziókat! 🔄", {});
      return;
    }
    islandShow("🔄", "Frissítést keresek…");
    checkForUpdate().then(function (u) {
      hideTyping();
      if (compareVersions(u.version, APP_VERSION) > 0) {
        islandFlash("🎁", "Új verzió: v" + u.version + "!");
        addBotMessage(
          "🎁 **Új verzió érhető el: v" + u.version + "!** (Nálad: v" + APP_VERSION + ")\n" +
          (u.notes ? "\n" + u.notes + "\n" : "") +
          "\nAz alábbi gombbal egyből letöltheted – nem kell GitHubra menned. A ZIP-et csomagold ki, és másold a fájlokat a Magic AI mappájába a régiek helyére.",
          { question: text, links: [{ label: "⬇️ v" + u.version + " letöltése", url: u.zipUrl }] });
      } else {
        islandFlash("✅", "Naprakész vagy!");
        addBotMessage("✅ Jó hírem van: **a legfrissebb verziót használod** (v" + APP_VERSION + ")! Nincs mit letölteni.", {});
      }
    }).catch(function () {
      hideTyping();
      islandFlash("😕", "Nem értem el a frissítést…");
      addBotMessage("Most nem érem el a frissítési szervert. 😕 Nézd meg, van-e internetkapcsolat, és próbáld újra kicsit később!", {});
    });
  }

  // Indításkor naponta egyszer csendben megnézzük, van-e új verzió
  function autoUpdateCheck() {
    if (!UPDATE_REPO) return;
    var last = 0;
    try { last = parseInt(localStorage.getItem(UPDATE_CHECK_KEY) || "0", 10); } catch (e) {}
    if (Date.now() - last < 24 * 3600 * 1000) return;
    try { localStorage.setItem(UPDATE_CHECK_KEY, String(Date.now())); } catch (e) {}
    checkForUpdate().then(function (u) {
      if (compareVersions(u.version, APP_VERSION) > 0) {
        islandFlash("🎁", "Új verzió érhető el: v" + u.version + "!", 4000);
        addBotMessage(
          "🎁 **Új verzió érhető el: v" + u.version + "!** Az alábbi gombbal egyből letöltheted – nem kell GitHubra menned. A ZIP-et csomagold ki, és másold a fájlokat a Magic AI mappájába a régiek helyére.",
          { links: [{ label: "⬇️ v" + u.version + " letöltése", url: u.zipUrl }] });
      }
    }).catch(function () { /* csendben tűrjük – majd legközelebb */ });
  }

  // A Beállítások fül frissítés-szekciója
  function setupUpdateUI() {
    $("upd-current").textContent = "v" + APP_VERSION;
    var btn = $("upd-check"), status = $("upd-status"), box = $("upd-found");

    btn.addEventListener("click", function () {
      box.hidden = true;
      if (!UPDATE_REPO) {
        status.textContent = "⚠️ Előbb állítsd be a GitHub-repód nevét az app.js elején (UPDATE_REPO).";
        status.className = "teach-status warn";
        return;
      }
      status.textContent = "🔍 Keresem a legújabb verziót…";
      status.className = "teach-status";
      checkForUpdate().then(function (u) {
        if (compareVersions(u.version, APP_VERSION) > 0) {
          status.textContent = "";
          $("upd-version").textContent = "v" + u.version;
          $("upd-notes").textContent = u.notes || "";
          $("upd-download").onclick = function () {
            downloadUpdate(u.zipUrl);
            status.textContent = "⬇️ Letöltés elindítva! Csomagold ki, és írd felül a régi fájlokat.";
            status.className = "teach-status ok";
          };
          box.hidden = false;
          islandFlash("🎁", "Új verzió: v" + u.version + "!");
        } else {
          status.textContent = "✅ A legfrissebb verziót használod (v" + APP_VERSION + ").";
          status.className = "teach-status ok";
        }
      }).catch(function () {
        status.textContent = "😕 Nem értem el a frissítési szervert. Ellenőrizd az internetkapcsolatot!";
        status.className = "teach-status warn";
      });
    });
  }

  // ---------- MAGIC ISLAND ----------
  // Kis állapotjelző "sziget" a képernyő tetején (mint a Xiaomi Hyper Island):
  // megmutatja, épp mit csinál az AI – gondolkozik, keres a neten stb.

  var ISLAND_KEY = "magicai_island";
  var islandEnabled = localStorage.getItem(ISLAND_KEY) !== "0"; // alapból bekapcsolva
  var islandEl = null, islandTimer = null;

  function islandShow(icon, msg) {
    if (!islandEnabled || !islandEl) return;
    clearTimeout(islandTimer);
    islandEl.querySelector(".mi-icon").textContent = icon;
    islandEl.querySelector(".mi-text").textContent = msg;
    islandEl.classList.add("show");
  }

  function islandHide() {
    clearTimeout(islandTimer);
    if (islandEl) islandEl.classList.remove("show");
  }

  // Rövid üzenet, ami magától eltűnik (pl. "Megvan!")
  function islandFlash(icon, msg, ms) {
    if (!islandEnabled) return;
    islandShow(icon, msg);
    islandTimer = setTimeout(islandHide, ms || 1500);
  }

  // ---------- MAGIC ANIMATION (hullámzó tenger) ----------
  // Küldéskor a beviteli sáv hullámzó tengerré változik,
  // a válasz megérkezésekor (és a felolvasás végén) elsüllyed.

  var ANIM_KEY = "magicai_anim";
  var animEnabled = localStorage.getItem(ANIM_KEY) !== "0"; // alapból bekapcsolva
  var oceanEl = null;

  function oceanRise() {
    if (!animEnabled || !oceanEl) return;
    oceanEl.classList.add("show");
  }

  function oceanSink() {
    if (oceanEl) oceanEl.classList.remove("show");
  }

  // ---------- FELOLVASÁS (beszélő fej) ----------
  // A böngésző beszédszintézisével felolvassuk a válaszokat.
  // Amíg beszél, a tenger felett egy buborékban mosolygó fej
  // mozgatja a száját, a tenger pedig csak utána süllyed el.

  var SPEAK_KEY = "magicai_speak";
  var speakEnabled = localStorage.getItem(SPEAK_KEY) === "1"; // alapból kikapcsolva
  var faceEl = null, faceMouthEl = null;
  var mouthTimer = null, speechWatch = null;
  var speakSession = 0;

  function speechSupported() { return "speechSynthesis" in window; }

  function pickHuVoice() {
    var voices = speechSynthesis.getVoices();
    for (var i = 0; i < voices.length; i++) {
      if (/^hu/i.test(voices[i].lang)) return voices[i];
    }
    return null;
  }

  // Felolvasásra alkalmas tiszta szöveg: formázás, emoji, link nélkül
  function cleanForSpeech(text) {
    return text
      .replace(/\*\*/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(EMOJI_RE, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function mouthPulse() {
    if (faceMouthEl) faceMouthEl.setAttribute("ry", (2.5 + Math.random() * 3.5).toFixed(1));
  }

  function startTalkingFace() {
    if (!faceEl) return;
    faceEl.classList.add("show", "talking");
    clearInterval(mouthTimer);
    mouthTimer = setInterval(function () {
      // néha becsukja, néha máshogy nyitja – így tűnik élő beszédnek
      if (Math.random() < 0.25) {
        if (faceMouthEl) faceMouthEl.setAttribute("ry", "1.2");
      } else {
        mouthPulse();
      }
    }, 130);
  }

  function stopTalkingFace() {
    clearInterval(mouthTimer);
    mouthTimer = null;
    clearInterval(speechWatch);
    speechWatch = null;
    if (faceEl) faceEl.classList.remove("show", "talking");
  }

  function stopSpeaking() {
    speakSession++;
    if (speechSupported()) speechSynthesis.cancel();
    stopTalkingFace();
  }

  // Felolvassa a szöveget; true, ha tényleg elindult a beszéd
  function speakText(text) {
    if (!speakEnabled || !speechSupported()) return false;
    var clean = cleanForSpeech(text);
    if (!clean) return false;

    var session = ++speakSession;     // az előző beszéd "lejárt"
    speechSynthesis.cancel();
    clearInterval(speechWatch);

    var u = new SpeechSynthesisUtterance(clean);
    u.lang = "hu-HU";
    var voice = pickHuVoice();
    if (voice) u.voice = voice;

    function finish() {
      if (session !== speakSession) return; // közben új beszéd indult
      stopTalkingFace();
      oceanSink();
    }

    u.onstart = startTalkingFace;
    u.onboundary = mouthPulse;       // szóhatáronként mozdul a száj
    u.onend = finish;
    u.onerror = finish;
    speechSynthesis.speak(u);

    // Őrszem: ha a böngésző elakad (vagy nem indul el a hang), akkor is
    // elsüllyed a tenger; közben a Chrome elnémulás-hibáját is kezeli.
    speechWatch = setInterval(function () {
      if (session !== speakSession) { clearInterval(speechWatch); return; }
      if (!speechSynthesis.speaking && !speechSynthesis.pending) finish();
      else speechSynthesis.resume();
    }, 600);

    return true;
  }

  // Minden bot-válasz ezen megy át: felolvasás, majd a tenger elsüllyesztése
  function afterBotReply(text) {
    if (!speakText(text)) oceanSink();
  }

  // ---------- FELÜLET ----------

  var chatEl, inputEl, sendBtn, typingEl;
  var lastUserQuestion = "";

  function $(id) { return document.getElementById(id); }

  function scrollToBottom() {
    chatEl.scrollTop = chatEl.scrollHeight;
  }

  function formatText(text) {
    // Egyszerű formázás: **félkövér** és sortörések
    var safe = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*\n]+?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
    return safe;
  }

  // ---------- ELŐZŐ CHATEK (munkamenetek) ----------
  // Minden beszélgetést a bejelentkezett felhasználóhoz kötve, helyben tárolunk.
  // Munkamenet: { id, title, messages:[{r,t,o}], created, updated }.
  // Egy munkamenet csak az ELSŐ felhasználói üzenetnél mentődik el (üdvözlő-only nem).

  var currentSession = null;
  var restoring = false; // visszatöltéskor true → ne rögzítsünk újra

  function chatsKey() {
    return "magicai_chats_" + (window.MagicAuth ? window.MagicAuth.userKey() : "guest");
  }
  function loadChats() {
    try { return JSON.parse(localStorage.getItem(chatsKey())) || []; }
    catch (e) { return []; }
  }
  function saveChats(list) {
    try { localStorage.setItem(chatsKey(), JSON.stringify(list)); } catch (e) {}
  }
  function freshSession() {
    return {
      id: "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: "", messages: [], created: Date.now(), updated: Date.now()
    };
  }
  function persistSession() {
    if (!currentSession) return;
    var all = loadChats(), i = -1;
    for (var k = 0; k < all.length; k++) { if (all[k].id === currentSession.id) { i = k; break; } }
    if (i === -1) all.unshift(currentSession); else all[i] = currentSession;
    saveChats(all);
  }
  // Egy elküldött/megjelent üzenet rögzítése az aktuális munkamenetbe
  function recordMessage(role, text, opts) {
    if (restoring) return;
    if (!window.MagicAuth || !window.MagicAuth.current()) return;
    if (!currentSession) currentSession = freshSession();
    var o = null;
    if (opts) {
      o = {};
      if (opts.source) o.source = opts.source;
      if (opts.link) o.link = opts.link;
      if (opts.links) o.links = opts.links;
      if (!o.source && !o.link && !o.links) o = null;
    }
    currentSession.messages.push({ r: role, t: text, o: o });
    currentSession.updated = Date.now();
    if (role === "user" && !currentSession.title) {
      currentSession.title = text.replace(/\s+/g, " ").trim().slice(0, 60);
    }
    if (currentSession.title) persistSession(); // csak valódi tartalomnál mentünk
  }
  // A legutóbbi bot-üzenet szövegének frissítése (streamelt AI-válasz véglegesítésekor)
  function patchLastBot(text) {
    if (restoring || !currentSession) return;
    for (var i = currentSession.messages.length - 1; i >= 0; i--) {
      if (currentSession.messages[i].r === "bot") { currentSession.messages[i].t = text; break; }
    }
    currentSession.updated = Date.now();
    if (currentSession.title) persistSession();
  }
  // Egy mentett munkamenet visszatöltése a chat-ablakba (és folytathatóvá tétele)
  function openSession(id) {
    var all = loadChats(), s = null;
    for (var k = 0; k < all.length; k++) { if (all[k].id === id) { s = all[k]; break; } }
    if (!s) return;
    stopSpeaking();
    currentSession = s;
    chatEl.innerHTML = "";
    restoring = true;
    s.messages.forEach(function (m) {
      if (m.r === "user") addUserMessage(m.t);
      else addBotMessage(m.t, Object.assign({ silent: true }, m.o || {}));
    });
    restoring = false;
    scrollToBottom();
  }
  // Friss beszélgetés indítása (üres ablak + üdvözlő)
  function startNewSession() {
    stopSpeaking();
    currentSession = freshSession();
    chatEl.innerHTML = "";
    addGreeting();
    if (inputEl) inputEl.focus();
  }
  // Üdvözlő üzenet – a megszólítással (becenév) személyre szabva
  // Köszöntők a rendszernyelven – ha a teljes rendszert átállítjuk egy nyelvre,
  // az AI is azon a nyelven köszön (és onnantól azon a nyelven is válaszol).
  var GREET_HI = { hu: "Szia", en: "Hi", de: "Hallo", ru: "Привет", pt: "Olá", es: "Hola", fr: "Salut", it: "Ciao" };
  var GREET = {
    hu: "Én vagyok a **Magic AI** – a saját fejlesztésű AI-d. Mindenre a böngészőben futó **AI-modell** válaszol a beállított nyelven, és ha kell, **utánanézek az interneten** 🌐. A felső sávban ott a **🤖 AI-modell**, a **📜 Előző chatek** és a **👥 Group** is. Jó beszélgetést! 🪄",
    en: "I'm **Magic AI** – your own AI. Everything is answered by the **AI model** running in your browser, in your chosen language, and if needed I **look it up online** 🌐. In the top bar you'll find **🤖 AI model**, **📜 Previous chats** and **👥 Group**. Enjoy! 🪄",
    de: "Ich bin **Magic AI** – deine eigene KI. Alles beantwortet das **KI-Modell** in deinem Browser, in der eingestellten Sprache, und bei Bedarf **schaue ich online nach** 🌐. Oben findest du **🤖 KI-Modell**, **📜 Frühere Chats** und **👥 Gruppe**. Viel Spaß! 🪄",
    ru: "Я **Magic AI** – твой личный ИИ. На всё отвечает **ИИ-модель** в твоём браузере на выбранном языке, а при необходимости я **ищу в интернете** 🌐. На верхней панели есть **🤖 ИИ-модель**, **📜 Прошлые чаты** и **👥 Группа**. Приятного общения! 🪄",
    pt: "Sou o **Magic AI** – a tua própria IA. Tudo é respondido pelo **modelo de IA** no teu navegador, no idioma escolhido, e se precisar **procuro na internet** 🌐. Na barra superior tens **🤖 Modelo de IA**, **📜 Conversas anteriores** e **👥 Grupo**. Boa conversa! 🪄",
    es: "Soy **Magic AI** – tu propia IA. Todo lo responde el **modelo de IA** en tu navegador, en el idioma elegido, y si hace falta **lo busco en internet** 🌐. En la barra superior tienes **🤖 Modelo de IA**, **📜 Chats anteriores** y **👥 Grupo**. ¡Buena charla! 🪄",
    fr: "Je suis **Magic AI** – ta propre IA. Tout est traité par le **modèle d'IA** dans ton navigateur, dans la langue choisie, et si besoin je **cherche sur internet** 🌐. Dans la barre du haut : **🤖 Modèle d'IA**, **📜 Chats précédents** et **👥 Groupe**. Bonne discussion ! 🪄",
    it: "Sono **Magic AI** – la tua IA personale. A tutto risponde il **modello IA** nel tuo browser, nella lingua scelta, e se serve **cerco su internet** 🌐. Nella barra in alto trovi **🤖 Modello IA**, **📜 Chat precedenti** e **👥 Gruppo**. Buona chiacchierata! 🪄"
  };

  function addGreeting() {
    var c = window.MagicAuth && window.MagicAuth.current();
    var nick = (c && c.nick) ? c.nick : null;
    var lang = getLang();
    var hiWord = GREET_HI[lang] || GREET_HI.hu;
    var hi = nick ? (hiWord + ", **" + nick + "**! 👋 ") : (hiWord + "! 👋 ");
    var seenVersion = null;
    try { seenVersion = localStorage.getItem(VERSION_KEY); } catch (e) {}
    // „Mi újult meg" csak magyar nyelven és csak az első megnyitáskor; minden
    // más esetben a rendszernyelvű köszöntő (így nem magyarul fogad idegen nyelven).
    if (lang === "hu" && seenVersion !== APP_VERSION) {
      addBotMessage(
        hi + "🎉 **Megújult a Magic AI!** 🪄\n\n" +
        "Mi újult meg most:\n" +
        "• 🧠 **Nagyobb, okosabb modellek** – pontosabb tudás és **sokkal jobb többnyelvűség**.\n" +
        "• 🌐 **Állítható rendszernyelv** a Beállításokban: magyar, **angol, német, orosz, portugál, spanyol, francia, olasz**. Az AI ezen a nyelven beszél, és a netes keresés is ezt használja – az angol szavakat is hibátlanul írja.\n" +
        "• 🔋 **Energiatakarékos mód:** kevésbé terheli a gépet és kevesebb energiát fogyaszt.\n\n" +
        "Ha még nincs betöltve modell, a felső sávban a **🤖 AI-modell** gombnál töltheted le egyszer. Kérdezz bátran! 😊",
        {}
      );
    } else {
      addBotMessage(hi + (GREET[lang] || GREET.hu), {});
    }
  }

  function addUserMessage(text) {
    var row = document.createElement("div");
    row.className = "msg-row user";
    row.innerHTML = '<div class="bubble user-bubble">' + formatText(text) + "</div>";
    chatEl.appendChild(row);
    recordMessage("user", text);
    scrollToBottom();
  }

  function addBotMessage(text, opts) {
    opts = opts || {};
    var row = document.createElement("div");
    row.className = "msg-row bot";

    var html = '<div class="avatar">🪄</div><div class="bubble-wrap">';
    html += '<div class="bubble bot-bubble">' + formatText(text) + "</div>";

    if (opts.link) {
      html += '<a class="wiki-link" href="' + opts.link.replace(/"/g, "&quot;") +
        '" target="_blank" rel="noopener">📖 Teljes cikk megnyitása</a>';
    }
    if (opts.links) {
      opts.links.forEach(function (l) {
        html += '<a class="wiki-link" href="' + l.url.replace(/"/g, "&quot;") +
          '" target="_blank" rel="noopener">' + l.label + "</a>";
      });
    }

    var tag = "";
    if (opts.source === "learned") {
      tag = (opts.entry && opts.entry.confirmed)
        ? '<span class="source-tag">🎓 tanult ✓ megerősítve</span>'
        : '<span class="source-tag warn-tag">🎓 tanult • nem megerősített</span>';
    } else if (opts.source === "wiki") {
      tag = '<span class="source-tag">🌐 Wikipédia</span>';
    } else if (opts.source === "wiki-en") {
      tag = '<span class="source-tag">🌐 angol Wikipédia</span>';
    } else if (opts.source && opts.source.indexOf("wiki-") === 0) {
      tag = '<span class="source-tag">🌐 Wikipédia (' + opts.source.slice(5) + ")</span>";
    } else if (opts.source === "ddg") {
      tag = '<span class="source-tag">🦆 DuckDuckGo</span>';
    } else if (opts.source === "news") {
      tag = '<span class="source-tag">📰 friss cikkek</span>';
    } else if (opts.source === "sites") {
      tag = '<span class="source-tag">🔗 ajánlott weboldalak</span>';
    } else if (opts.source === "weather") {
      tag = '<span class="source-tag">⛅ élő időjárás-adat</span>';
    } else if (opts.source === "ai") {
      tag = '<span class="source-tag">✨ helyi AI-modell</span>';
    } else if (opts.source === "ai-web") {
      tag = '<span class="source-tag">✨ AI + 🌐 internet</span>';
    }

    if (opts.feedback) {
      html += '<div class="feedback">' +
        '<button class="fb-btn fb-up" title="Jó válasz">👍</button>' +
        '<button class="fb-btn fb-down" title="Rossz válasz – kijavítom">👎</button>' +
        tag +
        "</div>";
    } else if (tag) {
      html += '<div class="feedback">' + tag + "</div>";
    }
    if (opts.teachOffer) {
      html += '<div class="teach-offer"><button class="btn-small btn-teach-now">✏️ Megtanítom neki</button></div>';
    }
    html += "</div>";
    row.innerHTML = html;
    chatEl.appendChild(row);

    var question = opts.question || "";

    var up = row.querySelector(".fb-up");
    var down = row.querySelector(".fb-down");
    if (up) up.addEventListener("click", function () {
      if (opts.source === "learned" && opts.entry) {
        confirmLearned(opts.entry.q);
        row.querySelector(".feedback").innerHTML =
          '<span class="fb-thanks">Köszi, megerősítetted! ✅ Mostantól jobban bízom ebben a válaszban.</span>';
      } else {
        row.querySelector(".feedback").innerHTML = '<span class="fb-thanks">Köszi a visszajelzést! 💜</span>';
      }
    });
    if (down) down.addEventListener("click", function () {
      openCorrectionForm(row, question);
    });

    var teachBtn = row.querySelector(".btn-teach-now");
    if (teachBtn) teachBtn.addEventListener("click", function () {
      openCorrectionForm(row, question, true);
    });

    scrollToBottom();
    if (!opts.silent) afterBotReply(text); // 🔊 felolvasás + 🌊 a tenger elsüllyesztése
    recordMessage("bot", text, opts);
    return row;
  }

  function openCorrectionForm(row, question, isTeach) {
    if (row.querySelector(".correction-form")) return;
    var form = document.createElement("div");
    form.className = "correction-form";
    form.innerHTML =
      '<div class="cf-label">' + (isTeach ? "Mit válaszoljak erre legközelebb?" : "Mi lett volna a helyes válasz?") + "</div>" +
      '<textarea class="cf-input" rows="2" placeholder="Írd ide a helyes választ..."></textarea>' +
      '<div class="cf-actions"><button class="btn-small cf-save">💾 Mentés</button>' +
      '<button class="btn-small btn-ghost cf-cancel">Mégse</button></div>';
    row.querySelector(".bubble-wrap").appendChild(form);
    var ta = form.querySelector(".cf-input");
    ta.focus();
    scrollToBottom();

    form.querySelector(".cf-cancel").addEventListener("click", function () { form.remove(); });
    form.querySelector(".cf-save").addEventListener("click", function () {
      var ans = ta.value.trim();
      if (!ans) { ta.focus(); return; }

      var vet = vetTeaching(question, ans);

      if (vet.verdict === "refuse") {
        form.remove();
        addBotMessage("Hohó, ezt inkább nem tanulom meg! 😅 Csúnya vagy értelmetlen válaszokat nem veszek fel a tudásomba.", {});
        return;
      }

      // Ha a beépített tudásával ütközik, nem hiszi el elsőre
      if (vet.verdict === "conflict" && !form.dataset.confirmed) {
        form.dataset.confirmed = "1";
        var warn = document.createElement("div");
        warn.className = "cf-warn";
        warn.innerHTML = "🤨 Hmm, az én tudásom mást mond erről:<br><em>" +
          formatText(vet.builtin) + "</em><br>Biztos, hogy mégis a te válaszodat tanuljam meg?";
        form.insertBefore(warn, form.querySelector(".cf-actions"));
        form.querySelector(".cf-save").textContent = "✔️ Igen, biztos vagyok benne";
        scrollToBottom();
        return;
      }

      teach(question, ans);
      form.remove();
      var note = vet.verdict === "conflict"
        ? "\nDe szólok: a saját tudásom mást mondott, ezért fenntartásokkal kezelem, amíg 👍-zal meg nem erősíted. 🤔"
        : "\n(Óvatosan kezelem, amíg egy 👍-zal meg nem erősíted.)";
      addBotMessage("Rendben, megjegyeztem! 🧠✨ Ha legközelebb azt kérdezed: **" + question + "**, már ezt fogom válaszolni." + note, {});
    });
  }

  function showTyping() {
    typingEl = document.createElement("div");
    typingEl.className = "msg-row bot";
    typingEl.innerHTML = '<div class="avatar">🪄</div><div class="bubble bot-bubble typing"><span></span><span></span><span></span></div>';
    chatEl.appendChild(typingEl);
    scrollToBottom();
  }

  function hideTyping() {
    if (typingEl) { typingEl.remove(); typingEl = null; }
  }

  function handleSend() {
    var text = inputEl.value.trim();
    if (!text) return;
    // Az első üzenetnél jegyezzük meg, hogy a verzió-üdvözlőt már látta
    try { localStorage.setItem(VERSION_KEY, APP_VERSION); } catch (e) {}
    inputEl.value = "";
    inputEl.style.height = "auto";
    addUserMessage(text);
    lastUserQuestion = text;

    stopSpeaking();   // ha épp beszélt, elhallgat
    oceanRise();      // 🌊 a beviteli sáv tengerré változik
    showTyping();
    islandShow("🤔", "Gondolkozom…");
    var delay = 350 + Math.random() * 500;

    // Kifejezett kérés az internetes keresésre
    var forceWeb = /^(nezz utana|keress ra|keresd meg|wiki)\b/.test(normalize(text));

    setTimeout(function () {
      // Stílusváltó parancs: "beszélj viccesen", "kalóz mód"...
      var styleCmd = parseStyleCommand(text);
      if (styleCmd) {
        hideTyping();
        islandFlash("🎭", "Stílust váltok…");
        setStyle(styleCmd);
        addBotMessage(STYLES[styleCmd].confirm, {});
        return;
      }

      // Frissítés-kérés: "van új verzió?", "keress frissítést"
      if (parseUpdateCommand(text)) {
        hideTyping();
        answerUpdateQuery(text);
        return;
      }

      // Összetett üzenet: több kérdés egyben → részekre bontjuk,
      // és egyetlen, határozott, pontokba szedett választ adunk
      var parts = forceWeb ? [text] : splitQuestions(text);
      if (parts.length > 1) {
        var partAnswers = parts.map(function (p) { return { q: p, r: findAnswer(p) }; });
        var hits = partAnswers.filter(function (x) { return x.r; }).length;
        if (hits >= 1) {
          hideTyping();
          islandFlash("🧩", "Összetett kérdés – részekre bontottam!");
          var intro = pick([
            "Ez egy összetett kérdés volt – vegyük sorra, határozottan! 💪",
            "Több dolgot is kérdeztél egyszerre, válaszolok mindegyikre! 🧠",
            "Rendben, pontról pontra megválaszolom! ✅"
          ]);
          var body = partAnswers.map(function (x, i) {
            var ans = x.r
              ? x.r.text
              : "Erre helyben nincs biztos válaszom – írd be külön, és utánanézek a neten! 🌐";
            return "**" + (i + 1) + ". " + x.q + "**\n" + ans;
          }).join("\n\n");
          addBotMessage(applyStyle(intro) + "\n\n" + body, { question: text });
          return;
        }
      }

      // Hír-kérés: friss cikkek a sajtóból
      var newsQ = forceWeb ? null : parseNewsQuery(text);
      if (newsQ) {
        islandShow("📰", "Friss cikkeket keresek…");
        fetchNews(newsQ.topic).then(function (items) {
          hideTyping();
          islandFlash("✅", "Megvan, hozom a híreket!");
          var head = newsQ.topic
            ? "Ezt írják most a sajtóban erről: **" + newsQ.topic + "** 📰"
            : "Íme a legfrissebb hírek! 📰";
          addBotMessage(applyStyle(head) + "\n\n" + newsList(items), {
            feedback: true, question: text, source: "news", links: newsLinks(items)
          });
        }).catch(function () {
          hideTyping();
          islandFlash("😕", "Nem értem el a híreket…");
          addBotMessage("Most nem érem el a hírszolgáltatást. 📰 Nézd meg, van-e internetkapcsolat, és próbáld újra!", {});
        });
        return;
      }

      // Időjárás-kérdés: élő adat az Open-Meteo-tól
      var weatherQ = forceWeb ? null : parseWeatherQuery(text);
      if (weatherQ) {
        islandShow("⛅", "Megnézem az időjárást…");
        getWeather(weatherQ.city, weatherQ.day).then(function (report) {
          hideTyping();
          islandFlash("✅", "Megvan az időjárás!");
          addBotMessage(applyStyle(report), { source: "weather", question: text });
        }).catch(function () {
          hideTyping();
          islandFlash("😕", "Nem találtam az időjárást…");
          addBotMessage(weatherQ.city
            ? "Sajnos nem találtam **" + weatherQ.city + "** nevű települést, vagy nem érem el az időjárás-szolgáltatást. 🌧️ Próbáld másképp írni a város nevét!"
            : "Most nem érem el az időjárás-szolgáltatást. 🌧️ Nézd meg, van-e internetkapcsolat!", {});
        });
        return;
      }

      // Weboldal-ajánlás: "milyen weboldalon találok recepteket?"
      var siteQ = forceWeb ? null : parseWebsiteQuery(text);
      if (siteQ) {
        hideTyping();
        islandFlash("🔗", "Összegyűjtöm a legjobb oldalakat!");
        addBotMessage(applyStyle(siteQ.intro), {
          feedback: true, question: text, source: "sites", links: siteQ.links
        });
        return;
      }

      // Személyre kérdezés: "ki az a X", "ki volt X", "mesélj X-ről".
      // Ha van betöltött AI-modell, a netes forrásra TÁMASZKODVA összefüggő,
      // magyar személyleírást fogalmaz (RAG). Modell nélkül a Wikipédia-kivonatot mutatjuk.
      var personName = forceWeb ? null : parsePersonQuery(text);
      if (personName) {
        if (chatAiEnabled()) { chatAskAIWeb(text); return; }
        islandShow("👤", "Megkeresem: " + personName + "…");
        searchWikipedia(personName, "hu")
          .then(function (w) { return { w: w, en: false }; })
          .catch(function () { return searchWikipedia(personName, "en").then(function (w) { return { w: w, en: true }; }); })
          .then(function (res) {
            hideTyping();
            islandFlash("✅", "Megvan a személy!");
            var intro = "👤 **" + res.w.title + "** – íme a személyleírás" + (res.en ? " (az angol Wikipédiáról)" : "") + ":";
            var row = addBotMessage(applyStyle(intro + "\n\n" + res.w.text),
              { feedback: true, question: text, source: res.en ? "wiki-en" : "wiki", link: res.w.url });
            maybeAttachYouTube(row, personName, "wiki");
          })
          .catch(function () {
            // a neten nem találtuk → menjen a szokásos útvonal (AI vagy web-keresés)
            if (chatAiEnabled()) { chatAskAI(text); }
            else { webSearchFallback(text, false); }
          });
        return;
      }

      var result = forceWeb ? null : findAnswer(text);
      if (result) {
        hideTyping();
        islandFlash("💡", "Megvan a válasz!");
        var row = addBotMessage(applyStyle(decorateAnswer(text, result)), {
          feedback: result.source !== "dynamic",
          question: text,
          source: result.source,
          entry: result.entry
        });
        maybeAttachYouTube(row, text, result.source);
        return;
      }

      // Rövid, beszélgetős üzenet (pl. "ok", "aha"): ilyenkor NEM keresünk
      // a neten, hanem folytatjuk a beszélgetést
      var small = forceWeb ? null : trySmallTalk(text);
      if (small) {
        hideTyping();
        islandFlash("💬", "Beszélgetünk!");
        addBotMessage(applyStyle(small), {});
        return;
      }

      // Helyben nincs kész válasz. Ha a böngészős AI-modell betöltve+engedélyezve van,
      // ŐVELE válaszolunk. A modell „eldönti az egyensúlyt": az identitás-/friss-tény
      // jellegű kérdéshez (needsWebLookup) előbb netes forrást hozunk, és arra
      // támaszkodva felel (RAG); minden másra a saját tudásából. Modell nélkül web-keresés.
      if (!forceWeb && chatAiEnabled()) {
        if (needsWebLookup(text)) chatAskAIWeb(text);
        else chatAskAI(text);
        return;
      }
      webSearchFallback(text, forceWeb);
    }, delay);
  }

  // A csevegés AI-válasza a helyi modellel, élőben (streamelve) a buborékba.
  // Ha kap `ctx`-et (internetes forrás), arra TÁMASZKODVA válaszol (RAG) – így
  // a saját tudásából nem ismert, friss tényekre (pl. közszereplők) is felel.
  function chatAskAI(text, ctx) {
    var L = window.MagicLLM;
    var grounded = !!(ctx && ctx.text);
    hideTyping();
    islandShow("✨", grounded ? "Összefoglalom a netről talált infót…" : "A helyi AI gondolkodik…");
    var row = addBotMessage("✨ …", {
      source: grounded ? "ai-web" : "ai",
      link: grounded ? ctx.url : undefined,
      feedback: true, question: text, silent: true
    });
    var bubble = row.querySelector(".bot-bubble");
    var system = grounded ? L.WEB_SYSTEM : L.CHAT_SYSTEM;
    var userMsg = grounded ? buildGroundedPrompt(text, ctx) : text;
    L.run(system, userMsg, function (full) {
      if (bubble) bubble.innerHTML = formatText(full) + ' <span class="hw-ai-caret">▍</span>';
      scrollToBottom();
    }, { temperature: grounded ? 0.4 : 0.5 }).then(function (full) {
      if (bubble) bubble.innerHTML = formatText(full);
      patchLastBot(full);
      islandFlash("✅", "Kész!");
      afterBotReply(full);
    }).catch(function () {
      // Az AI-modell nem válaszolt → essünk vissza az internetes keresésre
      if (row && row.parentNode) row.parentNode.removeChild(row);
      islandFlash("🌐", "Az AI nem felelt, keresek a neten…");
      showTyping();
      webSearchFallback(text, false);
    });
  }

  // Web-megalapozott AI-válasz: előbb lekérjük a netes forrást, majd arra
  // támaszkodva válaszol a modell. Ha a netet nem érjük el, marad a sima
  // AI-válasz (a modell saját tudásából), végső soron a webSearchFallback.
  function chatAskAIWeb(text) {
    islandShow("🌐", "Utánanézek a neten…");
    fetchWebContext(text)
      .then(function (ctx) { chatAskAI(text, ctx); })
      .catch(function () {
        if (chatAiEnabled()) chatAskAI(text);
        else webSearchFallback(text, false);
      });
  }

  // Internetes tartalék: magyar Wikipédia → angol Wikipédia → DuckDuckGo → friss cikkek
  function webSearchFallback(text, forceWeb) {
    islandShow("🌐", "Utánanézek a neten…");
    searchEncyclopedia(text)
      .catch(function () {
        return fetchNews(extractTopic(text)).then(function (items) {
          return { kind: "news", items: items };
        });
      })
      .then(function (res) {
        hideTyping();
        islandFlash("✅", "Megtaláltam!");
        if (res.kind === "news") {
          addBotMessage(
            applyStyle("Lexikonban nem találtam, de friss cikkeket igen! 📰") + "\n\n" + newsList(res.items),
            { feedback: true, question: text, source: "news", links: newsLinks(res.items) });
          return;
        }
        var intro = forceWeb ? "Utánanéztem! 🌐" : "Ezt helyben nem tudtam, ezért utánanéztem az interneten! 🌐";
        if (res.kind === "ddg") intro += "\n(A DuckDuckGo keresőben találtam ezt:)";
        if (res.kind === "wiki-en") intro += "\n(Magyarul nem találtam, de az angol Wikipédián igen:)";
        var webRow = addBotMessage(applyStyle(intro + "\n**" + res.title + "** – " + res.text),
          { feedback: true, question: text, source: res.kind, link: res.url });
        maybeAttachYouTube(webRow, text, res.kind);
      })
      .catch(function () {
        hideTyping();
        islandFlash("🙈", "Ezt nem találtam…");
        var msg = UNKNOWN_REPLIES[Math.floor(Math.random() * UNKNOWN_REPLIES.length)] +
          "\nAz interneten sem találtam róla semmit. Taníts meg rá, és soha többé nem felejtem el!";
        addBotMessage(applyStyle(msg), { teachOffer: true, question: text });
      });
  }

  // ---------- GROUP / LOBBI: AI-válasz a külön ablaknak ----------
  // A group.html külön ablak ezt hívja (window.opener.MagicAI.answer),
  // hogy a lobbiban feltett kérdésre kiszámoljuk a választ. Ugyanaz a
  // pontossági sorrend, mint a chatben: beépített tudás → helyi AI-modell
  // (ha be van töltve) → internetes keresés. Egyetlen sima szöveget ad
  // vissza (NEM streamel), hogy a lobbiba egyben beküldhető legyen.
  //
  // FONTOS (ablakok közötti hívás): a popup átad egy `onDone` callbacket a
  // SAJÁT realmjéből – ezt hívjuk meg, amikor kész a válasz. Az ablakok
  // közötti FÜGGVÉNYHÍVÁS megbízható, az ablakok közötti Promise `.then`
  // viszont nem mindig sül el → ezért a callbackre építünk (a visszaadott
  // Promise csak az azonos ablakból hívóknak, pl. a fő chatnek szól).
  function groupAnswer(text, onDone) {
    text = String(text || "").trim();
    return new Promise(function (resolve) {
      var finished = false;
      function done(res) {
        if (finished) return;
        finished = true;
        if (typeof onDone === "function") { try { onDone(res); } catch (e) {} }
        resolve(res);
      }

      if (!text) { done({ text: "Tegyél fel egy kérdést! 🙂", source: "none" }); return; }

      function viaWeb() {
        searchEncyclopedia(text)
          .then(function (r) {
            done({ text: "**" + r.title + "** – " + r.text, source: r.kind, link: r.url });
          })
          .catch(function () {
            done({ text: "Erre most nem találtam biztos választ – sem helyben, sem a neten. 🙈", source: "none" });
          });
      }

      // 1) Tanult tudás / helyi képességek (idő, számolás, a felhasználó tanított válaszai)
      var hit = findAnswer(text);
      if (hit) { done({ text: hit.text, source: hit.source }); return; }

      // 2) Helyi AI-modell, ha be van töltve. A modell dönti el az egyensúlyt:
      //    identitás-/friss-tény kérdéshez netes forrásra TÁMASZKODVA felel (RAG),
      //    minden másra a saját tudásából.
      var L = window.MagicLLM;
      if (L && L.isReady && L.isReady()) {
        // Sima (forrás nélküli) AI-válasz
        function viaAI() {
          L.run(L.CHAT_SYSTEM, text, function () {}, { temperature: 0.5 })
            .then(function (full) {
              full = String(full || "").trim();
              if (full) done({ text: full, source: "ai" });
              else viaWeb();
            })
            .catch(viaWeb);
        }
        if (needsWebLookup(text)) {
          fetchWebContext(text).then(function (ctx) {
            L.run(L.WEB_SYSTEM, buildGroundedPrompt(text, ctx), function () {}, { temperature: 0.4 })
              .then(function (full) {
                full = String(full || "").trim();
                if (full) done({ text: full, source: "ai-web", link: ctx.url });
                else viaAI();
              })
              .catch(viaAI);
          }).catch(viaAI);
        } else {
          viaAI();
        }
        return;
      }

      // 3) Internetes tartalék (modell nélkül)
      viaWeb();
    });
  }

  // ---------- TANÍTÁS FÜL ----------

  function setupTeachTab() {
    var btn = $("teach-save");
    btn.addEventListener("click", function () {
      var q = $("teach-q").value.trim();
      var a = $("teach-a").value.trim();
      var status = $("teach-status");
      if (!q || !a) {
        status.textContent = "⚠️ Mindkét mezőt töltsd ki!";
        status.className = "teach-status warn";
        return;
      }

      var vet = vetTeaching(q, a);

      if (vet.verdict === "refuse") {
        status.textContent = "🙅 Ezt nem tanulom meg – csúnya vagy értelmetlen válaszokat nem fogadok el!";
        status.className = "teach-status warn";
        btn.dataset.confirm = "";
        return;
      }

      // Ütközés a beépített tudással: csak második kattintásra hiszi el
      if (vet.verdict === "conflict" && btn.dataset.confirm !== q) {
        btn.dataset.confirm = q;
        status.textContent = "🤨 Az én tudásom mást mond erről! Ha tényleg biztos vagy benne, kattints még egyszer.";
        status.className = "teach-status warn";
        return;
      }

      btn.dataset.confirm = "";
      teach(q, a);
      $("teach-q").value = "";
      $("teach-a").value = "";
      status.textContent = "✅ Megtanultam! (Fenntartásokkal kezelem, amíg a chatben 👍-zal meg nem erősíted.)";
      status.className = "teach-status ok";
      setTimeout(function () { status.textContent = ""; }, 5000);
    });
  }

  // ---------- TUDÁSTÁR FÜL ----------

  function renderLearnedList() {
    var listEl = $("learned-list");
    if (!listEl) return;
    var filter = normalize($("learned-search").value || "");
    var learned = loadLearned();

    if (learned.length === 0) {
      listEl.innerHTML = '<div class="empty-state">Még nincs tanult tudás.<br>Taníts a Tanítás fülön, vagy javíts ki egy választ a 👎 gombbal!</div>';
      return;
    }

    var html = "";
    learned.forEach(function (e, idx) {
      if (filter && normalize(e.q + " " + e.a).indexOf(filter) === -1) return;
      var badge = e.confirmed
        ? '<span class="li-badge ok">✓ megerősítve</span>'
        : '<span class="li-badge warn">⚠ nem megerősített</span>';
      html += '<div class="learned-item">' +
        '<div class="li-texts"><div class="li-q">' + formatText(e.q) + " " + badge + '</div>' +
        '<div class="li-a">' + formatText(e.a) + "</div></div>" +
        '<button class="li-del" data-idx="' + idx + '" title="Törlés">🗑️</button></div>';
    });
    listEl.innerHTML = html || '<div class="empty-state">Nincs találat a keresésre.</div>';

    listEl.querySelectorAll(".li-del").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var list = loadLearned();
        list.splice(parseInt(btn.getAttribute("data-idx"), 10), 1);
        saveLearned(list);
      });
    });
  }

  function setupKnowledgeTab() {
    $("learned-search").addEventListener("input", renderLearnedList);

    $("btn-export").addEventListener("click", function () {
      var data = JSON.stringify(loadLearned(), null, 2);
      var blob = new Blob([data], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "magic-ai-tudas.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });

    $("btn-import").addEventListener("click", function () { $("import-file").click(); });
    $("import-file").addEventListener("change", function (ev) {
      var file = ev.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var incoming = JSON.parse(reader.result);
          if (!Array.isArray(incoming)) throw new Error("rossz formátum");
          var list = loadLearned();
          incoming.forEach(function (e) {
            if (e && e.q && e.a) {
              var nq = normalize(e.q);
              var ex = list.findIndex(function (x) { return normalize(x.q) === nq; });
              if (ex !== -1) list[ex] = e; else list.push(e);
            }
          });
          saveLearned(list);
          alert("Sikeres importálás! 🎉");
        } catch (err) {
          alert("Hibás fájl – csak a Magic AI által exportált JSON-t tudom beolvasni.");
        }
      };
      reader.readAsText(file);
      ev.target.value = "";
    });

    $("btn-clear-all").addEventListener("click", function () {
      if (loadLearned().length === 0) return;
      if (confirm("Biztosan törlöd az ÖSSZES tanult tudást? Ez nem vonható vissza!")) {
        saveLearned([]);
      }
    });
  }

  // ---------- STATISZTIKA, FÜLEK, TÉMA ----------

  function updateStats() {
    // A fejléc bal oldali számlálója MOST az AI-modell állapotát mutatja
    // (a beépített tudástéma-számláló megszűnt a tudásbázissal együtt).
    var kbEl = $("stat-kb");
    if (kbEl) {
      var L = window.MagicLLM;
      if (L && L.isReady && L.isReady()) {
        kbEl.textContent = (L.currentModel && tierOfModel(L.currentModel())) || "kész";
      } else if (L && L.supported && L.supported()) {
        kbEl.textContent = "tölthető";
      } else {
        kbEl.textContent = "–";
      }
    }
    var lrn = $("stat-learned");
    if (lrn) lrn.textContent = loadLearned().length;
  }

  // Csúszó jelölő a fülsávban: az aktív fül alá siklik
  var gliderEl = null, gliderShineTimer = null;
  var moveAuthGlider = null; // a belépő-fülek („Bejelentkezés”/„Regisztráció”) csúszkája

  // Általános csúszó-jelölő bármely szegmens-fülsávhoz (ugyanaz az élmény,
  // mint a fő füleknél). Visszaad egy move(animate) függvényt.
  function attachGlider(bar, btnSelector, cls) {
    if (!bar) return null;
    var glider = document.createElement("span");
    glider.className = cls;
    glider.setAttribute("aria-hidden", "true");
    bar.insertBefore(glider, bar.firstChild);
    bar.classList.add("has-glider");
    var shineTimer = null;
    return function move(animate) {
      var active = bar.querySelector(btnSelector + ".active");
      if (!active) return;
      if (!animate) glider.style.transition = "none";
      glider.style.left = active.offsetLeft + "px";
      glider.style.width = active.offsetWidth + "px";
      if (!animate) {
        requestAnimationFrame(function () { glider.style.transition = ""; });
      } else {
        glider.classList.remove("gliding");
        void glider.offsetWidth;
        glider.classList.add("gliding");
        clearTimeout(shineTimer);
        shineTimer = setTimeout(function () { glider.classList.remove("gliding"); }, 1000);
      }
    };
  }

  function moveGlider(animate) {
    var bar = document.querySelector(".tabs");
    var active = document.querySelector(".tab-btn.active");
    if (!gliderEl || !bar || !active) return;
    if (!animate) gliderEl.style.transition = "none";
    gliderEl.style.left = active.offsetLeft + "px";
    gliderEl.style.width = active.offsetWidth + "px";
    if (!animate) {
      // visszakapcsoljuk az átmenetet a következő képkockán
      requestAnimationFrame(function () { gliderEl.style.transition = ""; });
    } else {
      gliderEl.classList.remove("gliding");
      void gliderEl.offsetWidth; // a fénycsík-animáció újraindításához
      gliderEl.classList.add("gliding");
      clearTimeout(gliderShineTimer);
      gliderShineTimer = setTimeout(function () {
        gliderEl.classList.remove("gliding");
      }, 1000);
    }
  }

  function setupTabs() {
    var bar = document.querySelector(".tabs");
    var tabs = document.querySelectorAll(".tab-btn");

    gliderEl = document.createElement("span");
    gliderEl.className = "tab-glider";
    gliderEl.setAttribute("aria-hidden", "true");
    bar.insertBefore(gliderEl, bar.firstChild);
    bar.classList.add("has-glider");
    moveGlider(false);

    // Betöltéskor (betűtípus, méret) és átméretezéskor is a helyén maradjon
    window.addEventListener("resize", function () { moveGlider(false); });
    window.addEventListener("load", function () { moveGlider(false); });

    tabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        tabs.forEach(function (b) { b.classList.remove("active"); });
        document.querySelectorAll(".tab-panel").forEach(function (p) { p.classList.remove("active"); });
        btn.classList.add("active");
        $(btn.getAttribute("data-tab")).classList.add("active");
        moveGlider(true);
        if (btn.getAttribute("data-tab") === "tab-knowledge") renderLearnedList();
        if (btn.getAttribute("data-tab") === "tab-chat") inputEl.focus();
      });
    });
  }

  function setTheme(mode) {
    document.body.classList.toggle("dark", mode === "dark");
    localStorage.setItem(THEME_KEY, mode);
    document.querySelectorAll(".theme-chip").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-theme") === mode);
    });
  }

  // ============================================================
  //  RENDSZERNYELV (i18n) – a felület és a válasznyelv beállítása
  //  A `data-i18n` / `data-i18n-ph` attribútummal jelölt elemek
  //  szövegét cseréljük. Ami nincs lefordítva, marad magyarul.
  // ============================================================
  var I18N = {
    hu: {
      tab_chat: "💬 Beszélgetés", tab_teach: "✏️ Tanítás", tab_knowledge: "🧠 Tudástár",
      tab_settings: "⚙️ Beállítások", tab_admin: "🛡️ Admin",
      extras_label: "✨ Extra funkciók", extra_newchat: "➕ Új chat", extra_history: "📜 Előző chatek",
      extra_group: "👥 Group", extra_homework: "✍️ Házi feladat", extra_aimodel: "🤖 AI-modell",
      stat_model: "AI-modell", stat_learned: "tanult tudás",
      chat_ph: "Írj egy üzenetet... (Enter = küldés)",
      set_title: "⚙️ Beállítások", set_account: "👤 Fiók", set_theme: "🎨 Téma",
      theme_light: "☀️ Világos", theme_dark: "🌙 Sötét",
      set_lang: "🌐 Nyelv / Language",
      set_lang_desc: "Válaszd ki a rendszer nyelvét. Az AI ezen a nyelven válaszol, és az internetes keresés is ezt használja.",
      set_style: "🎭 Beszédstílus", set_island: "🏝️ Magic Island", set_anim: "🌊 Magic Animation",
      set_eco: "🔋 Energiatakarékos mód",
      set_eco_desc: "Csökkenti a látványos animációkat (háttér, hullámok) és rövidebb AI-válaszokat kér, így kevesebbet terheli a gépet és kevesebb energiát fogyaszt.",
      set_update: "🔄 Frissítés", set_speak: "🔊 Felolvasás",
      _flash: "🌐 Nyelv beállítva!"
    },
    en: {
      tab_chat: "💬 Chat", tab_teach: "✏️ Teach", tab_knowledge: "🧠 Knowledge",
      tab_settings: "⚙️ Settings", tab_admin: "🛡️ Admin",
      extras_label: "✨ Extra features", extra_newchat: "➕ New chat", extra_history: "📜 Previous chats",
      extra_group: "👥 Group", extra_homework: "✍️ Homework", extra_aimodel: "🤖 AI model",
      stat_model: "AI model", stat_learned: "learned facts",
      chat_ph: "Write a message... (Enter = send)",
      set_title: "⚙️ Settings", set_account: "👤 Account", set_theme: "🎨 Theme",
      theme_light: "☀️ Light", theme_dark: "🌙 Dark",
      set_lang: "🌐 Language",
      set_lang_desc: "Choose the system language. The AI replies in this language, and web search uses it too.",
      set_style: "🎭 Speaking style", set_island: "🏝️ Magic Island", set_anim: "🌊 Magic Animation",
      set_eco: "🔋 Energy saver",
      set_eco_desc: "Reduces fancy animations (background, waves) and asks for shorter AI answers, so it uses less of your machine and less energy.",
      set_update: "🔄 Update", set_speak: "🔊 Read aloud",
      _flash: "🌐 Language set to English!"
    },
    de: {
      tab_chat: "💬 Chat", tab_teach: "✏️ Lernen", tab_knowledge: "🧠 Wissen",
      tab_settings: "⚙️ Einstellungen", tab_admin: "🛡️ Admin",
      extras_label: "✨ Extra-Funktionen", extra_newchat: "➕ Neuer Chat", extra_history: "📜 Frühere Chats",
      extra_group: "👥 Gruppe", extra_homework: "✍️ Hausaufgaben", extra_aimodel: "🤖 KI-Modell",
      stat_model: "KI-Modell", stat_learned: "Gelerntes",
      chat_ph: "Schreibe eine Nachricht... (Enter = senden)",
      set_title: "⚙️ Einstellungen", set_account: "👤 Konto", set_theme: "🎨 Design",
      theme_light: "☀️ Hell", theme_dark: "🌙 Dunkel",
      set_lang: "🌐 Sprache",
      set_lang_desc: "Wähle die Systemsprache. Die KI antwortet in dieser Sprache, und auch die Websuche verwendet sie.",
      set_style: "🎭 Sprechstil", set_island: "🏝️ Magic Island", set_anim: "🌊 Magic Animation",
      set_eco: "🔋 Energiesparmodus",
      set_eco_desc: "Reduziert aufwendige Animationen (Hintergrund, Wellen) und kürzere KI-Antworten, so wird der Rechner weniger belastet und weniger Energie verbraucht.",
      set_update: "🔄 Update", set_speak: "🔊 Vorlesen",
      _flash: "🌐 Sprache auf Deutsch gesetzt!"
    },
    ru: {
      tab_chat: "💬 Чат", tab_teach: "✏️ Обучение", tab_knowledge: "🧠 База знаний",
      tab_settings: "⚙️ Настройки", tab_admin: "🛡️ Админ",
      extras_label: "✨ Доп. функции", extra_newchat: "➕ Новый чат", extra_history: "📜 Прошлые чаты",
      extra_group: "👥 Группа", extra_homework: "✍️ Домашка", extra_aimodel: "🤖 ИИ-модель",
      stat_model: "ИИ-модель", stat_learned: "выучено",
      chat_ph: "Напишите сообщение... (Enter = отправить)",
      set_title: "⚙️ Настройки", set_account: "👤 Аккаунт", set_theme: "🎨 Тема",
      theme_light: "☀️ Светлая", theme_dark: "🌙 Тёмная",
      set_lang: "🌐 Язык",
      set_lang_desc: "Выберите язык системы. ИИ отвечает на этом языке, и поиск в интернете тоже его использует.",
      set_style: "🎭 Стиль речи", set_island: "🏝️ Magic Island", set_anim: "🌊 Magic Animation",
      set_eco: "🔋 Энергосбережение",
      set_eco_desc: "Уменьшает эффектные анимации (фон, волны) и запрашивает более короткие ответы ИИ, поэтому меньше нагружает компьютер и расходует меньше энергии.",
      set_update: "🔄 Обновление", set_speak: "🔊 Озвучивание",
      _flash: "🌐 Язык: русский!"
    },
    pt: {
      tab_chat: "💬 Conversa", tab_teach: "✏️ Ensinar", tab_knowledge: "🧠 Conhecimento",
      tab_settings: "⚙️ Definições", tab_admin: "🛡️ Admin",
      extras_label: "✨ Funções extra", extra_newchat: "➕ Nova conversa", extra_history: "📜 Conversas anteriores",
      extra_group: "👥 Grupo", extra_homework: "✍️ Trabalho de casa", extra_aimodel: "🤖 Modelo de IA",
      stat_model: "Modelo de IA", stat_learned: "aprendido",
      chat_ph: "Escreve uma mensagem... (Enter = enviar)",
      set_title: "⚙️ Definições", set_account: "👤 Conta", set_theme: "🎨 Tema",
      theme_light: "☀️ Claro", theme_dark: "🌙 Escuro",
      set_lang: "🌐 Idioma",
      set_lang_desc: "Escolhe o idioma do sistema. A IA responde neste idioma, e a pesquisa na internet também o usa.",
      set_style: "🎭 Estilo de fala", set_island: "🏝️ Magic Island", set_anim: "🌊 Magic Animation",
      set_eco: "🔋 Poupança de energia",
      set_eco_desc: "Reduz as animações vistosas (fundo, ondas) e pede respostas de IA mais curtas, usando menos o computador e menos energia.",
      set_update: "🔄 Atualização", set_speak: "🔊 Ler em voz alta",
      _flash: "🌐 Idioma: português!"
    },
    es: {
      tab_chat: "💬 Chat", tab_teach: "✏️ Enseñar", tab_knowledge: "🧠 Conocimiento",
      tab_settings: "⚙️ Ajustes", tab_admin: "🛡️ Admin",
      extras_label: "✨ Funciones extra", extra_newchat: "➕ Nuevo chat", extra_history: "📜 Chats anteriores",
      extra_group: "👥 Grupo", extra_homework: "✍️ Deberes", extra_aimodel: "🤖 Modelo de IA",
      stat_model: "Modelo de IA", stat_learned: "aprendido",
      chat_ph: "Escribe un mensaje... (Enter = enviar)",
      set_title: "⚙️ Ajustes", set_account: "👤 Cuenta", set_theme: "🎨 Tema",
      theme_light: "☀️ Claro", theme_dark: "🌙 Oscuro",
      set_lang: "🌐 Idioma",
      set_lang_desc: "Elige el idioma del sistema. La IA responde en este idioma, y la búsqueda en internet también lo usa.",
      set_style: "🎭 Estilo de habla", set_island: "🏝️ Magic Island", set_anim: "🌊 Magic Animation",
      set_eco: "🔋 Ahorro de energía",
      set_eco_desc: "Reduce las animaciones vistosas (fondo, olas) y pide respuestas de IA más cortas, usando menos el equipo y menos energía.",
      set_update: "🔄 Actualización", set_speak: "🔊 Leer en voz alta",
      _flash: "🌐 ¡Idioma: español!"
    },
    fr: {
      tab_chat: "💬 Discussion", tab_teach: "✏️ Apprendre", tab_knowledge: "🧠 Connaissances",
      tab_settings: "⚙️ Paramètres", tab_admin: "🛡️ Admin",
      extras_label: "✨ Fonctions extra", extra_newchat: "➕ Nouveau chat", extra_history: "📜 Chats précédents",
      extra_group: "👥 Groupe", extra_homework: "✍️ Devoirs", extra_aimodel: "🤖 Modèle d'IA",
      stat_model: "Modèle d'IA", stat_learned: "appris",
      chat_ph: "Écris un message... (Entrée = envoyer)",
      set_title: "⚙️ Paramètres", set_account: "👤 Compte", set_theme: "🎨 Thème",
      theme_light: "☀️ Clair", theme_dark: "🌙 Sombre",
      set_lang: "🌐 Langue",
      set_lang_desc: "Choisis la langue du système. L'IA répond dans cette langue, et la recherche web l'utilise aussi.",
      set_style: "🎭 Style de parole", set_island: "🏝️ Magic Island", set_anim: "🌊 Magic Animation",
      set_eco: "🔋 Économie d'énergie",
      set_eco_desc: "Réduit les animations spectaculaires (fond, vagues) et demande des réponses d'IA plus courtes, ce qui sollicite moins l'ordinateur et consomme moins d'énergie.",
      set_update: "🔄 Mise à jour", set_speak: "🔊 Lecture à voix haute",
      _flash: "🌐 Langue : français !"
    },
    it: {
      tab_chat: "💬 Chat", tab_teach: "✏️ Insegna", tab_knowledge: "🧠 Conoscenze",
      tab_settings: "⚙️ Impostazioni", tab_admin: "🛡️ Admin",
      extras_label: "✨ Funzioni extra", extra_newchat: "➕ Nuova chat", extra_history: "📜 Chat precedenti",
      extra_group: "👥 Gruppo", extra_homework: "✍️ Compiti", extra_aimodel: "🤖 Modello IA",
      stat_model: "Modello IA", stat_learned: "appreso",
      chat_ph: "Scrivi un messaggio... (Invio = invia)",
      set_title: "⚙️ Impostazioni", set_account: "👤 Account", set_theme: "🎨 Tema",
      theme_light: "☀️ Chiaro", theme_dark: "🌙 Scuro",
      set_lang: "🌐 Lingua",
      set_lang_desc: "Scegli la lingua del sistema. L'IA risponde in questa lingua e anche la ricerca web la usa.",
      set_style: "🎭 Stile di parlato", set_island: "🏝️ Magic Island", set_anim: "🌊 Magic Animation",
      set_eco: "🔋 Risparmio energetico",
      set_eco_desc: "Riduce le animazioni vistose (sfondo, onde) e chiede risposte IA più brevi, così usa meno il computer e meno energia.",
      set_update: "🔄 Aggiornamento", set_speak: "🔊 Lettura ad alta voce",
      _flash: "🌐 Lingua: italiano!"
    }
  };

  // A felirat-cserék alkalmazása az aktuális nyelvre (a hiányzó kulcs marad magyarul)
  function applyLang(code) {
    var dict = I18N[code] || I18N.hu;
    var base = I18N.hu;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      var v = (dict[k] != null) ? dict[k] : base[k];
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var k = el.getAttribute("data-i18n-ph");
      var v = (dict[k] != null) ? dict[k] : base[k];
      if (v != null) el.setAttribute("placeholder", v);
    });
    try { document.documentElement.setAttribute("lang", code); } catch (e) {}
    moveGlider(false); // a fülek csúszkája igazodjon az új feliratszélességhez
  }

  function setupLang() {
    var sel = $("lang-select");
    if (!sel) { applyLang(getLang()); return; }
    sel.value = getLang();
    applyLang(sel.value);
    sel.addEventListener("change", function () {
      var code = sel.value;
      if (window.MagicLLM && window.MagicLLM.setLang) window.MagicLLM.setLang(code);
      try { localStorage.setItem(LANG_KEY, code); } catch (e) {}
      applyLang(code);
      var msg = (I18N[code] && I18N[code]._flash) || "🌐 Nyelv beállítva!";
      if (typeof islandFlash === "function") islandFlash("🌐", msg, 2200);
    });
  }

  // ENERGIATAKARÉKOS mód: a látványos animációkat a `body.eco` osztály kapcsolja
  // ki a CSS-ben; az AI rövidebb választ ad (lásd ai.js ecoOn()).
  function applyEco(on) {
    document.body.classList.toggle("eco", !!on);
    if (on && typeof oceanSink === "function") oceanSink();
  }

  function setupSettings() {
    // Téma
    setTheme(localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light");
    document.querySelectorAll(".theme-chip").forEach(function (btn) {
      btn.addEventListener("click", function () { setTheme(btn.getAttribute("data-theme")); });
    });

    // Magic Island kapcsoló
    var toggle = $("island-toggle");
    toggle.checked = islandEnabled;
    toggle.addEventListener("change", function () {
      islandEnabled = toggle.checked;
      localStorage.setItem(ISLAND_KEY, islandEnabled ? "1" : "0");
      if (islandEnabled) islandFlash("🏝️", "Magic Island bekapcsolva!", 2000);
      else islandHide();
    });

    // Magic Animation kapcsoló (hullámzó tenger)
    var animToggle = $("anim-toggle");
    animToggle.checked = animEnabled;
    animToggle.addEventListener("change", function () {
      animEnabled = animToggle.checked;
      localStorage.setItem(ANIM_KEY, animEnabled ? "1" : "0");
      if (animEnabled) {
        islandFlash("🌊", "Magic Animation bekapcsolva!", 2000);
      } else {
        oceanSink();
        islandFlash("🌊", "Magic Animation kikapcsolva.", 2000);
      }
    });

    // Energiatakarékos mód kapcsoló
    var ecoToggle = $("eco-toggle");
    if (ecoToggle) {
      var ecoOn = localStorage.getItem(ECO_KEY) === "1";
      ecoToggle.checked = ecoOn;
      applyEco(ecoOn);
      ecoToggle.addEventListener("change", function () {
        localStorage.setItem(ECO_KEY, ecoToggle.checked ? "1" : "0");
        applyEco(ecoToggle.checked);
        islandFlash("🔋", ecoToggle.checked
          ? "Energiatakarékos mód bekapcsolva!" : "Energiatakarékos mód kikapcsolva.", 2200);
      });
    }

    // Felolvasás kapcsoló
    var speakToggle = $("speak-toggle");
    speakToggle.checked = speakEnabled;
    if (!speechSupported()) speakToggle.disabled = true;
    speakToggle.addEventListener("change", function () {
      speakEnabled = speakToggle.checked;
      localStorage.setItem(SPEAK_KEY, speakEnabled ? "1" : "0");
      if (speakEnabled) {
        islandFlash("🔊", "Felolvasás bekapcsolva!", 2000);
        // rövid bemutatkozás – ez egyben "felébreszti" a hangokat is
        speakText("Szia! Mostantól felolvasom a válaszaimat!");
      } else {
        stopSpeaking();
        oceanSink();
        islandFlash("🔇", "Felolvasás kikapcsolva.", 2000);
      }
    });

    // A hanglista sok böngészőben csak késleltetve töltődik be
    if (speechSupported()) {
      speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged = function () { speechSynthesis.getVoices(); };
    }
  }

  function setupSuggestions() {
    document.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        inputEl.value = chip.textContent;
        handleSend();
      });
    });
  }

  function setupStyleBar() {
    document.querySelectorAll(".style-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var s = btn.getAttribute("data-style");
        if (s === currentStyle) return;
        setStyle(s);
        addBotMessage(STYLES[s].confirm, {});
      });
    });
    setStyle(currentStyle);
  }

  // ---------- EXTRA FUNKCIÓK: HÁZI FELADAT (kamera + OCR + megoldás) ----------

  function hwStatus(msg) {
    var el = $("hw-status");
    if (el) el.textContent = msg || "";
  }

  // Tesseract.js írásfelismerő dinamikus betöltése a CDN-ről (csak igény esetén)
  var tesseractPromise = null;
  function loadTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (tesseractPromise) return tesseractPromise;
    tesseractPromise = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      s.onload = function () {
        if (window.Tesseract) resolve(window.Tesseract);
        else reject(new Error("tesseract-missing"));
      };
      s.onerror = function () { tesseractPromise = null; reject(new Error("tesseract-load")); };
      document.head.appendChild(s);
    });
    return tesseractPromise;
  }

  // Kép → szöveg (magyar + angol felismerés)
  function runOCR(imageSource) {
    return loadTesseract().then(function (T) {
      return T.recognize(imageSource, "hun+eng", {
        logger: function (m) {
          if (m && m.status === "recognizing text") {
            hwStatus("🔍 Szöveg felismerése… " + Math.round((m.progress || 0) * 100) + "%");
          } else if (m && m.status) {
            hwStatus("⏳ Felkészülés a felismerésre…");
          }
        }
      });
    }).then(function (res) {
      return (res && res.data && res.data.text) ? res.data.text : "";
    });
  }

  function hwDedupe(blocks) {
    var seen = {}, out = [];
    blocks.forEach(function (b) {
      var key = normalize(b.q) + "|" + normalize(b.a).slice(0, 50);
      if (seen[key]) return;
      seen[key] = 1;
      out.push(b);
    });
    return out;
  }

  function hwRender(blocks, sourceLabel, link) {
    var body = blocks.map(function (b) {
      // "plain" blokk (matek/fogalmazás megoldás) már kész szöveg, nincs kérdés-prefix
      if (b.plain) return b.a;
      return "**❓ " + b.q + "**\n" + b.a;
    }).join("\n\n");

    var resEl = $("hw-result");
    if (resEl) {
      var html = '<div class="hw-result-head">🪄 Megoldás (' + sourceLabel + ")</div>" + formatText(body);
      if (link) {
        html += '<a class="wiki-link" href="' + link.replace(/"/g, "&quot;") +
          '" target="_blank" rel="noopener">📖 Forrás megnyitása</a>';
      }
      resEl.innerHTML = html;
      resEl.hidden = false;
    }
    hwStatus("✅ Kész a megoldás! A chatben is megtalálod.");

    // A megoldás a beszélgetésbe is bekerül, hogy később is megmaradjon
    addBotMessage(
      applyStyle("📸 **Házi feladat megoldása** (" + sourceLabel + "):\n\n" + body),
      link ? { question: blocks[0] ? blocks[0].q : "", link: link } : {}
    );
  }

  // A beolvasott / beírt feladat megoldása – TELJESEN HELYBEN:
  //   1) Házi feladat motor (matek lépésekkel / fogalmazás)
  //   2) beépített tudásbázis (több 100 kidolgozott példa minden tárgyból)
  //   3) ha semmi: tiszta, helyi segítő üzenet (NEM keresünk a neten)
  function hwSolve(rawText) {
    var text = (rawText || "").trim();
    if (!text) {
      hwStatus("✍️ Előbb írd be a feladatot a mezőbe!");
      return;
    }
    var resEl = $("hw-result");
    if (resEl) { resEl.hidden = true; resEl.innerHTML = ""; }
    hwStatus("🧠 Átgondolom a feladatot…");

    var H = window.MagicHomework;

    // 0) ÉRTELMEZÉS: tisztítjuk a (gyakran zajos) szöveget, és felismerjük a feladat TÍPUSÁT
    if (H && H.normalizeOCR) text = H.normalizeOCR(text);
    var cls = (H && H.classify) ? H.classify(text) : { type: "ismeretlen", label: "feladat", system: "" };

    // 1) IGAZI AI: ha a modell betöltve+engedélyezve, az AI oldja meg – a TÍPUSHOZ illő utasítással
    if (aiEnabled()) {
      hwSolveAI(text, cls);
      return;
    }

    // 2) HELYI MEGOLDÁS (modell nélkül)
    hwSolveLocal(text, cls);
  }

  // Helyi (modell nélküli) megoldás: motor → tudásbázis → segítő üzenet
  function hwSolveLocal(text, cls) {
    var H = window.MagicHomework;
    var resEl = $("hw-result");
    var lines = text.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);

    // a) HÁZI FELADAT MOTOR – fogalmazás vagy lépésenkénti matek
    if (H) {
      var engine = H.solve(text);
      if (engine) {
        var label = engine.type === "fogalmazás" ? "fogalmazás ✍️" : "lépésről lépésre 🧮";
        hwRender([{ plain: true, a: engine.text, q: text }], label);
        return;
      }
    }

    // b) BEÉPÍTETT TUDÁS – egészben, majd soronként
    var blocks = [];
    var whole = findAnswer(text);
    if (whole) {
      blocks.push({ q: text.length > 80 ? text.slice(0, 80) + "…" : text, a: whole.text });
    } else {
      lines.forEach(function (line) {
        if (line.length < 4) return;
        var r = findAnswer(line);
        if (r) blocks.push({ q: line, a: r.text });
        else if (H) {
          var m = H.solveMath(line);
          if (m) blocks.push({ plain: true, a: m, q: line });
        }
      });
    }

    blocks = hwDedupe(blocks);
    if (blocks.length) {
      hwRender(blocks, "átgondolt megoldás 🧠");
      return;
    }

    // c) Helyben sincs rá válasz – tiszta, segítő üzenet (net nélkül)
    if (resEl) {
      var readBack = text.length > 220 ? text.slice(0, 220) + "…" : text;
      var aiHint = (window.MagicLLM && window.MagicLLM.supported() && !window.MagicLLM.isReady())
        ? "• 💡 **Tipp:** lent a **✨ AI panelben** betöltheted az AI-modellt, és akkor a nehezebb, szöveges feladatokat is megoldja!\n"
        : "";
      resEl.innerHTML = '<div class="hw-result-head">🤔 Ezt ' + (cls ? cls.label : "feladatként") + ' ismertem fel, de így nem tudtam biztosan megoldani</div>' +
        formatText(
          "**Ezt írtad be:**\n„" + readBack + "”\n\n" +
          "Tippek:\n" +
          "• **Pontosítsd** a feladatot a mezőben, és nyomd meg újra a Megoldás gombot!\n" +
          "• **Matek:** legyen tiszta, pl. „2x + 3 = 11”, „egy téglalap oldalai 4 és 6, mennyi a területe?”\n" +
          "• **Szöveges feladat:** írd bele a kulcsszót (pl. „összesen”, „marad”, „egyenként”), és add meg a számokat!\n" +
          aiHint +
          "• Egyszerre **egy feladatot** adj meg!"
        );
      resEl.hidden = false;
    }
    hwStatus("🤔 Nézd meg a beolvasott szöveget, javítsd, ha kell, és próbáld újra!");
  }

  // ---------- IGAZI AI (böngészőben futó modell) ----------

  // Megoldja-e az AI a feladatokat? (modell betöltve + a Házi feladat kapcsoló bekapcsolva)
  function aiEnabled() {
    var L = window.MagicLLM;
    if (!L || !L.isReady()) return false;
    var toggle = $("hw-ai-toggle");
    return !toggle || toggle.checked;
  }

  // Válaszoljon-e az AI a CSEVEGÉSBEN? (modell betöltve + a csevegés-kapcsoló bekapcsolva)
  function chatAiEnabled() {
    var L = window.MagicLLM;
    if (!L || !L.isReady()) return false;
    var toggle = $("chat-ai-toggle");
    return !toggle || toggle.checked;
  }

  // A felismert feladatot az AI-modell oldja meg, a TÍPUSHOZ illő utasítással (streamelt).
  // MOST AI-KÖZPONTÚ: a feladatokat a modell oldja meg és magyarázza el szép magyarsággal.
  // A matek pontos eredményét a beépített motor adja (mindig helyes), az AI ezt ÉRTHETŐEN,
  // lépésről lépésre elmagyarázza; tényszerű/friss kérdéshez a netről is utánanéz (RAG).
  function hwSolveAI(text, cls) {
    var L = window.MagicLLM;
    var H = window.MagicHomework;

    // FOGALMAZÁS → a dedikált fogalmazás-prompt (itt az AI a legjobb)
    if (cls && cls.type === "fogalmazás") {
      runAIStream(L.writeComposition.bind(L, text), "✨ Az AI fogalmazást ír… (" + cls.label + ")",
        "✍️ **Házi feladat – AI fogalmazás** ✍️\n\n", null, text, cls);
      return;
    }

    // MATEK → a pontos végeredményt a beépített motor számolja (mindig helyes),
    //         az AI pedig ÉRTHETŐEN, lépésről lépésre, szép magyar nyelven elmagyarázza.
    if (cls && cls.type === "matek" && H) {
      var exact = null;
      try { exact = H.solveMath(text); } catch (e) {}
      if (exact) {
        var explainSys =
          "Magyar matektanár vagy. A diák feladata és a HELYES végeredmény adott. " +
          "Magyarázd el ÉRTHETŐEN, lépésről lépésre, kifogástalan magyar nyelven, hogyan jutunk el a megoldáshoz. " +
          "NE mondj ellent a megadott végeredménynek, és a magyarázat végén KÖTELEZŐEN add meg a kész eredményt így: „Megoldás: …”. KIZÁRÓLAG magyarul.";
        var explainUser = "Feladat:\n" + text + "\n\nA pontos végeredmény (a beépített motor számolta):\n" + exact +
          "\n\nMagyarázd el a megoldás menetét lépésről lépésre.";
        hwRunStream(explainSys, explainUser, "✨ Az AI elmagyarázza a megoldást… (matek 🧮)",
          "✍️ **Házi feladat – AI megoldás** 🧮\n\n", text, cls, 0.3, null);
        return;
      }
      // nincs pontos helyi eredmény → az AI maga oldja meg, lépésenként
      hwRunStream((cls && cls.system) || "", text, "✨ Az AI megoldja a feladatot… (" + cls.label + ")",
        "✍️ **Házi feladat – AI megoldás** 🧮\n\n", text, cls, 0.4, null);
      return;
    }

    // KÉRDÉS / általános feladat → ha friss/tényszerű (pl. közszereplő, aktuális adat),
    //   a netről hozunk forrást, és arra TÁMASZKODVA felel a modell; egyébként a saját tudásából.
    if (needsWebLookup(text)) {
      hwStatus("🌐 Utánanézek a neten…");
      fetchWebContext(text).then(function (ctx) {
        hwRunStream(L.WEB_SYSTEM, buildGroundedPrompt(text, ctx),
          "✨ Az AI válaszol a netről talált infó alapján… (" + (cls ? cls.label : "kérdés") + ")",
          "✍️ **Házi feladat – AI válasz** 💬\n\n", text, cls, 0.4, ctx.url);
      }).catch(function () {
        hwRunStream((cls && cls.system) || "", text, "✨ Az AI válaszol… (" + (cls ? cls.label : "feladat") + ")",
          "✍️ **Házi feladat – AI válasz** 💬\n\n", text, cls, 0.5, null);
      });
      return;
    }

    hwRunStream((cls && cls.system) || "", text, "✨ Az AI válaszol… (" + (cls ? cls.label : "feladat") + ")",
      "✍️ **Házi feladat – AI válasz** 💬\n\n", text, cls, 0.5, null);
  }

  // Általános streamelő keret a Házi feladat AI-válaszához (system + user prompttal).
  // Hibakor visszaesik a beépített (modell nélküli) megoldóra. `link`: opcionális forrás.
  function hwRunStream(system, user, head, chatPrefix, text, cls, temp, link) {
    var L = window.MagicLLM;
    var resEl = $("hw-result");
    if (resEl) { resEl.hidden = false; resEl.innerHTML = '<div class="hw-result-head">' + head + "</div><div id=\"hw-ai-stream\"></div>"; }
    hwStatus("✨ A modell dolgozik a válaszon…");
    var streamEl = $("hw-ai-stream");
    L.run(system, user, function (full) {
      if (streamEl) streamEl.innerHTML = formatText(full) + ' <span class="hw-ai-caret">▍</span>';
    }, { temperature: temp || 0.5 }).then(function (full) {
      var srcLink = link
        ? '<br><a class="wiki-link" href="' + String(link).replace(/"/g, "&quot;") + '" target="_blank" rel="noopener">📖 Forrás megnyitása</a>'
        : "";
      if (streamEl) streamEl.innerHTML = formatText(full) + srcLink;
      hwStatus("✅ Kész a válasz! A chatben is megtalálod.");
      addBotMessage(applyStyle(chatPrefix + full), link ? { source: "ai-web", link: link } : {});
    }).catch(function () {
      hwStatus("⚠️ Az AI-modell most nem válaszolt, a beépített megoldót használom…");
      hwSolveLocal(text, cls);
    });
  }

  // Segéd: egy (onToken)=>Promise stream-függvény futtatása közös kerettel (fogalmazáshoz)
  function runAIStream(streamFn, head, chatPrefix, exactBlock, text, cls) {
    var resEl = $("hw-result");
    if (resEl) { resEl.hidden = false; resEl.innerHTML = '<div class="hw-result-head">' + head + "</div>" + (exactBlock || "") + '<div id="hw-ai-stream"></div>'; }
    hwStatus("✨ A modell dolgozik…");
    var streamEl = $("hw-ai-stream");
    streamFn(function (full) {
      if (streamEl) streamEl.innerHTML = formatText(full) + ' <span class="hw-ai-caret">▍</span>';
    }).then(function (full) {
      if (streamEl) streamEl.innerHTML = formatText(full);
      hwStatus("✅ Kész! A chatben is megtalálod.");
      addBotMessage(applyStyle(chatPrefix + full), {});
    }).catch(function () {
      hwStatus("⚠️ Az AI-modell most nem válaszolt, a beépített megoldót használom…");
      hwSolveLocal(text, cls);
    });
  }

  // ---------- KÖZÖS AI-PANEL KEZELŐ ----------
  // A modell UGYANAZ a böngészős MagicLLM (egy példány). Két helyen állítható:
  // a Házi feladat modalban (#hw-ai) és a csevegés 🤖 AI-modell modaljában (#chat-ai).
  // A két panel SZINKRONBAN marad: betöltés/váltás bármelyikben mindkettőn látszik.

  var aiPanels = []; // { select, loadBtn, bar, fill, status, toggleWrap }

  function tierOfModel(id) {
    var L = window.MagicLLM;
    var m = L.MODELS.filter(function (x) { return x.id === id; })[0];
    return m && m.tier ? m.tier : "modell";
  }

  // Magic AI plusz tag-e az aktuális fiók? (az admin mindig az)
  function isPlusUser() {
    return !!(window.MagicAuth && window.MagicAuth.isPlus && window.MagicAuth.isPlus());
  }

  // Használható-e ez a modell az aktuális fiókkal? Az Expert modell CSAK
  // Magic AI plusz taggal érhető el; a többi (Normal, Fast) bárkinek.
  function canUseModel(id) {
    return tierOfModel(id) !== "Expert" || isPlusUser();
  }

  // Az első, az aktuális fiókkal HASZNÁLHATÓ modell azonosítója (alapból a default,
  // ha az nem érhető el – pl. Expert plusz nélkül –, akkor a legjobb engedélyezett).
  function firstUsableModel() {
    var L = window.MagicLLM;
    var def = L.defaultModel();
    if (canUseModel(def)) return def;
    var usable = L.MODELS.filter(function (m) { return canUseModel(m.id); });
    return usable.length ? usable[0].id : (L.MODELS[0] && L.MODELS[0].id);
  }

  function aiPanelStatus(msg) {
    aiPanels.forEach(function (p) { if (p.status) p.status.textContent = msg; });
  }

  function aiShowToggles() {
    aiPanels.forEach(function (p) { if (p.toggleWrap) p.toggleWrap.hidden = false; });
  }

  // A „Betöltés/Váltás" gombok feliratának frissítése a kiválasztott vs. betöltött modell alapján
  function refreshLoadBtns() {
    var L = window.MagicLLM;
    aiPanels.forEach(function (p) {
      if (!p.loadBtn) return;
      if (L.isLoading()) { p.loadBtn.textContent = "⏳ Betöltés…"; p.loadBtn.disabled = true; return; }
      var sel = p.select ? p.select.value : L.defaultModel();
      var cur = L.currentModel();
      if (cur && cur === sel) { p.loadBtn.textContent = "✅ Betöltve"; p.loadBtn.disabled = true; }
      else if (cur) { p.loadBtn.textContent = "🔄 Váltás erre a modellre"; p.loadBtn.disabled = false; }
      else { p.loadBtn.textContent = "⬇️ Modell betöltése"; p.loadBtn.disabled = false; }
    });
  }

  // Közös betöltő (gomb, modellváltás és induláskori automatikus betöltés) – MINDEN panelt frissít
  function doLoadModel(modelId, auto) {
    var L = window.MagicLLM;
    if (L.isLoading()) return;
    // GATE: az Expert modell CSAK Magic AI plusz taggal tölthető be.
    if (!canUseModel(modelId)) {
      aiPanelStatus("🔒 Az Expert modell csak ✨ Magic AI plusz tagoknak érhető el. Kérd az adminisztrátortól a Magic AI plusz tagságot, vagy válassz Normal / Fast modellt.");
      aiPanels.forEach(function (p) {
        if (p.select && !canUseModel(p.select.value)) p.select.value = firstUsableModel();
      });
      refreshLoadBtns();
      return;
    }
    if (L.currentModel() === modelId) { refreshLoadBtns(); return; } // már ez fut
    aiPanels.forEach(function (p) {
      if (p.select) p.select.disabled = true;
      if (p.loadBtn) p.loadBtn.disabled = true;
      if (p.bar) p.bar.hidden = false;
      if (p.fill) p.fill.style.width = "0%";
    });
    var switching = !!L.currentModel();
    aiPanelStatus(auto
      ? "🔄 Az utoljára használt modell betöltése… (a böngészőből, letöltés nélkül)"
      : (switching ? "🔄 Modellváltás… a régit leállítom, az újat betöltöm."
                   : "⬇️ Modell letöltése és betöltése… (az első alkalom hosszabb lehet)"));
    L.load(modelId, function (pr) {
      var pct = Math.round((pr.progress || 0) * 100);
      aiPanels.forEach(function (p) { if (p.fill) p.fill.style.width = pct + "%"; });
      aiPanelStatus(pr.text || "Betöltés…");
    }).then(function () {
      aiPanels.forEach(function (p) {
        if (p.fill) p.fill.style.width = "100%";
        if (p.select) { p.select.disabled = false; p.select.value = modelId; }
      });
      aiPanelStatus("✅ Kész! Betöltött modell: " + tierOfModel(modelId) + " – az AI a csevegésben és a Házi feladatnál is válaszol.");
      aiShowToggles();
      refreshLoadBtns();
    }).catch(function (err) {
      aiPanels.forEach(function (p) { if (p.bar) p.bar.hidden = true; if (p.select) p.select.disabled = false; });
      if (auto) L.forgetLoaded(); // ha az automatikus betöltés nem ment, ne próbálja újra minden indításkor
      aiPanelStatus("⚠️ Nem sikerült betölteni: " + (err && err.message ? err.message : "ismeretlen hiba"));
      refreshLoadBtns();
    });
  }

  // Egy AI-panel összeállítása (ids: panel/select/load/bar/fill/status/toggleWrap elem-azonosítók)
  function setupAIPanel(ids) {
    var L = window.MagicLLM;
    var panel = $(ids.panel);
    if (!panel) return;

    var select = $(ids.select);
    var loadBtn = $(ids.load);
    var status = $(ids.status);

    // Nincs MagicLLM vagy nincs WebGPU → jelezzük, hogy itt nem fut
    if (!L || !L.supported()) {
      if (select) select.disabled = true;
      if (loadBtn) loadBtn.disabled = true;
      if (status) status.textContent = "ℹ️ Ez a böngésző nem támogatja a helyi AI-modellt (WebGPU szükséges). A fogalmazást a beépített motor írja. Tipp: friss Chrome/Edge a számítógépen.";
      return;
    }

    var p = {
      select: select, loadBtn: loadBtn, bar: $(ids.bar), fill: $(ids.fill),
      status: status, toggleWrap: $(ids.toggleWrap)
    };
    aiPanels.push(p);

    // Modell-lista feltöltése (Expert → Normal → Fast sorrendben).
    // Az Expert modell CSAK Magic AI plusz taggal választható – másnak zárolt.
    if (select) {
      select.innerHTML = "";
      L.MODELS.forEach(function (m) {
        var opt = document.createElement("option");
        opt.value = m.id;
        var size = m.mb >= 1000 ? (m.mb / 1000).toFixed(1) + " GB" : m.mb + " MB";
        var locked = (m.tier === "Expert") && !isPlusUser();
        opt.textContent = (m.tier ? m.tier + " – " : "") + m.label.replace(/^.*?–\s*/, "") + " · " + size +
          (locked ? " 🔒 (Magic AI plusz)" : "");
        if (locked) opt.disabled = true;
        select.appendChild(opt);
      });
      var want = L.currentModel() || L.defaultModel();
      if (!canUseModel(want)) want = firstUsableModel();
      select.value = want;
      select.addEventListener("change", refreshLoadBtns);
    }
    if (loadBtn) loadBtn.addEventListener("click", function () {
      doLoadModel(select ? select.value : L.defaultModel(), false);
    });

    if (L.isReady()) {
      if (p.toggleWrap) p.toggleWrap.hidden = false;
      if (status) status.textContent = "✅ A modell betöltve. Az AI a csevegésben és a Házi feladatnál is válaszol.";
    }
    refreshLoadBtns();
  }

  // Mindkét AI-panel összeállítása + induláskori automatikus betöltés
  function setupAIPanels() {
    setupAIPanel({ panel: "hw-ai", select: "hw-ai-model", load: "hw-ai-load", bar: "hw-ai-bar", fill: "hw-ai-bar-fill", status: "hw-ai-status", toggleWrap: "hw-ai-toggle-wrap" });
    setupAIPanel({ panel: "chat-ai", select: "chat-ai-model", load: "chat-ai-load", bar: "chat-ai-bar", fill: "chat-ai-bar-fill", status: "chat-ai-status", toggleWrap: "chat-ai-toggle-wrap" });

    // INDULÁSKOR: automatikusan betöltjük az utoljára SIKERESEN használt modellt
    // (a böngésző gyorsítótárából, újraletöltés nélkül), hogy az AI rögtön kéznél legyen.
    var L = window.MagicLLM;
    if (L && L.supported() && aiPanels.length) {
      var auto = L.lastLoadedModel();
      // Ha az utoljára használt modell Expert, de a fiók már NEM plusz tag,
      // ne töltsük be automatikusan (és felejtsük el, hogy ne próbálja minden indításkor).
      if (auto && !canUseModel(auto)) { L.forgetLoaded(); auto = null; }
      if (auto && !L.isReady()) {
        aiPanels.forEach(function (p) { if (p.select) p.select.value = auto; });
        doLoadModel(auto, true);
      }
    }
  }

  // A csevegés 🤖 AI-modell modaljának nyitása/zárása
  function setupAIModal() {
    var openBtn = $("extra-aimodel");
    var modal = $("ai-modal");
    if (!openBtn || !modal) return;
    var closeBtn = $("ai-close");
    var backdrop = modal.querySelector(".hw-backdrop");
    function open() { modal.hidden = false; document.body.classList.add("hw-open"); }
    function close() { modal.hidden = true; document.body.classList.remove("hw-open"); }
    openBtn.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (backdrop) backdrop.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) close(); });
  }

  function setupExtras() {
    var openBtn = $("extra-homework");
    var modal = $("hw-modal");
    if (!openBtn || !modal) return;

    var closeBtn = $("hw-close");
    var backdrop = modal.querySelector(".hw-backdrop");
    var camIn = $("hw-camera");
    var fileIn = $("hw-file");
    var textEl = $("hw-text");
    var solveBtn = $("hw-solve");

    function openModal() {
      modal.hidden = false;
      document.body.classList.add("hw-open");
      hwStatus("");
    }
    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove("hw-open");
    }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    if (backdrop) backdrop.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });

    function handleImage(file) {
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        var url = ev.target.result;
        var img = $("hw-img");
        if (img) img.src = url;
        $("hw-preview").hidden = false;
        hwStatus("🔍 Beolvasom a képet… (ez eltarthat pár másodpercig)");
        runOCR(url).then(function (t) {
          var clean = (window.MagicHomework && window.MagicHomework.normalizeOCR)
            ? window.MagicHomework.normalizeOCR(t)
            : (t || "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
          textEl.value = clean;
          if (clean) hwStatus("✅ Beolvastam! Ellenőrizd/javítsd a szöveget, majd nyomd meg a Megoldás gombot.");
          else hwStatus("🙈 Nem találtam szöveget a képen. Próbáld élesebb, jól megvilágított fotóval – vagy gépeld be a feladatot.");
        }).catch(function () {
          hwStatus("😕 Az írásfelismerő most nem érhető el (internet szükséges hozzá). Gépeld be a feladatot a mezőbe, és úgy is megoldom!");
        });
      };
      reader.readAsDataURL(file);
    }

    if (camIn) camIn.addEventListener("change", function () { handleImage(camIn.files[0]); camIn.value = ""; });
    if (fileIn) fileIn.addEventListener("change", function () { handleImage(fileIn.files[0]); fileIn.value = ""; });
    solveBtn.addEventListener("click", function () { hwSolve(textEl.value); });

    // Példa-chipek: kitöltik a mezőt és rögtön meg is oldják
    modal.querySelectorAll(".hw-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        textEl.value = chip.textContent;
        hwSolve(textEl.value);
      });
    });
  }

  // Az „Extra funkciók" sáv asztali gépen is görgethető legyen: a függőleges
  // egérgörgőt vízszintes görgetéssé alakítjuk (érintőképernyőn eddig is ment).
  function setupExtrasScroll() {
    var scroll = document.querySelector(".extras-scroll");
    if (!scroll) return;
    scroll.addEventListener("wheel", function (e) {
      if (scroll.scrollWidth <= scroll.clientWidth) return; // nincs mit görgetni
      var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!d) return;
      e.preventDefault();
      scroll.scrollLeft += d;
    }, { passive: false });
  }

  // ---------- FIÓK: BEJELENTKEZÉS / REGISZTRÁCIÓ ----------

  function updateAccountUI() {
    var c = window.MagicAuth && window.MagicAuth.current();
    var nameEl = $("account-name"), emailEl = $("account-email");
    if (nameEl) nameEl.textContent = c ? c.fullName : "–";
    if (emailEl) emailEl.textContent = (c && c.email) ? "(" + c.email + ")" : "";
  }

  function showAuthScreen(message) {
    var screen = $("auth-screen");
    if (screen) screen.hidden = false;
    document.body.classList.add("auth-locked");
    // Opcionális üzenet (pl. kitiltás indoka) a Bejelentkezés fülön
    var lm = $("login-msg");
    if (lm) {
      if (message) { lm.textContent = message; lm.classList.add("err"); }
      else { lm.textContent = ""; lm.classList.remove("err"); }
    }
    // A belépő-fülek csúszkáját csak most lehet bemérni (eddig rejtve volt).
    // Azonnal + a következő képkockán + a betűtípus betöltése után is beállítjuk,
    // hogy már az első festésnél az aktív fül alatt legyen.
    if (moveAuthGlider) {
      moveAuthGlider(false);
      requestAnimationFrame(function () { moveAuthGlider(false); });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { moveAuthGlider(false); });
      }
    }
    var firstInput = $("login-name");
    if (firstInput) firstInput.focus();
  }

  // Az Admin fül CSAK az admin e-mail címmel bejelentkezve látszik.
  // Más fiók semmiképp nem fér hozzá: a fül rejtve marad, és ha véletlenül
  // az „admin" panel volt aktív, visszaváltunk a beszélgetésre.
  function applyAdminVisibility() {
    var btn = $("admin-tab-btn");
    if (!btn) return;
    var admin = !!(window.MagicAuth && window.MagicAuth.isAdmin && window.MagicAuth.isAdmin());
    btn.hidden = !admin;
    if (!admin) {
      btn.classList.remove("active");
      var panel = $("tab-admin");
      if (panel && panel.classList.contains("active")) {
        panel.classList.remove("active");
        var chatBtn = document.querySelector('.tab-btn[data-tab="tab-chat"]');
        var chatPanel = $("tab-chat");
        if (chatBtn) chatBtn.classList.add("active");
        if (chatPanel) chatPanel.classList.add("active");
      }
    } else {
      renderAdmin();
    }
    // A fül meg-/eltűnése után a csúszka kerüljön az aktív fül alá
    if (typeof moveGlider === "function") {
      moveGlider(false);
      requestAnimationFrame(function () { moveGlider(false); });
    }
  }

  // Sikeres belépés/regisztráció után: elrejtjük a belépőt, és elindítjuk az appot
  function enterApp() {
    var screen = $("auth-screen");
    if (screen) screen.hidden = true;
    document.body.classList.remove("auth-locked");
    updateAccountUI();
    applyAdminVisibility();
    currentSession = freshSession();
    chatEl.innerHTML = "";
    addGreeting();
    autoUpdateCheck();
    if (inputEl) inputEl.focus();
  }

  function setupAuth() {
    var screen = $("auth-screen");
    if (!screen) return;
    var tabs = screen.querySelectorAll(".auth-tab");
    var loginForm = $("auth-login");
    var regForm = $("auth-register");

    // Csúszó jelölő a belépő-fülekre (mint a fő fülsávnál)
    moveAuthGlider = attachGlider(screen.querySelector(".auth-tabs"), ".auth-tab", "auth-glider");

    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        tabs.forEach(function (b) { b.classList.remove("active"); });
        t.classList.add("active");
        var which = t.getAttribute("data-auth");
        if (loginForm) loginForm.hidden = which !== "login";
        if (regForm) regForm.hidden = which !== "register";
        var ml = $("login-msg"), mr = $("register-msg");
        if (ml) ml.textContent = ""; if (mr) mr.textContent = "";
        if (moveAuthGlider) moveAuthGlider(true);
      });
    });

    // Átméretezéskor maradjon a helyén
    window.addEventListener("resize", function () { if (moveAuthGlider) moveAuthGlider(false); });

    if (loginForm) loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $("login-msg");
      if (msg) { msg.className = "auth-msg"; msg.textContent = "⏳ Bejelentkezés…"; }
      window.MagicAuth.login($("login-name").value, $("login-pass").value).then(function () {
        $("login-pass").value = "";
        enterApp();
      }).catch(function (err) {
        if (msg) { msg.className = "auth-msg warn"; msg.textContent = "⚠️ " + (err && err.message ? err.message : "Nem sikerült a bejelentkezés."); }
      });
    });

    if (regForm) regForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = $("register-msg");
      if (msg) { msg.className = "auth-msg"; msg.textContent = "⏳ Fiók létrehozása…"; }
      window.MagicAuth.register({
        fullName: $("reg-name").value,
        nick: $("reg-nick").value,
        email: $("reg-email").value,
        password: $("reg-pass").value
      }).then(function () {
        $("reg-pass").value = "";
        enterApp();
      }).catch(function (err) {
        if (msg) { msg.className = "auth-msg warn"; msg.textContent = "⚠️ " + (err && err.message ? err.message : "Nem sikerült a regisztráció."); }
      });
    });

    var logoutBtn = $("account-logout");
    if (logoutBtn) logoutBtn.addEventListener("click", function () {
      if (window.MagicAuth) window.MagicAuth.logout();
      location.reload();
    });
  }

  // ---------- ELŐZŐ CHATEK MODAL ----------

  var historyModalEl = null;

  function renderHistoryList() {
    var listEl = $("history-list");
    if (!listEl) return;
    var all = loadChats().slice().sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); });
    if (!all.length) {
      listEl.innerHTML = '<div class="empty-state">Még nincs mentett beszélgetésed.<br>Írj egy üzenetet a chatben, és ide bekerül!</div>';
      return;
    }
    var html = "";
    all.forEach(function (s) {
      var title = s.title || "Névtelen beszélgetés";
      var d = new Date(s.updated || s.created || Date.now());
      var when = d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" }) + " " +
                 d.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
      var count = (s.messages || []).length;
      html += '<div class="history-item">' +
        '<button class="hi-open" data-id="' + s.id + '">' +
          '<span class="hi-title">' + formatText(title) + '</span>' +
          '<span class="hi-meta">' + when + " • " + count + " üzenet</span>" +
        "</button>" +
        '<button class="hi-del" data-id="' + s.id + '" title="Törlés">🗑️</button></div>';
    });
    listEl.innerHTML = html;
    listEl.querySelectorAll(".hi-open").forEach(function (b) {
      b.addEventListener("click", function () {
        openSession(b.getAttribute("data-id"));
        closeHistory();
      });
    });
    listEl.querySelectorAll(".hi-del").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = b.getAttribute("data-id");
        saveChats(loadChats().filter(function (x) { return x.id !== id; }));
        if (currentSession && currentSession.id === id) startNewSession();
        renderHistoryList();
      });
    });
  }

  function openHistory() {
    renderHistoryList();
    if (historyModalEl) { historyModalEl.hidden = false; document.body.classList.add("hw-open"); }
  }
  function closeHistory() {
    if (historyModalEl) { historyModalEl.hidden = true; document.body.classList.remove("hw-open"); }
  }

  function setupHistory() {
    historyModalEl = $("history-modal");
    var openBtn = $("extra-history");
    var closeBtn = $("history-close");
    var newBtn = $("history-new");
    var newChatBtn = $("extra-newchat");
    if (openBtn) openBtn.addEventListener("click", openHistory);
    if (closeBtn) closeBtn.addEventListener("click", closeHistory);
    if (historyModalEl) {
      var backdrop = historyModalEl.querySelector(".hw-backdrop");
      if (backdrop) backdrop.addEventListener("click", closeHistory);
    }
    if (newBtn) newBtn.addEventListener("click", function () { startNewSession(); closeHistory(); });
    if (newChatBtn) newChatBtn.addEventListener("click", startNewSession);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && historyModalEl && !historyModalEl.hidden) closeHistory();
    });
  }

  // ---------- GROUP (online csoportos chat) ----------
  // A csoportos chat MOST a fő ablakban, egy beépített modalban fut (group.js).
  // Itt csak a nyitást/zárást kötjük be; a lobbi-logika a group.js-ben van.

  function setupGroupExtra() {
    var openBtn = $("extra-group");
    var modal = $("group-modal");
    var closeBtn = $("group-close");
    if (openBtn) openBtn.addEventListener("click", function () {
      if (window.MagicGroup) window.MagicGroup.open();
    });
    function closeGroup() { if (window.MagicGroup) window.MagicGroup.close(); }
    if (closeBtn) closeBtn.addEventListener("click", closeGroup);
    if (modal) {
      var backdrop = modal.querySelector(".hw-backdrop");
      if (backdrop) backdrop.addEventListener("click", closeGroup);
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal && !modal.hidden) closeGroup();
    });
  }

  // ---------- ADMINISZTRÁCIÓ (csak az admin e-mail címmel) ----------

  function adminUsers() {
    if (!window.MagicAuth || !window.MagicAuth.allUsers) return [];
    return window.MagicAuth.allUsers();
  }

  function renderAdmin() {
    var listEl = $("admin-list");
    var statsEl = $("admin-stats");
    if (!listEl) return;

    var all = adminUsers().slice().sort(function (a, b) { return (b.created || 0) - (a.created || 0); });
    var filter = ($("admin-search") && $("admin-search").value || "").trim().toLowerCase();
    var users = !filter ? all : all.filter(function (u) {
      return ((u.fullName || "") + " " + (u.nick || "") + " " + (u.email || "")).toLowerCase().indexOf(filter) !== -1;
    });

    var adminEmail = (window.MagicAuth && window.MagicAuth.ADMIN_EMAIL) || "";
    var emails = all.filter(function (u) { return u.email; }).length;
    if (statsEl) {
      statsEl.innerHTML =
        '<div class="admin-stat"><b>' + all.length + "</b><span>regisztrált fiók</span></div>" +
        '<div class="admin-stat"><b>' + emails + "</b><span>e-mail címmel</span></div>" +
        '<div class="admin-stat"><b>' + (users.length) + "</b><span>most listázva</span></div>";
    }

    if (!users.length) {
      listEl.innerHTML = '<div class="admin-empty">' +
        (all.length ? "Nincs a keresésnek megfelelő fiók." :
          "Még nincs ezen az eszközön regisztrált fiók.<br>Más gépeken létrehozott fiókok itt nem látszanak (nincs szerver).") +
        "</div>";
      return;
    }

    var html = "";
    users.forEach(function (u) {
      var d = new Date(u.created || Date.now());
      var when = d.toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" }) + " " +
                 d.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
      var isAdm = u.email && adminEmail && u.email.trim().toLowerCase() === adminEmail.toLowerCase();
      var plusOn = !!u.plus || isAdm; // az admin mindig plusz tag
      var ban = u.ban || null;        // aktív tiltás (vagy null)
      var banBadge = "", banLine = "";
      if (ban) {
        if (ban.until && ban.until > 0) {
          var bd = new Date(ban.until);
          var bwhen = bd.toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" }) +
                      " " + bd.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
          banBadge = ' <span class="admin-badge ban-badge">⏳ kitiltva</span>';
          banLine = "🚫 Ideiglenesen kitiltva eddig: <b>" + escHtml(bwhen) + "</b>";
        } else {
          banBadge = ' <span class="admin-badge ban-badge">⛔ kitiltva</span>';
          banLine = "🚫 Véglegesen kitiltva";
        }
        if (ban.reason) banLine += " &nbsp;•&nbsp; indok: " + escHtml(ban.reason);
      }
      var mailLine = u.email
        ? '<a href="mailto:' + escAttr(u.email) + '">' + escHtml(u.email) + "</a>"
        : "<em>nincs e-mail</em>";
      html += '<div class="admin-card' + (ban ? " banned" : "") + '" data-key="' + escAttr(u.key) + '" data-email="' + escAttr(u.email || "") +
        '" data-name="' + escAttr(u.fullName || "") + '" data-plus="' + (u.plus ? "1" : "0") + '" data-banned="' + (ban ? "1" : "0") + '">' +
        '<div class="admin-card-main">' +
          '<div class="admin-card-name">' + escHtml(u.fullName || "Névtelen") +
            (isAdm ? ' <span class="admin-badge">admin</span>' : "") +
            (plusOn ? ' <span class="admin-badge plus-badge">✨ Magic AI plusz</span>' : "") + banBadge + "</div>" +
          '<div class="admin-card-meta">' +
            "✉️ " + mailLine + "<br>" +
            "🙋 megszólítás: " + escHtml(u.nick || "–") + " &nbsp;•&nbsp; 🗓️ " + when +
            (banLine ? '<br><span class="admin-ban-line">' + banLine + "</span>" : "") +
          "</div>" +
        "</div>" +
        '<div class="admin-card-actions">' +
          (isAdm ? "" : '<button class="admin-act act-plus" type="button">' +
            (u.plus ? "✨ Plusz kikapcsolása" : "✨ Plusz bekapcsolása") + "</button>") +
          (isAdm ? "" : (ban
            ? '<button class="admin-act act-unban" type="button">✅ Feloldás</button>'
            : '<button class="admin-act warn act-ban" type="button">🚫 Kitiltás</button>')) +
          (u.email ? '<button class="admin-act act-mail" type="button">✉️ E-mail</button>' : "") +
          '<button class="admin-act danger act-del" type="button">🗑️ Törlés</button>' +
        "</div>" +
      "</div>";
    });
    listEl.innerHTML = html;

    listEl.querySelectorAll(".act-plus").forEach(function (b) {
      b.addEventListener("click", function () {
        var card = b.closest(".admin-card");
        if (!card) return;
        var key = card.getAttribute("data-key");
        var on = card.getAttribute("data-plus") === "1";
        if (!key || !window.MagicAuth || !window.MagicAuth.setPlus) return;
        window.MagicAuth.setPlus(key, !on); // átkapcsolás
        // Megj.: az admin maga mindig plusz tag, ezért a saját AI-panelje nem változik;
        // a többi fiók a következő bejelentkezésekor látja a friss Expert-hozzáférést.
        renderAdmin();
      });
    });

    listEl.querySelectorAll(".act-mail").forEach(function (b) {
      b.addEventListener("click", function () {
        var card = b.closest(".admin-card");
        var email = card && card.getAttribute("data-email");
        if (email) openMail([email]);
      });
    });
    listEl.querySelectorAll(".act-del").forEach(function (b) {
      b.addEventListener("click", function () {
        var card = b.closest(".admin-card");
        if (!card) return;
        var key = card.getAttribute("data-key");
        var name = card.getAttribute("data-name") || "ez a fiók";
        if (!key) return;
        if (!window.confirm("Biztosan törlöd ezt a fiókot?\n\n" + name +
            "\n\nA fiók adatai véglegesen törlődnek erről az eszközről.")) return;
        window.MagicAuth.deleteUser(key);
        // Ha épp magunkat (az admint) töröltük, jelentkeztessünk ki tisztán.
        if (!window.MagicAuth.current()) { location.reload(); return; }
        renderAdmin();
      });
    });

    // Kitiltás → a választós kitiltás-ablak nyitása
    listEl.querySelectorAll(".act-ban").forEach(function (b) {
      b.addEventListener("click", function () {
        var card = b.closest(".admin-card");
        if (!card) return;
        openBanModal(card.getAttribute("data-key"), card.getAttribute("data-name") || "ez a fiók");
      });
    });
    // Feloldás
    listEl.querySelectorAll(".act-unban").forEach(function (b) {
      b.addEventListener("click", function () {
        var card = b.closest(".admin-card");
        if (!card) return;
        var key = card.getAttribute("data-key");
        if (!key || !window.MagicAuth || !window.MagicAuth.unbanUser) return;
        window.MagicAuth.unbanUser(key);
        renderAdmin();
      });
    });
  }

  // ---------- KITILTÁS-ABLAK (admin: indokkal VAGY időre) ----------
  var banTargetKey = null;

  function openBanModal(key, name) {
    banTargetKey = key;
    var modal = $("ban-modal");
    if (!modal) return;
    var who = $("ban-who"); if (who) who.textContent = name || "ez a fiók";
    // alapállapot: ideiglenes mód, üres indok
    var rTemp = modal.querySelector('input[name="ban-type"][value="temp"]');
    if (rTemp) rTemp.checked = true;
    var reason = $("ban-reason"); if (reason) reason.value = "";
    var status = $("ban-status"); if (status) status.textContent = "";
    syncBanModal();
    modal.hidden = false;
    document.body.classList.add("hw-open");
  }
  function closeBanModal() {
    var modal = $("ban-modal");
    if (modal) modal.hidden = true;
    document.body.classList.remove("hw-open");
    banTargetKey = null;
  }
  // A mód (ideiglenes/végleges) szerint mutatja az időtartam-mezőt és jelzi,
  // hogy az indok kötelező-e (véglegesnél igen, ideiglenesnél opcionális).
  function syncBanModal() {
    var modal = $("ban-modal");
    if (!modal) return;
    var type = (modal.querySelector('input[name="ban-type"]:checked') || {}).value || "temp";
    var durField = $("ban-dur-field");
    if (durField) durField.hidden = (type !== "temp");
    var opt = $("ban-reason-opt");
    if (opt) opt.textContent = (type === "perm") ? "(kötelező)" : "(opcionális)";
  }

  function setupBanModal() {
    var modal = $("ban-modal");
    if (!modal) return;
    var closeBtn = $("ban-close");
    var backdrop = modal.querySelector(".hw-backdrop");
    var confirmBtn = $("ban-confirm");
    if (closeBtn) closeBtn.addEventListener("click", closeBanModal);
    if (backdrop) backdrop.addEventListener("click", closeBanModal);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) closeBanModal(); });
    modal.querySelectorAll('input[name="ban-type"]').forEach(function (r) {
      r.addEventListener("change", syncBanModal);
    });
    if (confirmBtn) confirmBtn.addEventListener("click", function () {
      if (!banTargetKey || !window.MagicAuth || !window.MagicAuth.banUser) return;
      var type = (modal.querySelector('input[name="ban-type"]:checked') || {}).value || "temp";
      var reason = ($("ban-reason") && $("ban-reason").value || "").trim();
      var status = $("ban-status");
      if (type === "perm" && !reason) {
        if (status) status.textContent = "⛔ A végleges kitiltáshoz írd be az indokot.";
        return;
      }
      var until = 0;
      if (type === "temp") {
        var ms = parseInt(($("ban-duration") && $("ban-duration").value) || "86400000", 10);
        until = Date.now() + (ms || 86400000);
      }
      window.MagicAuth.banUser(banTargetKey, { reason: reason, until: until });
      closeBanModal();
      renderAdmin();
    });
  }

  // Pici HTML-esceapelők az admin/mail listához
  function escHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function escAttr(s) { return escHtml(s).replace(/"/g, "&quot;"); }

  // ---------- E-MAIL ÍRÁSA (mailto / Gmail – nincs szerver) ----------

  var mailRecipients = [];

  function openMail(recipients) {
    mailRecipients = (recipients || []).filter(Boolean);
    var modal = $("mail-modal");
    var toEl = $("mail-to");
    if (toEl) {
      toEl.textContent = mailRecipients.length
        ? mailRecipients.join(", ")
        : "(nincs e-mail cím)";
    }
    if (modal) { modal.hidden = false; document.body.classList.add("hw-open"); }
    var subj = $("mail-subject");
    if (subj) subj.focus();
  }
  function closeMail() {
    var modal = $("mail-modal");
    if (modal) modal.hidden = true;
    document.body.classList.remove("hw-open");
  }

  function setupAdmin() {
    var searchEl = $("admin-search");
    var refreshEl = $("admin-refresh");
    var mailAllEl = $("admin-mail-all");
    var adminBtn = $("admin-tab-btn");
    var emailLabel = $("admin-email-label");
    if (emailLabel && window.MagicAuth && window.MagicAuth.ADMIN_EMAIL) {
      emailLabel.textContent = window.MagicAuth.ADMIN_EMAIL;
    }

    if (searchEl) searchEl.addEventListener("input", renderAdmin);
    if (refreshEl) refreshEl.addEventListener("click", renderAdmin);
    if (mailAllEl) mailAllEl.addEventListener("click", function () {
      var emails = adminUsers().map(function (u) { return u.email; }).filter(Boolean);
      // duplikátumok kiszűrése
      var seen = {}, uniq = [];
      emails.forEach(function (e) { var k = e.toLowerCase(); if (!seen[k]) { seen[k] = 1; uniq.push(e); } });
      if (!uniq.length) { alert("Nincs egyetlen e-mail cím sem a regisztrált fiókoknál."); return; }
      openMail(uniq);
    });
    // Az admin fülre kattintáskor frissítsük a listát (a setupTabs külön kezeli a panelváltást)
    if (adminBtn) adminBtn.addEventListener("click", renderAdmin);

    // Mail-modal bekötése
    var closeBtn = $("mail-close");
    var modal = $("mail-modal");
    if (closeBtn) closeBtn.addEventListener("click", closeMail);
    if (modal) {
      var backdrop = modal.querySelector(".hw-backdrop");
      if (backdrop) backdrop.addEventListener("click", closeMail);
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal && !modal.hidden) closeMail();
    });

    var openDefault = $("mail-open-default");
    var openGmail = $("mail-open-gmail");
    if (openDefault) openDefault.addEventListener("click", function () { launchMail("mailto"); });
    if (openGmail) openGmail.addEventListener("click", function () { launchMail("gmail"); });
  }

  function launchMail(kind) {
    if (!mailRecipients.length) { alert("Nincs címzett."); return; }
    var subject = ($("mail-subject") && $("mail-subject").value) || "";
    var body = ($("mail-body") && $("mail-body").value) || "";
    var many = mailRecipients.length > 1;
    var url;
    if (kind === "gmail") {
      // Gmail webes „compose": több címzettnél BCC, hogy ne lássák egymást
      var field = many ? "bcc" : "to";
      url = "https://mail.google.com/mail/?view=cm&fs=1" +
        "&" + field + "=" + encodeURIComponent(mailRecipients.join(",")) +
        "&su=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      window.open(url, "_blank", "noopener");
    } else {
      // Alapértelmezett levelezőprogram (mailto). Több címzettnél BCC.
      var head = many
        ? "mailto:?bcc=" + encodeURIComponent(mailRecipients.join(","))
        : "mailto:" + encodeURIComponent(mailRecipients[0]) + "?";
      url = head + (many ? "&" : "") +
        "subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      window.location.href = url;
    }
  }

  // ---------- INDÍTÓ ANIMÁCIÓ (splash) ----------

  function runSplash() {
    var s = $("splash");
    if (!s) return;
    var done = false;
    function hide() {
      if (done) return;
      done = true;
      s.classList.add("splash-out");
      setTimeout(function () { if (s && s.parentNode) s.parentNode.removeChild(s); }, 750);
    }
    var timer = setTimeout(hide, 5000);              // ~5 mp-es bevezető
    s.addEventListener("click", function () { clearTimeout(timer); hide(); });
  }

  // ---------- INDÍTÁS ----------

  document.addEventListener("DOMContentLoaded", function () {
    runSplash(); // ~5 mp-es villódzó bevezető (kattintásra kihagyható)

    chatEl = $("chat-messages");
    inputEl = $("chat-input");
    sendBtn = $("send-btn");
    islandEl = $("magic-island");
    oceanEl = $("magic-ocean");
    faceEl = $("speak-face");
    faceMouthEl = $("sf-mouth");

    sendBtn.addEventListener("click", handleSend);
    inputEl.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
    inputEl.addEventListener("input", function () {
      inputEl.style.height = "auto";
      inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + "px";
    });

    setupTabs();
    setupSettings();
    setupLang();
    setupUpdateUI();
    setupTeachTab();
    setupKnowledgeTab();
    setupSuggestions();
    setupStyleBar();
    setupExtras();
    setupExtrasScroll();
    setupAIModal();
    setupAIPanels();
    setupAuth();
    setupHistory();
    setupGroupExtra();
    setupAdmin();
    setupBanModal();
    updateStats();

    // KÖTELEZŐ BELÉPÉS: amíg nincs bejelentkezve, a belépő-képernyő fogad.
    // Bejelentkezés/regisztráció után az enterApp() indítja az appot (üdvözlő + munkamenet).
    var cur = window.MagicAuth && window.MagicAuth.current();
    if (cur) {
      // Ha a bejelentkezett fiókot időközben kitiltották, kiléptetjük és jelezzük.
      var ban = window.MagicAuth.banInfo && window.MagicAuth.banInfo(cur.key);
      if (ban) {
        window.MagicAuth.logout();
        showAuthScreen(window.MagicAuth.banMessage ? window.MagicAuth.banMessage(ban) : "Ezt a fiókot kitiltották.");
      } else {
        enterApp();
      }
    } else {
      showAuthScreen();
    }
  });

  // Fejlesztői interfész a konzolból való teszteléshez
  window.MagicAI = {
    findAnswer: findAnswer, answer: groupAnswer, scoreMatch: scoreMatch, normalize: normalize,
    parseWeatherQuery: parseWeatherQuery, getWeather: getWeather,
    applyStyle: applyStyle, setStyle: setStyle, parseStyleCommand: parseStyleCommand,
    parseNewsQuery: parseNewsQuery, fetchNews: fetchNews, searchDuckDuckGo: searchDuckDuckGo,
    parseWebsiteQuery: parseWebsiteQuery, trySmallTalk: trySmallTalk,
    splitQuestions: splitQuestions, searchYouTube: searchYouTube,
    checkForUpdate: checkForUpdate, compareVersions: compareVersions,
    islandShow: islandShow, islandFlash: islandFlash, islandHide: islandHide, setTheme: setTheme,
    oceanRise: oceanRise, oceanSink: oceanSink, speakText: speakText, stopSpeaking: stopSpeaking
  };
})();
