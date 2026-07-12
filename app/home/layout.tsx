import { BiDataProviders } from "../providers/BiDataProviders";

/** Platform Landing (/home) needs Shared Core data for compositions */
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BiDataProviders>{children}</BiDataProviders>;
}
