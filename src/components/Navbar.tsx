"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import { useAuthSession } from "@/context/AuthContext"
import {
  Moon, Sun, Menu, Plus, LogOut, LayoutDashboard,
  ChevronDown, Sparkles, Home, Calendar, Tag, Info, X
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface NavbarProps {
  onCreateEventClick: () => void;
}

export function Navbar({ onCreateEventClick }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const { user, isSignedIn, signOut, role } = useAuthSession()

  const [mounted, setMounted] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [scrollProgress, setScrollProgress] = React.useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      const docH = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docH > 0 ? (window.scrollY / docH) * 100 : 0)
    }
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
    { label: "Home", href: "/", icon: Home },
    { label: "Events", href: "/events", icon: Calendar },
    { label: "Categories", href: "/categories", icon: Tag },
    { label: "About", href: "/about", icon: Info },
  ]

  const handleCreateEventClick = () => {
    if (!isSignedIn) { router.push("/sign-in"); return }
    if (role === "ATTENDEE" || role === "PENDING_USER") {
      alert("Only Organizers and Admins can create events.")
      return
    }
    onCreateEventClick()
  }

  const userInitials = user?.fullName
    ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U"

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* ── Scroll progress bar ── */}
      <div
        className="fixed top-0 left-0 z-[60] h-[2px] transition-all duration-150"
        style={{
          width: `${scrollProgress}%`,
          background: "linear-gradient(90deg, #1E88E5, #4FC3F7, #1E88E5)",
          backgroundSize: "200%",
          animation: scrollProgress > 0 ? "gradientShift 2s linear infinite" : "none",
          boxShadow: "0 0 8px rgba(79,195,247,0.6)"
        }}
      />

      <header
        className={`fixed left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-6xl transition-all duration-500 ease-out ${
          isScrolled ? "top-2" : "top-4"
        }`}
      >
        {/* ─── Floating Nav Pill ─── */}
        <div
          className="px-5 md:px-7 py-3 flex items-center justify-between relative overflow-hidden"
          style={{
            borderRadius: "999px",
            background: isScrolled
              ? "rgba(255,255,255,0.92)"
              : "rgba(255,255,255,0.88)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: `1px solid ${isScrolled ? "rgba(30,136,229,0.18)" : "rgba(23,23,28,0.08)"}`,
            boxShadow: isScrolled
              ? "0 8px 32px -4px rgba(30,136,229,0.15), 0 2px 8px rgba(0,0,0,0.05)"
              : "0 4px 20px rgba(0,0,0,0.04)",
            transition: "all 0.5s cubic-bezier(0.4,0,0.2,1)"
          }}
        >
          {/* Dark mode pill styles */}
          <style>{`
            .dark .nav-pill-inner {
              background: rgba(8,26,51,0.92) !important;
              border-color: rgba(30,136,229,0.18) !important;
            }
          `}</style>

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div
              className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
              style={{ background: "#fff", border: "1.5px solid rgba(30,136,229,0.25)" }}
            >
              <img
                src="/rotasphere-logo.png"
                alt="RotaSphere Logo"
                className="h-full w-full object-cover object-top scale-125 origin-top"
              />
            </div>
            <span
              className="font-extrabold text-[17px] hidden sm:block"
              style={{ color: "var(--foreground)", letterSpacing: "-0.04em" }}
            >
              Rota<span style={{ color: "var(--accent)" }}>Sphere</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="relative px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 group"
                  style={{
                    color: active ? "var(--accent)" : "var(--foreground)",
                    background: active ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "transparent",
                    letterSpacing: "-0.02em"
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "color-mix(in srgb, var(--accent) 6%, transparent)"
                      ;(e.currentTarget as HTMLElement).style.color = "var(--accent)"
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "transparent"
                      ;(e.currentTarget as HTMLElement).style.color = "var(--foreground)"
                    }
                  }}
                >
                  {link.label}
                  {/* Active indicator dot */}
                  {active && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
                      style={{ background: "var(--accent)" }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* ── Desktop Actions ── */}
          <div className="hidden md:flex items-center gap-2">

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                }}
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme}
                    initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === "dark"
                      ? <Sun className="h-3.5 w-3.5" style={{ color: "#FBBF24" }} />
                      : <Moon className="h-3.5 w-3.5" style={{ color: "var(--foreground)" }} />
                    }
                  </motion.div>
                </AnimatePresence>
              </button>
            )}

            {/* Create Event — gradient pill */}
            <button
              onClick={handleCreateEventClick}
              className="relative flex items-center gap-1.5 text-sm font-bold cursor-pointer overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #0A2342 0%, #17458F 100%)",
                color: "#ffffff",
                borderRadius: "32px",
                padding: "8px 18px",
                border: "1px solid rgba(79,195,247,0.2)",
                letterSpacing: "-0.02em",
                boxShadow: "0 4px 14px -3px rgba(23,69,143,0.4)"
              }}
            >
              {/* Shimmer sweep */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: "linear-gradient(135deg, #17458F 0%, #1E88E5 60%, #4FC3F7 100%)",
                }}
              />
              <Sparkles className="h-3.5 w-3.5 relative z-10" />
              <span className="relative z-10">Create Event</span>
            </button>

            {/* Auth section */}
            {mounted && (
              <>
                {isSignedIn && user ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-1.5 p-1 pr-2.5 rounded-full transition-all duration-200 cursor-pointer hover:shadow-md group"
                      style={{
                        border: `1px solid ${isDropdownOpen ? "var(--accent)" : "var(--border)"}`,
                        background: isDropdownOpen ? "color-mix(in srgb, var(--accent) 5%, var(--card))" : "var(--card)",
                        transition: "all 0.25s ease"
                      }}
                    >
                      {/* Avatar */}
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center font-extrabold text-[10px] overflow-hidden animate-glow-pulse"
                        style={{
                          background: user.imageUrl ? "transparent" : "linear-gradient(135deg, #0A2342, #1E88E5)",
                          color: "#fff"
                        }}
                      >
                        {user.imageUrl
                          ? <img src={user.imageUrl} alt={user.fullName} className="h-full w-full object-cover" />
                          : <span>{userInitials}</span>
                        }
                      </div>
                      <span className="text-xs font-bold max-w-[80px] truncate hidden lg:block" style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}>
                        {user.fullName?.split(" ")[0]}
                      </span>
                      <motion.div
                        animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-3.5 w-3.5" style={{ color: "var(--muted-foreground)" }} />
                      </motion.div>
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute right-0 mt-2 w-60 p-1.5"
                          style={{
                            background: "var(--card)",
                            borderRadius: "18px",
                            border: "1px solid var(--border)",
                            boxShadow: "0 16px 48px -8px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)"
                          }}
                        >
                          {/* Profile header */}
                          <div
                            className="px-3.5 py-3 mb-1 rounded-[14px]"
                            style={{ background: "color-mix(in srgb, var(--accent) 5%, transparent)" }}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="h-9 w-9 rounded-full flex items-center justify-center font-extrabold text-xs overflow-hidden shrink-0"
                                style={{ background: "linear-gradient(135deg, #0A2342, #1E88E5)", color: "#fff" }}
                              >
                                {user.imageUrl
                                  ? <img src={user.imageUrl} alt={user.fullName} className="h-full w-full object-cover" />
                                  : <span>{userInitials}</span>
                                }
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-sm truncate" style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}>
                                  {user.fullName}
                                </div>
                                <div className="text-[11px] truncate" style={{ color: "var(--muted-foreground)" }}>
                                  {user.email}
                                </div>
                              </div>
                            </div>
                            <span
                              className="inline-block text-[9px] font-extrabold uppercase mt-2"
                              style={{
                                background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                                color: "var(--accent)",
                                padding: "2px 10px",
                                borderRadius: "999px",
                                letterSpacing: "0.1em",
                                border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)"
                              }}
                            >
                              {role}
                            </span>
                          </div>

                          {/* Dashboard link */}
                          <Link
                            href="/dashboard"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold rounded-[14px] transition-all duration-150 group"
                            style={{ color: "var(--foreground)", textDecoration: "none" }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = "var(--muted)"
                              ;(e.currentTarget as HTMLElement).style.color = "var(--accent)"
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = "transparent"
                              ;(e.currentTarget as HTMLElement).style.color = "var(--foreground)"
                            }}
                          >
                            <div
                              className="h-7 w-7 rounded-full flex items-center justify-center"
                              style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)" }}
                            >
                              <LayoutDashboard className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                            </div>
                            Dashboard
                          </Link>

                          <div style={{ height: "1px", background: "var(--border)", margin: "4px 6px" }} />

                          {/* Sign out */}
                          <button
                            onClick={async () => {
                              setIsDropdownOpen(false)
                              await signOut()
                              router.push("/")
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold rounded-[14px] transition-all duration-150 text-left cursor-pointer"
                            style={{ color: "#ef4444" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                          >
                            <div
                              className="h-7 w-7 rounded-full flex items-center justify-center"
                              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                            >
                              <LogOut className="h-3.5 w-3.5" />
                            </div>
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/sign-in"
                      className="text-sm font-bold transition-all duration-200 px-4 py-2 rounded-full hover:opacity-70"
                      style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      className="text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 px-4 py-2 rounded-full"
                      style={{
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                        letterSpacing: "-0.02em",
                        boxShadow: "0 4px 12px -2px rgba(10,35,66,0.3)"
                      }}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Mobile Actions ── */}
          <div className="flex md:hidden items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
                style={{ border: "1px solid var(--border)", background: "var(--card)" }}
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme}
                    initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === "dark"
                      ? <Sun className="h-3.5 w-3.5" style={{ color: "#FBBF24" }} />
                      : <Moon className="h-3.5 w-3.5" style={{ color: "var(--foreground)" }} />
                    }
                  </motion.div>
                </AnimatePresence>
              </button>
            )}

            <Sheet>
              <SheetTrigger
                render={
                  <button
                    onClick={() => setMobileOpen(true)}
                    className="h-9 w-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 group"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                  >
                    <Menu className="h-4 w-4" style={{ color: "var(--foreground)" }} />
                  </button>
                }
              />
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[340px] p-0"
                style={{ background: "var(--card)", border: "none", borderLeft: "1px solid var(--border)" }}
              >
                <div className="flex flex-col h-full">
                  {/* Mobile drawer header */}
                  <div
                    className="flex items-center justify-between px-6 pt-6 pb-5"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <SheetTitle className="flex items-center gap-2.5 text-base font-extrabold" style={{ color: "var(--foreground)", letterSpacing: "-0.03em" }}>
                      <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ background: "#fff", border: "1.5px solid rgba(30,136,229,0.25)" }}>
                        <img src="/rotasphere-logo.png" alt="RotaSphere Logo" className="h-full w-full object-cover object-top scale-125 origin-top" />
                      </div>
                      Rota<span style={{ color: "var(--accent)" }}>Sphere</span>
                    </SheetTitle>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
                    {/* Profile card if signed in */}
                    {mounted && isSignedIn && user && (
                      <div
                        className="flex items-center gap-3 p-3.5"
                        style={{
                          background: "color-mix(in srgb, var(--accent) 5%, var(--muted))",
                          borderRadius: "16px",
                          border: "1px solid color-mix(in srgb, var(--accent) 15%, var(--border))"
                        }}
                      >
                        <div
                          className="h-11 w-11 rounded-full flex items-center justify-center font-extrabold text-sm overflow-hidden shrink-0"
                          style={{ background: "linear-gradient(135deg, #0A2342, #1E88E5)", color: "#fff" }}
                        >
                          {user.imageUrl
                            ? <img src={user.imageUrl} alt={user.fullName} className="h-full w-full rounded-full object-cover" />
                            : <span>{userInitials}</span>
                          }
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-sm block truncate" style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}>
                            {user.fullName}
                          </span>
                          <span
                            className="text-[9px] font-extrabold uppercase"
                            style={{ color: "var(--accent)", letterSpacing: "0.1em" }}
                          >
                            {role}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Nav links */}
                    <nav className="space-y-1">
                      {navLinks.map((link) => {
                        const active = isActive(link.href)
                        const Icon = link.icon
                        return (
                          <Link
                            key={link.label}
                            href={link.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                            style={{
                              color: active ? "var(--accent)" : "var(--foreground)",
                              background: active
                                ? "color-mix(in srgb, var(--accent) 8%, transparent)"
                                : "transparent",
                              letterSpacing: "-0.02em",
                              textDecoration: "none"
                            }}
                            onMouseEnter={e => {
                              if (!active) {
                                (e.currentTarget as HTMLElement).style.background = "var(--muted)"
                              }
                            }}
                            onMouseLeave={e => {
                              if (!active) {
                                (e.currentTarget as HTMLElement).style.background = "transparent"
                              }
                            }}
                          >
                            <div
                              className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                              style={{
                                background: active
                                  ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                                  : "var(--muted)",
                                border: `1px solid ${active ? "color-mix(in srgb, var(--accent) 25%, transparent)" : "var(--border)"}`
                              }}
                            >
                              <Icon className="h-4 w-4" style={{ color: active ? "var(--accent)" : "var(--muted-foreground)" }} />
                            </div>
                            {link.label}
                            {active && (
                              <span className="ml-auto h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
                            )}
                          </Link>
                        )
                      })}
                    </nav>

                    <div style={{ height: "1px", background: "var(--border)" }} />

                    {/* Auth actions */}
                    {mounted && (
                      <>
                        {isSignedIn ? (
                          <div className="space-y-2">
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
                              style={{
                                color: "var(--foreground)",
                                background: "var(--muted)",
                                border: "1px solid var(--border)",
                                textDecoration: "none",
                                letterSpacing: "-0.02em"
                              }}
                            >
                              <LayoutDashboard className="h-4 w-4" style={{ color: "var(--accent)" }} />
                              Dashboard
                            </Link>
                            <button
                              onClick={handleCreateEventClick}
                              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                              style={{
                                background: "linear-gradient(135deg, #0A2342 0%, #17458F 100%)",
                                color: "#ffffff",
                                border: "1px solid rgba(79,195,247,0.15)",
                                letterSpacing: "-0.02em",
                                boxShadow: "0 4px 14px -3px rgba(23,69,143,0.4)"
                              }}
                            >
                              <Sparkles className="h-4 w-4" />
                              Create Event
                            </button>
                            <button
                              onClick={async () => { await signOut(); router.push("/") }}
                              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-bold cursor-pointer transition-all duration-200"
                              style={{
                                background: "rgba(239,68,68,0.06)",
                                color: "#ef4444",
                                border: "1px solid rgba(239,68,68,0.15)",
                                letterSpacing: "-0.02em"
                              }}
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <button
                              onClick={handleCreateEventClick}
                              className="flex items-center justify-center gap-2 w-full text-sm font-bold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 px-4 py-3 rounded-2xl"
                              style={{
                                background: "linear-gradient(135deg, #0A2342 0%, #17458F 100%)",
                                color: "#ffffff",
                                border: "1px solid rgba(79,195,247,0.15)",
                                letterSpacing: "-0.02em",
                                boxShadow: "0 4px 14px -3px rgba(23,69,143,0.4)"
                              }}
                            >
                              <Sparkles className="h-4 w-4" />
                              Create Event
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                              <Link
                                href="/sign-in"
                                className="flex items-center justify-center text-sm font-bold text-center py-3 rounded-2xl transition-all duration-200"
                                style={{
                                  background: "var(--muted)",
                                  color: "var(--foreground)",
                                  border: "1px solid var(--border)",
                                  textDecoration: "none",
                                  letterSpacing: "-0.02em"
                                }}
                              >
                                Sign In
                              </Link>
                              <Link
                                href="/sign-up"
                                className="flex items-center justify-center text-sm font-bold text-center py-3 rounded-2xl transition-all duration-200"
                                style={{
                                  background: "var(--primary)",
                                  color: "var(--primary-foreground)",
                                  textDecoration: "none",
                                  letterSpacing: "-0.02em"
                                }}
                              >
                                Sign Up
                              </Link>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Mobile drawer footer */}
                  <div
                    className="px-6 py-4 text-center"
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: "var(--muted-foreground)" }}>
                      Rotaract District 3192
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}
