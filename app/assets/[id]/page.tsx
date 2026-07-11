import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

/** Legacy route → Opening assets detail */
export default async function LegacyAssetDetailRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(`/opening/assets/${id}`);
}
