import { type NextRequest, NextResponse } from "next/server"

// POST - Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Simple admin authentication
    if (email === "admin@gmail.com" && password === "admin123") {
      return NextResponse.json({
        success: true,
        message: "Login successful",
        user: { email: "admin@gmail.com", role: "admin" },
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("Error during authentication:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
