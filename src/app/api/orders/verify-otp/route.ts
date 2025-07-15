import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for OTP verification
const otpVerificationSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const result = otpVerificationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 }
      );
    }

    const { orderId, otp } = result.data;

    // Find the order
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if the order belongs to the user (for customer verification)
    // Or if the user is an admin (for delivery person verification)
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = order.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "You don't have permission to verify this order" },
        { status: 403 }
      );
    }

    // Check if OTP is already verified
    if (order.otpVerified) {
      return NextResponse.json(
        { error: "OTP already verified for this order" },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (order.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Update order - mark OTP as verified and update status to DELIVERED
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        otpVerified: true,
        status: "DELIVERED",
      },
    });

    return NextResponse.json(
      { message: "OTP verified successfully", order: updatedOrder },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify OTP" },
      { status: 500 }
    );
  }
} 