"use client"
 
import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthSession, UserRole } from "@/context/AuthContext"
import { SignIn as ClerkSignIn } from "@clerk/nextjs"
import { Sparkles, Mail, Lock, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
 
export default function SignInPage() {
  const { isClerkActive, signIn, loginWithGoogle, isSignedIn } = useAuthSession()
  const router = useRouter()
  
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
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
      <div className="min-h-screen flex items-center justify-center bg-background bg-dot-grid py-12 px-4 relative">
        <div className="relative z-10 border border-border bg-card p-4 rounded-[16px] shadow-none">
          <ClerkSignIn routing="hash" />
        </div>
      </div>
    )
  }
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }
 
    setIsLoading(true)
    setError("")
 
    try {
      // Find role from mock registry if user registered before
      const registryStr = localStorage.getItem("rotasphere_mock_registry")
      let matchedRole: UserRole = "ATTENDEE"
      
      if (registryStr) {
        const registry = JSON.parse(registryStr) as { email: string; role: UserRole }[]
        const matched = registry.find((u) => u.email.toLowerCase() === email.toLowerCase())
        if (matched) matchedRole = matched.role
      }
 
      await signIn(email, matchedRole)
      router.push("/dashboard")
    } catch {
      setError("Invalid login credentials")
    } finally {
      setIsLoading(false)
    }
  }
 
  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await loginWithGoogle("ATTENDEE") // Default to attendee role on mock google login
      router.push("/dashboard")
    } catch {
      setError("Google Login failed")
    } finally {
      setIsLoading(false)
    }
  }
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-dot-grid py-12 px-4 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        {/* RotaSphere Logo Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link href="/" className="flex items-center gap-2 mb-2 group">
            <div className="h-9 w-9 rounded-full bg-[#17171c] dark:bg-white flex items-center justify-center text-white dark:text-[#17171c]">
              <Sparkles className="h-4.5 w-4.5 text-accent" />
            </div>
            <span className="font-heading font-medium text-2xl tracking-tight text-[#17171c] dark:text-white">
              RotaSphere
            </span>
          </Link>
          <span className="font-mono text-xs text-accent tracking-wider uppercase bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
            Simulated Auth Sandbox
          </span>
        </div>
 
        {/* Bordered Sign In Card */}
        <div className="border border-border bg-card rounded-[16px] p-8 shadow-none">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-heading font-medium tracking-tight text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              Access your events dashboard and stats
            </p>
          </div>
 
          {error && (
            <div className="mb-4 p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-[8px] font-medium">
              {error}
            </div>
          )}
 
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
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
                  className="rounded-[8px] border-border bg-background/50 pl-9 focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent"
                />
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
 
            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="rounded-[8px] border-border bg-background/50 pl-9 focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent"
                />
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
 
            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full h-11 bg-primary text-primary-foreground hover:opacity-90 font-medium shadow-none mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
 
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-medium">
                Or Continue With
              </span>
            </div>
          </div>
 
          {/* Social Logins */}
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full rounded-full h-11 border-border bg-transparent hover:bg-[#eeece7] dark:hover:bg-[#2c2c35] text-foreground flex items-center justify-center gap-2 font-medium shadow-none"
          >
            {/* Google Custom SVG */}
            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>
 
          {/* Bottom Link */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-accent font-medium hover:underline"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
