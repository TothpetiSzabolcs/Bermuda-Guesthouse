import "dotenv/config";
import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Property from "../models/property.model.js";

await mongoose.connect(process.env.MONGO_URI);

console.log("MONGO_URI =", process.env.MONGO_URI);
const property = await Property.findOne({ slug: "bermuda-vendeghaz" });

if (!property) {
  console.error("Property not found");
  process.exit(1);
}

await Review.insertMany([
  {
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 10,
      location: 9.9,
      comfort: 9.9,
      staff: 10,
    },
    text: "Nagyon tiszta, csendes környezet, kedves vendéglátó.",
    date: new Date("2025-09-12"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 10,
      location: 10,
      comfort: 10,
      staff: 9.9,
    },
    text: "Nagyon kedves fogadtatás volt, tiszta, hangulatos szálláshely",
    date: new Date("2025-05-10"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 10,
      location: 9.9,
      comfort: 10,
      staff: 10,
    },
    text: "Rendkívül barátságos, közvetlen házigazdák. Ha kell távolságtartóak, teret hagynak ha erre van igényünk. Ettől függetlenül kellemes beszélgetőpartnerek, rengeteg közös témával. A szálláshely minden igényt kielégít, a kutyusunkat minden további nélkül bevihetjük, a kert is alkalmas bográcsozásra, sütögetésre.",
    date: new Date("2025-04-26"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 9.9,
      location: 10,
      comfort: 10,
      staff: 9.9,
    },
    text: "Tiszta,rendes szálláshely. Nagyon kedves, segítőkész szállásadó. Köszönünk mindent!",
    date: new Date("2025-04-22"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 9.9,
      location: 10,
      comfort: 10,
      staff: 9.9,
    },
    text: "A vendéglátók nagyon kedvesek voltak, a szoba tiszta, az ágy kényelmes, a környezet nagyon barátságos. Bátran ajánlom a vendégházat!",
    date: new Date("2024-08-16"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 10,
      location: 9.9,
      comfort: 9.9,
      staff: 10,
    },
    text: "Nagyon kedvesek, közvetlenek a vendéglátók, ragyogó tisztaság van mindenütt.",
    date: new Date("2024-05-10"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 10,
      location: 10,
      comfort: 10,
      staff: 10,
    },
    text: "A vendéglátó házaspár nagyon kedves. A szobák szépek, tiszták, kellemes illatúak. A kert szép és rendezett. Külön köszönet ahogyan a nagy testű bullmasztiff kutyánkat fogadták ❤️ Minden rendben volt a szállással",
    date: new Date("2024-05-06"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 10,
      location: 10,
      comfort: 9.9,
      staff: 10,
    },
    text: "Nagyon kellemes a környezet, családias a vendéglátás. A felmerült nehézségekhez nagyon sok segítséget kaptam, ezért külön köszönet.",
    date: new Date("2023-11-16"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 10,
      location: 9.9,
      comfort: 10,
      staff: 10,
    },
    text: "Nagyon jól felszerelt szuper hely, az udvarban lévő kis tó egy 'csoda'! Kedves szállásadók, nagyon meg szerettük Őket, Lili kutyussal.",
    date: new Date("2023-07-22"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 9.9,
      location: 9.9,
      comfort: 10,
      staff: 10,
    },
    text: "Kedves Szállásadók, gyönyörű szállás, finom, bőséges reggeli, tisztaság! Egyszóval minden tökéletes volt! Csak ajánlani tudom!",
    date: new Date("2023-07-15"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 10,
      location: 9.9,
      comfort: 10,
      staff: 9.9,
    },
    text: "",
    date: new Date("2025-09-11"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 9.9,
      location: 9.9,
      comfort: 10,
      staff: 9.9,
    },
    text: "",
    date: new Date("2025-08-19"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 10,
      location: 9.9,
      comfort: 10,
      staff: 10,
    },
    text: "",
    date: new Date("2025-03-04"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 9.9,
      location: 10,
      comfort: 10,
      staff: 9.9,
    },
    text: "",
    date: new Date("2023-09-26"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 10,
      location: 10,
      comfort: 10,
      staff: 9.9,
    },
    text: "",
    date: new Date("2023-08-20"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 9.9,
      location: 10,
      comfort: 10,
      staff: 9.8,
    },
    text: "",
    date: new Date("2023-08-18"),
    source: "legacy",
    approved: true,
  },{
    property: property._id,
    rating: 10,
    categories: {
      cleanliness: 10,
      location: 10,
      comfort: 10,
      staff: 10,
    },
    text: "",
    date: new Date("2023-04-24"),
    source: "legacy",
    approved: true,
  },
]);

console.log("Reviews seeded");
process.exit();
