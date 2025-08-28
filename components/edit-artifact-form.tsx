"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Save, Loader2, X, Info, Camera, ImageIcon, Link } from "lucide-react"
import type { Artifact, UploadFormData } from "@/lib/types"
import { extractSupersplatUrl, isValidSupersplatUrl } from "@/lib/iframe-parser"

interface EditArtifactFormProps {
  artifact: Artifact | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditArtifactForm({ artifact, isOpen, onClose, onSuccess }: EditArtifactFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [embedInput, setEmbedInput] = useState("")
  const [embedError, setEmbedError] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [imageError, setImageError] = useState("")
  const [imageUploadMode, setImageUploadMode] = useState<"file" | "url">("url")
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState<UploadFormData>({
    title: "",
    location: "",
    category: "",
    captureDate: "",
    artist: "",
    scanner: "",
    description: "",
    supersplatUrl: "",
    imageUrl: "",
    tags: [],
    materials: "",
    size: "",
    period: "",
  })

  // Update form data when artifact changes
  useEffect(() => {
    if (artifact) {
      setFormData({
        title: artifact.title,
        location: artifact.location,
        category: artifact.category,
        captureDate: artifact.captureDate,
        artist: artifact.artist,
        scanner: artifact.scanner,
        description: artifact.description,
        supersplatUrl: artifact.supersplatUrl,
        imageUrl: artifact.imageUrl || "",
        tags: artifact.tags || [],
        materials: artifact.materials || "",
        size: artifact.size || "",
        period: artifact.period || "",
      })
      setEmbedInput(artifact.supersplatUrl)
      setImagePreview(artifact.imageUrl || "")
      setImageError("")
      setEmbedError("")
      setSelectedFile(null)
      // Default to URL mode if there's an existing image URL
      setImageUploadMode(artifact.imageUrl ? "url" : "file")
    }
  }, [artifact])

  const handleEmbedChange = (value: string) => {
    setEmbedInput(value)
    setEmbedError("")

    if (value.trim()) {
      const extractedUrl = extractSupersplatUrl(value.trim())

      if (isValidSupersplatUrl(extractedUrl)) {
        setFormData((prev) => ({ ...prev, supersplatUrl: extractedUrl }))
        setEmbedError("")
      } else {
        setEmbedError("Please enter a valid SuperSplat URL or iframe embed code")
      }
    } else {
      setFormData((prev) => ({ ...prev, supersplatUrl: "" }))
    }
  }

  const handleImageUrlChange = (value: string) => {
    setFormData((prev) => ({ ...prev, imageUrl: value }))
    setImageError("")

    if (value.trim()) {
      // Validate if it's a valid URL
      try {
        new URL(value)
        setImagePreview(value)
      } catch {
        setImageError("Please enter a valid image URL")
        setImagePreview("")
      }
    } else {
      setImagePreview("")
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setImageError("Image file must be less than 10MB")
      return
    }

    setSelectedFile(file)
    setImageError("")

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to upload image")
    }

    const { url } = await response.json()
    return url
  }

  const handleImageError = () => {
    setImageError("Failed to load image. Please check the URL.")
    setImagePreview("")
  }

  const clearImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: "" }))
    setImagePreview("")
    setImageError("")
    setSelectedFile(null)
    // Reset file input
    const fileInput = document.getElementById("edit-imageFile") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!artifact) return

    if (!formData.supersplatUrl || !isValidSupersplatUrl(formData.supersplatUrl)) {
      setEmbedError("Please enter a valid SuperSplat URL or iframe embed code")
      return
    }

    setIsLoading(true)

    try {
      let imageUrl = formData.imageUrl

      // Upload image file if selected
      if (selectedFile && imageUploadMode === "file") {
        setIsImageUploading(true)
        try {
          imageUrl = await uploadImageToSupabase(selectedFile)
        } catch (error) {
          console.error("Image upload error:", error)
          setImageError("Failed to upload image. Please try again.")
          setIsLoading(false)
          setIsImageUploading(false)
          return
        }
        setIsImageUploading(false)
      }

      const submitData = {
        ...formData,
        imageUrl,
      }

      const response = await fetch(`/api/artifacts/${artifact.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        throw new Error("Failed to update artifact")
      }
    } catch (error) {
      console.error("Update error:", error)
      alert("Failed to update artifact. Please try again.")
    } finally {
      setIsLoading(false)
      setIsImageUploading(false)
    }
  }

  const handleChange = (field: keyof UploadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value
    // Split by commas and trim whitespace
    const tagsArray = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "")
    setFormData((prev) => ({ ...prev, tags: tagsArray }))
  }

  if (!artifact) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b-2 border-black pb-4">
          <div className="flex justify-between items-start">
            <DialogTitle className="font-mono text-xl font-bold tracking-wide">EDIT ARTIFACT</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="font-mono text-sm text-gray-600">Update artifact information and metadata</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-title" className="font-mono font-bold text-sm">
                TITLE *
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="font-mono border-black"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-location" className="font-mono font-bold text-sm">
                LOCATION
              </Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="font-mono border-black"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-category" className="font-mono font-bold text-sm">
                CATEGORY
              </Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="font-mono border-black"
              />
            </div>
            <div>
              <Label htmlFor="edit-period" className="font-mono font-bold text-sm">
                PERIOD
              </Label>
              <Input
                id="edit-period"
                value={formData.period}
                onChange={(e) => handleChange("period", e.target.value)}
                className="font-mono border-black"
                placeholder="e.g., 19th Century, Pre-Colonial, Contemporary"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-materials" className="font-mono font-bold text-sm">
                MATERIALS
              </Label>
              <Input
                id="edit-materials"
                value={formData.materials}
                onChange={(e) => handleChange("materials", e.target.value)}
                className="font-mono border-black"
                placeholder="e.g., Clay, Wood, Bronze, Cotton"
              />
            </div>
            <div>
              <Label htmlFor="edit-size" className="font-mono font-bold text-sm">
                SIZE (DIMENSIONS)
              </Label>
              <Input
                id="edit-size"
                value={formData.size}
                onChange={(e) => handleChange("size", e.target.value)}
                className="font-mono border-black"
                placeholder="e.g., 25cm x 15cm x 10cm"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-artist" className="font-mono font-bold text-sm">
                ARTIST / CREATOR
              </Label>
              <Input
                id="edit-artist"
                value={formData.artist}
                onChange={(e) => handleChange("artist", e.target.value)}
                className="font-mono border-black"
              />
            </div>
            <div>
              <Label htmlFor="edit-scanner" className="font-mono font-bold text-sm">
                3D SCANNER
              </Label>
              <Input
                id="edit-scanner"
                value={formData.scanner}
                onChange={(e) => handleChange("scanner", e.target.value)}
                className="font-mono border-black"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-captureDate" className="font-mono font-bold text-sm">
              CAPTURE DATE
            </Label>
            <Input
              id="edit-captureDate"
              type="date"
              value={formData.captureDate}
              onChange={(e) => handleChange("captureDate", e.target.value)}
              className="font-mono border-black"
            />
          </div>

          <div>
            <Label htmlFor="edit-tags" className="font-mono font-bold text-sm">
              TAGS (comma separated)
            </Label>
            <Input
              id="edit-tags"
              value={formData.tags?.join(", ") || ""}
              onChange={handleTagsChange}
              placeholder="TRADITIONAL, PERFORMANCE ART, RELIGIOUS"
              className="font-mono border-black"
            />
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-mono">
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label className="font-mono font-bold text-sm flex items-center gap-2 mb-3">
              PREVIEW IMAGE
              <Camera className="w-4 h-4 text-orange-500" />
            </Label>

            {/* Upload Mode Toggle */}
            <div className="flex border-2 border-black rounded overflow-hidden mb-4">
              <Button
                type="button"
                onClick={() => {
                  setImageUploadMode("file")
                  if (imageUploadMode === "url") {
                    clearImage()
                  }
                }}
                variant={imageUploadMode === "file" ? "default" : "outline"}
                className={`font-mono rounded-none border-0 flex-1 ${
                  imageUploadMode === "file" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"
                }`}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                UPLOAD FILE
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setImageUploadMode("url")
                  if (imageUploadMode === "file") {
                    setSelectedFile(null)
                    const fileInput = document.getElementById("edit-imageFile") as HTMLInputElement
                    if (fileInput) fileInput.value = ""
                  }
                }}
                variant={imageUploadMode === "url" ? "default" : "outline"}
                className={`font-mono rounded-none border-0 border-l border-black flex-1 ${
                  imageUploadMode === "url" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"
                }`}
              >
                <Link className="w-4 h-4 mr-2" />
                IMAGE URL
              </Button>
            </div>

            {imageUploadMode === "file" ? (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="edit-imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Label htmlFor="edit-imageFile" className="cursor-pointer flex flex-col items-center gap-2 font-mono">
                    <div className="w-12 h-12 border-2 border-gray-400 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-sm font-bold">CLICK TO SELECT NEW IMAGE</span>
                    <span className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</span>
                  </Label>
                </div>
                {selectedFile && (
                  <div className="text-sm font-mono text-green-600">
                    ✓ Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="https://example.com/screenshot.jpg"
                  className="font-mono border-black"
                />
              </div>
            )}

            {imageError && <p className="text-red-600 text-xs font-mono">{imageError}</p>}

            {imagePreview && (
              <div className="relative mt-4">
                <div className="aspect-video w-full max-w-sm border-2 border-gray-300 rounded overflow-hidden">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
                <Button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white hover:bg-red-600"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
                <p className="text-green-600 text-xs font-mono mt-1">
                  ✓{" "}
                  {imageUploadMode === "file" && selectedFile
                    ? "New image file ready for upload"
                    : "Image preview loaded"}
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="edit-supersplatEmbed" className="font-mono font-bold text-sm flex items-center gap-2">
              SUPERSPLAT EMBED *
              <Info className="w-4 h-4 text-gray-500" />
            </Label>
            <Textarea
              id="edit-supersplatEmbed"
              value={embedInput}
              onChange={(e) => handleEmbedChange(e.target.value)}
              placeholder={`Paste either:
• URL: https://superspl.at/s?id=eec7679f
• Full iframe: <iframe id="viewer" width="800" height="500" allow="fullscreen; xr-spatial-tracking" src="https://superspl.at/s?id=eec7679f"></iframe>`}
              className="font-mono border-black min-h-[100px] text-xs"
              rows={4}
              required
            />
            {embedError && <p className="text-red-600 text-xs font-mono mt-1">{embedError}</p>}
            {formData.supersplatUrl && !embedError && (
              <p className="text-green-600 text-xs font-mono mt-1">✓ Extracted URL: {formData.supersplatUrl}</p>
            )}
          </div>

          <div>
            <Label htmlFor="edit-description" className="font-mono font-bold text-sm">
              DESCRIPTION
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="font-mono border-black min-h-[100px]"
              rows={4}
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={isLoading || !formData.supersplatUrl || isImageUploading}
              className="flex-1 bg-black text-white hover:bg-gray-800 font-mono tracking-wide"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isImageUploading ? "UPLOADING IMAGE..." : "SAVING CHANGES..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  SAVE CHANGES
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="font-mono border-black bg-transparent">
              CANCEL
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
