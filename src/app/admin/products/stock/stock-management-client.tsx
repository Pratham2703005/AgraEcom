"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Search, CheckCircle, XCircle, ChevronDown, ChevronUp, PlusCircle, Trash2, Edit } from "lucide-react";
import { formatProductName } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Prisma } from "@prisma/client";

type Brand = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
};

// Define Product type
type Product = {
  id: string;
  name: string;
  brand?: Brand | null;
  weight: string | null;
  images: string[];
  mrp: number;
  offers: Prisma.JsonValue;
  piecesLeft: number | null;
};

type StockAdjustment = {
  productId: string;
  newStock: number;
  status: "pending" | "done" | "cancelled";
};

type OfferAdjustment = {
  productId: string;
  offers: Record<string, number>;
  status: "pending" | "done" | "cancelled";
};

// Product skeleton component for loading state
const ProductSkeleton = () => (
  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg mb-3 animate-pulse bg-white dark:bg-neutral-800">
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
      <div className="flex-1">
        <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
      </div>
      <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
    </div>
  </div>
);

export default function StockManagementClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts);
  const [stockAdjustments, setStockAdjustments] = useState<Record<string, StockAdjustment>>({});
  const [offerAdjustments, setOfferAdjustments] = useState<Record<string, OfferAdjustment>>({});
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [editingOffers, setEditingOffers] = useState<string | null>(null);
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

  // Stock change handling
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

  const handleStockStatusChange = (productId: string, status: "done" | "cancelled") => {
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

  // Offers handling
  const toggleEditOffers = (productId: string | null) => {
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
  };
  
  const handleQuantityChange = (productId: string, oldQuantity: string, newQuantityStr: string) => {
    const newQuantity = parseInt(newQuantityStr, 10);
    if (isNaN(newQuantity) || newQuantity < 1) return;
    
    setOfferAdjustments((prev) => {
      const currentOffers = { ...(prev[productId]?.offers || {}) };
      const currentDiscount = currentOffers[oldQuantity];
      
      // Remove the old quantity entry
      delete currentOffers[oldQuantity];
      
      // Add the new quantity entry with the same discount
      currentOffers[newQuantity.toString()] = currentDiscount;
      
      return {
        ...prev,
        [productId]: {
          productId,
          offers: currentOffers,
          status: prev[productId]?.status || "pending"
        }
      };
    });
  };
  
  const handleOfferChange = (productId: string, quantity: string, discount: string) => {
    const discountValue = parseFloat(discount);
    if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) return;
    
    setOfferAdjustments((prev) => {
      const currentOffers = prev[productId]?.offers || {};
      return {
        ...prev,
        [productId]: {
          productId,
          offers: {
            ...currentOffers,
            [quantity]: discountValue
          },
          status: prev[productId]?.status || "pending"
        }
      };
    });
  };
  
  const handleAddOffer = (productId: string) => {
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
  };
  
  const handleRemoveOffer = (productId: string, quantity: string) => {
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
  };
  
  const handleOfferStatusChange = (productId: string, status: "done" | "cancelled") => {
    const adjustment = offerAdjustments[productId];
    if (!adjustment) return;
    
    if (status === "done") {
      updateProductOffers(productId, adjustment.offers);
    } else {
      // If cancelled, reset to original offers
      const currentProduct = products.find(p => p.id === productId);
      if (currentProduct) {
        setOfferAdjustments((prev) => ({
          ...prev,
          [productId]: {
            ...prev[productId],
                offers: { ...(currentProduct.offers as Record<string, number>) },
                status: "cancelled"
          }
        }));
      }
    }
    
    // Exit edit mode
    setEditingOffers(null);
  };

  // API calls
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
  
  const updateProductOffers = async (productId: string, offers: Record<string, number>) => {
    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  };

  // Helper function to calculate discount price
  const calculatePrice = (mrp: number, discount: number) => {
    return mrp * (1 - discount / 100);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 shadow-sm">
      {/* Search and Message Bar */}
      <div className="p-4 border-b dark:border-neutral-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
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

      {/* Products Accordion List */}
      <div className="p-4">
        {displayedProducts.length > 0 ? (
          <div className="space-y-3">
            {displayedProducts.map((product, index) => {
              const isLast = index === displayedProducts.length - 1;
              const isExpanded = expandedProduct === product.id;
              const stockAdjustment = stockAdjustments[product.id];
              const offerAdjustment = offerAdjustments[product.id];
              const isEditingOffers = editingOffers === product.id;
              const productOffers = isEditingOffers && offerAdjustment 
                ? offerAdjustment.offers 
                : product.offers;
              
              return (
                <div
                  key={product.id}
                  ref={isLast ? lastProductElementRef : undefined}
                  className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-800"
                >
                  {/* Accordion Header */}
                  <div
                    className="p-4 flex items-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                  >
                    <div className="flex items-center flex-1 gap-4">
                      <div className="relative h-16 w-16">
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={product.images[0]}
                            alt={formatProductName(product)}
                            fill
                            sizes="64px"
                            className="object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-md flex items-center justify-center">
                            <span className="text-neutral-400 dark:text-neutral-500">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
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
                    <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Stock Management Section */}
                        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm">
                          <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-4">Stock Management</h4>
                          
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
                                onChange={(e) => handleStockChange(product.id, e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md dark:bg-neutral-700 dark:text-white ${
                                  stockAdjustment?.status === "done"
                                    ? "border-green-500 dark:border-green-600" 
                                    : stockAdjustment?.status === "cancelled"
                                      ? "border-red-500 dark:border-red-600"
                                      : "border-neutral-300 dark:border-neutral-600"
                                }`}
                                disabled={stockAdjustment?.status === "done" || stockAdjustment?.status === "cancelled" || isSubmitting}
                              />
                            </div>
                          </div>
                          
                          {stockAdjustment && stockAdjustment.newStock !== product.piecesLeft && stockAdjustment.status === "pending" && (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleStockStatusChange(product.id, "done")}
                                disabled={isSubmitting}
                                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center gap-1 disabled:opacity-50"
                              >
                                <CheckCircle size={16} />
                                Update
                              </button>
                              <button
                                onClick={() => handleStockStatusChange(product.id, "cancelled")}
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
                        
                        {/* Offers Management Section */}
                        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Quantity Offers</h4>
                            
                            {!isEditingOffers ? (
                              <button
                                onClick={() => toggleEditOffers(product.id)}
                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center gap-1"
                              >
                                <Edit size={16} />
                                Edit Offers
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAddOffer(product.id)}
                                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center gap-1"
                                disabled={isSubmitting}
                              >
                                <PlusCircle size={16} />
                                Add Offer
                              </button>
                            )}
                          </div>
                          
                          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {Object.entries(productOffers || {})
                              .sort(([a], [b]) => parseInt(a) - parseInt(b))
                              .map(([quantity, discount]) => (
                                <div key={`${product.id}-${quantity}`} className="flex items-center gap-3">
                                  <div className="px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-md min-w-[80px] text-center">
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Quantity</div>
                                    {isEditingOffers && quantity !== "1" ? (
                                      <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => handleQuantityChange(product.id, quantity, e.target.value)}
                                        className="w-full text-center bg-white dark:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 rounded py-0 text-sm"
                                        disabled={isSubmitting}
                                      />
                                    ) : (
                                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                        {quantity}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-md min-w-[80px] text-center">
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Discount</div>
                                    {isEditingOffers ? (
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={discount}
                                        onChange={(e) => handleOfferChange(product.id, quantity, e.target.value)}
                                        className="w-full text-center bg-white dark:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 rounded py-0 text-sm"
                                        disabled={isSubmitting}
                                      />
                                    ) : (
                                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                        {discount}%
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="px-3 py-2 bg-neutral-100 dark:bg-neutral-700 rounded-md flex-1">
                                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Price</div>
                                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                      ₹{calculatePrice(product.mrp, discount).toFixed(2)}
                                    </div>
                                  </div>
                                  
                                  {isEditingOffers && quantity !== "1" && (
                                    <button
                                      onClick={() => handleRemoveOffer(product.id, quantity)}
                                      className="p-1 text-red-500 hover:text-red-700"
                                      title="Remove Offer"
                                      disabled={isSubmitting}
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  )}
                                </div>
                              ))}
                          </div>
                          
                          {isEditingOffers && (
                            <div className="mt-4 flex justify-end space-x-2">
                              <button
                                onClick={() => handleOfferStatusChange(product.id, "done")}
                                disabled={isSubmitting}
                                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center gap-1 disabled:opacity-50"
                              >
                                <CheckCircle size={16} />
                                Save Offers
                              </button>
                              <button
                                onClick={() => handleOfferStatusChange(product.id, "cancelled")}
                                disabled={isSubmitting}
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
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500 dark:text-neutral-400">No products found matching your search.</p>
          </div>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProductSkeleton key={`loading-more-${index}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}