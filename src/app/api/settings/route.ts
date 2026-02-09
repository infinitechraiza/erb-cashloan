// app/api/users/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get token from HTTP-only cookie
    const cookieStore = await cookies()
    let token = cookieStore.get('token')?.value;

    // If no token in cookies, try Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }

    const laravelUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const response = await fetch(`${laravelUrl}/api/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}