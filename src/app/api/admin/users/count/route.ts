import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total users
    const totalUsers = await db.user.count();

    // Get role counts
    const roleCounts = await db.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    });

    const adminUsers = roleCounts.find((r) => r.role === "ADMIN")?._count.role || 0;
    const customerUsers = roleCounts.find((r) => r.role === "CUSTOMER")?._count.role || 0;

    // Get verified users count
    const verifiedUsers = await db.user.count({
      where: {
        AND: [
          { isVerified: true },
          { emailVerified: { not: null } },
        ],
      },
    });

    // Get new users this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newUsersThisMonth = await db.user.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    return NextResponse.json({
      totalUsers,
      adminUsers,
      customerUsers,
      verifiedUsers,
      newUsersThisMonth,
    });
  } catch (error) {
    console.error("Error fetching user counts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}