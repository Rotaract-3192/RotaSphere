"use client"

import * as React from "react"
import { useUser as useClerkUser, useClerk } from "@clerk/nextjs"
import { syncClerkUserAction } from "@/app/actions/userActions"

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'ORGANIZER' | 'ATTENDEE' | 'PENDING_USER';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  imageUrl?: string;
  bio?: string;
  homeClub?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  role: UserRole | null;
  signIn: (email: string, role?: UserRole) => Promise<void>;
  signUp: (email: string, fullName: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  updateProfile: (data: { fullName: string; email: string; imageUrl?: string; bio?: string; homeClub?: string; role?: UserRole }) => Promise<{ success: boolean; error?: string }>;
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
    let active = true
    
    async function syncUser() {
      if (isLoaded && isSignedIn && clerkUser) {
        const email = clerkUser.primaryEmailAddress?.emailAddress || ""
        const fullName = clerkUser.fullName || clerkUser.username || "Event Enthusiast"
        const imageUrl = clerkUser.imageUrl
        
        // Sync with Supabase
        const syncResult = await syncClerkUserAction({
          clerkId: clerkUser.id,
          email,
          fullName,
          imageUrl
        })

        if (!active) return

        const finalRole = (syncResult.success && syncResult.role)
          ? syncResult.role
          : ((clerkUser.publicMetadata?.role as UserRole) || 'ATTENDEE')

        const finalStatus = (syncResult.success && syncResult.status)
          ? syncResult.status
          : ((clerkUser.publicMetadata?.status as UserStatus) || 'ACTIVE')

        const finalBio = (syncResult.success && syncResult.bio)
          ? syncResult.bio
          : ((clerkUser.publicMetadata?.bio as string) || '')

        const finalHomeClub = (syncResult.success && syncResult.homeClub)
          ? syncResult.homeClub
          : ((clerkUser.publicMetadata?.homeClub as string) || '')

        setSyncedUser({
          id: clerkUser.id,
          email,
          fullName,
          role: finalRole as UserRole,
          status: finalStatus as UserStatus,
          imageUrl,
          bio: finalBio,
          homeClub: finalHomeClub
        })
      } else {
        setSyncedUser(null)
      }
    }

    syncUser()

    return () => {
      active = false
    }
  }, [clerkUser, isSignedIn, isLoaded])

  const signIn = async (email: string, role?: UserRole) => {
    // Handled by Clerk's login components or flow
    console.log("SignIn requested with Clerk. Use Clerk UI instead. Target:", email, role)
  }

  const signUp = async (email: string, fullName: string, role: UserRole) => {
    // Handled by Clerk's signup components or flow
    console.log("SignUp requested with Clerk. Use Clerk UI instead. Target:", email, fullName, role)
  }

  const signOut = async () => {
    await clerkSignOut()
  }

  const loginWithGoogle = async (role: UserRole) => {
    // Handled by Clerk's social auth flow
    console.log("Social login with Clerk. Use Clerk UI instead. Role:", role)
  }

  const updateProfile = async (data: { fullName: string; email: string; imageUrl?: string; bio?: string; homeClub?: string; role?: UserRole }) => {
    const { updateUserProfileAction } = await import("@/app/actions/userActions")
    const res = await updateUserProfileAction(data)
    if (res.success && res.user) {
      setSyncedUser(prev => prev ? {
        ...prev,
        fullName: res.user.fullName,
        email: res.user.email,
        imageUrl: res.user.imageUrl || prev.imageUrl,
        role: res.user.role as UserRole,
        status: res.user.status as UserStatus,
        bio: res.user.bio,
        homeClub: res.user.homeClub
      } : null)
      return { success: true }
    }
    return { success: false, error: res.error }
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
        updateProfile,
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

  const signIn = async (email: string, role?: UserRole) => {
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

    const SUPER_ADMIN_EMAIL = "tech.rotaract3192@gmail.com"
    const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()

    const resolvedUser: UserSession = existingUser || {
      id: `mock-usr-${Date.now()}`,
      email: email,
      fullName: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
      role: isSuperAdmin ? 'SUPER_ADMIN' : (role || 'ATTENDEE'),
      status: isSuperAdmin ? 'ACTIVE' : 'ACTIVE',
      imageUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${email}`,
      bio: "",
      homeClub: ""
    }

    localStorage.setItem("rotasphere_mock_user", JSON.stringify(resolvedUser))
    setUser(resolvedUser)
    setIsLoaded(true)
  }

  const signUp = async (email: string, fullName: string, role: UserRole) => {
    setIsLoaded(false)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const SUPER_ADMIN_EMAIL = "tech.rotaract3192@gmail.com"
    const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()

    const newUser: UserSession = {
      id: `mock-usr-${Date.now()}`,
      email: email,
      fullName: fullName,
      role: isSuperAdmin ? 'SUPER_ADMIN' : (role || 'ATTENDEE'),
      status: isSuperAdmin ? 'ACTIVE' : 'ACTIVE',
      imageUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName}`,
      bio: "",
      homeClub: ""
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

  const loginWithGoogle = async (role: UserRole) => {
    setIsLoaded(false)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    const email = "google.user@example.com"
    const SUPER_ADMIN_EMAIL = "tech.rotaract3192@gmail.com"
    const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()

    const newUser: UserSession = {
      id: `mock-usr-google`,
      email,
      fullName: "Alex Rivera",
      role: isSuperAdmin ? 'SUPER_ADMIN' : (role || 'ATTENDEE'),
      status: isSuperAdmin ? 'ACTIVE' : 'ACTIVE',
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "",
      homeClub: ""
    }
    localStorage.setItem("rotasphere_mock_user", JSON.stringify(newUser))
    setUser(newUser)
    setIsLoaded(true)
  }

  const updateProfile = async (data: { fullName: string; email: string; imageUrl?: string; bio?: string; homeClub?: string; role?: UserRole }) => {
    setIsLoaded(false)
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (!user) {
      setIsLoaded(true)
      return { success: false, error: "Not logged in" }
    }

    const roleToSet = data.role || user.role
    
    let newStatus = user.status
    if (roleToSet === "ORGANIZER" && user.role === "ATTENDEE") {
      newStatus = "PENDING"
    }

    const updatedUser: UserSession = {
      ...user,
      fullName: data.fullName,
      email: data.email,
      imageUrl: data.imageUrl || user.imageUrl,
      role: roleToSet,
      status: newStatus,
      bio: data.bio || "",
      homeClub: data.homeClub || ""
    }

    localStorage.setItem("rotasphere_mock_user", JSON.stringify(updatedUser))
    setUser(updatedUser)

    // Update in local registry
    const registeredUsers = localStorage.getItem("rotasphere_mock_registry")
    if (registeredUsers) {
      let registry: UserSession[] = JSON.parse(registeredUsers)
      const idx = registry.findIndex(u => u.id === user.id)
      if (idx !== -1) {
        registry[idx] = updatedUser
      } else {
        registry.push(updatedUser)
      }
      localStorage.setItem("rotasphere_mock_registry", JSON.stringify(registry))
    }

    setIsLoaded(true)
    return { success: true }
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
        updateProfile,
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
