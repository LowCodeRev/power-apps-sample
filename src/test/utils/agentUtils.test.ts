import { describe, it, expect } from "vitest";
import { filterAgents, sortAgents } from "../../utils/agentUtils";
import type { Agent } from "../../types";

const agents: Agent[] = [
  {
    id: "1",
    name: "IT Help Desk",
    description: "Handles IT support requests",
    link: "https://example.com/1",
    builderType: "copilot-studio",
    connectors: ["ServiceNow"],
    submittedBy: "user@test.com",
    submittedByName: "Test User",
    submittedAt: "2026-01-15T10:00:00Z",
    upvoteCount: 5,
  },
  {
    id: "2",
    name: "Onboarding Bot",
    description: "Helps new hires get started",
    link: "https://example.com/2",
    builderType: "agent-builder",
    connectors: ["SharePoint"],
    submittedBy: "user2@test.com",
    submittedByName: "Test User 2",
    submittedAt: "2026-02-01T10:00:00Z",
    upvoteCount: 12,
  },
  {
    id: "3",
    name: "Expense Assistant",
    description: "Guides through expense reports and IT policies",
    link: "https://example.com/3",
    builderType: "copilot-studio",
    connectors: ["SAP"],
    submittedBy: "user3@test.com",
    submittedByName: "Test User 3",
    submittedAt: "2026-01-20T10:00:00Z",
    upvoteCount: 8,
  },
];

describe("filterAgents", () => {
  it("returns all agents when no filters applied", () => {
    const result = filterAgents(agents, "", "all");
    expect(result).toHaveLength(3);
  });

  it("filters by name search query (case-insensitive)", () => {
    const result = filterAgents(agents, "help desk", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("filters by description search query", () => {
    const result = filterAgents(agents, "new hires", "all");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("matches across name and description", () => {
    const result = filterAgents(agents, "IT", "all");
    expect(result).toHaveLength(2);
    expect(result.map((a) => a.id)).toEqual(["1", "3"]);
  });

  it("filters by builder type copilot-studio", () => {
    const result = filterAgents(agents, "", "copilot-studio");
    expect(result).toHaveLength(2);
    expect(result.every((a) => a.builderType === "copilot-studio")).toBe(true);
  });

  it("filters by builder type agent-builder", () => {
    const result = filterAgents(agents, "", "agent-builder");
    expect(result).toHaveLength(1);
    expect(result[0].builderType).toBe("agent-builder");
  });

  it("combines search and builder type filter", () => {
    const result = filterAgents(agents, "IT", "copilot-studio");
    expect(result).toHaveLength(2);
  });

  it("returns empty array when nothing matches", () => {
    const result = filterAgents(agents, "nonexistent", "all");
    expect(result).toHaveLength(0);
  });

  it("trims whitespace from search query", () => {
    const result = filterAgents(agents, "  help desk  ", "all");
    expect(result).toHaveLength(1);
  });
});

describe("sortAgents", () => {
  it("sorts by upvotes descending", () => {
    const result = sortAgents(agents, "upvotes");
    expect(result.map((a) => a.upvoteCount)).toEqual([12, 8, 5]);
  });

  it("sorts by newest first", () => {
    const result = sortAgents(agents, "newest");
    expect(result.map((a) => a.id)).toEqual(["2", "3", "1"]);
  });

  it("sorts by name alphabetically", () => {
    const result = sortAgents(agents, "name");
    expect(result.map((a) => a.name)).toEqual([
      "Expense Assistant",
      "IT Help Desk",
      "Onboarding Bot",
    ]);
  });

  it("does not mutate the original array", () => {
    const original = [...agents];
    sortAgents(agents, "upvotes");
    expect(agents).toEqual(original);
  });
});
