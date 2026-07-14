import { BiDataProviders } from "../providers/BiDataProviders";

/** Partners Shared Core needs tenant Workspace (bi_workspaces) */
export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BiDataProviders>{children}</BiDataProviders>;
}
