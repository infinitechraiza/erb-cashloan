import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const laravelUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const response = await fetch(`${laravelUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || 'Login failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        message: 'Login successful',
        token: data.token,
        user: data.user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
