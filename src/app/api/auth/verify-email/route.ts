import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';

// Store verification codes temporarily (in production, use Redis or database)
const globalForVerification = globalThis as unknown as {
  verificationCodes: Map<string, { code: string; expires: Date }>;
};

if (!globalForVerification.verificationCodes) {
  globalForVerification.verificationCodes = new Map();
}

const verificationCodes = globalForVerification.verificationCodes;

// POST - Send verification code
export async function POST(request: NextRequest) {
  try {
    const { email, action } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (action === 'send') {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store the code
      verificationCodes.set(email, { code, expires });

      // Send verification email
      const emailSent = await sendVerificationEmail(email, code);

      if (!emailSent) {
        console.error(`[Verification] Failed to send email to ${email}`);
        return NextResponse.json(
          { error: 'Failed to send verification email. Please try again.' },
          { status: 500 }
        );
      }

      console.log(`[Verification] Email sent successfully to ${email}`);

      return NextResponse.json({
        success: true,
        message: 'Verification code sent to your email',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

// PUT - Verify code
export async function PUT(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    const stored = verificationCodes.get(email);

    if (!stored) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 400 }
      );
    }

    if (new Date() > stored.expires) {
      verificationCodes.delete(email);
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (stored.code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Code is valid - remove it
    verificationCodes.delete(email);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Code verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
