"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session) router.push("/");
    
    // Check for error=email_not_verified in the URL
    const error = searchParams.get("error");
    if (error === "email_not_verified") {
      setIsEmailNotVerified(true);
      setLoginError("Your email is not verified. Please verify your email to continue.");
    }
  }, [session, status, router, searchParams]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setLoginError("");
    setIsEmailNotVerified(false);
    setUserEmail(data.email);
    
    const result = await signIn("credentials", { ...data, redirect: false });
    
    if (result?.error) {
      if (result.error === "email_not_verified") {
        setIsEmailNotVerified(true);
        setLoginError("Your email is not verified. Please verify your email to continue.");
      } else {
        setLoginError("Invalid email or password");
      }
    } else {
      router.push(callbackUrl);
    }
    
    setIsLoading(false);
  }

  const handleResendVerification = async () => {
    if (!userEmail) {
      setUserEmail(form.getValues().email);
    }
    
    if (!userEmail) {
      setLoginError("Please enter your email address first");
      return;
    }
    
    setResendingEmail(true);
    setResendSuccess(false);
    
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResendSuccess(true);
        setLoginError("");
      } else {
        setLoginError(data.message || "Failed to resend verification email");
      }
    } catch {
      setLoginError("An error occurred. Please try again.");
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white dark:bg-neutral-950 p-8 shadow-xl border border-neutral-200 dark:border-neutral-600">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Welcome Back
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300">
              Sign in to your account
            </p>
          </div>
          
          <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email" 
                      placeholder="Enter your email" 
                      autoComplete="email" 
                      disabled={isLoading}
                      className="h-12 w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="password" 
                      placeholder="Enter your password" 
                      autoComplete="current-password" 
                      disabled={isLoading}
                      className="h-12 w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900/60 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {loginError && (
              <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                {loginError}
                
                {isEmailNotVerified && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-xs mt-1 h-8"
                      onClick={handleResendVerification}
                      disabled={resendingEmail || resendSuccess}
                    >
                      {resendingEmail ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          Sending...
                        </div>
                      ) : resendSuccess ? (
                        "Verification email sent!"
                      ) : (
                        "Resend verification email"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {resendSuccess && !loginError && (
              <div className="text-sm text-green-600 text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                Verification email has been sent. Please check your inbox.
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-12 rounded-lg bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </Form>
          
          <div className="my-6 flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
            <span className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">or</span>
            <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
          </div>
          
          <Button
            variant="outline"
            type="button"
            className="w-full h-12 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200"
            disabled={isLoading}
            onClick={() => { setIsLoading(true); signIn("google", { callbackUrl }); }}
          >
            <div className="flex items-center justify-center gap-3">
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
                <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z" fill="#34A853"/>
                <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
              </svg>
              <span className="font-medium">Continue with Google</span>
            </div>
          </Button>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Don&apos;t have an account?{' '}
              <a href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-primary hover:text-primary-dark font-medium transition-colors duration-200 hover:underline">
                Create one
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}