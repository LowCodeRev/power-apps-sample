export interface Agent {
  id: string;
  name: string;
  description: string;
  link: string;
  builderType: "copilot-studio" | "agent-builder";
  connectors: string[];
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  upvoteCount: number;
}

export interface Upvote {
  id: string;
  agentId: string;
  userId: string;
}

export interface Comment {
  id: string;
  agentId: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface UserContext {
  fullName: string;
  objectId: string;
  tenantId: string;
  userPrincipalName: string;
  profilePhoto?: string;
}

export interface AppContext {
  appId: string;
  environmentId: string;
  queryParams: Record<string, string>;
}

export interface HostContext {
  sessionId: string;
}

export interface PowerAppsContext {
  user: UserContext;
  app: AppContext;
  host: HostContext;
}
