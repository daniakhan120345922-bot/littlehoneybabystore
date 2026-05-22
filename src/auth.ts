import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "@/types/auth";

const fallbackAuthUrl =
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const authSecret =
  process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "nextauth-dev-secret";
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = fallbackAuthUrl;
}
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = authSecret;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: authSecret,
  debug: process.env.NODE_ENV !== "production",
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "");
        const role = credentials?.role as UserRole;
        if (!username || !password || (role !== "owner" && role !== "cashier")) {
          return null;
        }
        const { verifyStaffLogin } = await import("@/lib/settings");
        return verifyStaffLogin(username, password, role);
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: UserRole }).role;
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.sub ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 hours — shift-friendly for cashiers
  },
});
