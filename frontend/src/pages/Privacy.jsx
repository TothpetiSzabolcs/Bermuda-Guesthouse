import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Adatkezelési tájékoztató
          </h1>
          
          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1. Az adatkezelő megnevezése és elérhetőségei
              </h2>
              <p className="text-gray-700">
                <strong>Bermuda Vendégház</strong><br />
                Email: info@bermuda-vendeghaz.hu<br />
                Weboldal: www.bermuda-vendeghaz.hu
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. A kezelt adatok köre és célja
              </h2>
              <p className="text-gray-700 mb-2">
                A foglalási folyamat során a következő adatokat kezeljük:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Név</li>
                <li>Email cím</li>
                <li>Érkezés és távozás dátuma</li>
                <li>Vendégek száma</li>
                <li>Esetleges üzenet, különleges kérések</li>
              </ul>
              <p className="text-gray-700 mt-2">
                <strong>Cél:</strong> A szállásfoglalás teljesítése, kapcsolattartás, számlázás.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3. Adatkezelés jogalapja
              </h2>
              <p className="text-gray-700">
                Az adatkezelés jogalapja az Ön hozzájárulása és a szerződés teljesítéséhez szükséges adatkezelés 
                (GDPR 6. cikk (1) bekezdés a) és b) pont).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4. Adatmegőrzés ideje
              </h2>
              <p className="text-gray-700">
                A foglalással kapcsolatos adatokat a szerződés teljesítését követő 3 évig őrizzük meg, 
                kivéve, ha jogszabály hosszabb megőrzési időt ír elő.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5. Adattovábbítás
              </h2>
              <p className="text-gray-700">
                Az email címét és kapcsolattartási adatait a következő célból továbbítjuk:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Email szolgáltatóknak a kommunikáció céljából</li>
                <li>Számlázó szoftvernek a számlázás céljából</li>
              </ul>
              <p className="text-gray-700 mt-2">
                Adatokat nem adunk át harmadik fél számára marketing célokra.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6. Érintetti jogok
              </h2>
              <p className="text-gray-700 mb-2">
                A GDPR értelmében Ön jogosult:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Tájékoztatást kérni a kezelt adatairól</li>
                <li>Helyesbítést kérni a pontatlan adatokon</li>
                <li>Törlést kérni (ha nincs jogalap a további kezeléssel szemben)</li>
                <li>Korlátozni az adatkezelést</li>
                <li>Hozzájutni az adataihoz és továbbítani másik adatkezelőnek</li>
                <li>Tiltakozni az adatkezelés ellen</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                7. Technikai adatok (Cookie-k)
              </h2>
              <p className="text-gray-700">
                Weboldalunk csak technikailag szükséges cookie-kat használ, amelyek elengedhetetlenek 
                a weboldal megfelelő működéséhez. Ezek nem igényelnek külön hozzájárulást.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                8. Panasztétel
              </h2>
              <p className="text-gray-700">
                Amennyiben úgy érzi, hogy az adatkezelésünk során jogsérelem érte, panaszát benyújthatja 
                a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (1055 Budapest, Falk Miksa utca 9-11.).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                9. Kapcsolat
              </h2>
              <p className="text-gray-700">
                Adatvédelmi kérdésekben keresse munkatársunkat:<br />
                Email: info@bermuda-vendeghaz.hu
              </p>
            </section>

            <div className="pt-6 border-t">
              <p className="text-sm text-gray-600">
                Hatályba lépés dátuma: 2026. január 28.<br />
                E tájékoztatót az adatkezelő fenntartja magának a jogot, hogy megváltoztassa.
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

export default Privacy;