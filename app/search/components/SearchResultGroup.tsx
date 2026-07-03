import Link from "next/link";
import Card from "../../../components/ui/Card";
import SectionTitle from "../../../components/ui/SectionTitle";
import type { GlobalSearchResult } from "../types";
import { SEARCH_GROUP_LABELS } from "../types";

type Props = {
  group: GlobalSearchResult["group"];
  results: GlobalSearchResult[];
};

export default function SearchResultGroup({ group, results }: Props) {
  if (results.length === 0) return null;

  return (
    <section className="space-y-3">
      <SectionTitle module={group}>
        {SEARCH_GROUP_LABELS[group]} ({results.length})
      </SectionTitle>

      <div className="space-y-2">
        {results.map((result) => (
          <Link key={result.id} href={result.href} className="block kl-pressable">
            <Card className="space-y-1">
              <div className="kl-type-card-title break-words">{result.title}</div>
              {result.subtitle ? (
                <div className="kl-type-helper break-words">{result.subtitle}</div>
              ) : null}
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
