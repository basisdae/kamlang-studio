import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "../../../components/layout/navConfig";
import ButtonLink from "../../../components/ui/ButtonLink";
import Card from "../../../components/ui/Card";

type Props = {
  businessName: string;
};

export default function SetupCompleteCard({ businessName }: Props) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start gap-3">
        <CheckCircle2
          className={`${KL_ICON_CLASS} mt-0.5 text-kl-success-text`}
          strokeWidth={KL_ICON_STROKE}
        />
        <div>
          <div className="text-[length:var(--kl-text-title)] font-semibold text-kl-success-text">
            ตั้งค่าเรียบร้อย
          </div>
          <p className="kl-text-caption mt-1.5 text-kl-success-text">
            {businessName.trim()
              ? `บันทึกข้อมูลร้าน "${businessName.trim()}" แล้ว`
              : "บันทึกการตั้งค่าเรียบร้อยแล้ว"}
          </p>
        </div>
      </div>

      <ButtonLink href="/import" fullWidth>
          นำเข้าจาก Excel
          <ArrowRight className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
        </ButtonLink>

        <p className="kl-type-label text-center">
          <Link href="/" className="kl-tap-link text-kl-brown kl-pressable">
            กลับหน้าแรก
          </Link>
        </p>
    </Card>
  );
}
