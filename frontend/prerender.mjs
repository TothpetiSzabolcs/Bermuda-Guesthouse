import fs from "fs";
import path from "path";

const routes = [
  { url: "/gallery",  canonical: "https://bermuda-vendeghaz.hu/gallery" },
  { url: "/reviews",  canonical: "https://bermuda-vendeghaz.hu/reviews" },
  { url: "/privacy",  canonical: "https://bermuda-vendeghaz.hu/privacy" },
  { url: "/terms",    canonical: "https://bermuda-vendeghaz.hu/terms" },
  { url: "/contact",  canonical: "https://bermuda-vendeghaz.hu/contact" },
];

const base = fs.readFileSync("dist/index.html", "utf-8");

routes.forEach(({ url, canonical }) => {
  const html = base.replace(
    `<link rel="canonical" href="https://bermuda-vendeghaz.hu/" />`,
    `<link rel="canonical" href="${canonical}" />`
  );

  const dir = path.join("dist", url);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
  console.log(`✅ ${url}`);
});