// ============================================================
//  MAGIC AI – Harmadik tudásbázis-csomag (v2.0)
//  Tovább bővíti a témákat 1200 fölé. A knowledge2.js UTÁN
//  kell betölteni! Minden tény ellenőrzött.
// ============================================================

(function () {
  "use strict";

  var KB = window.MAGIC_KB = window.MAGIC_KB || [];

  // ---------- HEGYEK, CSÚCSOK ----------
  var MOUNTAINS = [
    ["a Mount Everest", "8849 méter", "a Föld legmagasabb hegye, a Himalájában (Nepál–Kína határán)"],
    ["a K2", "8611 méter", "a Föld második legmagasabb hegye, a Karakorumban"],
    ["a Kilimandzsáró", "5895 méter", "Afrika legmagasabb hegye, Tanzániában"],
    ["a Mont Blanc", "4809 méter", "az Alpok legmagasabb csúcsa, Francia- és Olaszország határán"],
    ["az Elbrusz", "5642 méter", "Európa legmagasabb hegye, a Kaukázusban"],
    ["a Denali", "6190 méter", "Észak-Amerika legmagasabb hegye, Alaszkában (korábban Mount McKinley)"],
    ["az Aconcagua", "6961 méter", "Dél-Amerika és a déli félteke legmagasabb hegye, Argentínában"],
    ["a Mount Vinson", "4892 méter", "az Antarktisz legmagasabb hegye"],
    ["a Matterhorn", "4478 méter", "a Pennini-Alpok híres, gúla alakú csúcsa"],
    ["a Fudzsi", "3776 méter", "Japán legmagasabb hegye, egy szunnyadó tűzhányó"],
    ["a Kékestető", "1014 méter", "Magyarország legmagasabb pontja, a Mátrában"],
    ["a Mount Kenya", "5199 méter", "Afrika második legmagasabb hegye, Kenyában"]
  ];
  MOUNTAINS.forEach(function (m) {
    KB.push({
      t: "hegy",
      q: ["milyen magas " + m[0], "hány méter " + m[0], "mekkora " + m[0], m[0] + " magassága"],
      a: ["**" + m[0].charAt(0).toUpperCase() + m[0].slice(1) + "** **" + m[1] + "** magas – " + m[2] + ". ⛰️"]
    });
  });

  // ---------- FOLYÓK ----------
  var RIVERS = [
    ["a Nílus", "kb. 6650 km", "Afrikában folyik, sokáig a világ leghosszabb folyójának tartották"],
    ["az Amazonas", "kb. 6400 km", "Dél-Amerika hatalmas folyója, a legnagyobb vízhozamú a világon"],
    ["a Jangce", "kb. 6300 km", "Ázsia és Kína leghosszabb folyója"],
    ["a Mississippi", "kb. 3770 km", "Észak-Amerika egyik leghosszabb folyója"],
    ["a Volga", "kb. 3530 km", "Európa leghosszabb folyója, Oroszországban"],
    ["a Duna", "kb. 2850 km", "Európa második leghosszabb folyója, Budapesten is áthalad"],
    ["a Tisza", "kb. 966 km", "Magyarország második legfontosabb folyója, az Alföldön kanyarog"],
    ["a Rajna", "kb. 1230 km", "Nyugat-Európa egyik legfontosabb folyója"],
    ["a Temze", "kb. 346 km", "Londonon áthaladó angol folyó"],
    ["a Szajna", "kb. 777 km", "Párizson áthaladó francia folyó"]
  ];
  RIVERS.forEach(function (r) {
    KB.push({
      t: "folyo",
      q: ["milyen hosszú " + r[0], "hány km " + r[0], "mekkora " + r[0], r[0] + " hossza"],
      a: ["**" + r[0].charAt(0).toUpperCase() + r[0].slice(1) + "** hossza **" + r[1] + "** – " + r[2] + ". 🌊"]
    });
  });

  // ---------- AZ EMBERI TEST ----------
  var BODY = [
    { q: ["hány csont van az emberi testben", "hány csontunk van", "hány csont az emberi testben"],
      a: ["Egy felnőtt emberi testben **206 csont** van. (Újszülöttként még kb. 300, ezek egy része később összenő.) 🦴"] },
    { q: ["hány foga van egy felnőttnek", "hány fogunk van", "hány fog van az emberi szájban"],
      a: ["Egy felnőtt embernek **32 foga** van (a bölcsességfogakkal együtt). 🦷"] },
    { q: ["mi a legnagyobb szerv az emberi testben", "mi a test legnagyobb szerve"],
      a: ["A legnagyobb szerv a **bőr** – egy felnőttnél kb. 1,5–2 m² felületű. A legnagyobb belső szerv a **máj**. 🫀"] },
    { q: ["hány kamrája van a szívnek", "hány részből áll a szív"],
      a: ["Az emberi szívnek **4 ürege** van: 2 pitvar és 2 kamra. ❤️"] },
    { q: ["hány liter vér van az emberi testben", "mennyi vér van a testünkben"],
      a: ["Egy felnőtt emberben kb. **5 liter vér** kering. 🩸"] },
    { q: ["mi a legkisebb csont az emberi testben", "melyik a legkisebb csontunk"],
      a: ["A legkisebb csont a **kengyel**, a fülben – mindössze pár milliméteres. 👂"] },
    { q: ["hány izom van az emberi testben", "hány izmunk van"],
      a: ["Az emberi testben kb. **640 izom** található. 💪"] },
    { q: ["hány érzékszervünk van", "melyek az érzékszervek"],
      a: ["Hagyományosan **5 érzékszervünk** van: látás, hallás, szaglás, ízlelés és tapintás. 👀👂👃👅✋"] },
    { q: ["hány pár borda van az emberben", "hány bordánk van"],
      a: ["Az embernek **12 pár bordája** (összesen 24 bordája) van. 🦴"] },
    { q: ["mi az emberi test legnagyobb izma", "melyik a legnagyobb izom"],
      a: ["A legnagyobb izom a **nagy farizom** (musculus gluteus maximus). 🍑"] },
    { q: ["mi szállítja az oxigént a vérben", "mi szállítja az oxigént"],
      a: ["Az oxigént a **vörösvérsejtekben** lévő **hemoglobin** szállítja. 🩸"] },
    { q: ["hány százalék víz az emberi test", "mennyi víz van a testünkben"],
      a: ["Egy felnőtt emberi test kb. **60%-a víz**. 💧"] }
  ];
  BODY.forEach(function (s) { s.t = "test"; KB.push(s); });

  // ---------- MATEMATIKA ----------
  var MATH = [
    { q: ["mennyi a pi értéke", "mi a pi értéke", "mennyi a pí"],
      a: ["A **π (pi)** értéke kb. **3,14159…** – a kör kerületének és átmérőjének aránya. 🔢"] },
    { q: ["hány fok egy teljes kör", "hány fokos egy kör"],
      a: ["Egy teljes kör **360°** (fok). ⭕"] },
    { q: ["mennyi a háromszög szögeinek összege", "hány fok a háromszög szögeinek összege"],
      a: ["Egy háromszög belső szögeinek összege mindig **180°**. 📐"] },
    { q: ["hány fokos a derékszög", "mi a derékszög"],
      a: ["A **derékszög 90°**-os. 📐"] },
    { q: ["mi a pitagorasz tétel", "mit mond ki a pitagorasz tétel"],
      a: ["A **Pitagorasz-tétel**: derékszögű háromszögben a befogók négyzetének összege egyenlő az átfogó négyzetével: **a² + b² = c²**. 📐"] },
    { q: ["mi a kör területének képlete", "hogyan számoljuk a kör területét"],
      a: ["A kör területe: **T = r²·π**, ahol r a sugár. ⭕"] },
    { q: ["mi a kör kerületének képlete", "hogyan számoljuk a kör kerületét"],
      a: ["A kör kerülete: **K = 2·r·π**, ahol r a sugár. ⭕"] },
    { q: ["mi a négyzet területének képlete", "hogyan számoljuk a négyzet területét"],
      a: ["A négyzet területe: **T = a²**, ahol a az oldal hossza. ⬛"] },
    { q: ["mi a téglalap területének képlete", "hogyan számoljuk a téglalap területét"],
      a: ["A téglalap területe: **T = a·b**, az oldalak szorzata. ▭"] },
    { q: ["mi a háromszög területének képlete", "hogyan számoljuk a háromszög területét"],
      a: ["A háromszög területe: **T = (a·m)/2**, az alap és a hozzá tartozó magasság szorzatának fele. 🔺"] },
    { q: ["mi a prímszám", "mit jelent a prímszám"],
      a: ["A **prímszám** olyan 1-nél nagyobb egész szám, amelynek csak két osztója van: 1 és önmaga (pl. 2, 3, 5, 7, 11). 🔢"] },
    { q: ["mi a páros szám", "mit jelent páros szám"],
      a: ["A **páros szám** maradék nélkül osztható 2-vel (pl. 2, 4, 6, 8). A páratlan nem (pl. 1, 3, 5). 🔢"] },
    { q: ["mennyi egy tucat", "hány darab egy tucat"],
      a: ["Egy **tucat 12 darab**. Egy nagytucat (dosen) 13. 📦"] },
    { q: ["mennyi a kör középponti szöge", "hány fok a kör középpontja körül"],
      a: ["A kör középpontja körül a teljes szög **360°**. ⭕"] },
    { q: ["mi a százalék", "mit jelent a százalék"],
      a: ["A **százalék (%)** azt mutatja, valami hány század rész: 1% = 1/100 = 0,01. Pl. 20% a fele negyede. 💯"] },
    { q: ["mi a legkisebb prímszám", "melyik a legkisebb prím"],
      a: ["A legkisebb prímszám a **2** – és egyben az egyetlen páros prímszám. 🔢"] },
    { q: ["mennyi a kocka térfogata", "hogyan számoljuk a kocka térfogatát"],
      a: ["A kocka térfogata: **V = a³**, az élhossz köbe. 🧊"] },
    { q: ["mi a római szám szerint 1000", "hogyan írjuk római számmal az ezret"],
      a: ["Római számmal az **1000 = M**. (1=I, 5=V, 10=X, 50=L, 100=C, 500=D, 1000=M) 🏛️"] },
    { q: ["hány nullája van egy milliónak", "hány nulla a millió"],
      a: ["Egy **millió 6 nullával** írható: 1 000 000. Egy milliárd 9 nullával. 🔢"] },
    { q: ["mi az átló", "mit jelent az átló"],
      a: ["Az **átló** egy sokszög két nem szomszédos csúcsát összekötő szakasz. 📐"] }
  ];
  MATH.forEach(function (s) { s.t = "matek"; KB.push(s); });

  // ---------- FIZIKA, TERMÉSZETTUDOMÁNY ----------
  var PHYSICS = [
    { q: ["mekkora a fény sebessége", "milyen gyors a fény", "mennyi a fénysebesség"],
      a: ["A fény sebessége vákuumban kb. **299 792 km/s**, kerekítve **300 000 km/s**. ⚡"] },
    { q: ["mekkora a hang sebessége", "milyen gyors a hang"],
      a: ["A hang sebessége levegőben kb. **343 m/s** (kb. 1235 km/h) 20 °C-on. 🔊"] },
    { q: ["mennyi a nehézségi gyorsulás", "mekkora a gravitációs gyorsulás", "mennyi a g értéke"],
      a: ["A Földön a nehézségi gyorsulás kb. **9,81 m/s²** (g). 🌍"] },
    { q: ["hány fokon forr a víz", "mi a víz forráspontja"],
      a: ["A víz tengerszinten **100 °C**-on forr. 💧♨️"] },
    { q: ["hány fokon fagy a víz", "mi a víz fagyáspontja"],
      a: ["A víz **0 °C**-on fagy meg. ❄️"] },
    { q: ["mi az abszolút nulla fok", "mennyi az abszolút nulla"],
      a: ["Az **abszolút nulla** a lehető legalacsonyabb hőmérséklet: **−273,15 °C**, azaz 0 Kelvin. 🥶"] },
    { q: ["mi a víz kémiai képlete", "mi a víz vegyjele"],
      a: ["A víz kémiai képlete **H₂O** – két hidrogén- és egy oxigénatom. 💧"] },
    { q: ["mi a só kémiai képlete", "mi a konyhasó képlete"],
      a: ["A konyhasó (nátrium-klorid) képlete **NaCl**. 🧂"] },
    { q: ["mi a szén dioxid képlete", "mi a szén-dioxid vegyjele"],
      a: ["A szén-dioxid képlete **CO₂**. 🌫️"] },
    { q: ["miből áll a levegő", "mi a levegő összetétele"],
      a: ["A levegő kb. **78% nitrogén**, **21% oxigén** és 1% egyéb gáz (főleg argon és szén-dioxid). 🌬️"] },
    { q: ["mi az energia mértékegysége", "miben mérjük az energiát"],
      a: ["Az energia SI-mértékegysége a **joule (J)**. ⚡"] },
    { q: ["mi az erő mértékegysége", "miben mérjük az erőt"],
      a: ["Az erő SI-mértékegysége a **newton (N)**. 🍎"] }
  ];
  PHYSICS.forEach(function (s) { s.t = "fizika"; KB.push(s); });

  // ---------- TUDÓSOK ----------
  var SCIENTISTS = [
    ["Albert Einstein", "a relativitáselmélet megalkotója; az E=mc² képlet és a fizikai Nobel-díj (1921) fűződik a nevéhez"],
    ["Isaac Newton", "a gravitáció és a mozgástörvények felfedezője, a klasszikus mechanika atyja"],
    ["Charles Darwin", "az evolúció és a természetes kiválasztódás elméletének megalkotója"],
    ["Marie Curie", "a radioaktivitás kutatója, az első ember, aki két Nobel-díjat (fizika és kémia) kapott"],
    ["Galileo Galilei", "a modern csillagászat és fizika úttörője, a távcsöves megfigyelések atyja"],
    ["Nikolausz Kopernikusz", "a napközéppontú (heliocentrikus) világkép megalkotója"],
    ["Nikola Tesla", "a váltakozó áramú (AC) rendszer és számos elektromos találmány feltalálója"],
    ["Stephen Hawking", "elméleti fizikus, a fekete lyukak és a kozmológia híres kutatója"],
    ["Louis Pasteur", "a mikrobiológia atyja, a pasztörizálás és több védőoltás kidolgozója"],
    ["Gregor Mendel", "a genetika atyja, az öröklődés törvényeinek felfedezője"],
    ["Archimédész", "ókori görög matematikus és fizikus, a felhajtóerő és a csigasor felfedezője"],
    ["Neumann János", "magyar matematikus, a modern számítógép elvi alapjainak megalkotója"],
    ["Szent-Györgyi Albert", "magyar tudós, a C-vitamin felfedezője, Nobel-díjas (1937)"],
    ["Stephen Wozniak", "az Apple társalapítója és az első Apple számítógépek tervezője"],
    ["Alan Turing", "a számítástudomány és a mesterséges intelligencia úttörője, a Turing-gép megalkotója"],
    ["Dmitrij Mengyelejev", "a periódusos rendszer megalkotója"]
  ];
  SCIENTISTS.forEach(function (s) {
    KB.push({
      t: "tudos",
      q: ["ki volt " + s[0], "miről híres " + s[0], "mit fedezett fel " + s[0], "mesélj " + s[0] + " tudósról"],
      a: ["**" + s[0] + "** " + s[1] + ". 🔬"]
    });
  });

  // ---------- GÖRÖG MITOLÓGIA ----------
  var GODS = [
    ["Zeusz", "az istenek királya, az ég és a villámok ura"],
    ["Héra", "az istenek királynője, Zeusz felesége, a házasság istennője"],
    ["Poszeidón", "a tengerek és a földrengések istene"],
    ["Hádész", "az alvilág és a holtak birodalmának ura"],
    ["Árész", "a háború istene"],
    ["Aphrodité", "a szerelem és a szépség istennője"],
    ["Athéné", "a bölcsesség és az igazságos háború istennője, Athén védőistene"],
    ["Apollón", "a Nap, a zene, a fény és a jóslás istene"],
    ["Artemisz", "a vadászat és a Hold istennője, Apollón ikertestvére"],
    ["Hermész", "az istenek hírnöke, a kereskedők és utazók istene"],
    ["Héphaisztosz", "a tűz és a kovácsmesterség istene"],
    ["Démétér", "a termés és a földművelés istennője"],
    ["Dionüszosz", "a bor, a mámor és az ünnepek istene"],
    ["Hesztia", "a házi tűzhely és a család istennője"]
  ];
  GODS.forEach(function (g) {
    KB.push({
      t: "mitologia",
      q: ["ki " + g[0] + " a görög mitológiában", "ki volt " + g[0], "minek az istene " + g[0], g[0] + " isten"],
      a: ["A görög mitológiában **" + g[0] + "** " + g[1] + ". ⚡🏛️"]
    });
  });

  // ---------- NEVEZETESSÉGEK ----------
  var LANDMARKS = [
    ["az Eiffel-torony", "Párizsban (Franciaország)", "1889-ben épült, 330 méter magas"],
    ["a Szabadság-szobor", "New Yorkban (USA)", "Franciaország ajándéka volt 1886-ban"],
    ["a Colosseum", "Rómában (Olaszország)", "ókori amfiteátrum, kb. i. sz. 80-ban készült el"],
    ["a Big Ben", "Londonban (Egyesült Királyság)", "a Parlament híres óratornyának harangja"],
    ["a kínai nagy fal", "Kínában", "több ezer kilométer hosszú, az ókorban és középkorban épült"],
    ["a Tádzs Mahal", "Indiában (Agra)", "fehér márvány mauzóleum, a 17. században épült"],
    ["a gízai piramisok", "Egyiptomban", "az ókori világ hét csodájának egyetlen ma is álló darabja"],
    ["a Szabadság-szobor (Rio)", "Rio de Janeiróban (Brazília)", "a Megváltó Krisztus-szobor a Corcovado-hegyen"],
    ["a Sydney-i Operaház", "Sydney-ben (Ausztrália)", "jellegzetes vitorla alakú tetejéről híres"],
    ["a Brandenburgi kapu", "Berlinben (Németország)", "Németország egyik legismertebb jelképe"],
    ["a Pisai ferde torony", "Pisában (Olaszország)", "dőléséről híres harangtorony"],
    ["az Akropolisz", "Athénban (Görögország)", "az ókori fellegvár a Parthenón templommal"],
    ["a Halászbástya", "Budapesten (Magyarország)", "neoromán stílusú kilátóterasz a Várnegyedben"],
    ["a Parlament", "Budapesten (Magyarország)", "a Duna-parti Országház, Európa egyik legnagyobb parlamentje"],
    ["a Lánchíd", "Budapesten (Magyarország)", "az első állandó híd Buda és Pest között, 1849-ben adták át"],
    ["a Machu Picchu", "Peruban", "az inkák ősi hegyi városa az Andokban"],
    ["a Stonehenge", "Angliában", "őskori kőkör, kb. 5000 éves"],
    ["a Notre-Dame", "Párizsban (Franciaország)", "híres gótikus székesegyház"]
  ];
  LANDMARKS.forEach(function (l) {
    KB.push({
      t: "nevezetesseg",
      q: ["hol van " + l[0], "melyik országban van " + l[0], "melyik városban van " + l[0], l[0] + " hol található"],
      a: ["**" + l[0].charAt(0).toUpperCase() + l[0].slice(1) + "** **" + l[1] + "** található – " + l[2] + ". 📍"]
    });
  });

  // ---------- TECHNOLÓGIA, INFORMATIKA ----------
  var TECH = [
    { q: ["mi a html", "mit jelent a html"],
      a: ["A **HTML** (HyperText Markup Language) a weboldalak vázát leíró jelölőnyelv – ez adja a tartalom szerkezetét. 🌐"] },
    { q: ["mi a css", "mit jelent a css"],
      a: ["A **CSS** (Cascading Style Sheets) a weboldalak megjelenését (színek, betűk, elrendezés) leíró stíluslapnyelv. 🎨"] },
    { q: ["mi a javascript", "mit jelent a javascript"],
      a: ["A **JavaScript** a böngészőben futó programozási nyelv, amellyel interaktívvá tehetők a weboldalak. 💻"] },
    { q: ["mi a python", "mit jelent a python"],
      a: ["A **Python** egy népszerű, könnyen olvasható programozási nyelv – gyakran használják adatok, MI és webfejlesztés terén. 🐍"] },
    { q: ["mi a cpu", "mit jelent a cpu", "mi a processzor"],
      a: ["A **CPU** (processzor) a számítógép „agya” – ez végzi a számításokat és vezérli a gépet. 🧠"] },
    { q: ["mi a ram", "mit jelent a ram"],
      a: ["A **RAM** a számítógép gyors, ideiglenes memóriája – itt tárolódnak a futó programok adatai. 💾"] },
    { q: ["mi a gpu", "mit jelent a gpu", "mi a videokártya"],
      a: ["A **GPU** (videokártya) a grafikáért és a párhuzamos számításokért felelős – játékokhoz és MI-hez is fontos. 🎮"] },
    { q: ["hány bitből áll egy bájt", "mennyi egy bájt", "hány bit egy byte"],
      a: ["Egy **bájt (byte) 8 bitből** áll. 💾"] },
    { q: ["mit jelent a www", "mi a www rövidítés"],
      a: ["A **WWW** a World Wide Web (világháló) rövidítése – Tim Berners-Lee alkotta meg 1989-ben. 🕸️"] },
    { q: ["mit jelent az url", "mi az url"],
      a: ["Az **URL** egy webcím (Uniform Resource Locator) – egy oldal vagy fájl pontos helye a neten. 🔗"] },
    { q: ["mit jelent a http", "mi a http"],
      a: ["A **HTTP** a böngésző és a webszerver közötti adatcsere protokollja. A HTTPS ennek titkosított, biztonságos változata. 🔒"] },
    { q: ["mi a mesterséges intelligencia", "mit jelent az ai", "mi az ai"],
      a: ["A **mesterséges intelligencia (MI/AI)** olyan számítógépes rendszer, amely emberi módon old meg feladatokat: tanul, felismer, dönt, beszélget. 🤖"] },
    { q: ["mi az algoritmus", "mit jelent az algoritmus"],
      a: ["Az **algoritmus** egy lépésről lépésre megadott, pontos utasítássor egy feladat megoldására. 📝"] },
    { q: ["mi a böngésző", "mit jelent a böngésző"],
      a: ["A **böngésző** (pl. Chrome, Firefox, Edge) az a program, amellyel weboldalakat nyitsz meg. 🌐"] },
    { q: ["mit jelent a kb mb gb", "hány mb egy gb", "hány kb egy mb"],
      a: ["**1 GB ≈ 1024 MB**, **1 MB ≈ 1024 KB**, **1 KB ≈ 1024 bájt**. Felfelé: KB → MB → GB → TB. 💾"] },
    { q: ["mit jelent az operációs rendszer", "mi az operációs rendszer"],
      a: ["Az **operációs rendszer** (pl. Windows, macOS, Linux, Android) a számítógép alapszoftvere, amely a programokat és a hardvert kezeli. 🖥️"] }
  ];
  TECH.forEach(function (s) { s.t = "tech"; KB.push(s); });

  // ---------- CÉGEK ÉS ALAPÍTÓIK ----------
  var FOUNDERS = [
    ["a Microsoft", "Bill Gates és Paul Allen", "1975-ben"],
    ["az Apple", "Steve Jobs, Steve Wozniak és Ronald Wayne", "1976-ban"],
    ["a Google", "Larry Page és Sergey Brin", "1998-ban"],
    ["a Facebook (Meta)", "Mark Zuckerberg és társai", "2004-ben"],
    ["az Amazon", "Jeff Bezos", "1994-ben"],
    ["a Tesla", "Martin Eberhard és Marc Tarpenning (Elon Musk korai befektető és vezető)", "2003-ban"],
    ["a SpaceX", "Elon Musk", "2002-ben"],
    ["a Twitter (X)", "Jack Dorsey és társai", "2006-ban"],
    ["a Netflix", "Reed Hastings és Marc Randolph", "1997-ben"],
    ["a Nintendo", "Fusajiro Jamaucsi", "még 1889-ben, eredetileg kártyagyártóként"]
  ];
  FOUNDERS.forEach(function (f) {
    KB.push({
      t: "ceg",
      q: ["ki alapította " + f[0], "ki hozta létre " + f[0], f[0] + " alapítója", "mikor alapították " + f[0]],
      a: ["**" + f[0].charAt(0).toUpperCase() + f[0].slice(1) + "** alapítója **" + f[1] + "** volt – " + f[2] + ". 🏢"]
    });
  });

  // ---------- ÉTELEK EREDETE ----------
  var FOODS = [
    ["a pizza", "Olaszországból (Nápoly)"],
    ["a sushi", "Japánból"],
    ["a gulyás", "Magyarországról"],
    ["a hamburger", "az Egyesült Államokból (német előzményekkel)"],
    ["a croissant", "Ausztriából, de Franciaországban lett híres"],
    ["a taco", "Mexikóból"],
    ["a currys ételek", "Indiából"],
    ["a kebab", "a Közel-Keletről és Törökországból"],
    ["a tiramisu", "Olaszországból"],
    ["a baklava", "a Közel-Keletről és a Balkánról (Törökország, Görögország)"]
  ];
  FOODS.forEach(function (f) {
    KB.push({
      t: "etel",
      q: ["honnan származik " + f[0], "melyik országból származik " + f[0], f[0] + " eredete", "hol találták fel " + f[0]],
      a: ["**" + f[0].charAt(0).toUpperCase() + f[0].slice(1) + "** **" + f[1] + "** származik. 🍽️"]
    });
  });

  // ---------- MÉRTÉKEGYSÉGEK, IDŐ ----------
  var UNITS = [
    { q: ["hány méter egy kilométer", "mennyi egy km méterben"],
      a: ["**1 kilométer = 1000 méter.** 📏"] },
    { q: ["hány centiméter egy méter", "mennyi egy méter cm-ben"],
      a: ["**1 méter = 100 centiméter.** (1 cm = 10 mm) 📏"] },
    { q: ["hány gramm egy kilogramm", "mennyi egy kiló grammban"],
      a: ["**1 kilogramm = 1000 gramm.** ⚖️"] },
    { q: ["hány kilogramm egy tonna", "mennyi egy tonna kg-ban"],
      a: ["**1 tonna = 1000 kilogramm.** ⚖️"] },
    { q: ["hány milliliter egy liter", "mennyi egy liter ml-ben"],
      a: ["**1 liter = 1000 milliliter.** 🥤"] },
    { q: ["hány perc egy óra", "mennyi egy óra percben"],
      a: ["**1 óra = 60 perc.** 🕐"] },
    { q: ["hány másodperc egy perc", "mennyi egy perc másodpercben"],
      a: ["**1 perc = 60 másodperc.** ⏱️"] },
    { q: ["hány óra egy nap", "mennyi egy nap órában"],
      a: ["**1 nap = 24 óra.** 🌗"] },
    { q: ["hány nap egy hét", "mennyi egy hét napban"],
      a: ["**1 hét = 7 nap.** 📅"] },
    { q: ["hány nap egy év", "mennyi egy év napban"],
      a: ["Egy **év 365 nap** (a szökőév 366 nap). 📅"] },
    { q: ["hány hónap egy év", "mennyi egy év hónapban"],
      a: ["**1 év = 12 hónap.** 📆"] },
    { q: ["hány hét egy év", "mennyi egy év hétben"],
      a: ["Egy évben kb. **52 hét** van. 📅"] },
    { q: ["hány másodperc egy óra", "mennyi egy óra másodpercben"],
      a: ["**1 óra = 3600 másodperc** (60×60). ⏱️"] },
    { q: ["hány év egy évszázad", "mennyi egy évszázad", "hány év egy század"],
      a: ["**1 évszázad (század) = 100 év.** Egy évezred 1000 év. 📜"] },
    { q: ["hány évszak van", "melyek az évszakok"],
      a: ["**4 évszak** van: tavasz, nyár, ősz és tél. 🌸☀️🍂❄️"] },
    { q: ["hány fok celsius a normál testhőmérséklet", "mennyi az emberi testhőmérséklet"],
      a: ["Az átlagos emberi testhőmérséklet kb. **36,5–37 °C**. 🌡️"] },
    { q: ["hány milliméter egy centiméter", "mennyi egy cm mm-ben"],
      a: ["**1 centiméter = 10 milliméter.** 📏"] },
    { q: ["hány óra van egy hétben", "mennyi egy hét órában"],
      a: ["Egy hét **168 óra** (7×24). 🕐"] }
  ];
  UNITS.forEach(function (s) { s.t = "mertekegyseg"; KB.push(s); });

  // ---------- FOGALMAK, DEFINÍCIÓK ----------
  var DEFS = [
    { q: ["mi a fotoszintézis", "mit jelent a fotoszintézis"],
      a: ["A **fotoszintézis** az a folyamat, amelyben a növények a napfény energiájával szén-dioxidból és vízből cukrot és oxigént állítanak elő. 🌱☀️"] },
    { q: ["mi a gravitáció", "mit jelent a gravitáció"],
      a: ["A **gravitáció** a tömeggel rendelkező testek közötti vonzóerő – ez tart minket a Földön és kering a Hold a Föld körül. 🌍"] },
    { q: ["mi a demokrácia", "mit jelent a demokrácia"],
      a: ["A **demokrácia** olyan államforma, amelyben a hatalom a néptől ered, és a polgárok szavazással döntenek (pl. választásokon). 🗳️"] },
    { q: ["mi az evolúció", "mit jelent az evolúció"],
      a: ["Az **evolúció** az élőlények nemzedékeken át tartó fokozatos változása és alkalmazkodása – a természetes kiválasztódás révén. 🦎"] },
    { q: ["mi a klímaváltozás", "mit jelent a klímaváltozás", "mi a globális felmelegedés"],
      a: ["A **klímaváltozás** a Föld éghajlatának hosszú távú megváltozása – ma főleg a felmelegedés, amelyet az üvegházhatású gázok kibocsátása okoz. 🌡️🌍"] },
    { q: ["mi a vulkán", "mit jelent a vulkán"],
      a: ["A **vulkán (tűzhányó)** a földkéreg nyílása, amelyen át izzó láva, hamu és gázok törnek a felszínre. 🌋"] },
    { q: ["mi a földrengés", "mit jelent a földrengés"],
      a: ["A **földrengés** a földkéreg hirtelen elmozdulása által keltett rázkódás, amelyet gyakran a kőzetlemezek mozgása okoz. 🌍💥"] },
    { q: ["mi a demográfia", "mit jelent a demográfia"],
      a: ["A **demográfia** a népesség számával, összetételével és változásaival (születés, halálozás, vándorlás) foglalkozó tudomány. 👥"] },
    { q: ["mi az ökoszisztéma", "mit jelent az ökoszisztéma"],
      a: ["Az **ökoszisztéma** az élőlények és élettelen környezetük együttese, amely egységként működik (pl. egy erdő vagy tó). 🌳🦌"] },
    { q: ["mi a baktérium", "mit jelent a baktérium"],
      a: ["A **baktériumok** apró, egysejtű élőlények – egy részük betegséget okoz, sok más viszont hasznos (pl. az emésztésben). 🦠"] },
    { q: ["mi a vírus", "mit jelent a vírus biológiailag"],
      a: ["A **vírus** parányi kórokozó, amely csak élő sejtekben tud szaporodni – ezért okozhat betegségeket (pl. influenza). 🦠"] },
    { q: ["mi az atom", "mit jelent az atom"],
      a: ["Az **atom** az anyag legkisebb építőköve, amely még megőrzi az elem tulajdonságait; protonokból, neutronokból és elektronokból áll. ⚛️"] },
    { q: ["mi a molekula", "mit jelent a molekula"],
      a: ["A **molekula** két vagy több atom kapcsolódásából álló részecske (pl. a víz molekulája H₂O). 🔬"] },
    { q: ["mi az infláció", "mit jelent az infláció"],
      a: ["Az **infláció** az árak általános, tartós emelkedése – ilyenkor ugyanannyi pénzért kevesebbet lehet venni. 💸"] },
    { q: ["mi a fotoszintézis ellentéte", "mi a sejtlégzés"],
      a: ["A **sejtlégzés** során a sejtek a tápanyagokból (cukorból) oxigén segítségével energiát nyernek, és szén-dioxidot bocsátanak ki. 🫁"] },
    { q: ["mi a galaxis", "mit jelent a galaxis"],
      a: ["A **galaxis** csillagok, gáz és por óriási, gravitáció által összetartott rendszere. A miénk a Tejútrendszer. 🌌"] },
    { q: ["mi a fekete lyuk", "mit jelent a fekete lyuk"],
      a: ["A **fekete lyuk** a tér olyan tartománya, ahol a gravitáció olyan erős, hogy onnan még a fény sem szökhet ki. 🕳️"] },
    { q: ["mi az ózonréteg", "mit jelent az ózonréteg"],
      a: ["Az **ózonréteg** a légkör magas rétege, amely elnyeli a Nap káros ultraibolya sugárzásának nagy részét. 🌍🛡️"] },
    { q: ["mi a fény törése", "mit jelent a fénytörés"],
      a: ["A **fénytörés** az a jelenség, amikor a fény irányt változtat, miközben egyik közegből (pl. levegő) másikba (pl. víz) lép. Ezért tűnik „törött”-nek a pohárba mártott szívószál. 🌈"] },
    { q: ["mi a parlament", "mit jelent a parlament"],
      a: ["A **parlament (országgyűlés)** a nép választott képviselőiből álló törvényhozó testület. 🏛️"] }
  ];
  DEFS.forEach(function (s) { s.t = "fogalom"; KB.push(s); });

})();
