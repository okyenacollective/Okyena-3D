import type { Artifact, UploadFormData, DatabaseArtifact } from "./types"

// Convert database artifact to frontend artifact format
function mapDatabaseToArtifact(dbArtifact: DatabaseArtifact): Artifact {
  return {
    id: dbArtifact.id,
    title: dbArtifact.title,
    location: dbArtifact.location || "",
    category: dbArtifact.category || "",
    captureDate: dbArtifact.capture_date || "",
    artist: dbArtifact.artist || "",
    scanner: dbArtifact.scanner || "",
    description: dbArtifact.description || "",
    supersplatUrl: dbArtifact.supersplat_url,
    imageUrl: dbArtifact.image_url || undefined,
    tags: dbArtifact.tags || [],
    materials: dbArtifact.materials || "",
    size: dbArtifact.size || "",
    period: dbArtifact.period || "",
    createdAt: dbArtifact.created_at,
    updatedAt: dbArtifact.updated_at,
  }
}

// Convert frontend data to database format
function mapArtifactToDatabase(data: UploadFormData) {
  return {
    title: data.title,
    location: data.location || null,
    category: data.category || null,
    capture_date: data.captureDate || null,
    artist: data.artist || null,
    scanner: data.scanner || null,
    description: data.description || null,
    supersplat_url: data.supersplatUrl,
    image_url: data.imageUrl || null, // Ensure image URL is included
    tags: data.tags || [],
    materials: data.materials || null,
    size: data.size || null,
    period: data.period || null,
  }
}

// Fallback in-memory database
const createInMemoryDatabase = () => {
  const artifacts: Artifact[] = [
    {
      id: "1",
      title: "UPCYCLED FISHING NET HAMMOCK",
      location: "BUSUA, AHANTA REGION, GHANA",
      category: "SPACES/",
      captureDate: "22/03/2025",
      artist: "N/A",
      scanner: "FARAI ANINDOR",
      description:
        "A traditional hammock crafted from upcycled fishing nets, representing the sustainable practices of coastal Ghanaian communities. This artifact showcases the ingenuity of local artisans in repurposing marine waste into functional cultural objects.",
      supersplatUrl: "https://superspl.at/s?id=eec7679f",
      imageUrl: "/placeholder.svg?height=400&width=600",
      materials: "Recycled fishing nets, rope",
      size: "200cm x 80cm x 30cm",
      period: "21st Century, Contemporary",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  return {
    findMany: () => artifacts,
    findById: (id: string) => artifacts.find((a) => a.id === id),
    create: (data: Omit<Artifact, "id" | "createdAt" | "updatedAt">) => {
      const artifact: Artifact = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      artifacts.push(artifact)
      return artifact
    },
    update: (id: string, data: Partial<Artifact>) => {
      const index = artifacts.findIndex((a) => a.id === id)
      if (index !== -1) {
        artifacts[index] = { ...artifacts[index], ...data, updatedAt: new Date().toISOString() }
        return artifacts[index]
      }
      return null
    },
    delete: (id: string) => {
      const index = artifacts.findIndex((a) => a.id === id)
      if (index !== -1) {
        return artifacts.splice(index, 1)[0]
      }
      return null
    },
  }
}

const memoryDb = createInMemoryDatabase()

export const artifactService = {
  async getAll(): Promise<Artifact[]> {
    try {
      console.log("ArtifactService.getAll - Starting")

      // Try Supabase first
      try {
        console.log("ArtifactService.getAll - Attempting Supabase connection")
        const { createServerSupabaseClient } = await import("./supabase")
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase.from("artifacts").select("*").order("created_at", { ascending: false })

        if (error) {
          console.error("ArtifactService.getAll - Supabase error:", error)
          throw error
        }

        if (data && data.length > 0) {
          console.log("ArtifactService.getAll - Successfully retrieved", data.length, "artifacts from Supabase")
          return data.map(mapDatabaseToArtifact)
        } else {
          console.log("ArtifactService.getAll - No data from Supabase, using fallback")
        }
      } catch (supabaseError) {
        console.log(
          "ArtifactService.getAll - Supabase failed, using fallback:",
          supabaseError instanceof Error ? supabaseError.message : "Unknown error",
        )
      }

      // Fallback to in-memory database
      console.log("ArtifactService.getAll - Using in-memory database")
      const fallbackData = memoryDb.findMany()
      console.log("ArtifactService.getAll - Returning", fallbackData.length, "artifacts from memory")
      return fallbackData
    } catch (error) {
      console.error("ArtifactService.getAll - Critical error:", error)
      // Return empty array as last resort, but don't throw
      console.log("ArtifactService.getAll - Returning empty array as fallback")
      return []
    }
  },

  async getById(id: string): Promise<Artifact | null> {
    try {
      console.log("ArtifactService.getById - Starting for ID:", id)

      // Try Supabase first
      try {
        const { createServerSupabaseClient } = await import("./supabase")
        const supabase = createServerSupabaseClient()

        const { data, error } = await supabase.from("artifacts").select("*").eq("id", id).single()

        if (error) {
          if (error.code === "PGRST116") {
            console.log("ArtifactService.getById - Not found in Supabase")
          } else {
            console.error("ArtifactService.getById - Supabase error:", error)
          }
          throw error
        }

        console.log("ArtifactService.getById - Successfully retrieved artifact from Supabase")
        return mapDatabaseToArtifact(data)
      } catch (supabaseError) {
        console.log("ArtifactService.getById - Supabase failed, using fallback")
      }

      // Fallback to in-memory database
      return memoryDb.findById(id)
    } catch (error) {
      console.error("ArtifactService.getById - Critical error:", error)
      return null
    }
  },

  async create(artifactData: UploadFormData): Promise<Artifact> {
    try {
      console.log("ArtifactService.create - Starting for:", artifactData.title)
      console.log("ArtifactService.create - Image URL:", artifactData.imageUrl)

      // Try Supabase first
      try {
        const { createServerSupabaseClient } = await import("./supabase")
        const supabase = createServerSupabaseClient()

        const dbData = {
          title: artifactData.title,
          location: artifactData.location || null,
          category: artifactData.category || null,
          capture_date: artifactData.captureDate || null,
          artist: artifactData.artist || null,
          scanner: artifactData.scanner || null,
          description: artifactData.description || null,
          supersplat_url: artifactData.supersplatUrl,
          image_url: artifactData.imageUrl || null, // Ensure image URL is included
          tags: artifactData.tags || [],
          materials: artifactData.materials || null,
          size: artifactData.size || null,
          period: artifactData.period || null,
        }

        console.log("ArtifactService.create - Database data:", dbData)

        const { data, error } = await supabase.from("artifacts").insert(dbData).select().single()

        if (error) {
          console.error("ArtifactService.create - Supabase error:", error)
          throw error
        }

        console.log("ArtifactService.create - Successfully created artifact in Supabase:", data)
        return mapDatabaseToArtifact(data)
      } catch (supabaseError) {
        console.log("ArtifactService.create - Supabase failed, using fallback")
      }

      // Fallback to in-memory database
      const artifact = memoryDb.create(artifactData)
      console.log("ArtifactService.create - Created in memory database:", artifact)
      return artifact
    } catch (error) {
      console.error("ArtifactService.create - Critical error:", error)
      throw new Error("Failed to create artifact")
    }
  },

  async update(id: string, artifactData: Partial<UploadFormData>): Promise<Artifact | null> {
    try {
      console.log("ArtifactService.update - Starting for ID:", id)

      // Try Supabase first
      try {
        const { createServerSupabaseClient } = await import("./supabase")
        const supabase = createServerSupabaseClient()

        const dbData = mapArtifactToDatabase(artifactData as UploadFormData)

        const { data, error } = await supabase.from("artifacts").update(dbData).eq("id", id).select().single()

        if (error) {
          if (error.code === "PGRST116") {
            console.log("ArtifactService.update - Not found in Supabase")
          } else {
            console.error("ArtifactService.update - Supabase error:", error)
          }
          throw error
        }

        console.log("ArtifactService.update - Successfully updated artifact in Supabase")
        return mapDatabaseToArtifact(data)
      } catch (supabaseError) {
        console.log("ArtifactService.update - Supabase failed, using fallback")
      }

      // Fallback to in-memory database
      return memoryDb.update(id, artifactData)
    } catch (error) {
      console.error("ArtifactService.update - Critical error:", error)
      return null
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      console.log("ArtifactService.delete - Starting for ID:", id)

      // Try Supabase first
      try {
        const { createServerSupabaseClient } = await import("./supabase")
        const supabase = createServerSupabaseClient()

        const { error } = await supabase.from("artifacts").delete().eq("id", id)

        if (error) {
          console.error("ArtifactService.delete - Supabase error:", error)
          throw error
        }

        console.log("ArtifactService.delete - Successfully deleted artifact from Supabase")
        return true
      } catch (supabaseError) {
        console.log("ArtifactService.delete - Supabase failed, using fallback")
      }

      // Fallback to in-memory database
      return memoryDb.delete(id) !== null
    } catch (error) {
      console.error("ArtifactService.delete - Critical error:", error)
      return false
    }
  },
}
