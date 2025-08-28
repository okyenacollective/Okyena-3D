"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Artifact } from "@/lib/types"
import { Edit, Trash2, X } from "lucide-react"
import { auth } from "@/lib/auth"

interface ArtifactViewerProps {
  artifact: Artifact | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (artifact: Artifact) => void
  onDelete?: (artifact: Artifact) => void
}

export function ArtifactViewer({ artifact, isOpen, onClose, onEdit, onDelete }: ArtifactViewerProps) {
  if (!artifact) return null

  const currentUser = auth.getCurrentUser()
  const isAdmin = currentUser?.role === "admin"

  // Format capture date
  const formatCaptureDate = () => {
    if (!artifact.captureDate) return "N/A"

    const parts = artifact.captureDate.split("/")
    if (parts.length === 3) {
      return `${parts[0]}/${parts[1]}/${parts[2]}`
    }

    try {
      const date = new Date(artifact.captureDate)
      if (!isNaN(date.getTime())) {
        return date
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "/")
      }
    } catch (e) {
      // Fall back to original
    }

    return artifact.captureDate
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none max-h-none w-screen h-screen overflow-hidden m-0 rounded-none border-0 p-0 bg-gray-50">
        <div className="h-full flex">
          {/* Main Content Area */}
          <div className="flex-1 p-12 bg-white border-2 border-gray-300 m-4 mr-2">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <h1 className="font-mono text-xl font-bold tracking-wide uppercase">{artifact.title}</h1>
              <div className="flex items-center gap-8">
                <div className="font-mono text-sm">
                  <span className="font-bold">CAPTURE DATE:</span>
                  <span className="ml-4">{formatCaptureDate()}</span>
                </div>
                <Button onClick={onClose} variant="ghost" size="sm" className="p-1">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* 3D Viewer */}
            <div className="mb-8 bg-gray-100 border border-gray-300 aspect-[4/3] flex items-center justify-center">
              {artifact.supersplatUrl ? (
                <iframe
                  src={artifact.supersplatUrl}
                  className="w-full h-full"
                  title={`3D view of ${artifact.title}`}
                  allowFullScreen
                />
              ) : artifact.imageUrl ? (
                <img
                  src={artifact.imageUrl || "/placeholder.svg"}
                  alt={artifact.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-gray-400 font-mono text-sm">NO 3D DATA AVAILABLE</div>
              )}
            </div>

            {/* Description Section */}
            <div className="border border-gray-300 rounded">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                <h2 className="font-mono text-sm font-bold">DESCRIPTION</h2>
              </div>
              <div className="p-4">
                <p className="font-mono text-sm leading-relaxed">
                  {artifact.description || "No description available for this artifact."}
                </p>
              </div>
            </div>

            {/* Admin Controls */}
            {isAdmin && (
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={() => onEdit?.(artifact)}
                  variant="outline"
                  size="sm"
                  className="font-mono border-black"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  EDIT
                </Button>
                <Button onClick={() => onDelete?.(artifact)} variant="destructive" size="sm" className="font-mono">
                  <Trash2 className="w-4 h-4 mr-2" />
                  DELETE
                </Button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-80 p-4 pr-4">
            <div className="bg-white border-2 border-gray-300 h-full">
              {/* Info Header */}
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                <h2 className="font-mono text-sm font-bold">INFO</h2>
              </div>

              {/* Metadata */}
              <div className="p-4 space-y-4">
                <div className="border border-gray-300 rounded p-3 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-mono text-xs font-bold">REGION:</span>
                    <span className="font-mono text-xs">{artifact.location || "N/A"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-mono text-xs font-bold">SCANNER:</span>
                    <span className="font-mono text-xs">{artifact.scanner || "N/A"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-mono text-xs font-bold">ARTIST:</span>
                    <span className="font-mono text-xs">{artifact.artist || "N/A"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-mono text-xs font-bold">CATEGORY:</span>
                    <span className="font-mono text-xs">{artifact.category || "N/A"}</span>
                  </div>

                  {artifact.supersplatUrl && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-xs font-bold">LINK:</span>
                        <a
                          href={artifact.supersplatUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-blue-600 hover:text-blue-800 break-all text-right ml-2"
                        >
                          {artifact.supersplatUrl.length > 30
                            ? `${artifact.supersplatUrl.substring(0, 30)}...`
                            : artifact.supersplatUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tags if available */}
                {artifact.tags && artifact.tags.length > 0 && (
                  <div className="border border-gray-300 rounded p-3">
                    <h3 className="font-mono text-xs font-bold mb-2">TAGS:</h3>
                    <div className="flex flex-wrap gap-1">
                      {artifact.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-mono">
                          {tag.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
