import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "../../../components/layout/navConfig";
import { PRODUCTION_UI } from "../../production/copy";

export default function HomeStaffViewLink() {
  return (
    <Link href="/today" className="block kl-pressable">
      <div className="kl-section flex items-center justify-between gap-4">
        <div>
          <div className="kl-type-label">สำหรับครัว</div>
          <div className="kl-type-card-title mt-1">เปิดงานครัววันนี้</div>
          <p className="kl-type-helper mt-1.5">
            ดู{PRODUCTION_UI.sections.preOrders}และของที่ต้องเตรียม
          </p>
        </div>
        <ChevronRight
          className={`${KL_ICON_CLASS} shrink-0 text-kl-muted`}
          strokeWidth={KL_ICON_STROKE}
        />
      </div>
    </Link>
  );
}
