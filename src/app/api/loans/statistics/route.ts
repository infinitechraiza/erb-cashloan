import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const laravelUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    const response = await fetch(`${laravelUrl}/api/loans/statistics/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    const responseText = await response.text()

    if (!response.ok) {
      let errorMessage = "Failed to fetch statistics"
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        console.error("[Statistics] Laravel returned HTML error:", responseText.substring(0, 500))
        if (response.status === 404) errorMessage = "Statistics endpoint not found"
        else if (response.status === 403) errorMessage = "You do not have permission"
        else if (response.status === 500) errorMessage = "Server error occurred. Check Laravel logs"
      }
      return NextResponse.json({ message: errorMessage }, { status: response.status })
    }

    try {
      const data = JSON.parse(responseText)
      console.log("[Statistics] Data fetched:", data)
      return NextResponse.json({ success: true, data })
    } catch (e) {
      console.error("[Statistics] Failed to parse successful response:", responseText.substring(0, 500))
      return NextResponse.json({ message: "Invalid response from server" }, { status: 500 })
    }
  } catch (error) {
    console.error("[Statistics] Unexpected error:", error)
    return NextResponse.json({ message: "An error occurred while fetching statistics" }, { status: 500 })
  }
}
