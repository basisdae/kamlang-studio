import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Card from "../ui/Card";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../layout/navConfig";
import { formatBaht } from "../../app/opening/sampleData";

type CategoryCardProps = {
  href: string;
  name: string;
  itemCount: number;
  estimatedTotal: number;
  unknownPriceCount: number;
  progress: number;
};

export default function CategoryCard({
  href,
  name,
  itemCount,
  estimatedTotal,
  unknownPriceCount,
  progress,
}: CategoryCardProps) {
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <Link href={href} className="block kl-pressable">
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="kl-type-card-title">{name}</h3>
            <p className="kl-type-helper mt-1">
              {itemCount} รายการ · ประเมิน {formatBaht(estimatedTotal)}
            </p>
          </div>
          <ChevronRight
            className={`${KL_ICON_CLASS} shrink-0 text-kl-muted`}
            strokeWidth={KL_ICON_STROKE}
          />
        </div>

        <div
          className="kl-progress-track"
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`ความคืบหน้า ${name}`}
        >
          <div
            className="kl-progress-fill"
            style={{ width: `${clamped}%` }}
          />
        </div>

        <p className="kl-type-caption">
          ยังไม่ทราบราคา {unknownPriceCount} รายการ
        </p>
      </Card>
    </Link>
  );
}
