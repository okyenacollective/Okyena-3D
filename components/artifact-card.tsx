"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import type { Artifact } from "@/lib/types"
import { Eye } from "lucide-react"

interface ArtifactCardProps {
  artifact: Artifact
  onClick: () => void
}

export function ArtifactCard({ artifact, onClick }: ArtifactCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Format capture date for better display
  const formatCaptureDate = () => {
    if (!artifact.captureDate) return { day: "--", month: "--", year: "----" }

    const parts = artifact.captureDate.split("/")
    if (parts.length === 3) {
      return {
        day: parts[0].padStart(2, "0"),
        month: parts[1].padStart(2, "0"),
        year: parts[2],
      }
    }

    // Try to parse as ISO date
    try {
      const date = new Date(artifact.captureDate)
      if (!isNaN(date.getTime())) {
        return {
          day: date.getDate().toString().padStart(2, "0"),
          month: (date.getMonth() + 1).toString().padStart(2, "0"),
          year: date.getFullYear().toString(),
        }
      }
    } catch (e) {
      // Fall back to default format
    }

    return { day: "--", month: "--", year: "----" }
  }

  const { day, month, year } = formatCaptureDate()

  // Truncate text functions
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ""
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const renderImage = () => {
    const hasValidImageUrl = artifact.imageUrl && !imageError

    if (hasValidImageUrl) {
      return (
        <div className="relative w-full h-full">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
              <div className="text-gray-400 font-mono text-xs">LOADING...</div>
            </div>
          )}
          <img
            src={artifact.imageUrl || "/placeholder.svg"}
            alt={`Preview of ${artifact.title}`}
            className="w-full h-full object-cover rounded"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageLoading ? "none" : "block" }}
            crossOrigin="anonymous"
          />
        </div>
      )
    }

    // Fallback to simple gray background
    return (
      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
        <div className="text-gray-500 font-mono text-xs">NO PREVIEW</div>
      </div>
    )
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-black bg-white h-full group active:scale-95"
      onClick={onClick}
    >
      <CardContent className="p-0 flex flex-col h-full">
        {/* Header */}
        <div className="border-b-2 border-black p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div>
              <h3 className="font-mono font-bold text-sm sm:text-base tracking-wide line-clamp-2 min-h-[2.5rem] sm:min-h-[2.5rem]">
                {truncateText(artifact.title, 50)}
              </h3>
            </div>
            <div className="sm:text-right">
              <p className="font-mono font-bold text-sm sm:text-base tracking-wide line-clamp-2 min-h-[2.5rem] sm:min-h-[2.5rem] text-gray-700">
                {truncateText(artifact.location, 50)}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile-optimized Metadata Grid */}
        <div className="border-b-2 border-black">
          {/* Headers - Hidden on mobile */}
          <div className="hidden sm:grid grid-cols-4 border-b border-black">
            <div className="p-2 border-r border-black text-center">
              <p className="font-mono text-xs font-bold">CATEGORY</p>
            </div>
            <div className="p-2 border-r border-black text-center">
              <p className="font-mono text-xs font-bold">DATE</p>
            </div>
            <div className="p-2 border-r border-black text-center">
              <p className="font-mono text-xs font-bold">ARTIST</p>
            </div>
            <div className="p-2 text-center">
              <p className="font-mono text-xs font-bold">SCANNER</p>
            </div>
          </div>

          {/* Content - Responsive layout */}
          <div className="grid grid-cols-2 sm:grid-cols-4">
            <div className="p-3 sm:p-4 border-r border-black flex flex-col items-center justify-center min-h-[80px] sm:min-h-[100px]">
              <p className="font-mono text-xs font-bold mb-1 sm:hidden">CATEGORY</p>
              <p className="font-mono text-xs sm:text-sm text-center line-clamp-2">
                {truncateText(artifact.category, 15) || "N/A"}
              </p>
            </div>
            <div className="p-2 sm:p-2 border-r border-black sm:border-r text-center flex flex-col justify-center min-h-[80px] sm:min-h-[100px]">
              <p className="font-mono text-xs font-bold mb-1 sm:hidden">DATE</p>
              <p className="font-mono text-lg sm:text-3xl font-bold leading-none">{day}/</p>
              <p className="font-mono text-lg sm:text-3xl font-bold leading-none">{month}</p>
              <p className="font-mono text-xs sm:text-sm mt-1">{year}</p>
            </div>
            <div className="p-3 sm:p-2 border-r border-black text-center flex flex-col items-center justify-center min-h-[80px] sm:min-h-[100px]">
              <p className="font-mono text-xs font-bold mb-1 sm:hidden">ARTIST</p>
              <p className="font-mono text-sm sm:text-xl font-bold line-clamp-2">
                {truncateText(artifact.artist, 12) || "N/A"}
              </p>
            </div>
            <div className="p-3 sm:p-2 text-center flex flex-col items-center justify-center min-h-[80px] sm:min-h-[100px]">
              <p className="font-mono text-xs font-bold mb-1 sm:hidden">SCANNER</p>
              <p className="font-mono text-xs sm:text-sm line-clamp-2">{truncateText(artifact.scanner, 15) || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Image/Preview */}
        <div className="p-3 sm:p-4 border-b-2 border-black">
          <div className="aspect-video bg-gray-100 rounded flex items-center justify-center overflow-hidden group-hover:shadow-inner transition-shadow relative">
            {renderImage()}
            {/* Mobile View Indicator */}
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          {artifact.imageUrl && (
            <div className="mt-2 text-center">
              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-mono rounded">
                ✓ IMAGE PREVIEW
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="p-3 sm:p-4 flex-grow">
          <h4 className="font-mono font-bold text-sm mb-2 border-b border-black pb-1">DESCRIPTION</h4>
          <p className="font-mono text-xs sm:text-sm leading-relaxed text-gray-700 line-clamp-3">
            {artifact.description || "No description available."}
          </p>
        </div>

        {/* Mobile Touch Indicator */}
        <div className="sm:hidden p-3 border-t border-gray-200 bg-gray-50">
          <p className="font-mono text-xs text-center text-gray-500">TAP TO VIEW IN 3D</p>
        </div>
      </CardContent>
    </Card>
  )
}
