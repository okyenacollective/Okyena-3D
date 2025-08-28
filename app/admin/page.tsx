"use client"

import { useState, useEffect } from "react"
import { UploadForm } from "@/components/upload-form"
import { Button } from "@/components/ui/button"
import { Trash2, RefreshCw, ArrowLeft, Edit, Eye } from "lucide-react"
import type { Artifact } from "@/lib/types"
import { AuthGuard } from "@/components/auth-guard"
import { EditArtifactForm } from "@/components/edit-artifact-form"
import Link from "next/link"

export default function AdminPage() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)

  const fetchArtifacts = async () => {
    try {
      const response = await fetch("/api/artifacts")
      if (response.ok) {
        const data = await response.json()
        setArtifacts(data)
      }
    } catch (error) {
      console.error("Failed to fetch artifacts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteArtifact = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    try {
      const response = await fetch(`/api/artifacts/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchArtifacts()
      }
    } catch (error) {
      console.error("Failed to delete artifact:", error)
      alert("Failed to delete artifact. Please try again.")
    }
  }

  const handleEditArtifact = (artifact: Artifact) => {
    setEditingArtifact(artifact)
    setIsEditFormOpen(true)
  }

  const handleViewArtifact = (id: string) => {
    window.open(`/viewer/${id}`, "_blank")
  }

  useEffect(() => {
    fetchArtifacts()
  }, [])

  return (
    <AuthGuard requireAdmin>
      <div className="min-h-screen bg-white p-4 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold font-mono tracking-wide mb-2">ADMIN PANEL</h1>
                <p className="text-gray-600 font-mono">Manage artifacts in the Okyena Collective archive</p>
              </div>
              <Link href="/">
                <Button variant="outline" className="font-mono border-black bg-transparent">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  BACK TO HOME
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <UploadForm onSuccess={fetchArtifacts} />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-mono">ARTIFACT MANAGEMENT</h2>
                <Button
                  onClick={fetchArtifacts}
                  variant="outline"
                  size="sm"
                  className="font-mono border-black bg-transparent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  REFRESH
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <p className="font-mono text-gray-600">LOADING ARTIFACTS...</p>
                </div>
              ) : artifacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-mono text-gray-600">NO ARTIFACTS FOUND</p>
                  <p className="font-mono text-sm text-gray-500 mt-2">
                    Upload your first artifact using the form on the left
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto border-2 border-black p-4">
                  {artifacts.map((artifact) => (
                    <div
                      key={artifact.id}
                      className="flex items-center justify-between p-4 border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          {/* Preview Image */}
                          <div className="w-16 h-12 flex-shrink-0 border border-gray-300 rounded overflow-hidden">
                            {artifact.imageUrl ? (
                              <img
                                src={artifact.imageUrl || "/placeholder.svg"}
                                alt={`Preview of ${artifact.title}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Show 3D placeholder if image fails
                                  const target = e.target as HTMLImageElement
                                  target.style.display = "none"
                                  const parent = target.parentElement
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                        <div class="text-gray-400 text-xs font-mono">3D</div>
                                      </div>
                                    `
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                <div className="text-gray-400 text-xs font-mono">3D</div>
                              </div>
                            )}
                          </div>

                          {/* Artifact Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-mono font-bold text-sm truncate">{artifact.title}</h3>
                            <p className="font-mono text-xs text-gray-600 truncate">
                              {artifact.location || "No location"}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="font-mono text-xs text-gray-500">
                                {artifact.category || "No category"}
                              </span>
                              <span className="font-mono text-xs text-gray-500">
                                {artifact.captureDate || "No date"}
                              </span>
                            </div>
                            {artifact.tags && artifact.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {artifact.tags.slice(0, 3).map((tag, index) => (
                                  <span key={index} className="px-1 py-0.5 bg-gray-200 text-xs font-mono rounded">
                                    {tag}
                                  </span>
                                ))}
                                {artifact.tags.length > 3 && (
                                  <span className="text-xs font-mono text-gray-500">
                                    +{artifact.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          onClick={() => handleViewArtifact(artifact.id)}
                          variant="outline"
                          size="sm"
                          className="font-mono border-gray-400 text-gray-600 hover:bg-gray-200"
                          title="View Artifact"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleEditArtifact(artifact)}
                          variant="outline"
                          size="sm"
                          className="font-mono border-blue-400 text-blue-600 hover:bg-blue-50"
                          title="Edit Artifact"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => deleteArtifact(artifact.id, artifact.title)}
                          variant="destructive"
                          size="sm"
                          title="Delete Artifact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {artifacts.length > 0 && (
                <div className="text-center pt-4 border-t border-gray-300">
                  <p className="font-mono text-sm text-gray-600">
                    {artifacts.length} ARTIFACT{artifacts.length !== 1 ? "S" : ""} TOTAL
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Artifact Modal */}
        <EditArtifactForm
          artifact={editingArtifact}
          isOpen={isEditFormOpen}
          onClose={() => {
            setIsEditFormOpen(false)
            setEditingArtifact(null)
          }}
          onSuccess={() => {
            fetchArtifacts()
            setIsEditFormOpen(false)
            setEditingArtifact(null)
          }}
        />
      </div>
    </AuthGuard>
  )
}
