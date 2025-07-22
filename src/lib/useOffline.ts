"use client";

import { useState, useEffect } from "react";

export function useOffline() {
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
  
  return isOffline;
}

// Enhanced fetch function that prevents API calls when offline
export async function safeFetch(url: string, options?: RequestInit): Promise<Response | null> {
  if (!navigator.onLine) {
    console.warn('API call prevented: Device is offline');
    return null;
  }
  
  try {
    return await fetch(url, options);
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}