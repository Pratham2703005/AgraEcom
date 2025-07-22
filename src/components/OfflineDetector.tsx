"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  
  useEffect(() => {
    // Check initial online status
    setIsOffline(!navigator.onLine);
    
    // Add event listeners for online/offline status changes
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      // Hide reconnected message after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Show reconnected notification
  if (showReconnected && !isOffline) {
    return (
      <div className="fixed top-20 right-4 z-50 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg animate-fadeIn">
        <div className="flex items-center space-x-2">
          <Wifi size={20} className="text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            Back online!
          </span>
        </div>
      </div>
    );
  }
  
  if (!isOffline) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-neutral-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <WifiOff size={40} className="text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
          You&apos;re offline
        </h1>
        
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Please check your internet connection and try again. We&apos;ll automatically reconnect when you&apos;re back online.
        </p>
        
        <div className="animate-pulse flex justify-center">
          <div className="h-2 w-2 bg-neutral-400 dark:bg-neutral-600 rounded-full mx-1"></div>
          <div className="h-2 w-2 bg-neutral-400 dark:bg-neutral-600 rounded-full mx-1 animation-delay-200"></div>
          <div className="h-2 w-2 bg-neutral-400 dark:bg-neutral-600 rounded-full mx-1 animation-delay-400"></div>
        </div>
      </div>
    </div>
  );
} 