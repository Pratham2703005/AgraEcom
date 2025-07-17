"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function VerificationPendingPageContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleResendVerification = async () => {
    if (!email) {
      setResendStatus({
        success: false,
        message: "Email address is missing. Please try again.",
      });
      return;
    }
    
    setResending(true);
    setResendStatus(null);
    
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResendStatus({
          success: true,
          message: "Verification email sent successfully. Please check your inbox.",
        });
      } else {
        setResendStatus({
          success: false,
          message: data.message || "Failed to resend verification email. Please try again.",
        });
      }
    } catch {
      setResendStatus({
        success: false,
        message: "An error occurred. Please try again.",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-neutral-800">
        <h1 className="text-2xl font-bold text-center text-neutral-900 dark:text-white">
          Verify Your Email
        </h1>
        
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-blue-600 dark:text-blue-300" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
          </div>
          
          <p className="text-center text-neutral-600 dark:text-neutral-300 mb-2">
            We&apos;ve sent a verification email to:
          </p>
          
          <p className="text-center font-semibold text-neutral-800 dark:text-neutral-200 mb-4">
            {email || "your email address"}
          </p>
          
          <p className="text-center text-neutral-600 dark:text-neutral-300 mb-6">
            Please check your inbox and click on the verification link to complete your registration.
            If you don&apos;t see the email, please check your spam folder.
          </p>
          
          {resendStatus && (
            <div className={`text-sm text-center p-3 rounded-lg mb-4 w-full ${
              resendStatus.success 
                ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 border border-green-200 dark:border-green-800" 
                : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800"
            }`}>
              {resendStatus.message}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button
              variant="outline"
              onClick={handleResendVerification}
              disabled={resending}
              className="flex-1"
            >
              {resending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
            
            <Link href="/login" className="flex-1">
              <Button className="w-full">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerificationPendingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerificationPendingPageContent />
    </Suspense>
  );
} 