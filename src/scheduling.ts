import { catalog, type CartLine } from "./catalog";
export interface DeliverySlot {
  id: string;
  start: string;
  end: string;
}
// ALL operating values below are DEMO assumptions pending confirmation.
export const deliveryRules = {
  timezone: "Africa/Casablanca",
  minLeadHours: 24,
  leadTimeProvisional: true,
  openingDays: [1, 2, 3, 4, 5, 6, 7],
  disabledDates: [] as string[],
  horizonDays: 30,
  slots: [
    { id: "morning", start: "10:00", end: "12:00" },
    { id: "noon", start: "12:00", end: "14:00" },
    { id: "afternoon", start: "14:00", end: "16:00" },
  ] as DeliverySlot[],
  serviceAreas: [
    {
      id: "demo",
      label: "Zone de démonstration — à confirmer",
      fee: null as number | null,
    },
  ],
  cutoff: null as { hour: number; minute: number } | null,
};
function parts(date: Date) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: deliveryRules.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
}
export function today(now = new Date()) {
  const p = parts(now);
  return `${p.year}-${p.month}-${p.day}`;
}
// Solve local wall-clock time against IANA timezone offsets, including Ramadan changes.
export function zonedInstant(date: string, time: string) {
  const target = Date.parse(`${date}T${time}:00Z`);
  let result = target;
  for (let i = 0; i < 4; i++) {
    const p = parts(new Date(result));
    const wall = Date.parse(
      `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}Z`,
    );
    result += target - wall;
  }
  const p = parts(new Date(result));
  if (
    `${p.year}-${p.month}-${p.day}` !== date ||
    `${p.hour}:${p.minute}` !== time
  )
    throw new Error("Heure locale indisponible");
  return result;
}
export function strictestLead(lines: CartLine[]) {
  return Math.max(
    deliveryRules.minLeadHours,
    ...lines.map(
      (l) => catalog.find((p) => p.id === l.productId)?.leadHours ?? 0,
    ),
  );
}
function addDays(date: string, days: number) {
  return new Date(Date.parse(`${date}T12:00:00Z`) + days * 86400000)
    .toISOString()
    .slice(0, 10);
}
export function scheduleError(
  date: string,
  slotId: string,
  lines: CartLine[],
  now = new Date(),
): string | undefined {
  try {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date
    )
      return "Choisissez une date valide.";
    const slot = deliveryRules.slots.find((s) => s.id === slotId);
    if (!slot) return "Choisissez un créneau de livraison.";
    const day = new Date(`${date}T12:00:00Z`).getUTCDay() || 7;
    if (
      !deliveryRules.openingDays.includes(day) ||
      deliveryRules.disabledDates.includes(date)
    )
      return "Cette date n’est pas disponible.";
    if (date > addDays(today(now), deliveryRules.horizonDays))
      return "Cette date est trop éloignée.";
    if (
      zonedInstant(date, slot.start) <
      now.getTime() + strictestLead(lines) * 3600000
    )
      return "Ce créneau n’est plus disponible. Respectez le délai de précommande et choisissez un autre créneau.";
    const cutoff = deliveryRules.cutoff;
    if (cutoff) {
      const p = parts(now);
      if (
        Number(p.hour) * 60 + Number(p.minute) >=
          cutoff.hour * 60 + cutoff.minute &&
        date < addDays(today(now), 2)
      )
        return "La limite de commande pour ce jour est dépassée.";
    }
  } catch {
    return "Choisissez une date valide.";
  }
  return undefined;
}
export function dates(lines: CartLine[], now = new Date()) {
  return Array.from({ length: deliveryRules.horizonDays + 1 }, (_, i) =>
    addDays(today(now), i),
  ).filter((d) =>
    deliveryRules.slots.some((s) => !scheduleError(d, s.id, lines, now)),
  );
}
export interface Customer {
  name: string;
  phone: string;
  address: string;
  area: string;
  date: string;
  slot: string;
  instructions: string;
  notes: string;
}
export function customerErrors(c: Customer, lines: CartLine[]) {
  const e: Record<string, string> = {};
  if (c.name.trim().length < 3) e.name = "Indiquez votre nom complet.";
  if (
    !/^\+?[\d\s().-]{8,24}$/.test(c.phone) ||
    c.phone.replace(/\D/g, "").length < 8 ||
    c.phone.replace(/\D/g, "").length > 15
  )
    e.phone = "Indiquez un numéro de téléphone valide.";
  if (c.address.trim().length < 8)
    e.address = "Précisez votre adresse de livraison.";
  if (!deliveryRules.serviceAreas.some((a) => a.id === c.area))
    e.area = "Choisissez une zone.";
  const error = scheduleError(c.date, c.slot, lines);
  if (error) e.slot = error;
  return e;
}
