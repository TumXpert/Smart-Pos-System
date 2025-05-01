"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type User = {
  id: string
  email: string
  businessName: string
  role: "admin" | "manager" | "cashier"
} | null

type AuthContextType = {
  user: User
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, businessName: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // In a real app, call your API to authenticate
    // This is a mock implementation
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const mockUser = {
            id: "1",
            email,
            businessName: "Demo Business",
            role: "admin" as const,
          }
          setUser(mockUser)
          localStorage.setItem("user", JSON.stringify(mockUser))
          resolve()
        } else {
          reject(new Error("Invalid credentials"))
        }
      }, 1000)
    })
  }

  const register = async (email: string, password: string, businessName: string) => {
    // In a real app, call your API to register
    // This is a mock implementation
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (email && password && businessName) {
          const mockUser = {
            id: "1",
            email,
            businessName,
            role: "admin" as const,
          }
          setUser(mockUser)
          localStorage.setItem("user", JSON.stringify(mockUser))
          resolve()
        } else {
          reject(new Error("Invalid registration data"))
        }
      }, 1000)
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}
