import AppShell from "../../../components/layout/AppShell";
import EmptyState from "../../../components/ui/EmptyState";
import { EMPTY_STATE } from "../../copy/emptyStates";

export default function MenuNotFound() {
  return (
    <AppShell
      title="ไม่พบเมนูขาย"
      description="เมนูขายนี้อาจถูกลบหรือหาไม่เจอในร้านคุณ"
      backHref="/menus"
    >
      <EmptyState {...EMPTY_STATE.menus.notFound} />
    </AppShell>
  );
}
