import { redirect } from "next/navigation";

/** Ready is the Hub result — not a separate menu. */
export default function OpeningReadyRedirect() {
  redirect("/opening");
}
