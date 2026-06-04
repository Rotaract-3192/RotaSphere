"use client"

import * as React from "react"
import { Calendar, MapPin, Ticket, Check } from "lucide-react"
import { EventItem } from "@/data/mockData"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useAuthSession } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { createRazorpayOrderAction, verifyPaymentAndBookTicketAction, bookFreeTicketAction } from "@/app/actions/paymentActions"
import { Loader2 } from "lucide-react"

interface FeaturedEventsProps {
  events: EventItem[];
  onEventBooked?: (eventId: string) => void;
}

export function FeaturedEvents({ events, onEventBooked }: FeaturedEventsProps) {
  const router = useRouter()
  const { user, isSignedIn, role } = useAuthSession()
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [bookingEvent, setBookingEvent] = React.useState<EventItem | null>(null)
  const [bookingSuccess, setBookingSuccess] = React.useState(false)
  const [isPaying, setIsPaying] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Registration Form State
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    ticketCount: 1,
    specialRequests: ""
  })

  // Prefill user details when modal opens
  React.useEffect(() => {
    if (bookingEvent) {
      setFormData({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: "",
        ticketCount: 1,
        specialRequests: ""
      })
    }
  }, [bookingEvent, user])

  const categories = [
    { label: "All Events", value: "all" },
    { label: "Community Service", value: "community" },
    { label: "Professional Development", value: "professional" },
    { label: "Club Service", value: "club" },
    { label: "International Service", value: "international" },
    { label: "Fundraisers", value: "fundraiser" },
    { label: "Public Relations", value: "pr" }
  ]

  const filteredEvents = selectedCategory === "all"
    ? events
    : events.filter(evt => evt.category === selectedCategory)

  const handleBookTicket = (event: EventItem) => {
    if (!isSignedIn) { router.push("/sign-in"); return }
    if (role !== "attendee") {
      alert(`Only Attendees can book tickets. Your current role is "${role?.toUpperCase() || 'unknown'}".`)
      return
    }
    setBookingEvent(event)
  }

  // Parse price string to number for details display
  const getPriceDetails = () => {
    if (!bookingEvent) return { isFree: true, unitPrice: 0, totalPrice: 0, currencySymbol: "$" }
    const priceStr = bookingEvent.price || "0"
    const isFree = priceStr.toLowerCase().includes("free") ||
      bookingEvent.type === "free" ||
      parseFloat(priceStr.replace(/[^0-9.]/g, "")) === 0

    const unitPrice = isFree ? 0 : parseFloat(priceStr.replace(/[^0-9.]/g, ""))
    const totalPrice = unitPrice * formData.ticketCount
    const currencySymbol = priceStr.startsWith("$") ? "$" : priceStr.startsWith("₹") ? "₹" : "INR "
    return { isFree, unitPrice, totalPrice, currencySymbol }
  }

  const { isFree, totalPrice, currencySymbol } = getPriceDetails()

  const confirmBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingEvent) return

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      alert("Please fill in all required fields.")
      return
    }

    setIsPaying(true)
    try {
      if (isFree) {
        const res = await bookFreeTicketAction(
          bookingEvent.id,
          formData.ticketCount,
          formData.fullName,
          formData.email
        )
        if (res.success) {
          // Save registration details to local storage
          const ticketCodes = (res.ticketCode || "").split(", ")
          const savedDetails = localStorage.getItem("rotasphere_ticket_details")
          const detailsMap = savedDetails ? JSON.parse(savedDetails) : {}

          ticketCodes.forEach(code => {
            detailsMap[code] = {
              phone: formData.phone,
              specialRequests: formData.specialRequests,
              fullName: formData.fullName,
              email: formData.email,
              ticketCount: formData.ticketCount,
              bookedAt: new Date().toISOString()
            }
          })
          localStorage.setItem("rotasphere_ticket_details", JSON.stringify(detailsMap))

          const savedBooked = localStorage.getItem("rotasphere_booked_tickets")
          const bookedList: EventItem[] = savedBooked ? JSON.parse(savedBooked) : []
          if (!bookedList.some(evt => evt.id === bookingEvent.id)) {
            const bookedEventItem = {
              ...bookingEvent,
              ticketCode: res.ticketCode,
              ticketId: res.ticketId
            }
            bookedList.push(bookedEventItem)
            localStorage.setItem("rotasphere_booked_tickets", JSON.stringify(bookedList))
          }
          setBookingSuccess(true)
          if (onEventBooked) onEventBooked(bookingEvent.id)
          router.refresh()
          setTimeout(() => { setBookingSuccess(false); setBookingEvent(null) }, 2200)
        } else {
          alert(res.error || "Failed to book ticket")
        }
        setIsPaying(false); return
      }

      // Paid tickets Razorpay Order
      const orderRes = await createRazorpayOrderAction(bookingEvent.id, formData.ticketCount)
      if (!orderRes.success || !orderRes.orderId) {
        alert(orderRes.error || "Failed to initiate payment order.")
        setIsPaying(false); return
      }

      if (orderRes.simulated && orderRes.keyId === "rzp_test_simulated_key") {
        const verifyRes = await verifyPaymentAndBookTicketAction({
          eventId: bookingEvent.id,
          orderId: orderRes.orderId,
          paymentId: `pay_sim_${Date.now()}`,
          signature: `sig_sim_${Date.now()}`,
          isSimulated: true,
          ticketCount: formData.ticketCount,
          fullName: formData.fullName,
          email: formData.email
        })
        if (verifyRes.success) {
          // Save registration details to local storage
          const ticketCodes = (verifyRes.ticketCode || "").split(", ")
          const savedDetails = localStorage.getItem("rotasphere_ticket_details")
          const detailsMap = savedDetails ? JSON.parse(savedDetails) : {}

          ticketCodes.forEach(code => {
            detailsMap[code] = {
              phone: formData.phone,
              specialRequests: formData.specialRequests,
              fullName: formData.fullName,
              email: formData.email,
              ticketCount: formData.ticketCount,
              bookedAt: new Date().toISOString()
            }
          })
          localStorage.setItem("rotasphere_ticket_details", JSON.stringify(detailsMap))

          const savedBooked = localStorage.getItem("rotasphere_booked_tickets")
          const bookedList: EventItem[] = savedBooked ? JSON.parse(savedBooked) : []
          if (!bookedList.some(evt => evt.id === bookingEvent.id)) {
            const bookedEventItem = {
              ...bookingEvent,
              ticketCode: verifyRes.ticketCode,
              ticketId: verifyRes.ticketId
            }
            bookedList.push(bookedEventItem)
            localStorage.setItem("rotasphere_booked_tickets", JSON.stringify(bookedList))
          }
          setBookingSuccess(true)
          if (onEventBooked) onEventBooked(bookingEvent.id)
          router.refresh()
          setTimeout(() => { setBookingSuccess(false); setBookingEvent(null) }, 2200)
        } else { alert(verifyRes.error || "Failed to complete ticket booking.") }
        setIsPaying(false); return
      }

      // Real Razorpay options
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "RotaSphere Events",
        description: `${formData.ticketCount} Ticket(s) for ${bookingEvent.title}`,
        order_id: orderRes.orderId,
        handler: async function (response: any) {
          setIsPaying(true)
          const verifyRes = await verifyPaymentAndBookTicketAction({
            eventId: bookingEvent.id,
            orderId: orderRes.orderId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            isSimulated: false,
            ticketCount: formData.ticketCount,
            fullName: formData.fullName,
            email: formData.email
          })
          if (verifyRes.success) {
            // Save registration details to local storage
            const ticketCodes = (verifyRes.ticketCode || "").split(", ")
            const savedDetails = localStorage.getItem("rotasphere_ticket_details")
            const detailsMap = savedDetails ? JSON.parse(savedDetails) : {}

            ticketCodes.forEach(code => {
              detailsMap[code] = {
                phone: formData.phone,
                specialRequests: formData.specialRequests,
                fullName: formData.fullName,
                email: formData.email,
                ticketCount: formData.ticketCount,
                bookedAt: new Date().toISOString()
              }
            })
            localStorage.setItem("rotasphere_ticket_details", JSON.stringify(detailsMap))

            const savedBooked = localStorage.getItem("rotasphere_booked_tickets")
            const bookedList: EventItem[] = savedBooked ? JSON.parse(savedBooked) : []
            if (!bookedList.some(evt => evt.id === bookingEvent.id)) {
              const bookedEventItem = {
                ...bookingEvent,
                ticketCode: verifyRes.ticketCode,
                ticketId: verifyRes.ticketId
              }
              bookedList.push(bookedEventItem)
              localStorage.setItem("rotasphere_booked_tickets", JSON.stringify(bookedList))
            }
            setBookingSuccess(true)
            if (onEventBooked) onEventBooked(bookingEvent.id)
            router.refresh()
            setTimeout(() => { setBookingSuccess(false); setBookingEvent(null) }, 2200)
          } else { alert(verifyRes.error || "Payment signature verification failed.") }
          setIsPaying(false)
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        theme: { color: "#CF4500" },
        modal: { ondismiss: function () { setIsPaying(false) } }
      }
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error("Payment flow error:", err)
      alert("An unexpected error occurred during booking.")
      setIsPaying(false)
    }
  }

  return (
    <section
      id="events"
      className="relative section-padding"
      style={{ background: "#eeece7" }}
    >
      {/* Ghost Watermark */}
      <div
        className="ghost-watermark absolute top-8 left-0 w-full overflow-hidden pointer-events-none"
        aria-hidden="true"
        style={{ fontSize: "clamp(60px,12vw,180px)", textAlign: "center", color: "rgba(23, 23, 28, 0.015)" }}
      >
        EVENTS
      </div>

      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="mb-4">
            <span className="eyebrow-accent">Discover What's Happening</span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-medium mb-5"
            style={{ color: "#17171c", letterSpacing: "-0.02em" }}
          >
            Featured Platform Events
          </h2>
          <p
            className="font-weight-450 leading-relaxed"
            style={{ color: "#616161", fontSize: "16px" }}
          >
            Browse top curated events — from local community service drives to professional webinars.
            Explore events that make a difference.
          </p>
        </div>

        {/* Category Filter Tabs — pill buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className="text-xs font-bold uppercase transition-all duration-200 cursor-pointer"
                style={{
                  padding: "8px 22px",
                  borderRadius: "32px",
                  letterSpacing: "0.05em",
                  background: isActive ? "#17171c" : "#ffffff",
                  color: isActive ? "#ffffff" : "#212121",
                  border: `1px solid ${isActive ? "#17171c" : "#d9d9dd"}`
                }}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Events Grid — Circular Portrait Layout */}
        {filteredEvents.length === 0 ? (
          <div
            className="text-center py-20 max-w-sm mx-auto"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #d9d9dd"
            }}
          >
            <p className="font-weight-450 mb-5" style={{ color: "#616161" }}>
              No events found in this category.
            </p>
            <button
              onClick={() => setSelectedCategory("all")}
              style={{
                background: "#17171c",
                color: "#ffffff",
                borderRadius: "32px",
                padding: "8px 24px",
                fontSize: "14px",
                border: "1px solid #17171c"
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-14">
            {filteredEvents.map((evt, index) => {
              const attendeesPct = Math.min(100, Math.round((evt.attendees / parseInt(evt.capacity)) * 100))
              return (
                <div
                  key={evt.id}
                  className={`flex flex-col items-center text-center group relative ${
                    index % 2 === 1 ? "md-stagger-even" : ""
                  }`}
                >
                  {/* Orbital arc SVG between cards */}
                  {index % 3 !== 2 && (
                    <svg
                      className="absolute -right-7 top-24 pointer-events-none hidden lg:block animate-orbit-pulse"
                      width="80" height="60" viewBox="0 0 80 60" fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M0 30 Q40 -10 80 30"
                        stroke="#ff7759" strokeWidth="1.5" strokeLinecap="round"
                        fill="none" opacity="0.3"
                      />
                    </svg>
                  )}

                  {/* Circular Portrait Container */}
                  <div className="relative w-60 h-60 mx-auto mb-6">
                    {/* Portrait circle */}
                    <div className="circular-portrait w-full h-full bg-muted overflow-hidden group-hover:shadow-lg transition-all duration-500">
                      <img
                        src={evt.image}
                        alt={evt.title}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>

                    {/* Price chip — docked top-left outside circle */}
                    <div
                      className="absolute -top-1 -left-1 font-bold text-[10px]"
                      style={{
                        background: "#17171c",
                        color: "#ffffff",
                        padding: "4px 14px",
                        borderRadius: "999px",
                        letterSpacing: "0.02em",
                        border: "1px solid #17171c"
                      }}
                    >
                      {evt.price}
                    </div>

                    {/* Satellite CTA — docked bottom-right */}
                    <button
                      onClick={() => handleBookTicket(evt)}
                      className="satellite-cta absolute bottom-1 right-1 animate-satellite-pop cursor-pointer"
                      title="Get Ticket"
                    >
                      <Ticket className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Eyebrow Category */}
                  <div className="mb-2">
                    <span className="eyebrow-accent">{evt.category}</span>
                  </div>

                  {/* Title — H3 style */}
                  <h3
                    className="text-xl font-medium mb-2 line-clamp-2 max-w-xs transition-colors"
                    style={{ color: "#17171c", letterSpacing: "-0.02em" }}
                  >
                    {evt.title}
                  </h3>

                  {/* Meta */}
                  <div className="flex items-center justify-center gap-3 mb-5">
                    <span
                      className="flex items-center gap-1 text-xs font-weight-450"
                      style={{ color: "#616161" }}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      {evt.date}
                    </span>
                    <span style={{ color: "#d9d9dd" }}>•</span>
                    <span
                      className="flex items-center gap-1 text-xs font-weight-450"
                      style={{ color: "#616161" }}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {evt.location}
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="w-full max-w-[220px] mb-5">
                    <div className="flex justify-between text-[10px] font-bold mb-1.5">
                      <span style={{ color: "#616161" }}>Registered</span>
                      <span style={{ color: "#17171c" }}>{evt.attendees} / {evt.capacity}</span>
                    </div>
                    <div
                      className="w-full h-1.5 rounded-full overflow-hidden"
                      style={{ background: "#d9d9dd" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${attendeesPct}%`,
                          background: attendeesPct > 85 ? "#b30000" : "#ff7759"
                        }}
                      />
                    </div>
                  </div>

                  {/* Near-Black CTA Button */}
                  <button
                    onClick={() => handleBookTicket(evt)}
                    className="text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer"
                    style={{
                      background: "#17171c",
                      color: "#ffffff",
                      borderRadius: "32px",
                      padding: "9px 24px",
                      border: "1px solid #17171c",
                      letterSpacing: "-0.02em"
                    }}
                  >
                    Get Ticket Pass
                  </button>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* ─── Ticket Booking Dialog ─── */}
      {mounted && (
        <Dialog open={!!bookingEvent} onOpenChange={(open) => { if (!open) setBookingEvent(null) }}>
          <DialogContent
            className="max-w-md p-0 overflow-hidden"
            style={{
              borderRadius: "16px",
              border: "1px solid #d9d9dd",
              boxShadow: "rgba(0,0,0,0.04) 0px 24px 48px",
              background: "#ffffff"
            }}
          >
            {bookingSuccess ? (
              <div className="py-10 flex flex-col items-center justify-center text-center px-8">
                <div
                  className="h-14 w-14 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "rgba(34,197,94,0.1)" }}
                >
                  <Check className="h-7 w-7" style={{ color: "#16a34a" }} />
                </div>
                <h3
                  className="text-xl font-medium mb-2"
                  style={{ color: "#17171c", letterSpacing: "-0.02em" }}
                >
                  {formData.ticketCount > 1 ? `${formData.ticketCount} Tickets Booked!` : "Ticket Booked!"}
                </h3>
                <p className="text-sm font-weight-450" style={{ color: "#616161" }}>
                  Your confirmation has been sent to {formData.email}. See you there!
                </p>
              </div>
            ) : (
              bookingEvent && (
                <div className="p-7 max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="items-center text-center mb-5">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center mb-3"
                      style={{ background: "rgba(255,119,89,0.1)" }}
                    >
                      <Ticket className="h-6 w-6" style={{ color: "#ff7759" }} />
                    </div>
                    <div className="mb-1">
                      <span className="eyebrow-accent" style={{ fontSize: "11px" }}>Secure Checkout</span>
                    </div>
                    <DialogTitle
                      className="text-xl font-medium line-clamp-1"
                      style={{ color: "#17171c", letterSpacing: "-0.02em" }}
                    >
                      {bookingEvent.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm font-weight-450" style={{ color: "#616161" }}>
                      Please fill out the registration details to complete your order.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={confirmBooking} className="space-y-4 text-left">
                    {/* Name Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full text-sm p-3 rounded-lg border focus:outline-none focus:border-[#9b60aa] focus:ring-1 focus:ring-[#9b60aa]/20 transition-all duration-200"
                        style={{
                          background: "#ffffff",
                          borderColor: "#d9d9dd",
                          color: "#212121"
                        }}
                        placeholder="Enter attendee's full name"
                      />
                    </div>

                    {/* Email Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full text-sm p-3 rounded-lg border focus:outline-none focus:border-[#9b60aa] focus:ring-1 focus:ring-[#9b60aa]/20 transition-all duration-200"
                        style={{
                          background: "#ffffff",
                          borderColor: "#d9d9dd",
                          color: "#212121"
                        }}
                        placeholder="email@example.com"
                      />
                    </div>

                    {/* Phone Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full text-sm p-3 rounded-lg border focus:outline-none focus:border-[#9b60aa] focus:ring-1 focus:ring-[#9b60aa]/20 transition-all duration-200"
                        style={{
                          background: "#ffffff",
                          borderColor: "#d9d9dd",
                          color: "#212121"
                        }}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    {/* Quantity and Special Requests */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Tickets *
                        </label>
                        <select
                          value={formData.ticketCount}
                          onChange={(e) => setFormData({ ...formData, ticketCount: parseInt(e.target.value) })}
                          className="w-full text-sm p-3 rounded-lg border focus:outline-none focus:border-[#9b60aa] focus:ring-1 focus:ring-[#9b60aa]/20 transition-all duration-200"
                          style={{
                            background: "#ffffff",
                            borderColor: "#d9d9dd",
                            color: "#212121"
                          }}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Special Requests
                        </label>
                        <input
                          type="text"
                          value={formData.specialRequests}
                          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                          className="w-full text-sm p-3 rounded-lg border focus:outline-none focus:border-[#9b60aa] focus:ring-1 focus:ring-[#9b60aa]/20 transition-all duration-200"
                          style={{
                            background: "#ffffff",
                            borderColor: "#d9d9dd",
                            color: "#212121"
                          }}
                          placeholder="Dietary, access needs..."
                        />
                      </div>
                    </div>

                    {/* Event Details Card & Price Calculation */}
                    <div
                      className="mb-5 p-4 mt-4 space-y-2"
                      style={{
                        background: "#eeece7",
                        borderRadius: "8px",
                        border: "1px solid #d9d9dd"
                      }}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-weight-450" style={{ color: "#616161" }}>Price per Ticket</span>
                        <span className="font-medium" style={{ color: "#212121" }}>{bookingEvent.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-weight-450" style={{ color: "#616161" }}>Ticket Count</span>
                        <span className="font-medium" style={{ color: "#212121" }}>{formData.ticketCount}</span>
                      </div>
                      <div className="border-t border-[#d9d9dd] my-2 pt-2 flex justify-between text-sm font-bold">
                        <span style={{ color: "#212121" }}>Total Due</span>
                        <span style={{ color: "#ff7759" }}>
                          {isFree ? "Free" : `${currencySymbol}${totalPrice.toFixed(2)}`}
                        </span>
                      </div>
                    </div>

                    <DialogFooter className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setBookingEvent(null)}
                        className="flex-1 text-sm font-medium transition-colors cursor-pointer"
                        style={{
                          background: "#ffffff",
                          color: "#17171c",
                          borderRadius: "32px",
                          padding: "10px",
                          border: "1px solid #d9d9dd"
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isPaying}
                        className="flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 hover:opacity-90 disabled:opacity-60 cursor-pointer"
                        style={{
                          background: "#17171c",
                          color: "#ffffff",
                          borderRadius: "32px",
                          padding: "10px",
                          border: "1px solid #17171c",
                          letterSpacing: "-0.01em"
                        }}
                      >
                        {isPaying ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing…
                          </>
                        ) : isFree ? "Book Free Pass" : "Proceed to Checkout"}
                      </button>
                    </DialogFooter>
                  </form>
                </div>
              )
            )}
          </DialogContent>
        </Dialog>
      )}
    </section>
  )
}
