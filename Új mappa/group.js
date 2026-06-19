// ============================================================
//  MAGIC AI – Group (online csoportos chat)  v2.2
//  ÚJRAÉPÍTVE: a csoportos chat MOST a fő ablakban, egy beépített
//  modalban fut (NINCS külön ablak / popup / window.opener).
//
//  Miért? A korábbi külön-ablakos megoldás az ablakok közötti
//  hívásokon (window.opener.MagicAI.answer) múlt, ami popup-blokk,
//  hiányzó opener és cross-realm Promise miatt gyakran SOHA nem
//  válaszolt. Mostantól a választ UGYANEBBEN az ablakban, helyben
//  számoljuk ki – így AZONNAL és MINDIG megjelenik, akkor is, ha
//  egyedül vagy a lobbiban.
//
//  Hálózat: a lobbi üzeneteit továbbra is az ingyenes, regisztráció
//  nélküli ntfy.sh pub/sub szolgáltatás szinkronizálja (POST + SSE),
//  hogy több gépről is ugyanabba a lobbiba lehessen írni.
// ============================================================

(function () {
  "use strict";

  var BASE = "https://ntfy.sh/";
  var TOPIC_PREFIX = "magicai_grp_";

  var es = null;
  var clientId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  var state = { mode: "create", room: null, name: "" };
  var wired = false;
  var glider = null, gliderShineTimer = null;

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

  // Egy AI-buborék kitöltése (új buborékhoz vagy a „gondolkodik…" helyére)
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

  // Az AI VÁLASZA, amikor MÁSVALAKI kérdésére érkezik (SSE-ből)
  function addAnswer(text, ref, link) {
    var b = box(); if (!b) return;
    var row = document.createElement("div");
    row.className = "gc-msg ai";
    b.appendChild(row);
    fillAnswer(row, text, ref, link);
  }

  // „Gondolkodik…" AI-buborék, amit később a valódi válasz vált fel.
  function addThinking() {
    var b = box(); if (!b) return { resolve: function () {} };
    var row = document.createElement("div");
    row.className = "gc-msg ai";
    row.innerHTML =
      '<div class="gc-meta"><span class="gc-name">✨ Magic AI</span>' +
      '<span class="gc-time">' + timeNow() + "</span></div>" +
      '<div class="gc-bubble gc-thinking"><span></span><span></span><span></span></div>';
    b.appendChild(row); scroll();
    var settled = false;
    return { resolve: function (text, ref, link) {
      if (settled) return; settled = true;
      fillAnswer(row, text, ref, link);
    } };
  }

  function setStatus(msg) {
    var el = $("g-msg");
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

  // ---------- AI: a választ HELYBEN, ugyanebben az ablakban számoljuk ----------

  function askAI(q) {
    // Ugyanaz az ablak → a Promise .then megbízhatóan elsül (nincs cross-realm).
    // Biztonsági időkorlát: ha valami beragad, a „gondolkodik…" akkor se pörögjön
    // örökké.
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
        var ai = window.MagicAI;
        if (!ai || typeof ai.answer !== "function") {
          finish({ text: "A Magic AI motor még nem áll készen. Töltsd újra az oldalt, és próbáld újra! 🪄", source: "none" });
          return;
        }
        // Mind a visszaadott Promise-t, mind a callbacket figyeljük – bármelyik old.
        var ret = ai.answer(q, finish);
        if (ret && typeof ret.then === "function") {
          ret.then(finish, function () {
            finish({ text: "Erre most nem tudok válaszolni. 🙈", source: "none" });
          });
        }
      } catch (e) {
        finish({ text: "Erre most nem tudok válaszolni. 🙈", source: "none" });
      }
    });
  }

  // Kérdés küldése: helyben AZONNAL kiírjuk a kérdést + „gondolkodik…",
  // a választ helyben kiszámoljuk és megmutatjuk, és mindkettőt elküldjük
  // a lobbi többi tagjának is (őket az SSE értesíti).
  function sendQuestion(text) {
    text = String(text || "").trim();
    if (!state.room || !text) return;

    addQuestion(state.name, text, true);
    var pending = addThinking();

    post({ k: "q", n: state.name, t: text, c: clientId, ts: Date.now() })
      .catch(function () { /* offline is mehet – a helyi válasz akkor is megjelenik */ });

    askAI(text).then(function (res) {
      res = res || {};
      var answer = res.text || "Erre most nem tudok válaszolni. 🙈";
      pending.resolve(answer, state.name, res.link);
      post({
        k: "a", t: answer,
        link: res.link || "", src: res.source || "", ref: state.name,
        c: clientId, ts: Date.now()
      }).catch(function () {});
    });
  }

  // ---------- Nézetváltás a modalban ----------

  function showChat(room, created) {
    state.room = room;

    $("g-setup").hidden = true;
    $("g-chat").hidden = false;

    var nameEl = document.querySelector("#group-modal .gc-room-name");
    if (nameEl) nameEl.textContent = "Lobbi";
    var codeTxt = document.querySelector("#group-modal .g-code-txt");
    if (codeTxt) codeTxt.textContent = room;

    var b = box(); if (b) b.innerHTML = "";
    if (created) {
      addSystem("Lobbi létrehozva! 🎉 Oszd meg ezt a kódot a többiekkel: " + room + " — aki beírja, ebbe a lobbiba kerül.");
    } else {
      addSystem("Csatlakoztál ehhez a lobbihoz: " + room + ". Tedd fel a kérdésed az AI-nak – mindenki látja a kérdést és a választ! ✨");
    }
    connect(room);
    var ta = $("gc-text"); if (ta) ta.focus();
  }

  function leave() {
    disconnect();
    state.room = null;
    $("g-chat").hidden = true;
    $("g-setup").hidden = false;
    setStatus("");
  }

  // Csúszó jelölő a Létrehozás/Csatlakozás fülsávban – ugyanaz az élmény,
  // mint a fő app fülein.
  function moveGlider(animate) {
    var bar = document.querySelector("#group-modal .gcw-tabs");
    if (!bar) return;
    if (!glider) {
      glider = document.createElement("span");
      glider.className = "gcw-glider";
      glider.setAttribute("aria-hidden", "true");
      bar.insertBefore(glider, bar.firstChild);
      bar.classList.add("has-glider");
    }
    var active = bar.querySelector(".gcw-tab.active");
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
      clearTimeout(gliderShineTimer);
      gliderShineTimer = setTimeout(function () { glider.classList.remove("gliding"); }, 1000);
    }
  }

  function setMode(mode, animate) {
    state.mode = mode;
    var isJoin = mode === "join";
    document.querySelectorAll("#group-modal .gcw-tab").forEach(function (t) {
      t.classList.toggle("active", t.getAttribute("data-mode") === mode);
    });
    $("g-code-field").hidden = !isJoin;
    $("g-go").textContent = isJoin ? "🚪 Csatlakozás a lobbihoz" : "✨ Lobbi létrehozása";
    setStatus("");
    moveGlider(!!animate);
  }

  function go() {
    var name = ($("g-name") && $("g-name").value || "").trim();
    if (name.length < 2) { setStatus("⚠️ Add meg a neved (ezt látják a többiek)."); return; }
    state.name = name;

    if (state.mode === "join") {
      var code = ($("g-code") && $("g-code").value || "").trim().toUpperCase();
      if (code.length < 3) { setStatus("⚠️ Add meg a lobbi kódot, amit a létrehozótól kaptál."); return; }
      setStatus("");
      showChat(code, false);
    } else {
      setStatus("");
      showChat(genCode(), true);
    }
  }

  function copyCode() {
    var code = state.room || "";
    var done = function () {
      var btn = $("g-copy");
      if (!btn) return;
      var span = btn.querySelector(".g-code-txt");
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

  function prefillName() {
    var nameEl = $("g-name");
    if (!nameEl || nameEl.value) return;
    try {
      var c = window.MagicAuth && window.MagicAuth.current();
      if (c && (c.fullName || c.nick)) nameEl.value = c.fullName || c.nick;
    } catch (e) {}
  }

  // ---------- Modal nyit/zár + egyszeri bekötés ----------

  function wire() {
    if (wired) return;
    wired = true;

    document.querySelectorAll("#group-modal .gcw-tab").forEach(function (t) {
      t.addEventListener("click", function () { setMode(t.getAttribute("data-mode"), true); });
    });
    var go0 = $("g-go"); if (go0) go0.addEventListener("click", go);
    var copy = $("g-copy"); if (copy) copy.addEventListener("click", copyCode);
    var lv = $("g-leave"); if (lv) lv.addEventListener("click", leave);

    // Enter a kód-/név-mezőn = indítás
    ["g-name", "g-code"].forEach(function (id) {
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

    window.addEventListener("resize", function () {
      var modal = $("group-modal");
      if (modal && !modal.hidden) moveGlider(false);
    });
    window.addEventListener("beforeunload", disconnect);
  }

  function open() {
    var modal = $("group-modal");
    if (!modal) return;
    wire();
    prefillName();
    modal.hidden = false;
    document.body.classList.add("hw-open");
    // Ha még nincs aktív lobbi, a beállító nézet legyen elöl.
    if (!state.room) { setMode(state.mode || "create", false); }
    // A csúszka bemérése csak most lehetséges (eddig a modal rejtve volt).
    moveGlider(false);
    requestAnimationFrame(function () { moveGlider(false); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { moveGlider(false); });
    }
  }

  function close() {
    var modal = $("group-modal");
    if (modal) modal.hidden = true;
    document.body.classList.remove("hw-open");
    // A lobbi kapcsolatát SZÁNDÉKOSAN nyitva hagyjuk: ha visszanyitod a modalt,
    // a beérkezett üzenetek ott vannak. A „Kilépés" gomb bontja a kapcsolatot.
  }

  window.MagicGroup = { open: open, close: close };
})();
