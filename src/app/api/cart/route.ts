import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CartItem } from "@prisma/client";

// GET handler to fetch the user's cart
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user's cart or create a new one if it doesn't exist
    const cart = await db.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: true,
      },
    });

    if (!cart) {
      return NextResponse.json({ cart: { items: [] } });
    }

    // Fetch product details for each cart item
    const cartItemsWithDetails = await Promise.all(
      cart.items.map(async (item: CartItem) => {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          include: {
            brand: true
          }
        });

        return {
          ...item,
          product,
        };
      })
    );

    return NextResponse.json({
      cart: {
        id: cart.id,
        items: cartItemsWithDetails,
      },
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST handler to add an item to the cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity } = await request.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Product ID and quantity are required" },
        { status: 400 }
      );
    }

    // Check if product exists and has sufficient stock
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (product.piecesLeft !== null && product.piecesLeft < quantity) {
      return NextResponse.json(
        { error: "Not enough stock available" },
        { status: 400 }
      );
    }

    // Find or create user's cart
    let cart = await db.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: true },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: {
          userId: session.user.id,
        },
        include: { items: true },
      });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find((item: CartItem) => item.productId === productId);

    if (existingItem) {
      const newTotalQuantity = existingItem.quantity + quantity;
      if (product.piecesLeft !== null && newTotalQuantity > product.piecesLeft) {
        return NextResponse.json(
          { error: `Items already exist in cart. Cannot add more than ${product.piecesLeft - existingItem.quantity} items to cart.`, availableStock: product.piecesLeft - existingItem.quantity },
          { status: 400 }
        );
      }
      // Update existing item
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newTotalQuantity },
      });
    } else {
      if (product.piecesLeft !== null && quantity > product.piecesLeft) {
        return NextResponse.json(
          { error: `Cannot add more than ${product.piecesLeft} items to cart.`, availableStock: product.piecesLeft },
          { status: 400 }
        );
      }
      // Add new item
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

// PUT handler to update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cartItemId, quantity } = await request.json();

    if (!cartItemId || !quantity) {
      return NextResponse.json(
        { error: "Cart item ID and quantity are required" },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      // If quantity is less than 1, remove the item
      await db.cartItem.delete({
        where: { id: cartItemId },
      });
      return NextResponse.json({ success: true, action: "removed" });
    }

    // Find the cart item
    const cartItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Verify the cart belongs to the user
    const cart = await db.cart.findFirst({
      where: {
        id: cartItem.cartId,
        userId: session.user.id,
      },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Unauthorized access to cart" },
        { status: 403 }
      );
    }

    // Check if product has enough stock
    const product = await db.product.findUnique({
      where: { id: cartItem.productId },
    });

    if (product && product.piecesLeft !== null && product.piecesLeft < quantity) {
      return NextResponse.json(
        { error: "Not enough stock available", availableStock: product.piecesLeft },
        { status: 400 }
      );
    }

    // Update the cart item quantity
    await db.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

// DELETE handler to remove an item from the cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get("id");

    if (!cartItemId) {
      return NextResponse.json(
        { error: "Cart item ID is required" },
        { status: 400 }
      );
    }

    // Find the cart item
    const cartItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Verify the cart belongs to the user
    const cart = await db.cart.findFirst({
      where: {
        id: cartItem.cartId,
        userId: session.user.id,
      },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Unauthorized access to cart" },
        { status: 403 }
      );
    }

    // Delete the cart item
    await db.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      { error: "Failed to remove cart item" },
      { status: 500 }
    );
  }
} 