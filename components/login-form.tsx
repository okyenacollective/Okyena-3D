"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, Loader2, Eye, EyeOff } from "lucide-react"
import { auth } from "@/lib/auth"

interface LoginFormProps {
  onSuccess: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const user = await auth.login(email, password)
      if (user) {
        auth.setCurrentUser(user)
        onSuccess()
      } else {
        setError("Invalid credentials")
      }
    } catch (error) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-2 border-black">
        <CardHeader className="border-b-2 border-black text-center">
          <CardTitle className="font-mono font-bold tracking-wide text-xl">ADMIN LOGIN</CardTitle>
          <p className="font-mono text-sm text-gray-600 mt-2">OKYENA COLLECTIVE ARCHIVE</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="font-mono font-bold text-sm">
                EMAIL
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-mono border-black"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="font-mono font-bold text-sm">
                PASSWORD
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-mono border-black pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-3 border-2 border-red-500 bg-red-50 rounded">
                <p className="font-mono text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white hover:bg-gray-800 font-mono tracking-wide"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  LOGGING IN...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  LOGIN
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
