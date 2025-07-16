import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for status update
const statusUpdateSchema = z.object({
  status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "CANCELLED", "FAILED", "PARTIAL"]),
});

export async function POST(
  request: NextRequest,
  {params}: { params: Promise<{ id: string }> }
) {
  try {
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

    const orderId = (await params).id;
    const body = await request.json();

    // Validate request body
    const result = statusUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 }
      );
    }

    const { status } = result.data;

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

    // Prevent marking as DELIVERED without OTP verification
    if (status === "DELIVERED" && !order.otpVerified) {
      return NextResponse.json(
        { error: "OTP verification is required before marking as delivered" },
        { status: 400 }
      );
    }

    // Prevent changing status of orders that are already in a final state
    const finalStates = ["DELIVERED", "CANCELLED", "FAILED"];
    if (finalStates.includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot change status of an order that is already ${order.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    // Handle different status changes
    await db.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      // Handle stock adjustments based on status change
      if (
        (order.status === "PENDING" || order.status === "SHIPPED") &&
        (status === "CANCELLED" || status === "FAILED")
      ) {
        // Restore stock for cancelled/failed orders
        for (const item of order.orderItems) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (product && product.piecesLeft !== null) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                piecesLeft: product.piecesLeft + item.quantity,
              },
            });
          }
        }
      }
      
      // If status is being changed to DELIVERED directly (without OTP verification)
      // Only allow this for admin users and mark the order as OTP verified
      if (status === "DELIVERED" && !order.otpVerified) {
        await tx.order.update({
          where: { id: orderId },
          data: { otpVerified: true },
        });
      }
    });

    return NextResponse.json(
      { message: `Order status updated to ${status}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update order status" },
      { status: 500 }
    );
  }
} 