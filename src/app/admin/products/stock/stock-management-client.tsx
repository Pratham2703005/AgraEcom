"use client";

import { useState, useEffect } from "react";
import { Product, Message } from "./types";
import { useProductSearch } from "./hooks/useProductSearch";
import { useStockAdjustments } from "./hooks/useStockAdjustments";
import { useOfferAdjustments } from "./hooks/useOfferAdjustments";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import { SearchBar } from "./components/SearchBar";
import { ProductCard } from "./components/ProductCard";
import { ProductSkeleton } from "./components/ProductSkeleton";

interface StockManagementClientProps {
  initialProducts: Product[];
}

export default function StockManagementClient({ initialProducts }: StockManagementClientProps) {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>({ type: "", text: "" });

  // Use custom hooks
  const {
    products,
    loading,
    hasMore,
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    isInitialLoading,
    initializeProducts,
    loadNextPage,
    setProducts
  } = useProductSearch();

  const {
    stockAdjustments,
    isSubmitting,
    handleStockChange,
    handleStockStatusChange
  } = useStockAdjustments(products, setProducts, setMessage);

  const {
    offerAdjustments,
    editingOffers,
    updatingOffers,
    toggleEditOffers,
    handleQuantityChange,
    handleOfferChange,
    handleAddOffer,
    handleRemoveOffer,
    handleOfferStatusChange
  } = useOfferAdjustments(products, setProducts, setMessage);

  const { lastProductElementRef, cleanup } = useInfiniteScroll(
    loading,
    hasMore,
    debouncedSearchQuery,
    loadNextPage
  );

  // Initialize products on mount
  useEffect(() => {
    initializeProducts(initialProducts);
  }, [initialProducts, initializeProducts]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  return (
    <div className="bg-white dark:bg-neutral-900 shadow-sm">
      {/* Search and Message Bar */}
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        message={message}
      />

      {/* Products List */}
      <div className="p-4">
        {isInitialLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <ProductSkeleton key={`initial-skeleton-${index}`} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-3">
            {products.map((product, index) => {
              const isLast = index === products.length - 1;
              const isExpanded = expandedProduct === product.id;
              const stockAdjustment = stockAdjustments[product.id];
              const offerAdjustment = offerAdjustments[product.id];
              const isEditingOffers = editingOffers === product.id;
              const isUpdatingOffers = updatingOffers[product.id] || false;

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  isExpanded={isExpanded}
                  isLast={isLast}
                  hasMore={hasMore}
                  debouncedSearchQuery={debouncedSearchQuery}
                  stockAdjustment={stockAdjustment}
                  offerAdjustment={offerAdjustment}
                  isEditingOffers={isEditingOffers}
                  isSubmitting={isSubmitting}
                  isUpdatingOffers={isUpdatingOffers}
                  lastProductElementRef={lastProductElementRef}
                  onToggleExpand={setExpandedProduct}
                  onStockChange={handleStockChange}
                  onStockStatusChange={handleStockStatusChange}
                  onToggleEditOffers={toggleEditOffers}
                  onQuantityChange={handleQuantityChange}
                  onOfferChange={handleOfferChange}
                  onAddOffer={handleAddOffer}
                  onRemoveOffer={handleRemoveOffer}
                  onOfferStatusChange={handleOfferStatusChange}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500 dark:text-neutral-400">
              {debouncedSearchQuery.trim() 
                ? "No products found matching your search." 
                : "No products available."
              }
            </p>
          </div>
        )}

        {/* Loading skeletons for infinite scroll */}
        {loading && !isInitialLoading && (
          <div className="space-y-3 mt-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProductSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        )}
        
        {/* End of results indicator */}
        {!hasMore && products.length > 0 && !loading && !debouncedSearchQuery.trim() && (
          <div className="mt-4 text-center text-sm text-neutral-500">
            No more products to load
          </div>
        )}
      </div>
    </div>
  );
}