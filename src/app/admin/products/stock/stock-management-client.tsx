"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { formatProductName } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type Brand = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
};

type Product = {
  id: string;
  name: string;
  brand?: Brand | null;
  weight: string | null;
  images: string[];
  piecesLeft: number | null;
};

type StockAdjustment = {
  productId: string;
  newStock: number;
  status: "pending" | "done" | "cancelled";
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
      <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-24 animate-pulse"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-16 animate-pulse"></div>
    </td>
  </tr>
);

export default function StockManagementClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [stockAdjustments, setStockAdjustments] = useState<Record<string, StockAdjustment>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const productsPerPage = 20;
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, { threshold: 0.8 });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = products.filter(
        (product) => 
          product.name.toLowerCase().includes(lowerCaseQuery) || 
          (product.brand && product.brand.name.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredProducts(filtered);
    }
    // Reset pagination when search query changes
    setPage(1);
    setHasMore(true);
  }, [searchQuery, products]);

  // Load more products when page changes
  useEffect(() => {
    setLoading(true);
    const start = 0;
    const end = page * productsPerPage;
    const newDisplayedProducts = filteredProducts.slice(start, end);
    setDisplayedProducts(newDisplayedProducts);
    setHasMore(newDisplayedProducts.length < filteredProducts.length);
    setLoading(false);
  }, [filteredProducts, page]);

  const handleStockChange = (productId: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;

    setStockAdjustments((prev) => ({
      ...prev,
      [productId]: {
        productId,
        newStock: numValue,
        status: prev[productId]?.status || "pending",
      },
    }));
  };

  const handleStatusChange = (productId: string, status: "done" | "cancelled") => {
    const adjustment = stockAdjustments[productId];
    if (!adjustment) return;

    if (status === "done") {
      updateProductStock(productId, adjustment.newStock);
    } else {
      // If cancelled, remove from adjustments or reset to current stock
      const currentProduct = products.find(p => p.id === productId);
      if (currentProduct) {
        setStockAdjustments((prev) => ({
          ...prev,
          [productId]: {
            ...prev[productId],
            newStock: currentProduct.piecesLeft || 0,
            status: "cancelled",
          },
        }));
      }
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`/api/admin/product/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ piecesLeft: newStock }),
      });

      if (!response.ok) {
        throw new Error("Failed to update stock");
      }

      // Update local state
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === productId ? { ...p, piecesLeft: newStock } : p
        )
      );

      // Update adjustments
      setStockAdjustments((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          status: "done",
        },
      }));

      setMessage({ type: "success", text: "Stock updated successfully" });
    } catch (error) {
      console.error("Error updating stock:", error);
      setMessage({ type: "error", text: "Failed to update stock" });
      
      // Mark as cancelled on error
      setStockAdjustments((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          status: "cancelled",
        },
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 shadow-sm">
      {/* Search and Message Bar */}
      <div className="p-4 border-b  dark:border-neutral-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 dark:bg-neutral-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Image</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Product Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Current Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">New Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-200">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {displayedProducts.length > 0 ? (
              displayedProducts.map((product, index) => {
                const adjustment = stockAdjustments[product.id];
                const isChanged = adjustment && adjustment.newStock !== product.piecesLeft;
                const isDone = adjustment?.status === "done";
                const isCancelled = adjustment?.status === "cancelled";
                
                // Add ref to last product element
                if (displayedProducts.length === index + 1) {
                  return (
                    <tr 
                      ref={lastProductElementRef}
                      key={product.id} 
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-700"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={formatProductName(product)}
                            className="h-12 w-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-md flex items-center justify-center">
                            <span className="text-neutral-400 dark:text-neutral-500">No image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100">
                        {formatProductName(product)}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                        {product.piecesLeft !== null ? product.piecesLeft : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={adjustment?.newStock ?? product.piecesLeft ?? 0}
                          onChange={(e) => handleStockChange(product.id, e.target.value)}
                          className={`w-24 px-3 py-1 border rounded-md dark:bg-neutral-700 dark:text-white ${
                            isDone 
                              ? "border-green-500 dark:border-green-600" 
                              : isCancelled 
                                ? "border-red-500 dark:border-red-600"
                                : "border-neutral-300 dark:border-neutral-600"
                          }`}
                          disabled={isDone || isCancelled || isSubmitting}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {!isDone && !isCancelled && isChanged && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusChange(product.id, "done")}
                              disabled={isSubmitting}
                              className="p-1 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 disabled:opacity-50"
                              title="Confirm"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(product.id, "cancelled")}
                              disabled={isSubmitting}
                              className="p-1 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 disabled:opacity-50"
                              title="Cancel"
                            >
                              <XCircle size={20} />
                            </button>
                          </div>
                        )}
                        {isDone && (
                          <span className="text-green-600 dark:text-green-500 text-sm font-medium">Updated</span>
                        )}
                        {isCancelled && (
                          <span className="text-red-600 dark:text-red-500 text-sm font-medium">Cancelled</span>
                        )}
                      </td>
                    </tr>
                  );
                } else {
                  return (
                    <tr key={product.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={formatProductName(product)}
                            className="h-12 w-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-md flex items-center justify-center">
                            <span className="text-neutral-400 dark:text-neutral-500">No image</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100">
                        {formatProductName(product)}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300">
                        {product.piecesLeft !== null ? product.piecesLeft : "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={adjustment?.newStock ?? product.piecesLeft ?? 0}
                          onChange={(e) => handleStockChange(product.id, e.target.value)}
                          className={`w-24 px-3 py-1 border rounded-md dark:bg-neutral-700 dark:text-white ${
                            isDone 
                              ? "border-green-500 dark:border-green-600" 
                              : isCancelled 
                                ? "border-red-500 dark:border-red-600"
                                : "border-neutral-300 dark:border-neutral-600"
                          }`}
                          disabled={isDone || isCancelled || isSubmitting}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {!isDone && !isCancelled && isChanged && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusChange(product.id, "done")}
                              disabled={isSubmitting}
                              className="p-1 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 disabled:opacity-50"
                              title="Confirm"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(product.id, "cancelled")}
                              disabled={isSubmitting}
                              className="p-1 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 disabled:opacity-50"
                              title="Cancel"
                            >
                              <XCircle size={20} />
                            </button>
                          </div>
                        )}
                        {isDone && (
                          <span className="text-green-600 dark:text-green-500 text-sm font-medium">Updated</span>
                        )}
                        {isCancelled && (
                          <span className="text-red-600 dark:text-red-500 text-sm font-medium">Cancelled</span>
                        )}
                      </td>
                    </tr>
                  );
                }
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  No products found matching your search.
                </td>
              </tr>
            )}
            
            {/* Loading indicator */}
            {loading && Array.from({ length: 3 }).map((_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 