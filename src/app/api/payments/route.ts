import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Extract token from headers
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Laravel API base URL
    const laravelUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    // Forward all query parameters dynamically
    const queryParams = request.nextUrl.searchParams.toString();
    const url = `${laravelUrl}/payments${queryParams ? `?${queryParams}` : ""}`;

    console.log("[Payments API] Fetching:", url);

    // Make request to Laravel
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || `Laravel API returned ${response.status}`;
      return NextResponse.json({ message }, { status: response.status });
    }

    // Parse JSON safely
    const data = await response.json();
    console.log("[Payments API] Response data:", data);

    // Forward data to frontend
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Payments API] Error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      console.error("[Payments API POST] No token provided");
      return NextResponse.json({ message: "Unauthorized - No token provided" }, { status: 401 });
    }

    // Parse incoming FormData
    let formData: FormData;
    try {
      formData = await request.formData();
      console.log("[Payments API POST] FormData received:", Array.from(formData.entries()));
    } catch (e) {
      console.error("[Payments API POST] Failed to parse FormData:", e);
      return NextResponse.json({ message: "Invalid form data" }, { status: 400 });
    }

    // Prepare FormData to send to Laravel
    const laravelFormData = new FormData();
    for (const [key, value] of formData.entries()) {
      // value can be string or File
      laravelFormData.append(key, value);
    }

    const laravelUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const url = `${laravelUrl}/api/payments`;

    console.log(`[Payments API POST] Sending FormData to Laravel: ${url}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: laravelFormData,
    });

    console.log(`[Payments API POST] Laravel response status: ${response.status}`);

    const contentType = response.headers.get("content-type");
    console.log(`[Payments API POST] Content-Type: ${contentType}`);

    if (!response.ok) {
      let errorMessage = "Failed to record payment";
      let errorDetails = null;

      try {
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          console.error("[Payments API POST] Laravel error response:", error);
          errorMessage = error.message || errorMessage;
          errorDetails = error.errors || null;
        } else {
          const text = await response.text();
          console.error("[Payments API POST] Non-JSON error response:", text.substring(0, 500));
          errorMessage = `Server error: ${response.statusText}`;
        }
      } catch (e) {
        console.error("[Payments API POST] Error parsing error response:", e);
        errorMessage = `Server error: ${response.statusText}`;
      }

      return NextResponse.json(
        {
          message: errorMessage,
          errors: errorDetails,
        },
        { status: response.status }
      );
    }

    let data;
    try {
      data = await response.json();
      console.log("[Payments API POST] Success response:", data);
    } catch (e) {
      console.error("[Payments API POST] Failed to parse success response:", e);
      return NextResponse.json(
        { message: "Payment may have been recorded but response was invalid" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[Payments API POST] Unexpected error:", error);
    console.error("[Payments API POST] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        error: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : String(error)) : undefined,
      },
      { status: 500 }
    );
  }
}
