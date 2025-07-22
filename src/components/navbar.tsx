"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import SearchInput from "./SearchInput";
import { useOffline, safeFetch } from "@/lib/useOffline";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const desktopProfileMenuRef = useRef<HTMLDivElement>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [client, setClient] = useState(false);
  const isOffline = useOffline();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (desktopProfileMenuRef.current && !desktopProfileMenuRef.current.contains(event.target as Node) &&
          mobileProfileMenuRef.current && !mobileProfileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch cart data
  useEffect(() => {
    const fetchCartCount = async () => {
      if (status !== "authenticated" || isOffline) {
        setCartItemCount(0);
        return;
      }

      try {
        const response = await safeFetch("/api/cart");
        if (!response || !response.ok) return;
        
        const data = await response.json();
        
        if (data.cart && data.cart.items) {
          const itemCount = data.cart.items.reduce(
            (total: number, item: { quantity: number }) => total + item.quantity, 
            0
          );
          setCartItemCount(itemCount);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    setClient(true);
    fetchCartCount();
    
  }, [status, isOffline]);

  const handleCartClick = () => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/cart")}`);
    } else {
      router.push("/cart");
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md dark:bg-[var(--neutral-900)]' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl sm:text-2xl font-bold text-[var(--primary-dark)] dark:text-[var(--primary-light)]">
            Agra Ecom 
          </span>
        </Link>

        {/* Desktop Right Icons */}
        <div className="hidden items-center space-x-3 sm:space-x-4 md:flex">
          {/* Search Input with expansion */}
          <div className="relative">
            {!isSearchExpanded ? (
              client && (
                <button
                  onClick={() => setIsSearchExpanded(true)}
                  className="rounded-full p-2 text-[var(--neutral-700)] dark:text-[var(--neutral-300)] hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)] transition-all duration-200"
                  aria-label="Search"
                >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>)
            ) : (
              <div className="w-64 animate-fadeIn" ref={searchInputRef}>
                <SearchInput 
                  autoFocus={true}
                  className="py-2" 
                  onSearch={(query) => {
                    router.push(`/products?search=${encodeURIComponent(query)}`);
                    setIsSearchExpanded(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Cart */}
          {client && (
            <button
              onClick={handleCartClick}
              className="relative rounded-full p-2 text-[var(--neutral-700)] dark:text-[var(--neutral-300)] hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {cartItemCount}
              </span>
            )}
          </button> )}

          {/* User Menu */}
          {status === "authenticated" ? (
            <div className="relative" ref={desktopProfileMenuRef}>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)] text-[var(--neutral-700)] dark:text-[var(--neutral-300)] hover:bg-[var(--neutral-300)] dark:hover:bg-[var(--neutral-600)]"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <span className="sr-only">User menu</span>
                {session.user?.image ? (
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    fill
                    sizes="32px"
                    className="object-cover rounded-full"
                    priority
                  />
                ) : (
                  <span className="text-xs font-semibold">
                    {session.user?.name?.charAt(0) || "U"}
                  </span>
                )}
              </button>
              
              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-neutral-800 py-2 shadow-lg ring-1 ring-black ring-opacity-5 animate-fadeIn z-50">
                  <div className="border-b border-neutral-100 dark:border-neutral-700 px-4 py-2">
                    <p className="text-sm font-medium dark:text-white">{session.user?.name || "User"}</p>
                    <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{session.user?.email}</p>
                  </div>
                  <Link
                    href="/products"
                    className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Shop
                  </Link>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  {session.user?.role === "ADMIN" && (
                    <div className="border-t border-neutral-100 dark:border-neutral-700 pt-1">
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    </div>
                  )}
                  <div className="border-t border-neutral-100 dark:border-neutral-700">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full px-3 py-2 text-sm font-medium text-[var(--neutral-700)] dark:text-[var(--neutral-300)] hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)]"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-full p-2 text-[var(--neutral-700)] dark:text-[var(--neutral-300)] hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)]"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Modal */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          
          {/* Menu Content */}
          <div 
            ref={mobileMenuRef}
            className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-neutral-900 shadow-xl transform transition-transform duration-300 ease-in-out"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
              <span className="text-lg font-semibold text-[var(--primary-dark)] dark:text-[var(--primary-light)]">
                Menu
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full p-2 text-[var(--neutral-700)] dark:text-[var(--neutral-300)] hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col p-4 space-y-4">
              {/* Search */}
              <div className="w-full">
                <SearchInput 
                  className="w-full py-2" 
                  onSearch={(query) => {
                    router.push(`/products?search=${encodeURIComponent(query)}`);
                    setIsMobileMenuOpen(false);
                  }}
                />
              </div>

              {/* User Profile Section */}
              {status === "authenticated" && session.user && (
                <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)]">
                      {session.user.image ? (
                        <Image 
                          src={session.user.image} 
                          alt={session.user.name || "User"} 
                          width={40}
                          height={40}
                          className="object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
                          {session.user.name?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium dark:text-white">{session.user.name || "User"}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{session.user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="space-y-2">
                <Link
                  href="/products"
                  className="flex items-center px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Shop
                </Link>
                
                {status === "authenticated" && (
                  <>
                    <Link
                      href="/profile"
                      className="flex items-center px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="flex items-center px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <button
                      onClick={handleCartClick}
                      className="flex items-center justify-between w-full px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                    >
                      <span>Cart</span>
                      {cartItemCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                          {cartItemCount}
                        </span>
                      )}
                    </button>
                    {session.user?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="flex items-center px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-neutral-700 dark:text-neutral-200">Theme</span>
                <ThemeToggle />
              </div>

              {/* Auth Actions */}
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                {status === "authenticated" ? (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-left"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="block w-full px-3 py-2 text-sm text-[var(--primary-dark)] dark:text-[var(--primary-light)] hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)] rounded-lg text-center font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}