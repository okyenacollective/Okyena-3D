"use client"

import { useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/components/auth-provider"
import { AuthProvider } from "@/components/auth-provider"

function LoginPageContent() {
  const { user } = useAuth()

  useEffect(() => {
    // Redirect to main page if already logged in
    if (user) {
      window.location.href = "/"
    }
  }, [user])

  // Don't render login form if user is already authenticated
  if (user) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="font-mono text-sm tracking-wider uppercase">REDIRECTING TO DASHBOARD...</p>
        </div>
      </div>
    )
  }

  return <LoginForm />
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginPageContent />
    </AuthProvider>
  )
}
