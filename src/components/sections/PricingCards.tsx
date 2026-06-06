"use client"

import * as React from "react"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    badge: null,
    price: "Free",
    priceSub: "forever",
    description: "Perfect for small club projects, service drives, and internal meetings.",
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
    features: [
      "Up to 3 events per month",
      "Up to 100 attendees per event",
      "Basic QR check-in",
      "Free ticket passes only",
      "RotaSphere-branded pages",
      "Email support"
    ]
  },
  {
    name: "Growth",
    badge: "Most Popular",
    price: "₹999",
    priceSub: "per month",
    description: "For active clubs running recurring programmes, fundraisers, and district events.",
    cta: "Start Free Trial",
    ctaVariant: "primary" as const,
    features: [
      "Unlimited events",
      "Up to 1,000 attendees per event",
      "Live gate scan dashboard",
      "Paid + free ticket tiers",
      "Custom event branding",
      "Razorpay payouts",
      "Attendee analytics",
      "Priority support"
    ]
  },
  {
    name: "Enterprise",
    badge: null,
    price: "Custom",
    priceSub: "talk to us",
    description: "District-level assemblies, multi-club conferences, and large-scale fundraisers.",
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    features: [
      "Unlimited events & attendees",
      "Multi-organiser roles",
      "White-label event pages",
      "Advanced reporting & exports",
      "Dedicated account manager",
      "API access",
      "SLA-backed uptime",
      "Custom integrations"
    ]
  }
]

export function PricingCards() {
  return (
    <section
      className="relative section-padding overflow-hidden"
      style={{ background: "#eeece7" }}
    >
      {/* Ghost watermark */}
      <div
        className="ghost-watermark absolute top-0 right-0 overflow-hidden pointer-events-none select-none"
        aria-hidden="true"
        style={{ color: "rgba(23, 23, 28, 0.02)" }}
      >
        PLANS
      </div>

      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow-accent mb-4 block">Simple Pricing</span>
          <h2
            className="text-4xl md:text-5xl font-medium"
            style={{ color: "#17171c", letterSpacing: "-0.02em" }}
          >
            Plans that grow with your club
          </h2>
          <p
            className="mt-4 font-weight-450"
            style={{ color: "#616161", fontSize: "16px" }}
          >
            No hidden fees. No vendor lock-in. Switch or cancel any time.
          </p>
        </div>

        {/* 3-column plan grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => {
            const isPrimary = plan.ctaVariant === "primary"
            return (
              <div
                key={i}
                className="flex flex-col relative transition-all duration-300"
                style={{
                  background: "#ffffff",
                  borderRadius: "8px",
                  border: isPrimary ? "1.5px solid #17171c" : "1px solid #d9d9dd",
                  padding: "32px"
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)"
                }}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="mb-4">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.1em]"
                      style={{
                        background: "var(--accent)",
                        color: "#ffffff",
                        padding: "3px 12px",
                        borderRadius: "999px"
                      }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan name */}
                <h3
                  className="text-base font-bold uppercase tracking-widest mb-1"
                  style={{ color: "#93939f", letterSpacing: "0.1em", fontSize: "11px" }}
                >
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span
                    className="text-4xl font-medium"
                    style={{ color: "#17171c", letterSpacing: "-0.03em" }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color: "#93939f" }}>
                    {plan.priceSub}
                  </span>
                </div>

                <p
                  className="text-sm font-weight-450 leading-relaxed mb-6"
                  style={{ color: "#616161" }}
                >
                  {plan.description}
                </p>

                {/* Divider */}
                <div style={{ height: "1px", background: "#d9d9dd", marginBottom: "24px" }} />

                {/* Feature list */}
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2.5">
                      <Check
                        className="h-4 w-4 shrink-0 mt-0.5"
                        style={{ color: isPrimary ? "#17171c" : "#93939f" }}
                      />
                      <span className="text-sm font-weight-450" style={{ color: "#212121" }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className="w-full text-sm font-medium text-center transition-all duration-200 hover:opacity-90 cursor-pointer"
                  style={isPrimary ? {
                    background: "#17171c",
                    color: "#ffffff",
                    borderRadius: "32px",
                    padding: "12px 24px",
                    border: "1px solid #17171c"
                  } : {
                    background: "transparent",
                    color: "#17171c",
                    borderRadius: "32px",
                    padding: "12px 24px",
                    border: "1px solid #d9d9dd"
                  }}
                  onMouseEnter={e => {
                    if (!isPrimary) (e.currentTarget as HTMLElement).style.borderColor = "#17171c"
                  }}
                  onMouseLeave={e => {
                    if (!isPrimary) (e.currentTarget as HTMLElement).style.borderColor = "#d9d9dd"
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
