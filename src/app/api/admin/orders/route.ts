import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderStatus, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");
    const status = searchParams.get("status");

    // If an ID is provided, return that specific order
    if (orderId) {
      const order = await db.order.findUnique({
        where: {
          id: orderId,
        },
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

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      return NextResponse.json({ order });
    }

    // Build the query
    const whereClause: Prisma.OrderWhereInput = {};
    
    if (status) {
      // Handle special status filters
      switch(status.toLowerCase()) {
        case 'delivered':
          whereClause.OR = [
            { status: "DELIVERED" },
            { status: "PARTIAL" }
          ];
          break;
        case 'cancelled':
          whereClause.OR = [
            { status: "CANCELLED" },
            { status: "FAILED" }
          ];
          break;
        default:
          // Try to match with exact status if it's a valid OrderStatus
          const upperStatus = status.toUpperCase();
          if (Object.values(OrderStatus).includes(upperStatus as OrderStatus)) {
            whereClause.status = upperStatus as OrderStatus;
          }
      }
    }

    // Get all orders with pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const orders = await db.order.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalOrders = await db.order.count({
      where: whereClause,
    });

    return NextResponse.json({
      orders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        totalPages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
} 