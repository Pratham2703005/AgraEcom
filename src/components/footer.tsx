"use client";

import Link from "next/link";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert(`Thank you for subscribing with ${email}!`);
    setEmail("");
  };

  return (
    <footer className="bg-[var(--neutral-900)] text-white">
      {/* Newsletter section */}
      <div className="border-b border-[var(--neutral-700)] px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold">Join our newsletter</h3>
              <p className="mt-2 text-[var(--neutral-300)]">
                Stay updated with our latest products, offers, and beauty tips.
              </p>
            </div>
            <div>
              <form onSubmit={handleSubscribe} className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="input flex-grow bg-[var(--neutral-800)] text-white placeholder:text-[var(--neutral-400)] focus:ring-[var(--primary)]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  suppressHydrationWarning
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
            {/* Brand column */}
            <div>
              <h4 className="text-xl font-bold">AK Beauty</h4>
              <p className="mt-4 text-sm text-[var(--neutral-300)]">
                Discover the best in skincare and cosmetics. Our products are formulated with high-quality ingredients for all skin types.
              </p>
              <div className="mt-6 flex space-x-4">
                <a
                  href="#"
                  className="rounded-full bg-[var(--neutral-800)] p-2 text-[var(--neutral-300)] hover:bg-[var(--primary)] hover:text-white"
                  aria-label="Facebook"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="rounded-full bg-[var(--neutral-800)] p-2 text-[var(--neutral-300)] hover:bg-[var(--primary)] hover:text-white"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="rounded-full bg-[var(--neutral-800)] p-2 text-[var(--neutral-300)] hover:bg-[var(--primary)] hover:text-white"
                  aria-label="Twitter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="rounded-full bg-[var(--neutral-800)] p-2 text-[var(--neutral-300)] hover:bg-[var(--primary)] hover:text-white"
                  aria-label="YouTube"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Shop column */}
            <div>
              <h4 className="text-lg font-semibold">Shop</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/products" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=skincare" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    Skincare
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=makeup" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    Makeup
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=haircare" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    Haircare
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=fragrance" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    Fragrance
                  </Link>
                </li>
                <li>
                  <Link href="/products?category=tools" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    Tools & Accessories
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company column */}
            <div>
              <h4 className="text-lg font-semibold">Company</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/about" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/press" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help column */}
            <div>
              <h4 className="text-lg font-semibold">Help</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/customer-service" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    Customer Service
                  </Link>
                </li>
                <li>
                  <Link href="/track-order" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    Shipping Information
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-[var(--neutral-300)] hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="border-t border-[var(--neutral-700)] px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-[var(--neutral-400)]">
              &copy; {new Date().getFullYear()} AK Beauty. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-[var(--neutral-400)] hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-[var(--neutral-400)] hover:text-white">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="text-sm text-[var(--neutral-400)] hover:text-white">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 