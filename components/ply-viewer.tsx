"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { SuperSplatViewer } from "@/components/supersplat-viewer"
import { Card, CardContent } from "@/components/ui/card"
import { FloatingCubes } from "@/components/floating-cubes"

interface PLYViewerProps {
  artifact: {
    id: number
    name: string
    category: string
    region: string
    period: string
    description: string
    materials: string
    dimensions: string
    tags: string[]
    uploadDate: string
    fileSize: string
    collector: string
    acquisitionDate: string
    artist?: string
    scanner?: string
    supersplatUrl?: string
    embedCode?: string
  }
}

export function PLYViewer({ artifact }: PLYViewerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [descriptionOpen, setDescriptionOpen] = useState(true)
  const [metadataOpen, setMetadataOpen] = useState(true)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")} ${date.getFullYear()}`
  }

  // Mock embed code for demo - in real implementation this would come from the artifact data
  const mockEmbedCode = `<iframe src="https://superspl.at/viewer/demo" width="800" height="600" frameborder="0" allowfullscreen></iframe>`

  return (
    <div className="h-screen bg-stone-100 flex flex-col overflow-hidden relative">
      <FloatingCubes count={6} interactive={true} />
      {/* Header */}
      <div className="border-b-2 border-black p-4 flex-shrink-0 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">{/* Space reserved for back button */}</div>
          <div className="flex items-center space-x-4 flex-1 justify-center">
            <h1 className="text-xl font-mono font-bold tracking-wider uppercase">{artifact.name}</h1>
            <span className="border border-black px-2 py-1 font-mono text-xs tracking-wider uppercase">
              {artifact.category}
            </span>
            <span className="border border-black px-2 py-1 font-mono text-xs tracking-wider uppercase bg-green-100">
              SUPERSPLAT INTEGRATED
            </span>
            <span className="font-mono text-sm tracking-wider uppercase">{artifact.region}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-stone-100 border-2 border-black hover:bg-stone-200 rounded-none font-mono"
            >
              {sidebarOpen ? "HIDE INFO" : "SHOW INFO"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* SuperSplat Viewer */}
        <div className="flex-1 relative">
          <SuperSplatViewer
            embedCode={artifact.embedCode || mockEmbedCode}
            supersplatUrl={artifact.supersplatUrl}
            artifact={{
              name: artifact.name,
              category: artifact.category,
              region: artifact.region,
            }}
          />
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 border-l-2 border-black bg-stone-50 flex flex-col overflow-hidden">
            {/* Sidebar Header */}
            <div className="border-b border-black p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="font-mono font-bold tracking-wider uppercase text-sm">ARTIFACT INFO</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="font-mono rounded-none"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Metadata Section */}
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setMetadataOpen(!metadataOpen)}
                  className="w-full justify-between font-mono font-bold tracking-wider uppercase text-xs p-2 border border-black hover:bg-stone-200 rounded-none"
                >
                  METADATA
                  {metadataOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                {metadataOpen && (
                  <div className="mt-2">
                    <Card className="bg-stone-100 border border-black rounded-none shadow-none">
                      <CardContent className="p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div>
                            <span className="text-gray-600 uppercase">PERIOD:</span>
                            <div className="font-bold">{artifact.period}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 uppercase">REGION:</span>
                            <div className="font-bold">{artifact.region}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 uppercase">MATERIALS:</span>
                            <div className="font-bold">{artifact.materials}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 uppercase">SIZE:</span>
                            <div className="font-bold">{artifact.dimensions}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 uppercase">COLLECTOR:</span>
                            <div className="font-bold">{artifact.collector}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 uppercase">UPLOADED:</span>
                            <div className="font-bold">{formatDate(artifact.uploadDate)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* Description Section */}
              <div>
                <Button
                  variant="ghost"
                  onClick={() => setDescriptionOpen(!descriptionOpen)}
                  className="w-full justify-between font-mono font-bold tracking-wider uppercase text-xs p-2 border border-black hover:bg-stone-200 rounded-none"
                >
                  DESCRIPTION
                  {descriptionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                {descriptionOpen && (
                  <div className="mt-2">
                    <Card className="bg-stone-100 border border-black rounded-none shadow-none">
                      <CardContent className="p-3">
                        <p className="font-mono text-xs leading-relaxed">{artifact.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* Tags Section */}
              <div>
                <h4 className="font-mono text-xs tracking-wider uppercase font-bold mb-2">TAGS</h4>
                <div className="flex flex-wrap gap-1">
                  {artifact.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="font-mono text-xs uppercase tracking-wider border border-black px-1 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* SuperSplat Integration Info */}
              <div>
                <h4 className="font-mono text-xs tracking-wider uppercase font-bold mb-2">SUPERSPLAT INFO</h4>
                <Card className="bg-stone-100 border border-black rounded-none shadow-none">
                  <CardContent className="p-3">
                    <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-gray-600">VIEWER:</span> SUPERSPLAT PROFESSIONAL
                      </div>
                      <div>
                        <span className="text-gray-600">FORMAT:</span> GAUSSIAN SPLAT
                      </div>
                      <div>
                        <span className="text-gray-600">STATUS:</span> EMBEDDED
                      </div>
                      <div>
                        <span className="text-gray-600">FEATURES:</span> FULL INTERACTIVE 3D
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
