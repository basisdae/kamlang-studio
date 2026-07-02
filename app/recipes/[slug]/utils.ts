export function formatMoney(value: number) {
  return Number(value.toFixed(2)).toString();
}

export function getStep(unit: string) {
  if (unit === "กรัม") return 5;
  return 1;
}
