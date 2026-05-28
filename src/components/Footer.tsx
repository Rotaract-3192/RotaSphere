"use client"

import * as React from "react"
import { Sparkles, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  const [email, setEmail] = React.useState("")
  const [subscribed, setSubscribed] = React.useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return
    
    // Simulate subscribe
    setSubscribed(true)
    setEmail("")
    setTimeout(() => {
      setSubscribed(false)
    }, 4000)
  }

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#" },
        { label: "Integrations", href: "#" },
        { label: "Changelog", href: "#" },
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
        { label: "About Us", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Press Kit", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
  ]

  return (
    <footer className="relative border-t border-border bg-slate-900 text-slate-200 dark:bg-[#060810] dark:text-slate-300 pt-16 pb-12 overflow-hidden">
      {/* Background Decorative Gradient */}
      <div className="absolute top-0 right-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                RotaSphere
              </span>
            </a>
            <p className="text-sm text-slate-400 mb-6 max-w-sm">
              The premium, all-in-one event management SaaS platform. Host conferences, music festivals, webinars, and meetups with seamless ticketing and modern design interfaces.
            </p>
            {/* Socials */}
            <div className="flex gap-4">
              <a href="#" className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors" aria-label="Twitter">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors" aria-label="GitHub">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="#" className="h-8 w-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors" aria-label="Facebook">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-4">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Box */}
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-4">
              Newsletter
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Subscribe to stay updated with product releases and local event guides.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm md:max-w-none">
              <Input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500 rounded-xl focus-visible:ring-indigo-500 text-sm h-10"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-indigo-500 hover:bg-indigo-600 rounded-xl h-10 w-10 shrink-0 text-white shadow-md shadow-indigo-500/20"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {subscribed && (
              <p className="text-xs text-emerald-400 mt-2 font-medium">
                Awesome! You have been subscribed successfully.
              </p>
            )}
          </div>
        </div>

        <div className="h-px bg-slate-800 my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} RotaSphere Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
