import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const laravelUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const response = await fetch(`${laravelUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || 'Logout failed' },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('[v0] Logout error:', error);
    return NextResponse.json(
      { message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
