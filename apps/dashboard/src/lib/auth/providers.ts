import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

export const GitHubProvider = GitHub({
  allowDangerousEmailAccountLinking: true,
});

export const GoogleProvider = Google({
  allowDangerousEmailAccountLinking: true,
  authorization: {
    params: {
      prompt: "select_account",
    },
  },
});

export const ResendProvider = Resend({
  apiKey: process.env.RESEND_API_KEY,
  from: "PipJuice Status <status@pipjuice.io>",
});
