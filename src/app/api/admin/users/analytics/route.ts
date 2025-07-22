import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current date and first day of current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get total users
    const totalUsers = await db.user.count();

    // Get new users this month
    const newUsersThisMonth = await db.user.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    // Get verified and unverified users
    const verifiedUsers = await db.user.count({
      where: {
        AND: [
          { isVerified: true },
          { emailVerified: { not: null } },
        ],
      },
    });

    const unverifiedUsers = totalUsers - verifiedUsers;

    // Get role counts
    const roleCounts = await db.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    });

    const adminUsers = roleCounts.find((r) => r.role === "ADMIN")?._count.role || 0;
    const customerUsers = roleCounts.find((r) => r.role === "CUSTOMER")?._count.role || 0;

    // Get users with and without orders
    const usersWithOrders = await db.user.count({
      where: {
        orders: {
          some: {},
        },
      },
    });

    const usersWithoutOrders = totalUsers - usersWithOrders;

    // Get monthly growth for the last 6 months
    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const count = await db.user.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      monthlyGrowth.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        count,
      });
    }

    // Get recent users (last 10)
    const recentUsers = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isVerified: true,
        emailVerified: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Format recent users
    const formattedRecentUsers = recentUsers.map((user) => ({
      ...user,
      isVerified: user.isVerified && user.emailVerified !== null,
      createdAt: user.createdAt.toISOString(),
    }));

    return NextResponse.json({
      totalUsers,
      newUsersThisMonth,
      verifiedUsers,
      unverifiedUsers,
      adminUsers,
      customerUsers,
      usersWithOrders,
      usersWithoutOrders,
      monthlyGrowth,
      recentUsers: formattedRecentUsers,
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}