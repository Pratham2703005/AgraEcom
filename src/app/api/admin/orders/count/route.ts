import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You don't have permission to access this resource" },
        { status: 403 }
      );
    }

    // Count orders by status
    const pendingCount = await db.order.count({
      where: { status: "PENDING" }
    });

    const shippedCount = await db.order.count({
      where: { status: "SHIPPED" }
    });

    const deliveredCount = await db.order.count({
      where: { 
        OR: [
          { status: "DELIVERED" },
          { status: "PARTIAL" }
        ]
      }
    });

    const cancelledCount = await db.order.count({
      where: { 
        OR: [
          { status: "CANCELLED" },
          { status: "FAILED" }
        ]
      }
    });

    return NextResponse.json({
      pending: pendingCount,
      shipped: shippedCount,
      delivered: deliveredCount,
      cancelled: cancelledCount
    });
  } catch (error) {
    console.error("Error fetching order counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch order counts" },
      { status: 500 }
    );
  }
} 