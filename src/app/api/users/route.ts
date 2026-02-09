import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

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

    const { searchParams } = new URL(request.url);

    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '10';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sort_by') || '';
    const sortOrder = searchParams.get('sort_order') || '';

    // Build query params
    const params = new URLSearchParams({
      page,
      per_page: perPage,
    });

    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);
    if (sortBy && sortOrder) {
      params.append('sort_by', sortBy);
      params.append('sort_order', sortOrder);
    }

    const url = `${laravelUrl}/api/users?${params.toString()}`;

    // ✅ Server-side logs (check your terminal)
    console.log('🔍 [API] Fetching from Laravel:', url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      cache: 'no-store', // Prevent caching
    });

    if (!response.ok) {
      console.error('Laravel API error:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { success: false, message: errorData.message || "Failed to fetch users" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ [API] Response from Laravel:', JSON.stringify(data, null, 2));

    return NextResponse.json(data);

  } catch (error) {
    console.error("Error in Next.js API route:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching users" },
      { status: 500 }
    );
  }
}