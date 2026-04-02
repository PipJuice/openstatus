import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { auth } from "@/lib/auth";
import { emailRouter } from "@openstatus/api/src/router/email";
import { createTRPCRouter, createTRPCContext } from "@openstatus/api/src/trpc";

const statusPageLambdaRouter = createTRPCRouter({
  emailRouter,
});

// Stripe is incompatible with Edge runtimes due to using Node.js events
// export const runtime = "edge";

const handler = auth((req) =>
  fetchRequestHandler({
    endpoint: "/api/trpc/lambda",
    router: statusPageLambdaRouter,
    req,
    createContext: () =>
      createTRPCContext({
        req,
        auth: async () => req.auth ?? null,
      }),
    onError: ({ error }) => {
      console.log("Error in tRPC handler (lambda)");
      console.error(error);
    },
  }),
);

export { handler as GET, handler as POST };
