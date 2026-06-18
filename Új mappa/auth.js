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
      return u ? { key: u.key, fullName: u.fullName, nick: u.nick, email: u.email } : null;
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

  // Bejelentkezés: TELJES NÉV + JELSZÓ
  function login(fullName, pass) {
    var key = keyOf(fullName);
    var u = load().filter(function (x) { return x.key === key; })[0];
    if (!u) return Promise.reject(new Error("Nincs ilyen nevű fiók. Előbb regisztrálj!"));
    return hash(String(pass || "")).then(function (h) {
      if (h !== u.hash) throw new Error("Hibás jelszó. Próbáld újra!");
      try { localStorage.setItem(CURRENT_KEY, u.key); } catch (e) {}
      return current();
    });
  }

  function logout() { try { localStorage.removeItem(CURRENT_KEY); } catch (e) {} }

  // Kulcs a felhasználóhoz kötött tárolókhoz (pl. előző chatek névtere)
  function userKey() { var c = current(); return c ? c.key : "guest"; }

  window.MagicAuth = {
    current: current,
    register: register,
    login: login,
    logout: logout,
    userKey: userKey,
    emailValid: emailValid
  };
})();
