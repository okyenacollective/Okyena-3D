"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Artifact } from "@/lib/types"
import Link from "next/link"
import { X, ChevronDown, ChevronUp, Info, AlertCircle, ArrowLeft, Share2 } from "lucide-react"

interface ViewerPageProps {
  params: { id: string }
}

export default function ViewerPage({ params }: ViewerPageProps) {
  const [artifact, setArtifact] = useState<Artifact | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false) // Start with info hidden on mobile
  const [metadataOpen, setMetadataOpen] = useState(true)
  const [descriptionOpen, setDescriptionOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      // Show info by default on desktop
      if (window.innerWidth >= 1024) {
        setShowInfo(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const fetchArtifact = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/artifacts/${params.id}`)

      if (!response.ok) {
        if (response.status === 404) {
          setError("Artifact not found")
        } else {
          setError(`Failed to load artifact (${response.status})`)
        }
        return
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        setError("Invalid response format")
        return
      }

      const data = await response.json()
      setArtifact(data)
    } catch (error) {
      console.error("Failed to fetch artifact:", error)
      setError("Failed to load artifact. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share && artifact) {
      try {
        await navigator.share({
          title: artifact.title,
          text: `Check out this artifact: ${artifact.title}`,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchArtifact()
    }
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="font-mono text-sm sm:text-base">LOADING ARTIFACT...</p>
        </div>
      </div>
    )
  }

  if (error || !artifact) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="font-mono text-xl font-bold mb-4">ERROR</h1>
          <p className="font-mono mb-6 text-gray-300 text-sm sm:text-base">{error || "Artifact not found"}</p>
          <div className="space-y-3">
            <Link href="/gallery">
              <Button variant="outline" className="font-mono w-full bg-transparent py-3">
                BACK TO GALLERY
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="font-mono w-full bg-transparent py-3">
                BACK TO HOME
              </Button>
            </Link>
            <Button onClick={fetchArtifact} variant="outline" className="font-mono w-full bg-transparent py-3">
              TRY AGAIN
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const tags = artifact.tags || ["TRADITIONAL", "PERFORMANCE ART", "HUMAN FIGURE"]

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-300 p-3">
        <div className="flex items-center justify-between">
          <Link href="/gallery">
            <Button variant="outline" size="sm" className="font-mono text-xs border-black bg-transparent">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>

          <h1 className="font-mono font-bold text-sm tracking-wide text-center flex-1 mx-3 truncate">
            {artifact.title.toUpperCase()}
          </h1>

          <div className="flex gap-2">
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="font-mono text-xs border-black bg-transparent"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setShowInfo(!showInfo)}
              variant="outline"
              size="sm"
              className="font-mono text-xs border-black bg-transparent"
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white border-b border-gray-300 p-3">
        <div className="flex items-center justify-between">
          <Link href="/gallery">
            <Button variant="outline" size="sm" className="font-mono text-xs border-black bg-transparent">
              ← BACK TO ARCHIVE
            </Button>
          </Link>

          <div className="flex items-center gap-4">
            <h1 className="font-mono font-bold text-lg tracking-wide">{artifact.title.toUpperCase()}</h1>
            <div className="flex gap-2">
              <span className="px-2 py-1 border border-gray-400 text-xs font-mono">
                {artifact.category || "ARTIFACT"}
              </span>
              <span className="px-2 py-1 border border-gray-400 text-xs font-mono">SUPERSPLAT INTEGRATED</span>
              <span className="px-2 py-1 border border-gray-400 text-xs font-mono">
                {artifact.location?.split(",")[1]?.trim() || "GHANA"}
              </span>
            </div>
          </div>

          <Button
            onClick={() => setShowInfo(!showInfo)}
            variant="outline"
            size="sm"
            className="font-mono text-xs border-black"
          >
            {showInfo ? "HIDE INFO" : "SHOW INFO"}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Mobile Info Panel (Collapsible) */}
        {isMobile && showInfo && (
          <div className="bg-white border-b border-gray-300 p-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono font-bold text-sm">ARTIFACT INFO</h3>
              <Button onClick={() => setShowInfo(false)} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Metadata Section */}
            <Collapsible open={metadataOpen} onOpenChange={setMetadataOpen} className="mb-4">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-2 border border-gray-300 font-mono text-sm font-bold">
                METADATA
                {metadataOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="border-gray-300 mt-1">
                  <CardContent className="p-3 space-y-2 font-mono text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">PERIOD:</span>
                      <span>{artifact.period || "Unknown"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">REGION:</span>
                      <span>{artifact.location || "Unknown"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">MATERIALS:</span>
                      <span>{artifact.materials || "Unknown"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">SIZE:</span>
                      <span>{artifact.size || "Unknown"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">CATEGORY:</span>
                      <span>{artifact.category || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">ARTIST:</span>
                      <span>{artifact.artist || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">SCANNER:</span>
                      <span>{artifact.scanner || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">UPLOADED:</span>
                      <span>{new Date(artifact.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Description Section */}
            <Collapsible open={descriptionOpen} onOpenChange={setDescriptionOpen}>
              <CollapsibleTrigger className="flex justify-between items-center w-full p-2 border border-gray-300 font-mono text-sm font-bold">
                DESCRIPTION
                {descriptionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="border-gray-300 mt-1">
                  <CardContent className="p-3">
                    <p className="font-mono text-xs leading-relaxed">
                      {artifact.description || "No description available for this artifact."}
                    </p>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* 3D Viewer */}
        <div className="flex-1 relative">
          {/* Desktop Title Overlay */}
          <div className="hidden lg:block absolute top-4 left-4 z-10">
            <div className="bg-white border border-gray-300 p-2">
              <h2 className="font-mono font-bold text-sm">{artifact.title.toUpperCase()}</h2>
              <span className="font-mono text-xs border border-gray-400 px-1">3D VIEWER</span>
            </div>
          </div>

          {artifact.supersplatUrl ? (
            <iframe
              src={artifact.supersplatUrl}
              className="w-full h-full min-h-[50vh] lg:min-h-full"
              title={`3D view of ${artifact.title}`}
              allowFullScreen
            />
          ) : artifact.imageUrl ? (
            <div className="w-full h-full min-h-[50vh] lg:min-h-full bg-gray-900 flex items-center justify-center">
              <img
                src={artifact.imageUrl || "/placeholder.svg"}
                alt={artifact.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-full min-h-[50vh] lg:min-h-full bg-gray-900 flex items-center justify-center text-white font-mono">
              <div className="text-center">
                <div className="text-4xl mb-4">🏺</div>
                <p className="text-sm">NO 3D DATA AVAILABLE</p>
              </div>
            </div>
          )}

          {/* Mobile Bottom Controls */}
          <div className="lg:hidden absolute bottom-4 left-4 right-4">
            <div className="bg-white bg-opacity-90 backdrop-blur-sm border border-gray-300 rounded p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-mono text-xs font-bold">{artifact.location}</p>
                  <p className="font-mono text-xs text-gray-600">
                    {artifact.period ||
                      (artifact.captureDate ? new Date(artifact.captureDate).toLocaleDateString() : "Period unknown")}
                  </p>
                </div>
                <Button onClick={handleShare} variant="outline" size="sm" className="font-mono border-black bg-white">
                  <Share2 className="w-4 h-4 mr-1" />
                  SHARE
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Right Sidebar */}
        {!isMobile && showInfo && (
          <div className="w-80 bg-white border-l border-gray-300 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono font-bold text-sm">ARTIFACT INFO</h3>
              <Button onClick={() => setShowInfo(false)} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Metadata Section */}
            <Collapsible open={metadataOpen} onOpenChange={setMetadataOpen} className="mb-4">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-2 border border-gray-300 font-mono text-sm font-bold">
                METADATA
                {metadataOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="border-gray-300 mt-1">
                  <CardContent className="p-3 space-y-2 font-mono text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">PERIOD:</span>
                      <span>{artifact.period || "Unknown"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">REGION:</span>
                      <span>{artifact.location || "Unknown"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">MATERIALS:</span>
                      <span>{artifact.materials || "Unknown"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">SIZE:</span>
                      <span>{artifact.size || "Unknown"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">COLLECTOR:</span>
                      <span>Okyena Collective</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">UPLOADED:</span>
                      <span>{new Date(artifact.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">CATEGORY:</span>
                      <span>{artifact.category || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">ARTIST:</span>
                      <span>{artifact.artist || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-bold">SCANNER:</span>
                      <span>{artifact.scanner || "N/A"}</span>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Description Section */}
            <Collapsible open={descriptionOpen} onOpenChange={setDescriptionOpen} className="mb-4">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-2 border border-gray-300 font-mono text-sm font-bold">
                DESCRIPTION
                {descriptionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="border-gray-300 mt-1">
                  <CardContent className="p-3">
                    <p className="font-mono text-xs leading-relaxed">
                      {artifact.description || "No description available for this artifact."}
                    </p>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* Tags Section */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 border border-gray-400 text-xs font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
