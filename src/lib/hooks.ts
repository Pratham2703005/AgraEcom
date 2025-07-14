import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

/**
 * A hook that returns a debounced value after a specified delay
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if the value changes before the delay has passed
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook for updating user profile data in the session
 */
export const useSessionUpdate = () => {
  const { data: session, update } = useSession();

  /**
   * Update the user profile data in the session
   * @param userData Partial user data to update
   */
  const updateUserSession = useCallback(async (userData: Partial<{
    name?: string;
    email?: string;
    image?: string;
    phone?: string | null;
    phoneVerified?: boolean;
    address?: string | null;
    deliveryAddress?: string | null;
  }>) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Updating session with user data keys:', Object.keys(userData));
      }
      
      // Create a complete user object by merging with existing session data
      const updatedUser = {
        ...session?.user,
        ...userData,
      };
      
      // Update the session with the complete user object
      await update({
        ...session,
        user: updatedUser
      });
      
      return true;
    } catch (error) {
      console.error('Failed to update session:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }, [session, update]);

  return { updateUserSession };
}; 