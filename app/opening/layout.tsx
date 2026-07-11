import { BiDataProviders } from "../providers/BiDataProviders";

/** Shared BI online providers for opening routes. */
export default function OpeningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BiDataProviders>{children}</BiDataProviders>;
}
