import { Resend } from 'resend';
import { render } from '@react-email/render';
import { VerificationEmail } from '@/emails/verification-email';
import { db } from './db';
import { randomBytes } from 'crypto';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Function to generate a random token
export const generateToken = () => {
  return randomBytes(32).toString('hex');
};

// Function to create a verification token in the database
export const createVerificationToken = async (email: string) => {
  const token = generateToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  // Delete any existing tokens for this email
  await db.verificationToken.deleteMany({
    where: {
      identifier: email,
    },
  });

  // Create a new token
  const verificationToken = await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
};

// Function to verify a token
export const verifyToken = async (token: string) => {
  const verificationToken = await db.verificationToken.findUnique({
    where: {
      token,
    },
  });

  if (!verificationToken) {
    return { success: false, message: 'Invalid token' };
  }

  if (new Date(verificationToken.expires) < new Date()) {
    await db.verificationToken.delete({
      where: {
        id: verificationToken.id,
      },
    });
    return { success: false, message: 'Token expired' };
  }

  return { success: true, email: verificationToken.identifier };
};

// Function to send verification email
export const sendVerificationEmail = async (email: string, name: string) => {
  try {
    // Create a verification token
    const verificationToken = await createVerificationToken(email);
    
    // Generate verification link
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'https://agraecom.vercel.app';
    const verificationLink = `${baseUrl}/verify-email?token=${verificationToken.token}`;
    
    // Render the email template
    const emailHtml = render(
      VerificationEmail({
        verificationLink,
        username: name || 'User',
      })
    )

    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'Agra Ecom <onboarding@resend.dev>',
      to: email,
      // to:'pk2732004@gmail.com',
      subject: 'Verify your email address',
      html: await emailHtml,
    });

    console.log(data);
    if (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    return { success: false, error };
  }
};

// Function to mark a user as verified
export const markUserAsVerified = async (email: string) => {
  try {
    await db.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
        isVerified: true,
      },
    });

    // Delete the verification token
    await db.verificationToken.deleteMany({
      where: {
        identifier: email,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking user as verified:', error);
    return { success: false, error };
  }
}; 