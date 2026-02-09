import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Try to get token from BOTH cookies AND Authorization header
    const cookieStore = await cookies();
    let token = cookieStore.get('token')?.value;
    
    // If no token in cookies, try Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated. Please log in again.' },
        { status: 401 }
      );
    }

    const laravelUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    const url = `${laravelUrl}/api/loans${queryString ? `?${queryString}` : ''}`;

    console.log('[Next.js] Fetching loans from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-Requested-With": "XMLHttpRequest",
      },
      cache: 'no-store',
    });

    console.log('[Next.js] Laravel response status:', response.status);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let error;

      if (contentType && contentType.includes('application/json')) {
        error = await response.json();
      } else {
        const text = await response.text();
        console.error('[Next.js] Non-JSON error response:', text);
        error = { message: 'Invalid response from server' };
      }

      console.error('[Next.js] Laravel error:', error);

      return NextResponse.json(
        { message: error.message || 'Failed to fetch loans' },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log('[Next.js] Laravel response structure:', {
      hasData: !!data.data,
      dataLength: data.data?.length || 0,
      total: data.total,
      keys: Object.keys(data)
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Next.js] Get loans error:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { message: 'Cannot connect to Laravel backend. Make sure it is running on the configured URL.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: 'An error occurred', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Try to get token from BOTH cookies AND Authorization header
    const cookieStore = await cookies();
    let token = cookieStore.get('token')?.value;
    
    // If no token in cookies, try Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '');
      }
    }

    console.log('[Next.js] POST - Token exists:', !!token);

    if (!token) {
      console.error('[Next.js] Invalid or missing token');
      return NextResponse.json(
        { message: 'Unauthorized - No valid token provided' },
        { status: 401 }
      );
    }

    console.log('[Next.js] Token length:', token.length);

    // Get FormData from request (this includes files)
    const formData = await request.formData();

    const laravelUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = `${laravelUrl}/api/loans`;

    console.log('[Next.js] Creating loan at:', url);
    console.log('[Next.js] FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    // Forward FormData directly to Laravel
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    console.log('[Next.js] Laravel response status:', response.status);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let error;

      if (contentType && contentType.includes('application/json')) {
        error = await response.json();
      } else {
        const text = await response.text();
        console.error('[Next.js] Non-JSON error response:', text);
        error = { message: 'Invalid response from server' };
      }

      console.error('[Next.js] Laravel error response:', error);
      return NextResponse.json(
        {
          message: error.message || 'Failed to create loan',
          errors: error.errors || {}
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Next.js] Loan created successfully');
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[Next.js] Create loan error:', error);

    if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { message: 'Cannot connect to Laravel backend. Make sure it is running on http://localhost:8000' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        message: 'An error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}