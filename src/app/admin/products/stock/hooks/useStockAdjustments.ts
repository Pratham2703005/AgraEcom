import { useState, useCallback } from "react";
import { StockAdjustment, Product, Message } from "../types";

export function useStockAdjustments(
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setMessage: React.Dispatch<React.SetStateAction<Message>>
) {
  const [stockAdjustments, setStockAdjustments] = useState<Record<string, StockAdjustment>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStockChange = useCallback((productId: string, value: string) => {
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
  }, []);

  const updateProductStock = useCallback(async (productId: string, newStock: number) => {
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
  }, [setProducts, setMessage]);

  const handleStockStatusChange = useCallback((productId: string, status: "done" | "cancelled") => {
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
  }, [stockAdjustments, products, updateProductStock]);

  return {
    stockAdjustments,
    isSubmitting,
    handleStockChange,
    handleStockStatusChange
  };
}