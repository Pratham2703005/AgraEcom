import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    phone?: string | null;
    phoneVerified?: boolean;
    address?: string | null;
    deliveryAddress?: string | null;
    isVerified?: boolean;
    emailVerified?: Date | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      phone?: string | null;
      phoneVerified?: boolean;
      address?: string | null;
      deliveryAddress?: string | null;
      isVerified?: boolean;
      emailVerified?: Date | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    phone?: string | null;
    phoneVerified?: boolean;
    address?: string | null;
    deliveryAddress?: string | null;
    isVerified?: boolean;
    emailVerified?: Date | null;
  }
} 