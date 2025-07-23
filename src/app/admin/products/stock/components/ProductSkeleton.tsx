export const ProductSkeleton = () => (
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