import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "../../components/FilterBar";

describe("FilterBar", () => {
  const defaultProps = {
    searchQuery: "",
    onSearchChange: vi.fn(),
    sortBy: "upvotes" as const,
    onSortChange: vi.fn(),
    builderFilter: "all" as const,
    onBuilderFilterChange: vi.fn(),
  };

  it("renders search input", () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByPlaceholderText("Search agents...")).toBeInTheDocument();
  });

  it("renders builder filter chips", () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Copilot Studio")).toBeInTheDocument();
    expect(screen.getByText("Agent Builder")).toBeInTheDocument();
  });

  it("renders filter chips in order: All, Agent Builder, Copilot Studio", () => {
    render(<FilterBar {...defaultProps} />);
    const chips = screen.getAllByRole("button").filter((b) =>
      ["All", "Agent Builder", "Copilot Studio"].includes(b.textContent ?? ""),
    );
    expect(chips.map((c) => c.textContent)).toEqual([
      "All",
      "Agent Builder",
      "Copilot Studio",
    ]);
  });

  it("renders sort dropdown", () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByText("Most Upvoted")).toBeInTheDocument();
  });

  it("calls onSearchChange when typing", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<FilterBar {...defaultProps} onSearchChange={onSearchChange} />);
    await user.type(screen.getByPlaceholderText("Search agents..."), "test");
    expect(onSearchChange).toHaveBeenCalled();
  });

  it("calls onBuilderFilterChange when clicking a filter chip", async () => {
    const user = userEvent.setup();
    const onBuilderFilterChange = vi.fn();
    render(<FilterBar {...defaultProps} onBuilderFilterChange={onBuilderFilterChange} />);
    await user.click(screen.getByText("Copilot Studio"));
    expect(onBuilderFilterChange).toHaveBeenCalledWith("copilot-studio");
  });

  it("calls onSortChange when changing sort", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<FilterBar {...defaultProps} onSortChange={onSortChange} />);
    await user.selectOptions(screen.getByRole("combobox"), "newest");
    expect(onSortChange).toHaveBeenCalledWith("newest");
  });
});
