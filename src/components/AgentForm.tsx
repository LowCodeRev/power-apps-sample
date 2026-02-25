import { useState } from "react";
import type { Agent } from "../types";
import "./AgentForm.css";

interface AgentFormProps {
  onSubmit: (agent: Omit<Agent, "id" | "submittedAt" | "upvoteCount">) => void;
  onCancel: () => void;
  currentUserEmail: string;
  currentUserName: string;
}

export function AgentForm({
  onSubmit,
  onCancel,
  currentUserEmail,
  currentUserName,
}: AgentFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [builderType, setBuilderType] = useState<Agent["builderType"]>("agent-builder");
  const [connectorsInput, setConnectorsInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!link.trim()) newErrors.link = "Link is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const connectors =
      builderType === "copilot-studio"
        ? connectorsInput
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
        : [];

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      link: link.trim(),
      builderType,
      connectors,
      submittedBy: currentUserEmail,
      submittedByName: currentUserName,
    });
  };

  return (
    <form className="agent-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label className="form-label" htmlFor="agent-name">
          Agent Name *
        </label>
        <input
          id="agent-name"
          className={`form-input ${errors.name ? "form-input-error" : ""}`}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. IT Help Desk Agent"
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="agent-description">
          Description *
        </label>
        <textarea
          id="agent-description"
          className={`form-textarea ${errors.description ? "form-input-error" : ""}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this agent do? How does it help users?"
          rows={4}
        />
        {errors.description && (
          <span className="form-error">{errors.description}</span>
        )}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="agent-link">
          Link *
        </label>
        <input
          id="agent-link"
          className={`form-input ${errors.link ? "form-input-error" : ""}`}
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
        />
        {errors.link && <span className="form-error">{errors.link}</span>}
      </div>

      <div className="form-field">
        <span className="form-label">Builder Type</span>
        <div className="builder-type-options">
          <label className="radio-label">
            <input
              type="radio"
              name="builderType"
              value="agent-builder"
              checked={builderType === "agent-builder"}
              onChange={() => {
                setBuilderType("agent-builder");
                setConnectorsInput("");
              }}
            />
            Agent Builder
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="builderType"
              value="copilot-studio"
              checked={builderType === "copilot-studio"}
              onChange={() => setBuilderType("copilot-studio")}
            />
            Copilot Studio
          </label>
        </div>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="agent-connectors">
          Actions / Connectors
        </label>
        <input
          id="agent-connectors"
          className={`form-input ${builderType === "agent-builder" ? "form-input-readonly" : ""}`}
          type="text"
          value={connectorsInput}
          onChange={(e) => setConnectorsInput(e.target.value)}
          placeholder="e.g. ServiceNow, SharePoint, Outlook"
          disabled={builderType === "agent-builder"}
        />
        <span className="form-hint">Comma-separated list</span>
      </div>

      <div className="form-actions">
        <button type="button" className="form-btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="form-btn-submit">
          Submit Agent
        </button>
      </div>
    </form>
  );
}
