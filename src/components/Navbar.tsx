"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useAuthSession } from "@/context/AuthContext"
import { Moon, Sun, Menu, Plus, LogOut, LayoutDashboard, ChevronDown } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => { clearTimeout(timer); window.removeEventListener("scroll", handleScroll) }
  }, [])

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
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "Categories", href: "/categories" },
    { label: "About", href: "/about" },
  ]

  const handleCreateEventClick = () => {
    if (!isSignedIn) { router.push("/sign-in"); return }
    if (role === "attendee") {
      alert("Only Organizers and Admins can create events.")
      return
    }
    onCreateEventClick()
  }

  const userInitials = user?.fullName
    ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U"

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl transition-all duration-300 ${
        isScrolled ? "top-2 scale-[0.99]" : "top-4"
      }`}
    >
      {/* ─── Floating Nav Pill ─── */}
      <div className="floating-nav-pill px-6 md:px-8 py-3.5 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          {/* Near-Black circle logo */}
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center font-black text-sm transition-transform group-hover:scale-105 shrink-0"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            R
          </div>
          <span
            className="font-bold text-xl tracking-tight"
            style={{ color: "var(--foreground)", letterSpacing: "-0.03em" }}
          >
            Rota<span style={{ color: "var(--accent)" }}>Sphere</span>
          </span>
        </Link>

        {/* Desktop Nav Links — centered */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors hover:opacity-60"
              style={{ color: "var(--foreground)", letterSpacing: "-0.01em" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle — circular icon button */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              style={{ border: "1px solid var(--border)", background: "var(--card)" }}
              aria-label="Toggle theme"
            >
              {theme === "dark"
                ? <Sun className="h-4 w-4" style={{ color: "var(--accent)" }} />
                : <Moon className="h-4 w-4" style={{ color: "var(--foreground)" }} />
              }
            </button>
          )}

          {/* Create Event — Near-Black Pill */}
          <button
            onClick={handleCreateEventClick}
            className="flex items-center gap-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              borderRadius: "32px",
              padding: "8px 20px",
              border: "1px solid var(--primary)",
              letterSpacing: "-0.01em"
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Create Event
          </button>

          {/* Auth */}
          {mounted && (
            <>
              {isSignedIn && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full transition-colors cursor-pointer"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs overflow-hidden"
                      style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                    >
                      {user.imageUrl
                        ? <img src={user.imageUrl} alt={user.fullName} className="h-full w-full object-cover" />
                        : <span>{userInitials}</span>
                      }
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 mr-1" style={{ color: "var(--muted-foreground)" }} />
                  </button>

                  {/* Dropdown */}
                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 p-2 animate-in fade-in slide-in-from-top-3 duration-200"
                      style={{
                        background: "var(--card)",
                        borderRadius: "16px",
                        border: "1px solid var(--border)",
                        boxShadow: "rgba(0,0,0,0.02) 0px 12px 32px"
                      }}
                    >
                      <div className="px-3 py-2.5">
                        <div className="font-medium text-sm truncate" style={{ color: "var(--foreground)", letterSpacing: "-0.01em" }}>
                          {user.fullName}
                        </div>
                        <div className="text-xs font-weight-450 truncate" style={{ color: "var(--muted-foreground)" }}>
                          {user.email}
                        </div>
                        <span
                          className="inline-block text-[9px] font-bold uppercase mt-1.5"
                          style={{
                            background: "var(--muted)",
                            color: "var(--accent)",
                            padding: "2px 10px",
                            borderRadius: "999px",
                            letterSpacing: "0.06em",
                            border: "1px solid var(--border)"
                          }}
                        >
                          {role}
                        </span>
                      </div>

                      <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />

                      <Link
                        href="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl transition-colors"
                        style={{ color: "var(--foreground)" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--muted)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        <LayoutDashboard className="h-4 w-4" style={{ color: "var(--accent)" }} />
                        Dashboard
                      </Link>

                      <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />

                      <button
                        onClick={async () => {
                          setIsDropdownOpen(false)
                          await signOut()
                          router.push("/")
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl transition-colors text-left cursor-pointer"
                        style={{ color: "#d32f2f" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(211,47,47,0.06)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
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
                    className="text-sm font-medium transition-colors hover:opacity-70"
                    style={{ color: "var(--foreground)", letterSpacing: "-0.01em" }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: "var(--primary)",
                      color: "var(--primary-foreground)",
                      borderRadius: "32px",
                      padding: "8px 20px",
                      border: "1px solid var(--primary)",
                      letterSpacing: "-0.01em"
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* ─── Mobile ─── */}
        <div className="flex md:hidden items-center gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              style={{ border: "1px solid var(--border)", background: "var(--card)" }}
              aria-label="Toggle theme"
            >
              {theme === "dark"
                ? <Sun className="h-4 w-4" style={{ color: "var(--accent)" }} />
                : <Moon className="h-4 w-4" style={{ color: "var(--foreground)" }} />
              }
            </button>
          )}

          <Sheet>
            <SheetTrigger
              render={
                <button
                  className="h-9 w-9 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  style={{ border: "1px solid var(--border)", background: "var(--card)" }}
                >
                  <Menu className="h-4 w-4" style={{ color: "var(--foreground)" }} />
                </button>
              }
            />
            <SheetContent
              side="right"
              className="w-[280px] sm:w-[320px]"
              style={{ background: "var(--card)", border: "none", borderLeft: "1px solid var(--border)" }}
            >
              <SheetTitle
                className="text-left text-lg font-medium mb-6"
                style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
              >
                Rota<span style={{ color: "var(--accent)" }}>Sphere</span>
              </SheetTitle>

              {/* Profile summary in mobile */}
              {mounted && isSignedIn && user && (
                <div
                  className="flex items-center gap-3 p-3 mb-6"
                  style={{ background: "var(--muted)", borderRadius: "16px", border: "1px solid var(--border)" }}
                >
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden"
                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    {user.imageUrl
                      ? <img src={user.imageUrl} alt={user.fullName} className="h-full w-full rounded-full object-cover" />
                      : <span>{userInitials}</span>
                    }
                  </div>
                  <div className="truncate">
                    <span className="font-medium text-sm block truncate" style={{ color: "var(--foreground)" }}>
                      {user.fullName}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase block mt-0.5"
                      style={{ color: "var(--accent)", letterSpacing: "0.06em" }}
                    >
                      {role}
                    </span>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-5 mb-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-base font-medium transition-colors"
                    style={{ color: "var(--foreground)", letterSpacing: "-0.01em" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div style={{ height: "1px", background: "var(--border)", marginBottom: "20px" }} />

              {mounted && (
                <>
                  {isSignedIn ? (
                    <div className="space-y-3">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 w-full text-sm font-medium"
                        style={{
                          background: "var(--muted)",
                          color: "var(--foreground)",
                          borderRadius: "32px",
                          padding: "10px 20px",
                          border: "1px solid var(--border)",
                          textDecoration: "none"
                        }}
                      >
                        <LayoutDashboard className="h-4 w-4" style={{ color: "var(--accent)" }} />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleCreateEventClick}
                        className="flex items-center gap-2 w-full text-sm font-medium cursor-pointer"
                        style={{
                          background: "var(--primary)",
                          color: "var(--primary-foreground)",
                          borderRadius: "32px",
                          padding: "10px 20px",
                          border: "1px solid var(--primary)"
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Create Event
                      </button>
                      <button
                        onClick={async () => { await signOut(); router.push("/") }}
                        className="flex items-center gap-2 w-full text-sm font-medium cursor-pointer"
                        style={{
                          background: "rgba(211,47,47,0.06)",
                          color: "#d32f2f",
                          borderRadius: "32px",
                          padding: "10px 20px",
                          border: "1px solid rgba(211,47,47,0.15)"
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handleCreateEventClick}
                        className="flex items-center justify-center gap-2 w-full text-sm font-medium cursor-pointer"
                        style={{
                          background: "var(--primary)",
                          color: "var(--primary-foreground)",
                          borderRadius: "32px",
                          padding: "10px 20px",
                          border: "1px solid var(--primary)"
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Create Event
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          href="/sign-in"
                          className="flex items-center justify-center text-sm font-medium"
                          style={{
                            background: "var(--card)",
                            color: "var(--foreground)",
                            borderRadius: "32px",
                            padding: "10px",
                            border: "1px solid var(--border)",
                            textDecoration: "none"
                          }}
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/sign-up"
                          className="flex items-center justify-center text-sm font-medium"
                          style={{
                            background: "var(--primary)",
                            color: "var(--primary-foreground)",
                            borderRadius: "32px",
                            padding: "10px",
                            border: "1px solid var(--primary)",
                            textDecoration: "none"
                          }}
                        >
                          Sign Up
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  )
}
