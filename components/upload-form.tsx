"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Loader2, Info, X, Camera, ImageIcon, Link } from "lucide-react"
import type { UploadFormData } from "@/lib/types"
import { extractSupersplatUrl, isValidSupersplatUrl } from "@/lib/iframe-parser"

interface UploadFormProps {
  onSuccess: () => void
}

export function UploadForm({ onSuccess }: UploadFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [embedInput, setEmbedInput] = useState("")
  const [embedError, setEmbedError] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [imageError, setImageError] = useState("")
  const [imageUploadMode, setImageUploadMode] = useState<"file" | "url">("file")
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
    console.log("UploadForm - uploadImageToSupabase called with:", file.name)

    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    })

    console.log("UploadForm - Upload API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("UploadForm - Upload API error response:", errorText)

      try {
        const error = JSON.parse(errorText)
        throw new Error(error.error || "Failed to upload image")
      } catch (parseError) {
        throw new Error(`Upload failed with status ${response.status}`)
      }
    }

    const result = await response.json()
    console.log("UploadForm - Upload API success response:", result)

    if (!result.url) {
      throw new Error("No URL returned from upload")
    }

    return result.url
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
    const fileInput = document.getElementById("imageFile") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.supersplatUrl || !isValidSupersplatUrl(formData.supersplatUrl)) {
      setEmbedError("Please enter a valid SuperSplat URL or iframe embed code")
      return
    }

    setIsLoading(true)

    let imageUrl = formData.imageUrl

    // Upload image file if selected
    if (selectedFile && imageUploadMode === "file") {
      setIsImageUploading(true)
      try {
        console.log("UploadForm - Starting image upload for file:", selectedFile.name)
        imageUrl = await uploadImageToSupabase(selectedFile)
        console.log("UploadForm - Image uploaded successfully:", imageUrl)
      } catch (error) {
        console.error("UploadForm - Image upload error:", error)
        setImageError(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`)
        setIsLoading(false)
        setIsImageUploading(false)
        return
      }
      setIsImageUploading(false)
    }

    console.log("UploadForm - Final image URL:", imageUrl)

    const submitData = {
      ...formData,
      imageUrl,
    }

    const response = await fetch("/api/artifacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submitData),
    })

    if (response.ok) {
      setFormData({
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
      setEmbedInput("")
      setImagePreview("")
      setImageError("")
      setSelectedFile(null)
      // Reset file input
      const fileInput = document.getElementById("imageFile") as HTMLInputElement
      if (fileInput) fileInput.value = ""
      onSuccess()
    } else {
      throw new Error("Failed to upload artifact")
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

  return (
    <Card className="border-2 border-black">
      <CardHeader className="border-b-2 border-black">
        <CardTitle className="font-mono font-bold tracking-wide flex items-center gap-2">
          <Upload className="w-5 h-5" />
          UPLOAD NEW ARTIFACT
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="font-mono font-bold text-sm">
                TITLE *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="font-mono border-black"
                required
              />
            </div>
            <div>
              <Label htmlFor="location" className="font-mono font-bold text-sm">
                LOCATION
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="font-mono border-black"
                placeholder="e.g., ACCRA, GREATER ACCRA REGION, GHANA"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="font-mono font-bold text-sm">
                CATEGORY
              </Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="font-mono border-black"
                placeholder="e.g., POTTERY, TEXTILES, CEREMONIAL"
              />
            </div>
            <div>
              <Label htmlFor="period" className="font-mono font-bold text-sm">
                PERIOD
              </Label>
              <Input
                id="period"
                value={formData.period}
                onChange={(e) => handleChange("period", e.target.value)}
                className="font-mono border-black"
                placeholder="e.g., 19th Century, Pre-Colonial, Contemporary"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="materials" className="font-mono font-bold text-sm">
                MATERIALS
              </Label>
              <Input
                id="materials"
                value={formData.materials}
                onChange={(e) => handleChange("materials", e.target.value)}
                className="font-mono border-black"
                placeholder="e.g., Clay, Wood, Bronze, Cotton"
              />
            </div>
            <div>
              <Label htmlFor="size" className="font-mono font-bold text-sm">
                SIZE (DIMENSIONS)
              </Label>
              <Input
                id="size"
                value={formData.size}
                onChange={(e) => handleChange("size", e.target.value)}
                className="font-mono border-black"
                placeholder="e.g., 25cm x 15cm x 10cm"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="artist" className="font-mono font-bold text-sm">
                ARTIST / CREATOR
              </Label>
              <Input
                id="artist"
                value={formData.artist}
                onChange={(e) => handleChange("artist", e.target.value)}
                className="font-mono border-black"
                placeholder="Artist name or 'Unknown'"
              />
            </div>
            <div>
              <Label htmlFor="scanner" className="font-mono font-bold text-sm">
                3D SCANNER
              </Label>
              <Input
                id="scanner"
                value={formData.scanner}
                onChange={(e) => handleChange("scanner", e.target.value)}
                className="font-mono border-black"
                placeholder="Person who performed 3D scanning"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="captureDate" className="font-mono font-bold text-sm">
              CAPTURE DATE
            </Label>
            <Input
              id="captureDate"
              type="date"
              value={formData.captureDate}
              onChange={(e) => handleChange("captureDate", e.target.value)}
              className="font-mono border-black"
            />
          </div>

          <div>
            <Label htmlFor="tags" className="font-mono font-bold text-sm">
              TAGS (comma separated)
            </Label>
            <Input
              id="tags"
              placeholder="TRADITIONAL, PERFORMANCE ART, RELIGIOUS, CEREMONIAL"
              onChange={handleTagsChange}
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
              PREVIEW IMAGE (HIGHLY RECOMMENDED)
              <Camera className="w-4 h-4 text-orange-500" />
            </Label>

            {/* Upload Mode Toggle */}
            <div className="flex border-2 border-black rounded overflow-hidden mb-4">
              <Button
                type="button"
                onClick={() => {
                  setImageUploadMode("file")
                  clearImage()
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
                  clearImage()
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
                  <input id="imageFile" type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  <Label htmlFor="imageFile" className="cursor-pointer flex flex-col items-center gap-2 font-mono">
                    <div className="w-12 h-12 border-2 border-gray-400 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-sm font-bold">CLICK TO SELECT IMAGE</span>
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
                <div className="p-3 bg-blue-50 border border-blue-300 rounded">
                  <p className="text-xs font-mono text-blue-800 mb-2 font-bold">📸 HOW TO GET 3D SCREENSHOTS:</p>
                  <ol className="text-xs font-mono text-blue-700 space-y-1">
                    <li>1. Open your SuperSplat 3D model in a browser</li>
                    <li>2. Position the model at the best viewing angle</li>
                    <li>3. Take a screenshot (Cmd+Shift+4 on Mac, Win+Shift+S on Windows)</li>
                    <li>4. Upload to an image hosting service (Imgur, Cloudinary, etc.)</li>
                    <li>5. Copy the direct image URL and paste above</li>
                  </ol>
                </div>
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
                  ✓ {imageUploadMode === "file" ? "Image file ready for upload" : "Image preview loaded"}
                  <br />
                  <span className="text-blue-600">This image will appear on the artifact card</span>
                </p>
              </div>
            )}

            <div className="mt-3 p-3 bg-orange-50 border-2 border-orange-300 rounded">
              <p className="text-xs font-mono text-orange-600 font-bold">
                💡 <strong>TIP:</strong> Good preview images significantly improve user engagement!
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="supersplatEmbed" className="font-mono font-bold text-sm flex items-center gap-2">
              SUPERSPLAT EMBED *
              <Info className="w-4 h-4 text-gray-500" />
            </Label>
            <Textarea
              id="supersplatEmbed"
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
            <div className="mt-2 p-3 bg-gray-50 border border-gray-300 rounded">
              <p className="text-xs font-mono text-gray-600 mb-2">HOW TO GET EMBED CODE:</p>
              <ol className="text-xs font-mono text-gray-600 space-y-1">
                <li>1. Go to superspl.at and open your 3D model</li>
                <li>2. Copy the URL from browser or use share/embed option</li>
                <li>3. Paste the URL or full iframe code above</li>
              </ol>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="font-mono font-bold text-sm">
              DESCRIPTION
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="font-mono border-black min-h-[100px]"
              rows={4}
              placeholder="Describe the artifact's cultural significance, history, and context..."
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !formData.supersplatUrl || isImageUploading}
            className="w-full bg-black text-white hover:bg-gray-800 font-mono tracking-wide"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isImageUploading ? "UPLOADING IMAGE..." : "UPLOADING ARTIFACT..."}
              </>
            ) : (
              "UPLOAD ARTIFACT"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
