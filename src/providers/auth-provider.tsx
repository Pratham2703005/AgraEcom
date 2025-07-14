"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider 
      // Do not use refetchInterval to prevent cookie accumulation
      refetchOnWindowFocus={false} // Don't refresh when window is focused
      refetchWhenOffline={false} // Don't try to refresh when offline
    >
      {children}
    </SessionProvider>
  );
} 