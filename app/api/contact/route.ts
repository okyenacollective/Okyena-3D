import { type NextRequest, NextResponse } from "next/server"
import { sendContactEmail, sendAutoReply } from "@/lib/email"

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate message length
    if (data.message.length < 10) {
      return NextResponse.json({ error: "Message must be at least 10 characters long" }, { status: 400 })
    }

    if (data.message.length > 5000) {
      return NextResponse.json({ error: "Message must be less than 5000 characters" }, { status: 400 })
    }

    // Check for spam patterns (basic protection)
    const spamKeywords = ["viagra", "casino", "lottery", "winner", "congratulations", "click here", "free money"]
    const messageText = data.message.toLowerCase()
    const hasSpam = spamKeywords.some((keyword) => messageText.includes(keyword))

    if (hasSpam) {
      return NextResponse.json({ error: "Message contains prohibited content" }, { status: 400 })
    }

    try {
      // Send main email to Okyena Collective
      const emailResult = await sendContactEmail(data)

      // Send auto-reply to sender (don't fail if this doesn't work)
      try {
        await sendAutoReply(data)
      } catch (autoReplyError) {
        console.warn("Auto-reply failed:", autoReplyError)
        // Continue - main email was successful
      }

      return NextResponse.json(
        {
          message: "Message sent successfully",
          id: emailResult.id,
        },
        { status: 200 },
      )
    } catch (emailError) {
      console.error("Email sending failed:", emailError)

      // Check if it's a Resend API error
      if (emailError instanceof Error) {
        if (emailError.message.includes("API key")) {
          return NextResponse.json({ error: "Email service configuration error" }, { status: 500 })
        }
        if (emailError.message.includes("domain")) {
          return NextResponse.json({ error: "Email domain not verified" }, { status: 500 })
        }
      }

      return NextResponse.json({ error: "Failed to send message. Please try again later." }, { status: 500 })
    }
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
