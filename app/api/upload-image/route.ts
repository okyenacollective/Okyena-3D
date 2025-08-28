import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    console.log("Upload Image API - Starting upload process")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("Upload Image API - No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("Upload Image API - File received:", file.name, file.type, file.size)

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.error("Upload Image API - Invalid file type:", file.type)
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error("Upload Image API - File too large:", file.size)
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Upload Image API - Missing Supabase environment variables")
      return NextResponse.json(
        {
          error: "Server configuration error - missing Supabase credentials",
        },
        { status: 500 },
      )
    }

    console.log("Upload Image API - Creating Supabase client")

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Generate unique filename with timestamp and random string
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileName = `artifact-${timestamp}-${randomString}.${fileExt}`
    const filePath = `artifact-images/${fileName}`

    console.log("Upload Image API - Generated file path:", filePath)

    // Convert file to ArrayBuffer then to Uint8Array for Supabase
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    console.log("Upload Image API - Uploading to Supabase storage")

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Upload Image API - Supabase upload error:", uploadError)
      return NextResponse.json(
        {
          error: `Failed to upload image: ${uploadError.message}`,
          details: uploadError,
        },
        { status: 500 },
      )
    }

    console.log("Upload Image API - Upload successful:", uploadData)

    // Get public URL
    const { data: urlData } = supabase.storage.from("images").getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      console.error("Upload Image API - Failed to get public URL")
      return NextResponse.json({ error: "Failed to get public URL" }, { status: 500 })
    }

    console.log("Upload Image API - Public URL generated:", urlData.publicUrl)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: filePath,
      fileName: fileName,
      message: "Image uploaded successfully",
    })
  } catch (error) {
    console.error("Upload Image API - Critical error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
