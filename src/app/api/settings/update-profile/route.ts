// app/api/settings/update-profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Image validation constants
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

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


        const formData = await request.formData()
        const profileImage = formData.get('profile_url') as File | null
        const removeProfileUrl = formData.get('remove_profile_url')
        const firstName = formData.get('first_name')
        const lastName = formData.get('last_name')
        const email = formData.get('email')
        const phone = formData.get('phone')
        const address = formData.get('address')
        const city = formData.get('city')
        const state = formData.get('state')
        const postalCode = formData.get('postal_code')
        const country = formData.get('country')


        // Handle image upload with validation
        if (profileImage && profileImage instanceof File) {
            // Validate file type
            if (!ALLOWED_IMAGE_TYPES.includes(profileImage.type)) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Validation failed',
                        errors: {
                            profile_url: ['Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only.']
                        }
                    },
                    { status: 422 }
                )
            }

            // Validate file size
            if (profileImage.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Validation failed',
                        errors: {
                            profile_url: [`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB. Your file is ${(profileImage.size / (1024 * 1024)).toFixed(2)}MB.`]
                        }
                    },
                    { status: 422 }
                )
            }

            // Validate that it's actually an image (check file signature/magic bytes)
            const buffer = await profileImage.arrayBuffer()
            const uint8Array = new Uint8Array(buffer)

            // Check magic bytes for common image formats
            const isValidImage = isValidImageFile(uint8Array, profileImage.type)
            if (!isValidImage) {
                return NextResponse.json(
                    {
                        success: false,
                        message: 'Validation failed',
                        errors: {
                            profile_url: ['The uploaded file is not a valid image.']
                        }
                    },
                    { status: 422 }
                )
            }

            // Create new FormData for Laravel backend
            const backendFormData = new FormData()
            backendFormData.append('profile_url', profileImage)
            backendFormData.append('_method', 'PUT')

            const response = await fetch(`${laravelUrl}/api/settings/update-profile`, {
                method: 'POST', // Laravel uses POST with _method override
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: backendFormData,
            })

            const data = await response.json()

            if (!response.ok) {
                return NextResponse.json(data, { status: response.status })
            }

            return NextResponse.json(data, { status: 200 })
        }

        // Handle profile image removal
        if (removeProfileUrl === 'true') {
            const backendFormData = new FormData()
            backendFormData.append('remove_profile_url', 'true')
            backendFormData.append('_method', 'PUT')

            const response = await fetch(`${laravelUrl}/api/settings/update-profile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: backendFormData,
            })

            const data = await response.json()

            if (!response.ok) {
                return NextResponse.json(data, { status: response.status })
            }

            return NextResponse.json(data, { status: 200 })
        }

        // Handle name update
        if (firstName || lastName) {
            const backendFormData = new FormData()
            if (firstName) backendFormData.append('first_name', firstName as string)
            if (lastName) backendFormData.append('last_name', lastName as string)
            if (email) backendFormData.append('email', email as string)
            if (phone) backendFormData.append('phone', phone as string)
            if (address) backendFormData.append('address', address as string)
            if (city) backendFormData.append('city', city as string)
            if (state) backendFormData.append('state', state as string)
            if (postalCode) backendFormData.append('postal_code', postalCode as string)
            if (country) backendFormData.append('country', country as string)

            backendFormData.append('_method', 'PUT')

            const response = await fetch(`${laravelUrl}/api/settings/update-profile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: backendFormData,
            })

            const data = await response.json()

            if (!response.ok) {
                return NextResponse.json(data, { status: response.status })
            }

            return NextResponse.json(data, { status: 200 })
        }

        return NextResponse.json(
            { success: false, message: 'No data to update' },
            { status: 400 }
        )
    } catch (error) {
        console.error('Error updating profile:', error)
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Helper function to validate image file by checking magic bytes
function isValidImageFile(bytes: Uint8Array, mimeType: string): boolean {
    // JPEG: FF D8 FF
    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        return bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (mimeType === 'image/png') {
        return (
            bytes[0] === 0x89 &&
            bytes[1] === 0x50 &&
            bytes[2] === 0x4E &&
            bytes[3] === 0x47 &&
            bytes[4] === 0x0D &&
            bytes[5] === 0x0A &&
            bytes[6] === 0x1A &&
            bytes[7] === 0x0A
        )
    }

    // GIF: 47 49 46 38 (GIF8)
    if (mimeType === 'image/gif') {
        return (
            bytes[0] === 0x47 &&
            bytes[1] === 0x49 &&
            bytes[2] === 0x46 &&
            bytes[3] === 0x38
        )
    }

    // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF...WEBP)
    if (mimeType === 'image/webp') {
        return (
            bytes[0] === 0x52 &&
            bytes[1] === 0x49 &&
            bytes[2] === 0x46 &&
            bytes[3] === 0x46 &&
            bytes[8] === 0x57 &&
            bytes[9] === 0x45 &&
            bytes[10] === 0x42 &&
            bytes[11] === 0x50
        )
    }

    return false
}