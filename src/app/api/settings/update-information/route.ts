// app/api/settings/update-contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function PUT(request: NextRequest) {
    try {
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


        const body = await request.json()

        const response = await fetch(`${laravelUrl}/api/settings/update-information`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status })
        }

        return NextResponse.json(data, { status: 200 })
    } catch (error) {
        console.error('Error updating contact:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}