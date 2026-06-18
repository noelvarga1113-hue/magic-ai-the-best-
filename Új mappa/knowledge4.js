// ============================================================
//  MAGIC AI – Negyedik tudáscsomag: HÁZI FELADAT MÓDSZEREK (v2.0)
//  Kidolgozott példák és módszerek minden tantárgyból, hogy a
//  Házi feladat funkció tisztán, magyarázattal válaszoljon.
//  A knowledge3.js UTÁN töltődik.
// ============================================================

(function () {
  "use strict";
  var KB = window.MAGIC_KB = window.MAGIC_KB || [];
  function add(list, type) { list.forEach(function (e) { e.t = type; KB.push(e); }); }

  // ---------- MAGYAR NYELVTAN ----------
  add([
    { q: ["mi a főnév", "mit jelent a főnév", "főnév példa"],
      a: ["A **főnév** élőlények, tárgyak, fogalmak neve. Kérdése: *ki? mi?* Példák: kutya, asztal, szeretet, Budapest. 📚"] },
    { q: ["mi az ige", "mit jelent az ige", "ige példa"],
      a: ["Az **ige** cselekvést, történést vagy létezést fejez ki. Kérdése: *mit csinál?* Példák: fut, olvas, esik, van. 🏃"] },
    { q: ["mi a melléknév", "mit jelent a melléknév", "melléknév példa"],
      a: ["A **melléknév** tulajdonságot fejez ki. Kérdése: *milyen? melyik? mekkora?* Példák: piros, nagy, okos, kedves. 🎨"] },
    { q: ["mi a számnév", "mit jelent a számnév"],
      a: ["A **számnév** mennyiséget vagy sorrendet fejez ki. Kérdése: *hány? hányadik?* Példák: három, sok, második. 🔢"] },
    { q: ["mi a névmás", "mit jelent a névmás"],
      a: ["A **névmás** más szót helyettesít (főnevet, melléknevet, számnevet). Példák: én, te, ő, ez, az, aki, valaki. 👉"] },
    { q: ["mi a névelő", "mit jelent a névelő"],
      a: ["A **névelő** a főnév előtt áll. Határozott: *a, az*; határozatlan: *egy*. Pl. **a** ház, **egy** alma. 🔤"] },
    { q: ["hány betű a magyar ábécé", "hány betűből áll a magyar ábécé"],
      a: ["A magyar ábécé **44 betűből** áll (a kétjegyű és a háromjegyű *dzs* betűvel együtt). 🔡"] },
    { q: ["mik a magánhangzók", "hány magánhangzó van a magyarban"],
      a: ["A magyarban **14 magánhangzó** van: a, á, e, é, i, í, o, ó, ö, ő, u, ú, ü, ű. A többi betű mássalhangzó. 🅰️"] },
    { q: ["mikor írunk j-t és mikor ly-t", "j vagy ly", "j és ly szabály"],
      a: ["A **j** és az **ly** ugyanúgy hangzik, ezért a helyes írást meg kell tanulni (pl. *jég, ujj* – de *lyuk, gally, súly*). Tipp: szócsaládokkal és gyakorlással rögzül. ✍️"] },
    { q: ["milyen mondatfajták vannak", "mondatfajták fajtái"],
      a: ["Mondatfajták a beszélő szándéka szerint: **kijelentő** (.), **kérdő** (?), **felkiáltó** (!), **felszólító** (!) és **óhajtó** (! – bárcsak…). 💬"] },
    { q: ["milyen igeidők vannak a magyarban", "magyar igeidők"],
      a: ["A magyarban **3 igeidő** van: **múlt** (olvastam), **jelen** (olvasok) és **jövő** (olvasni fogok). ⏳"] },
    { q: ["mi az igekötő", "mit jelent az igekötő"],
      a: ["Az **igekötő** az ige előtt áll, és módosítja a jelentését. Pl. *meg*ír, *el*megy, *be*csuk. ➡️"] },
    { q: ["mi a szótő és a toldalék", "mi a toldalék"],
      a: ["A **szótő** a szó alapja, a **toldalék** a végéhez kapcsolódik. Pl. *ház-ak-ban*: tő = ház, toldalékok = -ak, -ban. 🧩"] },
    { q: ["mi az egyszerű és az összetett mondat", "egyszerű vagy összetett mondat"],
      a: ["Az **egyszerű mondatban** egy állítmány van, az **összetett mondatban** több tagmondat (és több állítmány), pl. *Esik az eső, ezért itthon maradok.* 🔗"] }
  ], "nyelvtan");

  // ---------- IRODALOM ----------
  add([
    { q: ["mi a hasonlat", "mit jelent a hasonlat", "hasonlat példa"],
      a: ["A **hasonlat** két dolgot a *mint, akár, olyan… mint* szóval vet össze. Pl. *Erős, **mint** a medve.* 🐻"] },
    { q: ["mi a metafora", "mit jelent a metafora", "metafora példa"],
      a: ["A **metafora** rejtett hasonlat: a hasonlító szó nélkül azonosít. Pl. *A szerelem tűz.* 🔥"] },
    { q: ["mi a megszemélyesítés", "mit jelent a megszemélyesítés"],
      a: ["A **megszemélyesítés** élettelen dolognak ad emberi tulajdonságot. Pl. *Sír az ég.* ☁️"] },
    { q: ["mi az alliteráció", "mit jelent az alliteráció"],
      a: ["Az **alliteráció** a szókezdő hangok ismétlése. Pl. *Mese, mese, mátka…* A betűrím a vers zenéjét erősíti. 🎵"] },
    { q: ["mi a rím", "mit jelent a rím", "milyen rímfajták vannak"],
      a: ["A **rím** a sorvégek hangzásbeli egyezése. Fajtái: páros (aabb), keresztrím (abab), ölelkező (abba). 🎶"] },
    { q: ["mi a versszak", "mi a strófa"],
      a: ["A **versszak** (strófa) a vers sorokból álló egysége, amelyet üres sor választ el a következőtől. 📜"] },
    { q: ["mi a líra epika dráma", "mik a műnemek"],
      a: ["A három **műnem**: **líra** (érzelmek, vers), **epika** (történet, elbeszélés), **dráma** (párbeszéd, színpadra). 🎭"] },
    { q: ["mi a novella", "mit jelent a novella"],
      a: ["A **novella** rövid, egy szálon futó, csattanóra kihegyezett prózai elbeszélés. ✒️"] },
    { q: ["mi az eposz", "mit jelent az eposz"],
      a: ["Az **eposz** nagy terjedelmű elbeszélő költemény, amely egy hős nagy tetteit mondja el (pl. Odüsszeia). 🏛️"] },
    { q: ["mi a ballada", "mit jelent a ballada"],
      a: ["A **ballada** tragikus témájú, párbeszédes, szaggatott elbeszélő költemény – „tündérmese drámai szerkezetben”. 🌑"] },
    { q: ["mi a szókép", "mit jelent a szókép"],
      a: ["A **szókép** (trópus) a szavak átvitt értelmű használata: ide tartozik a metafora, a hasonlat, a megszemélyesítés. 🖋️"] }
  ], "irodalom");

  // ---------- MATEK MÓDSZEREK ----------
  add([
    { q: ["mi a műveletek sorrendje", "milyen sorrendben kell számolni", "műveleti sorrend"],
      a: ["A **műveleti sorrend**: 1) zárójel, 2) hatványozás/gyökvonás, 3) szorzás és osztás (balról jobbra), 4) összeadás és kivonás. Pl. 2 + 3·4 = 2 + 12 = 14. 🧮"] },
    { q: ["hogyan kell törteket összeadni", "törtek összeadása", "hogyan adjunk össze törteket"],
      a: ["**Törtek összeadása:** közös nevezőre hozzuk őket, majd a számlálókat adjuk össze. Pl. 1/2 + 1/3 = 3/6 + 2/6 = **5/6**. ➗"] },
    { q: ["hogyan kell törteket szorozni", "törtek szorzása"],
      a: ["**Törtek szorzása:** számlálót a számlálóval, nevezőt a nevezővel. Pl. 2/3 · 3/4 = 6/12 = **1/2**. ✖️"] },
    { q: ["hogyan kell kerekíteni", "kerekítés szabálya"],
      a: ["**Kerekítés:** ha a következő számjegy 0–4, lefelé kerekítünk (marad), ha 5–9, felfelé. Pl. 47 tízesre = **50**, 43 = **40**. 🔢"] },
    { q: ["hogyan kell egyenletet megoldani", "egyenlet megoldása lépések"],
      a: ["**Egyenlet megoldása:** 1) bontsd fel a zárójeleket, 2) gyűjtsd a változót az egyik, a számokat a másik oldalra, 3) oszd el a változó együtthatójával. Pl. 2x + 3 = 11 → 2x = 8 → **x = 4**. 📐"] },
    { q: ["hogyan számolunk százalékot", "százalékszámítás módszer"],
      a: ["**Százalékszámítás:** egy szám p százaléka = szám · p / 100. Pl. 200 15%-a = 200 · 15 / 100 = **30**. 💯"] },
    { q: ["mi a kerület terület térfogat", "mi a különbség kerület terület térfogat között"],
      a: ["**Kerület**: a síkidom határvonalának hossza. **Terület**: a síkidom által befedett felület. **Térfogat**: a test által elfoglalt tér nagysága. 📏"] },
    { q: ["hogyan váltunk mértékegységet", "mértékegység átváltás"],
      a: ["**Átváltás:** kisebb egységre *szorzunk*, nagyobbra *osztunk*. Pl. 1 m = 100 cm (·100); 250 cm = 2,5 m (:100). 📐"] }
  ], "matek");

  // ---------- FÖLDRAJZ ----------
  add([
    { q: ["hány kontinens van", "hány földrész van", "kontinensek száma"],
      a: ["**7 kontinens** van: Ázsia, Afrika, Észak-Amerika, Dél-Amerika, Antarktisz, Európa és Ausztrália. 🌍"] },
    { q: ["hány óceán van", "óceánok száma", "melyek az óceánok"],
      a: ["**5 óceán** van: a Csendes-, az Atlanti-, az Indiai-, a Jeges- és a Déli-óceán. 🌊"] },
    { q: ["mi az egyenlítő", "mit jelent az egyenlítő"],
      a: ["Az **Egyenlítő** a Földet két félgömbre (északi és déli) osztó képzeletbeli kör, a 0°-os szélességi kör. 🌐"] },
    { q: ["melyek a fő égtájak", "hány égtáj van", "fő égtájak"],
      a: ["A **4 fő égtáj**: észak, dél, kelet, nyugat. A mellék-égtájak: ÉK, DK, DNy, ÉNy. 🧭"] },
    { q: ["mi a vízkörforgás", "hogyan működik a vízkörforgás"],
      a: ["A **vízkörforgás**: a víz elpárolog → felhő képződik (lecsapódás) → csapadékként visszahull → a folyókon át a tengerbe jut, és kezdődik elölről. 💧"] },
    { q: ["mi a bolygók sorrendje", "naprendszer bolygói sorrendben"],
      a: ["A Naptól kifelé: **Merkúr, Vénusz, Föld, Mars, Jupiter, Szaturnusz, Uránusz, Neptunusz.** 🪐"] }
  ], "foldrajz");

  // ---------- BIOLÓGIA ----------
  add([
    { q: ["mi a sejt", "mit jelent a sejt", "mi a sejt fő része"],
      a: ["A **sejt** az élőlények legkisebb élő egysége. Fő részei: sejthártya, citoplazma és sejtmag (a növényi sejtnek sejtfala és zöld színtestje is van). 🔬"] },
    { q: ["mi a különbség a gerinces és gerinctelen állat között", "mi a gerinctelen állat"],
      a: ["A **gerinces** állatnak van gerincoszlopa (hal, kétéltű, hüllő, madár, emlős), a **gerinctelennek** nincs (rovar, csiga, féreg). 🦴"] },
    { q: ["mik az emlősök jellemzői", "mi jellemző az emlősökre"],
      a: ["Az **emlősök** szőrösek, elevenszülők, tejjel táplálják kicsinyeiket, és melegvérűek. Pl. kutya, ember, bálna. 🐾"] },
    { q: ["mi a tápláléklánc", "mit jelent a tápláléklánc"],
      a: ["A **tápláléklánc** azt mutatja, ki kit eszik: növény → növényevő → ragadozó. Pl. fű → nyúl → róka. 🌿🐰🦊"] },
    { q: ["mik a növény részei", "egy növény részei"],
      a: ["Egy növény fő részei: **gyökér** (vizet vesz fel), **szár** (tart és szállít), **levél** (fotoszintézis), **virág** (szaporodás). 🌱"] }
  ], "biologia");

  // ---------- KÉMIA / FIZIKA ----------
  add([
    { q: ["mik a halmazállapotok", "hány halmazállapot van"],
      a: ["Három fő **halmazállapot**: **szilárd** (jég), **folyékony** (víz) és **légnemű** (vízgőz). 🧊💧💨"] },
    { q: ["mik a halmazállapot-változások", "olvadás párolgás fagyás"],
      a: ["**Halmazállapot-változások:** olvadás (szilárd→folyékony), fagyás (folyékony→szilárd), párolgás/forrás (folyékony→gáz), lecsapódás (gáz→folyékony), szublimáció (szilárd→gáz). 🔁"] },
    { q: ["mi a fizikai és a kémiai változás", "mi a különbség fizikai és kémiai változás között"],
      a: ["A **fizikai változásnál** csak a forma/halmazállapot változik (pl. jég olvadása), a **kémiai változásnál** új anyag keletkezik (pl. égés, rozsdásodás). ⚗️"] },
    { q: ["mik az energiafajták", "milyen energiafajták vannak"],
      a: ["Energiafajták pl.: **mozgási** (mozgó test), **helyzeti** (magasban lévő test), **hő-, fény-, elektromos** és **kémiai** energia. ⚡"] },
    { q: ["mi a sav és a lúg", "mi a ph"],
      a: ["A **savak** pH-ja 7 alatt van (pl. citromlé), a **lúgoké** 7 felett (pl. szappan), a **semleges** víz pH-ja 7. 🧪"] }
  ], "termeszettudomany");

  // ---------- ANGOL ----------
  add([
    { q: ["hogyan ragozzuk a to be igét", "to be ragozása", "am is are"],
      a: ["A **to be** (lenni): I **am**, you **are**, he/she/it **is**, we/you/they **are**. Pl. *I am happy.* 🇬🇧"] },
    { q: ["számok angolul 1-10", "hogy van angolul az egytől tízig", "angol számok"],
      a: ["1–10 angolul: **one, two, three, four, five, six, seven, eight, nine, ten.** 🔢"] },
    { q: ["a hét napjai angolul", "hogy vannak a napok angolul"],
      a: ["A hét napjai: **Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.** 📅"] },
    { q: ["mikor a és mikor an angolul", "a vagy an angol"],
      a: ["Az **a** mássalhangzó-hang előtt áll (*a dog*), az **an** magánhangzó-hang előtt (*an apple*). 🔤"] },
    { q: ["hogyan képezzük a többes számot angolul", "angol többes szám szabály"],
      a: ["Általában **-s** a végződés (*cat → cats*). -s, -sh, -ch, -x után **-es** (*box → boxes*). Vannak rendhagyók: *child → children*. 📝"] },
    { q: ["mik az angol színek", "színek angolul"],
      a: ["Színek: **red** (piros), **blue** (kék), **green** (zöld), **yellow** (sárga), **black** (fekete), **white** (fehér). 🎨"] }
  ], "angol");

  // ---------- TANULÁS, FOGALMAZÁS MÓDSZER ----------
  add([
    { q: ["hogyan írjunk fogalmazást", "hogyan kell fogalmazást írni", "fogalmazás felépítése"],
      a: ["Egy jó **fogalmazás** három részből áll: **Bevezetés** (felvezeted a témát), **Tárgyalás** (kifejted, példákkal), **Befejezés** (összegzed, véleményt mondasz). Tipp: a 📸 Házi feladat funkcióban írok is neked egyet, ha megadod a témát! ✍️"] },
    { q: ["hogyan tanuljunk meg egy verset", "hogyan tanuljak verset"],
      a: ["**Verstanulás:** olvasd el többször, értsd meg a tartalmát, tanuld versszakonként, mondd hangosan, és ismételd elalvás előtt – így rögzül a legjobban. 📖"] },
    { q: ["hogyan oldjak meg egy szöveges feladatot", "szöveges feladat módszer"],
      a: ["**Szöveges feladat:** 1) olvasd el figyelmesen, 2) írd ki az adatokat, 3) keresd meg, mit kérdez, 4) tervezz műveletet, 5) számolj, 6) ellenőrizd a választ. 🧠"] }
  ], "tanulas");

})();
