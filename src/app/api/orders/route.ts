import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@prisma/client";

type Product = {
  id: string;
  name: string;
  mrp: number;
  offers: Prisma.JsonValue | null;
  images: string[];
  brand?: { id: string; name: string; slug: string; imageUrl: string } | null;
  weight?: string | null;
  piecesLeft?: number | null;
};

// Type guard to check if offers is a valid Record<string, number>
function isValidOffers(offers: Prisma.JsonValue | null): offers is Record<string, number> {
  return (
    offers !== null &&
    typeof offers === 'object' &&
    !Array.isArray(offers) &&
    Object.values(offers).every(value => typeof value === 'number')
  );
}

// Function to generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validation schema for order creation
const orderSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(5, "Delivery address is required"),
  note: z.string().optional(),
});

// GET handler to fetch all orders for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");

    // If an ID is provided, return that specific order
    if (orderId) {
      const order = await db.order.findUnique({
        where: {
          id: orderId,
          userId: session.user.id,
        },
        include: {
          orderItems: true,
        },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      return NextResponse.json({ order });
    }

    // Otherwise return all orders for the user
    const orders = await db.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST handler to create a new order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate request body
    const result = orderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 }
      );
    }

    const { phone, address, note } = result.data;

    // Get user's cart
    const cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: true,
      },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Fetch product details and verify stock
    const cartItemsWithProducts = await Promise.all(
      cart.items.map(async (item) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.piecesLeft !== null && product.piecesLeft < item.quantity) {
          throw new Error(`Not enough stock for ${product.name}. Available: ${product.piecesLeft}`);
        }

        return {
          cartItem: item,
          product,
        };
      })
    );

    // Helper function to calculate price with offers based on quantity
    const calculatePriceWithOffers = (product: Product, quantity: number): number => {
      if (!product || !product.offers) return product.mrp;
      
      // Check if offers is valid and convert to Record<string, number>
      let offers: Record<string, number>;
      
      if (isValidOffers(product.offers)) {
        offers = product.offers;
      } else if (typeof product.offers === 'string') {
        try {
          const parsed = JSON.parse(product.offers);
          if (isValidOffers(parsed)) {
            offers = parsed;
          } else {
            return product.mrp;
          }
        } catch {
          return product.mrp;
        }
      } else {
        return product.mrp;
      }
      
      // Get all available quantity thresholds
      const quantities = Object.keys(offers)
        .map(Number)
        .sort((a, b) => a - b);
      
      // Find the highest applicable discount for this quantity
      let applicableOffer = "1"; // Default to offer for quantity 1
      for (const q of quantities) {
        if (quantity >= q) {
          applicableOffer = q.toString();
        } else {
          break;
        }
      }
      
      const discountPercent = offers[applicableOffer] || 0;
      return product.mrp * (1 - discountPercent / 100);
    };

    // Calculate total
    const total = cartItemsWithProducts.reduce(
      (sum, { cartItem, product }) => sum + calculatePriceWithOffers(product, cartItem.quantity) * cartItem.quantity,
      0
    );

    // Create the order
    const order = await db.$transaction(async (tx) => {
      // Generate a 6-digit OTP
      const otp = generateOTP();

      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          total,
          phone,
          address,
          note,
          otp,
          otpVerified: false,
          status: "PENDING",
          orderItems: {
            create: cartItemsWithProducts.map(({ cartItem, product }) => ({
              productId: product.id,
              name: product.name,
              price: calculatePriceWithOffers(product, cartItem.quantity),
              quantity: cartItem.quantity,
              image: product.images[0] || null,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      // Update product stock
      for (const { cartItem, product } of cartItemsWithProducts) {
        if (product.piecesLeft !== null) {
          await tx.product.update({
            where: { id: product.id },
            data: {
              piecesLeft: product.piecesLeft - cartItem.quantity,
            },
          });
        }
      }

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return newOrder;
    });

    return NextResponse.json(
      { message: "Order created successfully", order },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 }
    );
  }
}