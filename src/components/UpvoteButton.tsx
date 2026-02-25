import "./UpvoteButton.css";

interface UpvoteButtonProps {
  count: number;
  active: boolean;
  onClick: () => void;
}

export function UpvoteButton({ count, active, onClick }: UpvoteButtonProps) {
  return (
    <button
      className={`upvote-btn ${active ? "upvote-btn-active" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={active ? "Remove upvote" : "Upvote"}
      aria-pressed={active}
    >
      <span className="upvote-icon">{active ? "\u2764" : "\u2661"}</span>
      <span className="upvote-count">{count}</span>
    </button>
  );
}
