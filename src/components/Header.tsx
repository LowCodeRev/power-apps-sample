import { Avatar } from "./Avatar";
import "./Header.css";

interface HeaderProps {
  userName: string;
  userPhoto?: string;
  onSubmitAgent: () => void;
}

export function Header({ userName, userPhoto, onSubmitAgent }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="header-title">Agent Catalog</h1>
        <span className="header-subtitle">
          Discover and share AI agents across the organization
        </span>
      </div>
      <div className="header-right">
        <button className="submit-agent-btn" onClick={onSubmitAgent}>
          + Submit Agent
        </button>
        <div className="header-user">
          <Avatar name={userName} photoUrl={userPhoto} size={32} />
          <span className="header-user-name">{userName}</span>
        </div>
      </div>
    </header>
  );
}
