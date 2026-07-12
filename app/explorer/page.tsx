import { redirect } from "next/navigation";
import { WORKSPACE_CHOOSER_PATH } from "../../lib/workspaces/appWorkspaces";

/** Explorer is Choose Workspace Hub — not a Workspace */
export default function ExplorerRedirectPage() {
  redirect(WORKSPACE_CHOOSER_PATH);
}
