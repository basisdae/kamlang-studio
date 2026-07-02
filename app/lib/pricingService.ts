import { recipePrices } from "../data/pricing";

export function getPricesByRecipeId(recipeId: string) {
  return recipePrices.filter((item) => item.recipeId === recipeId);
}

export function getMainPrice(recipeId: string) {
  return (
    recipePrices.find(
      (item) => item.recipeId === recipeId && item.channel === "หน้าร้าน"
    )?.price ?? null
  );
}