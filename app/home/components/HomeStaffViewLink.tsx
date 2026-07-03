import Link from "next/link";
import SectionLink from "../../../components/ui/SectionLink";

export default function HomeStaffViewLink() {
  return (
    <SectionLink
      variant="nav"
      href="/today"
      label="สำหรับครัว"
      title="เปิดงานครัววันนี้"
    />
  );
}
