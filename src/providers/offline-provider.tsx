"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface OfflineContextType {
  isOffline: boolean;
  safeFetch: (url: string, options?: RequestInit) => Promise<Response | null>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOffline(!navigator.onLine);

    // Add event listeners for online/offline status changes
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const safeFetch = async (url: string, options?: RequestInit): Promise<Response | null> => {
    if (isOffline) {
      console.warn('API call prevented: Device is offline');
      return null;
    }

    try {
      return await fetch(url, options);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  return (
    <OfflineContext.Provider value={{ isOffline, safeFetch }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOfflineContext() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOfflineContext must be used within an OfflineProvider');
  }
  return context;
}