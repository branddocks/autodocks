import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { agency: true },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On first sign-in, user object is present
      if (user) {
        token.id = user.id;
      }

      // On session update (e.g., after onboarding)
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      // Fetch agency data once — undefined means "never checked", null means "checked, no agency yet"
      if (token.id && token.agencyId === undefined) {
        const agency = await prisma.agency.findUnique({
          where: { userId: token.id as string },
          select: {
            id: true,
            name: true,
            plan: true,
            subStatus: true,
            trialEndsAt: true,
          },
        });

        if (agency) {
          token.agencyId = agency.id;
          token.agencyName = agency.name;
          token.plan = agency.plan;
          token.subStatus = agency.subStatus;
          token.trialEndsAt = agency.trialEndsAt?.toISOString() ?? null;
        } else {
          // Explicitly mark as checked-but-no-agency to avoid repeated DB queries
          token.agencyId = null as any;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.agencyId = token.agencyId as string | undefined;
        session.user.agencyName = token.agencyName as string | undefined;
        session.user.plan = token.plan as string | undefined;
        session.user.subStatus = token.subStatus as string | undefined;
        session.user.trialEndsAt = token.trialEndsAt as string | null | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
};
