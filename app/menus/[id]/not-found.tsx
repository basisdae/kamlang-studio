import AppShell from "../../../components/layout/AppShell";
import EmptyState from "../../../components/ui/EmptyState";
import { EMPTY_STATE } from "../../copy/emptyStates";

export default function MenuNotFound() {
  return (
    <AppShell
      title="ไม่พบเมนูขาย"
      description="เมนูขายนี้อาจถูกลบหรือไม่มีในระบบ"
      backHref="/menus"
    >
      <EmptyState {...EMPTY_STATE.menus.notFound} />
    </AppShell>
  );
}
