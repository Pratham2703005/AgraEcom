// Utility functions for price and discount calculations

export function calculatePriceFromDiscount(mrp: number, discount: number): number {
  return mrp * (1 - discount / 100);
}

export function calculateDiscountFromPrice(mrp: number, price: number): number {
  return ((mrp - price) / mrp) * 100;
}

export function formatPrice(price: number): string {
  // Remove trailing zeros and limit to 2 decimal places
  return parseFloat(price.toFixed(2)).toString();
}

export function formatDiscount(discount: number): string {
  // Remove trailing zeros and limit to 2 decimal places
  return parseFloat(discount.toFixed(2)).toString();
}

export function isValidNumber(value: string): boolean {
  return value !== "" && !isNaN(Number(value));
}

export function parseNumber(value: string): number {
  return isValidNumber(value) ? Number(value) : 0;
}

// Debounce function for real-time calculations
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}