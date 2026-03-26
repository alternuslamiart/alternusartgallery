import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    const CEO_EMAIL = "lamialiuart@gmail.com"
    const CEO_PASSWORD = "Alternus333#"

    const normalizedEmail = email?.trim()?.toLowerCase()

    console.log("Test login - email:", normalizedEmail)
    console.log("Test login - password length:", password?.length)
    console.log("Test login - expected email:", CEO_EMAIL.toLowerCase())
    console.log("Test login - email match:", normalizedEmail === CEO_EMAIL.toLowerCase())
    console.log("Test login - password match:", password === CEO_PASSWORD)

    if (normalizedEmail === CEO_EMAIL.toLowerCase() && password === CEO_PASSWORD) {
      return NextResponse.json({
        success: true,
        message: "Credentials are correct!",
        user: {
          id: "ceo-lamiart",
          email: CEO_EMAIL,
          name: "Lamiart CEO",
        }
      })
    }

    return NextResponse.json({
      success: false,
      message: "Invalid credentials",
      debug: {
        emailProvided: normalizedEmail,
        emailExpected: CEO_EMAIL.toLowerCase(),
        emailMatch: normalizedEmail === CEO_EMAIL.toLowerCase(),
        passwordMatch: password === CEO_PASSWORD,
      }
    }, { status: 401 })
  } catch (error) {
    console.error("Test login error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
