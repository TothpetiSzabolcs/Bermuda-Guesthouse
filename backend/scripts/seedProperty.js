import "dotenv/config";
import mongoose from "mongoose";
import Property from "../models/property.model.js";

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI hiányzik a .env-ből");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected");

  const doc = await Property.findOneAndUpdate(
    { slug: "bermuda-vendeghaz" },
    {
      name: "Bermuda Vendégház",
      slug: "bermuda-vendeghaz",
      ntak: "MA24095212",
      rentalMode: "rooms",
      basePricePerPerson: 9000,
      amenities: [
        "wifi","tv_minden_szobában","teljes_konyha","mosókonyha","étkező",
        "saját_fürdő_wc","nappali","terasz","nagyterem","csárda",
        "kemence","grill","bogrács","tó_fürdőzés",
        "játszótér","trambulin","csuszda","hinta","fészekhinta",
        "foci","tollas","pingpong","jakuzzi","dézsa"
      ],
      contact: {
        email: "bermudavendeghazvese@gmail.com",
        phone: "+36 30 261 5608",
        address: "Magyarország, Somogy megye, Vése, Zrinyi utca 1."
      },
      images: [],
      active: true
    },
    { upsert: true, new: true }
  );

  console.log("✅ Property ready:", { id: String(doc._id), name: doc.name, slug: doc.slug });
  await mongoose.disconnect();
  console.log("🏁 Done");
}

run().catch(e => { console.error(e); process.exit(1); });
