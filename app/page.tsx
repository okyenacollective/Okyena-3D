"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Globe, Users, Archive, Plus, Settings, Menu, X } from "lucide-react"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { Footer } from "@/components/footer"
import { useRouter } from "next/navigation"

export default function OkyenaCollective() {
  const [currentUser, setCurrentUser] = useState(auth.getCurrentUser())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    auth.logout()
    setCurrentUser(null)
    setMobileMenuOpen(false)
  }

  useEffect(() => {
    const checkAuth = () => {
      setCurrentUser(auth.getCurrentUser())
    }

    window.addEventListener("storage", checkAuth)
    return () => window.removeEventListener("storage", checkAuth)
  }, [])

  return (
    <div className="min-h-screen bg-white relative">
      {/* Mobile Navigation Overlay */}
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
              <Link href="/gallery" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full font-mono border-black bg-transparent justify-start">
                  <Eye className="w-4 h-4 mr-3" />
                  EXPLORE ARCHIVE
                </Button>
              </Link>

              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full font-mono border-black bg-transparent justify-start">
                  <Globe className="w-4 h-4 mr-3" />
                  CONTACT US
                </Button>
              </Link>

              {currentUser?.role === "admin" ? (
                <>
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-black text-white hover:bg-gray-800 font-mono justify-start">
                      <Plus className="w-4 h-4 mr-3" />
                      ADMIN PANEL
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-red-500 text-red-600 hover:bg-red-50 font-mono justify-start bg-transparent"
                  >
                    LOGOUT
                  </Button>
                </>
              ) : (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full font-mono border-black bg-transparent justify-start">
                    <Settings className="w-4 h-4 mr-3" />
                    ADMIN LOGIN
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="px-4 py-12 md:py-24 text-center border-b-2 border-black relative z-10">
        {/* Mobile Menu Button */}
        <div className="absolute top-4 right-4 lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="font-mono border-black bg-white"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-wider mb-4 font-mono leading-tight">
            OKYENA COLLECTIVE
          </h1>
          <h2 className="text-sm sm:text-lg md:text-xl tracking-widest mb-6 md:mb-8 text-gray-600 font-mono">
            DIGITAL HERITAGE ARCHIVE
          </h2>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-8 md:mb-12 max-w-3xl mx-auto text-gray-700 font-mono px-2">
            Preserving and sharing the rich cultural heritage of Ghana through cutting-edge 3D Gaussian splat
            technology. Experience artifacts in unprecedented detail and support cultural preservation.
          </p>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            {currentUser?.role === "admin" ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/admin">
                  <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 font-mono tracking-wide">
                    <Plus className="w-4 h-4 mr-2" />
                    ADMIN PANEL
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-black text-black hover:bg-gray-50 px-8 py-3 font-mono tracking-wide bg-transparent"
                >
                  LOGOUT
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/gallery">
                  <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 font-mono tracking-wide">
                    <Eye className="w-4 h-4 mr-2" />
                    EXPLORE ARCHIVE
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button
                    variant="outline"
                    className="border-black text-black hover:bg-gray-50 px-8 py-3 font-mono tracking-wide bg-transparent"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    ADMIN LOGIN
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden space-y-3">
            <Link href="/gallery">
              <Button className="w-full bg-black text-white hover:bg-gray-800 py-4 font-mono tracking-wide text-lg">
                <Eye className="w-5 h-5 mr-3" />
                EXPLORE ARCHIVE
              </Button>
            </Link>
            {currentUser?.role === "admin" ? (
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="w-full border-black text-black hover:bg-gray-50 py-4 font-mono tracking-wide text-lg bg-transparent"
                >
                  <Plus className="w-5 h-5 mr-3" />
                  ADMIN PANEL
                </Button>
              </Link>
            ) : (
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="w-full border-black text-black hover:bg-gray-50 py-4 font-mono tracking-wide text-lg bg-transparent"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  ADMIN LOGIN
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 md:mb-8 font-mono tracking-wide border-b-2 border-black pb-4">
            ABOUT OKYENA COLLECTIVE
          </h2>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
            {/* About Text */}
            <div className="space-y-4 md:space-y-6 text-gray-700 leading-relaxed font-mono text-sm sm:text-base">
              <p>
                The Okyena Collective is dedicated to preserving Ghana's rich cultural heritage through innovative
                digital technology. We use state-of-the-art 3D Gaussian splat rendering to capture artifacts in
                extraordinary detail, creating immersive experiences that bring history to life.
              </p>
              <p>
                Our mission extends beyond preservation—we're building a sustainable ecosystem where cultural heritage
                can be experienced, appreciated, and supported through digital archiving and community engagement.
              </p>
              <p>
                Every artifact in our collection tells a story of Ghana's diverse cultures, from ancient pottery and
                traditional textiles to ceremonial objects and architectural elements. We represent the core philosophy
                of learning from the past to build a better future.
              </p>
            </div>

            {/* 3D Preview */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold mb-4 font-mono tracking-wide">EXPERIENCE OUR TECHNOLOGY</h3>
              <div className="bg-gray-100 border-2 border-black aspect-video flex items-center justify-center">
                <iframe
                  src="https://superspl.at/s?id=eec7679f"
                  className="w-full h-full"
                  title="3D Preview - Upcycled Fishing Net Hammock"
                  allowFullScreen
                />
              </div>
              <div className="mt-4 p-3 bg-white border border-gray-300">
                <h4 className="font-mono font-bold text-sm mb-2">FEATURED: UPCYCLED FISHING NET HAMMOCK</h4>
                <p className="font-mono text-xs text-gray-600 leading-relaxed">
                  A traditional hammock crafted from upcycled fishing nets from Busua, Ahanta Region, Ghana. This
                  artifact showcases sustainable practices of coastal Ghanaian communities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-4 py-12 md:py-20 border-t-2 border-black relative z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 md:mb-8 font-mono tracking-wide">
              OUR MISSION
            </h2>
            <div className="space-y-4 md:space-y-6 text-gray-700 leading-relaxed font-mono text-sm sm:text-base">
              <p>
                The Okyena Collective is dedicated to preserving Ghana's rich cultural heritage through innovative
                digital technology. We use state-of-the-art 3D Gaussian splat rendering to capture artifacts in
                extraordinary detail, creating immersive experiences that bring history to life.
              </p>
              <p>
                Our mission extends beyond preservation—we're building a sustainable ecosystem where cultural heritage
                can be experienced, appreciated, and supported through digital archiving and community engagement.
              </p>
              <p>
                Every artifact in our collection tells a story of Ghana's diverse cultures, from ancient pottery and
                traditional textiles to ceremonial objects and architectural elements. We represent the core philosophy
                of learning from the past to build a better future.
              </p>
            </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <Card className="border-2 border-black">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 border-2 border-black rounded flex-shrink-0">
                    <Archive className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 font-mono text-sm sm:text-base">DIGITAL PRESERVATION</h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-mono">
                      High-fidelity 3D capture of cultural artifacts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 border-2 border-black rounded flex-shrink-0">
                    <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 font-mono text-sm sm:text-base">GLOBAL ACCESS</h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-mono">Making heritage accessible worldwide</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-black">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 border-2 border-black rounded flex-shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-2 font-mono text-sm sm:text-base">COMMUNITY DRIVEN</h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-mono">
                      Supporting local communities and artisans
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sankofa Principle Section */}
      <section className="px-4 py-12 md:py-20 bg-gray-50 border-t-2 border-black relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 md:mb-8 font-mono tracking-wide">
            THE SANKOFA PRINCIPLE
          </h2>
          <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-700 max-w-3xl mx-auto font-mono">
            Our mission embodies the Sankofa principle - a sacred Adinkra symbol that teaches us wisdom comes from
            learning from the past to build a better future. Through digital preservation, we honor our heritage while
            making it accessible for generations to come.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
