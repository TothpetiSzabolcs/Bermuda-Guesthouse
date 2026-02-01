import React, { useMemo } from "react";
import { useI18n } from "../i18n/useI18n";
import { FaCarSide, FaUmbrellaBeach, FaTableTennis } from "react-icons/fa";
import { GiVillage } from "react-icons/gi";
import { MdHotTub } from "react-icons/md";
import { cldFromId } from "../utils/cloudinary";

const CARDS = [
  {
    key: "offroad",
    icon: FaCarSide,
    coverId: "bermuda/gallery/programok/zuxioypowra8liky04uf",
  },
  {
    key: "lakeside",
    icon: FaUmbrellaBeach,
    coverId: "bermuda/gallery/to/awupqepgi9pfitewhdt2",
  },
  {
    key: "village",
    icon: GiVillage,
    coverId: "",
  },
  {
    key: "family",
    icon: FaTableTennis,
    coverId: "",
  },
  {
    key: "wellness",
    icon: MdHotTub,
    coverId: "bermuda/gallery/wellness/vbo09fx3mjeyvnsrpqhq",
  },
];

const TEXT = {
  hu: {
    title: "Élmények és programok",
    lead: "Töltődj fel aktívan vagy lazíts a természetben – válaszd a hozzád illő programot!",
    items: {
      offroad: {
        title: "Off-road túra",
        desc: "Adrenalin és kaland erdei utakon, vezetett terepjárós túrával. Kezdőknek és profiknak is.",
      },
      lakeside: {
        title: "Tóparti pihenés",
        desc: "Nyugodt kikapcsolódás a vízparton: napozás, piknik, esti grill – tökéletes relax.",
      },
      village: {
        title: "Falusi élmények",
        desc: "Hagyományos helyi ízek és szokások: kemence, bogrács, kézműves programok.",
      },
      csarda: {
        title: "Csárda & grill esték",
        desc: "Kemencés finomságok, grill és bogrács – közös sütés-főzés hangulatos környezetben.",
      },
      family: {
        title: "Családi játékok",
        desc: "Játszótér, focipálya, pingpong és tollas – aktív szórakozás kicsiknek-nagyoknak.",
      },
      wellness: {
        title: "Dézsafürdő & jakuzzi",
        desc: "Kikapcsolódás meleg vízben, csillagos ég alatt – esti feltöltődés pároknak és barátoknak.",
      },
    },
  },
  en: {
    title: "Experiences & Activities",
    lead: "Recharge actively or unwind in nature — pick what suits you best!",
    items: {
      offroad: {
        title: "Off-road tour",
        desc: "Guided 4x4 adventure on forest trails. Great for beginners and enthusiasts alike.",
      },
      lakeside: {
        title: "Lakeside relaxation",
        desc: "By-the-water calm: sunbathing, picnics, evening grill — pure unwind.",
      },
      village: {
        title: "Village traditions",
        desc: "Local tastes & customs: wood-fired oven, kettle cooking, hands-on activities.",
      },
      csarda: {
        title: "Csárda & grill nights",
        desc: "Wood-fired dishes, grill and kettle cooking — cozy, communal evenings.",
      },
      family: {
        title: "Family fun & games",
        desc: "Playground, soccer, ping-pong and badminton — active time for all ages.",
      },
      wellness: {
        title: "Hot tub & jacuzzi",
        desc: "Warm-water relaxation under the stars — perfect for evenings together.",
      },
    },
  },
  de: {
    title: "Erlebnisse & Programme",
    lead: "Aktiv auftanken oder in der Natur entspannen – wähle, was zu dir passt!",
    items: {
      offroad: {
        title: "Offroad-Tour",
        desc: "Geführtes 4x4-Abenteuer auf Waldwegen. Geeignet für Einsteiger und Profis.",
      },
      lakeside: {
        title: "Entspannung am See",
        desc: "Ruhe am Wasser: Sonnenbaden, Picknick, Abendgrill – pure Erholung.",
      },
      village: {
        title: "Dörfliche Traditionen",
        desc: "Regionale Küche & Bräuche: Holzofen, Kesselküche, Mitmach-Programme.",
      },
      csarda: {
        title: "Csárda & Grillabende",
        desc: "Holzofen-Spezialitäten, Grill und Kessel – stimmungsvolle Gemeinschaftsabende.",
      },
      family: {
        title: "Familien-Spiel & Spaß",
        desc: "Spielplatz, Fußball, Tischtennis und Badminton – aktiv für alle Altersgruppen.",
      },
      wellness: {
        title: "Holzbottich & Whirlpool",
        desc: "Entspannung im warmen Wasser unter Sternen – perfekt für den Abend.",
      },
    },
  },
};

export default function Experiences() {
  const { lang } = useI18n();
  const t = useMemo(() => TEXT[lang] ?? TEXT.hu, [lang]);

  return (
    <section
      id="experiences"
      className="scroll-mt-16 py-12 sm:py-16 md:py-20 bg-white/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            {t.title}
          </h2>
          <p className="mt-2 sm:mt-3 text-base sm:text-lg text-gray-600 leading-relaxed">
            {t.lead}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {CARDS.map((card) => {
            const { key, icon: Icon, coverId } = card;
            const copy = t.items[key];

            const bg = coverId
              ? cldFromId(coverId, "f_auto,q_auto,c_fill,g_center,w_1600,h_720")
              : undefined;

            return (
              <article
                key={key}
                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {bg ? (
                  <img
                    src={bg}
                    alt={copy.title}
                    className="h-72 w-full object-cover transition-transform duration-700 ease-out transform-gpu motion-safe:group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="h-72 w-full bg-gray-200" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1 rounded-full mb-3">
                    <Icon className="w-4 h-4 shrink-0" aria-hidden />
                    <span className="text-sm">{copy.title}</span>
                  </div>

                  <h3 className="text-2xl font-semibold">{copy.title}</h3>
                  <p className="mt-2 text-white/90">{copy.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
