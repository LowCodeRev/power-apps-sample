import type { SortBy, BuilderTypeFilter } from "../utils/agentUtils";
import "./FilterBar.css";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  builderFilter: BuilderTypeFilter;
  onBuilderFilterChange: (filter: BuilderTypeFilter) => void;
}

const BUILDER_FILTERS: { value: BuilderTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "agent-builder", label: "Agent Builder" },
  { value: "copilot-studio", label: "Copilot Studio" },
];

export function FilterBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  builderFilter,
  onBuilderFilterChange,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-bar-left">
        <input
          type="text"
          className="search-input"
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search agents"
        />
        <div className="builder-filter-chips">
          {BUILDER_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`filter-chip ${builderFilter === f.value ? "filter-chip-active" : ""}`}
              onClick={() => onBuilderFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="filter-bar-right">
        <label className="sort-label" htmlFor="sort-select">
          Sort by:
        </label>
        <select
          id="sort-select"
          className="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortBy)}
        >
          <option value="upvotes">Most Upvoted</option>
          <option value="newest">Newest</option>
          <option value="name">Name</option>
        </select>
      </div>
    </div>
  );
}
