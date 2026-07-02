export type SalesChannel = "หน้าร้าน" | "Grab" | "LINE MAN" | "รับเอง";

export type RecipePrice = {
  recipeId: string;
  channel: SalesChannel;
  price: number | null;
};

export const recipePrices: RecipePrice[] = [
  { recipeId: "recipe-krapao-moo", channel: "หน้าร้าน", price: 69 },
  { recipeId: "recipe-krapao-moo", channel: "Grab", price: 89 },
  { recipeId: "recipe-krapao-moo", channel: "LINE MAN", price: 89 },
  { recipeId: "recipe-krapao-moo", channel: "รับเอง", price: 69 },

  { recipeId: "recipe-fried-rice-pork", channel: "หน้าร้าน", price: null },
  { recipeId: "recipe-fried-rice-pork", channel: "Grab", price: null },
  { recipeId: "recipe-fried-rice-pork", channel: "LINE MAN", price: null },
  { recipeId: "recipe-fried-rice-pork", channel: "รับเอง", price: null },
];