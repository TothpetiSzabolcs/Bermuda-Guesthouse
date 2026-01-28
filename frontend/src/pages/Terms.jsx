import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Általános Szerződési Feltételek és Lemondási Feltételek
          </h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1. A szolgáltató megnevezése és elérhetőségei
              </h2>
              <p className="text-gray-700">
                <strong>Bermuda Vendégház</strong><br />
                Email: info@bermuda-vendeghaz.hu<br />
                Weboldal: www.bermuda-vendeghaz.hu
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. A szállás szolgáltatásainak leírása
              </h2>
              <p className="text-gray-700">
                A Bermuda Vendégház szállás szolgáltatást nyújt a weboldalunkon keresztül történő 
                foglalás alapján. A foglalás elektronikus úton jön létre a vendég és a szolgáltató között.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3. Árak és fizetési feltételek
              </h2>
              <p className="text-gray-700 mb-2">
                <strong>Árak:</strong> A weboldalon feltüntetett árak érvényesek. Az ár tartalmazza 
                a szállás díját, nem tartalmazza a helyi idegenforgalmi adót (IAFA), amelynek összege 
                18 éven felüli vendégek esetén éjelenként 450 Ft.
              </p>
              <p className="text-gray-700">
                <strong>Fizetés:</strong> A fizetés készpénzben történik a szálláshelyen érkezéskor.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4. Foglalás menete
              </h2>
              <ol className="list-decimal pl-6 text-gray-700 space-y-1">
                <li>Vendég kitölti a foglalási űrlapot a weboldalon</li>
                <li>Rendszerünk automatikus visszaigazolást küld a foglalás fogadásáról</li>
                <li>Szolgáltató 24 órán belül visszaigazolja a foglalást és küldi a foglalási kódot</li>
                <li>A foglalás a szolgáltató visszaigazolásával lép hatályba</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5. Lemondási feltételek
              </h2>
              <p className="text-gray-700 mb-2">
                <strong>Ingyenes lemondás:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Érkezés előtt 14 nappal vagy korábban: ingyenes</li>
                <li>Érkezés előtt 7-13 nappal: 50% az első éjszaka ára</li>
                <li>Érkezés előtt 3-6 nappal: 70% az első éjszaka ára</li>
                <li>Érkezés előtt 0-2 nappal vagy meg nem jelenés: 100% az első éjszaka ára</li>
              </ul>
              <p className="text-gray-700 mt-2">
                A lemondást írásban (emailben) kell megtenni a szolgáltató felé.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6. Vendég kötelezettségei
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>A szálláshely rendjének és nyugalmának megőrzése</li>
                <li>A szobák és felszerelés rendeltetésszerű használata</li>
                <li>Károkozás esetén a kár megtérítése</li>
                <li>Érkezéskor a fennmaradó összeg kifizetése</li>
                <li>Helyi idegenforgalmi adó fizetése</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                7. Szolgáltató kötelezettségei
              </h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>A lefoglalt szoba biztosítása a megadott időszakra</li>
                <li>Tiszta, rendben tartott szállás biztosítása</li>
                <li>A weboldalon feltüntetett szolgáltatások nyújtása</li>
                <li>A vendég jogainak és biztonságának tiszteletben tartása</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                8. Erővis majorok
              </h2>
              <p className="text-gray-700">
                Ha a szolgáltatót előre nem látható külső ok (természeti katasztrófa, járvány, 
                háborús helyzet, stb.) akadályozza a szerződés teljesítésében, köteles a vendéget 
                haladéktalanul értesíteni és lehetőség szerint másik szállást biztosítani, vagy 
                a foglalási díjat visszatéríteni.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                9. Szállásra vonatkozó házirend
              </h2>
              <p className="text-gray-700 mb-2">
                <strong>Bejelentkezés:</strong> 14:00-tól<br />
                <strong>Kijelentkezés:</strong> 10:00-ig
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Házirend:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>A szálláshelyen tilos a dohányzás a szobákban</li>
                <li>Rendellenkedések (hangos zene, buli) 22:00 és 8:00 között nem megengedettek</li>
                <li>Házállatot nem tudunk fogadni</li>
                <li>Fokozottan figyeljük a környezeti zajszintet</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                10. Panaszkezelés
              </h2>
              <p className="text-gray-700">
                Bármilyen panasz esetén kérjük, először a szolgáltatónk jelezzék problémájukat. 
                Ha a panasz nem rendeződik, lehetőség van a fogyasztóvédelmi hatóságnál 
                vagy bíróságon érvényesíteni jogaikat.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                11. Vegyes rendelkezések
              </h2>
              <p className="text-gray-700">
                A jelen ÁSZF-ben nem szabályozott kérdésekre a magyar jogszabályok, különösen 
                a Polgári Törvénykönyv és a turisztikai törvény rendelkezései az irányadóak.
              </p>
            </section>

            <div className="pt-6 border-t">
              <p className="text-sm text-gray-600">
                Hatályba lépés dátuma: 2026. január 28.<br />
                E szerződési feltételeket a szolgáltató fenntartja magának a jogot, hogy megváltoztassa.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <Link
              to="/"
              className="inline-flex items-center text-green-700 hover:text-green-800 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Vissza a főoldalra
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;