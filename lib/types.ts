export interface Artifact {
  id: string
  title: string
  location: string
  category: string
  captureDate: string
  artist: string
  scanner: string
  description: string
  supersplatUrl: string
  imageUrl?: string
  tags?: string[]
  materials?: string
  size?: string
  period?: string
  createdAt: string
  updatedAt: string
}

export interface UploadFormData {
  title: string
  location: string
  category: string
  captureDate: string
  artist: string
  scanner: string
  description: string
  supersplatUrl: string
  imageUrl?: string
  tags?: string[]
  materials?: string
  size?: string
  period?: string
}

// Database types matching Supabase schema
export interface DatabaseArtifact {
  id: string
  title: string
  location: string | null
  category: string | null
  capture_date: string | null
  artist: string | null
  scanner: string | null
  description: string | null
  supersplat_url: string
  image_url: string | null
  tags: string[] | null
  materials: string | null
  size: string | null
  period: string | null
  created_at: string
  updated_at: string
}
