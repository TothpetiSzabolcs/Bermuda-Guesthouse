# On-Page SEO Audit - Bermuda Vendégház

## Összefoglaló
Az oldalakon végzett SEO audit alapján a weboldal jó állapotban van, de van néhány javítandó terület. A címsorstruktúra és a belső linkek megfelelőek, a képek alt szövegei nagy része jól van megoldva.

## Oldalankénti elemzés

### 1. Főoldal (Home + komponensek)
**Állapot: ✅ Jó**

**Címsorok:**
- H1: 1 db (HeroSection) ✅
- H2: 3 db (Rooms, Services, Experiences) ✅
- Hierarchia: H1 → H2 → H3 (megfelelő)

**Képek alt szövegek:**
- HeroSection háttérkép: ✅ Javítva (korábban generikus "background" volt)
- Room kártyák: ✅ `alt={room.name}`
- Service kártyák: ✅ Fordított alt szövegek
- Experience kártyák: ✅ `alt={copy.title}`

**Belső linkek:**
- Navigáció: ✅ Megfelelő
- Hőrárlintek: ✅ `handleHashClick` implementálva
- Cross-reference: ✅ HeroSection → Rooms link

### 2. Galéria oldal (GalleryPage)
**Állapot: ✅ Jó**

**Címsorok:**
- Kategória választó: H1 ✅
- Kategória részlet: H1 ✅ (view váltással)
- Hierarchia: Megfelelő

**Képek alt szövegek:**
- Kategória borítók: ✅ Fordított alt szövegek
- Galéria képek: ✅ `getAlt(m)` fallback logikával
- Videók: ✅ `aria-label` és alternatív szövegek

**Belső linkek:**
- Vissza a főoldalra: ✅ `Link to="/"`
- Kategória navigáció: ✅ Belső state management
- Lightbox: ✅ Akadálymentes gombok

### 3. Szoba részletek (RoomDetail)
**Állapot: ✅ Jó**

**Címsorok:**
- H1: 1 db (szoba neve) ✅
- H2: 4 db (leírás, felszereltség, etc.) ✅
- Hierarchia: Megfelelő

**Képek alt szövegek:**
- Fő kép: ✅ `alt={room.name}`
- További képek: ✅ `alt={room.name} - ${index + 1}`

**Belső linkek:**
- Vissza a szobákhoz: ✅ `to="/#rooms"`
- Foglalás modal: ✅

### 4. Adatvédelem & ÁSZF oldalak
**Állapot: ✅ Jó**

**Címsorok:**
- H1: 1-1 db (cím) ✅
- H2: Több szekció ✅
- Hierarchia: Megfelelő

**Belső linkek:**
- Vissza a főoldalra: ✅ Mindkét oldalon

## Javasolt javítások

### 1. IMMEDIÁTUS javítások ✅ (már megvalósítva)

**HeroSection alt szöveg javítása:**
- Korábban: `alt="background"` (túl generikus)
- Javítva: `alt={t("hero.bgAlt") || "Bermanda Vendégház - háttérkép"}`

**Hash scroll handler implementálása:**
- Létrehozva: `HashScroller.jsx` komponens
- Integrálva: `App.jsx`-ben
- Funkció: `/#rooms` linkek gördülnek a megfelelő szekcióra

### 2. POTENCIÁLIS fejlesztések

**Navigáció fejlesztése:**
- Jelenleg jó a `handleHashClick` implementáció
- Offset: 64px (header magasság) ✅

**Kép alt szövegek további finomítása:**
- Galéria: Van fallback logika, de lehetne még specifikusabb
- Room kártyák: A szoba név jó, de lehetne leírást is tartalmazni

**SEO meta adatok:**
- Az `SEO.jsx` komponens létezik, de érdemes ellenőrizni a dinamikus meta adatokat
- Room detail oldalaknál dinamikus title/description

## Technikai megvalósítás

### Hash Scroll Handler
```jsx
// HashScroller.jsx
const offset = 64; // Header height
const y = element.getBoundingClientRect().top + window.scrollY - offset;
window.scrollTo({ top: y, behavior: "smooth" });
```

### Alt Szöveg Fallback Logika
```jsx
const getAlt = (m) =>
  m.alt?.[lang] ||
  m.alt?.hu ||
  (lang === "en"
    ? "Gallery image"
    : lang === "de"
      ? "Galeriebild"
      : "Galéria kép");
```

## Összesítés

### ✅ Megfelelő
- H1 címsorok száma oldalanként (1 db)
- Címsor hierarchia (H1 → H2 → H3)
- Belső linkek és navigáció
- Képek alt szövegei (90%+)
- Akadálymentesség (ARIA label-ek)

### ✅ Javítva
- HeroSection generikus alt szöveg
- Hash scroll handler hiánya

### 🔄 Javasolt figyelemmel kísérni
- Dinamikus SEO meta adatok a detail oldalakon
- Kép alt szövegek további gazdagítása
- Strukturált adatok (Schema.org) implementálása

## Konklúzió
A weboldal on-page SEO szempontból jó állapotban van. A címsorstruktúra megfelelő, a belső linkek működőképesek, a képek többsége rendelkezik megfelelő alt szöveggel. Az azonnali javításokat elvégeztük, a maradék javaslatok inkább finomítások, mint kritikus hibák.