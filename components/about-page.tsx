"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Eye, ShoppingCart, Globe, Users, Archive, Zap } from "lucide-react"
import { FloatingSankofa } from "@/components/floating-sankofa"

interface AboutPageProps {
  onViewArchive: () => void
}

export function AboutPage({ onViewArchive }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-stone-100 relative">
      <FloatingSankofa count={15} interactive={true} />
      {/* Hero Section */}
      <div className="border-b-2 border-black relative z-10">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-mono font-bold tracking-wider uppercase mb-4">OKYENA COLLECTIVE</h1>
            <p className="text-xl font-mono tracking-wider uppercase mb-6">DIGITAL HERITAGE ARCHIVE</p>
            <p className="text-lg font-mono leading-relaxed mb-8">
              Preserving and sharing the rich cultural heritage of Ghana through cutting-edge 3D Gaussian splat
              technology. Experience artifacts in unprecedented detail and support cultural preservation through NFT
              ownership.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onViewArchive}
                className="bg-black text-stone-100 hover:bg-stone-800 font-mono font-bold tracking-wider uppercase border-2 border-black rounded-none"
              >
                <Eye className="w-5 h-5 mr-2" />
                EXPLORE ARCHIVE
              </Button>
              <Button
                variant="outline"
                className="bg-stone-100 border-2 border-black hover:bg-stone-200 font-mono font-bold tracking-wider uppercase rounded-none"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                BROWSE NFT COLLECTION
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="border-b-2 border-black">
        <div className="container mx-auto px-6 py-12">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-mono font-bold tracking-wider uppercase mb-6">OUR MISSION</h2>
              <div className="space-y-4 font-mono">
                <p>
                  The Okyena Collective is dedicated to preserving Ghana's rich cultural heritage through innovative
                  digital technology. We use state-of-the-art 3D Gaussian splat rendering to capture artifacts in
                  extraordinary detail, creating immersive experiences that bring history to life.
                </p>
                <p>
                  Our mission extends beyond preservation—we're building a sustainable ecosystem where cultural heritage
                  can be experienced, appreciated, and supported through blockchain technology and NFT ownership.
                </p>
                <p>
                  Every artifact in our collection tells a story of Ghana's diverse cultures, from ancient pottery and
                  traditional textiles to ceremonial objects and architectural elements. The floating Sankofa symbols
                  around you represent our core philosophy: "Se wo were fi na wosankofa a yenkyi" - "It is not wrong to
                  go back for that which you have forgotten."
                </p>
              </div>
            </div>
            <div className="border-2 border-black p-8 bg-stone-50">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 border-2 border-black flex items-center justify-center">
                    <Archive className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-mono font-bold tracking-wider uppercase">DIGITAL PRESERVATION</h3>
                    <p className="font-mono text-sm">High-fidelity 3D capture of cultural artifacts</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 border-2 border-black flex items-center justify-center">
                    <Globe className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-mono font-bold tracking-wider uppercase">GLOBAL ACCESS</h3>
                    <p className="font-mono text-sm">Making heritage accessible worldwide</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 border-2 border-black flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-mono font-bold tracking-wider uppercase">COMMUNITY DRIVEN</h3>
                    <p className="font-mono text-sm">Supporting local communities and artisans</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sankofa Philosophy Section */}
      <div className="border-b-2 border-black bg-stone-50">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-mono font-bold tracking-wider uppercase mb-6">THE SANKOFA PRINCIPLE</h2>
            <div className="space-y-6 font-mono">
              <p className="text-lg leading-relaxed">
                The Sankofa bird, floating gracefully around you, embodies our mission's heart. This sacred Adinkra
                symbol teaches us that wisdom comes from learning from the past to build a better future.
              </p>
              <div className="grid gap-6 md:grid-cols-3 mt-8">
                <div className="border-2 border-black p-6 bg-stone-100">
                  <h3 className="font-mono font-bold tracking-wider uppercase mb-3">LOOK BACK</h3>
                  <p className="font-mono text-sm">
                    We preserve and digitize Ghana's cultural treasures, ensuring they are never lost to time.
                  </p>
                </div>
                <div className="border-2 border-black p-6 bg-stone-100">
                  <h3 className="font-mono font-bold tracking-wider uppercase mb-3">UNDERSTAND</h3>
                  <p className="font-mono text-sm">
                    Through detailed documentation and storytelling, we share the wisdom embedded in each artifact.
                  </p>
                </div>
                <div className="border-2 border-black p-6 bg-stone-100">
                  <h3 className="font-mono font-bold tracking-wider uppercase mb-3">MOVE FORWARD</h3>
                  <p className="font-mono text-sm">
                    We use cutting-edge technology to make heritage accessible to future generations worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technology Section */}
      <div className="border-b-2 border-black">
        <div className="container mx-auto px-6 py-12">
          <h2 className="text-3xl font-mono font-bold tracking-wider uppercase text-center mb-8">
            CUTTING-EDGE TECHNOLOGY
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-stone-100 border-2 border-black rounded-none shadow-none">
              <CardHeader>
                <div className="border-b border-black pb-3">
                  <CardTitle className="font-mono font-bold tracking-wider uppercase text-lg flex items-center space-x-2">
                    <Zap className="w-6 h-6" />
                    <span>3D GAUSSIAN SPLATS</span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm leading-relaxed">
                  Revolutionary 3D rendering technology that captures artifacts with photorealistic quality and
                  real-time interaction. Experience heritage objects as if you're holding them in your hands.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-stone-100 border-2 border-black rounded-none shadow-none">
              <CardHeader>
                <div className="border-b border-black pb-3">
                  <CardTitle className="font-mono font-bold tracking-wider uppercase text-lg flex items-center space-x-2">
                    <Globe className="w-6 h-6" />
                    <span>SUPERSPLAT INTEGRATION</span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm leading-relaxed">
                  Powered by SuperSplat's professional-grade viewer technology, ensuring the highest quality 3D
                  visualization and seamless cross-platform compatibility.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-stone-100 border-2 border-black rounded-none shadow-none">
              <CardHeader>
                <div className="border-b border-black pb-3">
                  <CardTitle className="font-mono font-bold tracking-wider uppercase text-lg flex items-center space-x-2">
                    <ShoppingCart className="w-6 h-6" />
                    <span>NFT MARKETPLACE</span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-sm leading-relaxed">
                  Own a piece of digital heritage through our NFT collection. Each purchase supports ongoing
                  preservation efforts and provides exclusive access to high-resolution models.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-b-2 border-black">
        <div className="container mx-auto px-6 py-12">
          <div className="grid gap-6 md:grid-cols-4 text-center">
            <div className="border-2 border-black p-6">
              <div className="text-4xl font-mono font-bold mb-2">127</div>
              <div className="font-mono text-sm tracking-wider uppercase">ARTIFACTS PRESERVED</div>
            </div>
            <div className="border-2 border-black p-6">
              <div className="text-4xl font-mono font-bold mb-2">8</div>
              <div className="font-mono text-sm tracking-wider uppercase">CULTURAL CATEGORIES</div>
            </div>
            <div className="border-2 border-black p-6">
              <div className="text-4xl font-mono font-bold mb-2">15</div>
              <div className="font-mono text-sm tracking-wider uppercase">REGIONS REPRESENTED</div>
            </div>
            <div className="border-2 border-black p-6">
              <div className="text-4xl font-mono font-bold mb-2">2.4GB</div>
              <div className="font-mono text-sm tracking-wider uppercase">DIGITAL ARCHIVE SIZE</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-b-2 border-black">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-mono font-bold tracking-wider uppercase mb-6">
              JOIN THE PRESERVATION MOVEMENT
            </h2>
            <p className="font-mono text-lg leading-relaxed mb-8">
              Explore our digital heritage archive, support cultural preservation through NFT ownership, and help us
              build the future of cultural heritage documentation. Like the Sankofa bird, we honor the past to build a
              better future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onViewArchive}
                className="bg-black text-stone-100 hover:bg-stone-800 font-mono font-bold tracking-wider uppercase border-2 border-black rounded-none"
              >
                <Eye className="w-5 h-5 mr-2" />
                EXPLORE ARCHIVE
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("https://opensea.io/collection/okyena-collective", "_blank")}
                className="bg-stone-100 border-2 border-black hover:bg-stone-200 font-mono font-bold tracking-wider uppercase rounded-none"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                VIEW NFT COLLECTION
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-stone-50 border-t-2 border-black">
        <div className="container mx-auto px-6 py-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-mono font-bold tracking-wider uppercase mb-4">OKYENA COLLECTIVE</h3>
              <p className="font-mono text-sm leading-relaxed">
                Preserving Ghana's cultural heritage through innovative digital technology and community engagement.
                Guided by the wisdom of Sankofa.
              </p>
            </div>
            <div>
              <h3 className="font-mono font-bold tracking-wider uppercase mb-4">QUICK LINKS</h3>
              <div className="space-y-2 font-mono text-sm">
                <div>
                  <Button variant="link" className="p-0 h-auto font-mono" onClick={onViewArchive}>
                    ARCHIVE
                  </Button>
                </div>
                <div>
                  <Button variant="link" className="p-0 h-auto font-mono">
                    NFT COLLECTION
                  </Button>
                </div>
                <div>
                  <Button variant="link" className="p-0 h-auto font-mono">
                    ABOUT
                  </Button>
                </div>
                <div>
                  <Button variant="link" className="p-0 h-auto font-mono">
                    CONTACT
                  </Button>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-mono font-bold tracking-wider uppercase mb-4">CONNECT</h3>
              <div className="space-y-2 font-mono text-sm">
                <div>EMAIL: INFO@OKYENA.COLLECTIVE</div>
                <div>TWITTER: @OKYENACOLLECTIVE</div>
                <div>DISCORD: OKYENA COMMUNITY</div>
              </div>
            </div>
          </div>
          <div className="border-t border-black mt-8 pt-6 text-center">
            <p className="font-mono text-xs tracking-wider uppercase text-gray-600">
              © 2024 OKYENA COLLECTIVE. PRESERVING HERITAGE FOR FUTURE GENERATIONS.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
