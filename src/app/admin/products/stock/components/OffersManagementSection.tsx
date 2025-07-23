import { CheckCircle, XCircle, Edit, PlusCircle, Trash2 } from "lucide-react";
import { Product, OfferAdjustment } from "../types";

interface OffersManagementSectionProps {
  product: Product;
  offerAdjustment?: OfferAdjustment;
  isEditingOffers: boolean;
  isUpdatingOffers: boolean;
  onToggleEdit: (productId: string | null) => void;
  onQuantityChange: (productId: string, oldQuantity: string, newQuantity: string) => void;
  onOfferChange: (productId: string, quantity: string, discount: string) => void;
  onAddOffer: (productId: string) => void;
  onRemoveOffer: (productId: string, quantity: string) => void;
  onStatusChange: (productId: string, status: "done" | "cancelled") => void;
}

// Helper function to calculate discount price
const calculatePrice = (mrp: number, discount: number) => {
  return mrp * (1 - discount / 100);
};

export const OffersManagementSection = ({
  product,
  offerAdjustment,
  isEditingOffers,
  isUpdatingOffers,
  onToggleEdit,
  onQuantityChange,
  onOfferChange,
  onAddOffer,
  onRemoveOffer,
  onStatusChange
}: OffersManagementSectionProps) => {
  const productOffers = isEditingOffers && offerAdjustment
    ? offerAdjustment.offers
    : (product.offers as Record<string, number>);

  return (
    <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm relative">
      {isUpdatingOffers && (
        <div className="absolute inset-0 bg-white/80 dark:bg-neutral-800/80 rounded-lg flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Updating offers...</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Quantity Offers
        </h4>

        {!isEditingOffers ? (
          <button
            onClick={() => onToggleEdit(product.id)}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-1"
            disabled={isUpdatingOffers}
          >
            <Edit size={16} />
            {isUpdatingOffers ? 'Updating...' : 'Edit Offers'}
          </button>
        ) : (
          <button
            onClick={() => onAddOffer(product.id)}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center gap-1"
          >
            <PlusCircle size={16} />
            Add Offer
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {Object.entries(productOffers || {})
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([quantity, discount], index) => {
            // Check for temporary edit states
            const tempQuantityEdit = offerAdjustment?.tempQuantityEdit;
            const tempDiscountEdit = offerAdjustment?.tempDiscountEdit;
            
            const displayQuantity = tempQuantityEdit?.oldQuantity === quantity 
              ? tempQuantityEdit.newValue 
              : quantity;
            
            const displayDiscount = tempDiscountEdit?.quantity === quantity 
              ? tempDiscountEdit.newValue 
              : discount.toString();

            return (
              <div key={`${product.id}-offer-${index}`} className="grid grid-cols-[auto_auto_1fr_auto] sm:flex sm:items-center gap-2 sm:gap-3">
                <div className="px-2 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-md w-[80px] text-center">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Quantity</div>
                  {isEditingOffers && quantity !== "1" ? (
                    <input
                      type="number"
                      min="1"
                      value={displayQuantity}
                      onChange={(e) => onQuantityChange(product.id, quantity, e.target.value)}
                      onBlur={(e) => {
                        // If empty on blur, revert to original value
                        if (e.target.value === "") {
                          onQuantityChange(product.id, quantity, quantity);
                        }
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-full text-center bg-white dark:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 rounded py-1 px-1 text-sm h-8"
                      onFocus={(e) => e.target.select()}
                      inputMode="numeric"
                      placeholder="Qty"
                    />
                  ) : (
                    <div className="font-medium text-neutral-900 dark:text-neutral-100 h-8 flex items-center justify-center">
                      {quantity}
                    </div>
                  )}
                </div>

                <div className="px-2 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-md w-[80px] text-center">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Discount</div>
                  {isEditingOffers ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={displayDiscount}
                      onChange={(e) => onOfferChange(product.id, quantity, e.target.value)}
                      onBlur={(e) => {
                        // If empty on blur, revert to original value
                        if (e.target.value === "") {
                          onOfferChange(product.id, quantity, discount.toString());
                        }
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-full text-center bg-white dark:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 rounded py-1 px-1 text-sm h-8"
                      onFocus={(e) => e.target.select()}
                      inputMode="decimal"
                      placeholder="%"
                    />
                  ) : (
                    <div className="font-medium text-neutral-900 dark:text-neutral-100 h-8 flex items-center justify-center">
                      {discount}%
                    </div>
                  )}
                </div>

                <div className="px-2 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-md flex-1">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Price</div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100 h-8 flex items-center">
                    ₹{calculatePrice(product.mrp, Number(displayDiscount || discount)).toFixed(2)}
                  </div>
                </div>

                {isEditingOffers && quantity !== "1" && (
                  <button
                    onClick={() => onRemoveOffer(product.id, quantity)}
                    className="w-10 h-10 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                    title="Remove Offer"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            );
          })}
      </div>

      {isEditingOffers && (
        <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 sm:gap-0">
          <button
            onClick={() => onStatusChange(product.id, "done")}
            disabled={isUpdatingOffers}
            className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center gap-1 disabled:opacity-50"
          >
            <CheckCircle size={16} />
            {isUpdatingOffers ? 'Saving...' : 'Save Offers'}
          </button>
          <button
            onClick={() => onStatusChange(product.id, "cancelled")}
            disabled={isUpdatingOffers}
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center gap-1 disabled:opacity-50"
          >
            <XCircle size={16} />
            Cancel
          </button>
        </div>
      )}

      {offerAdjustment?.status === "done" && (
        <div className="mt-2 text-green-600 dark:text-green-500 text-sm flex items-center gap-1">
          <CheckCircle size={16} />
          <span>Offers updated successfully</span>
        </div>
      )}

      {offerAdjustment?.status === "cancelled" && (
        <div className="mt-2 text-red-600 dark:text-red-500 text-sm flex items-center gap-1">
          <XCircle size={16} />
          <span>Update cancelled</span>
        </div>
      )}
    </div>
  );
};