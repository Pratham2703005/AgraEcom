import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = (await params).id;

    // Check if order exists and belongs to the user
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

    // Check if order can be cancelled
    if (order.status !== "PENDING" && order.status !== "SHIPPED") {
      return NextResponse.json(
        { error: "Order cannot be cancelled in its current state" },
        { status: 400 }
      );
    }

    // Additional check for delivered orders with OTP verification
    if (order.otpVerified) {
      return NextResponse.json(
        { error: "Order has been delivered and verified, it cannot be cancelled" },
        { status: 400 }
      );
    }

    // Execute the cancellation in a transaction
    await db.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      // Restore product stock
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
    });

    return NextResponse.json(
      { message: "Order cancelled successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel order" },
      { status: 500 }
    );
  }
} 