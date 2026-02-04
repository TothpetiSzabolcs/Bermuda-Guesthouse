export function isPromoActive(promo, now = new Date()) {
  if (!promo?.enabled) return false;

  const start = promo.startAt ? new Date(promo.startAt) : null;
  const end = promo.endAt ? new Date(promo.endAt) : null;

  if (!start || !end) return false;

  return now >= start && now <= end;
}

export function getDisplayPrice(room, now = new Date()) {
  const base = room?.price?.amount;
  const promo = room?.price?.promo;

  if (isPromoActive(promo, now) && typeof promo.amount === "number") {
    return {
      amount: promo.amount,
      isPromo: true,
      baseAmount: base,
    };
  }

  return {
    amount: base,
    isPromo: false,
    baseAmount: null,
  };
}
