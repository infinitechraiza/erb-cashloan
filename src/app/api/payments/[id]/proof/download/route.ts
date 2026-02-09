import { NextRequest, NextResponse } from "next/server"
import { cookies } from 'next/headers';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: paymentId } = await context.params

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
    const url = `${laravelUrl}/api/payments/${paymentId}/proof/download`

    console.log("[Download Proof API] Downloading proof for payment:", paymentId)

    const laravelRes = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!laravelRes.ok) {
      console.error("[Download Proof API] Laravel error response", laravelRes.status)
      return NextResponse.json({ message: "Failed to download file" }, { status: laravelRes.status })
    }

    const contentDisposition = laravelRes.headers.get("content-disposition") ?? 'attachment; filename="proof.png"'
    const contentType = laravelRes.headers.get("content-type") ?? "application/octet-stream"

    const arrayBuffer = await laravelRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log("[Download Proof API] File downloaded successfully")

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": contentDisposition,
        "Content-Type": contentType,
      },
    })
  } catch (err) {
    console.error("[Download Proof API] Unhandled error", err)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}