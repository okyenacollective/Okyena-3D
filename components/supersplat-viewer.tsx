"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface SuperSplatViewerProps {
  embedCode: string
  supersplatUrl?: string
  artifact: {
    name: string
    category: string
    region: string
  }
}

export function SuperSplatViewer({ embedCode, supersplatUrl, artifact }: SuperSplatViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  // Extract iframe attributes from embed code
  const extractIframeAttributes = (code: string) => {
    const srcMatch = code.match(/src="([^"]*)"/)
    const widthMatch = code.match(/width="([^"]*)"/)
    const heightMatch = code.match(/height="([^"]*)"/)

    return {
      src: srcMatch ? srcMatch[1] : "",
      width: widthMatch ? widthMatch[1] : "800",
      height: heightMatch ? heightMatch[1] : "600",
    }
  }

  const iframeAttrs = extractIframeAttributes(embedCode)

  const openInSupersplat = () => {
    if (supersplatUrl) {
      window.open(supersplatUrl, "_blank")
    } else if (iframeAttrs.src) {
      window.open(iframeAttrs.src, "_blank")
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const refreshViewer = () => {
    setIframeLoaded(false)
    // Force iframe reload
    const iframe = document.querySelector("#supersplat-iframe") as HTMLIFrameElement
    if (iframe) {
      iframe.src = iframe.src
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isFullscreen])

  if (!iframeAttrs.src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-200 border-2 border-black">
        <div className="text-center p-6">
          <div className="w-12 h-12 border-2 border-black flex items-center justify-center mx-auto mb-4">
            <span className="font-mono font-bold">!</span>
          </div>
          <p className="font-mono text-sm tracking-wider uppercase mb-2">INVALID EMBED CODE</p>
          <p className="font-mono text-xs">PLEASE PROVIDE VALID SUPERSPLAT IFRAME CODE</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${isFullscreen ? "fixed inset-0 z-50 bg-black" : "w-full h-full"}`}>
      {/* Header */}
      <div className="border-b-2 border-black p-4 bg-stone-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-mono font-bold tracking-wider uppercase">{artifact.name}</h2>
            <span className="border border-black px-2 py-1 font-mono text-xs tracking-wider uppercase">
              SUPERSPLAT VIEWER
            </span>
          </div>
        </div>
      </div>

      {/* SuperSplat Iframe */}
      <div className={`relative ${isFullscreen ? "h-[calc(100vh-80px)]" : "h-[600px]"} bg-stone-200`}>
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-200 border-2 border-black">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin mx-auto mb-4"></div>
              <p className="font-mono text-sm tracking-wider uppercase">LOADING SUPERSPLAT VIEWER...</p>
              <p className="font-mono text-xs mt-2">INITIALIZING 3D GAUSSIAN SPLAT RENDERER</p>
            </div>
          </div>
        )}

        <iframe
          id="supersplat-iframe"
          src={iframeAttrs.src}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          onLoad={() => setIframeLoaded(true)}
          className="border-2 border-black"
          title={`SuperSplat viewer for ${artifact.name}`}
        />
      </div>

      {/* Fullscreen Exit Button */}
      {isFullscreen && (
        <Button
          onClick={() => setIsFullscreen(false)}
          className="fixed top-4 right-4 z-50 bg-black text-stone-100 border-2 border-white hover:bg-stone-800 font-mono rounded-none"
        >
          EXIT FULLSCREEN
        </Button>
      )}

      {/* SuperSplat Attribution */}
      <div className="border-t border-black p-2 bg-stone-50">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-gray-600 uppercase tracking-wider">
            POWERED BY SUPERSPLAT - PROFESSIONAL GAUSSIAN SPLAT VIEWER
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={openInSupersplat}
            className="font-mono text-xs hover:bg-stone-200 rounded-none"
          >
            OPEN IN SUPERSPLAT
          </Button>
        </div>
      </div>
    </div>
  )
}
