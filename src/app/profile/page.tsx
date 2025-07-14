"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSessionUpdate } from '@/lib/hooks';

// Form validation schema - simplified to avoid type issues
const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().length(10, { message: "Phone number must be exactly 10 digits" })
    .regex(/^\d+$/, { message: "Phone number can only contain digits" })
    .optional(),
  address: z.string().optional(),
  deliveryAddress: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { updateUserSession } = useSessionUpdate();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  // Initialize form with session data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      deliveryAddress: '',
    },
  });

  // Update form values when session data changes
  useEffect(() => {
    if (session?.user && status === 'authenticated') {
      // Format the phone number by removing the +91 prefix if it exists
      const formattedPhone = session.user.phone 
        ? session.user.phone.replace(/^\+91/, '') 
        : '';
      
      form.reset({
        name: session.user.name || '',
        phone: formattedPhone,
        address: session.user.address || '',
        deliveryAddress: session.user.deliveryAddress || '',
      });
      
      setFormInitialized(true);
    }
  }, [session, status, form]);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setLoading(true);
      
      // Process the data before sending to API
      const processedData = {
        name: data.name,
        phone: data.phone ? `+91${data.phone}` : null,
        address: data.address ? ensureAgra(data.address) : null,
        deliveryAddress: data.deliveryAddress ? ensureAgra(data.deliveryAddress) : null,
      };
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      // Check if response is successful
      await response.json();

      // Update session with new data
      await updateUserSession({
        name: data.name,
        phone: processedData.phone,
        address: processedData.address,
        deliveryAddress: processedData.deliveryAddress,
      });
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to ensure address ends with Agra
  const ensureAgra = (address: string): string => {
    if (!address.toLowerCase().includes("agra")) {
      return address + ", Agra";
    }
    return address;
  };

  // Function to handle resending verification email
  const handleResendVerification = async () => {
    if (!session?.user?.email) return;
    
    try {
      setResendingVerification(true);
      
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Verification email sent successfully!');
      } else {
        toast.error(data.message || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email');
    } finally {
      setResendingVerification(false);
    }
  };

  // Show loading state while session is loading
  if (status === 'loading' || !formInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <div className="container max-w-6xl mx-auto py-8 px-4">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              </div>
              <p className="text-lg font-medium text-neutral-700 dark:text-neutral-300">Loading your profile...</p>
              <p className="text-sm text-neutral-500 mt-2">Please wait while we fetch your information</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    return null; // Will be redirected by the useEffect
  }

  // Check if email is verified - check both isVerified and emailVerified fields
  const isEmailVerified = session?.user ? 
    (session.user.isVerified === true || (session.user.emailVerified !== null && session.user.emailVerified !== undefined)) 
    : false;

  console.log(session?.user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Profile
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Profile Form Section */}
        <div className="max-w-3xl mx-auto">
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                            className="h-12 border-neutral-200 dark:border-neutral-700 focus:border-blue-500 focus:ring-blue-500 bg-white/50 dark:bg-neutral-800/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <div className="pl-10 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300">
                        {session?.user?.email}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-neutral-500">Email cannot be changed</p>
                      
                      {!isEmailVerified && (
                        <div className="flex items-center">
                          <span className="text-xs text-amber-600 dark:text-amber-500 mr-2 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Not verified
                          </span>
                          <Button 
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleResendVerification}
                            disabled={resendingVerification}
                            className="h-7 text-xs"
                          >
                            {resendingVerification ? (
                              <>
                                <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-1"></div>
                                Sending...
                              </>
                            ) : (
                              'Verify Email'
                            )}
                          </Button>
                        </div>
                      )}
                      
                      {isEmailVerified && (
                        <span className="text-xs text-green-600 dark:text-green-500 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Phone Number
                        </FormLabel>
                        <div className="flex-grow relative">
                          <div className="flex rounded-md">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium">
                              +91
                            </span>
                            <Input 
                              placeholder="10 digits only" 
                              {...field} 
                              value={field.value || ''} 
                              onChange={(e) => {
                                // Only allow digits and limit to 10
                                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                field.onChange(value);
                              }}
                              className="h-12 rounded-l-none border-neutral-200 dark:border-neutral-700 focus:border-blue-500 focus:ring-blue-500 bg-white/50 dark:bg-neutral-800/50"
                            />
                          </div>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <Input 
                              placeholder="Your address" 
                              {...field} 
                              value={field.value || ''} 
                              className="w-full h-12 !pl-10 pr-4 border-neutral-200 dark:border-neutral-700 focus:border-blue-500 focus:ring-blue-500 bg-white/50 dark:bg-neutral-800/50"
                            />
                          </div>
                        </FormControl>
                  
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          Delivery Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                            <Input 
                              placeholder="Your delivery address" 
                              {...field} 
                              value={field.value || ''} 
                              className="w-full h-12 !pl-10 !pr-14 border-neutral-200 dark:border-neutral-700 focus:border-blue-500 focus:ring-blue-500 bg-white/50 dark:bg-neutral-800/50"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-neutral-500 text-xs font-medium">Agra</span>
                            </div>
                          </div>
                        </FormControl>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>City will be set to Agra automatically</span>
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!isEmailVerified && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Email verification required</h3>
                        <div className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                          <p>Please verify your email address to place orders. Check your inbox for the verification link or click the button to resend it.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto min-w-[160px] h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}