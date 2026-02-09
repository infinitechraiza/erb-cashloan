import { NextRequest, NextResponse } from "next/server"
import { cookies } from 'next/headers';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

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

    const body = await request.json().catch(() => ({}))
    const url = `${laravelUrl}/api/payments/${id}/verify`

    console.log("[Verify Payment API] Verifying payment:", id)
    console.log("[Verify Payment API] Request body:", body)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      let errorMessage = "Failed to verify payment"
      try {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json()
          errorMessage = error.message || errorMessage
        } else {
          const text = await response.text()
          console.error("[Verify Payment API] Non-JSON error:", text.substring(0, 200))
          errorMessage = `Server error: ${response.statusText}`
        }
      } catch (e) {
        console.error("[Verify Payment API] Error parsing response:", e)
        errorMessage = `Server error: ${response.statusText}`
      }

      return NextResponse.json({ message: errorMessage }, { status: response.status })
    }

    const data = await response.json()
    console.log("[Verify Payment API] Payment verified successfully")

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[Verify Payment API] Error:", error)
    return NextResponse.json({ message: error instanceof Error ? error.message : "An error occurred" }, { status: 500 })
  }
}