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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // cookies block removed to use NextAuth.js defaults
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: new Date(), // Automatically mark email as verified for Google OAuth
          isVerified: true, // Set isVerified to true as well
        };
      },
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

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("email_not_verified");
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
          phone: updatedUser!.phone,
          phoneVerified: updatedUser!.phoneVerified,
          address: updatedUser!.address,
          deliveryAddress: updatedUser!.deliveryAddress,
          isVerified: updatedUser!.isVerified,
          emailVerified: updatedUser!.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (user.email) {
        // Check if this is an admin email
        await checkAndSetAdminRole(user.email);
        
        // For OAuth providers, automatically verify email
        if (account?.provider === 'google') {
          // First check if the user exists
          const existingUser = await db.user.findUnique({
            where: { email: user.email },
          });
          
          if (existingUser && !existingUser.emailVerified) {
            // Update the user to mark email as verified
            await db.user.update({
              where: { email: user.email },
              data: {
                emailVerified: new Date(),
                isVerified: true,
              },
            });
            
            // Update the user object with the latest data from the database
            user.id = existingUser.id;
            user.name = existingUser.name || user.name;
            user.image = existingUser.image || user.image;
            user.role = existingUser.role;
            user.phone = existingUser.phone;
            user.phoneVerified = existingUser.phoneVerified;
            user.address = existingUser.address;
            user.deliveryAddress = existingUser.deliveryAddress;
            user.isVerified = existingUser.isVerified;
            user.emailVerified = existingUser.emailVerified;
            
          } else {
            console.log('OAuth sign in: New user will be created', {
              email: user.email,
              name: user.name
            });
          }
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        
        return {
          ...token,
          id: user.id,
          name: user.name,
          image: user.image,
          role: user.role,
          phone: user.phone,
          phoneVerified: user.phoneVerified,
          address: user.address,
          deliveryAddress: user.deliveryAddress,
          isVerified: user.isVerified,
          emailVerified: user.emailVerified,
        };
      }

      // Handle session update
      if (trigger === "update" && token.id) {
        // If update data is provided directly
        if (token.update) {
          const updateData = token.update as {
            user?: {
              name?: string;
              image?: string;
              role?: string;
              phone?: string | null;
              phoneVerified?: boolean;
              address?: string | null;
              deliveryAddress?: string | null;
              isVerified?: boolean;
              emailVerified?: Date | null;
            }
          };
          if (updateData.user) {
            // Apply updates from the provided data
            return {
              ...token,
              ...updateData.user,
            };
          }
        }

        // Fetch the latest user data from the database
        const latestUser = await db.user.findUnique({
          where: { id: token.id as string },
        });

        if (latestUser) {
          
          return {
            ...token,
            name: latestUser.name,
            image: latestUser.image,
            role: latestUser.role,
            phone: latestUser.phone,
            phoneVerified: latestUser.phoneVerified,
            address: latestUser.address,
            deliveryAddress: latestUser.deliveryAddress,
            isVerified: latestUser.isVerified,
            emailVerified: latestUser.emailVerified,
          };
        }
      }

      return token;
    },
    async session({ session, token }) {
      
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          image: token.image as string | null,
          role: token.role as string,
          phone: token.phone as string | null,
          phoneVerified: token.phoneVerified as boolean | undefined,
          address: token.address as string | null,
          deliveryAddress: token.deliveryAddress as string | null,
          isVerified: token.isVerified as boolean | undefined,
          emailVerified: token.emailVerified as Date | null,
        },
      };
    },
  },
}; 