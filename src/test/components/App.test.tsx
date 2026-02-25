import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App";
import * as dataverse from "../../services/dataverse";
import { LAST_UPDATED } from "../../version";

async function renderAndWait() {
  render(<App />);
  await waitFor(() => {
    expect(screen.queryByText("Loading agents...")).not.toBeInTheDocument();
  });
}

describe("App", () => {
  it("renders the header with app title", async () => {
    await renderAndWait();
    expect(screen.getByText("Agent Catalog")).toBeInTheDocument();
  });

  it("defaults to 'all' filter showing all agents", async () => {
    await renderAndWait();
    // Both Agent Builder and Copilot Studio agents should be visible
    expect(screen.getByText("New Hire Onboarding Bot")).toBeInTheDocument();
    expect(screen.getByText("Meeting Summarizer")).toBeInTheDocument();
    expect(screen.getByText("Knowledge Base Search")).toBeInTheDocument();
    expect(screen.getByText("IT Help Desk Agent")).toBeInTheDocument();
    expect(screen.getByText("Expense Report Assistant")).toBeInTheDocument();
    expect(screen.getByText("Sales Lead Qualifier")).toBeInTheDocument();
  });

  it("filters agents by search query", async () => {
    const user = userEvent.setup();
    await renderAndWait();
    await user.type(screen.getByPlaceholderText("Search agents..."), "onboarding");
    expect(screen.getByText("New Hire Onboarding Bot")).toBeInTheDocument();
    expect(screen.queryByText("Meeting Summarizer")).not.toBeInTheDocument();
  });

  it("filters agents by builder type", async () => {
    const user = userEvent.setup();
    await renderAndWait();
    // Click "Agent Builder" chip to filter — find the filter chip, not the badge
    const chips = screen.getAllByText("Agent Builder");
    await user.click(chips[0]);
    expect(screen.getByText("New Hire Onboarding Bot")).toBeInTheDocument();
    expect(screen.getByText("Meeting Summarizer")).toBeInTheDocument();
    expect(screen.queryByText("IT Help Desk Agent")).not.toBeInTheDocument();
  });

  it("navigates to agent detail view when card is clicked", async () => {
    const user = userEvent.setup();
    await renderAndWait();
    await user.click(screen.getByText("Meeting Summarizer"));
    expect(screen.getByText("← Back to catalog")).toBeInTheDocument();
    expect(screen.getByText("Open Agent →")).toBeInTheDocument();
  });

  it("navigates back to catalog from detail view", async () => {
    const user = userEvent.setup();
    await renderAndWait();
    await user.click(screen.getByText("Meeting Summarizer"));
    await user.click(screen.getByText("← Back to catalog"));
    expect(screen.getByPlaceholderText("Search agents...")).toBeInTheDocument();
  });

  it("opens and closes the submit agent modal", async () => {
    const user = userEvent.setup();
    await renderAndWait();
    await user.click(screen.getByText("+ Submit Agent"));
    expect(screen.getByText("Submit a New Agent")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Close"));
    expect(screen.queryByText("Submit a New Agent")).not.toBeInTheDocument();
  });

  it("submits a new agent and shows it in the grid", async () => {
    const user = userEvent.setup();
    await renderAndWait();
    await user.click(screen.getByText("+ Submit Agent"));
    await user.type(screen.getByLabelText("Agent Name *"), "Brand New Agent");
    await user.type(screen.getByLabelText("Description *"), "A fresh agent");
    await user.type(screen.getByLabelText("Link *"), "https://example.com/new");
    await user.click(screen.getByText("Submit Agent"));
    expect(screen.queryByText("Submit a New Agent")).not.toBeInTheDocument();
    expect(screen.getByText("Brand New Agent")).toBeInTheDocument();
  });

  it("shows error when agent submission fails", async () => {
    const user = userEvent.setup();
    await renderAndWait();

    vi.spyOn(dataverse, "createAgent").mockRejectedValueOnce(new Error("Network error"));

    await user.click(screen.getByText("+ Submit Agent"));
    await user.type(screen.getByLabelText("Agent Name *"), "Failing Agent");
    await user.type(screen.getByLabelText("Description *"), "Will fail");
    await user.type(screen.getByLabelText("Link *"), "https://example.com/fail");
    await user.click(screen.getByText("Submit Agent"));

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  it("renders a footer with the last updated date", async () => {
    await renderAndWait();
    expect(screen.getByText(`Last updated ${LAST_UPDATED}`)).toBeInTheDocument();
  });

  it("does not reorder agents when upvoting while sorted by upvotes", async () => {
    const user = userEvent.setup();
    await renderAndWait();

    // Capture initial card order via h3 headings
    const namesBefore = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);

    // Click upvote on the LAST card (lowest count) — if sort were live,
    // it would move up after the count increase
    const upvoteButtons = screen.getAllByRole("button", { name: /upvote/i });
    await user.click(upvoteButtons[upvoteButtons.length - 1]);

    const namesAfter = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);

    expect(namesAfter).toEqual(namesBefore);
  });

  it("shows error when adding a comment fails", async () => {
    const user = userEvent.setup();
    await renderAndWait();

    // Navigate to agent detail (use Agent Builder agent visible with default filter)
    await user.click(screen.getByText("Meeting Summarizer"));

    vi.spyOn(dataverse, "createComment").mockRejectedValueOnce(new Error("Comment failed"));

    const input = screen.getByPlaceholderText("Add a comment...");
    await user.type(input, "This will fail");
    await user.click(screen.getByText("Post"));

    await waitFor(() => {
      expect(screen.getByText(/Comment failed/)).toBeInTheDocument();
    });
  });
});
