"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Eye,
  Download,
  Calendar,
  MapPin,
  Grid,
  List,
  Filter,
  ChevronDown,
  X,
  Play,
  ShoppingCart,
  Archive,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PLYViewer } from "@/components/ply-viewer"
import { useAuth } from "@/components/auth-provider"

interface ArtifactGalleryProps {
  isPublicView?: boolean
}

export function ArtifactGallery({ isPublicView = false }: ArtifactGalleryProps) {
  const { user } = useAuth()
  const [artifacts, setArtifacts] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedArtifact, setSelectedArtifact] = useState<any | null>(null)
  const [showPLYViewer, setShowPLYViewer] = useState(false)

  useEffect(() => {
    const loadArtifacts = () => {
      try {
        const storedArtifacts = localStorage.getItem("okyena-artifacts")
        if (storedArtifacts) {
          setArtifacts(JSON.parse(storedArtifacts))
        }
      } catch (error) {
        console.error("Failed to load artifacts:", error)
      }
    }

    loadArtifacts()

    // Listen for storage changes to update when new artifacts are added
    const handleStorageChange = () => {
      loadArtifacts()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const categories = artifacts.length > 0 ? [...new Set(artifacts.map((a) => a.category))] : []
  const regions = artifacts.length > 0 ? [...new Set(artifacts.map((a) => a.region))] : []
  const periods = artifacts.length > 0 ? [...new Set(artifacts.map((a) => a.period))] : []

  const filteredArtifacts = artifacts
    .filter((artifact) => {
      const matchesSearch =
        artifact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artifact.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artifact.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === "all" || artifact.category === selectedCategory
      const matchesRegion = selectedRegion === "all" || artifact.region === selectedRegion
      const matchesPeriod = selectedPeriod === "all" || artifact.period === selectedPeriod
      return matchesSearch && matchesCategory && matchesRegion && matchesPeriod
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        case "oldest":
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
        case "name":
          return a.name.localeCompare(b.name)
        case "category":
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

  const clearFilters = () => {
    setSelectedCategory("all")
    setSelectedRegion("all")
    setSelectedPeriod("all")
    setSearchTerm("")
  }

  const openPLYViewer = (artifact: any) => {
    setSelectedArtifact(artifact)
    setShowPLYViewer(true)
  }

  const purchaseNFT = (artifact: any) => {
    if (artifact.nftUrl) {
      window.open(artifact.nftUrl, "_blank")
    }
  }

  if (showPLYViewer && selectedArtifact) {
    return (
      <div className="fixed inset-0 z-50">
        <PLYViewer artifact={selectedArtifact} />
        <Button
          onClick={() => setShowPLYViewer(false)}
          className="fixed top-4 left-4 z-50 bg-black text-stone-100 border-2 border-black hover:bg-stone-800 font-mono rounded-none"
        >
          ← BACK TO {isPublicView ? "ARCHIVE" : "GALLERY"}
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 relative z-10">
      {/* Enhanced Search and Filters */}
      <Card className="bg-stone-100 border-2 border-black rounded-none shadow-none">
        <CardHeader>
          <div className="border-b border-black pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="font-mono font-bold tracking-wider uppercase text-xl">
                {isPublicView ? "HERITAGE ARCHIVE" : "HERITAGE ARCHIVE GALLERY"}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 font-mono font-bold bg-stone-100 border-2 border-black hover:bg-stone-200 rounded-none"
                >
                  <Filter className="w-4 h-4" />
                  <span>FILTERS</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`font-mono font-bold rounded-none ${
                    viewMode === "grid"
                      ? "bg-black text-stone-100 border-2 border-black"
                      : "bg-stone-100 border-2 border-black hover:bg-stone-200"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`font-mono font-bold rounded-none ${
                    viewMode === "list"
                      ? "bg-black text-stone-100 border-2 border-black"
                      : "bg-stone-100 border-2 border-black hover:bg-stone-200"
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
            {isPublicView && (
              <CardDescription className="font-mono tracking-wider uppercase text-sm mt-1">
                EXPLORE GHANA'S DIGITAL HERITAGE • PURCHASE NFTS TO SUPPORT PRESERVATION
              </CardDescription>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="SEARCH ARTIFACTS, DESCRIPTIONS, TAGS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-stone-100 border-2 border-black font-mono rounded-none focus:ring-0 focus:border-black"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[200px] bg-stone-100 border-2 border-black font-mono rounded-none focus:ring-0 focus:border-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-stone-100 border-2 border-black font-mono rounded-none">
                <SelectItem value="newest">NEWEST FIRST</SelectItem>
                <SelectItem value="oldest">OLDEST FIRST</SelectItem>
                <SelectItem value="name">NAME A-Z</SelectItem>
                <SelectItem value="category">CATEGORY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showFilters && (
            <div className="grid gap-4 md:grid-cols-3 pt-4 border-t border-black">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-stone-100 border-2 border-black font-mono rounded-none focus:ring-0 focus:border-black">
                  <SelectValue placeholder="ALL CATEGORIES" />
                </SelectTrigger>
                <SelectContent className="bg-stone-100 border-2 border-black font-mono rounded-none">
                  <SelectItem value="all">ALL CATEGORIES</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="bg-stone-100 border-2 border-black font-mono rounded-none focus:ring-0 focus:border-black">
                  <SelectValue placeholder="ALL REGIONS" />
                </SelectTrigger>
                <SelectContent className="bg-stone-100 border-2 border-black font-mono rounded-none">
                  <SelectItem value="all">ALL REGIONS</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="bg-stone-100 border-2 border-black font-mono rounded-none focus:ring-0 focus:border-black">
                  <SelectValue placeholder="ALL PERIODS" />
                </SelectTrigger>
                <SelectContent className="bg-stone-100 border-2 border-black font-mono rounded-none">
                  <SelectItem value="all">ALL PERIODS</SelectItem>
                  {periods.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(selectedCategory !== "all" || selectedRegion !== "all" || selectedPeriod !== "all" || searchTerm) && (
            <div className="flex items-center justify-between pt-3 border-t border-black">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono font-bold tracking-wider uppercase">ACTIVE FILTERS:</span>
                {selectedCategory !== "all" && (
                  <span className="border border-black px-2 py-1 font-mono text-xs tracking-wider uppercase">
                    {selectedCategory}
                  </span>
                )}
                {selectedRegion !== "all" && (
                  <span className="border border-black px-2 py-1 font-mono text-xs tracking-wider uppercase">
                    {selectedRegion}
                  </span>
                )}
                {selectedPeriod !== "all" && (
                  <span className="border border-black px-2 py-1 font-mono text-xs tracking-wider uppercase">
                    {selectedPeriod}
                  </span>
                )}
                {searchTerm && (
                  <span className="border border-black px-2 py-1 font-mono text-xs tracking-wider uppercase">
                    "{searchTerm}"
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="font-mono font-bold tracking-wider uppercase border border-black hover:bg-stone-200 rounded-none"
              >
                <X className="w-4 h-4 mr-1" />
                CLEAR ALL
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between border-b border-black pb-3">
        <p className="font-mono font-bold tracking-wider uppercase text-sm">
          SHOWING {filteredArtifacts.length} OF {artifacts.length} ARTIFACTS
        </p>
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold tracking-wider uppercase text-sm">TOTAL ARCHIVE SIZE:</span>
          <span className="border border-black px-2 py-1 font-mono text-xs tracking-wider uppercase">
            {artifacts.length > 0
              ? artifacts.reduce((sum, a) => sum + Number.parseFloat(a.fileSize), 0).toFixed(1)
              : "0.0"}{" "}
            MB
          </span>
        </div>
      </div>

      {/* Enhanced Artifacts Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredArtifacts.map((artifact) => (
            <Card key={artifact.id} className="bg-stone-100 border-2 border-black rounded-none shadow-none group">
              <div className="aspect-square bg-stone-200 border-b-2 border-black relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="w-20 h-20 border-2 border-black flex items-center justify-center mx-auto mb-3 group-hover:bg-black group-hover:text-stone-100 transition-colors">
                      <span className="font-bold text-2xl font-mono">3D</span>
                    </div>
                    <p className="text-sm font-mono font-bold tracking-wider uppercase">GAUSSIAN SPLAT MODEL</p>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="border border-black px-2 py-1 font-mono text-xs tracking-wider uppercase bg-stone-100">
                    {artifact.status.toUpperCase()}
                  </span>
                </div>
                {isPublicView && artifact.nftAvailable && (
                  <div className="absolute top-3 left-3">
                    <span className="border border-black px-2 py-1 font-mono text-xs tracking-wider uppercase bg-green-100">
                      NFT AVAILABLE
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/80 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => openPLYViewer(artifact)}
                      className="bg-stone-100 text-black hover:bg-stone-200 font-mono font-bold border-2 border-black rounded-none"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      VIEW 3D
                    </Button>
                    {isPublicView && artifact.nftAvailable && (
                      <Button
                        onClick={() => purchaseNFT(artifact)}
                        className="bg-green-500 text-white hover:bg-green-600 font-mono font-bold border-2 border-black rounded-none"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="border-b border-black pb-2">
                  <CardTitle className="text-lg leading-tight font-mono font-bold tracking-wider uppercase">
                    {artifact.name}
                  </CardTitle>
                  <CardDescription className="mt-2 flex items-center justify-between">
                    <span className="border border-black px-2 py-1 font-mono text-xs tracking-wider uppercase">
                      {artifact.category}
                    </span>
                    {isPublicView && artifact.nftPrice && (
                      <span className="border border-green-500 px-2 py-1 font-mono text-xs tracking-wider uppercase text-green-600">
                        {artifact.nftPrice}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm mb-3 font-mono line-clamp-3">{artifact.description}</p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate tracking-wider uppercase">{artifact.region}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span className="tracking-wider uppercase">{artifact.period}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {artifact.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs border border-black px-1 py-0.5 font-mono tracking-wider uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                  {artifact.tags.length > 3 && (
                    <span className="text-xs border border-black px-1 py-0.5 font-mono tracking-wider uppercase">
                      +{artifact.tags.length - 3}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-black">
                  <span className="text-xs font-mono font-bold tracking-wider uppercase">{artifact.fileSize}</span>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      onClick={() => openPLYViewer(artifact)}
                      className="bg-stone-100 border border-black hover:bg-stone-200 font-mono font-bold rounded-none"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    {user?.role === "admin" && (
                      <Button
                        size="sm"
                        className="bg-stone-100 border border-black hover:bg-stone-200 font-mono font-bold rounded-none"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    )}
                    {isPublicView && artifact.nftAvailable && (
                      <Button
                        size="sm"
                        onClick={() => purchaseNFT(artifact)}
                        className="bg-green-500 text-white border border-black hover:bg-green-600 font-mono font-bold rounded-none"
                      >
                        <ShoppingCart className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-0">
          {filteredArtifacts.map((artifact) => (
            <Card
              key={artifact.id}
              className="bg-stone-100 border-2 border-black rounded-none shadow-none border-b-0 last:border-b-2"
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <div className="w-32 h-32 bg-stone-200 border-2 border-black flex items-center justify-center flex-shrink-0 relative group">
                    <div className="w-12 h-12 border border-black flex items-center justify-center">
                      <span className="font-bold text-lg font-mono">3D</span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="text-xs font-mono font-bold tracking-wider uppercase border border-black px-1 py-0.5 bg-stone-100">
                        {artifact.status}
                      </span>
                    </div>
                    {isPublicView && artifact.nftAvailable && (
                      <div className="absolute top-2 left-2">
                        <span className="text-xs font-mono font-bold tracking-wider uppercase border border-black px-1 py-0.5 bg-green-100">
                          NFT
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3 border-b border-black pb-3">
                      <div>
                        <h3 className="font-mono font-bold text-xl mb-2 tracking-wider uppercase">{artifact.name}</h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="border border-black px-2 py-1 font-mono font-bold text-xs tracking-wider uppercase">
                            {artifact.category}
                          </span>
                          <span className="border border-black px-2 py-1 font-mono text-xs tracking-wider uppercase">
                            {artifact.region}
                          </span>
                          <span className="border border-black px-2 py-1 font-mono text-xs tracking-wider uppercase">
                            {artifact.period}
                          </span>
                          {isPublicView && artifact.nftPrice && (
                            <span className="border border-green-500 px-2 py-1 font-mono text-xs tracking-wider uppercase text-green-600">
                              {artifact.nftPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => openPLYViewer(artifact)}
                          className="bg-black text-stone-100 border-2 border-black hover:bg-stone-800 font-mono font-bold rounded-none"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          VIEW 3D
                        </Button>
                        {user?.role === "admin" && (
                          <Button
                            size="sm"
                            className="bg-stone-100 border-2 border-black hover:bg-stone-200 font-mono font-bold rounded-none"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        {isPublicView && artifact.nftAvailable && (
                          <Button
                            size="sm"
                            onClick={() => purchaseNFT(artifact)}
                            className="bg-green-500 text-white border-2 border-black hover:bg-green-600 font-mono font-bold rounded-none"
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            BUY NFT
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="mb-3 font-mono">{artifact.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono mb-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span className="tracking-wider uppercase">{artifact.region}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span className="tracking-wider uppercase">{artifact.period}</span>
                      </div>
                      <span className="tracking-wider uppercase">SIZE: {artifact.fileSize}</span>
                      <span className="tracking-wider uppercase">
                        UPLOADED: {new Date(artifact.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {artifact.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs border border-black px-1 py-0.5 font-mono tracking-wider uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredArtifacts.length === 0 && artifacts.length === 0 && (
        <Card className="bg-stone-100 border-2 border-black rounded-none shadow-none">
          <CardContent className="text-center py-12">
            <Archive className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-mono font-bold mb-2 tracking-wider uppercase">ARCHIVE IS EMPTY</h3>
            <p className="font-mono mb-4 tracking-wider uppercase">
              {isPublicView
                ? "NO ARTIFACTS HAVE BEEN UPLOADED YET. CHECK BACK SOON!"
                : "START BUILDING THE HERITAGE ARCHIVE BY UPLOADING YOUR FIRST ARTIFACT"}
            </p>
            {!isPublicView && (
              <Button
                onClick={() => (window.location.hash = "#upload")}
                className="bg-black text-stone-100 border-2 border-black hover:bg-stone-800 font-mono font-bold rounded-none"
              >
                UPLOAD FIRST ARTIFACT
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {filteredArtifacts.length === 0 && artifacts.length > 0 && (
        <Card className="bg-stone-100 border-2 border-black rounded-none shadow-none">
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-mono font-bold mb-2 tracking-wider uppercase">NO ARTIFACTS FOUND</h3>
            <p className="font-mono mb-4 tracking-wider uppercase">TRY ADJUSTING YOUR SEARCH TERMS OR FILTERS</p>
            <Button
              onClick={clearFilters}
              className="bg-black text-stone-100 border-2 border-black hover:bg-stone-800 font-mono font-bold rounded-none"
            >
              CLEAR ALL FILTERS
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
