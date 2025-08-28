"use client"

import { Button } from "@/components/ui/button"
import { Twitter, Facebook, Linkedin, Copy, Check } from "lucide-react"
import { useState } from "react"
import type { Artifact } from "@/lib/types"

interface SocialShareProps {
  artifact: Artifact
}

export function SocialShare({ artifact }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/artifact/${artifact.id}` : ""
  const shareText = `Check out this amazing cultural artifact: ${artifact.title} from ${artifact.location} - preserved in 3D by Okyena Collective`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  return (
    <div className="space-y-3">
      <h4 className="font-mono font-bold text-sm border-b border-black pb-1">SHARE ARTIFACT</h4>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={shareToTwitter}
          variant="outline"
          size="sm"
          className="font-mono border-black hover:bg-blue-50"
        >
          <Twitter className="w-4 h-4 mr-2" />
          TWITTER
        </Button>

        <Button
          onClick={shareToFacebook}
          variant="outline"
          size="sm"
          className="font-mono border-black hover:bg-blue-50"
        >
          <Facebook className="w-4 h-4 mr-2" />
          FACEBOOK
        </Button>

        <Button
          onClick={shareToLinkedIn}
          variant="outline"
          size="sm"
          className="font-mono border-black hover:bg-blue-50"
        >
          <Linkedin className="w-4 h-4 mr-2" />
          LINKEDIN
        </Button>

        <Button
          onClick={handleCopyLink}
          variant="outline"
          size="sm"
          className="font-mono border-black hover:bg-gray-50"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              COPIED
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              COPY LINK
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
