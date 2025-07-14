import { NextResponse } from "next/server";
import { verifyToken, markUserAsVerified } from "@/lib/email";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token is required" },
        { status: 400 }
      );
    }

    // Verify the token
    const verificationResult = await verifyToken(token);

    if (!verificationResult.success) {
      return NextResponse.json(
        { success: false, message: verificationResult.message },
        { status: 400 }
      );
    }

    // Check if email exists in the verification result
    if (!verificationResult.email) {
      return NextResponse.json(
        { success: false, message: "Invalid verification data" },
        { status: 400 }
      );
    }

    // Mark the user as verified
    const markResult = await markUserAsVerified(verificationResult.email);

    if (!markResult.success) {
      return NextResponse.json(
        { success: false, message: "Failed to verify email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
} 