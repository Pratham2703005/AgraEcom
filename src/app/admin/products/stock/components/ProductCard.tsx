import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatProductName } from "@/lib/utils";
import ProductImage from "@/components/ui/product-image";
import { Product, StockAdjustment, OfferAdjustment } from "../types";
import { StockManagementSection } from "./StockManagementSection";
import { OffersManagementSection } from "./OffersManagementSection";

interface ProductCardProps {
  product: Product;
  isExpanded: boolean;
  isLast: boolean;
  hasMore: boolean;
  debouncedSearchQuery: string;
  stockAdjustment?: StockAdjustment;
  offerAdjustment?: OfferAdjustment;
  isEditingOffers: boolean;
  isSubmitting: boolean;
  isUpdatingOffers: boolean;
  lastProductElementRef?: (node: HTMLElement | null) => void;
  onToggleExpand: (productId: string | null) => void;
  onStockChange: (productId: string, value: string) => void;
  onStockStatusChange: (productId: string, status: "done" | "cancelled") => void;
  onToggleEditOffers: (productId: string | null) => void;
  onQuantityChange: (productId: string, oldQuantity: string, newQuantity: string) => void;
  onOfferChange: (productId: string, quantity: string, discount: string) => void;
  onAddOffer: (productId: string) => void;
  onRemoveOffer: (productId: string, quantity: string) => void;
  onOfferStatusChange: (productId: string, status: "done" | "cancelled") => void;
}

export const ProductCard = ({
  product,
  isExpanded,
  isLast,
  hasMore,
  debouncedSearchQuery,
  stockAdjustment,
  offerAdjustment,
  isEditingOffers,
  isSubmitting,
  isUpdatingOffers,
  lastProductElementRef,
  onToggleExpand,
  onStockChange,
  onStockStatusChange,
  onToggleEditOffers,
  onQuantityChange,
  onOfferChange,
  onAddOffer,
  onRemoveOffer,
  onOfferStatusChange
}: ProductCardProps) => {
  const router = useRouter();

  return (
    <div
      ref={isLast && hasMore && !debouncedSearchQuery.trim() ? lastProductElementRef : undefined}
      className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-800"
    >
      {/* Accordion Header */}
      <div
        className="p-4 flex items-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
        onClick={() => onToggleExpand(isExpanded ? null : product.id)}
      >
        <div className="flex items-center flex-1 gap-4">
          <div 
            className="relative h-16 w-16 cursor-pointer" 
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/products/edit/${product.id}`);
            }}
          >
            {product.images && product.images.length > 0 ? (
              <ProductImage
                src={product.images[0]}
                alt={formatProductName(product)}
                fill
                sizes="(max-width: 768px) 48px, 64px"
                className="object-cover rounded-md"
                loading="lazy"
              />
            ) : (
              <div className="h-16 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-md flex items-center justify-center">
                <span className="text-neutral-400 dark:text-neutral-500 text-xs">No image</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-medium text-neutral-900 dark:text-neutral-100">
              {formatProductName(product)}
            </h3>
            <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
              {product.weight && <span>Weight: {product.weight}</span>}
              <span>MRP: ₹{product.mrp.toFixed(2)}</span>
              <span>Base Discount: {product.offers && (product.offers as Record<string, number>)["1"] || 0}%</span>
            </div>
          </div>
        </div>
        <div className="ml-2">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          )}
        </div>
      </div>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="sm:p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-6">
            {/* Stock Management Section */}
            <StockManagementSection
              product={product}
              stockAdjustment={stockAdjustment}
              isSubmitting={isSubmitting}
              onStockChange={onStockChange}
              onStatusChange={onStockStatusChange}
            />

            {/* Offers Management Section */}
            <OffersManagementSection
              product={product}
              offerAdjustment={offerAdjustment}
              isEditingOffers={isEditingOffers}
              isUpdatingOffers={isUpdatingOffers}
              onToggleEdit={onToggleEditOffers}
              onQuantityChange={onQuantityChange}
              onOfferChange={onOfferChange}
              onAddOffer={onAddOffer}
              onRemoveOffer={onRemoveOffer}
              onStatusChange={onOfferStatusChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};