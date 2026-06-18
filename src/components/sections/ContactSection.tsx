"use client"

import * as React from "react"
import { Send, Mail, MessageSquare, User, Building2 } from "lucide-react"

export function ContactSection() {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    club: "",
    message: ""
  })
  const [submitted, setSubmitted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
  }

  return (
    <section
      className="relative section-padding overflow-hidden"
      style={{ background: "#eeece7" }}
    >
      {/* Ghost watermark */}
      <div
        className="ghost-watermark absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        aria-hidden="true"
        style={{ color: "rgba(23, 23, 28, 0.018)" }}
      >
        CONNECT
      </div>

      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: editorial copy */}
          <div>
            <span className="eyebrow-accent mb-4 block">Get in Touch</span>
            <h2
              className="text-4xl md:text-5xl font-medium mb-6"
              style={{ color: "#17171c", letterSpacing: "-0.02em" }}
            >
              Ready to power your next event?
            </h2>
            <p
              className="font-weight-450 leading-relaxed mb-8"
              style={{ color: "#616161", fontSize: "16px" }}
            >
              Whether you're running a 20-person service project or a 2,000-seat district assembly —
              talk to our team and we'll set up your club with the right plan.
            </p>

            {/* Contact detail chips */}
            <div className="space-y-4">
              {[
                { icon: Mail, label: "Email us", value: "exuberantdrr@gmail.com / rotaract3192@gmail.com" },
                { icon: MessageSquare, label: "Live chat", value: "Available Mon–Fri, 9am–6pm IST" },
                { icon: Building2, label: "Club onboarding", value: "Free for all Rotaract clubs" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className="h-11 w-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "#ffffff", border: "1px solid #d9d9dd" }}
                  >
                    <item.icon className="h-4.5 w-4.5" style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "#93939f" }}>
                      {item.label}
                    </p>
                    <p className="text-sm font-weight-450" style={{ color: "#212121" }}>
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Contact Form Card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "22px",
              border: "1px solid #d9d9dd",
              padding: "36px"
            }}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}
                >
                  <Send className="h-6 w-6" style={{ color: "#4ade80" }} />
                </div>
                <h3
                  className="text-xl font-medium mb-2"
                  style={{ color: "#17171c", letterSpacing: "-0.02em" }}
                >
                  Message Sent!
                </h3>
                <p className="text-sm font-weight-450" style={{ color: "#616161" }}>
                  Our team will reach out within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <p
                    className="font-medium mb-5"
                    style={{ color: "#17171c", letterSpacing: "-0.01em" }}
                  >
                    Book a demo or ask a question
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#93939f" }}>
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#d9d9dd" }} />
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border transition-all duration-200"
                      style={{
                        background: "#ffffff",
                        borderColor: "#d9d9dd",
                        color: "#212121",
                        outline: "none"
                      }}
                      onFocus={e => {
                        (e.target as HTMLInputElement).style.borderColor = "#17458f"
                        ;(e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(23,69,143,0.08)"
                      }}
                      onBlur={e => {
                        (e.target as HTMLInputElement).style.borderColor = "#d9d9dd"
                        ;(e.target as HTMLInputElement).style.boxShadow = "none"
                      }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#93939f" }}>
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#d9d9dd" }} />
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="you@rotaract.org"
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border transition-all duration-200"
                      style={{
                        background: "#ffffff",
                        borderColor: "#d9d9dd",
                        color: "#212121",
                        outline: "none"
                      }}
                      onFocus={e => {
                        (e.target as HTMLInputElement).style.borderColor = "#17458f"
                        ;(e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(23,69,143,0.08)"
                      }}
                      onBlur={e => {
                        (e.target as HTMLInputElement).style.borderColor = "#d9d9dd"
                        ;(e.target as HTMLInputElement).style.boxShadow = "none"
                      }}
                    />
                  </div>
                </div>

                {/* Club */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#93939f" }}>
                    Club / District
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#d9d9dd" }} />
                    <input
                      type="text"
                      value={form.club}
                      onChange={e => setForm({ ...form, club: e.target.value })}
                      placeholder="Rotaract Club of ..."
                      className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border transition-all duration-200"
                      style={{
                        background: "#ffffff",
                        borderColor: "#d9d9dd",
                        color: "#212121",
                        outline: "none"
                      }}
                      onFocus={e => {
                        (e.target as HTMLInputElement).style.borderColor = "#17458f"
                        ;(e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(23,69,143,0.08)"
                      }}
                      onBlur={e => {
                        (e.target as HTMLInputElement).style.borderColor = "#d9d9dd"
                        ;(e.target as HTMLInputElement).style.boxShadow = "none"
                      }}
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "#93939f" }}>
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your upcoming event or ask anything..."
                    className="w-full px-4 py-3 text-sm rounded-lg border resize-none transition-all duration-200"
                    style={{
                      background: "#ffffff",
                      borderColor: "#d9d9dd",
                      color: "#212121",
                      outline: "none"
                    }}
                    onFocus={e => {
                      (e.target as HTMLTextAreaElement).style.borderColor = "#17458f"
                      ;(e.target as HTMLTextAreaElement).style.boxShadow = "0 0 0 3px rgba(23,69,143,0.08)"
                    }}
                    onBlur={e => {
                      (e.target as HTMLTextAreaElement).style.borderColor = "#d9d9dd"
                      ;(e.target as HTMLTextAreaElement).style.boxShadow = "none"
                    }}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60 cursor-pointer"
                  style={{
                    background: "#17171c",
                    color: "#ffffff",
                    borderRadius: "32px",
                    padding: "13px 24px",
                    border: "1px solid #17171c"
                  }}
                >
                  {loading ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
