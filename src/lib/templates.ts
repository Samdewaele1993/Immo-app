export const STANDAARD_ELEMENTEN = [
  "Vloer",
  "Muren",
  "Plafond",
  "Ramen",
  "Deuren",
  "Verlichting",
  "Verwarming",
  "Stopcontacten & schakelaars",
];

export const KEUKEN_ELEMENTEN = [
  ...STANDAARD_ELEMENTEN,
  "Keukentoestellen",
  "Aanrecht",
  "Kranen & leidingen",
];

export const BADKAMER_ELEMENTEN = [
  ...STANDAARD_ELEMENTEN,
  "Sanitair",
  "Kranen & leidingen",
  "Ventilatie",
];

export function elementenVoorKamer(naam: string): string[] {
  const lower = naam.toLowerCase();
  if (lower.includes("keuken")) return KEUKEN_ELEMENTEN;
  if (lower.includes("bad") || lower.includes("douche") || lower.includes("wc") || lower.includes("toilet"))
    return BADKAMER_ELEMENTEN;
  return STANDAARD_ELEMENTEN;
}

export const CONDITIES = ["UITSTEKEND", "GOED", "MATIG", "SLECHT"] as const;
export type Conditie = (typeof CONDITIES)[number];
