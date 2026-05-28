"use client"

import * as React from "react"
import { useUser as useClerkUser, useClerk } from "@clerk/nextjs"

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: 'attendee' | 'organizer' | 'admin';
  imageUrl?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  role: 'attendee' | 'organizer' | 'admin' | null;
  signIn: (email: string, role?: 'attendee' | 'organizer' | 'admin') => Promise<void>;
  signUp: (email: string, fullName: string, role: 'attendee' | 'organizer' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
  loginWithGoogle: (role: 'attendee' | 'organizer' | 'admin') => Promise<void>;
  isClerkActive: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

// Check if Clerk publishable key is configured
const NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const IS_CLERK_ACTIVE = !!NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/* ==========================================
   1. Clerk Mode Implementation
   ========================================== */
function ClerkAuthProviderInner({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isSignedIn, isLoaded } = useClerkUser()
  const { signOut: clerkSignOut } = useClerk()
  const [syncedUser, setSyncedUser] = React.useState<UserSession | null>(null)

  React.useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      // Fetch role from publicMetadata (defaulting to attendee)
      const role = (clerkUser.publicMetadata?.role as 'attendee' | 'organizer' | 'admin') || 'attendee'
      
      const timer = setTimeout(() => {
        setSyncedUser({
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || "",
          fullName: clerkUser.fullName || clerkUser.username || "Event Enthusiast",
          role: role,
          imageUrl: clerkUser.imageUrl
        })
      }, 0)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setSyncedUser(null)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [clerkUser, isSignedIn, isLoaded])

  const signIn = async (email: string, role?: 'attendee' | 'organizer' | 'admin') => {
    // Handled by Clerk's login components or flow
    console.log("SignIn requested with Clerk. Use Clerk UI instead. Target:", email, role)
  }

  const signUp = async (email: string, fullName: string, role: 'attendee' | 'organizer' | 'admin') => {
    // Handled by Clerk's signup components or flow
    console.log("SignUp requested with Clerk. Use Clerk UI instead. Target:", email, fullName, role)
  }

  const signOut = async () => {
    await clerkSignOut()
  }

  const loginWithGoogle = async (role: 'attendee' | 'organizer' | 'admin') => {
    // Handled by Clerk's social auth flow
    console.log("Social login with Clerk. Use Clerk UI instead. Role:", role)
  }

  return (
    <AuthContext.Provider
      value={{
        user: syncedUser,
        isSignedIn: !!isSignedIn,
        isLoaded: isLoaded,
        role: syncedUser?.role || null,
        signIn,
        signUp,
        signOut,
        loginWithGoogle,
        isClerkActive: true
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/* ==========================================
   2. Mock Simulation Mode Implementation
   ========================================== */
function MockAuthProviderInner({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserSession | null>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Load user session from localStorage on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem("rotasphere_mock_user")
    let parsedUser: UserSession | null = null
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser)
      } catch (e) {
        console.error("Failed to parse mock user", e)
      }
    }
    
    // Defer state updates to avoid set-state-in-effect warning
    const timer = setTimeout(() => {
      if (parsedUser) {
        setUser(parsedUser)
      }
      setIsLoaded(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const signIn = async (email: string, role?: 'attendee' | 'organizer' | 'admin') => {
    setIsLoaded(false)
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Try finding user in local registry or create mock
    const registeredUsers = localStorage.getItem("rotasphere_mock_registry")
    let existingUser: UserSession | undefined

    if (registeredUsers) {
      const registry: UserSession[] = JSON.parse(registeredUsers)
      existingUser = registry.find((u) => u.email.toLowerCase() === email.toLowerCase())
    }

    const resolvedUser: UserSession = existingUser || {
      id: `mock-usr-${Date.now()}`,
      email: email,
      fullName: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      role: role || 'attendee',
      imageUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`
    }

    localStorage.setItem("rotasphere_mock_user", JSON.stringify(resolvedUser))
    setUser(resolvedUser)
    setIsLoaded(true)
  }

  const signUp = async (email: string, fullName: string, role: 'attendee' | 'organizer' | 'admin') => {
    setIsLoaded(false)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: UserSession = {
      id: `mock-usr-${Date.now()}`,
      email: email,
      fullName: fullName,
      role: role,
      imageUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName}`
    }

    // Save to local registry so sign-in can retrieve it
    const registeredUsers = localStorage.getItem("rotasphere_mock_registry")
    let registry: UserSession[] = []
    if (registeredUsers) {
      registry = JSON.parse(registeredUsers)
    }
    registry.push(newUser)
    localStorage.setItem("rotasphere_mock_registry", JSON.stringify(registry))

    localStorage.setItem("rotasphere_mock_user", JSON.stringify(newUser))
    setUser(newUser)
    setIsLoaded(true)
  }

  const signOut = async () => {
    setIsLoaded(false)
    await new Promise((resolve) => setTimeout(resolve, 400))
    localStorage.removeItem("rotasphere_mock_user")
    setUser(null)
    setIsLoaded(true)
  }

  const loginWithGoogle = async (role: 'attendee' | 'organizer' | 'admin') => {
    setIsLoaded(false)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    const email = "google.user@example.com"
    const newUser: UserSession = {
      id: `mock-usr-google`,
      email,
      fullName: "Alex Rivera",
      role: role,
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    }
    localStorage.setItem("rotasphere_mock_user", JSON.stringify(newUser))
    setUser(newUser)
    setIsLoaded(true)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isSignedIn: !!user,
        isLoaded,
        role: user?.role || null,
        signIn,
        signUp,
        signOut,
        loginWithGoogle,
        isClerkActive: false
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/* ==========================================
   3. Main Global Auth Provider Wrapper
   ========================================== */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (IS_CLERK_ACTIVE) {
    return <ClerkAuthProviderInner>{children}</ClerkAuthProviderInner>
  }
  return <MockAuthProviderInner>{children}</MockAuthProviderInner>
}

export function useAuthSession() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthSession must be used within an AuthProvider")
  }
  return context
}
