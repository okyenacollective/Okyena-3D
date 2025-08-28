// Simple session-based auth for demo purposes
// In production, use NextAuth.js, Auth0, or similar

export interface User {
  id: string
  email: string
  role: "admin" | "user"
}

// Demo admin credentials
const ADMIN_CREDENTIALS = {
  email: "okyena.collective@gmail.com",
  password: "20NewProject25!",
}

export const auth = {
  login: async (email: string, password: string): Promise<User | null> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      return {
        id: "1",
        email: ADMIN_CREDENTIALS.email,
        role: "admin",
      }
    }
    return null
  },

  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("currentUser")
    return userStr ? JSON.parse(userStr) : null
  },

  setCurrentUser: (user: User | null) => {
    if (typeof window === "undefined") return
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user))
    } else {
      localStorage.removeItem("currentUser")
    }
  },

  logout: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem("currentUser")
  },
}
