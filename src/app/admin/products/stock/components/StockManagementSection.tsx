import { CheckCircle, XCircle } from "lucide-react";
import { Product, StockAdjustment } from "../types";

interface StockManagementSectionProps {
  product: Product;
  stockAdjustment?: StockAdjustment;
  isSubmitting: boolean;
  onStockChange: (productId: string, value: string) => void;
  onStatusChange: (productId: string, status: "done" | "cancelled") => void;
}

export const StockManagementSection = ({
  product,
  stockAdjustment,
  isSubmitting,
  onStockChange,
  onStatusChange
}: StockManagementSectionProps) => {
  return (
    <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm">
      <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">
        Stock Management
      </h4>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Current Stock
          </label>
          <div className="text-neutral-900 dark:text-neutral-100 font-medium">
            {product.piecesLeft !== null ? product.piecesLeft : "N/A"}
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            New Stock
          </label>
          <input
            type="number"
            min="0"
            value={stockAdjustment?.newStock ?? product.piecesLeft ?? 0}
            onChange={(e) => onStockChange(product.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className={`w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white ${
              stockAdjustment?.status === "done"
                ? "border-green-500 dark:border-green-600"
                : stockAdjustment?.status === "cancelled"
                ? "border-red-500 dark:border-red-600"
                : "border-neutral-300 dark:border-neutral-600"
            }`}
            disabled={
              stockAdjustment?.status === "done" ||
              stockAdjustment?.status === "cancelled" ||
              isSubmitting
            }
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            placeholder="Stock"
          />
        </div>
      </div>

      {stockAdjustment &&
        stockAdjustment.newStock !== product.piecesLeft &&
        stockAdjustment.status === "pending" && (
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 sm:gap-0">
            <button
              onClick={() => onStatusChange(product.id, "done")}
              disabled={isSubmitting}
              className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center gap-1 disabled:opacity-50"
            >
              <CheckCircle size={16} />
              Update
            </button>
            <button
              onClick={() => onStatusChange(product.id, "cancelled")}
              disabled={isSubmitting}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm flex items-center gap-1 disabled:opacity-50"
            >
              <XCircle size={16} />
              Cancel
            </button>
          </div>
        )}

      {stockAdjustment?.status === "done" && (
        <div className="mt-2 text-green-600 dark:text-green-500 text-sm flex items-center gap-1">
          <CheckCircle size={16} />
          <span>Stock updated successfully</span>
        </div>
      )}

      {stockAdjustment?.status === "cancelled" && (
        <div className="mt-2 text-red-600 dark:text-red-500 text-sm flex items-center gap-1">
          <XCircle size={16} />
          <span>Update cancelled</span>
        </div>
      )}
    </div>
  );
};