"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  // refetchInterval: re-calls /api/auth/session every 60s, which triggers
  // the JWT callback that re-fetches plan/subStatus from DB.
  // This means admin subscription overrides propagate within ~60 seconds
  // to the middleware JWT cookie, without requiring the user to sign out.
  return (
    <SessionProvider refetchInterval={60} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  );
}
