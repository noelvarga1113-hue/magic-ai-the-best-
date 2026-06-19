// ============================================================
//  MAGIC AI – Házi feladat megoldó motor (v2.0)
//  Teljesen OFFLINE: matekfeladatokat old meg lépésről lépésre,
//  fogalmazást ír, és módszereket magyaráz – internet NÉLKÜL.
//  window.MagicHomework néven elérhető.
// ============================================================

(function () {
  "use strict";

  // ---------- segédek ----------
  function low(s) { return (s || "").toLowerCase(); }
  function toNum(s) { return parseFloat(String(s).replace(",", ".")); }

  // Magyaros számformázás (1 234,5)
  function fmt(n) {
    if (typeof n !== "number" || !isFinite(n)) return String(n);
    var r = Math.round(n * 1e6) / 1e6;
    return r.toLocaleString("hu-HU", { maximumFractionDigits: 6 });
  }

  // Számok kinyerése a szövegből (tizedesvessző is)
  function nums(text) {
    var m = String(text).match(/-?\d+(?:[.,]\d+)?/g);
    return m ? m.map(toNum) : [];
  }

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  function lcm(a, b) { return Math.abs(a * b) / (gcd(a, b) || 1); }
  function isPrime(n) {
    n = Math.abs(Math.round(n));
    if (n < 2) return false;
    for (var i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  }

  // Felső indexű kitevők szöveggé (5² → 5^2), hogy a megoldók is értsék
  function supers(s) { return String(s).replace(/²/g, "^2").replace(/³/g, "^3").replace(/⁴/g, "^4"); }

  // Római ↔ arab számátváltás
  function toRoman(num) {
    var map = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
    var r = "";
    for (var i = 0; i < map.length; i++) { while (num >= map[i][0]) { r += map[i][1]; num -= map[i][0]; } }
    return r;
  }
  function fromRoman(s) {
    s = s.toUpperCase();
    if (!/^[IVXLCDM]+$/.test(s)) return null;
    var val = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
    var total = 0;
    for (var i = 0; i < s.length; i++) {
      var cur = val[s[i]], nxt = val[s[i + 1]] || 0;
      total += (cur < nxt) ? -cur : cur;
    }
    // ellenőrzés: visszaalakítva ugyanazt adja-e (kiszűri a hibás alakokat)
    return toRoman(total) === s ? total : null;
  }

  // ============================================================
  //  MATEMATIKA
  // ============================================================

  // Biztonságos aritmetikai kiértékelés (csak számokra és műveletekre)
  function safeEval(expr) {
    var e = supers(String(expr))
      .replace(/,/g, ".")
      .replace(/·|×/g, "*")
      .replace(/:/g, "/")
      .replace(/\^/g, "**")
      .replace(/\s+/g, "");
    if (!/^[-+*/().0-9]*$/.test(e.replace(/\*\*/g, ""))) return null;
    if (!/\d/.test(e)) return null;
    try {
      var v = Function('"use strict";return (' + e + ");")();
      return (typeof v === "number" && isFinite(v)) ? v : null;
    } catch (err) { return null; }
  }

  // ---- 1) EGYENLET (egyismeretlenes, lineáris) ----
  // Megtalálja a változót (x vagy y), majd lineáris együtthatókra bontja
  function pickVar(text) {
    var t = low(text);
    var order = ["x", "y"];
    for (var i = 0; i < order.length; i++) {
      var L = order[i];
      // a változónak számhoz/művelethez/egyenlőségjelhez/kitevőhöz kell kapcsolódnia
      var re = new RegExp("([0-9)=+\\-*/(^²³]\\s*" + L + ")|(" + L + "\\s*[0-9(=+\\-*/)^²³])", "i");
      if (re.test(t)) return L;
    }
    return null;
  }

  function prepMath(e, v) {
    e = supers(String(e)).replace(/,/g, ".").replace(/·|×/g, "*").replace(/\^/g, "**");
    // ':' csak számok között osztás
    e = e.replace(/(\d)\s*:\s*(\d)/g, "$1/$2");
    e = e.replace(/\s+/g, "");
    // implicit szorzás: 2x -> 2*x, 2( -> 2*(, )( -> )*(, x( -> x*(, )x -> )*x
    e = e.replace(/(\d)(?=[a-zA-Z(])/g, "$1*");
    e = e.replace(/([a-zA-Z)])(?=\()/g, "$1*");
    e = e.replace(/\)(?=[a-zA-Z0-9])/g, ")*");
    return e;
  }

  function evalAt(expr, v, x) {
    var e = prepMath(expr, v).replace(new RegExp(v, "gi"), "(" + x + ")");
    if (!/^[-+*/().0-9 ]*$/.test(e.replace(/\*\*/g, ""))) return NaN;
    try {
      var r = Function('"use strict";return (' + e + ");")();
      return (typeof r === "number" && isFinite(r)) ? r : NaN;
    } catch (err) { return NaN; }
  }

  function linearCoef(expr, v) {
    var f0 = evalAt(expr, v, 0), f1 = evalAt(expr, v, 1), f2 = evalAt(expr, v, 2);
    if (isNaN(f0) || isNaN(f1) || isNaN(f2)) return null;
    if (Math.abs((f2 - f0) - 2 * (f1 - f0)) > 1e-9) return null; // nem lineáris
    return { a: f1 - f0, b: f0 };
  }

  function solveEquation(text) {
    if (text.indexOf("=") < 0) return null;
    var v = pickVar(text);
    if (!v) return null;
    if (text.split("=").length !== 2) return null;

    // csak a matematikai karaktereket tartjuk meg (a szavakat kivágjuk)
    var pre = text.replace(/(\d)\s*:\s*(\d)/g, "$1/$2");
    var keep = new RegExp("[^0-9+\\-*/().=^," + v + v.toUpperCase() + " ]", "g");
    var clean = pre.replace(keep, " ").replace(/\s+/g, " ").trim();
    var sides = clean.split("=");
    if (sides.length !== 2) return null;
    var L = sides[0].trim(), R = sides[1].trim();
    if (!L || !R) return null;

    var cl = linearCoef(L, v), cr = linearCoef(R, v);
    if (!cl || !cr) return null;

    var A = cl.a - cr.a;       // (a-c)
    var B = cr.b - cl.b;       // (d-b)
    if (Math.abs(A) < 1e-12) return null; // nincs egyértelmű megoldás
    var x = B / A;

    var steps = [];
    steps.push("Az egyenlet: **" + L + " = " + R + "**");
    steps.push("Rendezzük a változót az egyik, a számokat a másik oldalra:");
    steps.push("**" + fmt(A) + v + " = " + fmt(B) + "**");
    steps.push("Osztunk a változó együtthatójával (" + fmt(A) + "):");
    steps.push("**" + v + " = " + fmt(B) + " / " + fmt(A) + " = " + fmt(x) + "**");
    return {
      title: "📐 Egyenlet megoldása",
      steps: steps,
      answer: v + " = " + fmt(x)
    };
  }

  // ---- 2) SZÁZALÉK ----
  function solvePercent(text) {
    var t = low(text);
    if (t.indexOf("%") < 0 && t.indexOf("százalék") < 0 && t.indexOf("szazalek") < 0) return null;
    var ns = nums(text);
    if (!ns.length) return null;

    // a százalék-érték: a % vagy "százalék" elé írt szám
    var pm = text.match(/(\d+(?:[.,]\d+)?)\s*(?:%|százalék|szazalek)/i);
    var p = pm ? toNum(pm[1]) : null;

    // "hány százalék X az Y-nak" → arány
    if (/h[áa]ny\s*(%|sz[áa]zal[ée]k)/.test(t) || /h[áa]nyad\s*r[ée]sz/.test(t)) {
      if (ns.length < 2) return null;
      var part = ns[0], whole = ns[1];
      var pct = part / whole * 100;
      return {
        title: "📊 Hány százalék?",
        steps: [
          "A rész: **" + fmt(part) + "**, az egész: **" + fmt(whole) + "**.",
          "A képlet: rész / egész · 100.",
          "**" + fmt(part) + " / " + fmt(whole) + " · 100 = " + fmt(pct) + "%**"
        ],
        answer: fmt(part) + " a(z) " + fmt(whole) + " **" + fmt(pct) + "%-a**"
      };
    }

    if (p === null) return null;
    var base = null;
    for (var i = 0; i < ns.length; i++) { if (ns[i] !== p) { base = ns[i]; break; } }
    if (base === null && ns.length) base = ns[0];
    if (base === null) return null;

    // növelés / csökkentés
    if (/n[öo]vel|emel|dr[áa]gul|n[öo]veksz|t[öo]bb lesz/.test(t)) {
      var up = base * (1 + p / 100);
      return {
        title: "📈 Növelés százalékkal",
        steps: [
          fmt(base) + " növelése " + fmt(p) + "%-kal.",
          "**" + fmt(base) + " · (1 + " + fmt(p) + "/100) = " + fmt(base) + " · " + fmt(1 + p / 100) + " = " + fmt(up) + "**"
        ],
        answer: fmt(up)
      };
    }
    if (/cs[öo]kken|keves[ée]bb|olcs[óo]bb|leszáll/.test(t)) {
      var dn = base * (1 - p / 100);
      return {
        title: "📉 Csökkentés százalékkal",
        steps: [
          fmt(base) + " csökkentése " + fmt(p) + "%-kal.",
          "**" + fmt(base) + " · (1 − " + fmt(p) + "/100) = " + fmt(base) + " · " + fmt(1 - p / 100) + " = " + fmt(dn) + "**"
        ],
        answer: fmt(dn)
      };
    }

    // egyszerű: X% a Y-ból
    var res = base * p / 100;
    return {
      title: "💯 Százalékszámítás",
      steps: [
        "A(z) " + fmt(base) + " szám " + fmt(p) + "%-át keressük.",
        "A képlet: egész · százalék / 100.",
        "**" + fmt(base) + " · " + fmt(p) + " / 100 = " + fmt(res) + "**"
      ],
      answer: "a(z) " + fmt(base) + " **" + fmt(p) + "%-a = " + fmt(res) + "**"
    };
  }

  // ---- 3) GEOMETRIA ----
  function solveGeometry(text) {
    var t = low(text);
    var ns = nums(text);
    var PI = Math.PI;

    // kör
    if (/\bk[öo]r\b|sugar|sugár|átmér|atmer/.test(t) && !/k[öo]rnyezet/.test(t)) {
      if (!ns.length) return null;
      var r = ns[0];
      if (/átmér|atmer/.test(t)) r = ns[0] / 2;
      var ter = r * r * PI, ker = 2 * r * PI;
      return {
        title: "⭕ Kör",
        steps: [
          "Sugár: **r = " + fmt(r) + "**" + (/átmér|atmer/.test(t) ? " (az átmérő fele)" : ""),
          "Terület: T = r²·π = " + fmt(r) + "²·π = **" + fmt(ter) + "**",
          "Kerület: K = 2·r·π = **" + fmt(ker) + "**"
        ],
        answer: "Terület ≈ " + fmt(ter) + ", Kerület ≈ " + fmt(ker)
      };
    }
    // kocka
    if (/\bkocka\b/.test(t)) {
      if (!ns.length) return null;
      var a = ns[0];
      return {
        title: "🧊 Kocka",
        steps: [
          "Élhossz: **a = " + fmt(a) + "**",
          "Térfogat: V = a³ = " + fmt(a) + "³ = **" + fmt(a * a * a) + "**",
          "Felszín: A = 6·a² = **" + fmt(6 * a * a) + "**"
        ],
        answer: "Térfogat = " + fmt(a * a * a) + ", Felszín = " + fmt(6 * a * a)
      };
    }
    // téglatest (csak kifejezett szóra, hogy a „doboz” szöveges feladat ne tévessze meg)
    if (/t[ée]glatest/.test(t) && ns.length >= 3) {
      var x = ns[0], y = ns[1], z = ns[2];
      return {
        title: "📦 Téglatest",
        steps: [
          "Élek: **" + fmt(x) + " · " + fmt(y) + " · " + fmt(z) + "**",
          "Térfogat: V = a·b·c = **" + fmt(x * y * z) + "**",
          "Felszín: A = 2·(ab+bc+ca) = **" + fmt(2 * (x * y + y * z + z * x)) + "**"
        ],
        answer: "Térfogat = " + fmt(x * y * z)
      };
    }
    // háromszög (alap és magasság)
    if (/h[áa]romsz[öo]g/.test(t) && ns.length >= 2) {
      var ba = ns[0], bm = ns[1];
      return {
        title: "🔺 Háromszög területe",
        steps: [
          "Alap: **a = " + fmt(ba) + "**, magasság: **m = " + fmt(bm) + "**",
          "Terület: T = (a·m)/2 = (" + fmt(ba) + "·" + fmt(bm) + ")/2 = **" + fmt(ba * bm / 2) + "**"
        ],
        answer: "Terület = " + fmt(ba * bm / 2)
      };
    }
    // téglalap
    if (/t[ée]glalap/.test(t) && ns.length >= 2) {
      var ra = ns[0], rb = ns[1];
      return {
        title: "▭ Téglalap",
        steps: [
          "Oldalak: **a = " + fmt(ra) + "**, **b = " + fmt(rb) + "**",
          "Terület: T = a·b = " + fmt(ra) + "·" + fmt(rb) + " = **" + fmt(ra * rb) + "**",
          "Kerület: K = 2·(a+b) = **" + fmt(2 * (ra + rb)) + "**"
        ],
        answer: "Terület = " + fmt(ra * rb) + ", Kerület = " + fmt(2 * (ra + rb))
      };
    }
    // négyzet
    if (/n[ée]gyzet/.test(t) && !/n[ée]gyzetgy[öo]k|n[ée]gyzetre|n[ée]gyzeten|n[ée]gyzete\b/.test(t) && ns.length >= 1) {
      var sa = ns[0];
      return {
        title: "⬛ Négyzet",
        steps: [
          "Oldal: **a = " + fmt(sa) + "**",
          "Terület: T = a² = " + fmt(sa) + "² = **" + fmt(sa * sa) + "**",
          "Kerület: K = 4·a = **" + fmt(4 * sa) + "**"
        ],
        answer: "Terület = " + fmt(sa * sa) + ", Kerület = " + fmt(4 * sa)
      };
    }
    return null;
  }

  // ---- 4) ÁTLAG ----
  function solveAverage(text) {
    var t = low(text);
    if (!/[áa]tlag/.test(t)) return null;
    var ns = nums(text);
    if (ns.length < 2) return null;
    var sum = ns.reduce(function (a, b) { return a + b; }, 0);
    var avg = sum / ns.length;
    return {
      title: "➗ Átlag",
      steps: [
        "Számok: **" + ns.map(fmt).join(", ") + "** (" + ns.length + " darab)",
        "Összeg: " + ns.map(fmt).join(" + ") + " = **" + fmt(sum) + "**",
        "Átlag = összeg / darabszám = " + fmt(sum) + " / " + ns.length + " = **" + fmt(avg) + "**"
      ],
      answer: "Az átlag = " + fmt(avg)
    };
  }

  // ---- 5) LNKO / LKKT ----
  function solveGcdLcm(text) {
    var t = low(text);
    var ns = nums(text).map(function (n) { return Math.round(n); });
    if (ns.length < 2) return null;
    if (/legnagyobb k[öo]z[öo]s oszt|lnko|l\.?n\.?k\.?o/.test(t)) {
      var g = ns.reduce(function (a, b) { return gcd(a, b); });
      return {
        title: "🔢 Legnagyobb közös osztó (LNKO)",
        steps: ["Számok: **" + ns.join(", ") + "**", "A legnagyobb közös osztójuk: **" + g + "**"],
        answer: "LNKO = " + g
      };
    }
    if (/legkisebb k[öo]z[öo]s t[öo]bbsz[öo]r[öo]s|lkkt|l\.?k\.?k\.?t/.test(t)) {
      var l = ns.reduce(function (a, b) { return lcm(a, b); });
      return {
        title: "🔢 Legkisebb közös többszörös (LKKT)",
        steps: ["Számok: **" + ns.join(", ") + "**", "A legkisebb közös többszörösük: **" + l + "**"],
        answer: "LKKT = " + l
      };
    }
    return null;
  }

  // ---- 6) GYÖK, HATVÁNY ----
  function solvePower(text) {
    var t = low(text);
    var ns = nums(text);
    if (/k[öo]bgy[öo]k/.test(t) && ns.length) {
      var c = Math.cbrt(ns[0]);
      return { title: "∛ Köbgyök", steps: ["A(z) " + fmt(ns[0]) + " köbgyöke: **" + fmt(c) + "**"], answer: "∛" + fmt(ns[0]) + " = " + fmt(c) };
    }
    if (/(n[ée]gyzet)?gy[öo]k/.test(t) && ns.length) {
      var s = Math.sqrt(ns[0]);
      return { title: "√ Négyzetgyök", steps: ["A(z) " + fmt(ns[0]) + " négyzetgyöke: **" + fmt(s) + "**"], answer: "√" + fmt(ns[0]) + " = " + fmt(s) };
    }
    if (/n[ée]gyzet(e|en|re)\b|a n[ée]gyzeten/.test(t) && ns.length) {
      return { title: "x² Négyzetre emelés", steps: [fmt(ns[0]) + "² = " + fmt(ns[0]) + "·" + fmt(ns[0]) + " = **" + fmt(ns[0] * ns[0]) + "**"], answer: fmt(ns[0]) + "² = " + fmt(ns[0] * ns[0]) };
    }
    if (/k[öo]b(e|en|re|[öo]n)\b|a k[öo]b[öo]n/.test(t) && ns.length) {
      return { title: "x³ Köbre emelés", steps: [fmt(ns[0]) + "³ = **" + fmt(ns[0] * ns[0] * ns[0]) + "**"], answer: fmt(ns[0]) + "³ = " + fmt(ns[0] * ns[0] * ns[0]) };
    }
    var hm = t.match(/(\d+(?:[.,]\d+)?)\s*(?:a\s*)?(\d+)\.?\s*hatv[áa]ny/);
    if (hm) {
      var base = toNum(hm[1]), exp = toNum(hm[2]), r = Math.pow(base, exp);
      return { title: "xⁿ Hatványozás", steps: [fmt(base) + " a " + fmt(exp) + ". hatványon = **" + fmt(r) + "**"], answer: fmt(base) + "^" + fmt(exp) + " = " + fmt(r) };
    }
    return null;
  }

  // ---- 7) OSZTHATÓSÁG, PRÍM, OSZTÓK ----
  function solveNumberTheory(text) {
    var t = low(text);
    var ns = nums(text).map(function (n) { return Math.round(n); });
    if (/pr[íi]m/.test(t) && ns.length) {
      var n = ns[0], pr = isPrime(n);
      return {
        title: "🔢 Prímszám-vizsgálat",
        steps: [pr
          ? "A **" + n + "** prímszám: csak 1-gyel és önmagával osztható."
          : "A **" + n + "** NEM prímszám, mert 1-en és önmagán kívül is van osztója."],
        answer: pr ? n + " prímszám ✅" : n + " nem prímszám ❌"
      };
    }
    if (/oszthat[óo]/.test(t) && ns.length >= 2) {
      var x = ns[0], y = ns[1], ok = y !== 0 && x % y === 0;
      return {
        title: "➗ Oszthatóság",
        steps: [fmt(x) + " / " + fmt(y) + " maradéka: **" + fmt(y ? x % y : NaN) + "**"],
        answer: ok ? (x + " osztható " + y + "-vel/val ✅") : (x + " NEM osztható " + y + "-vel/val ❌ (maradék: " + (x % y) + ")")
      };
    }
    if (/oszt[óo]i|oszt[óo]ja|h[áa]ny oszt[óo]/.test(t) && ns.length) {
      var m = Math.abs(ns[0]), ds = [];
      for (var i = 1; i <= m; i++) if (m % i === 0) ds.push(i);
      return {
        title: "🔢 Osztók",
        steps: ["A(z) **" + m + "** osztói: **" + ds.join(", ") + "** (összesen " + ds.length + " db)"],
        answer: m + " osztói: " + ds.join(", ")
      };
    }
    return null;
  }

  // ---- 8) SZÖVEGES FELADAT (kulcsszó alapján; mindig jelzi a feltevést) ----
  function solveWordProblem(text) {
    var t = low(text);
    var ns = nums(text);
    if (ns.length < 2) return null;
    // ha van explicit művelet a szövegben, azt az aritmetika kezeli
    if (/[+\-*/×·]/.test(text.replace(/-(?=\d)/g, ""))) { /* lehet, de nézzük a kulcsszavakat */ }
    var note = "*(Ez a legvalószínűbb művelet a feladat szavai alapján – ellenőrizd; ha más kell, írd át a feladatot!)*";

    // A specifikusabb kulcsszavakat nézzük előbb, az „összesen” (összeadás) a legutolsó.

    // KIVONÁS: „marad / elköltött / elajándékoz / mennyivel több / kevesebb”
    if (/(marad|maradt|mennyivel (t[öo]bb|kevesebb)|k[üu]l[öo]nbs[ée]g|elk[öo]lt|elaj[áa]nd[ée]koz|elvesz[íi]?t|odaad|kevesebb lett|cs[öo]kkent|h[áa]ny.*nem)/.test(t)) {
      var sorted = ns.slice().sort(function (a, b) { return b - a; });
      var rest = sorted.slice(1).reduce(function (a, b) { return a + b; }, 0);
      var diff = sorted[0] - rest;
      return { title: "➖ Szöveges feladat – kivonás",
        steps: [fmt(sorted[0]) + " − " + sorted.slice(1).map(fmt).join(" − ") + " = **" + fmt(diff) + "**", note], answer: fmt(diff) };
    }
    // OSZTÁS: „eloszt / egyenlően / szétoszt / fejenként jut / hány jut”
    if (/(eloszt|egyenl[őo]en|sz[ée]toszt|feloszt|fejenk[ée]nt jut|h[áa]ny jut|elosztva|jut egy|jut egyenl)/.test(t) && ns.length === 2) {
      var q = ns[0] / ns[1];
      return { title: "➗ Szöveges feladat – osztás",
        steps: [fmt(ns[0]) + " / " + fmt(ns[1]) + " = **" + fmt(q) + "**", note], answer: fmt(q) };
    }
    // SZORZÁS: „egyenként / darabonként / hányszor / N darab egy …-ban/ben / ára-kerül”
    if (ns.length === 2 &&
        /(darabonk[ée]nt|egyenk[ée]nt|fejenk[ée]nt|h[áa]nyszor|dobozonk[ée]nt|[óo]r[áa]nk[ée]nt|naponta|dobozban|csomagban|zacsk[óo]ban|sorban|csoportban|polcon|oldalon|[áa]ra\b|kerül|ker[üu]lne|ennyibe)/.test(t)) {
      var prod = ns[0] * ns[1];
      return { title: "✖️ Szöveges feladat – szorzás",
        steps: [fmt(ns[0]) + " · " + fmt(ns[1]) + " = **" + fmt(prod) + "**", note], answer: fmt(prod) };
    }
    // ÖSSZEADÁS: „összesen / együtt / összead / hányan vannak összesen”
    if (/([öo]sszesen|egy[üu]tt|[öo]sszead|add [öo]ssze|mind[öo]ssze|h[áa]ny.*[öo]sszesen|mennyi.*[öo]sszesen)/.test(t)) {
      var sum = ns.reduce(function (a, b) { return a + b; }, 0);
      return { title: "➕ Szöveges feladat – összeadás",
        steps: [ns.map(fmt).join(" + ") + " = **" + fmt(sum) + "**", note], answer: fmt(sum) };
    }
    return null;
  }

  // ---- 9) ARITMETIKA – kinyeri a kifejezést a zajos (OCR-es) szövegből is ----
  function solveArithmetic(text) {
    var norm = supers(String(text))
      .replace(/,/g, ".")
      .replace(/·|×/g, "*")
      .replace(/(\d)\s*:\s*(\d)/g, "$1/$2")
      .replace(/\^/g, "**")
      .replace(/=.*$/, ""); // egy esetleges "= ?" levágása
    // számtani kifejezés-jelöltek a szövegben
    var matches = norm.match(/\d[\d\s+\-*/().]*\d/g);
    if (!matches) return null;
    var best = null;
    matches.forEach(function (m) {
      if (/[+\-*/]/.test(m)) {
        var len = m.replace(/\s/g, "").length;
        if (!best || len > best.replace(/\s/g, "").length) best = m;
      }
    });
    if (!best) return null;
    var v = safeEval(best);
    if (v === null) return null;
    var pretty = best.replace(/\s+/g, " ").replace(/\*\*/g, "^").replace(/\*/g, "·").trim();
    return {
      title: "🧮 Számolás",
      steps: ["A kifejezés: **" + pretty + "**", "Eredmény: **" + fmt(v) + "**"],
      answer: pretty + " = " + fmt(v)
    };
  }

  // ---- 10) MÁSODFOKÚ EGYENLET (ax² + bx + c = 0) ----
  function solveQuadratic(text) {
    if (text.indexOf("=") < 0) return null;
    var v = pickVar(text);
    if (!v) return null;
    if (text.split("=").length !== 2) return null;
    var pre = supers(text).replace(/(\d)\s*:\s*(\d)/g, "$1/$2");
    var keep = new RegExp("[^0-9+\\-*/().=^," + v + v.toUpperCase() + " ]", "g");
    var clean = pre.replace(keep, " ").replace(/\s+/g, " ").trim();
    var sides = clean.split("=");
    if (sides.length !== 2) return null;
    function g(x) { var l = evalAt(sides[0], v, x), r = evalAt(sides[1], v, x); return l - r; }
    var g0 = g(0), g1 = g(1), gm1 = g(-1), g2 = g(2);
    if ([g0, g1, gm1, g2].some(function (z) { return isNaN(z); })) return null;
    var c = g0, a = (g1 + gm1 - 2 * c) / 2, b = (g1 - gm1) / 2;
    if (Math.abs(a) < 1e-9) return null; // lineáris → a másik megoldó kezeli
    if (Math.abs((a * 4 + b * 2 + c) - g2) > 1e-6) return null; // nem másodfokú
    var D = b * b - 4 * a * c;
    var steps = ["Nullára rendezve: **" + fmt(a) + v + "² + " + fmt(b) + v + " + " + fmt(c) + " = 0**",
      "Diszkrimináns: D = b² − 4ac = " + fmt(b) + "² − 4·" + fmt(a) + "·" + fmt(c) + " = **" + fmt(D) + "**"];
    if (D < -1e-9) { steps.push("D < 0, ezért nincs valós megoldás."); return { title: "📐 Másodfokú egyenlet", steps: steps, answer: "Nincs valós megoldás (D < 0)" }; }
    var sq = Math.sqrt(Math.max(0, D)), x1 = (-b + sq) / (2 * a), x2 = (-b - sq) / (2 * a);
    steps.push("Megoldóképlet: " + v + " = (−b ± √D) / (2a)");
    if (Math.abs(D) < 1e-9) { steps.push("**" + v + " = " + fmt(x1) + "** (kettős gyök)"); return { title: "📐 Másodfokú egyenlet", steps: steps, answer: v + " = " + fmt(x1) }; }
    steps.push("**" + v + "₁ = " + fmt(x1) + ",  " + v + "₂ = " + fmt(x2) + "**");
    return { title: "📐 Másodfokú egyenlet", steps: steps, answer: v + "₁ = " + fmt(x1) + ", " + v + "₂ = " + fmt(x2) };
  }

  // ---- 11) ARÁNYPÁR (a:b = c:x, egy ismeretlennel) ----
  function solveProportion(text) {
    if (text.indexOf("=") < 0) return null;
    var v = (pickVar(text) || "x");
    var keep = new RegExp("[^0-9:/=.," + v + v.toUpperCase() + "]", "g");
    var s = text.replace(/,/g, ".").replace(keep, "");
    var m = s.match(/^(-?[\d.]+|[xy])[:\/](-?[\d.]+|[xy])=(-?[\d.]+|[xy])[:\/](-?[\d.]+|[xy])$/i);
    if (!m) return null;
    var p = [m[1], m[2], m[3], m[4]];
    var xi = -1;
    for (var i = 0; i < 4; i++) if (/[xy]/i.test(p[i])) { if (xi >= 0) return null; xi = i; }
    if (xi < 0) return null;
    var n = p.map(function (q) { return /[xy]/i.test(q) ? null : parseFloat(q); });
    var a = n[0], b = n[1], cc = n[2], d = n[3], x;
    if (xi === 0) x = b * cc / d; else if (xi === 1) x = a * d / cc; else if (xi === 2) x = a * d / b; else x = b * cc / a;
    if (!isFinite(x)) return null;
    return {
      title: "⚖️ Aránypár",
      steps: [
        "Az arány: **" + p[0] + " : " + p[1] + " = " + p[2] + " : " + p[3] + "**",
        "Keresztbe szorzunk: a szélső tagok szorzata = a középső tagok szorzata.",
        "**" + v + " = " + fmt(x) + "**"
      ],
      answer: v + " = " + fmt(x)
    };
  }

  // ---- 12) MÉRTÉKEGYSÉG-ÁTVÁLTÁS ----
  var UNIT_GROUPS = {
    "hosszúság": { km: 1000, "kilométer": 1000, m: 1, "méter": 1, dm: 0.1, "deciméter": 0.1, cm: 0.01, "centiméter": 0.01, mm: 0.001, "milliméter": 0.001 },
    "tömeg": { t: 1e6, tonna: 1e6, kg: 1000, kilogramm: 1000, dkg: 10, deka: 10, dekagramm: 10, g: 1, gramm: 1, mg: 0.001, milligramm: 0.001 },
    "űrtartalom": { hl: 100, hektoliter: 100, l: 1, liter: 1, dl: 0.1, deciliter: 0.1, cl: 0.01, ml: 0.001, milliliter: 0.001 },
    "idő": { nap: 86400, óra: 3600, "ora": 3600, perc: 60, másodperc: 1, "masodperc": 1, mp: 1 }
  };
  function solveUnitConversion(text) {
    var t = low(text).replace(/,/g, ".");
    if (!/h[áa]ny|v[áa]lt|kifejezve|=\s*\?|→|->/.test(t)) return null;
    for (var gname in UNIT_GROUPS) {
      var map = UNIT_GROUPS[gname];
      var units = Object.keys(map).sort(function (a, b) { return b.length - a.length; });
      var alt = units.join("|");
      var sm = t.match(new RegExp("(\\d+(?:\\.\\d+)?)\\s*(" + alt + ")(?![a-záéíóöőúüű²³])", "i"));
      if (!sm) continue;
      var target = null, tm = t.match(new RegExp("h[áa]ny\\s*(" + alt + ")(?![a-záéíóöőúüű²³])", "i"));
      if (tm) target = tm[1];
      else {
        var re = new RegExp("(" + alt + ")(?![a-záéíóöőúüű²³])", "ig"), f;
        while ((f = re.exec(t))) { if (low(f[1]) !== low(sm[2])) { target = f[1]; break; } }
      }
      if (!target) continue;
      function keyOf(u) { u = low(u); for (var k in map) if (low(k) === u) return k; return null; }
      var su = keyOf(sm[2]), tu = keyOf(target);
      if (!su || !tu || su === tu) continue;
      var val = parseFloat(sm[1]), res = val * map[su] / map[tu];
      return {
        title: "📏 Mértékegység-átváltás (" + gname + ")",
        steps: ["1 " + su + " = " + fmt(map[su] / map[tu]) + " " + tu, "**" + fmt(val) + " " + su + " = " + fmt(res) + " " + tu + "**"],
        answer: fmt(val) + " " + su + " = **" + fmt(res) + " " + tu + "**"
      };
    }
    return null;
  }

  // ---- 13) MEDIÁN és MÓDUSZ ----
  function solveMedianMode(text) {
    var t = low(text);
    var med = /medi[áa]n/.test(t), mod = /m[óo]dusz/.test(t);
    if (!med && !mod) return null;
    var ns = nums(text);
    if (ns.length < 2) return null;
    if (med) {
      var s = ns.slice().sort(function (a, b) { return a - b; }), n = s.length, mid;
      if (n % 2) mid = s[(n - 1) / 2];
      else mid = (s[n / 2 - 1] + s[n / 2]) / 2;
      return { title: "📊 Medián", steps: ["Növekvő sorrend: **" + s.map(fmt).join(", ") + "**", "A középső érték (medián): **" + fmt(mid) + "**"], answer: "A medián = " + fmt(mid) };
    }
    var freq = {}, best = ns[0], bc = 0;
    ns.forEach(function (x) { freq[x] = (freq[x] || 0) + 1; if (freq[x] > bc) { bc = freq[x]; best = x; } });
    return { title: "📊 Módusz", steps: ["A leggyakrabban előforduló érték a módusz.", "**Módusz = " + fmt(best) + "** (" + bc + "-szer fordul elő)"], answer: "A módusz = " + fmt(best) };
  }

  // ---- 14) PITAGORASZ-TÉTEL ----
  function solvePythagoras(text) {
    var t = low(text);
    if (!/pitagor|der[ée]ksz[öo]g|befog[óo]|[áa]tfog[óo]/.test(t)) return null;
    var ns = nums(text);
    if (ns.length < 2) return null;
    var asksLeg = /befog[óo]/.test(t) && /(mekkora|h[áa]ny|sz[áa]m[íi]t|mennyi).{0,20}befog[óo]|befog[óo].{0,10}(\?|=)/.test(t);
    if (asksLeg) {
      var srt = ns.slice().sort(function (a, b) { return b - a; }), c = srt[0], a1 = srt[1];
      var leg = Math.sqrt(c * c - a1 * a1);
      if (isNaN(leg)) return null;
      return { title: "📐 Pitagorasz-tétel", steps: ["Átfogó: c = " + fmt(c) + ", egyik befogó: a = " + fmt(a1), "A másik befogó: b = √(c² − a²) = √(" + fmt(c * c) + " − " + fmt(a1 * a1) + ") = **" + fmt(leg) + "**"], answer: "A hiányzó befogó ≈ " + fmt(leg) };
    }
    var a = ns[0], b = ns[1], hyp = Math.sqrt(a * a + b * b);
    return { title: "📐 Pitagorasz-tétel", steps: ["Befogók: a = " + fmt(a) + ", b = " + fmt(b), "Átfogó: c = √(a² + b²) = √(" + fmt(a * a) + " + " + fmt(b * b) + ") = **" + fmt(hyp) + "**"], answer: "Az átfogó ≈ " + fmt(hyp) };
  }

  // ---- 15) FAKTORIÁLIS (n!) ----
  function solveFactorial(text) {
    var t = low(text);
    var m = text.match(/(\d+)\s*!/);
    if (!m && !/faktori[áa]lis/.test(t)) return null;
    var ns = nums(text);
    var n = m ? parseInt(m[1], 10) : (ns.length ? Math.round(ns[0]) : NaN);
    if (isNaN(n) || n < 0 || n > 170) return null;
    var r = 1, parts = [];
    for (var i = 2; i <= n; i++) r *= i;
    for (var j = 1; j <= n; j++) parts.push(j);
    return { title: "❗ Faktoriális", steps: ["n! = 1 · 2 · … · n", n + "! = " + (parts.length ? parts.join(" · ") : "1") + " = **" + fmt(r) + "**"], answer: n + "! = " + fmt(r) };
  }

  // ---- 16) RÓMAI SZÁMOK ----
  function solveRoman(text) {
    if (!/r[óo]mai/.test(low(text))) return null;
    var ns = nums(text);
    if (ns.length) {
      var n = Math.round(ns[0]);
      if (n > 0 && n < 4000) return { title: "🏛️ Római szám", steps: ["A(z) " + n + " római számmal:", "**" + toRoman(n) + "**"], answer: n + " = " + toRoman(n) };
    }
    var rm = text.toUpperCase().match(/\b[IVXLCDM]{1,15}\b/);
    if (rm) { var val = fromRoman(rm[0]); if (val) return { title: "🏛️ Római szám", steps: ["A(z) " + rm[0] + " arab számmal:", "**" + val + "**"], answer: rm[0] + " = " + val }; }
    return null;
  }

  // ---- 17) SZÁMSOROZAT (számtani / mértani, következő tag) ----
  function solveSequence(text) {
    var t = low(text);
    if (!/sorozat|folytasd|k[öo]vetkez[őo]|h[áa]nyadik|sz[áa]mtani|m[ée]rtani/.test(t)) return null;
    var ns = nums(text);
    if (ns.length < 3) return null;
    var d = ns[1] - ns[0], arith = true;
    for (var i = 2; i < ns.length; i++) if (Math.abs((ns[i] - ns[i - 1]) - d) > 1e-9) { arith = false; break; }
    if (arith) {
      var nx = ns[ns.length - 1] + d;
      return { title: "🔢 Számtani sorozat", steps: ["A szomszédos tagok különbsége állandó: d = **" + fmt(d) + "**", "A következő tag: " + fmt(ns[ns.length - 1]) + " + " + fmt(d) + " = **" + fmt(nx) + "**"], answer: "A következő tag: " + fmt(nx) };
    }
    if (ns[0] !== 0) {
      var q = ns[1] / ns[0], geo = true;
      for (var k = 2; k < ns.length; k++) if (ns[k - 1] === 0 || Math.abs((ns[k] / ns[k - 1]) - q) > 1e-9) { geo = false; break; }
      if (geo) { var ng = ns[ns.length - 1] * q; return { title: "🔢 Mértani sorozat", steps: ["A szomszédos tagok hányadosa állandó: q = **" + fmt(q) + "**", "A következő tag: " + fmt(ns[ns.length - 1]) + " · " + fmt(q) + " = **" + fmt(ng) + "**"], answer: "A következő tag: " + fmt(ng) }; }
    }
    return null;
  }

  // A matek-megoldók sorrendje (specifikus → általános)
  function solveMathObj(text) {
    var fns = [solveProportion, solveQuadratic, solveEquation, solvePercent, solveUnitConversion,
      solvePythagoras, solveGeometry, solveMedianMode, solveAverage, solveGcdLcm, solveSequence,
      solveFactorial, solvePower, solveRoman, solveNumberTheory, solveArithmetic, solveWordProblem];
    for (var i = 0; i < fns.length; i++) {
      try { var r = fns[i](text); if (r) return r; } catch (e) { /* tovább */ }
    }
    return null;
  }

  // Formázott (szöveges) matek-megoldás, lépésekkel
  function solveMath(text) {
    var obj = solveMathObj(text);
    if (!obj) return null;
    var body = "**" + obj.title + "**\n" + obj.steps.join("\n");
    body += "\n\n✅ **Megoldás:** " + obj.answer;
    return body;
  }

  // ============================================================
  //  FOGALMAZÁS / SZÖVEGÍRÁS
  // ============================================================

  // Tárgyalás-blokkok ismert témákhoz (suffix nélkül fogalmazva)
  var TOPIC_BANK = {
    "család": [
      "A család az a közösség, ahol a legtöbb szeretetet és biztonságot kapjuk. Itt tanuljuk meg az első szavakat, az összetartozás érzését és azt, hogy mindig számíthatunk egymásra.",
      "A közös pillanatok – a vasárnapi ebédek, az ünnepek, az esti beszélgetések – teszik igazán értékessé a családi életet. Ezek az emlékek egy életen át elkísérnek minket.",
      "A szüleimtől és a testvéreimtől tanulom meg, mit jelent a felelősség, a türelem és a megbocsátás. A család az a hely, ahová bármikor hazatérhetek."
    ],
    "barátság": [
      "Az igazi barát az, aki jóban-rosszban mellettünk áll, meghallgat, és őszintén megmondja a véleményét. A barátság bizalomra és kölcsönös tiszteletre épül.",
      "A közös élmények, a nevetés és a nehéz helyzetekben kapott támogatás kovácsolja erőssé a barátságot. Egy jó barát kincset ér.",
      "A barátságot ápolni kell: oda kell figyelnünk a másikra, meg kell tanulnunk megbocsátani, és ott kell lennünk akkor is, amikor nehéz."
    ],
    "természet": [
      "A természet csodálatos sokszínűségével mindennap rácsodálkozhatunk: az erdők, a folyók, a hegyek és az állatvilág harmóniában él egymással.",
      "Fontos, hogy vigyázzunk rá, hiszen a tiszta levegő, a víz és a növények nélkül nem létezhetnénk. A természet védelme mindannyiunk közös felelőssége.",
      "Egy erdei séta vagy egy tóparti délután feltölt energiával, lecsendesíti a gondolatainkat, és emlékeztet arra, milyen szép a világ körülöttünk."
    ],
    "nyár": [
      "A nyár a szabadság évszaka: hosszú, napsütéses napok, fürdőzés, fagylalt és vidám kalandok jellemzik.",
      "Ilyenkor van idő a pihenésre, a barátokkal töltött órákra és az utazásra. A nyári élmények sokáig melegítik a szívünket.",
      "Számomra a nyár a szünidőt, a strandot és a felhőtlen játékot jelenti. Ez az az évszak, amikor a leginkább önmagam lehetek."
    ],
    "tél": [
      "A tél a csend és a hó évszaka. A behavazott táj meseszerűvé varázsolja a világot, és sok játékra ad lehetőséget: szánkózásra, hóemberépítésre.",
      "A hideg napokon jólesik a meleg otthon, a forró tea és a család közelsége. A tél megtanít minket a türelemre és a befelé fordulásra.",
      "A téli ünnepek, a fények és a meghitt esték miatt sokak kedvenc évszaka. A hó alatt pihen a természet, hogy tavasszal újra életre keljen."
    ],
    "tavasz": [
      "A tavasz az újjászületés évszaka. A fák kirügyeznek, a virágok kinyílnak, és a természet színpompás ruhát ölt.",
      "A hosszabbodó nappalok és a langyos napsütés mindenkit kicsalogatnak a szabadba. A tavasz reményt és új energiát hoz az életünkbe."
    ],
    "ősz": [
      "Az ősz a színek évszaka: a fák levelei vörösbe, sárgába és barnába öltöznek, a táj pedig festői látványt nyújt.",
      "Ez a betakarítás és az elcsendesedés időszaka. Az őszi séták, a gesztenyeszüret és a hosszú esték különleges hangulatot teremtenek."
    ],
    "iskola": [
      "Az iskola nemcsak a tudás megszerzésének helye, hanem a barátságoké és az élményeké is. Itt tanuljuk meg, hogyan kell együtt dolgozni és kitartani.",
      "A tanórák, a szünetek és a közös programok mind hozzájárulnak ahhoz, hogy felnőtté váljunk, és megtaláljuk a minket érdeklő utat.",
      "A tanáraink nemcsak ismereteket adnak át, hanem példát is mutatnak. Az iskolában szerzett tudás és a barátok egy életre szólnak."
    ],
    "olvasás": [
      "Az olvasás új világokat nyit meg előttünk: egy jó könyv elrepít messzi tájakra, és olyan kalandokba von be, amelyeket a valóságban sosem élhetnénk át.",
      "A könyvek fejlesztik a képzeletünket, gazdagítják a szókincsünket, és segítenek jobban megérteni önmagunkat és a világot.",
      "Aki sokat olvas, az könnyebben fejezi ki magát, és nyitottabbá válik mások gondolatai iránt. Egy jó könyv az egyik legjobb társ."
    ],
    "sport": [
      "A sport egészségessé és kitartóvá tesz minket. A rendszeres mozgás erősíti a testet, javítja a hangulatot, és megtanít a fegyelemre.",
      "A csapatsportok ráadásul az összetartozásra és a közös célért való küzdelemre is megtanítanak. A győzelem öröme és a vereség tanulsága egyaránt formál minket.",
      "A sportban megtanuljuk, hogy a kitartás és a gyakorlás meghozza a gyümölcsét. A mozgás öröme pedig boldoggá és kiegyensúlyozottá tesz."
    ],
    "szabadidő": [
      "A szabadidő a feltöltődés ideje. Ilyenkor azzal foglalkozhatunk, amit igazán szeretünk: hobbival, sporttal, olvasással vagy a barátainkkal.",
      "A jól eltöltött szabadidő egyensúlyt teremt a kötelességek és a kikapcsolódás között, így frissen és vidáman vághatunk neki a feladatainknak."
    ],
    "környezetvédelem": [
      "A környezetvédelem ma az egyik legfontosabb feladatunk. A szelektív hulladékgyűjtés, a víz- és energiatakarékosság apró, de fontos lépések.",
      "Ha mindenki tesz egy keveset – kevesebb műanyagot használ, többet sétál vagy biciklizik –, együtt nagy változást érhetünk el a bolygónk megóvásáért.",
      "A jövő nemzedékeinek is élhető világot kell hagynunk. Ezért felelősségünk óvni a vizeket, az erdőket és a tiszta levegőt."
    ],
    "karácsony": [
      "A karácsony a szeretet és az együttlét ünnepe. A feldíszített fa, a gyertyák fénye és a közös vacsora meghitté varázsolja az estét.",
      "A legszebb ajándék nem a csomag, hanem az egymásra fordított idő és a figyelmesség. Ilyenkor mindenki igyekszik jobbá és kedvesebbé válni."
    ],
    "húsvét": [
      "A húsvét a tavasz és az újjászületés ünnepe. A locsolkodás, a hímes tojások és a családi együttlét régi hagyományokat elevenítenek fel.",
      "Ez az ünnep a reményről és a megújulásról szól. A közös készülődés és a finom ünnepi ételek mindenki számára emlékezetessé teszik."
    ],
    "kedvenc állat": [
      "A kedvenc állatom hűséges társ, aki feltétel nélkül szeret. A vele töltött idő örömet és felelősséget is jelent.",
      "Az állatok gondozása megtanít a türelemre, a gondoskodásra és arra, hogy minden élőlény figyelmet és szeretetet érdemel."
    ],
    "jövő": [
      "A jövő tele van lehetőségekkel. A technológia fejlődése, az új felfedezések és a saját álmaink mind formálják, milyen lesz az életünk.",
      "Hiszem, hogy szorgalommal, tanulással és kitartással bárki elérheti a céljait. A jövőnket mi magunk építjük, napról napra."
    ],
    "internet": [
      "Az internet a mindennapjaink részévé vált: pillanatok alatt tájékozódhatunk, taníthatjuk magunkat és kapcsolatot tarthatunk a távoli ismerősökkel.",
      "Ugyanakkor felelősen kell használnunk. Fontos, hogy megbízható forrásokat keressünk, vigyázzunk az adatainkra, és ne töltsünk túl sok időt a képernyő előtt."
    ],
    "közösségi média": [
      "A közösségi média összeköti az embereket: megoszthatjuk az élményeinket, és tarthatjuk a kapcsolatot a barátainkkal, bárhol is legyenek.",
      "Mértékkel azonban óvatosnak kell lennünk. A folyamatos összehasonlítás és a sok képernyőidő árthat, ezért fontos megtalálni az egészséges egyensúlyt."
    ],
    "egészséges életmód": [
      "Az egészséges életmód alapja a kiegyensúlyozott táplálkozás, a rendszeres mozgás és a megfelelő pihenés. Ezek együtt tartanak minket erőben és jó hangulatban.",
      "Ha figyelünk a testünkre és a lelkünkre, energikusabbak és kiegyensúlyozottabbak leszünk. Az egészséget kis, mindennapi döntésekkel őrizhetjük meg."
    ],
    "utazás": [
      "Az utazás kitágítja a látókörünket: új tájakat, kultúrákat és embereket ismerhetünk meg, és kiléphetünk a megszokott világunkból.",
      "Minden út élményekkel és emlékekkel gazdagít. Az utazás megtanít a nyitottságra, a rugalmasságra és arra, hogy értékeljük az otthonunkat is."
    ],
    "zene": [
      "A zene az érzelmek nyelve: képes felvidítani, megnyugtatni vagy éppen erőt adni. Mindennapjaink hangulatát észrevétlenül is meghatározza.",
      "Akár hallgatjuk, akár magunk játsszuk, a zene összeköt embereket, és segít kifejezni azt, amit szavakkal néha nehéz elmondani."
    ],
    "szülőföld": [
      "A szülőföld az a hely, ahol felnőttünk, ahol a gyökereink vannak. Az ismerős utcák, az anyanyelv és a hagyományok mind hozzá kötnek minket.",
      "Bárhová is sodorjon az élet, a szülőföld iránti szeretet elkísér. Büszkék lehetünk a tájára, a kultúrájára és az emberekre, akik otthonná teszik."
    ]
  };

  // ---- TEMATIKUS KATEGÓRIÁK ismeretlen témákhoz ----
  // Mindegyik a tényleges témaszót (NOUN) használja, így a fogalmazás
  // valóban arról szól, amit kértek – nem üres töltelékszöveg.
  // Ékezetek eltávolítása, hogy a ragozott (pl. „kutyám”) alakok is illeszkedjenek.
  function deAccent(s) {
    return low(s)
      .replace(/[áàâ]/g, "a").replace(/[éèê]/g, "e").replace(/[íì]/g, "i")
      .replace(/[óòôöő]/g, "o").replace(/[úùûüű]/g, "u");
  }

  var CATEGORY_BANK = [
    {
      re: /\b(anya|anyu|apa|apu|szulo|szulei|szulok|szuleim|testver|nagyma|nagypa|nagyszul|tanar|tanito|barat|parom|peldakep|csaladtag)/,
      pool: function (n) {
        return [
          "A(z) " + n + " az egyik legfontosabb ember az életemben. A jelenléte biztonságot ad, és mindig számíthatok rá.",
          "Sokat tanulok tőle: nemcsak szavakkal, hanem a példájával is mutatja, mit jelent kedvesnek és kitartónak lenni.",
          "Hálás vagyok azért, hogy az életem része. Remélem, én is ugyanennyi szeretetet tudok majd visszaadni neki.",
          "Bármi is történjen, tudom, hogy hozzá mindig fordulhatok egy jó tanácsért vagy egy biztató szóért.",
          "A vele töltött idő a legszebb pillanataim közé tartozik: a közös beszélgetések és nevetések örökre megmaradnak.",
          "Csodálom benne a türelmét és a megértését; sosem adja fel, és engem is arra biztat, hogy kitartó legyek.",
          "Az ő példája nyomán szeretnék én is jó emberré válni, aki figyel a körülötte élőkre.",
          "Néha apró dolgokból érzem, mennyire fontos vagyok neki, és ez erőt ad a nehéz napokon is."
        ];
      }
    },
    {
      re: /\b(kuty|macsk|lo\b|lov|nyul|horcs|tengerimalac|madar|hal\b|teknos|hullo|allat|kisallat|kedvenc)/,
      pool: function (n) {
        return [
          "A(z) " + n + " hűséges és kedves társ, aki feltétel nélkül szeret. Mindennap örömöt szerez a jelenlétével.",
          "A gondozása felelősséggel jár: figyelnem kell az etetésére, a tisztaságára és arra, hogy elég törődéshez jusson.",
          "A vele töltött idő mindig feltölt. Megtanultam tőle, hogy minden élőlény figyelmet és szeretetet érdemel.",
          "Mindig megérzi a hangulatomat: ha szomorú vagyok, mellém bújik, ha vidám, együtt játszunk.",
          "Megtanított a türelemre és a gondoskodásra, hiszen nap mint nap rám van utalva.",
          "A mozdulatai, a szokásai és a játékossága miatt sosem unatkozom a társaságában.",
          "Igazi barátot láttam benne, aki sosem ítélkezik, csak egyszerűen ott van mellettem.",
          "Amióta velünk él, a hétköznapjaink melegebbé és vidámabbá váltak."
        ];
      }
    },
    {
      re: /\b(varos|falu|orszag|magyaror|budapest|otthon|lakohely|tenger|hegy|to\b|erdo|videk|telepules|lakohel)/,
      pool: function (n) {
        return [
          "A(z) " + n + " számomra különleges hely. Vannak kedvenc zugaim, ahová szívesen visszatérek.",
          "Ami igazán értékessé teszi, az nemcsak a látványa, hanem a hangulata és az emberek, akik ott élnek.",
          "Szeretném, ha mások is megismernék és megszeretnék, ezért fontos, hogy vigyázzunk rá.",
          "Minden évszakban más arcát mutatja, és én mindegyiket a magam módján szeretem.",
          "Sok kedves emlék köt ide: itt nőttem fel, itt vannak a barátaim és a megszokott helyeim.",
          "Büszke vagyok rá, és úgy érzem, ide tartozom, akármerre is sodorjon később az élet.",
          "A nyugalma és az ismerős utcái mindig biztonságérzetet adnak, ha hazatérek.",
          "Ahányszor körülnézek, mindig találok benne valami szépet, amit korábban észre sem vettem."
        ];
      }
    },
    {
      re: /\b(foci|focizas|labdar|usz|kosar|kezilab|tanc|rajzol|festes|fozes|sutes|kertesz|horgasz|bicik|kerekpar|olvasas|gitar|zongor|enekl|jatek|hobbi|gyujt|programoz|sakk)/,
      pool: function (n) {
        return [
          "A(z) " + n + " a kedvenc elfoglaltságaim közé tartozik. Amikor ezzel foglalkozom, igazán önmagam lehetek.",
          "Eleinte nem ment minden simán, de a gyakorlással egyre ügyesebb lettem.",
          "Ez a tevékenység nemcsak örömöt ad, hanem fejleszt is: türelmet, ügyességet és kitartást tanulok belőle.",
          "Ilyenkor megfeledkezem a gondjaimról, és teljesen átadom magam annak, amit csinálok.",
          "Megtanultam belőle, hogy a kitartás és a sok gyakorlás végül mindig meghozza a gyümölcsét.",
          "Másokkal együtt művelve közösséget is teremt: új barátokat és közös élményeket ad.",
          "Minden alkalommal egy kicsit jobb leszek benne, és ez a fejlődés óriási motivációt jelent.",
          "Szabadidőmben ehhez térek vissza a legszívesebben, mert feltölt energiával és jókedvvel."
        ];
      }
    },
    {
      re: /\b(telefon|szamitogep|szamitas|laptop|tablet|technol|robot|mesterseges|alkalmaz|jatekkonzol|kepernyo|okostelefon|szamitastechn)/,
      pool: function (n) {
        return [
          "A(z) " + n + " mára a mindennapjaink része lett. Segít a tanulásban, a tájékozódásban és a kapcsolattartásban.",
          "Rengeteg előnye mellett azonban a felelős használata is fontos. Ha mértékkel bánunk vele, a javunkat szolgálja.",
          "Úgy gondolom, a technológia akkor jó, ha mi irányítjuk, és nem fordítva.",
          "Pillanatok alatt érünk el bárkit és bármilyen információt, ami korábban elképzelhetetlen volt.",
          "Ugyanakkor érdemes időt szánni a valódi kapcsolatokra és a képernyőtől távoli élményekre is.",
          "Megkönnyíti a tanulást és a munkát, ha okosan és tudatosan használjuk a lehetőségeit.",
          "A túl sok képernyőidő viszont fáraszthat, ezért fontos megtalálni az egészséges egyensúlyt.",
          "Bámulatos, milyen gyorsan fejlődik, és kíváncsian várom, mit hoz még a jövőben."
        ];
      }
    },
    {
      re: /\b(szeretet|becsulet|tisztelet|szabadsag|beke|oszinteseg|bizalom|igazsag|igazsagoss|kitartas|batorsag|huseg|josag|remeny|boldogsag|turelem|felelosseg|onzetlen|halal|halas)/,
      pool: function (n) {
        return [
          "A(z) " + n + " az egyik legszebb emberi érték. Meghatározza, milyen emberek vagyunk, és hogyan bánunk másokkal.",
          "Nem mindig könnyű megőrizni, főleg nehéz helyzetekben. Mégis épp ilyenkor derül ki igazán, mennyit ér.",
          "Hiszem, hogy ha mindenki törekszik rá egy kicsit, jobb és szebb lesz a világ körülöttünk.",
          "Az apró, mindennapi döntésekben mutatkozik meg, nem a nagy szavakban.",
          "Gyermekkorunktól tanuljuk, és egész életünkben gyakorolnunk kell, hogy igazán a sajátunkká váljon.",
          "Aki ezt az értéket képviseli, arra mások is felnéznek, és szívesen vannak a társaságában.",
          "Úgy gondolom, példát mutatni belőle a legjobb, amit a környezetünkért tehetünk.",
          "Engem arra ösztönöz, hogy jobb emberré váljak, és figyeljek azokra, akik körülöttem élnek."
        ];
      }
    },
    {
      re: /\b(unnep|szuletesnap|szulinap|szuletes nap|nevnap|anyak napja|mikulas|szilveszter|farsang|ballag|husvet|karacsony)/,
      pool: function (n) {
        return [
          "A(z) " + n + " mindig különleges alkalom, amelyet együtt ünnepel a család és a barátok.",
          "A készülődés legalább olyan szép, mint maga az ünnep: a díszítés és a meglepetések is hozzátartoznak.",
          "Ezek a pillanatok azért értékesek, mert összehoznak minket, és szép emlékeket teremtenek.",
          "Ilyenkor mintha megállna az idő, és csak a közös öröm meg az egymásra figyelés számítana.",
          "A meghitt hangulat, a finom ételek és a nevetés sokáig melengetik a szívünket.",
          "Minden évben várom, mert lehetőséget ad arra, hogy kifejezzük egymásnak, mennyire fontosak vagyunk.",
          "A legszebb benne nem az ajándék, hanem az együtt töltött idő és a figyelmesség.",
          "Az ilyen napokra évek múlva is jó szívvel és mosolyogva gondolok vissza."
        ];
      }
    }
  ];

  // ---- Véletlenszerűsítő segédek (hogy minden fogalmazás MÁS legyen) ----
  function rint(n) { return Math.floor(Math.random() * n); }
  function one(arr) { return arr[rint(arr.length)]; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = rint(i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function pick(arr, k) { return shuffle(arr).slice(0, k); }
  function fill(s, T, n) { return s.replace(/\{T\}/g, T).replace(/\{n\}/g, n); }
  function lcFirst(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }

  // Változó bevezető-, áthidaló- és záró-mondatbankok ({T}=cím, {n}=témaszó)
  var OPENERS = [
    "Sokféle téma közül az egyik legérdekesebb számomra a(z) {n}.",
    "Ha a(z) {n} kerül szóba, mindig van mit elmondani, hiszen sokféleképpen érint minket.",
    "A(z) {n} olyan téma, amely régóta foglalkoztat, és amelyről szívesen megosztom a gondolataimat.",
    "Manapság egyre többször gondolkodom el a(z) {n} jelentőségén.",
    "A(z) {n} első hallásra egyszerűnek tűnhet, valójában azonban sokkal gazdagabb és érdekesebb.",
    "Nehéz olyan témát találni, amely annyira közel állna hozzám, mint a(z) {n}."
  ];
  var FRAMINGS = [
    "Az életünk számos pontján találkozunk vele, és mindenki kicsit másként éli meg.",
    "Fontosnak tartom, mert nemcsak a mindennapjainkat, hanem a gondolkodásunkat is alakítja.",
    "Sokat elárul rólunk, hogyan viszonyulunk hozzá.",
    "Érdemes alaposabban is megvizsgálni, mert több rejlik benne, mint elsőre gondolnánk."
  ];
  var INTRO_CLOSERS = [
    "A következőkben leírom, mit jelent számomra, és miért tartom fontosnak.",
    "Az alábbiakban több oldalról is igyekszem bemutatni.",
    "Most pedig kifejtem, miért gondolom mindezt."
  ];
  var REFLECTIONS = [
    "Saját tapasztalataim alapján úgy érzem, minél többet foglalkozom vele, annál közelebb kerülök hozzá.",
    "Sokszor elgondolkodom azon, mennyivel szegényebb lenne az életem nélküle.",
    "Számomra a(z) {n} öröm forrása, ugyanakkor tanulság is.",
    "Az évek során egyre jobban megértettem, miért tartják ennyien fontosnak.",
    "Minél többet tudok róla, annál jobban értékelem."
  ];
  var TRANSITIONS = ["Emellett", "Ráadásul", "Ezen túl", "Másrészről", "Nem szabad elfelejteni azt sem, hogy", "Érdemes arra is gondolni, hogy"];
  var CONCLUSIONS = [
    "Összegzésként elmondhatom, hogy a(z) {n} valóban gazdag téma, amely megérdemli a figyelmet.",
    "Mindezek alapján úgy gondolom, hogy a(z) {n} fontos szerepet tölt be az életünkben.",
    "Végül szeretném kiemelni, hogy a(z) {n} sokat ad nekünk, ha nyitottan fordulunk felé.",
    "Mindent egybevetve a(z) {n} olyan téma, amelyhez jó szívvel térek vissza újra meg újra."
  ];
  var CONCLUSION_CLOSERS = [
    "Remélem, sikerült érzékeltetnem, miért áll hozzám közel.",
    "Bízom benne, hogy másokat is elgondolkodtat.",
    "Számomra mindenképpen az élet egyik fontos része marad."
  ];
  // Általános (kategória nélküli) törzs-mondatok, a témaszót megnevezve
  function GENERIC_POOL(n) {
    return [
      "Először érdemes átgondolni, milyen szerepet tölt be a(z) " + n + " az életünkben.",
      "Sokak számára örömöt, kihívást vagy éppen tanulságot jelent, ezért gyakran találkozunk vele.",
      "A(z) " + n + " több oldalról is megközelíthető, és mindegyik megmutat belőle valami újat.",
      "Vannak, akiknek a hétköznapok része, másoknak különleges jelentőséggel bír.",
      "Úgy gondolom, érdemes nyitottan és figyelmesen közelíteni hozzá, mert sokat tanulhatunk belőle.",
      "Minél jobban megismerem, annál inkább felismerem az értékét és a szépségét.",
      "A részletek megismerése egészen új szemszögből mutatja meg az egészet.",
      "Engem arra ösztönöz, hogy kíváncsi maradjak, és nyitott szemmel járjak a világban."
    ];
  }

  function findTopicKey(topic) {
    var t = low(topic);
    for (var key in TOPIC_BANK) {
      if (TOPIC_BANK.hasOwnProperty(key) && t.indexOf(key) !== -1) return key;
    }
    return null;
  }

  // Tematikus kategória keresése a teljes kérés + téma alapján
  // (ékezet nélkül, hogy a ragozott alakok – „kutyám”, „nagymamámról” – is illeszkedjenek)
  function findCategory(topic, fullText) {
    var hay = deAccent(topic + " " + fullText);
    for (var i = 0; i < CATEGORY_BANK.length; i++) {
      if (CATEGORY_BANK[i].re.test(hay)) return CATEGORY_BANK[i];
    }
    return null;
  }

  // Parancs- és töltelékszavak, amelyeket a témából kiszűrünk
  var COMP_STOP = {
    "írj": 1, "irj": 1, "írd": 1, "fogalmazz": 1, "készíts": 1, "keszits": 1,
    "csinálj": 1, "csinalj": 1, "alkoss": 1, "szerkessz": 1, "egy": 1, "rövid": 1,
    "rovid": 1, "kis": 1, "hosszú": 1, "hosszu": 1, "nekem": 1, "kérlek": 1, "kerlek": 1,
    "please": 1, "a": 1, "az": 1, "mutasd": 1, "be": 1, "legyen": 1, "szóló": 1, "szolo": 1,
    "fogalmazás": 1, "fogalmazas": 1, "fogalmazást": 1, "fogalmazast": 1, "fogalmazást": 1,
    "esszé": 1, "essze": 1, "esszét": 1, "esszet": 1, "szöveg": 1, "szoveg": 1,
    "szöveget": 1, "szoveget": 1, "írás": 1, "iras": 1, "írást": 1, "irast": 1,
    "leírás": 1, "leiras": 1, "leírást": 1, "leirast": 1, "elbeszélés": 1, "elbeszelest": 1,
    "elbeszélést": 1, "című": 1, "cimu": 1, "témában": 1, "temaban": 1, "témáról": 1,
    "témáját": 1, "téma": 1, "tema": 1, "ról": 1, "ről": 1
  };

  // -ról/-ről/-ban/-ben rag levágása a témaszó végéről (alanyeset)
  function stripSuffix(word) {
    return word.replace(/(r[óo]l|r[őo]l|ban|ben)$/i, "");
  }

  // A téma kinyerése a kérésből
  function extractTopic(text) {
    var t = text.trim();
    var m;
    // kifejezett cím idézőjelben vagy "címmel:"
    if ((m = t.match(/c[íi]m(?:mel|e)?\s*:?\s*["„]([^"”\n]+)["”]/i))) return m[1].trim();
    if ((m = t.match(/c[íi]m(?:mel|e)?\s*:?\s*([^.!?\n]+)/i))) return m[1].trim();
    if ((m = t.match(/["„]([^"”\n]{2,})["”]/))) return m[1].trim();

    // szavakra bontás, írásjelek nélkül, töltelékszavak kiszűrése
    var words = t.replace(/[!?.,;:"""„”()]/g, " ").split(/\s+/).filter(Boolean);
    var kept = [];
    for (var i = 0; i < words.length; i++) {
      if (!COMP_STOP[words[i].toLowerCase()]) kept.push(words[i]);
    }
    if (!kept.length) return null;
    // az utolsó tartalmas szóról levágjuk a -ról/-ről ragot
    kept[kept.length - 1] = stripSuffix(kept[kept.length - 1]);
    var topic = kept.join(" ").trim();
    return topic || null;
  }

  function capit(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // A témaszó alanyesetbe hozása és kisbetűsítése a mondatba illesztéshez
  function topicNoun(topic) {
    var n = topic.replace(/^a(z)?\s+/i, "").replace(/\s+/g, " ").trim();
    return n.charAt(0).toLowerCase() + n.slice(1);
  }

  // Fogalmazás-kérés-e a szöveg? (a hívó – pl. AI-útvonal – ezzel dönt)
  function isComposition(text) {
    return /(fogalmaz|esszé|essze|írj egy|irj egy|írj nekem|fogalmazz|készíts egy (rövid )?(szöveg|írás)|leírást? a|elbeszél[ée]st)/.test(low(text));
  }

  function writeComposition(text) {
    if (!isComposition(text)) return null;

    var topic = extractTopic(text);
    if (!topic) topic = "a választott téma";
    topic = topic.replace(/\s+/g, " ").trim();
    var title = capit(topic.replace(/^a(z)?\s+/i, ""));
    var noun = topicNoun(topic);                 // pl. „barátság”, „kutyám”
    var key = findTopicKey(topic);
    var cat = key ? null : findCategory(topic, text);

    // BEVEZETÉS – véletlenszerűen összerakott, témaspecifikus mondatokból
    var bevezetes = fill(one(OPENERS), title, noun) + " " +
      one(FRAMINGS) + " " + one(INTRO_CLOSERS);

    // TÖRZS-MONDATOK forrása: ismert téma → kategória → általános, mindig keverve
    var pool;
    if (key) pool = TOPIC_BANK[key].slice();
    else if (cat) pool = cat.pool(noun);
    else pool = GENERIC_POOL(noun);

    // 4 különböző mondat + 1 személyes reflexió, két bekezdésbe rendezve
    var sents = pick(pool, Math.min(4, pool.length));
    var refl = fill(one(REFLECTIONS), title, noun);
    var half = Math.ceil(sents.length / 2);
    var p1 = sents.slice(0, half).join(" ");
    var p2 = one(TRANSITIONS) + " " + lcFirst(sents.slice(half).join(" ")) + " " + refl;
    var targyalas = p1 + "\n\n" + p2;

    // BEFEJEZÉS – szintén változó
    var befejezes = fill(one(CONCLUSIONS), title, noun) + " " + one(CONCLUSION_CLOSERS);

    return "✍️ **Fogalmazás – " + title + "**\n\n" +
      "**Bevezetés**\n" + bevezetes + "\n\n" +
      "**Tárgyalás**\n" + targyalas + "\n\n" +
      "**Befejezés**\n" + befejezes;
  }

  // ============================================================
  //  OCR-TISZTÍTÁS és FELADAT-FELISMERÉS
  // ============================================================

  // A fotóról beolvasott (zajos) szöveg matek-/feladatbarát tisztítása
  function normalizeOCR(text) {
    return String(text || "")
      .replace(/[‐-―−–—]/g, "-")     // különféle kötőjelek / mínusz → -
      .replace(/[×✕✖⨯]/g, "×")            // ✕ ✖ ⨯ × → ×
      .replace(/[•∙·⋅]/g, "·")            // • ∙ · ⋅ → ·
      .replace(/÷/g, "/")                                  // ÷ → /
      .replace(/[＝]/g, "=")                                // teljes szélességű = → =
      .replace(/[，；]/g, ",")                          // teljes szélességű vessző → ,
      .replace(/(\d)\s+[xX]\s+(\d)/g, "$1×$2")                  // „3 x 4” → szorzás
      .replace(/[ \t ]+/g, " ")                           // sok szóköz → 1
      .replace(/[ ]*\n[ ]*/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  var COMP_SYSTEM_LOCAL =
    "Magyar fogalmazás-segéd vagy. Írj a megadott témáról szép, összefüggő, nyelvtanilag helyes magyar fogalmazást " +
    "(cím, bevezetés, tárgyalás, befejezés). KIZÁRÓLAG magyarul írj, és csak a fogalmazást add vissza.";
  var MATH_SYSTEM =
    "Magyar matektanár vagy. SZÁMOLD KI a feladat megoldását – TILOS csak azt leírni, hogyan KELLENE megoldani! " +
    "Végezd el ténylegesen a számolást a konkrét számokkal, röviden mutasd a lépéseket, " +
    "és az UTOLSÓ sorban KÖTELEZŐEN add meg a kész végeredményt így: „Megoldás: …”. " +
    "Soha ne állj meg a módszernél, mindig juss el a konkrét eredményig. KIZÁRÓLAG magyarul válaszolj.";
  var QA_SYSTEM =
    "Magyar tanár-segéd vagy, türelmes és segítőkész. Figyelj a kérdés szándékára. " +
    "ADD MEG a KONKRÉT választ vagy a KÉSZ megoldást – TILOS csak azt írni, hogyan lehetne megoldani! " +
    "Ha kérdés, válaszold meg tényszerűen és pontosan; ha feladat, OLDD MEG és írd ki a kész eredményt. " +
    "Ha valamit nem tudsz biztosan, mondd meg őszintén, és NE találj ki adatokat. " +
    "Tömör, érthető válasz, felesleges bevezető nélkül. KIZÁRÓLAG magyarul válaszolj.";

  // Felismeri, MILYEN feladat, és visszaadja a hozzá illő AI rendszer-promptot
  function classify(text) {
    var t = low(text);
    if (isComposition(text)) return { type: "fogalmazás", label: "fogalmazás ✍️", system: COMP_SYSTEM_LOCAL };
    var hasEq = /=/.test(text);
    var hasOps = /[+\-*/×·²³%^]|:\s*\d/.test(text);
    var hasNums = /\d/.test(text);
    var mathWord = /(egyenlet|sz[áa]m[íi]tsd|sz[áa]mold|mennyi|h[áa]ny|[áa]tlag|sz[áa]zal[ée]k|oszt[óo]|pr[íi]m|ter[üu]let|ker[üu]let|oszthat|gy[öo]k|hatv[áa]ny|sorozat|medi[áa]n|m[óo]dusz|[áa]tfog|befog|faktori[áa]lis|r[óo]mai|m[ée]rt[ée]kegys|v[áa]ltsd|ar[áa]ny|szorz|oszt|kivon|[öo]sszead)/.test(t);
    if (hasEq || (hasNums && (hasOps || mathWord))) {
      return { type: "matek", label: "matematikai feladat 🧮", system: MATH_SYSTEM };
    }
    if (/\?|mi a |mik a |ki volt|ki [íi]rta|mit jelent|magyar[áa]zd|sorold|mi[ée]rt|hogyan|mikor|hol |jellemezd|hat[áa]rozd meg|definici[óo]/.test(t)) {
      return { type: "kérdés", label: "kérdés / magyarázat 💬", system: QA_SYSTEM };
    }
    return { type: "kérdés", label: "általános feladat 💬", system: QA_SYSTEM };
  }

  // ============================================================
  //  FŐ BELÉPÉSI PONT
  // ============================================================
  //  Visszaad: { type, text } vagy null
  function solve(text) {
    var input = (text || "").trim();
    if (!input) return null;

    // 1) Fogalmazás kérése
    var comp = writeComposition(input);
    if (comp) return { type: "fogalmazás", text: comp };

    // 2) Matek – soronként és egészben
    var lines = input.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean);
    var mathBlocks = [];
    lines.forEach(function (line) {
      var m = solveMath(line);
      if (m) mathBlocks.push(m);
    });
    if (!mathBlocks.length) {
      var whole = solveMath(input);
      if (whole) mathBlocks.push(whole);
    }
    if (mathBlocks.length) {
      return { type: "matek", text: mathBlocks.join("\n\n———\n\n") };
    }

    return null; // nincs helyi megoldás → a hívó a tudásbázist próbálja
  }

  window.MagicHomework = {
    solve: solve,
    solveMath: solveMath,
    writeComposition: writeComposition,
    isComposition: isComposition,
    normalizeOCR: normalizeOCR,
    classify: classify,
    _solveMathObj: solveMathObj
  };
})();
