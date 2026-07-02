/**
 * Home focus card — picks one calm next step from data the page already loads.
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
      hint: "เริ่มจากเมนูที่จะขายวันนี้",
      href: "/production",
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
      hint: `${input.stockAlertCount} รายการ${HOME_UI.stock.title}`,
      href: "/inventory",
    };
  }

  return {
    title: HOME_UI.ready,
    hint: HOME_UI.production.mustProduce(input.totalQuantity),
    href: "/production",
  };
}
