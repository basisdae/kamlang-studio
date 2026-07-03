/**
 * Home focus — one clear next action from data the page already loads.
 */
import { HOME_UI } from "../copy";

export type HomeNextStep = {
  title: string;
  hint: string;
  href: string;
};

export function getHomeNextStep(input: {
  hasPlan: boolean;
  totalQuantity: number;
  purchaseTotal: number;
  boughtCount: number;
  stockAlertCount: number;
}): HomeNextStep {
  if (!input.hasPlan) {
    return {
      title: HOME_UI.production.createPlan,
      hint: HOME_UI.production.createHint,
      href: "/production/edit",
    };
  }

  if (input.purchaseTotal > 0 && input.boughtCount < input.purchaseTotal) {
    const remaining = input.purchaseTotal - input.boughtCount;

    return {
      title: HOME_UI.purchase.goBuy,
      hint: HOME_UI.purchase.remaining(remaining),
      href: "/purchase",
    };
  }

  if (input.stockAlertCount > 0) {
    return {
      title: HOME_UI.stock.checkStock,
      hint: HOME_UI.stock.alert(input.stockAlertCount),
      href: "/inventory",
    };
  }

  return {
    title: HOME_UI.kitchen.open,
    hint:
      input.totalQuantity > 0
        ? HOME_UI.kitchen.dishes(input.totalQuantity)
        : HOME_UI.kitchen.noDishes,
    href: "/today",
  };
}
