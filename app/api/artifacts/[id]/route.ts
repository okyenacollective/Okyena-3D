import { type NextRequest, NextResponse } from "next/server"
import { artifactService } from "@/lib/artifact-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const artifact = await artifactService.getById(params.id)
    if (!artifact) {
      return NextResponse.json({ error: "Artifact not found" }, { status: 404 })
    }
    return NextResponse.json(artifact)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to fetch artifact" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await artifactService.delete(params.id)
    if (!success) {
      return NextResponse.json({ error: "Artifact not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Artifact deleted successfully" })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to delete artifact" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const artifact = await artifactService.update(params.id, data)
    if (!artifact) {
      return NextResponse.json({ error: "Artifact not found" }, { status: 404 })
    }
    return NextResponse.json(artifact)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Failed to update artifact" }, { status: 500 })
  }
}
