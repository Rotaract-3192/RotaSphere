"use client"

import * as React from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import {
  Scale, UserCheck, Users, Ticket, CreditCard, RotateCcw,
  ArrowRightLeft, ShieldAlert, Megaphone, Copyright,
  ServerCrash, AlertTriangle, HandshakeIcon, XCircle,
  Landmark, RefreshCw, Mail
} from "lucide-react"

const sections = [
  {
    icon: Scale,
    title: "1. Acceptance of Terms",
    content: (
      <p>
        By creating an account, registering for an event, purchasing tickets, or otherwise using RotaSphere, you acknowledge that you have read, understood, and agreed to these Terms of Service and our Privacy Policy.
      </p>
    )
  },
  {
    icon: UserCheck,
    title: "2. Eligibility",
    content: (
      <p>
        You must be at least 13 years old to use the platform. By using RotaSphere, you confirm that you meet this requirement and that the information you provide is accurate and complete.
      </p>
    )
  },
  {
    icon: Users,
    title: "3. User Accounts",
    content: (
      <div className="space-y-3">
        <p>Users may be required to create an account to access certain features of the platform.</p>
        <p>You agree to:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Provide accurate and up-to-date information.</li>
          <li>Maintain the confidentiality of your login credentials.</li>
          <li>Notify us immediately of any unauthorized use of your account.</li>
          <li>Accept responsibility for all activities conducted through your account.</li>
        </ul>
        <p>We reserve the right to suspend or terminate accounts that provide false information or violate these terms.</p>
      </div>
    )
  },
  {
    icon: Ticket,
    title: "4. Event Registration and Ticket Purchases",
    content: (
      <div className="space-y-3">
        <p>RotaSphere allows users to register for events and purchase tickets hosted by authorized organizers.</p>
        <p>By registering or purchasing tickets, you agree that:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>All information provided during registration is accurate.</li>
          <li>Ticket prices, taxes, and fees displayed at checkout are final unless otherwise stated.</li>
          <li>Registration confirmation is subject to successful payment processing where applicable.</li>
          <li>Event organizers may impose additional event-specific rules or requirements.</li>
        </ul>
      </div>
    )
  },
  {
    icon: CreditCard,
    title: "5. Payments",
    content: (
      <div className="space-y-3">
        <p>Payments are processed securely through third-party payment gateway providers.</p>
        <p>RotaSphere does not store your:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Card details</li>
          <li>CVV numbers</li>
          <li>UPI PINs</li>
          <li>Banking passwords</li>
        </ul>
        <p>You agree to provide valid payment information and authorize the payment provider to process transactions on your behalf.</p>
        <p>Failed transactions due to banking issues, network interruptions, or payment gateway failures are not the responsibility of RotaSphere.</p>
      </div>
    )
  },
  {
    icon: RotateCcw,
    title: "6. Refunds and Cancellations",
    content: (
      <div className="space-y-3">
        <p>Refund and cancellation policies are determined by individual event organizers.</p>
        <p>Unless explicitly stated otherwise:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Tickets may be non-refundable.</li>
          <li>Convenience fees and payment gateway charges may not be refundable.</li>
          <li>Refund requests submitted after an event has concluded may not be considered.</li>
        </ul>
        <p>Users should review event-specific refund policies before completing payment.</p>
      </div>
    )
  },
  {
    icon: ArrowRightLeft,
    title: "7. Ticket Transfers",
    content: (
      <div className="space-y-3">
        <p>Unless permitted by the event organizer, tickets purchased through RotaSphere are non-transferable and may only be used by the registered attendee.</p>
        <p>Event organizers reserve the right to verify attendee identity at entry.</p>
      </div>
    )
  },
  {
    icon: ShieldAlert,
    title: "8. User Conduct",
    content: (
      <div className="space-y-3">
        <p>Users agree not to:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Use the platform for unlawful activities.</li>
          <li>Attempt unauthorized access to the platform or its systems.</li>
          <li>Interfere with the operation or security of the service.</li>
          <li>Submit false registrations or fraudulent transactions.</li>
          <li>Upload malicious software or harmful content.</li>
          <li>Misrepresent affiliation with any organization or event.</li>
        </ul>
        <p>Violation of these rules may result in account suspension or permanent termination.</p>
      </div>
    )
  },
  {
    icon: Megaphone,
    title: "9. Organizer Rights",
    content: (
      <div className="space-y-3">
        <p>Event organizers reserve the right to:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Modify event schedules, venues, or speakers.</li>
          <li>Change ticket pricing before purchase.</li>
          <li>Limit event capacity.</li>
          <li>Cancel events due to unforeseen circumstances.</li>
        </ul>
        <p>In the event of cancellation, refund decisions remain at the discretion of the organizer unless otherwise required by law.</p>
      </div>
    )
  },
  {
    icon: Copyright,
    title: "10. Intellectual Property",
    content: (
      <div className="space-y-3">
        <p>All content on RotaSphere, including logos, branding, designs, graphics, software, and text, is the property of RotaSphere or its licensors and is protected by applicable intellectual property laws.</p>
        <p>Users may not reproduce, distribute, or modify platform content without prior permission.</p>
      </div>
    )
  },
  {
    icon: ServerCrash,
    title: "11. Platform Availability",
    content: (
      <div className="space-y-3">
        <p>We strive to maintain uninterrupted service but do not guarantee that the platform will always be available, error-free, or secure.</p>
        <p>RotaSphere may temporarily suspend services for maintenance, upgrades, or technical issues without prior notice.</p>
      </div>
    )
  },
  {
    icon: AlertTriangle,
    title: "12. Limitation of Liability",
    content: (
      <div className="space-y-3">
        <p>To the maximum extent permitted by law, RotaSphere and its administrators shall not be liable for:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2">
          <li>Event cancellations or postponements.</li>
          <li>Losses resulting from payment gateway failures.</li>
          <li>User errors during registration or payment.</li>
          <li>Technical interruptions or service outages.</li>
          <li>Indirect, incidental, or consequential damages arising from use of the platform.</li>
        </ul>
      </div>
    )
  },
  {
    icon: HandshakeIcon,
    title: "13. Indemnification",
    content: (
      <p>
        You agree to indemnify and hold harmless RotaSphere, its administrators, organizers, volunteers, and affiliates from any claims, damages, losses, or liabilities resulting from your use of the platform or violation of these Terms.
      </p>
    )
  },
  {
    icon: XCircle,
    title: "14. Termination",
    content: (
      <p>
        We reserve the right to suspend or terminate access to the platform at our discretion if users violate these Terms of Service or engage in activities that may harm the platform or other users.
      </p>
    )
  },
  {
    icon: Landmark,
    title: "15. Governing Law",
    content: (
      <div className="space-y-3">
        <p>These Terms of Service shall be governed by and interpreted in accordance with the laws of India.</p>
        <p>Any disputes arising from these terms shall be subject to the jurisdiction of the courts located in <span className="text-foreground font-medium">Bengaluru, Karnataka</span>.</p>
      </div>
    )
  },
  {
    icon: RefreshCw,
    title: "16. Changes to These Terms",
    content: (
      <p>
        We reserve the right to update or modify these Terms of Service at any time. Updated versions will be published on the platform with a revised effective date. Continued use of the platform after changes are posted constitutes acceptance of the revised terms.
      </p>
    )
  },
  {
    icon: Mail,
    title: "17. Contact Information",
    content: (
      <div className="space-y-3">
        <p>For questions regarding these Terms of Service, please contact:</p>
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
          By using RotaSphere, you acknowledge that you have read, understood, and agreed to these Terms of Service.
        </p>
      </div>
    )
  },
]

export default function TermsOfServicePage() {
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
              <Scale className="h-3.5 w-3.5" />
              <span>Legal Agreements</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-medium tracking-tight text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
              <span className="text-accent font-semibold">Effective Date: July 4, 2026</span>
              <span className="mx-2 text-border">·</span>
              Welcome to <span className="text-foreground font-semibold">RotaSphere</span>, the official event management, registration, and ticketing platform for{" "}
              <span className="text-foreground font-semibold">Rotaract District 3192</span>.
            </p>
          </div>

          {/* Intro card */}
          <div className="border border-accent/15 bg-accent/5 rounded-[16px] px-6 py-5 mb-8 text-sm text-muted-foreground leading-relaxed">
            By accessing or using RotaSphere, you agree to comply with and be bound by these Terms of Service. If you do not agree with these terms, please do not use the platform.
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
