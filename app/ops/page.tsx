import { redirect } from "next/navigation";
import { PLATFORM_LANDING_PATH } from "../../lib/workspaces/appWorkspaces";

/** Legacy path — Operations Landing is Platform /home */
export default function OpsRedirectPage() {
  redirect(PLATFORM_LANDING_PATH);
}
