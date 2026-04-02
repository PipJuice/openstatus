import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { auth } from "@/lib/auth";
import { statusPageRouter } from "@openstatus/api/src/router/statusPage";
import { createTRPCRouter, createTRPCContext } from "@openstatus/api/src/trpc";

const statusPageEdgeRouter = createTRPCRouter({
  statusPage: statusPageRouter,
});

export const runtime = "edge";

const handler = auth((req) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/edge",
    router: statusPageEdgeRouter,
    req,
    createContext: () =>
      createTRPCContext({
        req,
        auth: async () => req.auth ?? null,
      }),
    onError: ({ error }) => {
      console.log("Error in tRPC handler (edge)");
      console.error(error);
    },
  }),
);

export { handler as GET, handler as POST };
