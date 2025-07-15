"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import SearchInput from "./SearchInput";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [client, setClient] = useState(false);

  // Remove the automatic session refresh to prevent glitching

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

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
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
      if (status !== "authenticated") {
        setCartItemCount(0);
        return;
      }

      try {
        const response = await fetch("/api/cart");
        if (!response.ok) return;
        
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
    
  }, [status]);

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
          <span className="text-2xl font-bold text-[var(--primary-dark)] dark:text-[var(--primary-light)]">
            Agra Ecom 
          </span>
        </Link>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors hover:text-[var(--primary)] ${
                pathname === '/' ? 'text-[var(--primary)]' : 'text-[var(--neutral-700)] dark:text-[var(--neutral-300)]'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className={`text-sm font-medium transition-colors hover:text-[var(--primary)] ${
                pathname === '/products' || pathname.startsWith('/products/') ? 'text-[var(--primary)]' : 'text-[var(--neutral-700)] dark:text-[var(--neutral-300)]'
              }`}
            >
              Shop
            </Link>
            <Link 
              href="/about" 
              className={`text-sm font-medium transition-colors hover:text-[var(--primary)] ${
                pathname === '/about' ? 'text-[var(--primary)]' : 'text-[var(--neutral-700)] dark:text-[var(--neutral-300)]'
              }`}
            >
              About
            </Link>
          </div>
        </nav>

        {/* Desktop Right Icons */}
        <div className="hidden items-center space-x-4 md:flex">
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
            <div className="relative" ref={profileMenuRef}>
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
              className="rounded-full px-4 py-2 text-sm font-medium text-[var(--neutral-700)] dark:text-[var(--neutral-300)] hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)]"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden">
          <button
            className="rounded-full p-2 text-[var(--neutral-700)] dark:text-[var(--neutral-300)] hover:bg-[var(--neutral-100)] dark:hover:bg-[var(--neutral-800)]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="border-t border-[var(--neutral-200)] dark:border-[var(--neutral-800)] md:hidden">
          <div className="p-4">
            <div className="mb-4">
              <SearchInput 
                placeholder="Search products..."
                className="w-full"
              />
            </div>
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className={`text-sm font-medium ${
                  pathname === '/' ? 'text-[var(--primary)]' : 'text-[var(--neutral-700)] dark:text-[var(--neutral-300)]'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/products"
                className={`text-sm font-medium ${
                  pathname === '/products' || pathname.startsWith('/products/') ? 'text-[var(--primary)]' : 'text-[var(--neutral-700)] dark:text-[var(--neutral-300)]'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                href="/about"
                className={`text-sm font-medium ${
                  pathname === '/about' ? 'text-[var(--primary)]' : 'text-[var(--neutral-700)] dark:text-[var(--neutral-300)]'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              
              {status === "authenticated" && (
                <>
                  <div className="border-t border-neutral-100 dark:border-neutral-700 pt-2">
                    <div className="flex items-center space-x-2 py-2">
                      {session.user?.image ? (
                        <div className="h-8 w-8 rounded-full overflow-hidden relative">
                          <Image 
                            src={session.user.image} 
                            alt={session.user.name || "User"} 
                            fill
                            sizes="32px"
                            className="object-cover"
                            priority
                          />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--neutral-200)] dark:bg-[var(--neutral-700)] text-[var(--neutral-700)] dark:text-[var(--neutral-300)]">
                          <span className="text-xs font-semibold">
                            {session.user?.name?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-sm">{session.user?.name || "User"}</span>
                    </div>
                    <Link
                      href="/profile"
                      className="block py-2 text-sm font-medium text-[var(--neutral-700)] dark:text-[var(--neutral-300)]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block py-2 text-sm font-medium text-[var(--neutral-700)] dark:text-[var(--neutral-300)]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    {session.user?.role === "ADMIN" && (
                      
                        <Link
                          href="/admin"
                          className="block py-2 text-sm font-medium text-[var(--neutral-700)] dark:text-[var(--neutral-300)]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
            
                      
                    )}
                  </div>
                </>
              )}
              
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-700">
                <button
                  onClick={handleCartClick}
                  className="flex items-center space-x-2 text-sm font-medium text-[var(--neutral-700)] dark:text-[var(--neutral-300)]"
                >
                  <span>Cart</span>
                  {cartItemCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {cartItemCount}
                    </span>
                  )}
                </button>
                <ThemeToggle />
              </div>
              {status === "authenticated" ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm font-medium text-[var(--neutral-700)] dark:text-[var(--neutral-300)]"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium text-[var(--neutral-700)] dark:text-[var(--neutral-300)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
} 