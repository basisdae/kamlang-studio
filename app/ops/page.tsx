import { redirect } from "next/navigation";

/** Legacy path — Operations landing lives at /operations */
export default function OpsRedirectPage() {
  redirect("/operations");
}
