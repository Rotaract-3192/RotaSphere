"use client"
 
import * as React from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { FileText, Clipboard, Scale, HelpCircle } from "lucide-react"
 
export default function TermsOfServicePage() {
  return (
    <>
      <Navbar onCreateEventClick={() => {}} />
      <main className="flex-grow pt-28 pb-16 bg-background bg-dot-grid relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent/20 bg-accent/8 text-xs font-mono text-accent mb-3 uppercase tracking-wider">
              <Scale className="h-3.5 w-3.5" />
              <span>Legal Agreements</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
              Welcome to RotaSphere. By using our event management platforms and ticketing checkout services, you agree to these legal terms.
            </p>
          </div>
 
          <div className="border border-border bg-card p-6 md:p-10 rounded-[16px] shadow-none space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-3">
              <h2 className="text-lg font-heading font-medium text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing RotaSphere, you agree to comply with all applicable local, national, and international laws. If you disagree with any portion of these conditions, you must immediately terminate use of our ticketing services and platform dashboards.
              </p>
            </section>
 
            <section className="space-y-3">
              <h2 className="text-lg font-heading font-medium text-foreground flex items-center gap-2">
                <Clipboard className="h-5 w-5 text-accent" />
                2. User Account Roles
              </h2>
              <p>
                You may register either as an Attendee or an Organizer. Organizers are solely responsible for ensuring the accuracy and legitimacy of event listings, capacity constraints, contact configurations, and price specifications. Attendees must provide valid credentials during checkout and payment processes.
              </p>
            </section>
 
            <section className="space-y-3">
              <h2 className="text-lg font-heading font-medium text-foreground flex items-center gap-2">
                <Scale className="h-5 w-5 text-accent" />
                3. Payments & Ticket Refunds
              </h2>
              <p>
                All ticketing payments are processed through Razorpay. Once a paid transaction succeeds, refund queries must be directed to the designated organizer of the specific event. RotaSphere does not directly hold purchase fees or assume responsibility for canceled events or scheduling adjustments.
              </p>
            </section>
 
            <section className="space-y-3">
              <h2 className="text-lg font-heading font-medium text-foreground flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-accent" />
                4. Code of Conduct & Support
              </h2>
              <p>
                Organizers must not publish fraudulent listings or distribute malicious content. Attendees must not disrupt virtual rooms or copy platform code. For any service issues or legal terms queries, contact support at legal@rotasphere.com.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
