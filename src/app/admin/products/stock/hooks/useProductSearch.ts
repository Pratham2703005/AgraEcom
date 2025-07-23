import { useState, useEffect, useCallback, useRef } from "react";
import { Product } from "../types";

export function useProductSearch() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const isLoadingRef = useRef(false);
  const loadedPagesRef = useRef(new Set<number>());
  const productsPerPage = 20;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load products from API with search support
  const loadProducts = useCallback(async (pageToLoad: number, searchTerm: string = "", isInitial: boolean = false) => {
    // Prevent duplicate loading
    if (isLoadingRef.current || (!searchTerm && loadedPagesRef.current.has(pageToLoad))) {
      console.log(`Skipping load for page ${pageToLoad} - already loading or loaded`);
      return;
    }
    
    console.log(`Loading products for page ${pageToLoad}, search: "${searchTerm}", isInitial: ${isInitial}`);
    
    isLoadingRef.current = true;
    setLoading(true);
    
    // Reset products if it's a new search or first page
    if (pageToLoad === 1 && !isInitial) {
      setProducts([]);
      loadedPagesRef.current.clear();
    }
    
    try {
      const params = new URLSearchParams({
        page: pageToLoad.toString(),
        limit: productsPerPage.toString(),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`/api/admin/product?${params}`);
      
      if (!response.ok) {
        throw new Error("Failed to load products");
      }
      
      const data = await response.json();
      const newProducts = data.products || [];
      const pagination = data.pagination || {};
      
      console.log(`Loaded ${newProducts.length} products for page ${pageToLoad}. Has more: ${pagination.hasMore}`);
      
      setHasMore(pagination.hasMore || false);
      
      if (newProducts.length === 0) {
        setHasMore(false);
        return;
      }
      
      if (!searchTerm) {
        loadedPagesRef.current.add(pageToLoad);
      }
      
      if (pageToLoad === 1) {
        setProducts(newProducts);
      } else {
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewProducts = newProducts.filter((p: Product) => !existingIds.has(p.id));
          
          if (uniqueNewProducts.length === 0) {
            setHasMore(false);
          }
          
          const updatedProducts = [...prev, ...uniqueNewProducts];
          console.log(`Total products after page ${pageToLoad}: ${updatedProducts.length}`);
          return updatedProducts;
        });
      }
    } catch (error) {
      console.error("Error loading products:", error);
      throw error;
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
      if (isInitial) {
        setIsInitialLoading(false);
      }
    }
  }, [productsPerPage]);

  // Handle search query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      // Reset pagination for search
      setPage(1);
      setHasMore(false); // Disable infinite scroll during search
      loadProducts(1, debouncedSearchQuery.trim());
    } else {
      // Reset to normal pagination when search is cleared
      setPage(1);
      setHasMore(true);
      loadedPagesRef.current.clear();
      loadProducts(1, "", false);
    }
  }, [debouncedSearchQuery, loadProducts]);

  // Initialize with products
  const initializeProducts = useCallback((initialProducts: Product[]) => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
      setHasMore(initialProducts.length >= productsPerPage);
      setIsInitialLoading(false);
      loadedPagesRef.current.add(1);
    } else if (initialProducts && initialProducts.length === 0) {
      setHasMore(false);
      setIsInitialLoading(false);
    } else {
      setIsInitialLoading(true);
      loadProducts(1, "", true);
    }
  }, [loadProducts, productsPerPage]);

  // Load next page
  const loadNextPage = useCallback(() => {
    if (!debouncedSearchQuery.trim() && hasMore && !loading && !isLoadingRef.current) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadProducts(nextPage, "");
    }
  }, [page, hasMore, loading, debouncedSearchQuery, loadProducts]);

  return {
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
  };
}