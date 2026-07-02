import EmptyState from "../../../components/ui/EmptyState";
import type { GlobalSearchResults } from "../types";
import { EMPTY_STATE } from "../../copy/emptyStates";
import { SEARCH_GROUP_ORDER } from "../types";
import SearchResultGroup from "./SearchResultGroup";

type Props = {
  query: string;
  results: GlobalSearchResults;
  onClearQuery?: () => void;
};
export default function SearchResults({ query, results, onClearQuery }: Props) {
  const hasQuery = query.trim().length > 0;
  const hasResults = SEARCH_GROUP_ORDER.some(
    (group) => results[group].length > 0
  );

  if (!hasQuery) {
    return <EmptyState {...EMPTY_STATE.search.idle} />;
  }

  if (!hasResults) {
    return (
      <EmptyState
        {...EMPTY_STATE.search.noResults}
        onAction={onClearQuery}
      />
    );
  }

  return (
    <div className="space-y-6">
      {SEARCH_GROUP_ORDER.map((group) => (
        <SearchResultGroup
          key={group}
          group={group}
          results={results[group]}
        />
      ))}
    </div>
  );
}
