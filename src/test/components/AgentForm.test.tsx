import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentForm } from "../../components/AgentForm";

describe("AgentForm", () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    currentUserEmail: "user@test.com",
    currentUserName: "Test User",
  };

  it("renders all form fields", () => {
    render(<AgentForm {...defaultProps} />);
    expect(screen.getByLabelText("Agent Name *")).toBeInTheDocument();
    expect(screen.getByLabelText("Description *")).toBeInTheDocument();
    expect(screen.getByLabelText("Link *")).toBeInTheDocument();
    expect(screen.getByText("Copilot Studio")).toBeInTheDocument();
    expect(screen.getByText("Agent Builder")).toBeInTheDocument();
  });

  it("defaults to agent-builder with connectors field disabled", () => {
    render(<AgentForm {...defaultProps} />);
    const agentBuilderRadio = screen.getByLabelText("Agent Builder") as HTMLInputElement;
    expect(agentBuilderRadio.checked).toBe(true);
    const connectorsInput = screen.getByLabelText("Actions / Connectors") as HTMLInputElement;
    expect(connectorsInput).toBeInTheDocument();
    expect(connectorsInput.disabled).toBe(true);
  });

  it("renders Agent Builder radio before Copilot Studio", () => {
    render(<AgentForm {...defaultProps} />);
    const radios = screen.getAllByRole("radio");
    const labels = radios.map((r) => (r as HTMLInputElement).value);
    expect(labels.indexOf("agent-builder")).toBeLessThan(labels.indexOf("copilot-studio"));
  });

  it("enables connectors field when copilot-studio is selected", async () => {
    const user = userEvent.setup();
    render(<AgentForm {...defaultProps} />);
    await user.click(screen.getByLabelText("Copilot Studio"));
    const connectorsInput = screen.getByLabelText("Actions / Connectors") as HTMLInputElement;
    expect(connectorsInput.disabled).toBe(false);
  });

  it("clears connectors when toggling from copilot-studio back to agent-builder", async () => {
    const user = userEvent.setup();
    render(<AgentForm {...defaultProps} />);
    await user.click(screen.getByLabelText("Copilot Studio"));
    await user.type(screen.getByLabelText("Actions / Connectors"), "SharePoint, Teams");
    await user.click(screen.getByLabelText("Agent Builder"));
    const connectorsInput = screen.getByLabelText("Actions / Connectors") as HTMLInputElement;
    expect(connectorsInput.value).toBe("");
    expect(connectorsInput.disabled).toBe(true);
  });

  it("does not render a Submitted By field", () => {
    render(<AgentForm {...defaultProps} />);
    expect(screen.queryByText("Submitted By")).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue("Test User")).not.toBeInTheDocument();
  });

  it("shows validation errors for empty required fields", async () => {
    const user = userEvent.setup();
    render(<AgentForm {...defaultProps} />);
    await user.click(screen.getByText("Submit Agent"));
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(screen.getByText("Link is required")).toBeInTheDocument();
  });

  it("calls onSubmit with correct data for copilot-studio agent", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AgentForm {...defaultProps} onSubmit={onSubmit} />);

    await user.click(screen.getByLabelText("Copilot Studio"));
    await user.type(screen.getByLabelText("Agent Name *"), "My Agent");
    await user.type(screen.getByLabelText("Description *"), "A great agent");
    await user.type(screen.getByLabelText("Link *"), "https://example.com");
    await user.type(screen.getByLabelText("Actions / Connectors"), "SharePoint, Teams");
    await user.click(screen.getByText("Submit Agent"));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "My Agent",
      description: "A great agent",
      link: "https://example.com",
      builderType: "copilot-studio",
      connectors: ["SharePoint", "Teams"],
      submittedBy: "user@test.com",
      submittedByName: "Test User",
    });
  });

  it("calls onSubmit with empty connectors for agent-builder", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AgentForm {...defaultProps} onSubmit={onSubmit} />);

    await user.click(screen.getByLabelText("Agent Builder"));
    await user.type(screen.getByLabelText("Agent Name *"), "My Agent");
    await user.type(screen.getByLabelText("Description *"), "A great agent");
    await user.type(screen.getByLabelText("Link *"), "https://example.com");
    await user.click(screen.getByText("Submit Agent"));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        builderType: "agent-builder",
        connectors: [],
      }),
    );
  });

  it("calls onCancel when cancel is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<AgentForm {...defaultProps} onCancel={onCancel} />);
    await user.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });
});
