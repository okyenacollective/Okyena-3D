"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  role: "admin" | "visitor"
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock admin credentials - in production this would be a proper auth system
  const ADMIN_CREDENTIALS = {
    email: "okyena.collective@gmail.com",
    password: "20NewProject25!",
    user: {
      id: "1",
      email: "okyena.collective@gmail.com",
      role: "admin" as const,
      name: "Heritage Administrator",
    },
  }

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem("okyena-auth")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem("okyena-auth")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setUser(ADMIN_CREDENTIALS.user)
      localStorage.setItem("okyena-auth", JSON.stringify(ADMIN_CREDENTIALS.user))
      setIsLoading(false)
      // Don't redirect here, let the component handle it
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("okyena-auth")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}
