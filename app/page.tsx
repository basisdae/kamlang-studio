import { redirect } from "next/navigation";

/** Root = Opening Hub (live bi_assets). Seed Overview retired from `/`. */
export default function HomePage() {
  redirect("/opening");
}
