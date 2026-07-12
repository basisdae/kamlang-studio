import { redirect } from "next/navigation";
import { PLATFORM_LANDING_PATH } from "../../lib/workspaces/appWorkspaces";

/** Legacy Workspace-named path — Landing is Platform /home */
export default function FinanceRedirectPage() {
  redirect(PLATFORM_LANDING_PATH);
}
