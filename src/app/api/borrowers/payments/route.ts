import { NextRequest, NextResponse } from "next/server"
import { cookies } from 'next/headers';

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

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated. Please log in again.' },
        { status: 401 }
      );
    }
    
    const laravelUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    // Get the FormData from the request
    const formData = await request.formData()

    console.log("[Borrower Payments API] Submitting payment:", {
      loan_id: formData.get('loan_id'),
      amount: formData.get('amount'),
      payment_number: formData.get('payment_number')
    })

    // Forward FormData to Laravel
    const response = await fetch(`${laravelUrl}/api/borrower/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - FormData will set it with boundary
      },
      body: formData,
    })

    console.log("[Borrower Payments API] Laravel response status:", response.status)

    const contentType = response.headers.get('content-type')

    if (!response.ok) {
      let errorMessage = "Failed to record payment"

      if (contentType && contentType.includes('application/json')) {
        const error = await response.json()
        console.error("[Borrower Payments API] Error:", error)
        errorMessage = error.message || errorMessage
        return NextResponse.json(error, { status: response.status })
      } else {
        const text = await response.text()
        console.error("[Borrower Payments API] Non-JSON error:", text.substring(0, 500))
        return NextResponse.json({
          message: errorMessage,
          error: "Server error"
        }, { status: response.status })
      }
    }

    const data = await response.json()
    console.log("[Borrower Payments API] Success:", data)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[Borrower Payments API] Exception:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}