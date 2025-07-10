"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import SearchInput from "@/components/SearchInput";
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

// ProductSkeleton component for loading state
const ProductSkeleton = () => (
  <div className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-sm border border-neutral-100 dark:border-neutral-700 animate-pulse h-full flex flex-col">
    {/* Image Container */}
    <div className="relative aspect-square overflow-hidden bg-neutral-200 dark:bg-neutral-700"></div>
    {/* Product Info */}
    <div className="p-3 flex flex-col flex-grow">
      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-2 min-h-[40px] flex-grow"></div>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-16"></div>
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-12"></div>
        </div>
      </div>
    </div>
  </div>
);

interface ProductsPageClientProps {
  search: string;
  brand: string;
}

export default function ProductsPageClient({ search, brand }: ProductsPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sort = searchParams.get("sort") || "latest";
  const [isClient, setIsClient] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, { threshold: 0.5 });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      if (page === 1) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set("search", search);
        if (sort) queryParams.set("sort", sort);
        if (brand) queryParams.set("brand", brand);
        queryParams.set("page", page.toString());
        const response = await fetch(`/api/products?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        if (page === 1) {
          setProducts(data.products);
        } else {
          setProducts(prev => [...prev, ...data.products]);
        }
        setHasMore(page < data.pagination.totalPages);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setInitialLoading(false);
        setLoading(false);
      }
    };
    fetchProducts();
    setIsClient(true);
  }, [search, sort, brand, page]);

  // Reset page when search, sort, or brand changes
  useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(true);
  }, [search, sort, brand]);

  // Check if product was updated within last 3 days
  const isNewProduct = (updatedAt: Date) => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return new Date(updatedAt) > threeDaysAgo;
  };

  // Handle search submission
  const handleSearch = (query: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    router.push(`/products?${params.toString()}`);
  };

  // Update the brand display in the product card
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header Section with Theme Toggle */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
              {brand ? `${brand} Products` : 'Products'}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              {brand 
                ? `Browse our collection of ${brand} products`
                : 'Discover our amazing collection of products'
              }
            </p>
            {brand && (
              <button 
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("brand");
                  router.push(`/products?${params.toString()}`);
                }}
                className="mt-2 inline-flex items-center text-sm text-blue-500 hover:text-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                View all brands
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          {isClient && 
            <div className="relative max-w-md">
              <SearchInput 
                initialValue={search}
                onSearch={handleSearch}
                placeholder="Search by name or brand"
                className="w-full"
              />
            </div>
          }

          {/* Active Filters */}
          {(search || brand) && (
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Active filters:</span>
              
              {search && (
                <div className="flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full px-3 py-1 text-sm">
                  <span>Search: {search}</span>
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete("search");
                      router.push(`/products?${params.toString()}`);
                    }}
                    className="ml-2 hover:text-blue-600"
                    aria-label="Remove search filter"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {brand && (
                <div className="flex items-center bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full px-3 py-1 text-sm">
                  <span>Brand: {brand}</span>
                  <button 
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.delete("brand");
                      router.push(`/products?${params.toString()}`);
                    }}
                    className="ml-2 hover:text-purple-600"
                    aria-label="Remove brand filter"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              <button 
                onClick={() => {
                  router.push('/products');
                }}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <Link 
              href={`/products?sort=latest${search ? `&search=${search}` : ''}${brand ? `&brand=${brand}` : ''}`} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                sort === "latest" 
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" 
                  : "bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 hover:shadow-md border border-neutral-200 dark:border-neutral-700"
              }`}
            >
              ✨ Latest
            </Link>
            <Link 
              href={`/products?sort=discount${search ? `&search=${search}` : ''}${brand ? `&brand=${brand}` : ''}`} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                sort === "discount" 
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/25" 
                  : "bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 hover:shadow-md border border-neutral-200 dark:border-neutral-700"
              }`}
            >
              🔥 Best Deals
            </Link>
            <Link 
              href={`/products?sort=demand${search ? `&search=${search}` : ''}${brand ? `&brand=${brand}` : ''}`} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                sort === "demand" 
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/25" 
                  : "bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 hover:shadow-md border border-neutral-200 dark:border-neutral-700"
              }`}
            >
              📈 Trending
            </Link>
          </div>
        </div>

        {/* Initial Loading, Error, or Product Grid */}
        {initialLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-fr">
            {Array.from({ length: 10 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : error && products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-fr">
                {products.map((product, index) => {
                  // Add ref to last product element
                  if (products.length === index + 1) {
                    return (
                      <Link
                        ref={lastProductElementRef}
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="group block h-full"
                      >
                        <div className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-neutral-100 dark:border-neutral-700 h-full flex flex-col">
                          {/* Image Container */}
                          <div className="relative aspect-square overflow-hidden bg-neutral-50 dark:bg-neutral-900">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={formatProductName(product)}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                                <svg className="w-12 h-12 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {product.discount > 0 && (
                                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                                  -{product.discount}%
                                </span>
                              )}
                              {isNewProduct(product.updatedAt) && (
                                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                                  NEW
                                </span>
                              )}
                            </div>

                            {/* Stock Warning */}
                            {product.piecesLeft !== undefined && product.piecesLeft !== null && product.piecesLeft <= 5 && product.piecesLeft > 0 && (
                              <div className="absolute top-2 right-2">
                                <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                                  {product.piecesLeft} left
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Product Info */}
                          <div className="p-3 flex flex-col flex-grow">
                            {product.brand && (
                              <div className="mb-1">
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.set("brand", product.brand?.name || "");
                                    router.push(`/products?${params.toString()}`);
                                  }}
                                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {product.brand.name}
                                </button>
                              </div>
                            )}
                            <h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm leading-[1.4] mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2 flex-grow min-h-[40px]">
                              {formatProductName(product)}
                            </h3>
                            
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-neutral-900 dark:text-white">
                                ₹{product.price.toFixed(2)}
                                </span>
                                {product.discount > 0 ? (
                                  <span className="text-sm text-neutral-400 line-through">
                                    ₹{product.mrp.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-sm text-transparent">
                                    ₹{product.mrp.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  } else {
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="group block h-full"
                      >
                        <div className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border border-neutral-100 dark:border-neutral-700 h-full flex flex-col">
                          {/* Image Container */}
                          <div className="relative aspect-square overflow-hidden bg-neutral-50 dark:bg-neutral-900">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={formatProductName(product)}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                                <svg className="w-12 h-12 text-neutral-400 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {product.discount > 0 && (
                                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                                  -{product.discount}%
                                </span>
                              )}
                              {isNewProduct(product.updatedAt) && (
                                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                                  NEW
                                </span>
                              )}
                            </div>

                            {/* Stock Warning */}
                            {product.piecesLeft !== undefined && product.piecesLeft !== null && product.piecesLeft <= 5 && product.piecesLeft > 0 && (
                              <div className="absolute top-2 right-2">
                                <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                                  {product.piecesLeft} left
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Product Info */}
                          <div className="p-3 flex flex-col flex-grow">
                            {product.brand && (
                              <div className="mb-1">
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const params = new URLSearchParams(searchParams.toString());
                                    params.set("brand", product.brand?.name || "");
                                    router.push(`/products?${params.toString()}`);
                                  }}
                                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  {product.brand.name}
                                </button>
                              </div>
                            )}
                            <h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm leading-[1.4] mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2 flex-grow min-h-[40px]">
                              {formatProductName(product)}
                            </h3>
                            
                            <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-neutral-900 dark:text-white">
                                ₹{product.price.toFixed(2)}
                                </span>
                                {product.discount > 0 ? (
                                  <span className="text-sm text-neutral-400 line-through">
                                    ₹{product.mrp.toFixed(2)}
                                  </span>
                                ) : (
                                  <span className="text-sm text-transparent">
                                    ₹{product.mrp.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  }
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-neutral-500 dark:text-neutral-400">No products found matching your criteria.</p>
                <button 
                  onClick={() => {
                    router.push('/products');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  View All Products
                </button>
              </div>
            )}
            
            {/* Loading More Indicator */}
            {loading && (
              <div className="flex justify-center mt-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 