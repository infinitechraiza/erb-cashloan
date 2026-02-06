import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paymentId } = await params

    const laravelUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    const url = `${laravelUrl}/api/payments/${paymentId}/proof/download`

    const authHeader = request.headers.get("Authorization")

    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      console.warn("[DOWNLOAD PROXY] Missing auth token")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const laravelRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!laravelRes.ok) {
      console.error("[DOWNLOAD PROXY] Laravel error response", laravelRes.status)

      return NextResponse.json({ message: "Failed to download file" }, { status: laravelRes.status })
    }

    const contentDisposition = laravelRes.headers.get("content-disposition") ?? 'attachment; filename="proof.png"'

    const contentType = laravelRes.headers.get("content-type") ?? "application/octet-stream"

    const arrayBuffer = await laravelRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": contentDisposition,
        "Content-Type": contentType,
      },
    })
  } catch (err) {
    console.error("[DOWNLOAD PROXY] Unhandled error", err)

    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
