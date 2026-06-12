// ============================================================
//  MAGIC AI – Kibővített tudásbázis (v1.2)
//  Tömör adattáblákból generáljuk a bejegyzéseket, így a témák
//  száma 1000 fölé nő. A knowledge.js UTÁN kell betölteni!
// ============================================================

(function () {
  "use strict";

  var KB = window.MAGIC_KB = window.MAGIC_KB || [];

  // ---------- ORSZÁGOK ÉS FŐVÁROSAIK ----------
  // Minden ország két témát ad: "mi X fővárosa?" és "melyik ország fővárosa Y?"

  var COUNTRIES = [
    // Európa
    ["Albánia", "Tirana"], ["Andorra", "Andorra la Vella"], ["Ausztria", "Bécs"],
    ["Belgium", "Brüsszel"], ["Bosznia-Hercegovina", "Szarajevó"], ["Bulgária", "Szófia"],
    ["Ciprus", "Nicosia"], ["Csehország", "Prága"], ["Dánia", "Koppenhága"],
    ["Egyesült Királyság", "London"], ["Anglia", "London"], ["Észtország", "Tallinn"],
    ["Fehéroroszország", "Minszk"], ["Finnország", "Helsinki"], ["Franciaország", "Párizs"],
    ["Görögország", "Athén"], ["Hollandia", "Amszterdam"], ["Horvátország", "Zágráb"],
    ["Írország", "Dublin"], ["Izland", "Reykjavík"], ["Lengyelország", "Varsó"],
    ["Lettország", "Riga"], ["Liechtenstein", "Vaduz"], ["Litvánia", "Vilnius"],
    ["Luxemburg", "Luxembourg"], ["Magyarország", "Budapest"], ["Málta", "Valletta"],
    ["Moldova", "Chișinău"], ["Monaco", "Monaco"], ["Montenegró", "Podgorica"],
    ["Németország", "Berlin"], ["Norvégia", "Oslo"], ["Olaszország", "Róma"],
    ["Oroszország", "Moszkva"], ["Portugália", "Lisszabon"], ["Románia", "Bukarest"],
    ["San Marino", "San Marino"], ["Spanyolország", "Madrid"], ["Svájc", "Bern"],
    ["Svédország", "Stockholm"], ["Szerbia", "Belgrád"], ["Szlovákia", "Pozsony"],
    ["Szlovénia", "Ljubljana"], ["Ukrajna", "Kijev"], ["Vatikán", "Vatikánváros"],
    ["Észak-Macedónia", "Szkopje"], ["Koszovó", "Pristina"],
    // Ázsia
    ["Afganisztán", "Kabul"], ["Azerbajdzsán", "Baku"], ["Bahrein", "Manáma"],
    ["Banglades", "Dakka"], ["Bhután", "Thimphu"], ["Brunei", "Bandar Seri Begawan"],
    ["Kambodzsa", "Phnompen"], ["Kína", "Peking"], ["Észak-Korea", "Phenjan"],
    ["Dél-Korea", "Szöul"], ["Fülöp-szigetek", "Manila"], ["Grúzia", "Tbiliszi"],
    ["India", "Újdelhi"], ["Indonézia", "Jakarta"], ["Irak", "Bagdad"],
    ["Irán", "Teherán"], ["Izrael", "Jeruzsálem"], ["Japán", "Tokió"],
    ["Jemen", "Szanaa"], ["Jordánia", "Ammán"], ["Kazahsztán", "Asztana"],
    ["Katar", "Doha"], ["Kirgizisztán", "Biskek"], ["Kuvait", "Kuvaitváros"],
    ["Laosz", "Vientián"], ["Libanon", "Bejrút"], ["Malajzia", "Kuala Lumpur"],
    ["Maldív-szigetek", "Malé"], ["Mongólia", "Ulánbátor"], ["Mianmar", "Najpjidó"],
    ["Nepál", "Katmandu"], ["Omán", "Maszkat"], ["Örményország", "Jereván"],
    ["Pakisztán", "Iszlámábád"], ["Szaúd-Arábia", "Rijád"], ["Szingapúr", "Szingapúr"],
    ["Srí Lanka", "Colombo"], ["Szíria", "Damaszkusz"], ["Tádzsikisztán", "Dusanbe"],
    ["Thaiföld", "Bangkok"], ["Kelet-Timor", "Dili"], ["Törökország", "Ankara"],
    ["Türkmenisztán", "Asgabat"], ["Egyesült Arab Emírségek", "Abu-Dzabi"],
    ["Üzbegisztán", "Taskent"], ["Vietnám", "Hanoi"],
    // Afrika
    ["Algéria", "Algír"], ["Angola", "Luanda"], ["Benin", "Porto-Novo"],
    ["Botswana", "Gaborone"], ["Burkina Faso", "Ouagadougou"], ["Burundi", "Gitega"],
    ["Csád", "N'Djamena"], ["Comore-szigetek", "Moroni"],
    ["Dél-afrikai Köztársaság", "Pretoria"], ["Dél-Szudán", "Dzsuba"],
    ["Dzsibuti", "Dzsibuti"], ["Egyenlítői-Guinea", "Malabo"], ["Egyiptom", "Kairó"],
    ["Elefántcsontpart", "Yamoussoukro"], ["Eritrea", "Aszmara"],
    ["Etiópia", "Addisz-Abeba"], ["Gabon", "Libreville"], ["Gambia", "Banjul"],
    ["Ghána", "Accra"], ["Guinea", "Conakry"], ["Bissau-Guinea", "Bissau"],
    ["Kamerun", "Yaoundé"], ["Kenya", "Nairobi"], ["Kongói Köztársaság", "Brazzaville"],
    ["Kongói Demokratikus Köztársaság", "Kinshasa"],
    ["Közép-afrikai Köztársaság", "Bangui"], ["Lesotho", "Maseru"],
    ["Libéria", "Monrovia"], ["Líbia", "Tripoli"], ["Madagaszkár", "Antananarivo"],
    ["Malawi", "Lilongwe"], ["Mali", "Bamako"], ["Marokkó", "Rabat"],
    ["Mauritánia", "Nouakchott"], ["Mauritius", "Port Louis"], ["Mozambik", "Maputo"],
    ["Namíbia", "Windhoek"], ["Niger", "Niamey"], ["Nigéria", "Abuja"],
    ["Ruanda", "Kigali"], ["São Tomé és Príncipe", "São Tomé"], ["Szenegál", "Dakar"],
    ["Seychelle-szigetek", "Victoria"], ["Sierra Leone", "Freetown"],
    ["Szomália", "Mogadishu"], ["Szudán", "Kartúm"], ["Eswatini", "Mbabane"],
    ["Tanzánia", "Dodoma"], ["Togo", "Lomé"], ["Tunézia", "Tunisz"],
    ["Uganda", "Kampala"], ["Zambia", "Lusaka"], ["Zimbabwe", "Harare"],
    ["Zöld-foki Köztársaság", "Praia"],
    // Amerika
    ["Amerikai Egyesült Államok", "Washington"], ["Antigua és Barbuda", "Saint John's"],
    ["Argentína", "Buenos Aires"], ["Bahama-szigetek", "Nassau"],
    ["Barbados", "Bridgetown"], ["Belize", "Belmopan"], ["Bolívia", "Sucre"],
    ["Brazília", "Brazíliaváros"], ["Chile", "Santiago"], ["Costa Rica", "San José"],
    ["Dominika", "Roseau"], ["Dominikai Köztársaság", "Santo Domingo"],
    ["Ecuador", "Quito"], ["Salvador", "San Salvador"], ["Grenada", "Saint George's"],
    ["Guatemala", "Guatemalaváros"], ["Guyana", "Georgetown"],
    ["Haiti", "Port-au-Prince"], ["Honduras", "Tegucigalpa"], ["Jamaica", "Kingston"],
    ["Kanada", "Ottawa"], ["Kolumbia", "Bogotá"], ["Kuba", "Havanna"],
    ["Mexikó", "Mexikóváros"], ["Nicaragua", "Managua"], ["Panama", "Panamaváros"],
    ["Paraguay", "Asunción"], ["Peru", "Lima"], ["Saint Kitts és Nevis", "Basseterre"],
    ["Saint Lucia", "Castries"], ["Saint Vincent", "Kingstown"],
    ["Suriname", "Paramaribo"], ["Trinidad és Tobago", "Port of Spain"],
    ["Uruguay", "Montevideo"], ["Venezuela", "Caracas"],
    // Óceánia
    ["Ausztrália", "Canberra"], ["Fidzsi", "Suva"], ["Kiribati", "Tarawa"],
    ["Marshall-szigetek", "Majuro"], ["Mikronézia", "Palikir"], ["Nauru", "Yaren"],
    ["Új-Zéland", "Wellington"], ["Palau", "Ngerulmud"],
    ["Pápua Új-Guinea", "Port Moresby"], ["Szamoa", "Apia"],
    ["Salamon-szigetek", "Honiara"], ["Tonga", "Nuku'alofa"],
    ["Tuvalu", "Funafuti"], ["Vanuatu", "Port Vila"]
  ];

  COUNTRIES.forEach(function (c) {
    KB.push({
      t: "fovaros",
      q: ["mi " + c[0] + " fővárosa", c[0] + " fővárosa", "mi a fővárosa " + c[0] + " országnak"],
      a: ["**" + c[0] + "** fővárosa **" + c[1] + "**. 🏙️ Ezt határozottan tudom!"]
    });
    if (c[1] !== c[0]) {
      KB.push({
        t: "fovaros",
        q: ["melyik ország fővárosa " + c[1], c[1] + " melyik ország fővárosa", "melyik országnak a fővárosa " + c[1]],
        a: ["**" + c[1] + "** **" + c[0] + "** fővárosa. 🌍"]
      });
    }
  });

  // ---------- PÉNZNEMEK ----------

  var EURO = ["Németország", "Franciaország", "Olaszország", "Spanyolország", "Ausztria",
    "Szlovákia", "Szlovénia", "Görögország", "Portugália", "Hollandia", "Belgium",
    "Finnország", "Írország", "Horvátország", "Észtország", "Lettország", "Litvánia",
    "Luxemburg", "Málta", "Ciprus"];

  var CURRENCIES = [
    ["Magyarország", "a forint (HUF)"],
    ["az Amerikai Egyesült Államok", "az amerikai dollár (USD)"],
    ["az Egyesült Királyság", "a font sterling (GBP)"],
    ["Japán", "a jen (JPY)"],
    ["Kína", "a jüan, más néven renminbi (CNY)"],
    ["Svájc", "a svájci frank (CHF)"],
    ["Csehország", "a cseh korona (CZK)"],
    ["Lengyelország", "a złoty (PLN)"],
    ["Románia", "a lej (RON)"],
    ["Szerbia", "a szerb dinár (RSD)"],
    ["Oroszország", "az orosz rubel (RUB)"],
    ["Ukrajna", "a hrivnya (UAH)"],
    ["Svédország", "a svéd korona (SEK)"],
    ["Dánia", "a dán korona (DKK)"],
    ["Norvégia", "a norvég korona (NOK)"],
    ["India", "az indiai rúpia (INR)"],
    ["Brazília", "a real (BRL)"],
    ["Mexikó", "a mexikói peso (MXN)"],
    ["Kanada", "a kanadai dollár (CAD)"],
    ["Ausztrália", "az ausztrál dollár (AUD)"],
    ["Új-Zéland", "az új-zélandi dollár (NZD)"],
    ["Törökország", "a török líra (TRY)"],
    ["Izrael", "az új sékel (ILS)"],
    ["Dél-Korea", "a dél-koreai von (KRW)"],
    ["Vietnám", "a dong (VND)"],
    ["Thaiföld", "a baht (THB)"],
    ["Indonézia", "az indonéz rúpia (IDR)"],
    ["Egyiptom", "az egyiptomi font (EGP)"],
    ["a Dél-afrikai Köztársaság", "a rand (ZAR)"],
    ["Argentína", "az argentin peso (ARS)"],
    ["Bulgária", "a leva (BGN)"]
  ];

  EURO.forEach(function (c) { CURRENCIES.push([c, "az euró (EUR)"]); });

  CURRENCIES.forEach(function (c) {
    KB.push({
      t: "penznem",
      q: ["mi " + c[0] + " pénzneme", c[0] + " pénzneme", "milyen pénzzel fizetnek " + c[0] + " területén"],
      a: ["**" + c[0] + "** hivatalos pénzneme **" + c[1] + "**. 💰"]
    });
  });

  // ---------- KÉMIAI ELEMEK (periódusos rendszer, mind a 118) ----------

  var ELEMENTS = [
    ["hidrogén", "H"], ["hélium", "He"], ["lítium", "Li"], ["berillium", "Be"],
    ["bór", "B"], ["szén", "C"], ["nitrogén", "N"], ["oxigén", "O"],
    ["fluor", "F"], ["neon", "Ne"], ["nátrium", "Na"], ["magnézium", "Mg"],
    ["alumínium", "Al"], ["szilícium", "Si"], ["foszfor", "P"], ["kén", "S"],
    ["klór", "Cl"], ["argon", "Ar"], ["kálium", "K"], ["kalcium", "Ca"],
    ["szkandium", "Sc"], ["titán", "Ti"], ["vanádium", "V"], ["króm", "Cr"],
    ["mangán", "Mn"], ["vas", "Fe"], ["kobalt", "Co"], ["nikkel", "Ni"],
    ["réz", "Cu"], ["cink", "Zn"], ["gallium", "Ga"], ["germánium", "Ge"],
    ["arzén", "As"], ["szelén", "Se"], ["bróm", "Br"], ["kripton", "Kr"],
    ["rubídium", "Rb"], ["stroncium", "Sr"], ["ittrium", "Y"], ["cirkónium", "Zr"],
    ["nióbium", "Nb"], ["molibdén", "Mo"], ["technécium", "Tc"], ["ruténium", "Ru"],
    ["ródium", "Rh"], ["palládium", "Pd"], ["ezüst", "Ag"], ["kadmium", "Cd"],
    ["indium", "In"], ["ón", "Sn"], ["antimon", "Sb"], ["tellúr", "Te"],
    ["jód", "I"], ["xenon", "Xe"], ["cézium", "Cs"], ["bárium", "Ba"],
    ["lantán", "La"], ["cérium", "Ce"], ["prazeodímium", "Pr"], ["neodímium", "Nd"],
    ["prométium", "Pm"], ["szamárium", "Sm"], ["európium", "Eu"], ["gadolínium", "Gd"],
    ["terbium", "Tb"], ["diszprózium", "Dy"], ["holmium", "Ho"], ["erbium", "Er"],
    ["túlium", "Tm"], ["itterbium", "Yb"], ["lutécium", "Lu"], ["hafnium", "Hf"],
    ["tantál", "Ta"], ["volfrám", "W"], ["rénium", "Re"], ["ozmium", "Os"],
    ["irídium", "Ir"], ["platina", "Pt"], ["arany", "Au"], ["higany", "Hg"],
    ["tallium", "Tl"], ["ólom", "Pb"], ["bizmut", "Bi"], ["polónium", "Po"],
    ["asztácium", "At"], ["radon", "Rn"], ["francium", "Fr"], ["rádium", "Ra"],
    ["aktínium", "Ac"], ["tórium", "Th"], ["protaktínium", "Pa"], ["urán", "U"],
    ["neptúnium", "Np"], ["plutónium", "Pu"], ["amerícium", "Am"], ["kűrium", "Cm"],
    ["berkélium", "Bk"], ["kalifornium", "Cf"], ["einsteinium", "Es"], ["fermium", "Fm"],
    ["mendelévium", "Md"], ["nobélium", "No"], ["laurencium", "Lr"], ["raderfordium", "Rf"],
    ["dubnium", "Db"], ["sziborgium", "Sg"], ["bohrium", "Bh"], ["hasszium", "Hs"],
    ["meitnérium", "Mt"], ["darmstadtium", "Ds"], ["röntgenium", "Rg"], ["kopernícium", "Cn"],
    ["nihónium", "Nh"], ["fleróvium", "Fl"], ["moszkóvium", "Mc"], ["livermórium", "Lv"],
    ["tennesszium", "Ts"], ["oganeszon", "Og"]
  ];

  ELEMENTS.forEach(function (el, i) {
    KB.push({
      t: "elem",
      q: ["mi a " + el[0] + " vegyjele", el[0] + " vegyjele",
          "hányas rendszámú a " + el[0], "mi a " + el[0] + " rendszáma"],
      a: ["A(z) **" + el[0] + "** vegyjele **" + el[1] + "**, rendszáma **" + (i + 1) + "** a periódusos rendszerben. ⚗️"]
    });
  });

  // ---------- MAGYAR VÁRMEGYÉK ÉS SZÉKHELYEIK ----------

  var COUNTIES = [
    ["Bács-Kiskun", "Kecskemét"], ["Baranya", "Pécs"], ["Békés", "Békéscsaba"],
    ["Borsod-Abaúj-Zemplén", "Miskolc"], ["Csongrád-Csanád", "Szeged"],
    ["Fejér", "Székesfehérvár"], ["Győr-Moson-Sopron", "Győr"],
    ["Hajdú-Bihar", "Debrecen"], ["Heves", "Eger"],
    ["Jász-Nagykun-Szolnok", "Szolnok"], ["Komárom-Esztergom", "Tatabánya"],
    ["Nógrád", "Salgótarján"], ["Pest", "Budapest"], ["Somogy", "Kaposvár"],
    ["Szabolcs-Szatmár-Bereg", "Nyíregyháza"], ["Tolna", "Szekszárd"],
    ["Vas", "Szombathely"], ["Veszprém", "Veszprém"], ["Zala", "Zalaegerszeg"]
  ];

  COUNTIES.forEach(function (m) {
    KB.push({
      t: "megye",
      q: ["mi " + m[0] + " megye székhelye", m[0] + " megye székhelye", m[0] + " vármegye székhelye"],
      a: ["**" + m[0] + "** vármegye székhelye **" + m[1] + "**. 🏛️"]
    });
  });

  // ---------- IRODALOM: KI ÍRTA? ----------

  var BOOKS = [
    ["Toldi", "Arany János"], ["Az ember tragédiája", "Madách Imre"],
    ["Egri csillagok", "Gárdonyi Géza"], ["A Pál utcai fiúk", "Molnár Ferenc"],
    ["János vitéz", "Petőfi Sándor"], ["Nemzeti dal", "Petőfi Sándor"],
    ["A kőszívű ember fiai", "Jókai Mór"], ["Az arany ember", "Jókai Mór"],
    ["Légy jó mindhalálig", "Móricz Zsigmond"], ["Tüskevár", "Fekete István"],
    ["Vuk", "Fekete István"], ["Abigél", "Szabó Magda"],
    ["A Gyűrűk Ura", "J. R. R. Tolkien"], ["A hobbit", "J. R. R. Tolkien"],
    ["Harry Potter", "J. K. Rowling"], ["Rómeó és Júlia", "William Shakespeare"],
    ["Hamlet", "William Shakespeare"], ["A kis herceg", "Antoine de Saint-Exupéry"],
    ["Háború és béke", "Lev Tolsztoj"], ["Anna Karenina", "Lev Tolsztoj"],
    ["Bűn és bűnhődés", "Fjodor Dosztojevszkij"], ["A Mester és Margarita", "Mihail Bulgakov"],
    ["1984", "George Orwell"], ["Állatfarm", "George Orwell"],
    ["Az öreg halász és a tenger", "Ernest Hemingway"], ["Don Quijote", "Miguel de Cervantes"],
    ["Isteni színjáték", "Dante Alighieri"], ["Odüsszeia", "Homérosz"],
    ["Robinson Crusoe", "Daniel Defoe"], ["Gulliver utazásai", "Jonathan Swift"],
    ["Twist Olivér", "Charles Dickens"], ["Micimackó", "A. A. Milne"],
    ["Pinokkió", "Carlo Collodi"], ["A dzsungel könyve", "Rudyard Kipling"],
    ["A három testőr", "Alexandre Dumas"], ["A nyomorultak", "Victor Hugo"]
  ];

  BOOKS.forEach(function (b) {
    KB.push({
      t: "iro",
      q: ["ki írta a " + b[0] + " című művet", "ki írta a " + b[0] + " művet",
          b[0] + " írója", b[0] + " szerzője", "ki a szerzője a " + b[0] + " műnek"],
      a: ["A(z) **" + b[0] + "** szerzője **" + b[1] + "**. 📖"]
    });
  });

  // ---------- TÖRTÉNELEM: MIKOR TÖRTÉNT? ----------

  var HISTORY = [
    ["a honfoglalás", "895 körül", "ekkor érkeztek a magyar törzsek a Kárpát-medencébe"],
    ["az államalapítás", "1000-ben", "ekkor koronázták királlyá Szent Istvánt"],
    ["a tatárjárás", "1241–42-ben", "IV. Béla uralkodása alatt"],
    ["a nándorfehérvári diadal", "1456-ban", "Hunyadi János győzelme a török felett"],
    ["a mohácsi csata", "1526-ban", "ezzel kezdődött a török hódoltság kora"],
    ["Buda visszafoglalása a töröktől", "1686-ban", "a Szent Liga seregei foglalták vissza"],
    ["a Rákóczi-szabadságharc", "1703 és 1711 között", "II. Rákóczi Ferenc vezette"],
    ["az 1848–49-es forradalom és szabadságharc", "1848. március 15-én", "a pesti forradalommal kezdődött"],
    ["a kiegyezés", "1867-ben", "ekkor jött létre az Osztrák–Magyar Monarchia"],
    ["az első világháború", "1914 és 1918 között", "az emberiség egyik legpusztítóbb háborúja"],
    ["a trianoni békeszerződés", "1920. június 4-én", "Magyarország elveszítette területe kétharmadát"],
    ["a második világháború", "1939 és 1945 között", "a történelem legnagyobb háborúja"],
    ["az 1956-os forradalom", "1956. október 23-án", "a szovjet megszállás elleni felkelés"],
    ["a rendszerváltás", "1989–90-ben", "ekkor lett Magyarország újra demokrácia"],
    ["Magyarország EU-csatlakozása", "2004. május 1-jén", "kilenc másik országgal együtt"],
    ["Amerika felfedezése", "1492-ben", "Kolumbusz Kristóf hajózott át az Atlanti-óceánon"],
    ["a francia forradalom", "1789-ben", "a Bastille ostromával kezdődött"],
    ["az első holdra szállás", "1969. július 20-án", "Neil Armstrong lépett először a Holdra"],
    ["a berlini fal leomlása", "1989-ben", "ezzel ért véget a hidegháború korszaka"],
    ["a Titanic elsüllyedése", "1912. április 15-én", "jéghegynek ütközött az Atlanti-óceánon"],
    ["a csernobili atomkatasztrófa", "1986. április 26-án", "a történelem legsúlyosabb nukleáris balesete"],
    ["az első űrrepülés", "1961. április 12-én", "Jurij Gagarin volt az első ember a világűrben"],
    ["a könyvnyomtatás feltalálása", "1440 körül", "Johannes Gutenberg nevéhez fűződik"]
  ];

  HISTORY.forEach(function (h) {
    KB.push({
      t: "tortenelem",
      q: ["mikor volt " + h[0], "mikor történt " + h[0], h[0] + " mikor volt", h[0] + " éve"],
      a: ["**" + h[0].charAt(0).toUpperCase() + h[0].slice(1) + "** **" + h[1] + "** volt – " + h[2] + ". 📜"]
    });
  });

  // ---------- FELTALÁLÓK, FELFEDEZŐK ----------

  var INVENTIONS = [
    ["telefon", "Alexander Graham Bell", "1876-ban szabadalmaztatta"],
    ["villanykörte", "Thomas Edison", "ő tette gyakorlatban is használhatóvá 1879-ben"],
    ["dinamó", "Jedlik Ányos", "magyar feltaláló, a szódavíz gépesítése is az ő nevéhez fűződik"],
    ["golyóstoll", "Bíró László József", "magyar feltaláló, sok nyelven ma is „biro” a toll neve"],
    ["Rubik-kocka", "Rubik Ernő", "magyar feltaláló, 1974-ben alkotta meg"],
    ["C-vitamin", "Szent-Györgyi Albert", "magyar tudós, Nobel-díjat kapott érte 1937-ben"],
    ["biztonsági gyufa", "Irinyi János", "magyar vegyész, a zajtalan gyufa feltalálója"],
    ["rádió", "Guglielmo Marconi", "az első rádiós átvitelt 1895-ben mutatta be"],
    ["könyvnyomtatás", "Johannes Gutenberg", "1440 körül, mozgatható betűkkel"],
    ["dízelmotor", "Rudolf Diesel", "1893-ban szabadalmaztatta"],
    ["dinamit", "Alfred Nobel", "a Nobel-díjat is ő alapította"],
    ["penicillin", "Alexander Fleming", "1928-ban fedezte fel az első antibiotikumot"],
    ["tökéletesített gőzgép", "James Watt", "az ipari forradalom kulcstalálmánya"],
    ["repülőgép", "Wright fivérek", "az első motoros repülés 1903-ban történt"],
    ["benzinmotoros autó", "Karl Benz", "1885–86-ban építette az első automobilt"],
    ["telefonközpont", "Puskás Tivadar", "magyar mérnök, Edison munkatársa volt"],
    ["transzformátor", "Bláthy Ottó, Déri Miksa és Zipernowsky Károly", "magyar mérnökhármas alkotta meg 1885-ben"],
    ["holográfia", "Gábor Dénes", "magyar fizikus, Nobel-díjat kapott érte 1971-ben"],
    ["modern számítógép elvi alapjai", "Neumann János", "magyar matematikus, a Neumann-elvek megalkotója"],
    ["világháló (World Wide Web)", "Tim Berners-Lee", "1989-ben a CERN-ben"],
    ["röntgensugárzás", "Wilhelm Conrad Röntgen", "1895-ben fedezte fel, az első fizikai Nobel-díjat kapta"],
    ["himlő elleni védőoltás", "Edward Jenner", "1796-ban, ez volt az első védőoltás"],
    ["veszettség elleni oltás", "Louis Pasteur", "a pasztörizálás is az ő nevéhez fűződik"],
    ["távíró", "Samuel Morse", "a morzeábécé megalkotója"],
    ["televízió", "John Logie Baird", "az első működő tévéadást 1926-ban mutatta be"]
  ];

  INVENTIONS.forEach(function (inv) {
    KB.push({
      t: "feltalalo",
      q: ["ki találta fel a " + inv[0] + " nevű találmányt", "ki találta fel a " + inv[0],
          inv[0] + " feltalálója", "ki fedezte fel a " + inv[0]],
      a: ["A(z) **" + inv[0] + "** feltalálója/felfedezője **" + inv[1] + "** – " + inv[2] + ". 💡"]
    });
  });

  // ---------- ŰR, BOLYGÓK ----------

  var SPACE = [
    ["Merkúr", "a Naphoz legközelebbi és egyben a legkisebb bolygó. Egy éve mindössze 88 földi nap. ☀️"],
    ["Vénusz", "a Naptól a második bolygó és a legforróbb: a felszínén kb. 460 °C van a sűrű szén-dioxid-légkör miatt. 🔥"],
    ["Föld", "a Naptól a harmadik bolygó – az egyetlen ismert hely a világegyetemben, ahol élet van. 🌍"],
    ["Mars", "a vörös bolygó: a vas-oxidtól (rozsdától) vöröslik. Itt található a Naprendszer legnagyobb vulkánja, az Olympus Mons. 🔴"],
    ["Jupiter", "a Naprendszer legnagyobb bolygója, egy gázóriás. A Nagy Vörös Folt nevű vihara évszázadok óta tombol. 🌪️"],
    ["Szaturnusz", "a gyűrűiről híres gázóriás. A gyűrűk jégből és kőzetdarabokból állnak. 💍"],
    ["Uránusz", "jégóriás, amely az oldalára dőlve forog – mintha gurulna a pályáján. 🧊"],
    ["Neptunusz", "a Naptól legtávolabbi bolygó, ahol a Naprendszer legerősebb szelei fújnak, akár 2000 km/h-val. 💨"],
    ["Plútó", "2006 óta már nem bolygó, hanem törpebolygó – de attól még nagyon érdekes égitest a Kuiper-övben. 🪐"]
  ];

  SPACE.forEach(function (s) {
    KB.push({
      t: "bolygo",
      q: ["milyen bolygó a " + s[0], "mesélj a " + s[0] + " bolygóról", s[0] + " bolygó", "mit tudsz a " + s[0] + " bolygóról"],
      a: ["A(z) **" + s[0] + "** " + s[1]]
    });
  });

  // ---------- ÁLLATI REKORDOK ----------

  var ANIMALS = [
    ["leggyorsabb szárazföldi állat", "a gepárd", "rövid távon akár 110–120 km/h sebességre is képes 🐆"],
    ["legnagyobb állat", "a kék bálna", "akár 30 méter hosszú és 180 tonna is lehet – minden idők legnagyobb állata 🐋"],
    ["legmagasabb állat", "a zsiráf", "akár 5,5–6 méter magasra is megnő 🦒"],
    ["legnagyobb szárazföldi állat", "az afrikai elefánt", "akár 6-7 tonnát is nyomhat 🐘"],
    ["leggyorsabb madár", "a vándorsólyom", "zuhanórepülésben akár 380 km/h-val csap le 🦅"],
    ["legnagyobb madár", "a strucc", "akár 2,7 méter magas és 150 kg – repülni nem tud, de 70 km/h-val fut 🪶"],
    ["legkisebb madár", "a kolibri", "a méhkolibri mindössze 5-6 cm és kb. 2 gramm 🐦"],
    ["legmérgezőbb állat", "a kockamedúza", "a mérge perceken belül halálos lehet 🪼"],
    ["legnagyobb ragadozó hal", "a nagy fehér cápa", "akár 6 méter hosszúra is megnő 🦈"],
    ["legnagyobb hüllő", "a bordás krokodil", "akár 6-7 méter hosszú és 1 tonna is lehet 🐊"],
    ["leghosszabb kígyó", "a hálós piton", "akár 9-10 méter hosszúra is megnőhet 🐍"],
    ["legnagyobb macskaféle", "a tigris", "a szibériai tigris akár 300 kg is lehet 🐯"],
    ["leglassabb emlős", "a lajhár", "óránként csak pár métert tesz meg – de neki így tökéletes 🦥"],
    ["legnagyobb főemlős", "a gorilla", "egy hím akár 200 kg-os is lehet 🦍"],
    ["legokosabb madár", "a holló és a varjúfélék", "szerszámokat használnak és problémákat oldanak meg 🐦‍⬛"]
  ];

  ANIMALS.forEach(function (an) {
    KB.push({
      t: "allat",
      q: ["mi a " + an[0], "melyik a " + an[0], an[0] + " a világon"],
      a: ["A " + an[0] + " **" + an[1] + "** – " + an[2] + "."]
    });
  });

  // ---------- SPORT ----------

  var SPORTS = [
    { q: ["hány játékos van egy focicsapatban", "hányan vannak egy focicsapatban", "hány fős egy focicsapat"],
      a: ["Egy labdarúgócsapatban **11 játékos** van a pályán egyszerre, ebből egy a kapus. ⚽"] },
    { q: ["hány játékos van egy kosárlabdacsapatban", "hányan kosárlabdáznak egy csapatban"],
      a: ["Kosárlabdában csapatonként **5 játékos** van egyszerre a pályán. 🏀"] },
    { q: ["hány játékos van egy kézilabdacsapatban", "hányan kézilabdáznak egy csapatban"],
      a: ["Kézilabdában csapatonként **7 játékos** (6 mezőnyjátékos + 1 kapus) van a pályán. 🤾"] },
    { q: ["hány percig tart egy focimeccs", "meddig tart egy focimeccs", "hány perc egy focimeccs"],
      a: ["Egy labdarúgó-mérkőzés **2 × 45 perc**, azaz 90 perc, plusz a hosszabbítások. ⚽⏱️"] },
    { q: ["hány évente van olimpia", "milyen gyakran van olimpia"],
      a: ["A nyári olimpiát **4 évente** rendezik meg, a téli olimpiát szintén 4 évente, kettő év eltolással. 🏅"] },
    { q: ["hol volt az első újkori olimpia", "mikor volt az első olimpia"],
      a: ["Az első újkori olimpiát **1896-ban Athénban** rendezték. Az ókori olimpiák i. e. 776-tól Olümpiában zajlottak. 🏛️"] },
    { q: ["milyen hosszú egy maraton", "hány km a maraton", "maratoni táv"],
      a: ["A maratoni futás hivatalos távja **42 195 méter** (42,195 km). 🏃"] },
    { q: ["hány karika van az olimpiai zászlón", "mit jelentenek az olimpiai karikák"],
      a: ["Az olimpiai zászlón **5 karika** van – az öt kontinenst jelképezik, amelyek az olimpián összefonódnak. 🏅"] },
    { q: ["hány méteres egy úszómedence az olimpián", "milyen hosszú az olimpiai medence"],
      a: ["Az olimpiai úszómedence **50 méter** hosszú. 🏊"] },
    { q: ["hányszor nyert magyarország vb-t fociban", "volt-e magyar foci vb győzelem"],
      a: ["Magyarország még nem nyert labdarúgó-világbajnokságot, de **kétszer (1938, 1954) döntőt játszott** – az Aranycsapat az '50-es években a világ legjobbja volt! ⚽🇭🇺"] }
  ];

  SPORTS.forEach(function (s) { s.t = "sport"; KB.push(s); });

  // ---------- NYELVEK ----------

  var LANGUAGES = [
    ["Brazíliában", "portugálul"], ["Ausztriában", "németül"], ["Mexikóban", "spanyolul"],
    ["Svájcban", "németül, franciául, olaszul és rétorománul"], ["Belgiumban", "hollandul (flamandul), franciául és németül"],
    ["Kanadában", "angolul és franciául"], ["Egyiptomban", "arabul"], ["Kínában", "kínaiul (mandarin)"],
    ["Indiában", "hindiül és angolul (plusz több mint 20 hivatalos nyelven)"], ["Argentínában", "spanyolul"],
    ["Ausztráliában", "angolul"], ["Japánban", "japánul"], ["Izraelben", "héberül"],
    ["Finnországban", "finnül és svédül"], ["Marokkóban", "arabul és berberül"]
  ];

  LANGUAGES.forEach(function (l) {
    KB.push({
      t: "nyelv",
      q: ["milyen nyelven beszélnek " + l[0], "mi a hivatalos nyelv " + l[0], l[0] + " milyen nyelven beszélnek"],
      a: ["**" + l[0].charAt(0).toUpperCase() + l[0].slice(1) + "** **" + l[1] + "** beszélnek. 🗣️"]
    });
  });

  // ---------- ZENE, MŰVÉSZET ----------

  var ARTS = [
    { q: ["ki írta a himnuszt", "ki szerezte a himnusz zenéjét", "magyar himnusz szerzője"],
      a: ["A **Himnusz** szövegét **Kölcsey Ferenc** írta 1823-ban, zenéjét **Erkel Ferenc** szerezte 1844-ben. 🇭🇺🎵"] },
    { q: ["ki írta a szózatot", "szózat szerzője"],
      a: ["A **Szózat** szövegét **Vörösmarty Mihály** írta, zenéjét **Egressy Béni** szerezte. 🇭🇺"] },
    { q: ["ki szerezte a 9. szimfóniát", "örömóda szerzője", "ki írta az örömódát"],
      a: ["A **9. szimfóniát** – benne az Örömódával – **Ludwig van Beethoven** szerezte. Az Örömóda az Európai Unió himnusza is. 🎼"] },
    { q: ["ki szerezte a varázsfuvolát", "varázsfuvola szerzője"],
      a: ["A **Varázsfuvola** című operát **Wolfgang Amadeus Mozart** szerezte 1791-ben. 🎭"] },
    { q: ["ki szerezte a négy évszakot", "a négy évszak szerzője"],
      a: ["**A négy évszak** hegedűversenyeket **Antonio Vivaldi** szerezte. 🎻"] },
    { q: ["ki szerezte a hattyúk tavát", "hattyúk tava szerzője"],
      a: ["A **Hattyúk tava** balettet **Pjotr Iljics Csajkovszkij** szerezte. 🦢"] },
    { q: ["ki festette a mona lisát", "mona lisa festője"],
      a: ["A **Mona Lisát** **Leonardo da Vinci** festette az 1500-as évek elején. A párizsi Louvre-ban látható. 🖼️"] },
    { q: ["ki festette a csillagos éjt", "csillagos éj festője"],
      a: ["A **Csillagos éj** című festményt **Vincent van Gogh** festette 1889-ben. 🌌"] },
    { q: ["ki festette a guernicát", "guernica festője"],
      a: ["A **Guernicát** **Pablo Picasso** festette 1937-ben, a spanyol polgárháború borzalmai ellen tiltakozva. 🎨"] },
    { q: ["ki volt liszt ferenc", "mesélj liszt ferencről"],
      a: ["**Liszt Ferenc** (1811–1886) a leghíresebb magyar zeneszerző és minden idők egyik legnagyobb zongoraművésze. 🎹"] },
    { q: ["ki volt bartók béla", "mesélj bartók béláról"],
      a: ["**Bartók Béla** (1881–1945) világhírű magyar zeneszerző és népzenekutató – Kodály Zoltánnal együtt ezrével gyűjtötte a magyar népdalokat. 🎵"] },
    { q: ["ki volt kodály zoltán", "mesélj kodály zoltánról"],
      a: ["**Kodály Zoltán** (1882–1967) magyar zeneszerző és zenepedagógus, a világhírű Kodály-módszer megalkotója. 🎶"] },
    { q: ["ki volt munkácsy mihály", "mesélj munkácsy mihályról"],
      a: ["**Munkácsy Mihály** (1844–1900) a leghíresebb magyar festő – fő művei a Krisztus-trilógia és az Ásító inas. 🖌️"] }
  ];

  ARTS.forEach(function (s) { s.t = "muveszet"; KB.push(s); });

})();
