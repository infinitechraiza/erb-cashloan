import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, confirmPassword } = body

    // Validate all fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
    }

    // Check password match
    if (password !== confirmPassword) {
      return NextResponse.json({ message: "Passwords do not match" }, { status: 400 })
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 })
    }

    const laravelUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    const response = await fetch(`${laravelUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        password_confirmation: confirmPassword, // ✅ Laravel expects this format
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle Laravel validation errors
      if (data.errors) {
        const errorMessages = Object.values(data.errors).flat().join(', ')
        return NextResponse.json({ message: errorMessages }, { status: response.status })
      }
      return NextResponse.json({ message: data.message || "Registration failed" }, { status: response.status })
    }

    // Return success without auto-login (user should login manually)
    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: data.user,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "An error occurred during registration" }, { status: 500 })
  }
}