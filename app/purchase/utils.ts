export function purchaseLineKey(ingredientId: string, unit: string) {
  return `${ingredientId}::${unit}`;
}
