"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Send, Loader2, ArrowLeft, MapPin, Globe, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [emailId, setEmailId] = useState("")

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Client-side validation
    if (formData.message.length < 10) {
      setError("Message must be at least 10 characters long")
      setIsLoading(false)
      return
    }

    if (formData.message.length > 5000) {
      setError("Message must be less than 5000 characters")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setEmailId(result.id || "")
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        })
      } else {
        setError(result.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Contact form error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setIsSubmitted(false)
    setEmailId("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header */}
      <header className="border-b-2 border-black p-4 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" className="font-mono border-black bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                BACK TO HOME
              </Button>
            </Link>
            <h1 className="text-2xl font-bold font-mono tracking-wide">CONTACT US</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Form */}
            <div>
              <Card className="border-2 border-black">
                <CardHeader className="border-b-2 border-black">
                  <CardTitle className="font-mono font-bold tracking-wide flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    SEND US A MESSAGE
                  </CardTitle>
                  <p className="font-mono text-sm text-gray-600">
                    Have questions about our digital heritage archive? Want to contribute artifacts? Get in touch!
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="font-mono font-bold text-lg mb-2">MESSAGE SENT SUCCESSFULLY!</h3>
                      <p className="font-mono text-sm text-gray-600 mb-2">
                        Thank you for reaching out. We'll get back to you within 24 hours.
                      </p>
                      {emailId && <p className="font-mono text-xs text-gray-500 mb-4">Reference ID: {emailId}</p>}
                      <p className="font-mono text-xs text-gray-600 mb-4">
                        You should also receive a confirmation email shortly.
                      </p>
                      <Button onClick={resetForm} variant="outline" className="font-mono border-black bg-transparent">
                        SEND ANOTHER MESSAGE
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="font-mono font-bold text-sm">
                            NAME *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="font-mono border-black"
                            required
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="font-mono font-bold text-sm">
                            EMAIL *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className="font-mono border-black"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="subject" className="font-mono font-bold text-sm">
                          SUBJECT *
                        </Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => handleChange("subject", e.target.value)}
                          className="font-mono border-black"
                          placeholder="e.g., Artifact Contribution, Partnership Inquiry"
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <Label htmlFor="message" className="font-mono font-bold text-sm">
                          MESSAGE * ({formData.message.length}/5000)
                        </Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleChange("message", e.target.value)}
                          className="font-mono border-black min-h-[150px]"
                          placeholder="Tell us about your inquiry, artifact details, or how you'd like to collaborate..."
                          rows={6}
                          required
                          disabled={isLoading}
                          maxLength={5000}
                        />
                        {formData.message.length < 10 && formData.message.length > 0 && (
                          <p className="text-orange-600 text-xs font-mono mt-1">
                            Message must be at least 10 characters long
                          </p>
                        )}
                      </div>

                      {error && (
                        <div className="p-3 border-2 border-red-500 bg-red-50 rounded flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <p className="font-mono text-sm text-red-700">{error}</p>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={isLoading || formData.message.length < 10}
                        className="w-full bg-black text-white hover:bg-gray-800 font-mono tracking-wide"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            SENDING MESSAGE...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            SEND MESSAGE
                          </>
                        )}
                      </Button>

                      <p className="text-xs font-mono text-gray-500 text-center">
                        By sending this message, you agree to receive a response from Okyena Collective.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold font-mono tracking-wide mb-6">GET IN TOUCH</h2>
                <p className="font-mono text-gray-600 leading-relaxed mb-8">
                  We're passionate about preserving Ghana's cultural heritage and would love to hear from you. Whether
                  you're a researcher, artist, cultural institution, or simply interested in our work, don't hesitate to
                  reach out.
                </p>
              </div>

              <div className="space-y-6">
                <Card className="border-2 border-black">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 border-2 border-black rounded">
                        <Mail className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-mono font-bold mb-2">EMAIL</h3>
                        <p className="font-mono text-sm text-gray-600">okyena.collective@gmail.com</p>
                        <p className="font-mono text-xs text-gray-500 mt-1">We respond within 24 hours</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-black">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 border-2 border-black rounded">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-mono font-bold mb-2">DIGITAL PRESENCE</h3>
                        <p className="font-mono text-sm text-gray-600">Preserving heritage through technology</p>
                        <p className="font-mono text-xs text-gray-500 mt-1">
                          3D scanning • Digital archiving • Cultural preservation
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-black">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 border-2 border-black rounded">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-mono font-bold mb-2">FOCUS REGION</h3>
                        <p className="font-mono text-sm text-gray-600">Ghana, West Africa</p>
                        <p className="font-mono text-xs text-gray-500 mt-1">
                          Documenting cultural artifacts across all regions
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="p-6 bg-gray-50 border-2 border-black rounded">
                <h3 className="font-mono font-bold mb-3">COLLABORATION OPPORTUNITIES</h3>
                <ul className="font-mono text-sm text-gray-600 space-y-2">
                  <li>• Artifact contribution and documentation</li>
                  <li>• Cultural institution partnerships</li>
                  <li>• Research collaborations</li>
                  <li>• Educational program development</li>
                  <li>• Technology and funding partnerships</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
