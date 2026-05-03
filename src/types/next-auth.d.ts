import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      agencyId?: string;
      agencyName?: string;
      plan?: string;
      subStatus?: string;
      trialEndsAt?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    agencyId?: string;
    agencyName?: string;
    plan?: string;
    subStatus?: string;
    trialEndsAt?: string | null;
  }
}
