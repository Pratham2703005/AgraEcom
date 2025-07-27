import { memo, useCallback, useMemo } from "react";
import { Product, StockAdjustment, OfferAdjustment } from "../types";
import { ProductCard } from "./ProductCard";
import { ProductSkeleton } from "./ProductSkeleton";

interface VirtualizedProductListProps {
  products: Product[];
  loading: boolean;
  hasMore: boolean;
  isInitialLoading: boolean;
  debouncedSearchQuery: string;
  expandedProduct: string | null;
  stockAdjustments: Record<string, StockAdjustment>;
  offerAdjustments: Record<string, OfferAdjustment>;
  editingOffers: string | null;
  isSubmitting: boolean;
  updatingOffers: Record<string, boolean>;
  lastProductElementRef?: (node: HTMLElement | null) => void;
  onToggleExpand: (productId: string | null) => void;
  onStockChange: (productId: string, value: string) => void;
  onStockStatusChange: (productId: string, status: "done" | "cancelled") => void;
  onToggleEditOffers: (productId: string | null) => void;
  onQuantityChange: (productId: string, oldQuantity: string, newQuantity: string) => void;
  onOfferChange: (productId: string, quantity: string, discount: string) => void;
  onPriceChange: (productId: string, quantity: string, price: string) => void;
  onAddOffer: (productId: string) => void;
  onRemoveOffer: (productId: string, quantity: string) => void;
  onOfferStatusChange: (productId: string, status: "done" | "cancelled") => void;
}

const VirtualizedProductListComponent = ({
  products,
  loading,
  hasMore,
  isInitialLoading,
  debouncedSearchQuery,
  expandedProduct,
  stockAdjustments,
  offerAdjustments,
  editingOffers,
  isSubmitting,
  updatingOffers,
  lastProductElementRef,
  onToggleExpand,
  onStockChange,
  onStockStatusChange,
  onToggleEditOffers,
  onQuantityChange,
  onOfferChange,
  onPriceChange,
  onAddOffer,
  onRemoveOffer,
  onOfferStatusChange
}: VirtualizedProductListProps) => {
  
  // Memoize product cards to prevent unnecessary re-renders
  const productCards = useMemo(() => {
    return products.map((product, index) => {
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
          onToggleExpand={onToggleExpand}
          onStockChange={onStockChange}
          onStockStatusChange={onStockStatusChange}
          onToggleEditOffers={onToggleEditOffers}
          onQuantityChange={onQuantityChange}
          onOfferChange={onOfferChange}
          onPriceChange={onPriceChange}
          onAddOffer={onAddOffer}
          onRemoveOffer={onRemoveOffer}
          onOfferStatusChange={onOfferStatusChange}
        />
      );
    });
  }, [
    products,
    expandedProduct,
    stockAdjustments,
    offerAdjustments,
    editingOffers,
    isSubmitting,
    updatingOffers,
    hasMore,
    debouncedSearchQuery,
    lastProductElementRef,
    onToggleExpand,
    onStockChange,
    onStockStatusChange,
    onToggleEditOffers,
    onQuantityChange,
    onOfferChange,
    onPriceChange,
    onAddOffer,
    onRemoveOffer,
    onOfferStatusChange
  ]);

  // Memoize loading skeletons
  const loadingSkeletons = useMemo(() => {
    const skeletonCount = isInitialLoading ? 5 : 3;
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <ProductSkeleton key={`${isInitialLoading ? 'initial-' : ''}skeleton-${index}`} />
    ));
  }, [isInitialLoading]);

  if (isInitialLoading) {
    return (
      <div className="space-y-3">
        {loadingSkeletons}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500 dark:text-neutral-400">
          {debouncedSearchQuery.trim() 
            ? "No products found matching your search." 
            : "No products available."
          }
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {productCards}
      </div>

      {/* Loading skeletons for infinite scroll */}
      {loading && !isInitialLoading && (
        <div className="space-y-3 mt-4">
          {loadingSkeletons}
        </div>
      )}
      
      {/* End of results indicator */}
      {!hasMore && products.length > 0 && !loading && !debouncedSearchQuery.trim() && (
        <div className="mt-4 text-center text-sm text-neutral-500">
          No more products to load
        </div>
      )}
    </>
  );
};

export const VirtualizedProductList = memo(VirtualizedProductListComponent, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.products.length === nextProps.products.length &&
    prevProps.loading === nextProps.loading &&
    prevProps.hasMore === nextProps.hasMore &&
    prevProps.isInitialLoading === nextProps.isInitialLoading &&
    prevProps.debouncedSearchQuery === nextProps.debouncedSearchQuery &&
    prevProps.expandedProduct === nextProps.expandedProduct &&
    prevProps.editingOffers === nextProps.editingOffers &&
    prevProps.isSubmitting === nextProps.isSubmitting &&
    JSON.stringify(prevProps.stockAdjustments) === JSON.stringify(nextProps.stockAdjustments) &&
    JSON.stringify(prevProps.offerAdjustments) === JSON.stringify(nextProps.offerAdjustments) &&
    JSON.stringify(prevProps.updatingOffers) === JSON.stringify(nextProps.updatingOffers)
  );
});