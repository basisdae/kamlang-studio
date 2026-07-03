"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import SearchBar from "../../components/ui/SearchBar";
import { searchGlobal } from "../lib/globalSearchService";
import SearchResults from "./components/SearchResults";

export default function SearchPage() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => searchGlobal(query),
    [query, pathname]
  );

  return (
    <AppShell
      title="ค้นหา"
      backHref="/"
      hidePageHeader
      compact
    >
      <SearchBar
        placeholder="ค้นหาวัตถุดิบ สูตร เมนูขาย..."
        value={query}
        onChange={setQuery}
      />

      <SearchResults
        query={query}
        results={results}
        onClearQuery={() => setQuery("")}
      />
    </AppShell>
  );
}
