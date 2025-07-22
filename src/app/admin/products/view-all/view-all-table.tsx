"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {  Trash2, Search } from "lucide-react";
import { formatProductName } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Prisma } from "@prisma/client";
import {useRouter} from 'next/navigation'
type Brand = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
};

type Product = {
  id: string;
  name: string;
  brandId: string | null;
  brand?: Brand | null;
  weight: string | null;
  mrp: number;
  offers: Prisma.JsonValue; // quantity string (e.g. "1", "2"), discount number (e.g. 10)
  demand: number;
  piecesLeft: number | null;
  description: string | null;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
};

// Product skeleton component for loading state
const ProductSkeleton = () => (
  <tr>
    <td className="px-4 py-3 whitespace-nowrap">
      <div className="h-12 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 animate-pulse"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-16 animate-pulse"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-12 animate-pulse"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-16 animate-pulse"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-12 animate-pulse"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-16 animate-pulse"></div>
    </td>
  </tr>
);

export default function ViewAllTable({ products: initialProducts }: { products: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const productsPerPage = 20;
  const router = useRouter()
  
  // Use ref to track if we're already loading to prevent race conditions
  const isLoadingRef = useRef(false);
  const loadedPagesRef = useRef(new Set<number>());
  
  // Function to load products from API
  const loadProducts = useCallback(async (pageToLoad: number, isInitial: boolean = false) => {
    // Prevent duplicate loading
    if (isLoadingRef.current || loadedPagesRef.current.has(pageToLoad)) {
      console.log(`Already loading or loaded page ${pageToLoad}, skipping`);
      return;
    }
    
    isLoadingRef.current = true;
    loadedPagesRef.current.add(pageToLoad);
    
    if (pageToLoad === 1) {
      setProducts([]);
      setDisplayedProducts([]);
      loadedPagesRef.current.clear();
      loadedPagesRef.current.add(1);
    }
    
    setLoading(true);
    console.log(`Starting to load page ${pageToLoad}`);
    
    try {
      console.log(`Fetching page ${pageToLoad} of products`);
      const response = await fetch(`/api/admin/product?page=${pageToLoad}&limit=${productsPerPage}`);
      
      if (!response.ok) {
        throw new Error("Failed to load products");
      }
      
      const data = await response.json();
      const newProducts = data.products || [];
      const pagination = data.pagination || {};
      
      console.log(`Loaded page ${pageToLoad} with ${newProducts.length} products. Total: ${pagination.totalProducts}, Has more: ${pagination.hasMore}`);
      
      // Check if we have more products to load
      setHasMore(pagination.hasMore);
      
      if (newProducts.length === 0) {
        console.log("No products returned, setting hasMore to false");
        setHasMore(false);
        return;
      }
      
      if (pageToLoad === 1) {
        // First page replaces existing products
        setProducts(newProducts);
        setDisplayedProducts(newProducts);
      } else {
        // Subsequent pages append to existing products
        setProducts(prev => {
          // Filter out duplicates by ID
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewProducts = newProducts.filter((p: Product) => !existingIds.has(p.id));
          console.log(`Adding ${uniqueNewProducts.length} new unique products to the list`);
          
          if (uniqueNewProducts.length === 0) {
            console.log("No new unique products to add, setting hasMore to false");
            setHasMore(false);
          }
          
          return [...prev, ...uniqueNewProducts];
        });
        setDisplayedProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewProducts = newProducts.filter((p: Product) => !existingIds.has(p.id));
          return [...prev, ...uniqueNewProducts];
        });
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setMessage({ type: "error", text: (error as Error).message });
      // Remove from loaded pages on error so it can be retried
      loadedPagesRef.current.delete(pageToLoad);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
      if (isInitial) {
        setIsInitialLoading(false);
      }
    }
  }, [productsPerPage]);

  // Initialize with first page of products on mount
  useEffect(() => {
    console.log("Component mounted, loading first page of products");
    loadProducts(1, true);
    
    // Cleanup function
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []); // Empty dependency array to run only once

  // Set up intersection observer for infinite scrolling
  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductElementRef = useCallback((node: HTMLElement | null) => {
    if (loading || !hasMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingRef.current) {
        console.log('Intersection observed, loading next page:', page + 1);
        setPage(prevPage => prevPage + 1);
      }
    }, { 
      threshold: 0.1,
      rootMargin: '200px'
    });
    
    if (node) {
      console.log('Observer attached to element');
      observer.current.observe(node);
    }
  }, [loading, hasMore, page]);

  // Load products when page changes (but not on initial mount)
  useEffect(() => {
    if (page > 1) {
      console.log(`Page changed to ${page}, loading more products`);
      loadProducts(page, false);
    }
  }, [page]); // Remove loadProducts from dependency array

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDisplayedProducts(products);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = products.filter(
        (product) => 
          product.name.toLowerCase().includes(lowerCaseQuery) || 
          (product.brand && product.brand.name.toLowerCase().includes(lowerCaseQuery))
      );
      setDisplayedProducts(filtered);
    }
  }, [searchQuery, products]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setIsDeleting((prev) => ({ ...prev, [id]: true }));
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`/api/admin/product/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      // Remove from all states
      setProducts((prev) => prev.filter((product) => product.id !== id));
      setDisplayedProducts((prev) => prev.filter((product) => product.id !== id));
      
      setMessage({ type: "success", text: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      setMessage({ type: "error", text: "Failed to delete product" });
    } finally {
      setIsDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Show skeleton loading for initial load
  if (isInitialLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 shadow-sm">
        <div className="p-4 border-b dark:border-neutral-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-5 w-5" />
            <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg w-full animate-pulse"></div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Image</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Product Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">MRP</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Discount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {Array.from({ length: 10 }).map((_, index) => (
                <ProductSkeleton key={`initial-skeleton-${index}`} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 shadow-sm">
      {/* Search and Message Bar */}
      <div className="p-4 border-b dark:border-neutral-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search products..."
            className="!pl-10 pr-4 py-2 w-full border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {message.text && (
          <div className={`px-4 py-2 rounded-lg text-sm ${
            message.type === "success" 
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}>
            {message.text}
          </div>
        )}
        
        {/* Debug info */}
        <div className="text-xs text-neutral-500">
          Page: {page} | Products: {displayedProducts.length} | Has more: {hasMore ? 'Yes' : 'No'} | Loading: {loading ? 'Yes' : 'No'}
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Image</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Product Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">MRP</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Base Discount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Sale Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {displayedProducts.length > 0 ? (
              displayedProducts.map((product, index) => {
                const isLast = displayedProducts.length === index + 1;
                return (
                  <tr
  key={product.id}
  ref={isLast ? lastProductElementRef : null}
  onClick={() => router.push(`/admin/products/edit/${product.id}`)}
  className="hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer"
>
  <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
    {product.images && product.images.length > 0 ? (
      <div className="relative h-12 w-12">
        <Image
          src={product.images[0]}
          alt={formatProductName(product)}
          fill
          sizes="48px"
          className="object-cover rounded-md"
        />
      </div>
    ) : (
      <div className="h-12 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-md flex items-center justify-center">
        <span className="text-neutral-400 dark:text-neutral-500 text-xs">No image</span>
      </div>
    )}
  </td>
  <td className="px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100">
    {formatProductName(product)}
  </td>
  <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
    ₹{product.mrp.toFixed(2)}
  </td>
  <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
    {product.offers && (product.offers as Record<string, number>)["1"] !== undefined ? `${(product.offers as Record<string, number>)["1"]}%` : "0%"}
  </td>
  <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
    ₹{(product.mrp * (1 - ((product.offers as Record<string, number>)["1"] || 0) / 100)).toFixed(2)}
  </td>
  <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
    {product.piecesLeft !== null ? product.piecesLeft : "N/A"}
  </td>
  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
    <button
      onClick={() => handleDelete(product.id)}
      disabled={isDeleting[product.id]}
      className="p-1 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 disabled:opacity-50"
      title="Delete"
    >
      <Trash2 size={18} />
    </button>
  </td>
</tr>

                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  No products found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Loading indicator for infinite scroll */}
      {loading && !isInitialLoading && (
        <div className="p-4 flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm text-neutral-500">Loading more products...</span>
          </div>
        </div>
      )}
      
      {/* End of results indicator */}
      {!hasMore && displayedProducts.length > 0 && !loading && (
        <div className="p-4 text-center text-sm text-neutral-500">
          No more products to load
        </div>
      )}
    </div>
  );
}