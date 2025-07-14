import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { db } from "@/lib/db";
import { z } from "zod";
import { sendVerificationEmail } from "@/lib/email";

// Validation schema for registration
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate the request body
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input data", errors: result.error.errors },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(password, 10);

    // Create the user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: null, // Ensure email is not verified yet
      },
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, name);
    
    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      // We continue even if email sending fails, but log the error
    }

    // Create a new object without the password
    const { id, name: userName, email: userEmail, role, createdAt, updatedAt } = user;
    const userWithoutPassword = { id, name: userName, email: userEmail, role, createdAt, updatedAt };
    
    return NextResponse.json(
      { 
        message: "User registered successfully. Please check your email to verify your account.", 
        user: userWithoutPassword,
        emailSent: emailResult.success
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
} 