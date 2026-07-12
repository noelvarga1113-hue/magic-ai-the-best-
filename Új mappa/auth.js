// ============================================================
//  MAGIC AI – Fiókok (regisztráció / bejelentkezés)  v2.1
//  Teljesen HELYI fiókkezelés: nincs szerver, minden a böngésző
//  localStorage-ában él. A bejelentkezés a TELJES NÉV + JELSZÓ
//  alapján megy. A jelszót nem nyersen, hanem SHA-256 lenyomatként
//  tároljuk (egyszerű védelem, nem banki szintű). window.MagicAuth.
// ============================================================

(function () {
  "use strict";

  var USERS_KEY = "magicai_users_v1";
  var CURRENT_KEY = "magicai_current_v1";

  // CSAK ez az e-mail cím léphet be az adminisztrációba. Minden más fiók ki van zárva.
  var ADMIN_EMAIL = "noel.varga1113@gmail.com";

  function load() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(USERS_KEY, JSON.stringify(list)); } catch (e) {}
  }

  // A teljes névből stabil kulcs (ékezet/írásjel nélkül) – ez köti a fiókot
  // a chatekhez is, és ez alapján egyezik a bejelentkezés.
  function keyOf(fullName) {
    return String(fullName || "")
      .trim().toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  }

  // Egyszerű tartalék-hash, ha nincs SubtleCrypto (pl. http:// alatt)
  function fallbackHash(s) {
    var h = 5381, i = s.length;
    while (i) h = (h * 33) ^ s.charCodeAt(--i);
    return "fb" + (h >>> 0).toString(16);
  }

  // Jelszó → hex lenyomat (statikus "só"-val). Mindig Promise-t ad vissza.
  function hash(pw) {
    var salted = "magicai::" + String(pw || "");
    if (window.crypto && window.crypto.subtle && window.TextEncoder) {
      try {
        var data = new TextEncoder().encode(salted);
        return window.crypto.subtle.digest("SHA-256", data).then(function (buf) {
          return Array.prototype.map.call(new Uint8Array(buf), function (b) {
            return ("0" + b.toString(16)).slice(-2);
          }).join("");
        }).catch(function () { return fallbackHash(salted); });
      } catch (e) { /* esik a fallbackre */ }
    }
    return Promise.resolve(fallbackHash(salted));
  }

  // A bejelentkezett felhasználó (érzékeny mezők, pl. hash nélkül), vagy null
  function current() {
    try {
      var k = localStorage.getItem(CURRENT_KEY);
      if (!k) return null;
      var u = load().filter(function (x) { return x.key === k; })[0];
      return u ? { key: u.key, fullName: u.fullName, nick: u.nick, email: u.email, plus: !!u.plus } : null;
    } catch (e) { return null; }
  }

  function emailValid(email) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email || "").trim());
  }

  // Új fiók. A becenév (megszólítás) opcionális – ha üres, a keresztnév lesz.
  function register(o) {
    o = o || {};
    var fullName = String(o.fullName || "").trim();
    var nick = String(o.nick || "").trim();
    var email = String(o.email || "").trim();
    var pass = String(o.password || "");

    if (fullName.length < 2) return Promise.reject(new Error("Add meg a teljes neved (legalább 2 karakter)."));
    if (!nick) nick = fullName.split(/\s+/)[0];
    if (!emailValid(email)) return Promise.reject(new Error("Adj meg egy érvényes e-mail címet."));
    if (pass.length < 4) return Promise.reject(new Error("A jelszó legyen legalább 4 karakter."));

    var list = load();
    var key = keyOf(fullName);
    if (!key) return Promise.reject(new Error("Ez a név nem használható, írd be másképp."));
    if (list.some(function (u) { return u.key === key; })) {
      return Promise.reject(new Error("Ezzel a teljes névvel már van fiók. Jelentkezz be, vagy adj meg másik nevet."));
    }

    return hash(pass).then(function (h) {
      list.push({ key: key, fullName: fullName, nick: nick, email: email, hash: h, created: Date.now() });
      save(list);
      try { localStorage.setItem(CURRENT_KEY, key); } catch (e) {}
      return current();
    });
  }

  // ----- KITILTÁS (admin művelet) -----
  // Egy fiókhoz `ban = { reason, until, at }` tartozhat:
  //   until === 0  → VÉGLEGES kitiltás (jellemzően indokkal),
  //   until  >  0  → IDEIGLENES kitiltás eddig az időpontig (ms).
  // Az aktív tiltást adja vissza (vagy null, ha nincs / lejárt).
  function activeBan(u) {
    var b = u && u.ban;
    if (!b) return null;
    if (b.until && b.until > 0 && Date.now() >= b.until) return null; // lejárt ideiglenes
    return { reason: b.reason || "", until: b.until || 0, at: b.at || 0 };
  }

  // Egy fiók aktív tiltása kulcs alapján (a lejárt ideiglenes tiltást takarítja is)
  function banInfo(key) {
    var list = load();
    var u = list.filter(function (x) { return x.key === key; })[0];
    if (!u) return null;
    var b = activeBan(u);
    if (!b && u.ban) { delete u.ban; save(list); } // lejárt → kitakarítjuk
    return b;
  }

  // Olvasható (magyar) üzenet a tiltásról – a belépő-képernyő ezt mutatja.
  function banMessage(b) {
    if (!b) return "";
    if (b.until && b.until > 0) {
      var d = new Date(b.until);
      var when = d.toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" }) +
                 " " + d.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" });
      var m = "⏳ Ezt a fiókot ideiglenesen kitiltották. Újra beléphetsz: " + when + ".";
      if (b.reason) m += "\nIndok: " + b.reason;
      return m;
    }
    var p = "⛔ Ezt a fiókot véglegesen kitiltották.";
    if (b.reason) p += "\nIndok: " + b.reason;
    return p;
  }

  // Admin: kitiltás. opts = { reason, until } (until=0 → végleges). Az admint nem lehet kitiltani.
  function banUser(key, opts) {
    opts = opts || {};
    var list = load(); var changed = false;
    list.forEach(function (u) {
      if (u.key === key && !sameEmail(u.email, ADMIN_EMAIL)) {
        u.ban = { reason: String(opts.reason || "").trim(), until: opts.until ? Number(opts.until) : 0, at: Date.now() };
        changed = true;
      }
    });
    if (changed) save(list);
    return changed;
  }

  // Admin: kitiltás feloldása
  function unbanUser(key) {
    var list = load(); var changed = false;
    list.forEach(function (u) { if (u.key === key && u.ban) { delete u.ban; changed = true; } });
    if (changed) save(list);
    return changed;
  }

  // Bejelentkezés: TELJES NÉV + JELSZÓ
  function login(fullName, pass) {
    var key = keyOf(fullName);
    var u = load().filter(function (x) { return x.key === key; })[0];
    if (!u) return Promise.reject(new Error("Nincs ilyen nevű fiók. Előbb regisztrálj!"));
    // KITILTÁS: a tiltott fiók nem léphet be (a lejárt ideiglenes tiltást takarítjuk).
    var b = banInfo(key);
    if (b) return Promise.reject(new Error(banMessage(b)));
    return hash(String(pass || "")).then(function (h) {
      if (h !== u.hash) throw new Error("Hibás jelszó. Próbáld újra!");
      try { localStorage.setItem(CURRENT_KEY, u.key); } catch (e) {}
      return current();
    });
  }

  function logout() { try { localStorage.removeItem(CURRENT_KEY); } catch (e) {} }

  // Kulcs a felhasználóhoz kötött tárolókhoz (pl. előző chatek névtere)
  function userKey() { var c = current(); return c ? c.key : "guest"; }

  // E-mailek összevetése (kis-/nagybetűtől és szóközöktől függetlenül)
  function sameEmail(a, b) {
    return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
  }

  // Admin-e az AKTUÁLISAN bejelentkezett fiók? CSAK az ADMIN_EMAIL léphet be.
  function isAdmin() {
    var c = current();
    return !!(c && sameEmail(c.email, ADMIN_EMAIL));
  }

  // Egy tetszőleges e-mail az admin-cím-e (pl. fiók nélküli ellenőrzéshez)
  function isAdminEmail(email) { return sameEmail(email, ADMIN_EMAIL); }

  // Az ÖSSZES helyben regisztrált fiók – érzékeny mező (jelszó-hash) NÉLKÜL.
  // FIGYELEM: ez csak az ezen a böngészőn/eszközön regisztrált fiókokat látja,
  // mert nincs szerver – minden a localStorage-ban él.
  function allUsers() {
    return load().map(function (u) {
      return {
        key: u.key, fullName: u.fullName, nick: u.nick,
        email: u.email, created: u.created, plus: !!u.plus,
        ban: activeBan(u) // aktív tiltás (vagy null)
      };
    });
  }

  // ----- MAGIC AI PLUSZ -----
  // Külön, admintól kapható tagság. CSAK Magic AI plusz taggal érhető el a
  // Magic AI Expert modellje. Az admin (ADMIN_EMAIL) mindig plusz tagnak számít.
  function isPlus() {
    var c = current();
    if (!c) return false;
    if (sameEmail(c.email, ADMIN_EMAIL)) return true; // az admin mindig plusz
    return !!c.plus;
  }

  // Admin művelet: egy fiók Magic AI plusz tagságának be-/kikapcsolása kulcs alapján.
  // Visszaadja az új állapotot (true/false).
  function setPlus(key, on) {
    var list = load();
    var changed = false, value = !!on;
    list.forEach(function (u) {
      if (u.key === key) { u.plus = value; changed = true; }
    });
    if (changed) save(list);
    return value;
  }

  // Fiók törlése kulcs alapján (admin művelet). Ha épp a bejelentkezett
  // fiókot törlik, ki is jelentkeztetjük.
  function deleteUser(key) {
    var list = load().filter(function (u) { return u.key !== key; });
    save(list);
    try { if (localStorage.getItem(CURRENT_KEY) === key) logout(); } catch (e) {}
    return list.length;
  }

  window.MagicAuth = {
    current: current,
    register: register,
    login: login,
    logout: logout,
    userKey: userKey,
    emailValid: emailValid,
    ADMIN_EMAIL: ADMIN_EMAIL,
    isAdmin: isAdmin,
    isAdminEmail: isAdminEmail,
    isPlus: isPlus,
    setPlus: setPlus,
    allUsers: allUsers,
    deleteUser: deleteUser,
    banUser: banUser,
    unbanUser: unbanUser,
    banInfo: banInfo,
    banMessage: banMessage
  };
})();
