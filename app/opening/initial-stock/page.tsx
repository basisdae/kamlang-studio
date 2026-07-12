import { redirect } from "next/navigation";

/** Legacy route — same data as Checklist › วัตถุดิบ */
export default function OpeningInitialStockRedirect() {
  redirect("/opening/checklist/ingredients");
}
