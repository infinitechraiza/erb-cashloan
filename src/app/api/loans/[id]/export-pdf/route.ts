// File: app/api/loans/[id]/export-pdf/route.ts

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"


export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // Await params in Next.js 15+
        const { id: loanId } = await context.params

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
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        // Construct Laravel API URL for payment schedule PDF
        const laravelUrl = `${API_URL}/loans/${loanId}/export-pdf`

        console.log("Fetching payment schedule PDF from:", laravelUrl)

        // Forward request to Laravel backend
        const response = await fetch(laravelUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/pdf",
            },
        })

        if (!response.ok) {
            const text = await response.text()
            console.error("Laravel PDF generation error:", {
                status: response.status,
                statusText: response.statusText,
                body: text
            })

            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to generate PDF from backend",
                    error: text
                },
                { status: response.status }
            )
        }

        // Get PDF buffer
        const buffer = await response.arrayBuffer()

        // Generate filename with loan ID and current date
        const filename = `loan-${loanId}-payment-schedule-${new Date().toISOString().split('T')[0]}.pdf`

        // Return PDF response
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Content-Length": buffer.byteLength.toString(),
            },
        })

    } catch (error) {
        console.error("PDF API route error:", error)
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
                error: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        )
    }
}