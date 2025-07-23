import { Prisma } from "@prisma/client";

export type Brand = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
};

export type Product = {
  id: string;
  name: string;
  brand?: Brand | null;
  weight: string | null;
  images: string[];
  mrp: number;
  offers: Prisma.JsonValue;
  piecesLeft: number | null;
};

export type StockAdjustment = {
  productId: string;
  newStock: number;
  status: "pending" | "done" | "cancelled";
};

export type OfferAdjustment = {
  productId: string;
  offers: Record<string, number>;
  status: "pending" | "done" | "cancelled";
  tempQuantityEdit?: { oldQuantity: string; newValue: string };
  tempDiscountEdit?: { quantity: string; newValue: string };
};

export type Message = {
  type: "success" | "error" | "";
  text: string;
};

export type SearchParams = {
  query?: string;
  page?: number;
  limit?: number;
};