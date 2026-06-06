"use client"

import * as React from "react"
import { Send } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const [email, setEmail] = React.useState("")
  const [subscribed, setSubscribed] = React.useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return
    setSubscribed(true)
    setEmail("")
    setTimeout(() => setSubscribed(false), 4000)
  }

  const footerLinks = [
    {
      title: "Platform",
      links: [
        { label: "Events", href: "/events" },
        { label: "Categories", href: "/categories" },
        { label: "About", href: "/about" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Community", href: "#" },
        { label: "Guides & Tutorials", href: "#" },
        { label: "Documentation", href: "#" },
        { label: "API Reference", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Careers", href: "#" },
        { label: "Press Kit", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
  ]

  const socialIcons = [
    {
      label: "X / Twitter",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      label: "LinkedIn",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      )
    },
    {
      label: "Facebook",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      )
    },
    {
      label: "YouTube",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" />
        </svg>
      )
    }
  ]

  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "#17171c", paddingTop: "80px", paddingBottom: "60px" }}
    >
      {/* Ghost Watermark — white-on-dark */}
      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
        style={{
          fontSize: "clamp(80px, 14vw, 220px)",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          color: "rgba(255,255,255,0.015)",
          lineHeight: 1,
          userSelect: "none",
          paddingLeft: "24px"
        }}
      >
        EVENTS
      </div>

      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">

        {/* Large Conversational H2 — per DESIGN.md footer spec */}
        <div className="max-w-3xl mb-16">
          <h2
            className="font-medium leading-tight"
            style={{
              fontSize: "clamp(28px, 5vw, 52px)",
              color: "#FFFFFF",
              letterSpacing: "-0.02em"
            }}
          >
            We're always here when you need to host the extraordinary.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center font-black text-sm"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                R
              </div>
              <span
                className="font-bold text-xl tracking-tight"
                style={{ color: "#FFFFFF", letterSpacing: "-0.03em" }}
              >
                Rota<span style={{ color: "var(--accent)" }}>Sphere</span>
              </span>
            </Link>

            <p
              className="font-weight-450 mb-6 max-w-xs leading-relaxed"
              style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}
            >
              Made for Rotaract District 3192 to facilitate showcasing club events, managing registrations, and booking passes with ease.
            </p>

            {/* Social Icons — circular on ink */}
            <div className="flex gap-3">
              {socialIcons.map((social, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.6)"
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"
                    ;(e.currentTarget as HTMLElement).style.color = "var(--accent)"
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"
                    ;(e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"
                  }}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns — uppercase muted column headers per DESIGN.md */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3
                className="text-xs font-bold uppercase mb-5"
                style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}
              >
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="font-weight-450 transition-colors text-sm"
                      style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#FFFFFF"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="md:col-span-2 lg:col-span-1">
            <h3
              className="text-xs font-bold uppercase mb-5"
              style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}
            >
              Newsletter
            </h3>
            <p
              className="font-weight-450 mb-4 text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Stay updated with product releases and local event guides.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 text-sm font-weight-450 h-10 px-4 outline-none transition-colors"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "999px",
                  color: "#FFFFFF",
                  minWidth: 0
                }}
              />
              <button
                type="submit"
                className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:opacity-90 cursor-pointer"
                style={{ background: "var(--accent)", color: "#FFFFFF", border: "none" }}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            {subscribed && (
              <p className="text-xs mt-2 font-medium" style={{ color: "var(--accent)" }}>
                ✓ You&apos;re subscribed! Welcome aboard.
              </p>
            )}
          </div>

        </div>

        {/* Divider — white at 12% opacity per DESIGN.md */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.12)", marginBottom: "28px" }} />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-weight-450" style={{ color: "rgba(255,255,255,0.4)" }}>
            © {new Date().getFullYear()} RotaSphere Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Cookie Settings", href: "#" }
            ].map(link => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-weight-450 transition-colors"
                style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
