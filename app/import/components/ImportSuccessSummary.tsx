import { Check } from "lucide-react";
import {
  KL_ICON_STROKE,
  KL_ICON_XL_CLASS,
} from "../../../components/layout/navConfig";
import type { ImportWriteSummary } from "../../lib/importWriteService";
import Card from "../../../components/ui/Card";
import SectionTitle from "../../../components/ui/SectionTitle";
import StatCell from "../../../components/ui/StatCell";

type Props = {
  summary: ImportWriteSummary;
};

export default function ImportSuccessSummary({ summary }: Props) {
  const total =
    summary.imported + summary.replaced + summary.addedNew + summary.skipped;

  return (
    <section className="space-y-3">
      <SectionTitle>เอาเข้าร้านแล้ว</SectionTitle>

      <Card className="space-y-4">
        <div className="text-center">
          <Check
            className={`mx-auto ${KL_ICON_XL_CLASS} text-kl-success-text`}
            strokeWidth={KL_ICON_STROKE}
          />
          <div className="kl-type-card-title mt-2 text-kl-success-text">
            เอาเข้าร้านสำเร็จ
          </div>
          <p className="kl-type-description mt-1.5 text-kl-success-text/80">
            รวม {total} รายการจากไฟล์
          </p>
        </div>

        <div className="kl-metric-grid">
          <StatCell label="เพิ่มใหม่" value={summary.imported} size="lg" />
          <StatCell label="ใช้ของใหม่" value={summary.replaced} size="lg" />
          <StatCell
            label="เพิ่มเป็นรายการใหม่"
            value={summary.addedNew}
            size="lg"
          />
          <StatCell label="ข้าม" value={summary.skipped} size="lg" />
        </div>
      </Card>
    </section>
  );
}
