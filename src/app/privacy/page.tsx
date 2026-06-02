"use client"
 
import * as React from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Shield, Lock, Eye, FileText } from "lucide-react"
 
export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar onCreateEventClick={() => {}} />
      <main className="flex-grow pt-28 pb-16 bg-background bg-dot-grid relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#ff7759]/20 bg-[#ff7759]/8 text-xs font-mono text-[#ff7759] mb-3 uppercase tracking-wider">
              <Shield className="h-3.5 w-3.5" />
              <span>Trust & Security</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
              Last Updated: May 30, 2026. We value your privacy and security. Read how we protect and manage your personal data.
            </p>
          </div>
 
          <div className="border border-border bg-card p-6 md:p-10 rounded-[16px] shadow-none space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-3">
              <h2 className="text-lg font-heading font-medium text-foreground flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#ff7759]" />
                1. Information We Collect
              </h2>
              <p>
                We collect information you provide directly to us when registering an account, purchasing event tickets, or creating events. This includes name, email address, transaction information via payment processors (Razorpay), and metadata details for your attendee profile sync.
              </p>
            </section>
 
            <section className="space-y-3">
              <h2 className="text-lg font-heading font-medium text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#ff7759]" />
                2. How We Protect Your Data
              </h2>
              <p>
                All account sessions and authentication tokens are securely handled by Clerk. Database records are persisted using Row-Level Security policies in Supabase. Payment transactions are processed securely through Razorpay's PCI-DSS compliant checkout integrations; we do not store raw card credentials or CVV numbers on our servers.
              </p>
            </section>
 
            <section className="space-y-3">
              <h2 className="text-lg font-heading font-medium text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#ff7759]" />
                3. Sharing & Disclosures
              </h2>
              <p>
                We do not sell or lease your personal information to third parties. Data is shared with event organizers solely for the purpose of event registration lists and check-in verifications. It is also shared with our payment provider (Razorpay) to complete ticket purchase transactions.
              </p>
            </section>
 
            <section className="space-y-3">
              <h2 className="text-lg font-heading font-medium text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#ff7759]" />
                4. Your Rights & Preferences
              </h2>
              <p>
                You have the right to request deletion of your profile details, edit organizer configurations, or opt-out of newsletter list subscriptions. Feel free to contact our support team at security@rotasphere.com for any compliance or security inquiries.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
