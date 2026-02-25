import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpvoteButton } from "../../components/UpvoteButton";

describe("UpvoteButton", () => {
  it("renders the upvote count", () => {
    render(<UpvoteButton count={5} active={false} onClick={() => {}} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows outline heart when not active", () => {
    render(<UpvoteButton count={0} active={false} onClick={() => {}} />);
    expect(screen.getByText("\u2661")).toBeInTheDocument();
  });

  it("shows filled heart when active", () => {
    render(<UpvoteButton count={1} active={true} onClick={() => {}} />);
    expect(screen.getByText("\u2764")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<UpvoteButton count={0} active={false} onClick={onClick} />);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("has correct aria-pressed when active", () => {
    render(<UpvoteButton count={1} active={true} onClick={() => {}} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("has correct aria-pressed when not active", () => {
    render(<UpvoteButton count={0} active={false} onClick={() => {}} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });
});
