"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { Toaster, toast } from 'react-hot-toast';
import { formatProductName } from "@/lib/utils";

// Define Brand type
type Brand = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
};

// Define Product type
type Product = {
  id: string;
  name: string;
  mrp: number;
  discount: number;
  price: number;
  images: string[];
  brand?: Brand | null;
  weight?: string | null;
  demand: number;
  piecesLeft?: number | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function ProductDetailPage({
  params,
}: {
  params:{ id: string };
}) {
  
  const { id } =params;
  const router = useRouter();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${id}`);
        
        if (response.status === 404) {
          notFound();
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle quantity change
  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    if (product?.piecesLeft) {
      setQuantity(prev => Math.min(product.piecesLeft || 99, prev + 1));
    } else {
      setQuantity(prev => prev + 1);
    }
  };

  // Check if product was updated within last 3 days
  const isNewProduct = (createdAt: Date) => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return new Date(createdAt) > threeDaysAgo;
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        toast.error(data.error || 'Failed to add item to cart');
        return;
      }
      
      toast.success('Item added to cart!');
      // Navigate to cart page
      router.back();
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    }
  };

  // Handle buy now
  const handleBuyNow = async () => {
    if (!product) return;
    
    try {
      // First add the product to cart
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || 'Failed to process your request');
        return;
      }
      
      // Then redirect to cart page
      router.push('/cart');
    } catch (error) {
      console.error('Error with buy now:', error);
      toast.error('Failed to process your request. Please try again.');
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    if (!product) return { price: 0, mrp: 0 };
    return {
      price: product.price * quantity,
      mrp: product.mrp * quantity
    };
  };

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

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-center py-20">
            <p className="text-red-500 dark:text-red-400">{error || "Product not found"}</p>
            <Link 
              href="/products" 
              className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totals = calculateTotal();

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          {/* Header with theme toggle */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/products"
              className="inline-flex items-center text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Products
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-md">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={formatProductName(product)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                    <svg className="h-16 w-16 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.discount > 0 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                      -{product.discount}% OFF
                    </span>
                  )}
                  {isNewProduct(product.createdAt) && (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                      NEW
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail gallery */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square cursor-pointer overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-blue-500 transition-colors"
                    >
                      <img
                        src={image}
                        alt={`${formatProductName(product)} - Image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-md border border-neutral-100 dark:border-neutral-700">
              <h1 className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white md:text-3xl">
                {formatProductName(product)}
              </h1>

              <div className="mb-4 flex items-center">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ₹{product.price.toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <span className="ml-3 text-lg text-neutral-400 dark:text-neutral-500 line-through">
                    ₹{product.mrp.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock status */}
              {product.piecesLeft !== undefined && product.piecesLeft !== null && (
                <div className="mb-6">
                  {product.piecesLeft > 0 ? (
                    <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm ${
                      product.piecesLeft <= 5 
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" 
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    }`}>
                      <span className={`mr-1.5 flex h-2 w-2 rounded-full ${
                        product.piecesLeft <= 5 
                          ? "bg-orange-500" 
                          : "bg-green-500"
                      }`}></span>
                      {product.piecesLeft <= 5
                        ? `Only ${product.piecesLeft} left in stock!`
                        : "In Stock"}
                    </div>
                  ) : (
                    <div className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-3 py-1 text-sm text-red-700 dark:text-red-400">
                      <span className="mr-1.5 flex h-2 w-2 rounded-full bg-red-500"></span>
                      Out of Stock
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">Description</h2>
                  <p className="text-neutral-700 dark:text-neutral-300">{product.description}</p>
                </div>
              )}

              {/* Quantity selector */}
              <div className="mb-6">
                <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">Quantity</h2>
                <div className="flex h-12 w-36 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 shadow-sm">
                  <button
                    onClick={decreaseQuantity}
                    className="flex h-full w-12 items-center justify-center rounded-l-lg border-r border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <div className="flex h-full flex-1 items-center justify-center text-neutral-700 dark:text-neutral-200">
                    {quantity}
                  </div>
                  <button
                    onClick={increaseQuantity}
                    className="flex h-full w-12 items-center justify-center rounded-r-lg border-l border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    aria-label="Increase quantity"
                    disabled={product.piecesLeft !== null && product.piecesLeft !== undefined && quantity >= product.piecesLeft}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Total Price Summary */}
              <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">Order Summary</h3>
                <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                  <span>Price ({quantity} {quantity > 1 ? 'items' : 'item'})</span>
                  <span>₹{totals.mrp.toFixed(2)}</span>
                </div>
                {product.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400 mb-1">
                    <span>Discount ({product.discount}%)</span>
                    <span>-₹{(totals.mrp - totals.price).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-neutral-200 dark:border-neutral-700 my-2 pt-2 flex justify-between font-medium">
                  <span className="text-neutral-800 dark:text-neutral-200">Total</span>
                  <span className="text-blue-600 dark:text-blue-400">₹{totals.price.toFixed(2)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!product.piecesLeft || product.piecesLeft <= 0}
                >
                  <span className="flex items-center justify-center">
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 rounded-lg border border-blue-600 bg-white dark:bg-transparent px-6 py-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!product.piecesLeft || product.piecesLeft <= 0}
                >
                  <span className="flex items-center justify-center">
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Buy Now
                  </span>
                </button>
              </div>

              {/* Additional info */}
              <div className="mt-8 border-t border-neutral-200 dark:border-neutral-700 pt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">SKU</h3>
                    <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{product.id.slice(-8).toUpperCase()}</p>
                  </div>
                  {product.brand && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Brand</h3>
                      <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{product.brand?.name || "Unknown"}</p>
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Weight</h3>
                      <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{product.weight}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 