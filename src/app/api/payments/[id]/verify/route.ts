import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const laravelUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const url = `${laravelUrl}/api/payments/${id}/verify`

    console.log("[Activate payment API] Verifying payments:", id)
    console.log("[Activate payment API] Verifying payments:", body)
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      let errorMessage = "Failed to activate payment"
      try {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json()
          errorMessage = error.message || errorMessage
        } else {
          const text = await response.text()
          console.error("[Activate payment API] Non-JSON error:", text.substring(0, 200))
          errorMessage = `Server error: ${response.statusText}`
        }
      } catch (e) {
        console.error("[Activate payment API] Error parsing response:", e)
        errorMessage = `Server error: ${response.statusText}`
      }

      return NextResponse.json({ message: errorMessage }, { status: response.status })
    }

    const data = await response.json()
    console.log("[Activate payment API] payment activated successfully")

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[Activate payment API] Error:", error)
    return NextResponse.json({ message: error instanceof Error ? error.message : "An error occurred" }, { status: 500 })
  }
}
