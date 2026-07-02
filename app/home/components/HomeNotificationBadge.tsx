import Link from "next/link";
import { Bell } from "lucide-react";
import {
  KL_ICON_SM_CLASS,
  KL_ICON_STROKE,
} from "../../../components/layout/navConfig";

type Props = {
  count: number;
};

export default function HomeNotificationBadge({ count }: Props) {
  if (count <= 0) return null;

  return (
    <Link
      href="/notifications"
      className="kl-notification-chip kl-pressable"
      aria-label={`${count} สิ่งที่ต้องจัดการ`}
    >
      <Bell
        className={`${KL_ICON_SM_CLASS} shrink-0 text-white`}
        strokeWidth={KL_ICON_STROKE}
        aria-hidden
      />
      <span className="tabular-nums">{count}</span>
      <span className="sr-only">สิ่งที่ต้องจัดการ</span>
    </Link>
  );
}
