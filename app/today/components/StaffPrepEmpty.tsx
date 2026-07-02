import EmptyState from "../../../components/ui/EmptyState";
import { EMPTY_STATE } from "../../copy/emptyStates";

export default function StaffPrepEmpty() {
  return <EmptyState {...EMPTY_STATE.today.noPlan} />;
}
