import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }) {
    try {

        // Await params in Next.js 15+
        const params = await context.params
        const { id } = params

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

        const url = `${laravelUrl}/api/loans/${id}/documents`;

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