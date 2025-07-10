import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcrypt";
import { db } from "./db";
import { checkAndSetAdminRole } from "./auth-utils";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await compare(credentials.password, user.password);

        if (!passwordMatch) {
          return null;
        }

        // Check if this is an admin email
        await checkAndSetAdminRole(credentials.email);

        // Get the latest user data (in case role was updated)
        const updatedUser = await db.user.findUnique({
          where: { email: credentials.email },
        });

        return {
          id: updatedUser!.id,
          email: updatedUser!.email,
          name: updatedUser!.name,
          image: updatedUser!.image,
          role: updatedUser!.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user.email) {
        // Check if this is an admin email
        await checkAndSetAdminRole(user.email);
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        },
      };
    },
  },
}; 