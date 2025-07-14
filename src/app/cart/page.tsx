"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatProductName } from "@/lib/utils";
import { toast } from "react-hot-toast";

type Brand = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
};

type CartItem = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    mrp: number;
    discount: number;
    brand?: Brand | null;
    weight: string | null;
    images: string[];
    piecesLeft: number | null;
  };
};

type Cart = {
  id: string;
  items: CartItem[];
};

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/login?callbackUrl=/cart");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/cart");
        
        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }
        
        const data = await response.json();
        setCart(data.cart);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setError("Failed to load cart. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [status, router]);

  // Helper function to format cart item product name
  const formatCartItemName = (item: CartItem) => {
    return formatProductName(item.product);
  };

  // Update item quantity
  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(prev => ({ ...prev, [cartItemId]: true }));
      
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItemId,
          quantity: newQuantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update cart");
      }

      // Update local cart state
      if (cart) {
        if (data.action === "removed") {
          setCart({
            ...cart,
            items: cart.items.filter(item => item.id !== cartItemId),
          });
        } else {
          setCart({
            ...cart,
            items: cart.items.map(item =>
              item.id === cartItemId ? { ...item, quantity: newQuantity } : item
            ),
          });
        }
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      alert("Failed to update cart. Please try again.");
    } finally {
      setUpdating(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  // Remove item from cart
  const removeItem = async (cartItemId: string) => {
    try {
      setUpdating(prev => ({ ...prev, [cartItemId]: true }));
      
      const response = await fetch(`/api/cart?id=${cartItemId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove item");
      }

      // Update local cart state
      if (cart) {
        setCart({
          ...cart,
          items: cart.items.filter(item => item.id !== cartItemId),
        });
      }
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item. Please try again.");
    } finally {
      setUpdating(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  // Calculate cart totals
  const calculateTotals = () => {
    if (!cart || cart.items.length === 0) {
      return { subtotal: 0, discount: 0, total: 0 };
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.mrp * item.quantity,
      0
    );

    const total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    return {
      subtotal,
      discount: subtotal - total,
      total,
    };
  };

  // Handle checkout
  const handleCheckout = () => {
    // Check if email is verified
    const isEmailVerified = session?.user ? 'emailVerified' in session.user && session.user.emailVerified !== null : false;
    
    if (!isEmailVerified) {
      toast.error("Please verify your email before placing an order");
      router.push('/profile');
      return;
    }
    
    setIsCheckingOut(true);
    // Proceed with checkout
    // For now, just redirect to a thank you page or show a message
    toast.success("Checkout functionality coming soon!");
    setIsCheckingOut(false);
  };

  // Loading state while session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push(`/login?callbackUrl=${encodeURIComponent("/cart")}`);
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-neutral-600 dark:text-neutral-400">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state while fetching cart data
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-center py-20">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <Link 
              href="/products" 
              className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-8">Shopping Cart</h1>
          <div className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-md border border-neutral-100 dark:border-neutral-700 text-center">
            <svg className="mx-auto h-16 w-16 text-neutral-400 dark:text-neutral-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-200 mb-2">Your cart is empty</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">Looks like you haven&apos;t added any products to your cart yet.</p>
            <Link 
              href="/products" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();
  
  // Check if email is verified
  const isEmailVerified = session?.user ? 'emailVerified' in session.user && session.user.emailVerified !== null : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-neutral-100 dark:border-neutral-700 overflow-hidden">
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {cart.items.map((item) => (
                  <li key={item.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row">
                      {/* Product Image */}
                      <div className="flex-shrink-0 mb-4 sm:mb-0">
                        <div className="relative h-24 w-24 rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                          {item.product.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={formatCartItemName(item)}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                              <svg className="h-8 w-8 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 sm:ml-6">
                        <div className="flex justify-between mb-2">
                          <Link 
                            href={`/products/${item.product.id}`}
                            className="text-lg font-medium text-neutral-800 dark:text-neutral-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {formatCartItemName(item)}
                          </Link>
                          
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={updating[item.id]}
                            className="text-neutral-400 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 transition-colors"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap items-end justify-between mt-2">
                          <div>
                            <div className="flex items-center mb-2">
                              <span className="text-lg font-medium text-blue-600 dark:text-blue-400">
                              ₹{item.product.price.toFixed(2)}
                              </span>
                              {item.product.discount > 0 && (
                                <span className="ml-2 text-sm text-neutral-400 dark:text-neutral-500 line-through">
                                ₹{item.product.mrp.toFixed(2)}
                                </span>
                              )}
                            </div>
                            
                            {/* Quantity Selector */}
                            <div className="flex h-9 w-28 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 shadow-sm">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1 || updating[item.id]}
                                className="flex h-full w-9 items-center justify-center rounded-l-lg border-r border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-50"
                              >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <div className="flex h-full flex-1 items-center justify-center text-sm text-neutral-700 dark:text-neutral-200">
                                {updating[item.id] ? (
                                  <div className="h-3 w-3 rounded-full border-2 border-t-transparent border-blue-500 animate-spin"></div>
                                ) : (
                                  item.quantity
                                )}
                              </div>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={(item.product.piecesLeft !== null && item.quantity >= item.product.piecesLeft) || updating[item.id]}
                                className="flex h-full w-9 items-center justify-center rounded-r-lg border-l border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 disabled:opacity-50"
                              >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Item Total */}
                          <div className="mt-2 sm:mt-0 text-right">
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              Subtotal
                            </div>
                            <div className="text-lg font-medium text-neutral-800 dark:text-neutral-100">
                              ₹{(item.product.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-md border border-neutral-100 dark:border-neutral-700 sticky top-8">
              <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Subtotal ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                  <span>₹{totals.subtotal.toFixed(2)}</span>
                </div>
                
                {totals.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-₹{totals.discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex justify-between font-medium text-lg">
                    <span className="text-neutral-800 dark:text-neutral-100">Total</span>
                      <span className="text-blue-600 dark:text-blue-400">₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {!isEmailVerified && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="text-sm text-amber-700 dark:text-amber-400">
                      <p className="font-medium">Email verification required</p>
                      <p className="mt-1">Please verify your email before placing an order.</p>
                      <Link 
                        href="/profile" 
                        className="mt-2 inline-block text-amber-800 dark:text-amber-300 font-medium hover:underline"
                      >
                        Go to Profile →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || !isEmailVerified}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                {isCheckingOut ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Proceed to Checkout"
                )}
              </button>
              
              <div className="mt-4 text-center">
                <Link 
                  href="/products" 
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}