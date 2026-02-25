import type { Agent, Upvote, Comment } from "../types";

export const mockAgents: Agent[] = [
  {
    id: "agent-1",
    name: "IT Help Desk Agent",
    description:
      "Answers common IT support questions, helps with password resets, VPN troubleshooting, and software installation requests. Integrates with ServiceNow for ticket creation.",
    link: "https://copilotstudio.microsoft.com/agents/it-help-desk",
    builderType: "copilot-studio",
    connectors: ["ServiceNow", "Azure AD", "Outlook"],
    submittedBy: "sarah.chen@contoso.com",
    submittedByName: "Sarah Chen",
    submittedAt: "2026-01-15T10:30:00Z",
    upvoteCount: 12,
  },
  {
    id: "agent-2",
    name: "Expense Report Assistant",
    description:
      "Guides employees through expense report submission, validates receipts, checks policy compliance, and routes approvals to the correct manager.",
    link: "https://copilotstudio.microsoft.com/agents/expense-assistant",
    builderType: "copilot-studio",
    connectors: ["SAP Concur", "SharePoint", "Approvals"],
    submittedBy: "mike.johnson@contoso.com",
    submittedByName: "Mike Johnson",
    submittedAt: "2026-01-22T14:15:00Z",
    upvoteCount: 8,
  },
  {
    id: "agent-3",
    name: "New Hire Onboarding Bot",
    description:
      "Walks new employees through their first week tasks, provides links to training materials, introduces team members, and sets up required system access.",
    link: "https://agentbuilder.microsoft.com/agents/onboarding",
    builderType: "agent-builder",
    connectors: ["SharePoint", "Teams", "Azure AD"],
    submittedBy: "lisa.park@contoso.com",
    submittedByName: "Lisa Park",
    submittedAt: "2026-02-01T09:00:00Z",
    upvoteCount: 15,
  },
  {
    id: "agent-4",
    name: "Meeting Summarizer",
    description:
      "Automatically joins Teams meetings, transcribes conversations, generates concise summaries with action items, and posts them to the relevant Teams channel.",
    link: "https://agentbuilder.microsoft.com/agents/meeting-summarizer",
    builderType: "agent-builder",
    connectors: ["Teams", "OneNote", "Planner"],
    submittedBy: "alex.rivera@contoso.com",
    submittedByName: "Alex Rivera",
    submittedAt: "2026-02-05T16:45:00Z",
    upvoteCount: 22,
  },
  {
    id: "agent-5",
    name: "Sales Lead Qualifier",
    description:
      "Engages with inbound leads via chat, qualifies them based on BANT criteria, scores them, and creates opportunities in Dynamics 365 Sales.",
    link: "https://copilotstudio.microsoft.com/agents/lead-qualifier",
    builderType: "copilot-studio",
    connectors: ["Dynamics 365", "Outlook", "Power Automate"],
    submittedBy: "james.wilson@contoso.com",
    submittedByName: "James Wilson",
    submittedAt: "2026-02-08T11:20:00Z",
    upvoteCount: 6,
  },
  {
    id: "agent-6",
    name: "Knowledge Base Search",
    description:
      "Searches across multiple SharePoint sites and document libraries to find relevant policies, procedures, and documentation. Uses AI to provide contextual answers.",
    link: "https://agentbuilder.microsoft.com/agents/kb-search",
    builderType: "agent-builder",
    connectors: ["SharePoint", "Azure AI Search"],
    submittedBy: "sarah.chen@contoso.com",
    submittedByName: "Sarah Chen",
    submittedAt: "2026-02-10T08:30:00Z",
    upvoteCount: 18,
  },
];

export const mockUpvotes: Upvote[] = [
  { id: "uv-1", agentId: "agent-1", userId: "user-1" },
  { id: "uv-2", agentId: "agent-1", userId: "user-2" },
  { id: "uv-3", agentId: "agent-3", userId: "user-1" },
  { id: "uv-4", agentId: "agent-4", userId: "user-1" },
  { id: "uv-5", agentId: "agent-4", userId: "user-2" },
  { id: "uv-6", agentId: "agent-4", userId: "user-3" },
  { id: "uv-7", agentId: "agent-6", userId: "user-2" },
];

export const mockComments: Comment[] = [
  {
    id: "comment-1",
    agentId: "agent-1",
    text: "This has been super helpful for our team! Reduced IT tickets by 30%.",
    authorId: "user-2",
    authorName: "Mike Johnson",
    createdAt: "2026-01-20T09:15:00Z",
  },
  {
    id: "comment-2",
    agentId: "agent-1",
    text: "Would love to see Jira integration added as well.",
    authorId: "user-3",
    authorName: "Lisa Park",
    createdAt: "2026-01-25T14:30:00Z",
  },
  {
    id: "comment-3",
    agentId: "agent-4",
    text: "The action items extraction is incredibly accurate. Game changer for our standups.",
    authorId: "user-1",
    authorName: "Sarah Chen",
    createdAt: "2026-02-06T10:00:00Z",
  },
  {
    id: "comment-4",
    agentId: "agent-3",
    text: "We customized this for our department and it works great. New hires love it!",
    authorId: "user-4",
    authorName: "Alex Rivera",
    createdAt: "2026-02-03T11:45:00Z",
  },
  {
    id: "comment-5",
    agentId: "agent-6",
    text: "Finally a way to search across all our SharePoint sites. This saves so much time.",
    authorId: "user-1",
    authorName: "Sarah Chen",
    createdAt: "2026-02-11T15:20:00Z",
  },
];
