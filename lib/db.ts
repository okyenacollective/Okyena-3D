// Simple in-memory database for demo purposes
// In production, you'd use a real database like PostgreSQL, MongoDB, etc.

import type { Artifact } from "./types"

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const db = {
  artifacts: {
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
  },
}
