import { BiDataProviders } from "../providers/BiDataProviders";

/** Media library needs tenant Workspace (bi_workspaces) for storage paths */
export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BiDataProviders>{children}</BiDataProviders>;
}
