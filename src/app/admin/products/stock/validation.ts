import { z } from "zod";
import { OfferValidationError } from "./types";

export const offerValidationSchema = z.object({
  quantity: z.number()
    .min(1, "Quantity must be at least 1")
    .int("Quantity must be a whole number"),
  discount: z.number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%"),
  price: z.number()
    .min(0, "Price cannot be negative"),
});

export const offersValidationSchema = z.record(
  z.string(),
  z.number().min(0).max(100)
).refine((offers) => {
  // Check for duplicate quantities
  const quantities = Object.keys(offers).map(Number);
  const uniqueQuantities = new Set(quantities);
  return quantities.length === uniqueQuantities.size;
}, {
  message: "Duplicate quantities are not allowed"
}).refine((offers) => {
  // Check that discounts are in descending order (higher quantity = higher discount)
  const entries = Object.entries(offers)
    .map(([qty, discount]) => [Number(qty), discount] as [number, number])
    .sort(([a], [b]) => a - b);
  
  for (let i = 1; i < entries.length; i++) {
    if (entries[i][1] < entries[i - 1][1]) {
      return false;
    }
  }
  return true;
}, {
  message: "Higher quantities should have equal or higher discounts"
});



export function validateOffer(
  quantity: string,
  discount: string,
  price: string,
  mrp: number
): OfferValidationError[] {
  const errors: OfferValidationError[] = [];
  
  // Validate quantity
  const quantityNum = Number(quantity);
  if (quantity === "" || isNaN(quantityNum)) {
    errors.push({ field: 'quantity', message: 'Quantity is required' });
  } else if (quantityNum < 1) {
    errors.push({ field: 'quantity', message: 'Quantity must be at least 1' });
  } else if (!Number.isInteger(quantityNum)) {
    errors.push({ field: 'quantity', message: 'Quantity must be a whole number' });
  }
  
  // Validate discount
  const discountNum = Number(discount);
  if (discount === "" || isNaN(discountNum)) {
    errors.push({ field: 'discount', message: 'Discount is required' });
  } else if (discountNum < 0) {
    errors.push({ field: 'discount', message: 'Discount cannot be negative' });
  } else if (discountNum > 100) {
    errors.push({ field: 'discount', message: 'Discount cannot exceed 100%' });
  }
  
  // Validate price
  const priceNum = Number(price);
  if (price === "" || isNaN(priceNum)) {
    errors.push({ field: 'price', message: 'Price is required' });
  } else if (priceNum < 0) {
    errors.push({ field: 'price', message: 'Price cannot be negative' });
  } else if (priceNum > mrp) {
    errors.push({ field: 'price', message: 'Price cannot exceed MRP' });
  }
  
  // Cross-validation: check if discount and price are consistent
  if (!isNaN(discountNum) && !isNaN(priceNum) && discountNum >= 0 && discountNum <= 100) {
    const expectedPrice = mrp * (1 - discountNum / 100);
    const tolerance = 0.01; // Allow small rounding differences
    if (Math.abs(priceNum - expectedPrice) > tolerance) {
      errors.push({ 
        field: 'price', 
        message: `Price should be ₹${expectedPrice.toFixed(2)} for ${discountNum}% discount` 
      });
      errors.push({ 
        field: 'discount', 
        message: `Discount should be ${((1 - priceNum / mrp) * 100).toFixed(1)}% for ₹${priceNum} price` 
      });
    }
  }
  
  return errors;
}

export function validateAllOffers(
  offers: Record<string, number>,
  mrp: number
): Record<string, OfferValidationError[]> {
  const errors: Record<string, OfferValidationError[]> = {};
  
  // Validate individual offers
  Object.entries(offers).forEach(([quantity, discount]) => {
    const price = mrp * (1 - discount / 100);
    const offerErrors = validateOffer(quantity, discount.toString(), price.toString(), mrp);
    if (offerErrors.length > 0) {
      errors[quantity] = offerErrors;
    }
  });
  
  // Check for duplicate quantities (shouldn't happen but good to check)
  const quantities = Object.keys(offers).map(Number);
  const duplicates = quantities.filter((qty, index) => quantities.indexOf(qty) !== index);
  duplicates.forEach(qty => {
    const key = qty.toString();
    if (!errors[key]) errors[key] = [];
    errors[key].push({ field: 'quantity', message: 'Duplicate quantity' });
  });
  
  // Check discount progression (higher quantity should have equal or higher discount)
  const sortedEntries = Object.entries(offers)
    .map(([qty, discount]) => [Number(qty), discount] as [number, number])
    .sort(([a], [b]) => a - b);
  
  for (let i = 1; i < sortedEntries.length; i++) {
    const [currentQty, currentDiscount] = sortedEntries[i];
    const [prevQty, prevDiscount] = sortedEntries[i - 1];
    
    if (currentDiscount < prevDiscount) {
      const key = currentQty.toString();
      if (!errors[key]) errors[key] = [];
      errors[key].push({ 
        field: 'discount', 
        message: `Discount should be at least ${prevDiscount}% (same as quantity ${prevQty})` 
      });
    }
  }
  
  return errors;
}