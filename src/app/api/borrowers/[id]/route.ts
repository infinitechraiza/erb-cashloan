import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // Await params in Next.js 15+
        const params = await context.params
        const { id } = params

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

        const laravelUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        const url = `${laravelUrl}/api/borrowers/${id}`
        console.log(`[v1] Laravel URL: ${url}`)

        // Fetch borrower data from Laravel
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`, // Forward the token
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        })

        // Read the response as text first to handle both JSON and HTML errors
        const responseText = await response.text()
        console.log(`[v1] Laravel response status: ${response.status}`)

        // Handle non-OK responses
        if (!response.ok) {
            let errorMessage = "Failed to fetch borrower"
            try {
                // Try to parse the error response as JSON
                const errorData = JSON.parse(responseText)
                errorMessage = errorData.message || errorMessage
                console.error(`[v1] Laravel error response:`, errorData)
            } catch (e) {
                // If response is HTML or invalid JSON, log first 500 chars
                console.error("[v1] Laravel returned HTML or invalid JSON:", responseText.substring(0, 500))

                // Map common Laravel HTTP status codes to readable messages
                if (response.status === 404) {
                    errorMessage = "Borrower not found"
                } else if (response.status === 403) {
                    errorMessage = "You do not have permission to view this borrower"
                } else if (response.status === 500) {
                    errorMessage = "Server error occurred. Please check Laravel logs."
                }
            }

            console.warn(`[v1] Returning error to frontend: ${errorMessage}`)
            return NextResponse.json({ message: errorMessage }, { status: response.status })
        }

        // Parse successful JSON response
        try {
            const data = JSON.parse(responseText)

            return NextResponse.json(data)
        } catch (e) {
            console.error("[v1] Failed to parse successful response:", responseText.substring(0, 500))
            return NextResponse.json({ message: "Invalid response from server" }, { status: 500 })
        }
    } catch (error) {
        // Catch any unexpected errors in the proxy
        console.error("[v1] Unexpected error in GET /api/borrowers/[id]:", error)
        return NextResponse.json(
            { message: "An error occurred while fetching borrower details" },
            { status: 500 }
        )
    }
}
