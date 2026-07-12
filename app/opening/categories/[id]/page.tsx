import { redirect } from "next/navigation";

/**
 * Legacy category drill — seed orphan.
 * Redirect into Opening Checklist (Route Compatibility · no orphan IA).
 */
export default async function OpeningCategoryRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  redirect("/opening/checklist");
}
