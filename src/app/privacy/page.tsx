"use client"

import * as React from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import {
  Shield, Lock, Eye, FileText, CreditCard, RotateCcw,
  Database, Cookie, Server, Baby, Globe, UserCheck,
  RefreshCw, Mail
} from "lucide-react"

const sections = [
  {
    icon: Eye,
    title: "1. Information We Collect",
    content: (
      <div className="space-y-4">
        <p>When you use RotaSphere, we may collect the following information:</p>

        <div>
          <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Rotary or Rotaract club affiliation</li>
            <li>Profile information provided during account creation</li>
            <li>Billing information required for ticket purchases</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-2">Event Information</h3>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Events registered for</li>
            <li>Tickets purchased</li>
            <li>Attendance records</li>
            <li>Event preferences and participation history</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-2">Payment Information</h3>
          <p>
            Payments on RotaSphere are processed securely through third-party payment gateway providers. We do not store your complete debit card, credit card, UPI PIN, or banking credentials on our servers.
          </p>
          <p className="mt-2">The payment provider may collect:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 mt-1">
            <li>Transaction ID</li>
            <li>Payment status</li>
            <li>Payment amount</li>
            <li>Payment method used</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-foreground mb-2">Technical Information</h3>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>Operating system</li>
            <li>Pages visited on the platform</li>
            <li>Date and time of access</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    icon: FileText,
    title: "2. How We Use Your Information",
    content: (
      <ul className="list-disc list-inside space-y-1.5 pl-2">
        <li>Create and manage your account.</li>
        <li>Process event registrations and ticket bookings.</li>
        <li>Verify payments and issue confirmations.</li>
        <li>Generate tickets and attendance records.</li>
        <li>Communicate event updates and important announcements.</li>
        <li>Provide customer support.</li>
        <li>Improve the functionality and security of the platform.</li>
        <li>Comply with legal and financial obligations.</li>
      </ul>
    )
  },
  {
    icon: Globe,
    title: "3. Sharing of Information",
    content: (
      <div className="space-y-3">
        <p>We do not sell, rent, or trade your personal information.</p>
        <p>Your information may be shared only with:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Authorized administrators of Rotaract District 3192.</li>
          <li>Event organizers managing specific events.</li>
          <li>Payment gateway providers for transaction processing.</li>
          <li>Service providers assisting in hosting, analytics, or platform operations.</li>
          <li>Government authorities or law enforcement agencies when required by law.</li>
        </ul>
      </div>
    )
  },
  {
    icon: CreditCard,
    title: "4. Payment Security",
    content: (
      <div className="space-y-3">
        <p>All payment transactions are processed through secure, PCI-compliant third-party payment gateways.</p>
        <p>RotaSphere does not store:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Card numbers</li>
          <li>CVV numbers</li>
          <li>UPI PINs</li>
          <li>Net banking passwords</li>
        </ul>
        <p>Users are encouraged to verify payment details carefully before completing transactions.</p>
      </div>
    )
  },
  {
    icon: RotateCcw,
    title: "5. Refunds and Cancellations",
    content: (
      <div className="space-y-3">
        <p>Refunds and cancellations are governed by the policies of the respective event organizers.</p>
        <p>Certain events may have:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Non-refundable tickets</li>
          <li>Partial refund policies</li>
          <li>Refund deadlines</li>
        </ul>
        <p>Users should review event-specific policies before making payments.</p>
      </div>
    )
  },
  {
    icon: Database,
    title: "6. Data Retention",
    content: (
      <div className="space-y-3">
        <p>We retain user information only for as long as necessary to:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Provide platform services</li>
          <li>Maintain event records</li>
          <li>Comply with financial and legal obligations</li>
          <li>Resolve disputes and prevent fraud</li>
        </ul>
        <p>After this period, data may be deleted or anonymized.</p>
      </div>
    )
  },
  {
    icon: Cookie,
    title: "7. Cookies and Tracking Technologies",
    content: (
      <div className="space-y-3">
        <p>RotaSphere may use cookies and similar technologies to:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Maintain user sessions</li>
          <li>Remember preferences</li>
          <li>Improve user experience</li>
          <li>Analyze platform performance</li>
        </ul>
        <p>Users can disable cookies through browser settings, although some features may not function properly.</p>
      </div>
    )
  },
  {
    icon: Lock,
    title: "8. Data Security",
    content: (
      <div className="space-y-3">
        <p>We implement reasonable technical and organizational safeguards to protect your information against:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Unauthorized access</li>
          <li>Loss or theft</li>
          <li>Alteration</li>
          <li>Disclosure</li>
          <li>Misuse</li>
        </ul>
        <p>However, no internet-based system can guarantee absolute security.</p>
      </div>
    )
  },
  {
    icon: Baby,
    title: "9. Children's Privacy",
    content: (
      <p>
        RotaSphere is not intended for children under the age of 13. We do not knowingly collect personal information from children without appropriate consent.
      </p>
    )
  },
  {
    icon: Server,
    title: "10. Third-Party Services",
    content: (
      <div className="space-y-3">
        <p>The platform may integrate with third-party services including:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Payment gateways</li>
          <li>Email delivery services</li>
          <li>Authentication providers</li>
          <li>Analytics services</li>
        </ul>
        <p>These services operate under their own privacy policies.</p>
      </div>
    )
  },
  {
    icon: UserCheck,
    title: "11. Your Rights",
    content: (
      <div className="space-y-3">
        <p>Depending on applicable laws, you may have the right to:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your data</li>
          <li>Withdraw consent where applicable</li>
          <li>Request details regarding how your data is processed</li>
        </ul>
        <p>Requests may be submitted using the contact information below.</p>
      </div>
    )
  },
  {
    icon: RefreshCw,
    title: "12. Changes to This Privacy Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our services, legal requirements, or operational practices. Updated versions will be posted on this page with a revised effective date.
      </p>
    )
  },
  {
    icon: Mail,
    title: "13. Contact Us",
    content: (
      <div className="space-y-3">
        <p>If you have any questions regarding this Privacy Policy or your personal data, please contact:</p>
        <div className="border border-border/50 bg-muted/20 rounded-xl p-4 space-y-2 text-foreground font-medium">
          <p className="text-accent font-semibold">RotaSphere Support Team</p>
          <p>Rotaract District 3192</p>
          <p>
            Email:{" "}
            <a
              href="mailto:tech.rotaract3192@gmail.com"
              className="text-accent hover:underline"
            >
              tech.rotaract3192@gmail.com
            </a>
          </p>
          <p>
            Website:{" "}
            <a
              href="https://rotaract3192.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              rotaract3192.org
            </a>
          </p>
        </div>
        <p className="text-xs text-muted-foreground pt-2 border-t border-border/30">
          By using RotaSphere, you agree to the collection and use of information as described in this Privacy Policy.
        </p>
      </div>
    )
  },
]

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar onCreateEventClick={() => {}} />
      <main className="flex-grow pt-28 pb-20 bg-background relative overflow-hidden">

        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-accent/5 blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-4xl">

          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent/20 bg-accent/8 text-xs font-mono text-accent mb-4 uppercase tracking-wider">
              <Shield className="h-3.5 w-3.5" />
              <span>Trust &amp; Privacy</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
              <span className="text-accent font-semibold">Effective Date: July 4, 2026</span>
              <span className="mx-2 text-border">·</span>
              Welcome to <span className="text-foreground font-semibold">RotaSphere</span>, the official event management and ticketing platform for{" "}
              <span className="text-foreground font-semibold">Rotaract District 3192</span>.
              Your privacy is important to us.
            </p>
          </div>

          {/* Intro card */}
          <div className="border border-accent/15 bg-accent/5 rounded-[16px] px-6 py-5 mb-8 text-sm text-muted-foreground leading-relaxed">
            This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform to register for events, purchase tickets, and participate in district activities.
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section, i) => {
              const Icon = section.icon
              return (
                <div
                  key={i}
                  className="border border-border bg-card rounded-[16px] overflow-hidden shadow-none"
                >
                  <div className="px-6 py-5">
                    <h2 className="text-base font-heading font-semibold text-foreground flex items-center gap-2.5 mb-4">
                      <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-accent/10 border border-accent/20 shrink-0">
                        <Icon className="h-3.5 w-3.5 text-accent" />
                      </span>
                      {section.title}
                    </h2>
                    <div className="text-sm leading-relaxed text-muted-foreground">
                      {section.content}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
