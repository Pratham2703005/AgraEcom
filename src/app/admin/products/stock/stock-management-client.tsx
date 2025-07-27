"use client";

import { useState, useEffect } from "react";
import { Product, Message } from "./types";
import { useProductSearch } from "./hooks/useProductSearch";
import { useStockAdjustments } from "./hooks/useStockAdjustments";
import { useOfferAdjustments } from "./hooks/useOfferAdjustments";
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import { SearchBar } from "./components/SearchBar";
import { VirtualizedProductList } from "./components/VirtualizedProductList";

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
    handlePriceChange,
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
        <VirtualizedProductList
          products={products}
          loading={loading}
          hasMore={hasMore}
          isInitialLoading={isInitialLoading}
          debouncedSearchQuery={debouncedSearchQuery}
          expandedProduct={expandedProduct}
          stockAdjustments={stockAdjustments}
          offerAdjustments={offerAdjustments}
          editingOffers={editingOffers}
          isSubmitting={isSubmitting}
          updatingOffers={updatingOffers}
          lastProductElementRef={lastProductElementRef}
          onToggleExpand={setExpandedProduct}
          onStockChange={handleStockChange}
          onStockStatusChange={handleStockStatusChange}
          onToggleEditOffers={toggleEditOffers}
          onQuantityChange={handleQuantityChange}
          onOfferChange={handleOfferChange}
          onPriceChange={handlePriceChange}
          onAddOffer={handleAddOffer}
          onRemoveOffer={handleRemoveOffer}
          onOfferStatusChange={handleOfferStatusChange}
        />
      </div>
    </div>
  );
}