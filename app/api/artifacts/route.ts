import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== GET /api/artifacts - Starting ===")

    // Import dynamically to catch any import errors
    const { artifactService } = await import("@/lib/artifact-service")
    console.log("GET /api/artifacts - Successfully imported artifact service")

    const artifacts = await artifactService.getAll()
    console.log("GET /api/artifacts - Success, returning", artifacts.length, "artifacts")

    // Ensure we always return valid JSON
    const response = NextResponse.json(artifacts)
    response.headers.set("Content-Type", "application/json")
    return response
  } catch (error) {
    console.error("=== GET /api/artifacts - ERROR ===")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    // Always return JSON, never HTML
    const errorResponse = NextResponse.json(
      {
        error: "Failed to fetch artifacts",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
    errorResponse.headers.set("Content-Type", "application/json")
    return errorResponse
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== POST /api/artifacts - Starting ===")

    const { artifactService } = await import("@/lib/artifact-service")
    const { UploadFormData } = await import("@/lib/types")

    const data = await request.json()
    console.log("POST /api/artifacts - Received data for:", data.title)

    // Validate required fields
    if (!data.title || !data.supersplatUrl) {
      console.log("POST /api/artifacts - Validation failed: missing required fields")
      return NextResponse.json(
        { error: "Title and SuperSplat URL are required" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    const artifact = await artifactService.create(data)
    console.log("POST /api/artifacts - Success, created artifact with ID:", artifact.id)

    return NextResponse.json(artifact, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("=== POST /api/artifacts - ERROR ===")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Failed to create artifact",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
