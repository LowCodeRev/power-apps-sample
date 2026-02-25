import { useState } from "react";
import type { Comment } from "../types";
import { Avatar } from "./Avatar";
import "./CommentSection.css";

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  currentUserName: string;
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export function CommentSection({
  comments,
  onAddComment,
  currentUserName,
}: CommentSectionProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddComment(trimmed);
    setText("");
  };

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">
        Comments ({comments.length})
      </h3>
      <form className="comment-form" onSubmit={handleSubmit}>
        <Avatar name={currentUserName} size={28} />
        <input
          className="comment-input"
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Add a comment"
        />
        <button
          className="comment-submit"
          type="submit"
          disabled={!text.trim()}
        >
          Post
        </button>
      </form>
      {comments.length === 0 ? (
        <p className="no-comments">No comments yet. Be the first!</p>
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-item">
              <Avatar name={comment.authorName} size={28} />
              <div className="comment-body">
                <div className="comment-meta">
                  <span className="comment-author">
                    {comment.authorName}
                  </span>
                  <span className="comment-time">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
