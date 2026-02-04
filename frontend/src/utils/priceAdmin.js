export function validatePromo(price) {
  if (!price?.promo?.enabled) return null;

  const { amount } = price;
  const { amount: promoAmount, startAt, endAt } = price.promo;

  if (typeof promoAmount !== "number") {
    return "Az akciós ár nincs megadva";
  }

  if (promoAmount >= amount) {
    return "Az akciós ár nem lehet magasabb vagy egyenlő az alap árnál";
  }

  if (!startAt || !endAt) {
    return "Akciós dátum nincs teljesen megadva";
  }

  if (new Date(startAt) >= new Date(endAt)) {
    return "Az akció vége nem lehet a kezdete előtt";
  }

  return null;
}
