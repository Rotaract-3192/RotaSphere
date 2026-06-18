"use client"

import * as React from "react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export function Footer() {
  const [isContactOpen, setIsContactOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

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
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contact", href: "#" },
      ],
    },
  ]

  const socialIcons = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/rotaract3192?igsh=cmpqcDNucHV6bGg1",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      )
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/rotaract-district-3192/",
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
      href: "https://www.facebook.com/profile.php?id=100093197273171",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      )
    },
    {
      label: "YouTube",
      href: "https://youtube.com/@rotaract3192?si=xRFFuiilPHMKbgi3",
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
      style={{ background: "#17171c" }}
      className="relative overflow-hidden pt-14 pb-10 sm:pt-20 sm:pb-14 md:pt-[80px] md:pb-[60px]"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div className="h-9 w-9 rounded-full overflow-hidden bg-white border border-border flex items-center justify-center shrink-0">
                <img
                  src="/rotasphere-logo.png"
                  alt="RotaSphere Logo"
                  className="h-full w-full object-cover object-top scale-125 origin-top"
                />
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
                  href={social.href}
                  target={social.href !== "#" ? "_blank" : undefined}
                  rel={social.href !== "#" ? "noopener noreferrer" : undefined}
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
                {group.links.map((link) => {
                  const isContact = link.label === "Contact"
                  return (
                    <li key={link.label}>
                      {isContact ? (
                        <button
                          onClick={() => setIsContactOpen(true)}
                          className="font-weight-450 transition-colors text-sm text-left bg-transparent border-0 p-0 cursor-pointer outline-none block"
                          style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#FFFFFF"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"}
                        >
                          {link.label}
                        </button>
                      ) : (
                        <a
                          href={link.href}
                          className="font-weight-450 transition-colors text-sm"
                          style={{ color: "rgba(255,255,255,0.65)", textDecoration: "none" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#FFFFFF"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}

        </div>

        {/* Divider — white at 12% opacity per DESIGN.md */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.12)", marginBottom: "28px" }} />

        {/* Bottom row */}
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-3 text-center sm:text-left">
          <p className="text-xs font-weight-450" style={{ color: "rgba(255,255,255,0.4)" }}>
            © {new Date().getFullYear()} RotaSphere Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
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

      {/* Contact Dialog */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="max-w-md bg-[#17171c] border border-white/10 text-white rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium tracking-tight text-white mb-1">
              Contact Technical Support
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs sm:text-sm">
              Have questions or feedback about the RotaSphere platform? Get in touch with our tech team.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-sm font-semibold select-all text-sky-400 break-all pr-2">
                tech.rotaract3192@gmail.com
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("tech.rotaract3192@gmail.com")
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                className="text-xs font-bold py-2 px-4 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer select-none shrink-0"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  )
}
