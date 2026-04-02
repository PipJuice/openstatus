import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { auth } from "@/lib/auth";
import { edgeRouter } from "@openstatus/api/src/edge";
import { createTRPCContext } from "@openstatus/api/src/trpc";

export const runtime = "edge";

const handler = auth((req) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/edge",
    router: edgeRouter,
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
