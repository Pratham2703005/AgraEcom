import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Add cache control headers to prevent unnecessary refreshes
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, max-age=0'
          }
        }
      );
    }

    // Fetch the latest user data from the database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        phoneVerified: true,
        address: true,
        deliveryAddress: true,
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { 
          status: 404,
          headers: {
            'Cache-Control': 'no-store, max-age=0'
          }
        }
      );
    }
    
    // Return the latest user data with cache control headers
    return NextResponse.json(
      { user },
      {
        headers: {
          // Cache for 5 minutes to reduce database load
          'Cache-Control': 'private, max-age=300'
        }
      }
    );
  } catch (error) {
    // Only log the error message, not the full error object
    console.error("Session refresh error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { message: "Failed to refresh session" },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  }
} 