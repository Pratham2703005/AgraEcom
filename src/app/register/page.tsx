"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session) router.push("/");
  }, [session, status, router]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    setRegisterError("");
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        setRegisterError(result.message || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Redirect to verification pending page instead of auto-login
      router.push(`/verification-pending?email=${encodeURIComponent(data.email)}`);
    } catch {
      setRegisterError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white dark:bg-neutral-950 p-8 shadow-xl border border-neutral-200 dark:border-neutral-600">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Create Account
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Register to get started
            </p>
          </div>
          <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Full Name"
                      autoComplete="name"
                      disabled={isLoading}
                      className="h-12 w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900/60 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      className="h-12 w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900/60 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
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
                      autoComplete="new-password"
                      disabled={isLoading}
                      className="h-12 w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900/60 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Confirm Password"
                      autoComplete="new-password"
                      disabled={isLoading}
                      className="h-12 w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900/60 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {registerError && (
              <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                {registerError}
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
                  Creating...
                </div>
              ) : (
                "Create Account"
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
            className="w-full h-12 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900/60 text-neutral-700 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200"
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
              Already have an account?{' '}
              <a href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-primary hover:text-primary-dark font-medium transition-colors duration-200 hover:underline">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
} 