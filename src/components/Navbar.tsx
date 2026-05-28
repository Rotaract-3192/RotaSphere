"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useAuthSession } from "@/context/AuthContext"
import { 
  Moon, Sun, Menu, Sparkles, Plus, LogOut, 
  LayoutDashboard, ChevronDown 
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NavbarProps {
  onCreateEventClick: () => void;
}

export function Navbar({ onCreateEventClick }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { user, isSignedIn, signOut, role } = useAuthSession()
  
  const [mounted, setMounted] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Avoid hydration mismatch by waiting for mount
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navLinks = [
    { label: "Home", href: "/#" },
    { label: "Features", href: "/#features" },
    { label: "Events", href: "/#events" },
    { label: "Categories", href: "/#categories" },
    { label: "Testimonials", href: "/#testimonials" },
  ]

  const handleCreateEventClick = () => {
    if (!isSignedIn) {
      router.push("/sign-in")
    } else if (role === "attendee") {
      alert("Only Organizers and Admins can create events. Create a new account with Organizer/Admin role to publish.")
    } else {
      onCreateEventClick()
    }
  }

  const userInitials = user?.fullName
    ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U"

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-nav py-3 shadow-lg shadow-indigo-500/5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            RotaSphere
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-foreground/80 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions (Theme Switch & Auth Hooks) */}
        <div className="hidden md:flex items-center gap-4">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl border border-muted hover:bg-muted/50"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500 transition-all" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] text-indigo-600 transition-all" />
              )}
            </Button>
          )}

          {/* Create Event CTA */}
          <Button
            onClick={handleCreateEventClick}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-md shadow-indigo-500/20 hover:shadow-indigo-600/30 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>

          {/* Auth State Button or Profile Dropdown */}
          {mounted && (
            <>
              {isSignedIn && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full border border-muted hover:bg-muted/40 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs border border-white/10 shadow-sm overflow-hidden">
                      {user.imageUrl ? (
                        <img src={user.imageUrl} alt={user.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <span>{userInitials}</span>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground mr-1" />
                  </button>

                  {/* Glassmorphic Dropdown Popover */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-white/20 dark:border-white/5 shadow-2xl p-2 backdrop-blur-2xl animate-in fade-in slide-in-from-top-3 duration-200">
                      <div className="px-3 py-2.5">
                        <div className="font-bold text-foreground truncate text-sm">{user.fullName}</div>
                        <div className="text-xs text-muted-foreground truncate mb-2">{user.email}</div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          role === 'admin' 
                            ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' 
                            : role === 'organizer'
                            ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        }`}>
                          {role}
                        </span>
                      </div>
                      
                      <div className="h-px bg-muted my-1" />
                      
                      <Link 
                        href="/dashboard" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                        Dashboard
                      </Link>

                      <div className="h-px bg-muted my-1" />

                      <button
                        onClick={async () => {
                          setIsDropdownOpen(false)
                          await signOut()
                          router.push("/")
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10 transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/sign-in"
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "rounded-xl border border-transparent hover:bg-muted/50 text-foreground"
                    )}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className={cn(
                      buttonVariants(),
                      "rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-md shadow-indigo-500/10"
                    )}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        <div className="flex md:hidden items-center gap-3">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-xl border border-muted hover:bg-muted/50"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-[1.1rem] w-[1.1rem] text-amber-500" />
              ) : (
                <Moon className="h-[1.1rem] w-[1.1rem] text-indigo-600" />
              )}
            </Button>
          )}

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border border-muted hover:bg-muted/50"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="right" className="glass-card w-[280px] sm:w-[350px]">
              <SheetTitle className="text-left font-bold text-lg mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                RotaSphere Navigation
              </SheetTitle>
              
              {/* Profile summary in Mobile Menu */}
              {mounted && isSignedIn && user && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-muted/50 mb-6">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {user.imageUrl ? (
                      <img src={user.imageUrl} alt={user.fullName} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span>{userInitials}</span>
                    )}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-foreground text-xs block truncate">{user.fullName}</span>
                    <span className="text-[10px] text-indigo-400 font-semibold block uppercase tracking-wider mt-0.5">{role}</span>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-5">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-base font-semibold text-foreground/80 hover:text-indigo-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                
                <div className="h-px bg-muted my-2" />

                {mounted && (
                  <>
                    {isSignedIn ? (
                      <div className="space-y-4">
                        <Link
                          href="/dashboard"
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "w-full rounded-xl border-muted hover:bg-muted/50 text-foreground justify-center"
                          )}
                        >
                          <LayoutDashboard className="h-4 w-4 mr-2 text-indigo-500" />
                          Dashboard
                        </Link>
                        
                        <Button
                          onClick={handleCreateEventClick}
                          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-md shadow-indigo-500/20"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Event
                        </Button>

                        <Button
                          onClick={async () => {
                            await signOut()
                            router.push("/")
                          }}
                          variant="ghost"
                          className="w-full rounded-xl hover:bg-destructive/10 text-destructive justify-center flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <Button
                          onClick={handleCreateEventClick}
                          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-md shadow-indigo-500/20"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Event
                        </Button>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <Link
                            href="/sign-in"
                            className={cn(
                              buttonVariants({ variant: "outline" }),
                              "rounded-xl border-muted hover:bg-muted/50 text-foreground justify-center"
                            )}
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/sign-up"
                            className={cn(
                              buttonVariants(),
                              "rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-md shadow-indigo-500/10 justify-center"
                            )}
                          >
                            Sign Up
                          </Link>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
