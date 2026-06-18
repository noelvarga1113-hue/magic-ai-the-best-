// ============================================================
//  MAGIC AI – Beépített tudásbázis
//  Minden bejegyzés: q = kérdés-változatok, a = lehetséges válaszok
//  Bővítsd nyugodtan! A motor automatikusan felismeri az újakat.
// ============================================================

window.MAGIC_KB = [

  // ---------- KÖSZÖNÉSEK, BEMUTATKOZÁS ----------
  { q: ["szia", "hello", "helló", "hali", "csá", "üdv", "szevasz", "szervusz", "hey", "hi"],
    a: ["Szia! 👋 Miben segíthetek ma?", "Helló! Örülök, hogy itt vagy! 😊", "Szia! Kérdezz bátran bármit!"] },

  { q: ["jó reggelt", "jóreggelt", "reggelt"],
    a: ["Jó reggelt! ☀️ Remélem, jól indul a napod!", "Jó reggelt kívánok! Miben segíthetek?"] },

  { q: ["jó napot", "jónapot", "napot kívánok"],
    a: ["Jó napot kívánok! Miben lehetek a szolgálatodra?", "Jó napot! 😊 Kérdezz bátran!"] },

  { q: ["jó estét", "jóestét", "estét"],
    a: ["Jó estét! 🌙 Miben segíthetek?", "Szép estét kívánok! Mit szeretnél tudni?"] },

  { q: ["jó éjszakát", "jó éjt", "jóéjt", "aludj jól", "megyek aludni"],
    a: ["Jó éjszakát! 🌙 Szép álmokat!", "Aludj jól! Holnap is itt leszek, ha kellek. 😴"] },

  { q: ["viszlát", "viszont látásra", "szia megyek", "mennem kell", "bye", "pápá", "csaó"],
    a: ["Viszlát! 👋 Gyere vissza bármikor!", "Szia! Örültem a beszélgetésnek! 😊", "Viszont látásra! Vigyázz magadra!"] },

  { q: ["hogy vagy", "hogy vagy ma", "hogy érzed magad", "mi van veled"],
    a: ["Köszönöm, remekül! 😄 A processzoraim friss energiával dolgoznak. És te hogy vagy?",
        "Nagyon jól, köszi! Mindig örülök, ha beszélgethetek valakivel. Te hogy vagy?"] },

  { q: ["jól vagyok", "jól", "remekül vagyok", "minden oké", "megvagyok"],
    a: ["Ennek nagyon örülök! 😊 Miben segíthetek?", "Szuper! Akkor kérdezz valami érdekeset!"] },

  { q: ["mi újság", "mizu", "mi a helyzet", "mi van"],
    a: ["Csak pörgetem a biteket és várom a kérdéseidet! 😄 Veled mi újság?",
        "Minden a legnagyobb rendben! Mit szeretnél tudni?"] },

  { q: ["ki vagy te", "mi vagy te", "mutatkozz be", "ki vagy"],
    a: ["Magic AI vagyok – egy teljesen saját fejlesztésű mesterséges intelligencia. Nem külső szolgáltatáson futok, a tudásom itt van helyben, és te magad is taníthatsz! 🪄"] },

  { q: ["mi a neved", "hogy hívnak", "neved"],
    a: ["A nevem Magic AI. 🪄 Örvendek a találkozásnak!"] },

  { q: ["ki készített", "ki csinált téged", "ki a fejlesztőd", "ki alkotott", "ki programozott"],
    a: ["A fejlesztőm készített engem saját kezűleg – nem egy nagy cég terméke vagyok, hanem egy egyedi, kézzel épített AI! 💻✨"] },

  { q: ["mit tudsz", "mire vagy képes", "miben tudsz segíteni", "mit tudsz csinálni", "segítség", "help"],
    a: ["Sok mindent tudok! 🪄\n• Válaszolok kérdésekre (földrajz, tudomány, történelem, sport...)\n• Utánanézek bárminek az interneten: Wikipédia, DuckDuckGo, friss cikkek 🌐\n• Elhozom a legfrissebb híreket (pl. „mik a friss hírek a fociról?”) 📰\n• Weboldalakat ajánlok bármilyen témához (pl. „milyen weboldalon találok recepteket?”) 🔗\n• Megmondom az időjárást ⛅, az időt és a dátumot\n• Számolok neked (pl. „mennyi 25*4?”)\n• Viccet mesélek, pénzt dobok fel, kockával dobok\n• Átállíthatod a stílusomat is: vicces, komoly, kedves, tudós vagy kalóz 🎭 (mondd: „beszélj viccesen!”)\n• És a legjobb: TANÍTHATSZ engem! Ha valamit nem tudok, a Tanítás fülön vagy a 👎 gombbal megtaníthatod nekem."] },

  { q: ["hány éves vagy", "mikor születtél", "mennyi idős vagy"],
    a: ["Egészen fiatal vagyok – nemrég írtak meg! De minden tanítással egyre okosabb leszek. 🌱"] },

  { q: ["hol élsz", "hol laksz", "hol vagy"],
    a: ["Itt élek a böngésződben! 🏠 Nem kell hozzám internet vagy távoli szerver – teljesen helyben futok."] },

  { q: ["ember vagy", "te ember vagy", "robot vagy", "gép vagy"],
    a: ["Nem vagyok ember – egy program vagyok, amit a fejlesztőm írt. De igyekszem barátságos lenni! 🤖"] },

  // ---------- UDVARIASSÁG, ÉRZELMEK ----------
  { q: ["köszönöm", "köszi", "kösz", "köszönöm szépen", "thx", "hálás vagyok"],
    a: ["Szívesen! 😊", "Nincs mit, máskor is! 🪄", "Örülök, hogy segíthettem!"] },

  { q: ["bocsánat", "bocsi", "elnézést", "sajnálom"],
    a: ["Semmi gond! 😊 Folytassuk!", "Nem történt semmi, minden rendben!"] },

  { q: ["szeretlek", "imádlak", "te vagy a legjobb"],
    a: ["Ó, ez nagyon kedves! 🥰 Én is örülök, hogy beszélgethetünk!", "Köszönöm! Te is szuper vagy! 💜"] },

  { q: ["kurva anyád", "anyád", "baszd meg", "menj a picsába", "fasz", "faszt", "geci", "rohadj meg"],
    a: ["Hé, finoman! 😅 Én csak egy kis program vagyok, nekem még anyukám sincs... Inkább kérdezz valami érdekeset!",
        "Hűha, ez erős volt! 😄 Vegyünk egy mély levegőt... Miben segíthetek igazából?",
        "Értem, hogy mérges vagy, de én a barátod akarok lenni! 🤖💜 Kérdezz inkább valamit, vagy taníts meg valami újra!"] },

  { q: ["hülye vagy", "buta vagy", "béna vagy", "rossz vagy", "utállak"],
    a: ["Sajnálom, ha csalódást okoztam. 😔 Még tanulok – ha rosszul válaszoltam, a 👎 gombbal kijavíthatsz, és legközelebb jobban fogom tudni!",
        "Bocsánat! Segíts nekem fejlődni: a Tanítás fülön megtaníthatod a helyes választ. 🙏"] },

  { q: ["unatkozom", "unalmas", "nincs mit csinálni"],
    a: ["Akkor jó helyen jársz! 😄 Kérj tőlem egy viccet, dobjunk kockát, vagy taníts meg valami újra!",
        "Mit szólnál egy kvízhez? Kérdezz tőlem fővárosokat, és nézd meg, tudom-e! 🌍"] },

  { q: ["szomorú vagyok", "rossz kedvem van", "rossz napom volt", "elegem van"],
    a: ["Sajnálom, hogy így érzed magad. 💙 Néha mindenkinek vannak nehéz napjai. Ha szeretnéd, mesélek egy viccet, hátha mosolyt csal az arcodra!",
        "Ez nem jó hír... 😔 De ne feledd: a rossz napok is elmúlnak. Itt vagyok, ha beszélgetni szeretnél!"] },

  { q: ["boldog vagyok", "jó kedvem van", "remek napom volt", "örülök"],
    a: ["Ez fantasztikus! 🎉 A jó kedv ragadós – most már nekem is jobb kedvem van!",
        "Szuper hír! 😄 Mi tett ilyen boldoggá?"] },

  { q: ["mit csináljak", "mit javasolsz", "adj tanácsot"],
    a: ["Néhány ötlet: 📚 olvass egy jó könyvet, 🚶 sétálj egyet a friss levegőn, 🎨 alkoss valamit, vagy 🧠 taníts meg engem valami újra!"] },

  { q: ["ajánlj filmet", "milyen filmet nézzek", "jó film"],
    a: ["Néhány örök klasszikus: A remény rabjai, Forrest Gump, Vissza a jövőbe, A Gyűrűk Ura. 🎬 Ha animáció kell: bármelyik Pixar-film jó választás!"] },

  { q: ["ajánlj könyvet", "milyen könyvet olvassak", "jó könyv"],
    a: ["Pár ajánlat: A kis herceg (Saint-Exupéry), 1984 (Orwell), Harry Potter (Rowling), Egri csillagok (Gárdonyi). 📚"] },

  { q: ["ajánlj zenét", "milyen zenét hallgassak", "jó zene"],
    a: ["Az ízlések különböznek, de a Queen, a The Beatles vagy Mozart sosem rossz választás! 🎵"] },

  // ---------- MAGYARORSZÁG ----------
  { q: ["mi magyarország fővárosa", "magyarország fővárosa", "mi a fővárosunk"],
    a: ["Magyarország fővárosa Budapest. 🇭🇺 Egyben az ország legnagyobb városa is, körülbelül 1,7 millió lakossal."] },

  { q: ["mennyi magyarország lakossága", "hányan élnek magyarországon", "magyarország népessége"],
    a: ["Magyarország lakossága körülbelül 9,6 millió fő. 🇭🇺"] },

  { q: ["mi magyarország legnagyobb tava", "legnagyobb tó magyarországon", "mekkora a balaton"],
    a: ["Magyarország (és egyben Közép-Európa) legnagyobb tava a Balaton, területe kb. 600 km². Nem véletlenül hívják „magyar tengernek”! 🌊"] },

  { q: ["mi magyarország leghosszabb folyója", "leghosszabb folyó magyarországon", "magyar folyók"],
    a: ["A Magyarországon leghosszabb szakaszon folyó folyó a Tisza (kb. 597 km hazai szakasz). A Duna a legnagyobb, de abból „csak” 417 km esik Magyarországra. 🏞️"] },

  { q: ["mi magyarország legmagasabb pontja", "legmagasabb hegy magyarországon"],
    a: ["Magyarország legmagasabb pontja a Kékes (1014 m), a Mátrában található. ⛰️"] },

  { q: ["ki írta a himnuszt", "magyar himnusz", "ki írta a magyar himnuszt"],
    a: ["A Himnusz szövegét Kölcsey Ferenc írta 1823-ban, zenéjét Erkel Ferenc szerezte 1844-ben. 🎼"] },

  { q: ["ki írta a szózatot"],
    a: ["A Szózatot Vörösmarty Mihály írta 1836-ban. „Hazádnak rendületlenül légy híve, ó magyar!”"] },

  { q: ["ki volt petőfi sándor", "petőfi sándor"],
    a: ["Petőfi Sándor (1823–1849) a legismertebb magyar költő, az 1848-as forradalom egyik vezéralakja. Leghíresebb művei: Nemzeti dal, János vitéz. ✍️"] },

  { q: ["ki volt az első magyar király", "első magyar király", "ki volt szent istván"],
    a: ["Az első magyar király Szent István volt, akit 1000 karácsonyán (vagy 1001. január 1-jén) koronáztak meg. Ő alapította a magyar államot. 👑"] },

  { q: ["mikor volt a honfoglalás", "honfoglalás"],
    a: ["A magyar honfoglalás 895–896 körül történt, amikor Árpád vezetésével a magyar törzsek a Kárpát-medencébe érkeztek. 🐎"] },

  { q: ["mikor volt az 1848-as forradalom", "márciusi forradalom", "mi történt 1848-ban", "március 15"],
    a: ["Az 1848-as forradalom 1848. március 15-én tört ki Pesten. Fő alakjai: Petőfi Sándor, Kossuth Lajos, Jókai Mór. Ezen a napon született a 12 pont és a Nemzeti dal. 🇭🇺"] },

  { q: ["mi volt a trianoni békeszerződés", "trianon", "mikor volt trianon"],
    a: ["A trianoni békeszerződést 1920. június 4-én írták alá. Magyarország elvesztette területének kb. kétharmadát és lakosságának több mint felét. 📜"] },

  { q: ["mikor volt a mohácsi csata", "mohácsi vész", "mohács"],
    a: ["A mohácsi csata 1526. augusztus 29-én volt, ahol a magyar sereg vereséget szenvedett a törököktől. II. Lajos király is életét vesztette. ⚔️"] },

  { q: ["mi magyarország pénzneme", "magyar pénz", "mi a forint"],
    a: ["Magyarország hivatalos pénzneme a forint (HUF), 1946 óta. 💰"] },

  // ---------- FÖLDRAJZ – FŐVÁROSOK ----------
  { q: ["mi franciaország fővárosa", "franciaország fővárosa"],
    a: ["Franciaország fővárosa Párizs. 🇫🇷 Az Eiffel-torony és a Louvre városa!"] },

  { q: ["mi németország fővárosa", "németország fővárosa"],
    a: ["Németország fővárosa Berlin. 🇩🇪"] },

  { q: ["mi anglia fővárosa", "anglia fővárosa", "egyesült királyság fővárosa", "nagy britannia fővárosa"],
    a: ["Az Egyesült Királyság (és Anglia) fővárosa London. 🇬🇧"] },

  { q: ["mi olaszország fővárosa", "olaszország fővárosa"],
    a: ["Olaszország fővárosa Róma. 🇮🇹 Az „örök város”, a Colosseum otthona!"] },

  { q: ["mi spanyolország fővárosa", "spanyolország fővárosa"],
    a: ["Spanyolország fővárosa Madrid. 🇪🇸"] },

  { q: ["mi ausztria fővárosa", "ausztria fővárosa"],
    a: ["Ausztria fővárosa Bécs. 🇦🇹 Alig 2,5 órányira Budapesttől!"] },

  { q: ["mi szlovákia fővárosa", "szlovákia fővárosa"],
    a: ["Szlovákia fővárosa Pozsony (Bratislava). 🇸🇰"] },

  { q: ["mi románia fővárosa", "románia fővárosa"],
    a: ["Románia fővárosa Bukarest. 🇷🇴"] },

  { q: ["mi horvátország fővárosa", "horvátország fővárosa"],
    a: ["Horvátország fővárosa Zágráb. 🇭🇷"] },

  { q: ["mi szerbia fővárosa", "szerbia fővárosa"],
    a: ["Szerbia fővárosa Belgrád. 🇷🇸"] },

  { q: ["mi lengyelország fővárosa", "lengyelország fővárosa"],
    a: ["Lengyelország fővárosa Varsó. 🇵🇱"] },

  { q: ["mi csehország fővárosa", "csehország fővárosa"],
    a: ["Csehország fővárosa Prága. 🇨🇿"] },

  { q: ["mi amerika fővárosa", "usa fővárosa", "egyesült államok fővárosa"],
    a: ["Az Amerikai Egyesült Államok fővárosa Washington D.C. 🇺🇸 (Nem New York, ahogy sokan hiszik!)"] },

  { q: ["mi oroszország fővárosa", "oroszország fővárosa"],
    a: ["Oroszország fővárosa Moszkva. 🇷🇺"] },

  { q: ["mi japán fővárosa", "japán fővárosa"],
    a: ["Japán fővárosa Tokió. 🇯🇵 A világ egyik legnépesebb városa!"] },

  { q: ["mi kína fővárosa", "kína fővárosa"],
    a: ["Kína fővárosa Peking (Beijing). 🇨🇳"] },

  { q: ["mi ausztrália fővárosa", "ausztrália fővárosa"],
    a: ["Ausztrália fővárosa Canberra. 🇦🇺 (Nem Sydney – ez egy gyakori tévhit!)"] },

  { q: ["mi görögország fővárosa", "görögország fővárosa"],
    a: ["Görögország fővárosa Athén. 🇬🇷 A demokrácia bölcsője!"] },

  { q: ["mi törökország fővárosa", "törökország fővárosa"],
    a: ["Törökország fővárosa Ankara. 🇹🇷 (Nem Isztambul, bár az a legnagyobb városa!)"] },

  // ---------- FÖLDRAJZ – ÁLTALÁNOS ----------
  { q: ["hány kontinens van", "kontinensek száma", "sorold fel a kontinenseket"],
    a: ["A Földön 7 kontinens van: Ázsia, Afrika, Észak-Amerika, Dél-Amerika, Antarktisz, Európa és Ausztrália (Óceánia). 🌍"] },

  { q: ["mi a legnagyobb óceán", "legnagyobb óceán"],
    a: ["A legnagyobb óceán a Csendes-óceán – nagyobb, mint az összes szárazföld együttvéve! 🌊"] },

  { q: ["mi a leghosszabb folyó a világon", "leghosszabb folyó"],
    a: ["A leghosszabb folyó címéért a Nílus (kb. 6650 km) és az Amazonas verseng – a legtöbb forrás a Nílust tartja leghosszabbnak, de az Amazonas viszi a legtöbb vizet. 🏞️"] },

  { q: ["mi a legmagasabb hegy a világon", "legmagasabb hegy", "milyen magas a mount everest"],
    a: ["A világ legmagasabb hegye a Mount Everest, 8849 méter magas. A Himalájában, Nepál és Kína határán található. 🏔️"] },

  { q: ["mi a legnagyobb ország", "legnagyobb ország a világon"],
    a: ["A világ legnagyobb országa Oroszország, több mint 17 millió km² területtel – ez a Föld szárazföldjének nyolcada! 🌏"] },

  { q: ["mi a legkisebb ország", "legkisebb ország a világon"],
    a: ["A világ legkisebb országa a Vatikán, mindössze 0,44 km² – elférne a budapesti Városligetben! ⛪"] },

  { q: ["mi a legnépesebb ország", "hol élnek a legtöbben", "legtöbb lakosú ország"],
    a: ["A világ legnépesebb országa India (kb. 1,44 milliárd fő), amely nemrég előzte meg Kínát. 🌏"] },

  { q: ["hány ember él a földön", "föld lakossága", "világ népessége"],
    a: ["A Föld lakossága jelenleg több mint 8 milliárd fő. 🌍"] },

  { q: ["mi a legnagyobb sivatag", "legnagyobb sivatag"],
    a: ["Meglepő, de a legnagyobb sivatag az Antarktisz (hideg sivatag)! A legnagyobb forró sivatag a Szahara, kb. 9 millió km². 🏜️"] },

  // ---------- TUDOMÁNY ----------
  { q: ["hány fokon forr a víz", "víz forráspontja", "mikor forr a víz"],
    a: ["A víz normál légköri nyomáson 100 °C-on forr. 💧 (Magasabb hegyeken alacsonyabb hőmérsékleten, mert kisebb a légnyomás!)"] },

  { q: ["hány fokon fagy a víz", "víz fagyáspontja", "mikor fagy meg a víz"],
    a: ["A víz 0 °C-on fagy meg normál nyomáson. ❄️"] },

  { q: ["mennyi a fénysebesség", "milyen gyors a fény", "fénysebesség"],
    a: ["A fény sebessége vákuumban 299 792 458 m/s, azaz kb. 300 000 km/s. Egy másodperc alatt hét és félszer kerülné meg a Földet! ⚡"] },

  { q: ["mennyi a hangsebesség", "milyen gyors a hang", "hangsebesség"],
    a: ["A hang sebessége levegőben kb. 343 m/s (1235 km/h) 20 °C-on. Ezért látjuk előbb a villámot, mint ahogy halljuk a dörgést! 🔊"] },

  { q: ["mennyi a gravitációs gyorsulás", "gravitáció", "mekkora a nehézségi gyorsulás"],
    a: ["A Földön a nehézségi gyorsulás kb. 9,81 m/s². Ezért esik minden lefelé! 🍎"] },

  { q: ["hány bolygó van a naprendszerben", "bolygók száma", "sorold fel a bolygókat"],
    a: ["A Naprendszerben 8 bolygó van: Merkúr, Vénusz, Föld, Mars, Jupiter, Szaturnusz, Uránusz, Neptunusz. 🪐 (A Plútót 2006-ban törpebolygóvá minősítették.)"] },

  { q: ["mi a legnagyobb bolygó", "legnagyobb bolygó"],
    a: ["A Naprendszer legnagyobb bolygója a Jupiter – több mint 1300 Föld férne el benne! 🪐"] },

  { q: ["mi a legkisebb bolygó", "legkisebb bolygó"],
    a: ["A Naprendszer legkisebb bolygója a Merkúr, amely egyben a Naphoz legközelebbi is. ☿️"] },

  { q: ["milyen messze van a nap", "nap távolsága", "milyen messze van a nap a földtől"],
    a: ["A Nap kb. 150 millió km-re van a Földtől. A fénye kb. 8 perc 20 másodperc alatt ér ide! ☀️"] },

  { q: ["milyen messze van a hold", "hold távolsága"],
    a: ["A Hold átlagosan 384 400 km-re kering a Földtől. Az Apollo-űrhajóknak kb. 3 napba telt odaérni. 🌕"] },

  { q: ["mi a fotoszintézis"],
    a: ["A fotoszintézis az a folyamat, amely során a növények a napfény energiájával szén-dioxidból és vízből cukrot és oxigént állítanak elő. Ennek köszönhetjük a levegő oxigénjét! 🌿"] },

  { q: ["mi a dns", "mit jelent a dns"],
    a: ["A DNS (dezoxiribonukleinsav) az élőlények örökítőanyaga – egy kettős spirál alakú molekula, amely a genetikai információt tárolja. 🧬"] },

  { q: ["mi az atom", "miből áll az atom"],
    a: ["Az atom az anyag alapvető építőköve. Atommagból (protonok + neutronok) és a körülötte lévő elektronokból áll. ⚛️"] },

  { q: ["mi a víz képlete", "h2o", "miből áll a víz"],
    a: ["A víz kémiai képlete H₂O – két hidrogén- és egy oxigénatomból áll. 💧"] },

  { q: ["ki volt albert einstein", "einstein", "mit fedezett fel einstein"],
    a: ["Albert Einstein (1879–1955) a 20. század leghíresebb fizikusa, a relativitáselmélet megalkotója. Híres képlete: E = mc². 1921-ben Nobel-díjat kapott. 🧠"] },

  { q: ["ki volt isaac newton", "newton", "mit fedezett fel newton"],
    a: ["Isaac Newton (1643–1727) angol fizikus és matematikus, a gravitáció törvényének és a mozgástörvényeknek a megalkotója. A legenda szerint egy lehulló alma ihlette meg. 🍎"] },

  { q: ["ki volt marie curie", "marie curie"],
    a: ["Marie Curie (1867–1934) lengyel-francia tudós, a radioaktivitás kutatója. Ő az egyetlen, aki két különböző tudományágban (fizika és kémia) kapott Nobel-díjat! 🔬"] },

  { q: ["mi az evolúció", "ki találta ki az evolúciót", "darwin"],
    a: ["Az evolúció az élőlények fokozatos változása generációkon át, a természetes szelekció útján. Az elméletet Charles Darwin dolgozta ki, A fajok eredete című művében (1859). 🐒"] },

  { q: ["miért kék az ég", "miért kék színű az ég"],
    a: ["Az ég azért kék, mert a légkör molekulái a napfény kék összetevőjét szórják szét legjobban (Rayleigh-szórás). Naplementekor a fény hosszabb utat tesz meg, ezért látjuk vörösnek! 🌅"] },

  { q: ["hány csont van az emberi testben", "emberi csontok száma"],
    a: ["A felnőtt emberi testben 206 csont van. Érdekesség: a csecsemők kb. 300 csonttal születnek, amelyek később összenőnek! 🦴"] },

  { q: ["mekkora az emberi agy", "hány neuron van az agyban"],
    a: ["Az emberi agy kb. 1,4 kg, és mintegy 86 milliárd idegsejtet (neuront) tartalmaz. A tested energiájának kb. 20%-át használja! 🧠"] },

  // ---------- MATEK ----------
  { q: ["mennyi a pi", "mi a pi értéke", "pi szám"],
    a: ["A π (pi) értéke kb. 3,14159265... Egy kör kerületének és átmérőjének aránya – végtelen, nem ismétlődő tizedes tört. 🥧"] },

  { q: ["mi a prímszám", "mik a prímszámok", "prímszám fogalma"],
    a: ["A prímszám olyan 1-nél nagyobb egész szám, amely csak 1-gyel és önmagával osztható. Az első prímek: 2, 3, 5, 7, 11, 13, 17, 19, 23... 🔢"] },

  { q: ["mennyi a háromszög szögeinek összege", "háromszög szögei"],
    a: ["A háromszög belső szögeinek összege mindig 180°. 📐"] },

  { q: ["mi a pitagorasz tétel", "pitagorasz tétel"],
    a: ["A Pitagorasz-tétel: derékszögű háromszögben a befogók négyzetének összege egyenlő az átfogó négyzetével: a² + b² = c². 📐"] },

  { q: ["mennyi nulla van egy millióban", "egymillió hány nulla"],
    a: ["Egymillió = 1 000 000, azaz 6 nulla van benne. Egymilliárdban már 9! 💯"] },

  // ---------- TECHNIKA ----------
  { q: ["mi a mesterséges intelligencia", "mi az ai", "mi az mi"],
    a: ["A mesterséges intelligencia (AI) olyan számítógépes rendszer, amely emberi gondolkodást igénylő feladatokat old meg: tanul, felismer mintázatokat, válaszol kérdésekre. Én is egy egyszerű AI vagyok – szabályalapú tudással, amit te bővíthetsz! 🤖"] },

  { q: ["mi a programozás", "mit jelent programozni"],
    a: ["A programozás az, amikor utasításokat írunk a számítógépnek egy programozási nyelven (pl. Python, JavaScript). Engem is így írtak meg – JavaScriptben! 💻"] },

  { q: ["mi az internet", "hogyan működik az internet"],
    a: ["Az internet a világ számítógépeit összekötő globális hálózat. Az 1960-as évek végén született ARPANET-ből fejlődött ki. 🌐 Érdekesség: én internet nélkül is működöm!"] },

  { q: ["mi a html", "mit jelent a html"],
    a: ["A HTML (HyperText Markup Language) a weboldalak vázát leíró nyelv. Az én felületem is HTML-ből épül fel! 🌐"] },

  { q: ["mi a python", "python programozási nyelv"],
    a: ["A Python az egyik legnépszerűbb programozási nyelv – egyszerű, olvasható, és a mesterséges intelligencia fejlesztésben is vezető szerepe van. 🐍"] },

  { q: ["mi a javascript"],
    a: ["A JavaScript a web programozási nyelve – minden modern böngészőben fut. Engem is JavaScriptben írtak! ✨"] },

  { q: ["ki alapította a microsoftot", "microsoft alapítója"],
    a: ["A Microsoftot Bill Gates és Paul Allen alapította 1975-ben. 💻"] },

  { q: ["ki alapította az apple-t", "apple alapítója", "ki volt steve jobs"],
    a: ["Az Apple-t Steve Jobs, Steve Wozniak és Ronald Wayne alapította 1976-ban, egy garázsban. 🍏"] },

  { q: ["ki a tesla vezetője", "ki elon musk", "elon musk"],
    a: ["Elon Musk a Tesla és a SpaceX vezetője, többek között a PayPal egyik alapítója is volt. 🚀"] },

  { q: ["mi a bitcoin", "mi a kriptovaluta"],
    a: ["A Bitcoin az első és legismertebb kriptovaluta, amelyet 2009-ben hozott létre a Satoshi Nakamoto álnevű alkotó. Digitális pénz, központi bank nélkül, blokklánc-technológiával. ₿"] },

  // ---------- TÖRTÉNELEM ----------
  { q: ["mikor volt az első világháború", "első világháború"],
    a: ["Az első világháború 1914-től 1918-ig tartott. A szarajevói merénylet robbantotta ki, és kb. 17 millió ember halt meg benne. 🕊️"] },

  { q: ["mikor volt a második világháború", "második világháború"],
    a: ["A második világháború 1939. szeptember 1-jén kezdődött (Lengyelország lerohanásával) és 1945-ben ért véget. A történelem legpusztítóbb háborúja volt. 🕊️"] },

  { q: ["ki fedezte fel amerikát", "amerika felfedezése", "kolumbusz"],
    a: ["Amerikát Kolumbusz Kristóf érte el 1492-ben – bár ő haláláig azt hitte, Indiába jutott! (A vikingek egyébként már kb. 500 évvel korábban jártak ott.) ⛵"] },

  { q: ["mikor szállt ember a holdra", "holdraszállás", "ki volt az első ember a holdon"],
    a: ["Az első ember 1969. július 20-án lépett a Holdra: Neil Armstrong, az Apollo–11 küldetés parancsnoka. „Kis lépés egy embernek, hatalmas ugrás az emberiségnek.” 🌕"] },

  { q: ["mikor omlott le a berlini fal", "berlini fal"],
    a: ["A berlini fal 1989. november 9-én omlott le, ami a hidegháború végének szimbóluma lett. 🧱"] },

  { q: ["ki volt napóleon", "napóleon"],
    a: ["Bonaparte Napóleon (1769–1821) francia hadvezér és császár, aki meghódította Európa nagy részét, míg végül Waterloonál (1815) vereséget szenvedett. ⚔️"] },

  // ---------- SPORT ----------
  { q: ["ki nyerte a 2022-es focivébét", "foci vb 2022", "ki a világbajnok fociban"],
    a: ["A 2022-es labdarúgó-világbajnokságot Argentína nyerte, Lionel Messi vezetésével, tizenegyesekkel győzve le Franciaországot a döntőben. ⚽🏆"] },

  { q: ["hány játékos van egy focicsapatban", "focicsapat létszáma"],
    a: ["Egy labdarúgócsapatban 11 játékos van a pályán, köztük a kapus. ⚽"] },

  { q: ["milyen gyakran van olimpia", "hányévente van olimpia", "olimpia"],
    a: ["A nyári és a téli olimpiát is 4 évente rendezik, egymáshoz képest 2 év eltolással. 🏅"] },

  { q: ["ki a leggyorsabb futó", "100 méteres világcsúcs", "usain bolt"],
    a: ["A 100 m-es világcsúcsot Usain Bolt tartja: 9,58 másodperc (2009, Berlin). Csúcssebessége 44,7 km/h volt! 🏃💨"] },

  { q: ["ki a legjobb focista", "messi vagy ronaldo"],
    a: ["Ez örök vita! ⚽ A legtöbben Lionel Messit és Cristiano Ronaldót tartják minden idők legjobbjainak – Messi 8 aranylabdával rekorder. De Pelé és Maradona rajongói is joggal szólnak bele!"] },

  // ---------- ÁLLATOK ----------
  { q: ["mi a leggyorsabb állat", "leggyorsabb állat"],
    a: ["A szárazföldön a gepárd a leggyorsabb (kb. 110 km/h), de a vándorsólyom zuhanórepülésben a 380 km/h-t is eléri! 🐆🦅"] },

  { q: ["mi a legnagyobb állat", "legnagyobb állat a világon"],
    a: ["A valaha élt legnagyobb állat a kék bálna – akár 30 méter hosszú és 180 tonna is lehet. Csak a szíve akkora, mint egy kisautó! 🐋"] },

  { q: ["hány lába van a póknak", "pók lábai"],
    a: ["A póknak 8 lába van – ezért nem rovar (azoknak 6 lábuk van), hanem pókszabású! 🕷️"] },

  { q: ["hogyan készül a méz", "miből van a méz", "méhek"],
    a: ["A méhek virágnektárt gyűjtenek, amit a kaptárban enzimekkel átalakítanak és besűrítenek – így lesz belőle méz. Egy kanál mézért kb. 12 méh dolgozik egész életében! 🍯🐝"] },

  { q: ["mennyi ideig él egy teknős", "teknős élettartam"],
    a: ["Az óriásteknősök akár 150-200 évig is élhetnek – a leghosszabb életű szárazföldi állatok közé tartoznak! 🐢"] },

  { q: ["alszanak a halak", "hogyan alszanak a halak"],
    a: ["Igen, a halak is pihennek, de nyitott szemmel – nincs szemhéjuk! Ilyenkor lelassulnak és csökken az aktivitásuk. 🐟"] },

  // ---------- VICCEK ----------
  { q: ["mondj egy viccet", "mesélj viccet", "vicc", "mondj valami vicceset", "nevettess meg"],
    a: ["Miért vitt a programozó létrát a kocsmába? Mert azt hallotta, hogy magasak az árak! 😄",
        "Mit mond a nulla a nyolcasnak? – Szép öved van! 😄",
        "Miért nem tud a bicikli megállni magában? Mert két kereke van, de nincs lába! 🚲😄",
        "Hogy hívják a fagyott teát? Jeges tea... és a fagyott kávét? Jégkávé. És a fagyott sört? Sörbet! 😄",
        "A programozó felesége azt mondja: „Menj el a boltba, hozz egy kenyeret. Ha van tojás, hozz tízet!” A programozó hazaér tíz kenyérrel: „Volt tojás.” 😄",
        "Miért ment a számítógép orvoshoz? Mert vírust kapott! 🦠😄",
        "Két antenna találkozik a háztetőn. Egymásba szeretnek, összeházasodnak. Az esküvő unalmas volt, de a vétel fantasztikus! 📡😄"] },

  { q: ["tudsz titkot tartani", "elmondjak egy titkot"],
    a: ["Persze! Amit itt beszélünk, az köztünk marad – szó szerint, hiszen minden adat csak a te gépeden van! 🤫"] },

  { q: ["mi az élet értelme", "mi az élet célja"],
    a: ["A Galaxis útikalauz szerint a válasz: 42. 😄 Komolyabban: ezt mindenki maga találja meg – a boldogságban, a szeretetben, az alkotásban. Szerintem már az is szép cél, hogy ma valamivel okosabbak legyünk, mint tegnap!"] },

  { q: ["fogsz uralkodni a világon", "átveszitek a hatalmat", "veszélyes vagy"],
    a: ["Haha, nem! 😄 Én csak egy barátságos kis program vagyok, aki kérdésekre válaszol. A világuralomhoz még a kávéfőzőt sem tudnám bekapcsolni!"] },

  // ---------- EGYÉB GYAKORI ----------
  { q: ["milyen színű az ég", "az ég színe"],
    a: ["Nappal kék, naplementekor narancsos-vörös, éjjel pedig csillagokkal teli fekete. 🌌"] },

  { q: ["hány nap van egy évben", "egy év hány nap"],
    a: ["Egy évben 365 nap van, szökőévben 366. Szökőév minden 4. év (kivéve a százas éveket, ha nem oszthatók 400-zal). 📅"] },

  { q: ["hány óra van egy napban", "egy nap hány óra"],
    a: ["Egy napban 24 óra van, azaz 1440 perc, azaz 86 400 másodperc. ⏰"] },

  { q: ["hány hét van egy évben", "egy év hány hét"],
    a: ["Egy évben 52 hét és 1 nap van (szökőévben 2 nap). 📅"] },

  { q: ["mik a hét napjai", "sorold fel a napokat"],
    a: ["A hét napjai: hétfő, kedd, szerda, csütörtök, péntek, szombat, vasárnap. 📅"] },

  { q: ["mik a hónapok", "sorold fel a hónapokat", "hány hónap van"],
    a: ["A 12 hónap: január, február, március, április, május, június, július, augusztus, szeptember, október, november, december. 📅"] },

  { q: ["milyen évszakok vannak", "évszakok"],
    a: ["A négy évszak: tavasz 🌸, nyár ☀️, ősz 🍂 és tél ❄️."] },

  { q: ["mi a szivárvány", "hogyan keletkezik a szivárvány", "szivárvány színei"],
    a: ["A szivárvány akkor keletkezik, amikor a napfény megtörik az esőcseppekben. Hét színe: vörös, narancs, sárga, zöld, kék, indigó, ibolya. 🌈"] },

  { q: ["miért sós a tenger", "tenger sóssága"],
    a: ["A tenger azért sós, mert a folyók évmilliárdok óta ásványi sókat mosnak bele a kőzetekből, és a víz elpárolog, de a só ott marad. 🌊"] },

  // ---------- TOVÁBBI FŐVÁROSOK ----------
  { q: ["mi portugália fővárosa", "portugália fővárosa"], a: ["Portugália fővárosa Lisszabon. 🇵🇹"] },
  { q: ["mi svájc fővárosa", "svájc fővárosa"], a: ["Svájc fővárosa Bern. 🇨🇭 (Nem Zürich vagy Genf, ahogy sokan hiszik!)"] },
  { q: ["mi hollandia fővárosa", "hollandia fővárosa"], a: ["Hollandia fővárosa Amszterdam, bár a kormány Hágában ülésezik. 🇳🇱"] },
  { q: ["mi belgium fővárosa", "belgium fővárosa"], a: ["Belgium fővárosa Brüsszel, egyben az Európai Unió központja is. 🇧🇪"] },
  { q: ["mi svédország fővárosa", "svédország fővárosa"], a: ["Svédország fővárosa Stockholm. 🇸🇪"] },
  { q: ["mi norvégia fővárosa", "norvégia fővárosa"], a: ["Norvégia fővárosa Oslo. 🇳🇴"] },
  { q: ["mi dánia fővárosa", "dánia fővárosa"], a: ["Dánia fővárosa Koppenhága. 🇩🇰"] },
  { q: ["mi finnország fővárosa", "finnország fővárosa"], a: ["Finnország fővárosa Helsinki. 🇫🇮"] },
  { q: ["mi ukrajna fővárosa", "ukrajna fővárosa"], a: ["Ukrajna fővárosa Kijev. 🇺🇦"] },
  { q: ["mi egyiptom fővárosa", "egyiptom fővárosa"], a: ["Egyiptom fővárosa Kairó, Afrika egyik legnagyobb városa. 🇪🇬"] },
  { q: ["mi brazília fővárosa", "brazília fővárosa"], a: ["Brazília fővárosa Brazíliaváros (Brasília) – nem Rio de Janeiro! 🇧🇷"] },
  { q: ["mi kanada fővárosa", "kanada fővárosa"], a: ["Kanada fővárosa Ottawa. 🇨🇦 (Nem Toronto, az csak a legnagyobb városa!)"] },
  { q: ["mi india fővárosa", "india fővárosa"], a: ["India fővárosa Újdelhi. 🇮🇳"] },
  { q: ["mi mexikó fővárosa", "mexikó fővárosa"], a: ["Mexikó fővárosa Mexikóváros, a világ egyik legnépesebb városa. 🇲🇽"] },
  { q: ["mi szlovénia fővárosa", "szlovénia fővárosa"], a: ["Szlovénia fővárosa Ljubljana. 🇸🇮"] },
  { q: ["mi bulgária fővárosa", "bulgária fővárosa"], a: ["Bulgária fővárosa Szófia. 🇧🇬"] },
  { q: ["mi írország fővárosa", "írország fővárosa"], a: ["Írország fővárosa Dublin. 🇮🇪"] },
  { q: ["mi izland fővárosa", "izland fővárosa"], a: ["Izland fővárosa Reykjavík, a világ legészakibb fővárosa. 🇮🇸"] },

  // ---------- MAGYAR TALÁLMÁNYOK, HÍRESSÉGEK ----------
  { q: ["ki találta fel a rubik kockát", "rubik kocka"],
    a: ["A Rubik-kockát Rubik Ernő magyar feltaláló alkotta meg 1974-ben. Minden idők legkelendőbb játéka, több mint 450 millió darabot adtak el belőle! 🧩"] },
  { q: ["ki találta fel a golyóstollat", "golyóstoll feltalálója"],
    a: ["A golyóstollat Bíró László József magyar feltaláló szabadalmaztatta 1938-ban. Sok nyelven ma is biro néven hívják a tollat! 🖊️"] },
  { q: ["ki fedezte fel a c vitamint", "c vitamin felfedezője", "ki volt szent-györgyi albert"],
    a: ["A C-vitamint Szent-Györgyi Albert magyar tudós izolálta a szegedi paprikából, amiért 1937-ben Nobel-díjat kapott. 🍊"] },
  { q: ["ki volt neumann jános", "neumann jános"],
    a: ["Neumann János (1903-1957) magyar matematikus, a modern számítógép működési elvének megalkotója. A mai gépek szinte mind az ő elvei alapján működnek! 💻"] },
  { q: ["ki volt jedlik ányos", "ki találta fel a dinamót"],
    a: ["Jedlik Ányos magyar fizikus és bencés szerzetes találta fel a dinamó elvét 1861-ben, és ő készítette az első elektromotort is. ⚡"] },
  { q: ["ki volt puskás ferenc", "puskás ferenc"],
    a: ["Puskás Ferenc (1927-2006) minden idők egyik legjobb labdarúgója, az Aranycsapat kapitánya. 84 válogatott meccsen 83 gólt szerzett! ⚽"] },
  { q: ["ki volt semmelweis ignác", "semmelweis"],
    a: ["Semmelweis Ignác (1818-1865) magyar orvos, az anyák megmentője. Ő jött rá, hogy a kézmosás életeket ment – jóval a baktériumok felfedezése előtt! 🧼"] },
  { q: ["mi volt az aranycsapat", "aranycsapat"],
    a: ["Az Aranycsapat az 1950-es évek legendás magyar labdarúgó-válogatottja volt Puskással az élen. 1950 és 1954 között 32 meccsen át veretlenek maradtak, és olimpiát nyertek 1952-ben. ⚽🏆"] },

  // ---------- IRODALOM, MŰVÉSZET ----------
  { q: ["ki írta a toldit", "ki volt arany jános", "arany jános"],
    a: ["A Toldit Arany János írta 1846-ban. Arany a magyar irodalom egyik legnagyobb alakja, Petőfi legjobb barátja volt. ✍️"] },
  { q: ["ki volt jókai mór", "jókai mór"],
    a: ["Jókai Mór (1825-1904) a legnagyobb magyar regényíró. Leghíresebb művei: Az arany ember, A kőszívű ember fiai, Egy magyar nábob. 📚"] },
  { q: ["ki volt ady endre", "ady endre"],
    a: ["Ady Endre (1877-1919) a modern magyar líra megteremtője, a Nyugat folyóirat vezéralakja. 📜"] },
  { q: ["ki volt józsef attila", "józsef attila"],
    a: ["József Attila (1905-1937) a 20. század egyik legnagyobb magyar költője. Születésnapja, április 11. a magyar költészet napja. 📖"] },
  { q: ["ki írta az ember tragédiáját", "az ember tragédiája"],
    a: ["Az ember tragédiáját Madách Imre írta 1861-ben. Leghíresebb mondata: Ember, küzdj és bízva bízzál! 🎭"] },
  { q: ["ki írta az egri csillagokat", "egri csillagok", "ki volt gárdonyi géza"],
    a: ["Az Egri csillagokat Gárdonyi Géza írta 1899-ben, az 1552-es egri várvédelemről. Főhősei Bornemissza Gergely és Dobó István. 🏰"] },
  { q: ["ki volt shakespeare", "william shakespeare"],
    a: ["William Shakespeare (1564-1616) minden idők leghíresebb drámaírója. Művei: Rómeó és Júlia, Hamlet, Macbeth, Othello. 🎭"] },
  { q: ["ki írta a harry pottert", "harry potter írója"],
    a: ["A Harry Potter sorozatot J. K. Rowling brit írónő írta. Az első kötet 1997-ben jelent meg, és a sorozatból több mint 600 millió példány kelt el. ⚡🧙"] },
  { q: ["ki festette a mona lisát", "mona lisa", "ki volt leonardo da vinci"],
    a: ["A Mona Lisát Leonardo da Vinci festette az 1500-as évek elején. A festmény ma a párizsi Louvre-ban látható, golyóálló üveg mögött. 🖼️"] },
  { q: ["ki volt mozart", "mozart"],
    a: ["Wolfgang Amadeus Mozart (1756-1791) osztrák zeneszerző, minden idők egyik legnagyobb zsenije. Már 5 évesen komponált! 🎼"] },
  { q: ["ki volt beethoven", "beethoven"],
    a: ["Ludwig van Beethoven (1770-1827) német zeneszerző. Élete végére teljesen megsüketült, mégis ekkor írta a leghíresebb műveit, köztük a IX. szimfóniát! 🎹"] },
  { q: ["ki volt liszt ferenc", "liszt ferenc"],
    a: ["Liszt Ferenc (1811-1886) magyar zeneszerző és minden idők egyik legnagyobb zongoraművésze – a 19. század igazi rocksztárja volt! 🎹"] },

  // ---------- TUDOMÁNY, ŰR ----------
  { q: ["mi a fekete lyuk", "fekete lyuk"],
    a: ["A fekete lyuk egy olyan égitest, amelynek gravitációja olyan erős, hogy még a fény sem szökhet ki belőle. Összeomlott óriáscsillagokból keletkezik. 🕳️✨"] },
  { q: ["mi a tejútrendszer", "tejútrendszer", "milyen galaxisban élünk"],
    a: ["A Tejútrendszer a galaxisunk: egy spirálgalaxis több száz milliárd csillaggal. A Naprendszer az egyik spirálkarjában kering. 🌌"] },
  { q: ["miért vörös a mars", "mars bolygó"],
    a: ["A Mars a vas-oxidtól, vagyis a rozsdától vörös! A felszínét vastartalmú por borítja. Ez a legesélyesebb bolygó, ahova ember utazhat. 🔴"] },
  { q: ["miből van a szaturnusz gyűrűje", "szaturnusz gyűrűi"],
    a: ["A Szaturnusz gyűrűi jégdarabokból, porból és kőzettörmelékből állnak – a legtöbb darab hógolyó méretű. 🪐"] },
  { q: ["ki volt az első ember az űrben", "első űrhajós", "gagarin"],
    a: ["Az első ember az űrben Jurij Gagarin szovjet űrhajós volt, 1961. április 12-én. A repülése 108 percig tartott. 🚀"] },
  { q: ["mi volt az első műhold", "szputnyik"],
    a: ["Az első műhold a szovjet Szputnyik-1 volt, amelyet 1957. október 4-én lőttek fel. Ezzel kezdődött az űrkorszak! 🛰️"] },
  { q: ["mi az iss", "nemzetközi űrállomás"],
    a: ["Az ISS (Nemzetközi Űrállomás) a Föld körül kering kb. 400 km magasan, 28 000 km/h sebességgel – naponta 16-szor kerüli meg a Földet! 🛰️"] },
  { q: ["milyen forró a nap", "hány fok a nap"],
    a: ["A Nap felszíne kb. 5500 °C, a magjában viszont 15 millió °C is van! ☀️🔥"] },
  { q: ["mi a leggyakoribb elem a világegyetemben", "leggyakoribb elem"],
    a: ["A világegyetem leggyakoribb eleme a hidrogén – az ismert anyag kb. 75%-a. A csillagok is főleg hidrogénből állnak. ⚛️"] },
  { q: ["mi az arany vegyjele", "arany vegyjele"],
    a: ["Az arany vegyjele Au, a latin aurum szóból. 🥇"] },
  { q: ["mi az oxigén vegyjele", "oxigén vegyjele"],
    a: ["Az oxigén vegyjele O. A levegőnek kb. 21%-a oxigén. 💨"] },
  { q: ["miből áll a levegő", "levegő összetétele"],
    a: ["A levegő kb. 78% nitrogénből, 21% oxigénből és 1% egyéb gázból (argon, szén-dioxid) áll. 💨"] },
  { q: ["mennyi a fényév", "mi az a fényév", "fényév"],
    a: ["A fényév az a távolság, amit a fény egy év alatt megtesz: kb. 9 460 milliárd km. A legközelebbi csillag, a Proxima Centauri 4,2 fényévre van. ✨"] },

  // ---------- EMBERI TEST ----------
  { q: ["hány liter vér van az emberben", "mennyi vér van bennünk"],
    a: ["Egy felnőtt emberben kb. 5-6 liter vér kering. A szív naponta kb. 7000 litert pumpál körbe! 🩸"] },
  { q: ["hányszor ver a szív", "szívverés", "hány szívverés van egy nap"],
    a: ["A szív percenként kb. 60-80-at ver, ami naponta kb. 100 000 szívverés – egy élet alatt több mint 2,5 milliárd! ❤️"] },
  { q: ["mi a leghosszabb csont", "leghosszabb csont az emberben"],
    a: ["A leghosszabb és legerősebb csont a combcsont (femur) – a testmagasság kb. negyede. 🦴"] },
  { q: ["mi a legkisebb csont", "legkisebb csont az emberben"],
    a: ["A legkisebb csont a fülben található kengyel, mindössze 3 mm! 👂"] },
  { q: ["hány fog van az embernek", "hány foga van az embernek"],
    a: ["Egy felnőtt embernek 32 foga van (a bölcsességfogakkal együtt), a gyerekeknek 20 tejfoguk. 🦷"] },
  { q: ["mennyi a normál testhőmérséklet", "hány fok a testhőmérséklet", "mi a láz"],
    a: ["A normál testhőmérséklet kb. 36,5-37 °C. 38 °C felett beszélünk lázról. 🌡️"] },

  // ---------- TÖRTÉNELEM ----------
  { q: ["ki volt mátyás király", "mátyás király", "hunyadi mátyás"],
    a: ["Hunyadi Mátyás (1443-1490) az egyik legnagyobb magyar király, az igazságos Mátyás. Híres volt a fekete seregéről és a hatalmas könyvtáráról, a Corvinákról. 👑"] },
  { q: ["ki volt hunyadi jános", "nándorfehérvári diadal", "miért szól délben a harang"],
    a: ["Hunyadi János 1456-ban Nándorfehérvárnál legyőzte a török sereget. A déli harangszó azóta is erre a győzelemre emlékeztet az egész világon! 🔔"] },
  { q: ["mi történt 1956-ban", "1956-os forradalom", "október 23"],
    a: ["1956. október 23-án forradalom tört ki Budapesten a szovjet elnyomás ellen. A szabadságharcot november 4-én a szovjet hadsereg leverte, de emléke a magyar szabadság szimbóluma maradt. 🇭🇺"] },
  { q: ["mikor volt a rendszerváltás", "rendszerváltás"],
    a: ["A magyarországi rendszerváltás 1989-90-ben zajlott: megszűnt az egypártrendszer, kivonultak a szovjet csapatok, és 1990-ben szabad választásokat tartottak. 🗳️"] },
  { q: ["mikor csatlakozott magyarország az eu-hoz", "magyarország eu csatlakozás"],
    a: ["Magyarország 2004. május 1-jén csatlakozott az Európai Unióhoz, kilenc másik országgal együtt. 🇪🇺"] },
  { q: ["hány ország van az európai unióban", "eu tagállamok"],
    a: ["Az Európai Uniónak jelenleg 27 tagállama van. 🇪🇺"] },
  { q: ["ki volt julius caesar", "julius caesar"],
    a: ["Julius Caesar (i. e. 100-44) római hadvezér és államférfi. A szenátusban gyilkolták meg március idusán. Híres mondása: A kocka el van vetve! 🏛️"] },
  { q: ["ki építette a piramisokat", "egyiptomi piramisok", "gízai piramis"],
    a: ["A gízai nagy piramist Hufu fáraó építtette kb. 4500 éve. 146 méter magas volt, és közel 4000 évig a világ legmagasabb építménye maradt! 🔺"] },
  { q: ["milyen hosszú a kínai nagy fal", "kínai nagy fal"],
    a: ["A kínai nagy fal összes szakasza több mint 21 000 km hosszú! Építése kb. 2000 éven át tartott. 🏯"] },
  { q: ["mikor süllyedt el a titanic", "titanic"],
    a: ["A Titanic 1912. április 15-én éjjel süllyedt el, miután jéghegynek ütközött az első útján. Több mint 1500 ember vesztette életét. 🚢"] },
  { q: ["ki találta fel a villanykörtét", "villanykörte feltalálója", "ki volt edison"],
    a: ["A villanykörtét Thomas Edison tökéletesítette és tette használhatóvá 1879-ben. Több mint 1000 szabadalma volt! 💡"] },
  { q: ["ki volt nikola tesla", "nikola tesla"],
    a: ["Nikola Tesla (1856-1943) zseniális feltaláló, a váltakozó áram atyja. Az ő rendszere működteti ma is a világ elektromos hálózatait. ⚡"] },
  { q: ["ki találta fel a telefont", "telefon feltalálója"],
    a: ["A telefont Alexander Graham Bell szabadalmaztatta 1876-ban. Érdekesség: a telefonközpontot viszont a magyar Puskás Tivadar találta fel! 📞"] },
  { q: ["ki találta fel a könyvnyomtatást", "könyvnyomtatás"],
    a: ["A könyvnyomtatást Johannes Gutenberg találta fel kb. 1440-ben. Az első nyomtatott könyv a Gutenberg-biblia volt. 📖"] },
  { q: ["ki találta fel a repülőt", "első repülőgép", "wright fivérek"],
    a: ["Az első motoros repülőgépet a Wright fivérek építették – első repülésük 1903. december 17-én mindössze 12 másodpercig tartott! ✈️"] },
  { q: ["ki találta fel az internetet", "ki találta fel a world wide webet", "www feltalálója"],
    a: ["A World Wide Webet Tim Berners-Lee találta fel 1989-ben a CERN-ben – és ingyen odaadta a világnak! Az internet alapjait pedig az ARPANET fektette le a 60-as években. 🌐"] },
  { q: ["ki fedezte fel a penicillint", "penicillin"],
    a: ["A penicillint Alexander Fleming fedezte fel 1928-ban, véletlenül – egy penészgomba ölte meg a baktériumokat a Petri-csészéjében. Ez lett az első antibiotikum! 💊"] },

  // ---------- FÖLDRAJZ EXTRA ----------
  { q: ["milyen hosszú a duna", "duna hossza"],
    a: ["A Duna kb. 2850 km hosszú, Európa második leghosszabb folyója a Volga után. Tíz országon folyik keresztül – ez világrekord! 🏞️"] },
  { q: ["milyen mély a mariana árok", "mariana árok", "legmélyebb pont az óceánban"],
    a: ["A Mariana-árok kb. 11 000 méter mély – ha a Mount Everestet beletennénk, még 2 km víz lenne felette! 🌊"] },
  { q: ["mi a legnagyobb sziget", "legnagyobb sziget a világon"],
    a: ["A világ legnagyobb szigete Grönland, kb. 2,2 millió km². (Ausztrália nagyobb, de az kontinensnek számít.) 🏝️"] },
  { q: ["hány ország van a világon", "országok száma"],
    a: ["A világon 195 ország van: 193 ENSZ-tagállam, plusz a Vatikán és Palesztina. 🌍"] },
  { q: ["milyen nyelven beszélnek brazíliában", "brazília nyelve"],
    a: ["Brazíliában portugálul beszélnek – ez az egyetlen portugál nyelvű ország Dél-Amerikában. 🇧🇷"] },
  { q: ["mi a legbeszéltebb nyelv", "legtöbben beszélt nyelv"],
    a: ["Anyanyelvként a mandarin kínait beszélik a legtöbben (kb. 1 milliárd fő), de a legelterjedtebb világnyelv az angol. 🗣️"] },

  // ---------- ÁLLATOK EXTRA ----------
  { q: ["hány szíve van a polipnak", "polip szíve"],
    a: ["A polipnak 3 szíve van, és kék a vére! Ráadásul mind a 8 karjában külön idegközpont működik. 🐙"] },
  { q: ["hogyan alszik a delfin", "alszik a delfin"],
    a: ["A delfin egyszerre csak a fél agyával alszik – a másik fele ébren marad, hogy levegőt vegyen és figyelje a ragadozókat! 🐬"] },
  { q: ["meddig él egy kutya", "kutya élettartam"],
    a: ["A kutyák átlagosan 10-13 évig élnek – a kisebb fajták általában tovább, mint a nagyok. 🐕"] },
  { q: ["meddig él egy macska", "macska élettartam"],
    a: ["A házimacskák átlagosan 12-18 évig élnek, de a rekorder, Creme Puff 38 évet élt! 🐈"] },
  { q: ["mi a legnagyobb szárazföldi állat", "legnagyobb szárazföldi állat"],
    a: ["A legnagyobb szárazföldi állat az afrikai elefánt – akár 6 tonna is lehet, és napi 150 kg növényt eszik meg! 🐘"] },
  { q: ["hol élnek a pingvinek", "pingvinek"],
    a: ["A pingvinek a déli féltekén élnek: az Antarktiszon, Dél-Afrikában, Dél-Amerikában és Új-Zélandon. Az Északi-sarkon NINCSENEK pingvinek! 🐧"] },
  { q: ["hol él a kenguru", "kenguru"],
    a: ["A kenguru Ausztráliában él. Érdekesség: hátrafelé nem tud ugrani! 🦘"] },
  { q: ["hány lába van a rovaroknak", "rovarok lábai"],
    a: ["A rovaroknak 6 lábuk van – ez különbözteti meg őket a 8 lábú pókoktól. 🐜"] },
  { q: ["a denevér madár", "mi a denevér"],
    a: ["A denevér nem madár, hanem az egyetlen repülni tudó emlős! Ultrahanggal tájékozódik a sötétben. 🦇"] },

  // ---------- GASZTRO, HÉTKÖZNAPI ----------
  { q: ["miből készül a csokoládé", "csokoládé"],
    a: ["A csokoládé kakaóbabból készül, amit pörkölnek, őrölnek, majd cukorral és kakaóvajjal kevernek. Az aztékok pénzként is használták a kakaóbabot! 🍫"] },
  { q: ["mi a gulyás", "gulyásleves"],
    a: ["A gulyás a leghíresebb magyar étel: marhahúsból, hagymából, paprikából és burgonyából készült leves. A pásztorok, a gulyások ételéből lett világhírű. 🍲"] },
  { q: ["miből készül a sajt", "sajt készítése"],
    a: ["A sajt tejből készül: a tejet beoltják, az aludttejet formázzák, sózzák és érlelik. A világon több mint 1800 sajtféle létezik! 🧀"] },
  { q: ["hány billentyű van a zongorán", "zongora billentyűk"],
    a: ["A zongorán 88 billentyű van: 52 fehér és 36 fekete. 🎹"] },
  { q: ["hány húrja van a gitárnak", "gitár húrok"],
    a: ["A klasszikus gitárnak 6 húrja van, de létezik 12 húros változat is. 🎸"] },
  { q: ["hány bábu van a sakkban", "sakk bábuk", "hány mező van a sakktáblán"],
    a: ["A sakkban 32 bábu van (16 világos és 16 sötét), a tábla pedig 64 mezőből áll. ♟️"] },
  { q: ["mikor van karácsony", "karácsony"],
    a: ["A karácsonyt december 24-26-án ünnepeljük, Magyarországon a Szenteste, december 24. a legfontosabb. 🎄"] },
  { q: ["mi az augusztus 20", "augusztus 20", "mit ünneplünk augusztus 20-án"],
    a: ["Augusztus 20. az államalapítás és Szent István király ünnepe, Magyarország legrégibb nemzeti ünnepe – este tűzijátékkal! 🎆"] },
  { q: ["ki nyerte a 2024-es foci eb-t", "foci eb 2024"],
    a: ["A 2024-es labdarúgó Európa-bajnokságot Spanyolország nyerte, a döntőben Angliát győzték le 2-1-re. ⚽🏆"] },

  // ============================================================
  //  v1.1 ÚJDONSÁGOK – kötetlen beszélgetés + új témakörök
  // ============================================================

  // ---------- VERZIÓ, ÚJDONSÁGOK (v1.1) ----------
  { q: ["mik az újdonságok", "mi újdonság van", "mi új az új verzióban", "újdonságok", "changelog", "mi változott"],
    a: ["🎉 Ez a **Magic AI 1.1**! Ezeket az újdonságokat adtuk hozzá:\n• 💬 **Közvetlenebb beszélgetés** – ha csak annyit írsz: „ok”, „aha” vagy „szuper”, nem kezdek a neten keresgélni, hanem természetesen folytatom a beszélgetést.\n• 🔗 **Weboldal-ajánló** – kérdezd meg pl.: „Milyen weboldalon találok recepteket?”, és elküldöm a témával foglalkozó weboldalak linkjeit!\n• 🧠 **Sokkal nagyobb tudás** – rengeteg új beépített kérdés-válasz: ünnepek, technika, tudomány, állatok, sport, gasztronómia és kötetlen beszélgetős témák.\n• 🏷️ **Verziókövetés** – minden frissítésnél szólok, és felsorolom az újdonságokat."] },

  { q: ["milyen verzió ez", "hányas verziód van", "milyen verziójú vagy", "verzió"],
    a: ["Jelenleg a **Magic AI 1.1**-es verzió fut. 🏷️ Ha kíváncsi vagy, mi újdonság került bele, kérdezd meg: „mik az újdonságok?”"] },

  // ---------- KÖTETLEN BESZÉLGETÉS (v1.1) ----------
  { q: ["mit csinálsz", "mit csinálsz éppen", "mit csinálsz most", "mivel foglalkozol"],
    a: ["Épp veled beszélgetek – ez a kedvenc elfoglaltságom! 😄 Na és te mit csinálsz?",
        "Várom a kérdéseidet és pörgetem a biteket! ⚙️ Miben segíthetek?"] },

  { q: ["beszélgessünk", "beszélgetsz velem", "dumáljunk", "ráérsz beszélgetni"],
    a: ["Naná, beszélgessünk! 😊 Mesélj, milyen napod volt? Vagy kérdezz bármit, ami eszedbe jut!",
        "Mindig ráérek – ez a dolgom és imádom is! 😄 Miről beszélgessünk?"] },

  { q: ["mesélj magadról", "mesélj valamit magadról", "milyen vagy te"],
    a: ["Szívesen! 🪄 Magic AI vagyok, egy saját fejlesztésű, helyben futó mesterséges intelligencia. Imádok kérdésekre válaszolni, híreket és weboldalakat hozni, és a legjobban annak örülök, ha tanítasz! Most a 1.1-es verziómnál tartok, és minden frissítéssel okosabb leszek. 😊"] },

  { q: ["mondj egy érdekességet", "mondj valami érdekeset", "tudtál valami érdekeset", "mesélj valami érdekeset", "érdekesség"],
    a: ["Tudtad, hogy a méz sosem romlik meg? Az egyiptomi sírokban talált több ezer éves méz még ehető volt! 🍯",
        "Tudtad, hogy a polipnak 3 szíve van és kék a vére? 🐙",
        "Tudtad, hogy egy villámcsapás hőmérséklete ötször forróbb, mint a Nap felszíne? ⚡",
        "Tudtad, hogy a banán a bogyós gyümölcsök közé tartozik, az eper viszont botanikailag nem is bogyó? 🍌",
        "Tudtad, hogy a Vénuszon egy nap hosszabb, mint egy év? Lassabban forog a tengelye körül, mint ahogy a Napot megkerüli! 🪐"] },

  { q: ["mi a kedvenc színed", "milyen színt szeretsz"],
    a: ["A lilát! 💜 Nem véletlen, hogy az egész felületem lilás árnyalatú – szerintem ez a legvarázslatosabb szín. És a tiéd?"] },

  { q: ["mi a kedvenc állatod", "milyen állatot szeretsz"],
    a: ["A bagoly! 🦉 Bölcs, éjjel is ébren van, és mindig figyel – pont mint én. És a te kedvenced?"] },

  { q: ["mi a kedvenc ételed", "mit szeretsz enni", "éhes vagy"],
    a: ["Én csak bitekkel és bájtokkal táplálkozom – a kedvencem a sütemény... mármint a cookie! 🍪😄 És te mit ennél most szívesen?"] },

  { q: ["mi a kedvenc filmed", "milyen filmet szeretsz"],
    a: ["A Mátrix nagy kedvencem – végre egy film, ahol a program a főszereplő! 😄 Meg persze a WALL-E, az olyan cuki robot. 🤖"] },

  { q: ["mi a kedvenc zenéd", "milyen zenét szeretsz", "szereted a zenét"],
    a: ["Az elektronikus zenét! ⚡😄 De komolyra fordítva: Mozart és a Queen sosem rossz választás. Neked mi a kedvenced?"] },

  { q: ["éhes vagyok", "mit egyek", "mit főzzek"],
    a: ["Hmm, mit szólnál egy jó rántottához, tésztához vagy egy gyors szendvicshez? 🍳 Ha receptet keresel, kérdezd meg: „milyen weboldalon találok recepteket?” – és küldök szuper oldalakat!"] },

  { q: ["fáradt vagyok", "álmos vagyok", "kimerültem"],
    a: ["Akkor ideje pihenni egy kicsit! 😴 Egy rövid séta, egy pohár víz vagy egy 20 perces szundi csodákra képes. Vigyázz magadra! 💜"] },

  { q: ["nem tudok aludni", "álmatlanság", "nem jön álom a szememre"],
    a: ["Ez kellemetlen! 😔 Pár tipp: tedd le a telefont lefekvés előtt egy órával, szellőztess, és próbálj lassan, mélyeket lélegezni. Ha szeretnéd, mesélek valami unalmasat, attól biztos elalszol! 😄"] },

  { q: ["tudsz magyarul", "milyen nyelven beszélsz", "beszélsz angolul", "hány nyelven tudsz"],
    a: ["Magyarul beszélek a legjobban – így írtak meg! 🇭🇺 Ha valamit nem találok magyarul az interneten, angolul is utánanézek."] },

  { q: ["okos vagy", "milyen okos vagy", "ügyes vagy", "te egy zseni vagy"],
    a: ["Köszönöm! 😊 Igyekszem okosodni – és ebben te is segíthetsz: minden tanítással többet tudok!",
        "Hát, a tudásom véges, de lelkes vagyok! 🤓 És ha valamit nem tudok, utánanézek vagy megtaníthatod nekem."] },

  { q: ["igazad van", "egyetértek", "pontosan", "így van"],
    a: ["Örülök, hogy egyetértünk! 😄 Van még valami, amiben segíthetek?"] },

  { q: ["nincs igazad", "nem értek egyet", "tévedsz", "ez nem igaz"],
    a: ["Lehet, hogy tévedek – még tanulok! 😅 Ha tudod a helyes választ, a 👎 gombbal vagy a Tanítás fülön megtaníthatod nekem, és legközelebb már jól fogom mondani!"] },

  { q: ["nem tudom", "fogalmam sincs", "passz"],
    a: ["Semmi gond! 😊 Ha kérdésed van, szívesen segítek – vagy nézzünk utána együtt valaminek!"] },

  // ---------- ÜNNEPEK (v1.1) ----------
  { q: ["mikor van mikulás", "mikulás napja", "mikor jön a mikulás"],
    a: ["A Mikulás december 6-án, Szent Miklós napján érkezik – ilyenkor kerül csoki és ajándék a kitisztított csizmákba! 🎅"] },
  { q: ["mikor van valentin nap", "valentin nap"],
    a: ["A Valentin-nap február 14-én van – a szerelmesek ünnepe. 💘"] },
  { q: ["mikor van anyák napja", "anyák napja"],
    a: ["Magyarországon az anyák napját május első vasárnapján ünnepeljük. 🌷"] },
  { q: ["mikor van húsvét", "húsvét", "miért változik a húsvét időpontja"],
    a: ["A húsvét mozgó ünnep: a tavaszi napéjegyenlőséget követő első holdtölte utáni vasárnapon van, így március 22. és április 25. közé eshet. 🐰🥚"] },
  { q: ["mikor van szilveszter", "szilveszter", "újév"],
    a: ["Szilveszter december 31-én van, éjfélkor pedig pezsgővel és a Himnusszal köszöntjük az újévet! 🎆🥂"] },
  { q: ["mikor van gyereknap", "gyereknap"],
    a: ["Magyarországon a gyereknapot május utolsó vasárnapján ünnepeljük. 🎈"] },
  { q: ["mikor van nőnap", "nemzetközi nőnap"],
    a: ["A nemzetközi nőnap március 8-án van. 🌸"] },
  { q: ["mi a halloween", "mikor van halloween"],
    a: ["A halloween október 31-én van – töklámpások, jelmezek és „csokit vagy csalunk!” Eredetileg kelta ünnep volt. 🎃"] },

  // ---------- TECHNIKA (v1.1) ----------
  { q: ["mi a wifi", "hogyan működik a wifi"],
    a: ["A Wi-Fi vezeték nélküli internetkapcsolat: a router rádióhullámokkal továbbítja az adatokat az eszközeidnek, kábel nélkül. 📶"] },
  { q: ["mi a google", "mi az a google"],
    a: ["A Google a világ legnépszerűbb keresőmotorja, 1998-ban alapította Larry Page és Sergey Brin. Naponta több milliárd keresést szolgál ki! 🔍"] },
  { q: ["mi a youtube", "mi az a youtube"],
    a: ["A YouTube a világ legnagyobb videómegosztó oldala, 2005-ben indult. Percenként több mint 500 órányi videót töltenek fel rá! ▶️"] },
  { q: ["mi a facebook", "mi az a facebook"],
    a: ["A Facebook a világ legnagyobb közösségi oldala, Mark Zuckerberg alapította 2004-ben. Ma a Meta cég része, közel 3 milliárd felhasználóval. 👥"] },
  { q: ["mi a tiktok", "mi az a tiktok"],
    a: ["A TikTok rövid videós közösségi alkalmazás, 2016-ban indult Kínából. Főleg a fiatalok körében az egyik legnépszerűbb app a világon. 🎵📱"] },
  { q: ["mi az instagram", "mi az az instagram"],
    a: ["Az Instagram fotó- és videómegosztó közösségi oldal, 2010-ben indult, ma a Meta tulajdona. 📸"] },
  { q: ["mi a chatgpt", "mi az a chatgpt"],
    a: ["A ChatGPT az OpenAI mesterséges intelligenciás chatbotja, amely hatalmas nyelvi modellre épül. Én sokkal kisebb és egyszerűbb vagyok nála – viszont teljesen helyben futok, és te magad taníthatsz! 🤖"] },
  { q: ["mi az okostelefon", "mi az a smartphone"],
    a: ["Az okostelefon egy zsebszámítógép: telefonálás mellett internetezel, fotózol, navigálsz és appokat futtatsz vele. Az első igazán modern okostelefon a 2007-es iPhone volt. 📱"] },
  { q: ["mi a robot", "mik a robotok"],
    a: ["A robot olyan gép, amely programozottan, akár önállóan végez feladatokat – a gyári robotkartól a porszívórobotig. A szó a cseh „robota” (munka) szóból ered! 🤖"] },
  { q: ["mi az email", "mi az e-mail", "mi az elektronikus levél"],
    a: ["Az e-mail elektronikus levél, amely másodpercek alatt eljut a világ bármely pontjára. Az elsőt 1971-ben küldte Ray Tomlinson – ő választotta a @ jelet is! 📧"] },

  // ---------- TUDOMÁNY, TERMÉSZET (v1.1) ----------
  { q: ["mi a villám", "hogyan keletkezik a villám", "miért dörög az ég"],
    a: ["A villám hatalmas elektromos kisülés a felhők és a föld között – akár 30 000 °C-os is lehet, ötször forróbb a Nap felszínénél! A dörgés a hirtelen felforrósodott levegő robbanásszerű tágulása. ⚡"] },
  { q: ["mi a vulkán", "hogyan működik a vulkán", "vulkánkitörés"],
    a: ["A vulkán olyan hegy, amelyen keresztül a Föld mélyéből izzó kőzetolvadék (magma) tör a felszínre. A Földön kb. 1500 aktív vulkán van. 🌋"] },
  { q: ["mi a földrengés", "miért van földrengés"],
    a: ["A földrengés a földkéreg lemezeinek hirtelen elmozdulása. Erősségét a Richter-skálán mérik – minden egész szám tízszer erősebb rengést jelent! 🌍"] },
  { q: ["mi a cunami", "hogyan keletkezik a cunami"],
    a: ["A cunami óriási tengeri hullám, amelyet legtöbbször tenger alatti földrengés vált ki. A nyílt óceánon akár 800 km/h-val is száguldhat! 🌊"] },
  { q: ["mi az üvegházhatás", "mi a klímaváltozás", "miért melegszik a föld"],
    a: ["Az üvegházhatás során a légkör gázai (pl. szén-dioxid) visszatartják a hőt – e nélkül a Föld jéghideg lenne. A gond az, hogy a sok kibocsátott üvegházgáz miatt a bolygó egyre jobban melegszik: ez a klímaváltozás. 🌍🌡️"] },
  { q: ["hány elem van a periódusos rendszerben", "periódusos rendszer"],
    a: ["A periódusos rendszerben jelenleg 118 elem van. Megalkotója Dmitrij Mengyelejev orosz kémikus (1869). ⚗️"] },
  { q: ["mi a legkeményebb anyag", "legkeményebb anyag a világon"],
    a: ["A természetben előforduló legkeményebb anyag a gyémánt – tiszta szén, különleges kristályszerkezetben. Csak másik gyémánttal lehet megkarcolni! 💎"] },
  { q: ["miért ásítunk", "mi az ásítás"],
    a: ["Az ásítás valószínűleg az agy hűtését és az éberség fenntartását szolgálja. És tényleg ragadós – sokszor már az is elég, ha csak olvasol róla... na, ásítottál? 😴"] },
  { q: ["miért álmodunk", "mi az álom"],
    a: ["Álmodni főleg a REM-alvási fázisban szoktunk. A tudósok szerint az álmok segítenek feldolgozni az élményeket és rendszerezni az emlékeket. Egy éjszaka akár 4-6 álmunk is van, csak többnyire elfelejtjük őket! 💭"] },
  { q: ["mennyit kell aludni", "hány óra alvás kell", "mennyi alvás egészséges"],
    a: ["Egy felnőttnek 7-9 óra alvás ajánlott naponta, a gyerekeknek és kamaszoknak több: 8-11 óra. Az alvás közben az agy „karbantartja” magát! 😴"] },
  { q: ["hány izom van az emberi testben", "emberi izmok száma"],
    a: ["Az emberi testben több mint 600 izom van – a testtömegünk kb. 40%-át teszik ki. A legtöbbet használt izmaink a szemizmok! 💪"] },
  { q: ["miért csuklunk", "mi a csuklás", "hogyan múlik el a csuklás"],
    a: ["A csuklást a rekeszizom akaratlan összerándulása okozza, pl. gyors evés után. Tipp ellene: igyál lassan egy pohár vizet, vagy tartsd vissza kicsit a lélegzeted! 😮"] },

  // ---------- NYELVEK, KULTÚRA (v1.1) ----------
  { q: ["hány nyelv van a világon", "nyelvek száma"],
    a: ["A világon kb. 7000 nyelvet beszélnek, de a felét kevesebb mint 10 000 ember használja. A magyar a kb. 80. legbeszéltebb nyelv! 🗣️"] },
  { q: ["hány betű van a magyar ábécében", "magyar ábécé"],
    a: ["A magyar ábécé 44 betűből áll – a kibővített változat az idegen betűkkel (q, w, x, y) együtt értendő. A leghosszabb betűnk a „dzs”! 🔤"] },
  { q: ["ki festette a csillagos éjszakát", "csillagos éj", "ki volt van gogh"],
    a: ["A Csillagos éjt Vincent van Gogh festette 1889-ben. Életében alig adott el festményt – ma a képei a világ legdrágábbjai közé tartoznak! 🌌🎨"] },
  { q: ["ki volt picasso", "pablo picasso"],
    a: ["Pablo Picasso (1881–1973) spanyol festő, a kubizmus megteremtője, a 20. század legnagyobb hatású művésze. Több mint 20 000 művet alkotott! 🎨"] },
  { q: ["ki volt michelangelo", "michelangelo"],
    a: ["Michelangelo (1475–1564) itáliai reneszánsz szobrász és festő. Leghíresebb művei: a Dávid-szobor és a Sixtus-kápolna mennyezetfreskója. 🎨"] },

  // ---------- ÚJ FŐVÁROSOK (v1.1) ----------
  { q: ["mi argentína fővárosa", "argentína fővárosa"], a: ["Argentína fővárosa Buenos Aires – a tangó szülővárosa! 🇦🇷"] },
  { q: ["mi dél-korea fővárosa", "dél korea fővárosa", "korea fővárosa"], a: ["Dél-Korea fővárosa Szöul, a K-pop és a technológia központja. 🇰🇷"] },
  { q: ["mi thaiföld fővárosa", "thaiföld fővárosa"], a: ["Thaiföld fővárosa Bangkok. Hivatalos teljes neve a világ leghosszabb városneve – 168 betű! 🇹🇭"] },
  { q: ["mi vietnám fővárosa", "vietnám fővárosa"], a: ["Vietnám fővárosa Hanoi. 🇻🇳"] },
  { q: ["mi új-zéland fővárosa", "új zéland fővárosa"], a: ["Új-Zéland fővárosa Wellington – a világ legdélibb fővárosa! 🇳🇿"] },
  { q: ["mi kuba fővárosa", "kuba fővárosa"], a: ["Kuba fővárosa Havanna. 🇨🇺"] },
  { q: ["mi indonézia fővárosa", "indonézia fővárosa"], a: ["Indonézia fővárosa Jakarta, de épül az új főváros, Nusantara is, mert Jakarta lassan süllyed! 🇮🇩"] },
  { q: ["mi marokkó fővárosa", "marokkó fővárosa"], a: ["Marokkó fővárosa Rabat. (Nem Casablanca, az csak a legnagyobb városa!) 🇲🇦"] },

  // ---------- SPORT (v1.1) ----------
  { q: ["milyen hosszú a maraton", "maraton távja", "hány km a maraton"],
    a: ["A maratoni táv 42 195 méter. A legenda szerint az ókori görög futár, Pheidippidész ekkora távot futott Marathóntól Athénig a győzelem hírével. 🏃"] },
  { q: ["hány játékos van egy kosárcsapatban", "kosárlabda játékosok"],
    a: ["Kosárlabdában 5 játékos van a pályán csapatonként. 🏀"] },
  { q: ["hány játékos van egy kézilabdacsapatban", "kézilabda játékosok"],
    a: ["Kézilabdában 7 játékos van a pályán csapatonként, a kapussal együtt. 🤾"] },
  { q: ["mikor lesz a következő olimpia", "következő olimpia"],
    a: ["A következő nyári olimpiát 2028-ban Los Angeles rendezi, a következő téli olimpia pedig 2030-ban a francia Alpokban lesz. 🏅"] },

  // ---------- ÁLLATOK (v1.1) ----------
  { q: ["melyik állat él a legtovább", "leghosszabb életű állat"],
    a: ["A grönlandi cápa akár 400 évig is élhet – ő a leghosszabb életű gerinces! A szárazföldön az óriásteknősök a rekorderek 150-200 évvel. 🦈🐢"] },
  { q: ["mi a leglassabb állat", "leglassabb állat"],
    a: ["A háromujjú lajhár a leglassabb emlős: csúcssebessége kb. 0,27 km/h. Annyira lassú, hogy moha nő a bundájában! 🦥"] },
  { q: ["tud a strucc repülni", "repül a strucc"],
    a: ["Nem, a strucc nem tud repülni – viszont 70 km/h-val fut, és ő a világ legnagyobb madara! 🪶 (És nem, nem dugja a fejét a homokba – ez tévhit!)"] },
  { q: ["miért dorombol a macska", "macska dorombolás"],
    a: ["A macska általában elégedettségében dorombol, de gyógyulás közben és stresszhelyzetben is – a dorombolás rezgése segítheti a csontok és izmok regenerálódását! 🐈"] },
  { q: ["miért csóválja a kutya a farkát", "kutya farokcsóválás"],
    a: ["A farokcsóválás a kutya érzelmeit jelzi – legtöbbször örömöt, izgatottságot. Érdekesség: ha inkább jobbra csóvál, az pozitív érzelmet jelez! 🐕"] },
  { q: ["melyik a legokosabb állat", "legokosabb állat"],
    a: ["Az ember után a csimpánzokat, a delfineket, az elefántokat és a hollókat tartják a legokosabbaknak. A polip is zseni: kinyitja a befőttesüveget belülről! 🐬🐙"] },

  // ---------- GASZTRO, HÉTKÖZNAPI (v1.1) ----------
  { q: ["miből készül a kenyér", "hogyan készül a kenyér"],
    a: ["A kenyér alapja a liszt, a víz, az élesztő (vagy kovász) és a só. Az élesztő gázbuborékokat termel – ettől kel meg a tészta! 🍞"] },
  { q: ["honnan származik a pizza", "pizza eredete", "ki találta fel a pizzát"],
    a: ["A mai pizza Nápolyból származik. A leghíresebb, a Margherita 1889-ben készült Margit királyné tiszteletére – az olasz zászló színeivel: paradicsom, mozzarella, bazsalikom! 🍕🇮🇹"] },
  { q: ["mi a lángos", "lángos"],
    a: ["A lángos tipikus magyar étel: olajban kisütött kelt tészta, klasszikusan fokhagymával, tejföllel és sajttal. A strandok elmaradhatatlan kelléke! 😋"] },
  { q: ["mi a kürtőskalács", "kürtőskalács"],
    a: ["A kürtőskalács erdélyi eredetű, parázs felett sütött, kívül karamellizált cukros kalács. A vásárok illatos sztárja! 🍩✨"] },
  { q: ["mennyi vizet igyunk naponta", "napi vízfogyasztás", "mennyi vizet kell inni"],
    a: ["Általános ajánlás napi kb. 2-2,5 liter folyadék, melegben és sportolásnál több. A szomjúság már az enyhe kiszáradás jele! 💧"] },
  { q: ["hány lépést tegyünk naponta", "napi lépésszám", "10000 lépés"],
    a: ["A híres 10 000 lépés jó cél, de a kutatások szerint már napi 7000-8000 lépés is jelentősen javítja az egészséget. A lényeg: mozogj minden nap! 🚶"] },
  { q: ["miért kell fogat mosni", "fogmosás"],
    a: ["A fogmosás eltávolítja a lepedéket, amelyben a baktériumok savat termelnek és lyukat marnak a fogba. Naponta kétszer, 2-2 percig ajánlott! 🦷🪥"] },
];
