import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paymentId } = await params
    const laravelUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    // Construct Laravel endpoint
    const url = `${laravelUrl}/api/payments/${paymentId}/proof/download`

    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const laravelRes = await fetch(url, {
      headers: {
        ...(token ? { Authorization: token } : {}),
      },
    })

    if (!laravelRes.ok) {
      return NextResponse.json({ message: "Failed to download file" }, { status: laravelRes.status })
    }

    const arrayBuffer = await laravelRes.arrayBuffer()
    const blob = Buffer.from(arrayBuffer)

    const contentDisposition = laravelRes.headers.get("content-disposition") || `attachment; filename="proof.png"`
    const contentType = laravelRes.headers.get("content-type") || "application/octet-stream"

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Disposition": contentDisposition,
        "Content-Type": contentType,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
