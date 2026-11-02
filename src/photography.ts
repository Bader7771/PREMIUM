/** Rights verified against the original source pages. See PHOTOGRAPHY.md.
 * CDN transforms supply responsive crops; no generated images or API keys.
 */
export interface FoodPhoto {
  id: string;
  url: string;
  alt: string;
  source: string;
  author: string;
  license: string;
  licenseUrl: string;
  position?: string;
  caption?: string;
  provider: "pexels" | "commons";
}
const pexels = (
  id: string,
  slug: string,
  author: string,
  alt: string,
  position = "50% 50%",
): FoodPhoto => ({
  id,
  url: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg`,
  alt,
  source: `https://www.pexels.com/photo/${slug}-${id}/`,
  author,
  license: "Pexels License",
  licenseUrl: "https://www.pexels.com/license/",
  position,
  provider: "pexels",
});
export const photos: Record<string, FoodPhoto> = {
  pancakes: pexels(
    "7144309",
    "a-pancake-stack",
    "Monstera Production",
    "Pancakes dorés empilés sur une assiette blanche",
    "50% 56%",
  ),
  board: pexels(
    "34664651",
    "assorted-cheese-and-charcuterie-board-layout",
    "Novkov Visuals",
    "Plateau de fromages et charcuterie avec fruits et crackers",
  ),
  bagel: pexels(
    "3957499",
    "bagel-with-salmon",
    "Lucie Liz",
    "Bagels garnis de saumon et de fromage frais, vus du dessus",
  ),
  croissant: pexels(
    "25747196",
    "close-up-of-two-croissants-and-butter-on-a-plate",
    "Nunun Dy",
    "Croissants dorés sur une assiette",
    "50% 55%",
  ),
  toast: pexels(
    "1448665",
    "plate-of-sliced-breads",
    "Elviss Railijs Bitāns",
    "Tranches de pain grillé sur une assiette blanche",
  ),
  moroccan: {
    id: "moroccan-breakfast",
    url: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Traditional_Moroccan_breakfast.jpg",
    alt: "Table de petit déjeuner marocain avec pains et préparations à partager",
    source:
      "https://commons.wikimedia.org/wiki/File:Traditional_Moroccan_breakfast.jpg",
    author: "Ekaterina Kvelidze",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    provider: "commons",
  },
  churros: pexels(
    "17778856",
    "churros-on-a-plate",
    "Nadin Sh",
    "Churros dorés sur une assiette",
    "50% 45%",
  ),
  cake: pexels(
    "6803031",
    "close-up-of-a-simple-loaf-cake",
    "David Payne",
    "Cake tranché sur une planche, photographie de présentation",
  ),
  brownie: pexels(
    "30353753",
    "delicious-chocolate-brownies-on-white-plate",
    "Giovanna Kamimura",
    "Brownies au chocolat sur une assiette blanche",
  ),
  fruit: pexels(
    "15832882",
    "fruit-salad-in-a-bowl",
    "Dextar Studio",
    "Salade de fruits colorés dans un bol",
  ),
  guacamole: pexels(
    "31042722",
    "delicious-guacamole-served-in-stone-bowl",
    "Rodrigo Ortega",
    "Guacamole dans un bol en pierre avec une cuillère en bois",
  ),
  chia: pexels(
    "4397286",
    "chia-seed-pudding-topped-with-almond-flakes-and-blueberries-in-a-jar",
    "Antoni Shkraba",
    "Chia pudding dans un bocal, avec une présentation aux fruits",
  ),
  salad: pexels(
    "2821743",
    "bowl-of-salad",
    "Madison Inouye",
    "Salade de légumes dans un bol",
  ),
  orange: pexels(
    "8882541",
    "close-up-photo-of-a-glass-with-orange-juice",
    "Skyler Ewing",
    "Verre de jus d’orange sur une table verte éclairée par le soleil",
    "50% 58%",
  ),
  lemon: pexels(
    "5946719",
    "delicious-lemonade-in-glass-on-table-at-home",
    "Charlotte May",
    "Jus de citron dans un verre avec des tranches de citron",
    "50% 58%",
  ),
  milk: {
    id: "chocolate-milk",
    url: "https://upload.wikimedia.org/wikipedia/commons/7/7d/New_chocolate_milk.JPG",
    alt: "Verre de lait au chocolat",
    source: "https://commons.wikimedia.org/wiki/File:New_chocolate_milk.JPG",
    author: "Sugar Bear",
    license: "Domaine public",
    licenseUrl:
      "https://commons.wikimedia.org/wiki/File:New_chocolate_milk.JPG#Licensing",
    provider: "commons",
  },
  coffee: pexels(
    "7781785",
    "black-coffee-in-a-cup",
    "Daniel Dan",
    "Café noir dans une tasse blanche, vu du dessus",
  ),
  tea: pexels(
    "1417945",
    "peppermint-tea-on-teacup",
    "Mareefe",
    "Thé dans une tasse en verre avec des feuilles de menthe",
  ),
};
export function photoUrl(photo: FoodPhoto, width: number) {
  if (photo.provider === "pexels")
    return `${photo.url}?auto=compress&cs=tinysrgb&fit=crop&w=${width}&h=${Math.round(width * 0.75)}&dpr=1`;
  // Wikimedia standard thumbnail buckets; keep source/license in the visible credits.
  const path = photo.url.split("/wikipedia/commons/")[1];
  const filename = path.split("/").at(-1)!;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${width <= 960 ? "960" : "1280"}px-${filename}`;
}
export const productPhotos: Record<string, string> = {
  american: "pancakes",
  moroccan: "moroccan",
  healthy: "bagel",
  board: "board",
  savory: "bagel",
  "sweet-0": "pancakes",
  "sweet-1": "churros",
  "sweet-2": "cake",
  "sweet-3": "brownie",
  "extra-0": "fruit",
  "extra-1": "guacamole",
  "extra-2": "chia",
  "extra-3": "salad",
  "drink-0": "orange",
  "drink-1": "lemon",
  "drink-2": "milk",
  "drink-3": "coffee",
  "drink-4": "tea",
};
export const formatPhotos: Record<string, string> = {
  "format-0": "toast",
  "format-1": "bagel",
  "format-2": "croissant",
};
