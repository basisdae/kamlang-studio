import {
  ClipboardList,
  Package,
  ShoppingCart,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../../../components/layout/navConfig";
import Card from "../../../components/ui/Card";

const links = [
  { href: "/production", label: "แผนผลิต", icon: ClipboardList },
  { href: "/purchase", label: "ซื้อของ", icon: ShoppingCart },
  { href: "/inventory", label: "สต๊อก", icon: Package },
  { href: "/menus", label: "เมนูขาย", icon: UtensilsCrossed },
];

export default function HomeQuickLinks() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {links.map((link) => {
        const Icon = link.icon;

        return (
          <Link key={link.href} href={link.href}>
            <Card className="flex min-h-[72px] flex-col items-center justify-center gap-2 p-3 text-center kl-pressable">
              <Icon
                className={`${KL_ICON_CLASS} text-kl-brown`}
                strokeWidth={KL_ICON_STROKE}
              />
              <div className="kl-type-label leading-tight text-kl-brown">
                {link.label}
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
