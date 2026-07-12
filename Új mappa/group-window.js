// ============================================================
//  MAGIC AI – Group window (külön ablak)  v2.1.4
//  Egy önálló böngészőablakban fut (group.html). A felhasználók
//  egy LOBBIT hoznak létre (kódot kapnak) vagy egy meglévő lobbi
//  KÓDJÁVAL csatlakoznak. A lobbiban NEM egymásnak írnak, hanem
//  AZ AI-TÓL kérdeznek – a kérdést és az AI válaszát is mindenki
//  látja, aki ugyanazt a kódot használja.
//
//  Backend nélkül: az üzenetek az ingyenes, regisztráció nélküli
//  ntfy.sh pub/sub szolgáltatáson mennek (POST + EventSource/SSE).
//  Az AI-választ a megnyitó (fő) ablak motorja számolja ki:
//  window.opener.MagicAI.answer(kérdés).
// ============================================================

(function () {
  "use strict";

  var BASE = "https://ntfy.sh/";
  var TOPIC_PREFIX = "magicai_grp_";
  var ROOM_KEY = "magicai_group_room";

  var es = null;
  var clientId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  var state = { mode: "create", room: null, name: "" };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  // Egyszerű formázás: **félkövér** + sortörés (a fő app formatTextjének kis mása)
  function fmt(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
  }

  // Lobbi kód → ntfy téma (kisbetűs, ékezet nélkül, csak betű/szám)
  function topicFor(room) {
    var slug = String(room || "").trim().toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "").replace(/^_+|_+$/g, "");
    return TOPIC_PREFIX + (slug || "kozos");
  }

  // 6 karakteres, jól olvasható kód (nincs 0/O/1/I)
  function genCode() {
    var A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var s = "";
    for (var i = 0; i < 6; i++) s += A.charAt(Math.floor(Math.random() * A.length));
    return s;
  }

  function timeNow() {
    try { return new Date().toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" }); }
    catch (e) { return ""; }
  }

  function box() { return $("gc-messages"); }
  function scroll() { var b = box(); if (b) b.scrollTop = b.scrollHeight; }

  function addSystem(text) {
    var b = box(); if (!b) return;
    var row = document.createElement("div");
    row.className = "gc-msg system";
    row.innerHTML = '<div class="gc-sys">' + esc(text) + "</div>";
    b.appendChild(row); scroll();
  }

  // Egy ember KÉRDÉSE
  function addQuestion(name, text, mine) {
    var b = box(); if (!b) return;
    var row = document.createElement("div");
    row.className = "gc-msg" + (mine ? " mine" : "");
    row.innerHTML =
      '<div class="gc-meta"><span class="gc-name">' + esc(name || "Névtelen") + "</span>" +
      '<span class="gc-time">' + timeNow() + "</span></div>" +
      '<div class="gc-bubble">' + esc(text).replace(/\n/g, "<br>") + "</div>";
    b.appendChild(row); scroll();
  }

  // Egy AI-buborék kitöltése (új buborékhoz vagy a „gondolkodik…” helyére)
  function fillAnswer(row, text, ref, link) {
    var label = "✨ Magic AI" + (ref ? " – " + esc(ref) + " kérdésére" : "");
    var linkHtml = link
      ? '<a class="gc-src-link" href="' + esc(link) + '" target="_blank" rel="noopener">🌐 Forrás megnyitása</a>'
      : "";
    row.innerHTML =
      '<div class="gc-meta"><span class="gc-name">' + label + "</span>" +
      '<span class="gc-time">' + timeNow() + "</span></div>" +
      '<div class="gc-bubble">' + fmt(text) + linkHtml + "</div>";
    scroll();
  }

  // Az AI VÁLASZA (mindenkinél AI-buborékként jelenik meg)
  function addAnswer(text, ref, link) {
    var b = box(); if (!b) return;
    var row = document.createElement("div");
    row.className = "gc-msg ai";
    b.appendChild(row);
    fillAnswer(row, text, ref, link);
  }

  // „Gondolkodik…” AI-buborék, amit később a valódi válasz vált fel.
  // Akkor is megjelenik, ha egyedül vagyunk a lobbiban, és más még nem
  // lépett be – így a kérdező azonnal látja, hogy a Magic AI dolgozik.
  function addThinking() {
    var b = box(); if (!b) return { resolve: function () {} };
    var row = document.createElement("div");
    row.className = "gc-msg ai";
    row.innerHTML =
      '<div class="gc-meta"><span class="gc-name">✨ Magic AI</span>' +
      '<span class="gc-time">' + timeNow() + "</span></div>" +
      '<div class="gc-bubble gc-thinking"><span></span><span></span><span></span></div>';
    b.appendChild(row); scroll();
    return { resolve: function (text, ref, link) { fillAnswer(row, text, ref, link); } };
  }

  function setStatus(msg) {
    var el = $("gcw-msg");
    if (el) el.textContent = msg || "";
  }

  // ---------- ntfy kapcsolat ----------

  function disconnect() {
    if (es) { try { es.close(); } catch (e) {} es = null; }
  }

  function connect(room) {
    disconnect();
    var url = BASE + topicFor(room) + "/sse?since=15m";
    try { es = new EventSource(url); }
    catch (e) { addSystem("Nem sikerült csatlakozni a lobbihoz. 😕"); return; }

    es.onmessage = function (e) {
      var d;
      try { d = JSON.parse(e.data); } catch (_) { return; }
      if (!d || d.event !== "message") return;          // open/keepalive kihagyása
      var p;
      try { p = JSON.parse(d.message); } catch (_) { return; }
      // A SAJÁT kérdésünket és válaszunkat már helyben megjelenítettük (így
      // egyedül is azonnal látszik), ezért a róluk érkező SSE-visszhangot
      // kihagyjuk – különben kétszer jelennének meg.
      if (p.c === clientId) return;
      if (p.k === "a") {
        addAnswer(p.t, p.ref, p.link);
      } else {                                          // p.k === "q" (vagy régi formátum)
        addQuestion(p.n, p.t, false);
      }
    };
    es.onerror = function () { /* az EventSource magától újracsatlakozik */ };
  }

  function post(obj) {
    if (!state.room) return Promise.reject();
    return fetch(BASE + topicFor(state.room), {
      method: "POST",
      body: JSON.stringify(obj),
      headers: { "Title": "Magic AI lobbi" }
    });
  }

  // ---------- AI: a megnyitó (fő) ablak motorjától kérünk választ ----------

  function askAI(q) {
    var op;
    try { op = window.opener; } catch (e) { op = null; }

    // Nincs (vagy bezárt) fő ablak → nem tudjuk kiszámolni a választ
    if (!op || op.closed || !op.MagicAI || typeof op.MagicAI.answer !== "function") {
      return Promise.resolve({
        text: "A fő Magic AI ablak nincs nyitva, ezért most nem tudok válaszolni. Nyisd meg újra a Magic AI fő oldalát, és próbáld újra! 🪄",
        source: "none"
      });
    }

    // A választ a fő ablak motorja számolja. Mivel az ablakok közötti
    // Promise `.then` nem mindig sül el, EGY SAJÁT (popup-realm) callbacket
    // adunk át, amit a fő ablak meghív, amint kész a válasz. Ráadásnak egy
    // időkorlát is van, hogy a „gondolkodik…" sose pörögjön örökké.
    return new Promise(function (resolve) {
      var settled = false;
      function finish(res) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(res || { text: "Erre most nem tudok válaszolni. 🙈", source: "none" });
      }
      var timer = setTimeout(function () {
        finish({ text: "Erre most nem érkezett időben válasz. Próbáld újra! 🙈", source: "timeout" });
      }, 30000);

      try {
        // A fő ablak a MI callbackünkkel jelez vissza (ablakok közötti
        // függvényhívás – ez megbízhatóan működik).
        var ret = op.MagicAI.answer(q, finish);
        // Tartalék: ha mégis használható a visszaadott ígéret, azt is figyeljük.
        if (ret && typeof ret.then === "function") {
          try { Promise.resolve(ret).then(finish, function () {}); } catch (e) {}
        }
      } catch (e) {
        finish({
          text: "A fő Magic AI ablakkal nincs kapcsolat. Nyisd meg újra a Magic AI fő oldalát, és próbáld újra! 🪄",
          source: "none"
        });
      }
    });
  }

  // Kérdés küldése: kiírjuk a kérdést a lobbiba, majd a saját gépünk
  // kiszámolja az AI-választ, és AZT is beküldjük – így mindenki látja.
  function sendQuestion(text) {
    text = String(text || "").trim();
    if (!state.room || !text) return;

    // 1) A saját kérdést AZONNAL kiírjuk – akkor is, ha még egyedül vagyunk
    //    a lobbiban, és senki más nem lépett be.
    addQuestion(state.name, text, true);
    // 2) „gondolkodik…” buborék, amit a kész válasz vált majd fel
    var pending = addThinking();
    // 3) elküldjük a kérdést a lobbi többi tagjának is (őket az SSE értesíti)
    post({ k: "q", n: state.name, t: text, c: clientId, ts: Date.now() })
      .catch(function () { addSystem("Nem sikerült elküldeni – ellenőrizd az internetkapcsolatot."); });

    // 4) a saját gépünk kiszámolja a választ: helyben rögtön megmutatjuk,
    //    és el is küldjük a többieknek
    askAI(text).then(function (res) {
      res = res || {};
      var answer = res.text || "Erre most nem tudok válaszolni. 🙈";
      pending.resolve(answer, state.name, res.link);
      post({
        k: "a", t: answer,
        link: res.link || "", src: res.source || "", ref: state.name,
        c: clientId, ts: Date.now()
      }).catch(function () {});
    }).catch(function () {
      var answer = "Erre most nem tudok válaszolni. 🙈";
      pending.resolve(answer, state.name, "");
      post({ k: "a", t: answer, ref: state.name, c: clientId, ts: Date.now() }).catch(function () {});
    });
  }

  // ---------- Nézetváltás ----------

  function showChat(room, created) {
    state.room = room;
    try { localStorage.setItem(ROOM_KEY, room); } catch (e) {}

    $("gcw-setup").hidden = true;
    $("gcw-chat").hidden = false;

    var nameEl = document.querySelector(".gcw-room-name");
    if (nameEl) nameEl.textContent = "Lobbi";
    var codeTxt = document.querySelector(".gcw-code-txt");
    if (codeTxt) codeTxt.textContent = room;

    var b = box(); if (b) b.innerHTML = "";
    if (created) {
      addSystem("Lobbi létrehozva! 🎉 Oszd meg ezt a kódot a többiekkel: „" + room + "”. Aki beírja, ebbe a lobbiba kerül.");
    } else {
      addSystem("Csatlakoztál a(z) „" + room + "” lobbihoz. Tedd fel a kérdésed az AI-nak – mindenki látja a kérdést és a választ! ✨");
    }
    connect(room);
    var ta = $("gc-text"); if (ta) ta.focus();
  }

  function leave() {
    disconnect();
    state.room = null;
    $("gcw-chat").hidden = true;
    $("gcw-setup").hidden = false;
    setStatus("");
  }

  // Csúszó jelölő a Létrehozás/Csatlakozás fülsávban – ugyanaz az élmény,
  // mint a fő app fülein: a háttér átsiklik az aktív fülre.
  var gcwGlider = null, gcwShineTimer = null;
  function moveGcwGlider(animate) {
    var bar = document.querySelector(".gcw-tabs");
    if (!bar) return;
    if (!gcwGlider) {
      gcwGlider = document.createElement("span");
      gcwGlider.className = "gcw-glider";
      gcwGlider.setAttribute("aria-hidden", "true");
      bar.insertBefore(gcwGlider, bar.firstChild);
      bar.classList.add("has-glider");
    }
    var active = bar.querySelector(".gcw-tab.active");
    if (!active) return;
    if (!animate) gcwGlider.style.transition = "none";
    gcwGlider.style.left = active.offsetLeft + "px";
    gcwGlider.style.width = active.offsetWidth + "px";
    if (!animate) {
      requestAnimationFrame(function () { gcwGlider.style.transition = ""; });
    } else {
      gcwGlider.classList.remove("gliding");
      void gcwGlider.offsetWidth;                       // a fénycsík újraindításához
      gcwGlider.classList.add("gliding");
      clearTimeout(gcwShineTimer);
      gcwShineTimer = setTimeout(function () { gcwGlider.classList.remove("gliding"); }, 1000);
    }
  }

  function setMode(mode, animate) {
    state.mode = mode;
    var isJoin = mode === "join";
    document.querySelectorAll(".gcw-tab").forEach(function (t) {
      t.classList.toggle("active", t.getAttribute("data-mode") === mode);
    });
    $("gcw-code-field").hidden = !isJoin;
    $("gcw-go").textContent = isJoin ? "🚪 Csatlakozás a lobbihoz" : "✨ Lobbi létrehozása";
    setStatus("");
    moveGcwGlider(!!animate);
  }

  function go() {
    var name = ($("gcw-name") && $("gcw-name").value || "").trim();
    if (name.length < 2) { setStatus("⚠️ Add meg a neved (ezt látják a többiek)."); return; }
    state.name = name;

    if (state.mode === "join") {
      var code = ($("gcw-code") && $("gcw-code").value || "").trim().toUpperCase();
      if (code.length < 3) { setStatus("⚠️ Add meg a lobbi kódot, amit a létrehozótól kaptál."); return; }
      setStatus("");
      showChat(code, false);
    } else {
      setStatus("");
      showChat(genCode(), true);
    }
  }

  // ---------- Bekötés ----------

  function copyCode() {
    var code = state.room || "";
    var done = function () {
      var btn = $("gcw-copy");
      if (!btn) return;
      var span = btn.querySelector(".gcw-code-txt");
      var old = span ? span.textContent : "";
      if (span) span.textContent = "Másolva! ✓";
      setTimeout(function () { if (span) span.textContent = old; }, 1400);
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done, function () {});
        return;
      }
    } catch (e) {}
    done();
  }

  function applyTheme() {
    try {
      if (window.opener && window.opener.document &&
          window.opener.document.body.classList.contains("dark")) {
        document.body.classList.add("dark");
      }
    } catch (e) {}
  }

  function prefillName() {
    var nameEl = $("gcw-name");
    if (!nameEl || nameEl.value) return;
    // 1) a megnyitó ablak fiókjából
    try {
      var c = window.opener && window.opener.MagicAuth && window.opener.MagicAuth.current();
      if (c && (c.fullName || c.nick)) { nameEl.value = c.fullName || c.nick; return; }
    } catch (e) {}
    // 2) az URL-ből (?name=…)
    try {
      var m = location.search.match(/[?&]name=([^&]+)/);
      if (m) nameEl.value = decodeURIComponent(m[1].replace(/\+/g, " "));
    } catch (e) {}
  }

  function init() {
    applyTheme();
    prefillName();

    document.querySelectorAll(".gcw-tab").forEach(function (t) {
      t.addEventListener("click", function () { setMode(t.getAttribute("data-mode"), true); });
    });
    // A csúszó jelölő maradjon a helyén a betűtípus betöltése / átméretezés után is
    window.addEventListener("load", function () { moveGcwGlider(false); });
    window.addEventListener("resize", function () { moveGcwGlider(false); });
    var go0 = $("gcw-go"); if (go0) go0.addEventListener("click", go);
    var copy = $("gcw-copy"); if (copy) copy.addEventListener("click", copyCode);
    var lv = $("gcw-leave"); if (lv) lv.addEventListener("click", leave);
    var x = $("gcw-close"); if (x) x.addEventListener("click", function () { window.close(); });

    // Enter a kód-/név-mezőn = indítás
    ["gcw-name", "gcw-code"].forEach(function (id) {
      var el = $(id);
      if (el) el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); go(); }
      });
    });

    var ta = $("gc-text"), sendBtn = $("gc-send");
    function fire() {
      if (!ta) return;
      var v = ta.value;
      ta.value = "";
      ta.style.height = "auto";
      sendQuestion(v);
    }
    if (sendBtn) sendBtn.addEventListener("click", fire);
    if (ta) {
      ta.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); fire(); }
      });
      ta.addEventListener("input", function () {
        ta.style.height = "auto";
        ta.style.height = Math.min(ta.scrollHeight, 110) + "px";
      });
    }

    window.addEventListener("beforeunload", disconnect);
    setMode("create");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
