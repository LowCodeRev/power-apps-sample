import type { Agent } from "../types";

export type SortBy = "upvotes" | "newest" | "name";
export type BuilderTypeFilter = "all" | "copilot-studio" | "agent-builder";

export function filterAgents(
  agents: Agent[],
  searchQuery: string,
  builderTypeFilter: BuilderTypeFilter,
): Agent[] {
  const query = searchQuery.toLowerCase().trim();

  return agents.filter((agent) => {
    const matchesSearch =
      !query ||
      agent.name.toLowerCase().includes(query) ||
      agent.description.toLowerCase().includes(query);

    const matchesType =
      builderTypeFilter === "all" || agent.builderType === builderTypeFilter;

    return matchesSearch && matchesType;
  });
}

export function sortAgents(agents: Agent[], sortBy: SortBy): Agent[] {
  const sorted = [...agents];

  switch (sortBy) {
    case "upvotes":
      sorted.sort((a, b) => b.upvoteCount - a.upvoteCount);
      break;
    case "newest":
      sorted.sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() -
          new Date(a.submittedAt).getTime(),
      );
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return sorted;
}
