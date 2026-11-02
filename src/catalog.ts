export type Category =
  | "boards"
  | "savory"
  | "sweet"
  | "extras"
  | "drinks"
  | "brunch";
export interface Option {
  id: string;
  name: string;
  price?: number;
}
export interface OptionGroup {
  id: string;
  label: string;
  options: Option[];
  required?: boolean;
  max?: number;
}
export interface Product {
  id: string;
  category: Category;
  name: string;
  price: number;
  description: string;
  image?: string;
  kind?: "board" | "savory" | "alternative";
  blocked?: boolean;
  leadHours?: number;
  groups?: OptionGroup[];
}
export interface Configuration {
  size: string;
  ingredients: string[];
  sauces: string[];
  sides: string[];
  format: string;
  filling: string;
  alternative: string;
  packDrink: string;
  notes: string;
}
export interface CartLine {
  id: string;
  productId: string;
  config: Configuration;
  quantity: number;
}
export const brand = {
  name: "PREMIUM",
  tagline: "GOOD FOOD, GOOD MOOD",
  provisional: true,
};
export const categories: { id: Category; name: string; icon: string }[] = [
  { id: "brunch", name: "Packs brunch", icon: "brunch" },
  { id: "boards", name: "Cheese boards", icon: "boards" },
  { id: "savory", name: "Salé", icon: "savory" },
  { id: "sweet", name: "Sucré", icon: "sweet" },
  { id: "extras", name: "Suppléments", icon: "extras" },
  { id: "drinks", name: "Boissons", icon: "drinks" },
];
export const sizes = [
  { id: "small", name: "Petit", price: 13000, count: 4 },
  { id: "medium", name: "Moyen", price: 17000, count: 6 },
  { id: "large", name: "Grand", price: 20000, count: 8 },
];
const opts = (names: string[], prefix: string): Option[] =>
  names.map((name, i) => ({ id: `${prefix}-${i}`, name }));
export const cheeses = opts(
  ["Brie", "Gouda", "Cheddar", "Fromage bleu", "Edam", "Fromage de chèvre"],
  "cheese",
);
export const meats = opts(
  [
    "Salami au poivre",
    "Salami aux fines herbes",
    "Salami de bœuf",
    "Dinde fumée",
  ],
  "meat",
);
// Optional/unlimited at no added cost until allowances are confirmed.
export const boardGroups: OptionGroup[] = [
  {
    id: "sauces",
    label: "Les sauces",
    options: opts(["Sauce sucrée", "Sauce salée"], "sauce"),
  },
  {
    id: "sides",
    label: "Les accompagnements",
    options: opts(
      ["Fruits secs", "Fruits frais", "Crackers", "Pretzels"],
      "side",
    ),
  },
];
export const formats = opts(["Toast", "Bagel", "Croissant"], "format");
export const fillings: Option[] = [
  { id: "mozza", name: "Mozzarella & tomate", price: 4000 },
  { id: "avocado", name: "Avocat & œuf", price: 3600 },
  { id: "turkey", name: "Dinde fumée & fromage", price: 3600 },
  { id: "salmon", name: "Saumon & fromage", price: 4500 },
];
// Provisional: each filling is available in each format.
export const availability: Record<string, string[]> = Object.fromEntries(
  formats.map((f) => [f.id, fillings.map((x) => x.id)]),
);
export const packDrinkOptions: Option[] = []; // Pending client confirmation: do not infer included drinks.
export const catalog: Product[] = [
  {
    id: "american",
    category: "brunch",
    name: "Brunch américain",
    price: 9000,
    description:
      "Pancakes, omelette à la dinde fumée, toast à l’avocat & boisson froide/chaude.",
    image: "pancakes",
    groups: [
      {
        id: "drink",
        label: "Boisson incluse — choix à confirmer",
        options: packDrinkOptions,
      },
    ],
  },
  {
    id: "moroccan",
    category: "brunch",
    name: "Brunch marocain",
    price: 5500,
    description: "Msemen, harcha, baghrir, œufs à la tomate, thé & balboula.",
    image: "moroccan",
  },
  {
    id: "healthy",
    category: "brunch",
    name: "Brunch healthy",
    price: 12000,
    description:
      "Chia pudding, bagel saumon & fromage, salade & Healthy Drink.",
    image: "bagel",
  },
  {
    id: "composed",
    category: "brunch",
    name: "Brunch composé",
    price: 13000,
    description: "Composition à confirmer.",
    blocked: true,
  },
  {
    id: "board",
    category: "boards",
    name: "Votre cheese board",
    price: 13000,
    description:
      "Vos fromages et charcuteries préférés, réunis sur un plateau à composer.",
    kind: "board",
    image: "board",
  },
  {
    id: "savory",
    category: "savory",
    name: "À chacun son salé",
    price: 3600,
    description:
      "Toast, bagel ou croissant. Choisissez votre format et votre garniture.",
    kind: "savory",
    image: "bagel",
  },
  ...["Pancakes", "Churros", "Cake", "Brownie"].map(
    (name, i): Product => ({
      id: `sweet-${i}`,
      category: "sweet",
      name,
      price: 2000,
      description: "Une touche de douceur.",
      image: i === 0 ? "pancakes" : undefined,
    }),
  ),
  ...["Salade de fruits", "Guacamole", "Chia pudding / Balboula", "Salade"].map(
    (name, i): Product => ({
      id: `extra-${i}`,
      category: "extras",
      name,
      price: 2000,
      description:
        i === 2
          ? "Choisissez votre supplément."
          : "Pour compléter votre brunch.",
      kind: i === 2 ? "alternative" : undefined,
    }),
  ),
  ...[
    "Jus d’orange",
    "Jus de citron",
    "Lait au chocolat",
    "Café",
    "Thé",
    "Healthy Drink",
    "Exotic Drink",
  ].map(
    (name, i): Product => ({
      id: `drink-${i}`,
      category: "drinks",
      name,
      price: i > 4 ? 4000 : 2000,
      description: "À ajouter à votre sélection.",
      image: i === 0 ? "orange" : undefined,
    }),
  ),
];
export const emptyConfig = (): Configuration => ({
  size: "small",
  ingredients: [],
  sauces: [],
  sides: [],
  format: formats[0].id,
  filling: fillings[0].id,
  alternative: "",
  packDrink: "",
  notes: "",
});
export const money = (minor: number) => `${minor / 100} DH`;
export function price(p: Product, c: Configuration) {
  return p.kind === "board"
    ? sizes.find((s) => s.id === c.size)!.price
    : p.kind === "savory"
      ? fillings.find((f) => f.id === c.filling)!.price!
      : p.price;
}
export function configError(p: Product, c: Configuration): string | undefined {
  if (p.blocked)
    return "Composition à confirmer : ce brunch ne peut pas encore être commandé.";
  if (p.kind === "board") {
    const size = sizes.find((s) => s.id === c.size);
    if (!size) return "Taille invalide.";
    if (
      new Set(c.ingredients).size !== size.count ||
      c.ingredients.some(
        (id) => ![...cheeses, ...meats].some((o) => o.id === id),
      )
    )
      return `Choisissez exactement ${size.count} produits au total.`;
    for (const g of boardGroups) {
      const selected = c[g.id as "sauces" | "sides"];
      if (
        selected.some((id) => !g.options.some((o) => o.id === id)) ||
        (g.max !== undefined && selected.length > g.max) ||
        (g.required && !selected.length)
      )
        return `Vérifiez ${g.label.toLowerCase()}.`;
    }
  }
  if (
    p.id === "american" &&
    packDrinkOptions.length &&
    !packDrinkOptions.some((o) => o.id === c.packDrink)
  )
    return "Choisissez votre boisson incluse.";
  if (p.kind === "savory" && !availability[c.format]?.includes(c.filling))
    return "Cette garniture n’est pas disponible dans ce format.";
  if (
    p.kind === "alternative" &&
    !["Chia pudding", "Balboula"].includes(c.alternative)
  )
    return "Choisissez Chia pudding ou Balboula.";
  return undefined;
}
export function summary(p: Product, c: Configuration) {
  const all = [...cheeses, ...meats, ...boardGroups.flatMap((g) => g.options)];
  return [
    p.kind === "board" ? sizes.find((s) => s.id === c.size)?.name : null,
    p.kind === "savory"
      ? `${formats.find((f) => f.id === c.format)?.name} · ${fillings.find((f) => f.id === c.filling)?.name}`
      : null,
    ...[...c.ingredients, ...c.sauces, ...c.sides].map(
      (id) => all.find((x) => x.id === id)?.name,
    ),
    c.alternative,
    c.packDrink && packDrinkOptions.find((o) => o.id === c.packDrink)?.name,
    c.notes && `Note : ${c.notes}`,
  ]
    .filter(Boolean)
    .join(" · ");
}
