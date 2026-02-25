import { useState, useEffect } from "react";
import type { PowerAppsContext } from "../types";

export function usePowerAppsContext(): PowerAppsContext | null {
  const [context, setContext] = useState<PowerAppsContext | null>(null);

  useEffect(() => {
    async function loadContext() {
      try {
        const { getContext } = await import("@microsoft/power-apps/app");
        const ctx = await getContext();

        setContext({
          user: {
            fullName: ctx.user.fullName ?? "",
            objectId: ctx.user.objectId ?? "",
            tenantId: ctx.user.tenantId ?? "",
            userPrincipalName: ctx.user.userPrincipalName ?? "",
          },
          app: {
            appId: ctx.app.appId,
            environmentId: ctx.app.environmentId,
            queryParams: ctx.app.queryParams,
          },
          host: {
            sessionId: ctx.host.sessionId,
          },
        });
      } catch {
        setContext({
          user: {
            fullName: "Dev User",
            objectId: "dev-user-object-id",
            tenantId: "dev-tenant-id",
            userPrincipalName: "dev@example.com",
          },
          app: {
            appId: "dev-app-id",
            environmentId: "dev-environment-id",
            queryParams: {},
          },
          host: {
            sessionId: "dev-session-id",
          },
        });
      }
    }

    loadContext();
  }, []);

  return context;
}
