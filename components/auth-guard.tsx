"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { auth } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const [user, setUser] = useState(auth.getCurrentUser())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(auth.getCurrentUser())
    setIsLoading(false)
  }, [])

  const handleLoginSuccess = () => {
    setUser(auth.getCurrentUser())
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-gray-600">LOADING...</p>
      </div>
    )
  }

  if (requireAdmin && (!user || user.role !== "admin")) {
    return <LoginForm onSuccess={handleLoginSuccess} />
  }

  return <>{children}</>
}
