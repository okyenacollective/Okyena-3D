"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, Settings, Eye } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t-2 border-black mt-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* About Section */}
          <div className="lg:col-span-2">
            <h3 className="font-mono font-bold text-base sm:text-lg mb-4 tracking-wide">OKYENA COLLECTIVE</h3>
            <p className="font-mono text-xs sm:text-sm text-gray-600 leading-relaxed">
              Preserving Ghana's rich cultural heritage through cutting-edge 3D technology and digital archiving.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-mono font-bold text-sm mb-4 tracking-wide">QUICK LINKS</h4>
            <div className="space-y-2">
              <Link
                href="/"
                className="block font-mono text-xs sm:text-sm text-gray-600 hover:text-black transition-colors"
              >
                HOME
              </Link>
              <Link
                href="/gallery"
                className="block font-mono text-xs sm:text-sm text-gray-600 hover:text-black transition-colors"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                GALLERY
              </Link>
              <Link
                href="/contact"
                className="block font-mono text-xs sm:text-sm text-gray-600 hover:text-black transition-colors"
              >
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                CONTACT
              </Link>
              <Link
                href="/admin"
                className="block font-mono text-xs sm:text-sm text-gray-600 hover:text-black transition-colors"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                ADMIN
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-mono font-bold text-sm mb-4 tracking-wide">GET IN TOUCH</h4>
            <div className="space-y-2">
              <p className="font-mono text-xs sm:text-sm text-gray-600">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
                okyena.collective@gmail.com
              </p>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-mono border-black mt-3 text-xs py-2 px-3 bg-transparent"
                >
                  SEND INQUIRY
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-300 mt-6 sm:mt-8 pt-4 sm:pt-6 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p className="font-mono text-xs text-gray-500 text-center sm:text-left">
            © 2025 OKYENA COLLECTIVE. ALL RIGHTS RESERVED.
          </p>
          <p className="font-mono text-xs text-gray-500 text-center sm:text-right">
            PRESERVING HERITAGE • EMBRACING TECHNOLOGY
          </p>
        </div>
      </div>
    </footer>
  )
}
