"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  email: string
  name: string
  role: string
}

interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  login: (token: string, user: User, refreshToken?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check for token on mount
    const token = localStorage.getItem("auth_token")
    const storedUser = localStorage.getItem("auth_user")
    if (token) {
      setIsLoggedIn(true)
      if (storedUser) setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = (token: string, user: User, refreshToken?: string) => {
    localStorage.setItem("auth_token", token)
    localStorage.setItem("auth_user", JSON.stringify(user))
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken)
    }
    setUser(user)
    setIsLoggedIn(true)
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("auth_user")
    setUser(null)
    setIsLoggedIn(false)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
