"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArtifactCard } from "@/components/artifact-card"
import { EditArtifactForm } from "@/components/edit-artifact-form"
import type { Artifact } from "@/lib/types"
import Link from "next/link"
import { ArrowLeft, Search, Settings, Maximize2, Grid, List, Filter, X, Menu } from "lucide-react"
import { auth } from "@/lib/auth"
import { Label } from "@/components/ui/label"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function GalleryPage() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [filteredArtifacts, setFilteredArtifacts] = useState<Artifact[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentUser, setCurrentUser] = useState(auth.getCurrentUser())
  const [editingArtifact, setEditingArtifact] = useState<Artifact | null>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const router = useRouter()

  const fetchArtifacts = async () => {
    try {
      console.log("Gallery - Fetching artifacts from API")
      setFetchError(null)

      const response = await fetch("/api/artifacts", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      console.log("Gallery - API response status:", response.status)
      console.log("Gallery - API response headers:", Object.fromEntries(response.headers.entries()))

      const responseText = await response.text()
      console.log("Gallery - Raw response (first 200 chars):", responseText.slice(0, 200))

      if (!response.ok) {
        console.error("Gallery - API response not ok:", response.status, response.statusText)
        setFetchError(`API error: ${response.status} ${response.statusText}`)
        setArtifacts([])
        return
      }

      // Check if response is actually JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Gallery - Failed to parse JSON:", parseError)
        console.error("Gallery - Response was:", responseText.slice(0, 500))
        setFetchError("Server returned invalid JSON response")
        setArtifacts([])
        return
      }

      console.log("Gallery - Successfully parsed", Array.isArray(data) ? data.length : 0, "artifacts")

      if (Array.isArray(data)) {
        setArtifacts(data)
        setFilteredArtifacts(data)
      } else if (data.error) {
        console.error("Gallery - API returned error:", data.error)
        setFetchError(data.error)
        setArtifacts([])
      } else {
        console.error("Gallery - Unexpected response format:", data)
        setFetchError("Unexpected response format from API")
        setArtifacts([])
      }
    } catch (error) {
      console.error("Gallery - Network or other error:", error)
      setFetchError(error instanceof Error ? error.message : "Network error occurred")
      setArtifacts([])
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = artifacts

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (artifact) =>
          artifact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          artifact.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          artifact.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          artifact.artist.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply category filter
    if (filterCategory !== "") {
      filtered = filtered.filter((artifact) => artifact.category.toLowerCase().includes(filterCategory.toLowerCase()))
    }

    setFilteredArtifacts(filtered)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleArtifactClick = (artifact: Artifact) => {
    router.push(`/viewer/${artifact.id}`)
  }

  const handleEditArtifact = (artifact: Artifact) => {
    setEditingArtifact(artifact)
    setIsEditFormOpen(true)
  }

  const handleDeleteArtifact = async (artifact: Artifact) => {
    if (!confirm(`Are you sure you want to delete "${artifact.title}"?`)) return

    try {
      const response = await fetch(`/api/artifacts/${artifact.id}`, {
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

  useEffect(() => {
    fetchArtifacts()
  }, [])

  useEffect(() => {
    const checkAuth = () => {
      setCurrentUser(auth.getCurrentUser())
    }

    window.addEventListener("storage", checkAuth)
    return () => window.removeEventListener("storage", checkAuth)
  }, [])

  useEffect(() => {
    applyFilters()
  }, [artifacts, searchTerm, filterCategory])

  const getAvailableCategories = () => {
    const categories = new Set<string>()
    artifacts.forEach((artifact) => {
      if (artifact.category && artifact.category.trim()) {
        categories.add(artifact.category.trim())
      }
    })
    return Array.from(categories).sort()
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed top-0 right-0 h-full w-80 bg-white border-l-2 border-black p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-mono font-bold text-lg">MENU</h2>
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full font-mono border-black bg-transparent justify-start">
                  <ArrowLeft className="w-4 h-4 mr-3" />
                  BACK TO HOME
                </Button>
              </Link>

              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full font-mono border-black bg-transparent justify-start">
                  CONTACT US
                </Button>
              </Link>

              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full font-mono border-black bg-transparent justify-start">
                  <Settings className="w-4 h-4 mr-3" />
                  ADMIN
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filters Overlay */}
      {showMobileFilters && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowMobileFilters(false)}
        >
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black p-6 rounded-t-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-mono font-bold text-lg">FILTERS & SEARCH</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowMobileFilters(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="font-mono font-bold text-sm mb-2 block">SEARCH</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search artifacts..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 font-mono border-black"
                  />
                </div>
              </div>

              <div>
                <Label className="font-mono font-bold text-sm mb-2 block">CATEGORY</Label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full font-mono border-2 border-black px-3 py-2 bg-white text-sm rounded"
                >
                  <option value="">ALL CATEGORIES</option>
                  {getAvailableCategories().map((category) => (
                    <option key={category} value={category}>
                      {category.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="font-mono font-bold text-sm mb-2 block">VIEW MODE</Label>
                <div className="flex border-2 border-black rounded overflow-hidden">
                  <Button
                    onClick={() => setViewMode("grid")}
                    variant={viewMode === "grid" ? "default" : "outline"}
                    className={`font-mono rounded-none border-0 flex-1 ${
                      viewMode === "grid" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"
                    }`}
                  >
                    <Grid className="w-4 h-4 mr-2" />
                    GRID
                  </Button>
                  <Button
                    onClick={() => setViewMode("list")}
                    variant={viewMode === "list" ? "default" : "outline"}
                    className={`font-mono rounded-none border-0 border-l border-black flex-1 ${
                      viewMode === "list" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-800"
                    }`}
                  >
                    <List className="w-4 h-4 mr-2" />
                    LIST
                  </Button>
                </div>
              </div>

              <Button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-black text-white hover:bg-gray-800 font-mono py-3"
              >
                APPLY FILTERS
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b-2 border-black p-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm" className="font-mono border-black bg-transparent">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-lg font-bold font-mono tracking-wide">ARCHIVE</h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowMobileFilters(true)}
                variant="outline"
                size="sm"
                className="font-mono border-black bg-transparent"
              >
                <Filter className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setMobileMenuOpen(true)}
                variant="outline"
                size="sm"
                className="font-mono border-black bg-transparent"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="outline" className="font-mono border-black bg-transparent">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    BACK TO HOME
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold font-mono tracking-wide">DIGITAL ARCHIVE</h1>
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex border-2 border-black rounded overflow-hidden">
                  <Button
                    onClick={() => setViewMode("grid")}
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    className={`font-mono rounded-none border-0 ${
                      viewMode === "grid" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-50"
                    }`}
                  >
                    <Grid className="w-4 h-4 mr-1" />
                    GRID
                  </Button>
                  <Button
                    onClick={() => setViewMode("list")}
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    className={`font-mono rounded-none border-0 border-l border-black ${
                      viewMode === "list" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-800"
                    }`}
                  >
                    <List className="w-4 h-4 mr-1" />
                    LIST
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="filter" className="font-mono text-sm font-bold">
                    FILTER:
                  </Label>
                  <select
                    id="filter"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="font-mono border-2 border-black px-3 py-1 bg-white text-sm"
                  >
                    <option value="">ALL CATEGORIES</option>
                    {getAvailableCategories().map((category) => (
                      <option key={category} value={category}>
                        {category.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search artifacts..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 font-mono border-black w-64"
                  />
                </div>
                <Link href="/admin">
                  <Button variant="outline" className="font-mono border-black bg-transparent">
                    <Settings className="w-4 h-4 mr-2" />
                    ADMIN
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Gallery Content */}
      <main className="p-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="font-mono text-gray-600 text-sm sm:text-base">LOADING ARTIFACTS...</p>
            </div>
          ) : fetchError ? (
            <div className="text-center py-12">
              <p className="font-mono text-gray-600 mb-4 text-sm sm:text-base">{fetchError}</p>
              <Link href="/admin">
                <Button className="bg-black text-white hover:bg-gray-800 font-mono py-3 px-6">
                  <Settings className="w-4 h-4 mr-2" />
                  ADD FIRST ARTIFACT
                </Button>
              </Link>
            </div>
          ) : filteredArtifacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-mono text-gray-600 mb-4 text-sm sm:text-base">
                {searchTerm ? "NO ARTIFACTS MATCH YOUR SEARCH" : "NO ARTIFACTS FOUND"}
              </p>
              {!searchTerm && (
                <Link href="/admin">
                  <Button className="bg-black text-white hover:bg-gray-800 font-mono py-3 px-6">
                    <Settings className="w-4 h-4 mr-2" />
                    ADD FIRST ARTIFACT
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 sm:mb-6">
                <p className="font-mono text-xs sm:text-sm text-gray-600">
                  {filteredArtifacts.length} ARTIFACT{filteredArtifacts.length !== 1 ? "S" : ""} FOUND
                </p>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredArtifacts.map((artifact) => (
                    <div key={artifact.id} className="relative group h-full">
                      <ArtifactCard artifact={artifact} onClick={() => handleArtifactClick(artifact)} />
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleArtifactClick(artifact)
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white hover:bg-gray-800 p-2 hidden sm:flex"
                        size="sm"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredArtifacts.map((artifact) => (
                    <div key={artifact.id} className="relative group">
                      <Card
                        className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-black bg-white active:scale-[0.99]"
                        onClick={() => handleArtifactClick(artifact)}
                      >
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            {/* Image/Preview */}
                            <div className="w-full sm:w-48 h-32 sm:h-32 flex-shrink-0 sm:border-r-2 border-black">
                              {artifact.imageUrl ? (
                                <img
                                  src={artifact.imageUrl || "/placeholder.svg"}
                                  alt={`Preview of ${artifact.title}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to 3D placeholder if image fails to load
                                    const target = e.target as HTMLImageElement
                                    target.style.display = "none"
                                    target.nextElementSibling?.classList.remove("hidden")
                                  }}
                                />
                              ) : null}
                              {!artifact.imageUrl && (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                                  <div className="text-gray-400 font-mono text-xs mb-1">3D</div>
                                  <div className="w-6 h-6 border border-gray-400 rounded transform rotate-45"></div>
                                </div>
                              )}
                              {/* Hidden fallback for failed image loads */}
                              <div className="hidden w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                                <div className="text-gray-400 font-mono text-xs mb-1">3D</div>
                                <div className="w-6 h-6 border border-gray-400 rounded transform rotate-45"></div>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-mono font-bold text-base sm:text-lg tracking-wide">
                                  {artifact.title}
                                </h3>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleArtifactClick(artifact)
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white hover:bg-gray-800 p-2 hidden sm:flex"
                                  size="sm"
                                >
                                  <Maximize2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <p className="font-mono text-sm text-gray-600 mb-3">{artifact.location}</p>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-sm font-mono mb-3">
                                <div>
                                  <span className="font-bold text-xs">CATEGORY:</span>
                                  <p className="text-gray-700 text-xs sm:text-sm">{artifact.category || "N/A"}</p>
                                </div>
                                <div>
                                  <span className="font-bold text-xs">DATE:</span>
                                  <p className="text-gray-700 text-xs sm:text-sm">{artifact.captureDate || "N/A"}</p>
                                </div>
                                <div>
                                  <span className="font-bold text-xs">ARTIST:</span>
                                  <p className="text-gray-700 text-xs sm:text-sm">{artifact.artist || "N/A"}</p>
                                </div>
                                <div>
                                  <span className="font-bold text-xs">SCANNER:</span>
                                  <p className="text-gray-700 text-xs sm:text-sm">{artifact.scanner || "N/A"}</p>
                                </div>
                              </div>

                              <p className="font-mono text-xs text-gray-600 line-clamp-2">
                                {artifact.description || "No description available."}
                              </p>

                              {/* Mobile Touch Indicator */}
                              <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
                                <p className="font-mono text-xs text-center text-gray-500">TAP TO VIEW IN 3D</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

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
      <Footer />
    </div>
  )
}
