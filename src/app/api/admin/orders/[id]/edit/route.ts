import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for order item edits
const orderEditSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().int().min(0)
    })
  )
});

export async function POST(
  request: NextRequest,
  {params}: { params: Promise<{ id: string }> }
) {
  try {
    const  id = (await params).id;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to perform this action" },
        { status: 403 }
      );
    }

    const orderId = id;
    const body = await request.json();

    // Validate request body
    const result = orderEditSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 }
      );
    }

    const { items } = result.data;

    // Get the order
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order is in PARTIAL status
    if (order.status !== "PARTIAL") {
      return NextResponse.json(
        { error: "Only orders with PARTIAL status can be edited" },
        { status: 400 }
      );
    }

    // Validate that all item IDs belong to this order
    const orderItemIds = new Set(order.orderItems.map(item => item.id));
    for (const item of items) {
      if (!orderItemIds.has(item.id)) {
        return NextResponse.json(
          { error: `Item with ID ${item.id} does not belong to this order` },
          { status: 400 }
        );
      }
    }

    // Execute the update in a transaction
    const updatedOrder = await db.$transaction(async (tx) => {
      // Update each order item
      for (const item of items) {
        const orderItem = order.orderItems.find(oi => oi.id === item.id);
        
        if (!orderItem) continue;
        
        // Skip if quantity hasn't changed
        if (orderItem.quantity === item.quantity) continue;
        
        // Update the order item
        await tx.orderItem.update({
          where: { id: item.id },
          data: { quantity: item.quantity },
        });
        
        // Handle stock adjustments
        const quantityDiff = orderItem.quantity - item.quantity;
        
        if (quantityDiff !== 0) {
          const product = await tx.product.findUnique({
            where: { id: orderItem.productId },
          });
          
          if (product && product.piecesLeft !== null) {
            // If reducing quantity, add back to stock
            // If increasing quantity, remove from stock
            await tx.product.update({
              where: { id: orderItem.productId },
              data: {
                piecesLeft: product.piecesLeft + quantityDiff,
              },
            });
          }
        }
      }
      
      // Calculate new total
      let newTotal = 0;
      for (const orderItem of order.orderItems) {
        const updatedItem = items.find(item => item.id === orderItem.id);
        const quantity = updatedItem ? updatedItem.quantity : orderItem.quantity;
        newTotal += orderItem.price * quantity;
      }
      
      // Update order total
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { total: newTotal },
        include: {
          orderItems: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      return updatedOrder;
    });

    return NextResponse.json(
      { message: "Order updated successfully", order: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update order" },
      { status: 500 }
    );
  }
} 