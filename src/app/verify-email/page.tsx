"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [verificationState, setVerificationState] = useState<{
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    message: string;
  }>({
    isLoading: true,
    isSuccess: false,
    isError: false,
    message: "Verifying your email...",
  });

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          message: "Verification token is missing",
        });
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          method: "GET",
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setVerificationState({
            isLoading: false,
            isSuccess: true,
            isError: false,
            message: "Your email has been verified successfully!",
          });
        } else {
          setVerificationState({
            isLoading: false,
            isSuccess: false,
            isError: true,
            message: data.message || "Failed to verify email. Please try again.",
          });
        }
      } catch {
        setVerificationState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          message: "An error occurred. Please try again later.",
        });
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-neutral-800">
        <h1 className="text-2xl font-bold text-center text-neutral-900 dark:text-white">
          Email Verification
        </h1>

        {verificationState.isLoading && (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
            <p className="text-center text-neutral-600 dark:text-neutral-300">
              {verificationState.message}
            </p>
          </div>
        )}

        {verificationState.isSuccess && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <svg
                className="w-16 h-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <p className="text-center text-neutral-600 dark:text-neutral-300">
              {verificationState.message}
            </p>
            <div className="flex justify-center pt-4">
              <Link href="/login">
                <Button>
                  Login to your account
                </Button>
              </Link>
            </div>
          </div>
        )}

        {verificationState.isError && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <svg
                className="w-16 h-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <p className="text-center text-neutral-600 dark:text-neutral-300">
              {verificationState.message}
            </p>
            <div className="flex justify-center pt-4 space-x-4">
              <Link href="/login">
                <Button>
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
} 