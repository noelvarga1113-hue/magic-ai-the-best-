// ============================================================
//  MAGIC AI – Group launcher  v2.1.4
//  A csoportos chat MOST egy önálló böngészőablakban nyílik meg
//  (group.html). Itt csak a megnyitásért felelünk: átadjuk a
//  felhasználó nevét, és figyelmeztetünk, ha a böngésző letiltja
//  a felugró ablakot. A tényleges lobbi-logika a group-window.js-ben.
// ============================================================

(function () {
  "use strict";

  var win = null;

  function open() {
    // Ha már nyitva van egy csoport-ablak, csak emeljük előre.
    if (win && !win.closed) { try { win.focus(); return; } catch (e) {} }

    var name = "";
    try {
      var c = window.MagicAuth && window.MagicAuth.current();
      if (c) name = c.fullName || c.nick || "";
    } catch (e) {}

    var url = "group.html?v=2.1.4" + (name ? "&name=" + encodeURIComponent(name) : "");
    win = window.open(url, "magicGroupWindow", "width=480,height=720");

    if (!win) {
      alert("A csoport-ablak megnyitását letiltotta a böngésző. 🪟\n\n" +
            "Engedélyezd a felugró ablakokat ehhez az oldalhoz (a címsor jobb szélén lévő ikonnál), majd próbáld újra.");
      return;
    }
    try { win.focus(); } catch (e) {}
  }

  function close() {
    if (win && !win.closed) { try { win.close(); } catch (e) {} }
    win = null;
  }

  window.MagicGroup = { open: open, close: close };
})();
