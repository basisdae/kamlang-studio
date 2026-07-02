export type SearchResultGroup =
  | "ingredients"
  | "recipes"
  | "menus"
  | "production"
  | "inventory";

export type GlobalSearchResult = {
  id: string;
  group: SearchResultGroup;
  title: string;
  subtitle?: string;
  href: string;
};

export type GlobalSearchResults = Record<SearchResultGroup, GlobalSearchResult[]>;

export const SEARCH_GROUP_LABELS: Record<SearchResultGroup, string> = {
  ingredients: "วัตถุดิบ",
  recipes: "สูตรอาหาร",
  menus: "เมนูขาย",
  production: "แผนผลิต",
  inventory: "ของในครัว",
};

export const SEARCH_GROUP_ORDER: SearchResultGroup[] = [
  "ingredients",
  "recipes",
  "menus",
  "production",
  "inventory",
];
