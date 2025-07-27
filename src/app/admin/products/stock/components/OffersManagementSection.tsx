import { CheckCircle, XCircle, Edit, PlusCircle, Trash2, AlertCircle } from "lucide-react";
import { Product, OfferAdjustment } from "../types";
import { calculatePriceFromDiscount, formatPrice, formatDiscount } from "../utils";
import CustomLoader from "@/components/CustomLoader";

interface OffersManagementSectionProps {
  product: Product;
  offerAdjustment?: OfferAdjustment;
  isEditingOffers: boolean;
  isUpdatingOffers: boolean;
  onToggleEdit: (productId: string | null) => void;
  onQuantityChange: (productId: string, oldQuantity: string, newQuantity: string) => void;
  onOfferChange: (productId: string, quantity: string, discount: string) => void;
  onPriceChange: (productId: string, quantity: string, price: string) => void;
  onAddOffer: (productId: string) => void;
  onRemoveOffer: (productId: string, quantity: string) => void;
  onStatusChange: (productId: string, status: "done" | "cancelled") => void;
}


export const OffersManagementSection = ({
  product,
  offerAdjustment,
  isEditingOffers,
  isUpdatingOffers,
  onToggleEdit,
  onQuantityChange,
  onOfferChange,
  onPriceChange,
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
          {/* <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Updating offers...</span> 
          </div> */}
          <div className="mx-auto max-w-7xl px-4 py-8 h-[calc(100vh-100px)] flex justify-center items-center">
            <CustomLoader size="sm" />
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
            const tempPriceEdit = offerAdjustment?.tempPriceEdit;
            const validationErrors = offerAdjustment?.validationErrors?.[quantity] || [];
            
            const displayQuantity = tempQuantityEdit?.oldQuantity === quantity 
              ? tempQuantityEdit.newValue 
              : quantity;
            
            const displayDiscount = tempDiscountEdit?.quantity === quantity 
              ? tempDiscountEdit.newValue 
              : formatDiscount(discount);

            const calculatedPrice = calculatePriceFromDiscount(product.mrp, Number(displayDiscount || discount));
            // const displayPrice = tempPriceEdit?.quantity === quantity 
            //   ? tempPriceEdit.newValue 
            //   : formatPrice(calculatedPrice);

            // Get field-specific errors
            const quantityErrors = validationErrors.filter(e => e.field === 'quantity');
            const discountErrors = validationErrors.filter(e => e.field === 'discount');
            const priceErrors = validationErrors.filter(e => e.field === 'price');

            return (
              <div key={`${product.id}-offer-${index}`} className="space-y-2">
                <div className="grid grid-cols-[auto_auto_auto_auto] sm:flex sm:items-start gap-2 sm:gap-3">
                  {/* Quantity Field */}
                  <div className="px-2 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-md w-[80px] text-center">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Quantity</div>
                    {isEditingOffers && quantity !== "1" ? (
                      <input
                        type="number"
                        value={displayQuantity}
                        onChange={(e) => onQuantityChange(product.id, quantity, e.target.value)}
                        onBlur={(e) => {
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
                        className={`w-full text-center bg-white dark:bg-neutral-600 border rounded py-1 px-1 text-sm h-8 ${
                          quantityErrors.length > 0 
                            ? 'border-red-500 dark:border-red-400' 
                            : 'border-neutral-300 dark:border-neutral-500'
                        }`}
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

                  {/* Discount Field */}
                  <div className="px-2 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-md w-[80px] text-center">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Discount</div>
                    {isEditingOffers ? (
                      <input
                        type="number"
                        step="0.01"
                        value={
                          tempDiscountEdit?.quantity === quantity 
                            ? tempDiscountEdit.newValue 
                            : discount.toString()
                        }
                        onChange={(e) => onOfferChange(product.id, quantity, e.target.value)}
                        onBlur={(e) => {
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
                        className={`w-full text-center bg-white dark:bg-neutral-600 border rounded py-1 px-1 text-sm h-8 ${
                          discountErrors.length > 0 
                            ? 'border-red-500 dark:border-red-400' 
                            : 'border-neutral-300 dark:border-neutral-500'
                        }`}
                        onFocus={(e) => e.target.select()}
                        inputMode="decimal"
                        placeholder="%"
                      />
                    ) : (
                      <div className="font-medium text-neutral-900 dark:text-neutral-100 h-8 flex items-center justify-center">
                        {formatDiscount(discount)}%
                      </div>
                    )}
                  </div>

                  {/* Price Field */}
                  <div className="px-2 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-md w-[100px] text-center">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Price</div>
                    {isEditingOffers ? (
                      <input
                        type="number"
                        step="0.01"
                        value={
                          tempPriceEdit?.quantity === quantity
                            ? tempPriceEdit.newValue
                            : formatPrice(calculatePriceFromDiscount(product.mrp, Number(discount)))
                        }
                        onChange={(e) => onPriceChange(product.id, quantity, e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value === "") {
                            const defaultPrice = calculatePriceFromDiscount(product.mrp, discount);
                            onPriceChange(product.id, quantity, formatPrice(defaultPrice));
                          }
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        className={`w-full text-center bg-white dark:bg-neutral-600 border rounded py-1 px-1 text-sm h-8 ${
                          priceErrors.length > 0 
                            ? 'border-red-500 dark:border-red-400' 
                            : 'border-neutral-300 dark:border-neutral-500'
                        }`}
                        onFocus={(e) => e.target.select()}
                        inputMode="decimal"
                        placeholder="₹"
                      />
                    ) : (
                      <div className="font-medium text-neutral-900 dark:text-neutral-100 h-8 flex items-center justify-center">
                        ₹{formatPrice(calculatedPrice)}
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
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

                {/* Validation Errors */}
                {isEditingOffers && validationErrors.length > 0 && (
                  <div className="ml-2 space-y-1">
                    {validationErrors.map((error, errorIndex) => (
                      <div key={errorIndex} className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                        <AlertCircle size={12} />
                        <span>{error.message}</span>
                      </div>
                    ))}
                  </div>
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