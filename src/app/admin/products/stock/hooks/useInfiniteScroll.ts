import { useRef, useCallback } from "react";

export function useInfiniteScroll(
  loading: boolean,
  hasMore: boolean,
  debouncedSearchQuery: string,
  loadNextPage: () => void
) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastProductElementRef = useCallback((node: HTMLElement | null) => {
    if (loading || !hasMore || debouncedSearchQuery.trim()) {
      console.log(`Skipping observer setup - loading: ${loading}, hasMore: ${hasMore}, searching: ${!!debouncedSearchQuery.trim()}`);
      return; // Don't trigger during search
    }
    
    if (observer.current) observer.current.disconnect();
    
    console.log('Setting up intersection observer for infinite scroll');
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        console.log('Intersection detected - loading next page');
        loadNextPage();
      }
    }, { 
      threshold: 0.1,
      rootMargin: '100px'
    });
    
    if (node) {
      console.log('Observing last product element');
      observer.current.observe(node);
    }
  }, [loading, hasMore, debouncedSearchQuery, loadNextPage]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (observer.current) {
      observer.current.disconnect();
    }
  }, []);

  return {
    lastProductElementRef,
    cleanup
  };
}