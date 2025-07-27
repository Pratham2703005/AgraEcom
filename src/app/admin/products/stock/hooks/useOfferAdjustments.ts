import { useState, useCallback, useMemo } from "react";
import { OfferAdjustment, Product, Message } from "../types";
import { validateAllOffers } from "../validation";
import { calculateDiscountFromPrice } from "../utils";

export function useOfferAdjustments(
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setMessage: React.Dispatch<React.SetStateAction<Message>>
) {
  const [offerAdjustments, setOfferAdjustments] = useState<Record<string, OfferAdjustment>>({});
  const [editingOffers, setEditingOffers] = useState<string | null>(null);
  const [updatingOffers, setUpdatingOffers] = useState<Record<string, boolean>>({});

  const toggleEditOffers = useCallback((productId: string | null) => {
    setEditingOffers(productId);

    // If we're starting to edit a product's offers, initialize the adjustment
    if (productId && !offerAdjustments[productId]) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setOfferAdjustments((prev) => ({
          ...prev,
          [productId]: {
            productId,
            offers: { ...(product.offers as Record<string, number>) },
            status: "pending"
          }
        }));
      }
    }
  }, [offerAdjustments, products]);

  const handleQuantityChange = useCallback((productId: string, oldQuantity: string, newQuantityStr: string) => {
    // Allow empty string for better UX while typing
    if (newQuantityStr === "") {
      // Store empty state temporarily - we'll handle this in the UI
      setOfferAdjustments((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          tempQuantityEdit: { oldQuantity, newValue: "" }
        }
      }));
      return;
    }

    const newQuantity = parseInt(newQuantityStr, 10);
    if (isNaN(newQuantity) || newQuantity < 1) return;

    setOfferAdjustments((prev) => {
      const currentOffers = { ...(prev[productId]?.offers || {}) };
      const currentDiscount = currentOffers[oldQuantity];

      // Remove the old quantity entry
      delete currentOffers[oldQuantity];

      // Add the new quantity entry with the same discount
      currentOffers[newQuantity.toString()] = currentDiscount;

      // Clear temp edit state
      const newState = {
        ...prev,
        [productId]: {
          productId,
          offers: currentOffers,
          status: prev[productId]?.status || "pending"
        }
      };
      if ('tempQuantityEdit' in newState[productId]) {
        delete (newState[productId] as OfferAdjustment).tempQuantityEdit;
      }

      return newState;
    });
  }, []);

  const handleOfferChange = useCallback((productId: string, quantity: string, discount: string) => {
    // Allow empty string for better UX while typing
    if (discount === "") {
      // Store empty state temporarily
      setOfferAdjustments((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          tempDiscountEdit: { quantity, newValue: "" }
        }
      }));
      return;
    }

    const discountValue = parseFloat(discount);
    // Remove restrictions - allow any value during editing
    if (isNaN(discountValue)) return;

    // Limit to 2 decimal places
    const formattedDiscount = Math.round(discountValue * 100) / 100;

    setOfferAdjustments((prev) => {
      const currentOffers = prev[productId]?.offers || {};
      
      // Clear temp edit states
      const newState = {
        ...prev,
        [productId]: {
          productId,
          offers: {
            ...currentOffers,
            [quantity]: formattedDiscount
          },
          status: prev[productId]?.status || "pending"
        }
      };
      if ('tempDiscountEdit' in newState[productId]) {
        delete (newState[productId] as OfferAdjustment).tempDiscountEdit;
      }
      if ('tempPriceEdit' in newState[productId]) {
        delete (newState[productId] as OfferAdjustment).tempPriceEdit;
      }

      return newState;
    });
  }, []);

  const handlePriceChange = useCallback((productId: string, quantity: string, price: string) => {
    // Allow empty string for better UX while typing
    if (price === "") {
      // Store empty state temporarily
      setOfferAdjustments((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          tempPriceEdit: { quantity, newValue: "" }
        }
      }));
      return;
    }

    const priceValue = parseFloat(price);
    // Remove restrictions - allow any value during editing
    if (isNaN(priceValue)) return;

    // Limit to 2 decimal places
    const formattedPrice = Math.round(priceValue * 100) / 100;

    // Find the product to get MRP
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Calculate discount from price
    const discount = calculateDiscountFromPrice(product.mrp, formattedPrice);
    const formattedDiscount = Math.round(discount * 100) / 100;

    setOfferAdjustments((prev) => {
      const currentOffers = prev[productId]?.offers || {};
      
      // Clear temp edit states
      const newState = {
        ...prev,
        [productId]: {
          productId,
          offers: {
            ...currentOffers,
            [quantity]: formattedDiscount
          },
          status: prev[productId]?.status || "pending"
        }
      };
      if ('tempDiscountEdit' in newState[productId]) {
        delete (newState[productId] as OfferAdjustment).tempDiscountEdit;
      }
      if ('tempPriceEdit' in newState[productId]) {
        delete (newState[productId] as OfferAdjustment).tempPriceEdit;
      }

      return newState;
    });
  }, [products]);

  const handleAddOffer = useCallback((productId: string) => {
    const adjustment = offerAdjustments[productId];
    if (!adjustment) {
      // Initialize adjustment if it doesn't exist
      const product = products.find(p => p.id === productId);
      if (product) {
        setOfferAdjustments((prev) => ({
          ...prev,
          [productId]: {
            productId,
            offers: { ...(product.offers as Record<string, number>) },
            status: "pending"
          }
        }));
        return;
      }
    }

    // Find a new quantity that doesn't already exist
    const existingQuantities = Object.keys(adjustment.offers).map(Number).sort((a, b) => a - b);
    const newQuantity = existingQuantities.length > 0 ? (existingQuantities[existingQuantities.length - 1] + 1).toString() : "2";

    setOfferAdjustments((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        offers: {
          ...prev[productId].offers,
          [newQuantity]: 0
        }
      }
    }));
  }, [offerAdjustments, products]);

  const handleRemoveOffer = useCallback((productId: string, quantity: string) => {
    // Don't allow removing the base offer (quantity 1)
    if (quantity === "1") return;

    setOfferAdjustments((prev) => {
      const currentOffers = { ...prev[productId].offers };
      delete currentOffers[quantity];
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          offers: currentOffers
        }
      };
    });
  }, []);

  const updateProductOffers = useCallback(async (productId: string, offers: Record<string, number>) => {
    setUpdatingOffers(prev => ({ ...prev, [productId]: true }));
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`/api/admin/product/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ offers }),
      });

      if (!response.ok) {
        throw new Error("Failed to update offers");
      }

      // Update local state
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === productId ? { ...p, offers } : p
        )
      );

      // Update adjustments
      setOfferAdjustments((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          status: "done",
        },
      }));

      setMessage({ type: "success", text: "Offers updated successfully" });
    } catch (error) {
      console.error("Error updating offers:", error);
      setMessage({ type: "error", text: "Failed to update offers" });

      // Mark as cancelled on error
      setOfferAdjustments((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          status: "cancelled",
        },
      }));
    } finally {
      setUpdatingOffers(prev => ({ ...prev, [productId]: false }));
    }
  }, [setProducts, setMessage]);

  const validateOffers = useCallback((productId: string): boolean => {
    const adjustment = offerAdjustments[productId];
    const product = products.find(p => p.id === productId);
    if (!adjustment || !product) return false;

    const validationErrors = validateAllOffers(adjustment.offers, product.mrp);
    
    setOfferAdjustments((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        validationErrors
      }
    }));

    return Object.keys(validationErrors).length === 0;
  }, [offerAdjustments, products]);

  const handleOfferStatusChange = useCallback((productId: string, status: "done" | "cancelled") => {
    const adjustment = offerAdjustments[productId];
    if (!adjustment) return;

    if (status === "done") {
      // Validate before saving
      if (validateOffers(productId)) {
        updateProductOffers(productId, adjustment.offers);
      } else {
        setMessage({ type: "error", text: "Please fix validation errors before saving" });
        return;
      }
    } else {
      // If cancelled, reset to original offers
      const currentProduct = products.find(p => p.id === productId);
      if (currentProduct) {
        setOfferAdjustments((prev) => ({
          ...prev,
          [productId]: {
            ...prev[productId],
            offers: { ...(currentProduct.offers as Record<string, number>) },
            status: "cancelled",
            validationErrors: undefined
          }
        }));
      }
    }

    // Exit edit mode
    setEditingOffers(null);
  }, [offerAdjustments, products, updateProductOffers, validateOffers, setMessage]);

  // Memoize the return object to prevent unnecessary re-renders
  const memoizedReturn = useMemo(() => ({
    offerAdjustments,
    editingOffers,
    updatingOffers,
    toggleEditOffers,
    handleQuantityChange,
    handleOfferChange,
    handlePriceChange,
    handleAddOffer,
    handleRemoveOffer,
    handleOfferStatusChange,
    validateOffers
  }), [
    offerAdjustments,
    editingOffers,
    updatingOffers,
    toggleEditOffers,
    handleQuantityChange,
    handleOfferChange,
    handlePriceChange,
    handleAddOffer,
    handleRemoveOffer,
    handleOfferStatusChange,
    validateOffers
  ]);

  return memoizedReturn;
}