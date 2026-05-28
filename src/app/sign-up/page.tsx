"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthSession } from "@/context/AuthContext"
import { SignUp as ClerkSignUp } from "@clerk/nextjs"
import { Sparkles, Mail, Lock, User, Loader2, Users, Calendar, ShieldCheck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

type UserRole = "attendee" | "organizer" | "admin"

export default function SignUpPage() {
  const { isClerkActive, signUp, loginWithGoogle, isSignedIn } = useAuthSession()
  const router = useRouter()

  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [selectedRole, setSelectedRole] = React.useState<UserRole>("attendee")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  // Redirect if already signed in
  React.useEffect(() => {
    if (isSignedIn) {
      router.push("/dashboard")
    }
  }, [isSignedIn, router])

  if (isClerkActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-radial-grid py-12 px-4 relative">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 glass-card p-2 rounded-2xl border border-white/10 shadow-2xl">
          <ClerkSignUp routing="hash" />
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !password) {
      setError("Please fill in all fields")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await signUp(email, fullName, selectedRole)
      router.push("/dashboard")
    } catch {
      setError("Failed to register user. Try another email.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      await loginWithGoogle(selectedRole)
      router.push("/dashboard")
    } catch {
      setError("Google Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

  const roles = [
    {
      id: "attendee" as UserRole,
      title: "Attendee",
      desc: "Book tickets & join events",
      icon: Users,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
    },
    {
      id: "organizer" as UserRole,
      title: "Organizer",
      desc: "Create & manage events",
      icon: Calendar,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20"
    },
    {
      id: "admin" as UserRole,
      title: "Admin",
      desc: "Oversee global operations",
      icon: ShieldCheck,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20"
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial-grid py-12 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/10 h-[350px] w-[350px] rounded-full bg-indigo-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 h-[350px] w-[350px] rounded-full bg-purple-500/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* RotaSphere Logo Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <Link href="/" className="flex items-center gap-2 mb-2 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              RotaSphere
            </span>
          </Link>
          <span className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold tracking-wider uppercase bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/10">
            Simulated Auth Sandbox
          </span>
        </div>

        {/* Glassmorphic Sign Up Card */}
        <div className="glass-card border border-white/20 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Create Account</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Join RotaSphere and plan your next moments
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-sm font-semibold">Full Name</Label>
              <div className="relative">
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Rivera"
                  required
                  disabled={isLoading}
                  className="rounded-xl border-muted-foreground/20 bg-background/50 pl-9 focus-visible:ring-indigo-500"
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={isLoading}
                  className="rounded-xl border-muted-foreground/20 bg-background/50 pl-9 focus-visible:ring-indigo-500"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="rounded-xl border-muted-foreground/20 bg-background/50 pl-9 focus-visible:ring-indigo-500"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Role Support Picker */}
            <div className="space-y-2 pt-2">
              <Label className="text-sm font-semibold block">Select Your Account Role</Label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((r) => {
                  const Icon = r.icon
                  const isSelected = selectedRole === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      disabled={isLoading}
                      onClick={() => setSelectedRole(r.id)}
                      className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? "bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20"
                          : "bg-background/40 border-muted hover:bg-muted/30"
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${r.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-bold text-foreground block mb-0.5">{r.title}</span>
                      <span className="text-[9px] text-muted-foreground leading-tight hidden sm:block">
                        {r.desc}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-md shadow-indigo-500/25 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Sign Up & Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background/80 backdrop-blur px-2 text-muted-foreground font-medium">
                Or Sign Up With
              </span>
            </div>
          </div>

          {/* Social signup */}
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleGoogleSignup}
            className="w-full rounded-xl h-11 border-muted hover:bg-muted/50 text-foreground flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </Button>

          {/* Bottom links */}
          <p className="text-center text-xs text-muted-foreground mt-5">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-indigo-500 dark:text-indigo-400 font-semibold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
