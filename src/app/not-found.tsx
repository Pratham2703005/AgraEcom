import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <div className="text-8xl md:text-9xl font-bold text-neutral-200 dark:text-neutral-700 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-bounce">
              <Search size={32} className="text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[var(--primary-dark)] hover:bg-[var(--primary-dark)]/90 dark:bg-[var(--primary-light)] dark:hover:bg-[var(--primary-light)]/90 text-white dark:text-neutral-900 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            <Home size={20} />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            You might be looking for:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/products"
              className="text-[var(--primary-dark)] dark:text-[var(--primary-light)] hover:underline"
            >
              Products
            </Link>
            <Link
              href="/cart"
              className="text-[var(--primary-dark)] dark:text-[var(--primary-light)] hover:underline"
            >
              Shopping Cart
            </Link>
            <Link
              href="/profile"
              className="text-[var(--primary-dark)] dark:text-[var(--primary-light)] hover:underline"
            >
              Profile
            </Link>
            <Link
              href="/help"
              className="text-[var(--primary-dark)] dark:text-[var(--primary-light)] hover:underline"
            >
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}