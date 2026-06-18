"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles, Calendar, MapPin, DollarSign, IndianRupee, Users, Award,
  Image as ImageIcon, ArrowLeft, ArrowRight, Check, Upload, Cloud, RefreshCw, X, Plus,
  ChevronDown, ChevronUp, Trash2, ShieldCheck, CreditCard, Landmark, Ticket, Clock, AlertCircle,
  Video, Map, Wallet
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EventItem } from "@/data/mockData"
import { createEventAction } from "@/app/actions/eventActions"
import { cn } from "@/lib/utils"
import LocationPickerMap from "./LocationPickerMap"

const PRESET_BANNERS = [
  { id: "community", url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=60", label: "Community Service" },
  { id: "professional", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60", label: "Prof. Development" },
  { id: "club", url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=60", label: "Club Service" },
  { id: "international", url: "https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=800&auto=format&fit=crop&q=60", label: "Intl. Service" },
]

interface TicketTier {
  id: string;
  name: string;
  type: "Regular" | "VIP" | "Early Bird" | "Student Pass" | "Premium Access" | "Free Pass";
  description: string;
  price: string;
  currency: string;
  quantity: string;
  maxPerUser: string;
  startDate: string;
  endDate: string;
  visibility: "public" | "hidden" | "invite-only";
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: EventItem) => void;
}

export function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "community",
    image: "",
    organizer: "",
    locationType: "in-person" as "in-person" | "online" | "hybrid",
    venueName: "",
    address: "",
    country: "India",
    state: "",
    city: "",
    pincode: "",
    googleMapsUrl: "",
    latitude: "" as string | number,
    longitude: "" as string | number,
  })

  const [currentStep, setCurrentStep] = React.useState(1)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [success, setSuccess] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Dynamic ticket tiers state
  const [tickets, setTickets] = React.useState<TicketTier[]>([
    {
      id: "t-1",
      name: "General Admission Pass",
      type: "Regular",
      description: "Standard entry ticket for the event.",
      price: "0",
      currency: "INR",
      quantity: "100",
      maxPerUser: "1",
      startDate: "",
      endDate: "",
      visibility: "public"
    }
  ])
  const [expandedTicketId, setExpandedTicketId] = React.useState<string | null>("t-1")

  // Additional booking settings state
  const [bookingSettings, setBookingSettings] = React.useState({
    showRemaining: true,
    enableWaitlist: false,
    refundPolicy: "no-refunds",
    cancellationPolicy: "no-cancellation",
    requireApproval: false,
    allowCoupons: false
  })

  // Attendee customizable fields state
  const [attendeeFields, setAttendeeFields] = React.useState({
    fullName: true, // required by default
    email: true,    // required by default
    phone: true,
    company: false,
    designation: false,
    linkedin: false,
    dietary: false,
    customQuestion: false
  })

  // Payment settings state
  const [paymentGateway, setPaymentGateway] = React.useState<"paytm">("paytm")
  const [taxRate, setTaxRate] = React.useState("18")

  // Real-time autosave state
  const [autosaveText, setAutosaveText] = React.useState("Saved to cloud")
  const [isAutosaving, setIsAutosaving] = React.useState(false)

  React.useEffect(() => {
    if (!formData.title && !formData.description && tickets.length === 1 && tickets[0].price === "0") return
    setIsAutosaving(true)
    setAutosaveText("Saving...")
    const timer = setTimeout(() => {
      setIsAutosaving(false)
      setAutosaveText("Draft saved")
    }, 800)
    return () => clearTimeout(timer)
  }, [formData, tickets, bookingSettings, attendeeFields, paymentGateway, taxRate])

  // Reset states when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(1)
      setErrors({})
      setSuccess(false)
      setIsSubmitting(false)
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        category: "community",
        image: "",
        organizer: "",
        locationType: "in-person" as "in-person" | "online" | "hybrid",
        venueName: "",
        address: "",
        country: "India",
        state: "",
        city: "",
        pincode: "",
        googleMapsUrl: "",
        latitude: "",
        longitude: "",
      })
      setTickets([
        {
          id: "t-1",
          name: "General Admission Pass",
          type: "Regular",
          description: "Standard entry ticket for the event.",
          price: "0",
          currency: "INR",
          quantity: "100",
          maxPerUser: "1",
          startDate: "",
          endDate: "",
          visibility: "public"
        }
      ])
      setExpandedTicketId("t-1")
      setBookingSettings({
        showRemaining: true,
        enableWaitlist: false,
        refundPolicy: "no-refunds",
        cancellationPolicy: "no-cancellation",
        requireApproval: false,
        allowCoupons: false
      })
      setAttendeeFields({
        fullName: true,
        email: true,
        phone: true,
        company: false,
        designation: false,
        linkedin: false,
        dietary: false,
        customQuestion: false
      })
      setPaymentGateway("paytm")
      setTaxRate("0")
    }
  }, [isOpen])

  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {}
    if (stepNum === 1) {
      if (!formData.title.trim()) newErrors.title = "Event title is required"
      if (!formData.organizer.trim()) newErrors.organizer = "Organizing Club name is required"
    } else if (stepNum === 2) {
      if (!formData.date.trim()) newErrors.date = "Event date is required"
      
      // Validate event end time is after start time
      if (formData.time) {
        const parts = formData.time.split("-")
        if (parts[0] && parts[1]) {
          const startTimeStr = parts[0].trim()
          let endTimeStr = parts[1].trim()
          const tzMatch = endTimeStr.match(/(EST|PST|CST|MST|UTC|GMT|CET|IST|AEDT)/i)
          if (tzMatch) {
            endTimeStr = endTimeStr.replace(tzMatch[0], "").trim()
          }
          const baseDate = formData.date || new Date().toISOString().split("T")[0]
          const startD = new Date(`${baseDate} ${startTimeStr}`)
          const endD = new Date(`${baseDate} ${endTimeStr}`)
          if (!isNaN(startD.getTime()) && !isNaN(endD.getTime()) && endD <= startD) {
            newErrors.time = "End time must be after start time"
          }
        }
      }

      if (formData.locationType === "online") {
        if (!formData.location.trim()) newErrors.location = "Online link/URL is required"
      } else {
        if (!formData.venueName.trim()) newErrors.venueName = "Venue name is required"
        if (!formData.address.trim()) newErrors.address = "Full address is required"
        if (!formData.googleMapsUrl.trim()) newErrors.googleMapsUrl = "Google Maps Link is required"
        if (!formData.city.trim()) newErrors.city = "City is required"
        if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required"
      }
    } else if (stepNum === 4) {
      // Validate that at least one ticket exists and has a positive quantity
      if (tickets.length === 0) {
        newErrors.tickets = "At least one ticket tier is required"
      } else {
        tickets.forEach((t, idx) => {
          if (!t.name.trim()) newErrors[`ticket_${idx}_name`] = "Ticket name is required"
          if (parseFloat(t.price) < 0 || isNaN(parseFloat(t.price))) newErrors[`ticket_${idx}_price`] = "Invalid price"
          if (parseInt(t.quantity) <= 0 || isNaN(parseInt(t.quantity))) newErrors[`ticket_${idx}_qty`] = "Invalid quantity"
          if (t.startDate && t.endDate) {
            const startD = new Date(t.startDate)
            const endD = new Date(t.endDate)
            if (!isNaN(startD.getTime()) && !isNaN(endD.getTime()) && endD < startD) {
              newErrors[`ticket_${idx}_dates`] = "Sales end date must be after start date"
            }
          }
        })
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const isStepValidUpTo = (stepNum: number) => {
    if (stepNum >= 1 && (!formData.title.trim() || !formData.organizer.trim())) return false
    if (stepNum >= 2) {
      if (!formData.date.trim()) return false
      if (formData.locationType === "online") {
        if (!formData.location.trim()) return false
      } else {
        if (!formData.venueName.trim() || !formData.address.trim() || !formData.googleMapsUrl.trim() || !formData.city.trim() || !formData.pincode.trim()) return false
      }
    }
    return true
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Dynamic ticket management functions
  const addTicketTier = () => {
    const newId = `t-${Date.now()}`
    const newTier: TicketTier = {
      id: newId,
      name: "VIP Premium Pass",
      type: "VIP",
      description: "Includes special access and priority seating.",
      price: "1000",
      currency: "INR",
      quantity: "50",
      maxPerUser: "1",
      startDate: "",
      endDate: "",
      visibility: "public"
    }
    setTickets([...tickets, newTier])
    setExpandedTicketId(newId)
  }

  const removeTicketTier = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = tickets.filter(t => t.id !== id)
    setTickets(updated)
    if (expandedTicketId === id) {
      setExpandedTicketId(updated[0]?.id || null)
    }
  }

  const updateTicketField = (id: string, field: keyof TicketTier, value: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
    
    // Clear validation error when user types/changes a field
    const idx = tickets.findIndex(t => t.id === id)
    if (idx !== -1) {
      let errKey = ""
      if (field === "name") errKey = `ticket_${idx}_name`
      else if (field === "price") errKey = `ticket_${idx}_price`
      else if (field === "quantity") errKey = `ticket_${idx}_qty`
      else if (field === "startDate" || field === "endDate") errKey = `ticket_${idx}_dates`

      if (errKey) {
        setErrors(prev => {
          const updated = { ...prev }
          delete updated[errKey]
          return updated
        })
      }
    }
  }

  const toggleExpandedTicket = (id: string) => {
    setExpandedTicketId(expandedTicketId === id ? null : id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate final step before submitting
    if (!validateStep(currentStep)) return
    if (!formData.title || !formData.date || !formData.organizer) {
      return
    }

    setIsSubmitting(true)
    try {
      // Default image fallbacks based on category if empty
      let finalImage = formData.image.trim()
      if (!finalImage) {
        const images: Record<string, string> = {
          community: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=60",
          professional: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60",
          club: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=60",
          international: "https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=800&auto=format&fit=crop&q=60",
          fundraiser: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60",
          pr: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=60"
        }
        finalImage = images[formData.category] || images.community
      }

      // Parse time and dates
      let startTimeStr = "09:00 AM"
      let endTimeStr = "05:00 PM"
      let tz = "EST"

      if (formData.time) {
        const parts = formData.time.split("-")
        if (parts[0]) startTimeStr = parts[0].trim()
        if (parts[1]) {
          const secondPart = parts[1].trim()
          const tzMatch = secondPart.match(/(EST|PST|CST|MST|UTC|GMT|CET|IST|AEDT)/i)
          if (tzMatch) {
            tz = tzMatch[0].toUpperCase()
            endTimeStr = secondPart.replace(tzMatch[0], "").trim()
          } else {
            endTimeStr = secondPart
          }
        }
      }

      const startD = new Date(`${formData.date} ${startTimeStr}`)
      const endD = new Date(`${formData.date} ${endTimeStr}`)
      const startDate = isNaN(startD.getTime()) ? new Date(formData.date).toISOString() : startD.toISOString()
      const endDate = isNaN(endD.getTime()) ? new Date(new Date(formData.date).getTime() + 8 * 60 * 60 * 1000).toISOString() : endD.toISOString()

      // Aggregate capacities and select primary price
      const totalCapacity = tickets.reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0) || 100
      const primaryPriceTicket = tickets.find(t => parseFloat(t.price) > 0)
      const priceStr = primaryPriceTicket ? primaryPriceTicket.price : "0"
      const typeVal = primaryPriceTicket ? "paid" : "free"

      const res = await createEventAction({
        title: formData.title,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim() || `event-${Date.now()}`,
        description: formData.description || "No description provided.",
        fullDescription: formData.description || "No description provided.",
        bannerUrl: finalImage,
        thumbnailUrl: finalImage,
        startDate,
        endDate,
        timezone: tz,
        type: typeVal as "free" | "paid",
        price: priceStr,
        visibility: "public",
        locationType: formData.locationType,
        venueName: formData.locationType === "online" ? "Online" : formData.venueName,
        country: formData.locationType === "online" ? undefined : formData.country,
        state: formData.locationType === "online" ? undefined : formData.state,
        city: formData.locationType === "online" ? "Online" : formData.city,
        address: formData.locationType === "online" ? formData.location : formData.address,
        pincode: formData.locationType === "online" ? undefined : formData.pincode,
        googleMapsUrl: formData.locationType === "online" ? undefined : formData.googleMapsUrl,
        latitude: formData.locationType === "online" ? undefined : (formData.latitude ? Number(formData.latitude) : undefined),
        longitude: formData.locationType === "online" ? undefined : (formData.longitude ? Number(formData.longitude) : undefined),
        category: formData.category,
        tags: formData.category,
        capacity: totalCapacity,
        contactEmail: "contact@rotasphere.com",
        organizer: formData.organizer
      })

      if (res.success && res.event) {
        onEventCreated(res.event as EventItem)
        setSuccess(true)

        // Reset Form
        setFormData({
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          category: "community",
          image: "",
          organizer: "",
          locationType: "in-person" as "in-person" | "online" | "hybrid",
          venueName: "",
          address: "",
          country: "India",
          state: "",
          city: "",
          pincode: "",
          googleMapsUrl: "",
          latitude: "",
          longitude: "",
        })

        setTimeout(() => {
          setSuccess(false)
          onClose()
        }, 2000)
      } else {
        alert(res.error || "Failed to create event in database.")
      }
    } catch (err) {
      console.error("Submission failed:", err)
      alert("An unexpected error occurred during submission.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { number: 1, label: "Info", icon: Award },
    { number: 2, label: "Logistics", icon: MapPin },
    { number: 3, label: "Customization", icon: ImageIcon },
    { number: 4, label: "Tickets & Booking", icon: Ticket },
    { number: 5, label: "Review & Publish", icon: IndianRupee }
  ]

  const progressPercentage = Math.round(((currentStep - 1) / (steps.length - 1)) * 100)

  // Get active banner URL
  const getBannerUrl = () => {
    if (formData.image) return formData.image
    const match = PRESET_BANNERS.find(b => b.id === formData.category)
    return match ? match.url : PRESET_BANNERS[0].url
  }

  const getTicketTypeColor = (type: string) => {
    switch (type) {
      case "VIP": return "bg-amber-500/10 text-amber-500 border border-amber-500/20"
      case "Early Bird": return "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
      case "Student Pass": return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
      case "Premium Access": return "bg-purple-500/10 text-purple-500 border border-purple-500/20"
      case "Free Pass": return "bg-slate-500/10 text-slate-500 border border-slate-500/20"
      default: return "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
    }
  }

  // Payout calculation variables based on expanded ticket price
  const activeTicketForCalc = tickets.find(t => t.id === expandedTicketId) || tickets[0]
  const ticketPriceVal = activeTicketForCalc ? parseFloat(activeTicketForCalc.price) || 0 : 0
  const platformFee = 0
  const taxVal = 0
  const netPayout = ticketPriceVal

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="bg-gradient-to-br from-white via-[#fafafb] to-[#f4f4f6] dark:from-[#1b1b22] dark:via-[#15151b] dark:to-[#101014] w-full h-full sm:w-[92vw] sm:h-[85vh] max-h-none sm:max-h-[820px] sm:max-w-4xl border border-black/5 dark:border-white/5 rounded-none sm:rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] p-4 sm:p-6 md:p-8 backdrop-blur-3xl overflow-hidden top-0 left-0 translate-x-0 translate-y-0 sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]">
        <div className="flex flex-col h-full w-full overflow-hidden text-left min-h-0">
          {/* Header section with autosave status */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-muted/50 pb-4 mb-4">
            <DialogHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                  <Sparkles className="h-4 w-4 text-accent" />
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
                  RotaSphere
                </span>
              </div>
              <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                Create a New Event
              </DialogTitle>
            </DialogHeader>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/55 border border-muted text-[10px] font-medium text-muted-foreground">
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isAutosaving ? "bg-amber-400 animate-spin" : "bg-emerald-500 animate-pulse"
                )} />
                <span>{autosaveText}</span>
              </div>

              <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-[10px] font-bold text-primary">
                {progressPercentage}% Completed
              </div>
            </div>
          </div>

          {success ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 animate-bounce shadow-lg shadow-emerald-500/15">
                <Check className="h-10 w-10 stroke-[3px]" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Event Published Successfully!</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Your event is now live and listed on the RotaSphere platform. It is ready for ticket bookings.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

              {/* Horizontal Stepper Nodes */}
              <div className="mb-6 shrink-0 relative flex justify-between items-center w-full px-2 md:px-8">
                <div className="absolute left-6 right-6 top-[14px] md:left-10 md:right-10 md:top-[18px] h-0.5 bg-[#d9d9dd] dark:bg-white/10 z-0 rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-[#17458F] to-[#4FC3F7] transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {steps.map((step) => {
                  const Icon = step.icon
                  const isActive = currentStep === step.number
                  const isCompleted = currentStep > step.number
                  return (
                    <button
                      key={step.number}
                      type="button"
                      onClick={() => {
                        if (step.number < currentStep || isStepValidUpTo(step.number - 1)) {
                          setCurrentStep(step.number)
                        }
                      }}
                      className="relative z-10 flex flex-col items-center gap-1.5 group focus:outline-none"
                    >
                      <div className={cn(
                        "h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm",
                        isCompleted
                          ? "bg-gradient-to-br from-[#17458F] to-[#4FC3F7] border-transparent text-white shadow-md scale-102"
                          : isActive
                            ? "bg-white dark:bg-[#1f1f27] border-[#1E88E5] text-[#1E88E5] shadow-lg ring-4 ring-[#1E88E5]/20 font-bold scale-110"
                            : "bg-white dark:bg-[#1a1a22] border-border dark:border-white/10 text-muted-foreground group-hover:border-[#1E88E5]/40 group-hover:text-[#1E88E5]"
                      )}>
                        {isCompleted ? (
                          <Check className="h-3.5 w-3.5 md:h-4 md:w-4 stroke-[3px]" />
                        ) : (
                          <Icon className="h-3.5 w-3.5 md:h-4.5 md:w-4.5" />
                        )}
                      </div>
                      <span className={cn(
                        "text-[9px] font-extrabold uppercase tracking-widest transition-colors duration-200 hidden md:block",
                        isActive ? "text-[#1E88E5]" : isCompleted ? "text-foreground/80" : "text-muted-foreground"
                      )}>
                        {step.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Steps render area */}
                <div className="flex-1 overflow-y-auto pr-2 min-h-0 py-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.2 }}
                      className="w-full"
                    >
                      {/* STEP 1: Basic Info & Live Preview */}
                      {currentStep === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                          <div className="md:col-span-3 space-y-4">
                            <div className="space-y-1.5">
                              <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Event Title *</Label>
                              <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Silicon Valley Venture Capital Meetup"
                                className={cn(
                                  "rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 focus-visible:ring-accent focus-visible:ring-2 focus-visible:border-accent/50 shadow-sm transition-all text-foreground",
                                  errors.title && "border-destructive focus-visible:ring-destructive"
                                )}
                              />
                              {errors.title && (
                                <p className="text-xs text-destructive font-semibold mt-1">{errors.title}</p>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                                <Select
                                  value={formData.category}
                                  onValueChange={(val) => { if (val) setFormData(prev => ({ ...prev, category: val })) }}
                                >
                                  <SelectTrigger className="rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 focus:ring-accent focus:ring-2 shadow-sm text-xs text-foreground">
                                    <SelectValue placeholder="Select Category" />
                                  </SelectTrigger>
                                  <SelectContent className="glass-card">
                                    <SelectItem value="community">Community Service</SelectItem>
                                    <SelectItem value="professional">Professional Development</SelectItem>
                                    <SelectItem value="club">Club Service</SelectItem>
                                    <SelectItem value="international">International Service</SelectItem>
                                    <SelectItem value="fundraiser">Fundraisers</SelectItem>
                                    <SelectItem value="pr">Public Relations</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-1.5">
                                <Label htmlFor="organizer" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Organizing Club Name *</Label>
                                <div className="relative">
                                  <Input
                                    id="organizer"
                                    name="organizer"
                                    value={formData.organizer}
                                    onChange={handleInputChange}
                                    placeholder="Host organization or name"
                                    className={cn(
                                      "rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 pl-9 focus-visible:ring-accent focus-visible:ring-2 shadow-sm text-foreground",
                                      errors.organizer && "border-destructive focus-visible:ring-destructive"
                                    )}
                                  />
                                  <Award className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                {errors.organizer && (
                                  <p className="text-xs text-destructive font-semibold mt-1">{errors.organizer}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Event Mockup */}
                          <div className="md:col-span-2 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block px-1">Live Event Card Mockup</span>
                            <div className="border border-white/10 dark:border-white/5 rounded-xl bg-background/40 backdrop-blur-xl p-4 shadow-lg flex flex-col gap-3 group relative overflow-hidden">
                              <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

                              <div className="h-32 w-full rounded-lg overflow-hidden bg-muted relative">
                                <img
                                  src={getBannerUrl()}
                                  alt="Event Card Mockup"
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[9px] font-bold uppercase tracking-wider text-accent border border-white/10">
                                  {formData.category}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <h4 className="font-extrabold text-sm text-foreground leading-snug line-clamp-1">
                                  {formData.title || "Untitled Special Event"}
                                </h4>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Award className="h-3 w-3 text-accent" />
                                  Host: <span className="font-semibold text-foreground/80">{formData.organizer || "Event Organizer"}</span>
                                </p>
                                <div className="flex justify-between items-center pt-2 border-t border-muted/30 text-[9px] text-muted-foreground mt-1">
                                  <span className="flex items-center gap-0.5">
                                    <Calendar className="h-2.5 w-2.5" />
                                    {formData.date ? new Date(formData.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) : "Date Pending"}
                                  </span>
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="h-2.5 w-2.5" />
                                    {formData.location ? formData.location.split(",")[0] : "Location Pending"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: Logistics */}
                      {currentStep === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                          <div className="md:col-span-3 space-y-4 text-left">
                            {/* Format Selector */}
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Event Format</Label>
                              <div className="grid grid-cols-3 gap-2 bg-slate-900/50 border border-white/5 rounded-xl p-1">
                                {(['in-person', 'online', 'hybrid'] as const).map((type) => (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, locationType: type }))}
                                    className={cn(
                                      "py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                      formData.locationType === type
                                        ? "bg-accent text-white shadow-md font-extrabold"
                                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                    )}
                                  >
                                    {type.replace('-', ' ')}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label htmlFor="date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Event Date *</Label>
                                <div className="relative">
                                  <Input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className={cn(
                                      "rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 pl-9 focus-visible:ring-accent focus-visible:ring-2 shadow-sm text-xs text-foreground",
                                      errors.date && "border-destructive focus-visible:ring-destructive"
                                    )}
                                  />
                                  <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                {errors.date && (
                                  <p className="text-xs text-destructive font-semibold mt-1">{errors.date}</p>
                                )}
                              </div>

                              <div className="space-y-1.5">
                                <Label htmlFor="time" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Time Slot</Label>
                                <Input
                                  id="time"
                                  name="time"
                                  value={formData.time}
                                  onChange={handleInputChange}
                                  placeholder="e.g., 10:00 AM - 04:00 PM EST"
                                  className={cn(
                                    "rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 focus-visible:ring-accent focus-visible:ring-2 shadow-sm text-xs text-foreground",
                                    errors.time && "border-destructive focus-visible:ring-destructive"
                                  )}
                                />
                                {errors.time && (
                                  <p className="text-xs text-destructive font-semibold mt-1">{errors.time}</p>
                                )}
                              </div>
                            </div>

                            {formData.locationType === "online" ? (
                              <div className="space-y-1.5">
                                <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Online Stream / Broadcast URL *</Label>
                                <div className="relative">
                                  <Input
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Zoom Link, YouTube Live URL"
                                    className={cn(
                                      "rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 pl-9 focus-visible:ring-accent focus-visible:ring-2 shadow-sm text-xs text-foreground",
                                      errors.location && "border-destructive focus-visible:ring-destructive"
                                    )}
                                  />
                                  <Video className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                {errors.location && (
                                  <p className="text-xs text-destructive font-semibold mt-1">{errors.location}</p>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <Label htmlFor="venueName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Venue Name *</Label>
                                    <Input
                                      id="venueName"
                                      name="venueName"
                                      value={formData.venueName}
                                      onChange={handleInputChange}
                                      placeholder="e.g., Moscone Center"
                                      className={cn(
                                        "rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 focus-visible:ring-accent shadow-sm text-xs text-foreground",
                                        errors.venueName && "border-destructive"
                                      )}
                                    />
                                    {errors.venueName && (
                                      <p className="text-xs text-destructive font-semibold mt-1">{errors.venueName}</p>
                                    )}
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label htmlFor="googleMapsUrl" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Google Maps Link *</Label>
                                    <Input
                                      id="googleMapsUrl"
                                      name="googleMapsUrl"
                                      value={formData.googleMapsUrl}
                                      onChange={handleInputChange}
                                      placeholder="Paste Google Maps URL"
                                      className={cn(
                                        "rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 focus-visible:ring-accent shadow-sm text-xs text-foreground",
                                        errors.googleMapsUrl && "border-destructive"
                                      )}
                                    />
                                    {errors.googleMapsUrl && (
                                      <p className="text-xs text-destructive font-semibold mt-1">{errors.googleMapsUrl}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-1.5">
                                  <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Address *</Label>
                                  <Input
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Street address, building, suite"
                                    className={cn(
                                      "rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 focus-visible:ring-accent shadow-sm text-xs text-foreground",
                                      errors.address && "border-destructive"
                                    )}
                                  />
                                  {errors.address && (
                                    <p className="text-xs text-destructive font-semibold mt-1">{errors.address}</p>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">City *</Label>
                                    <Input
                                      id="city"
                                      name="city"
                                      value={formData.city}
                                      onChange={handleInputChange}
                                      className={cn(
                                        "rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 focus-visible:ring-accent shadow-sm text-xs text-foreground",
                                        errors.city && "border-destructive"
                                      )}
                                    />
                                    {errors.city && (
                                      <p className="text-xs text-destructive font-semibold mt-1">{errors.city}</p>
                                    )}
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label htmlFor="pincode" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pincode *</Label>
                                    <Input
                                      id="pincode"
                                      name="pincode"
                                      value={formData.pincode}
                                      onChange={handleInputChange}
                                      className={cn(
                                        "rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 focus-visible:ring-accent shadow-sm text-xs text-foreground",
                                        errors.pincode && "border-destructive"
                                      )}
                                    />
                                    {errors.pincode && (
                                      <p className="text-xs text-destructive font-semibold mt-1">{errors.pincode}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <Label htmlFor="state" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">State</Label>
                                    <Input
                                      id="state"
                                      name="state"
                                      value={formData.state}
                                      onChange={handleInputChange}
                                      className="rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 focus-visible:ring-accent shadow-sm text-xs text-foreground"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <Label htmlFor="country" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Country</Label>
                                    <Input
                                      id="country"
                                      name="country"
                                      value={formData.country}
                                      onChange={handleInputChange}
                                      className="rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 focus-visible:ring-accent shadow-sm text-xs text-foreground"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="md:col-span-2 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block px-1">Location Details</span>
                            {formData.locationType === "online" ? (
                              <div className="border border-white/10 dark:border-white/5 rounded-xl bg-background/40 backdrop-blur-xl p-4 shadow-lg flex flex-col gap-3 relative overflow-hidden">
                                <div className="h-28 w-full rounded-lg bg-slate-900/60 dark:bg-slate-900/80 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                                  <div className="absolute inset-0 bg-radial-grid opacity-15" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparentpointer-events-none" />
                                  <Video className="h-8 w-8 text-indigo-400 drop-shadow-md animate-pulse" />
                                  <span className="text-[9px] font-semibold tracking-wide text-indigo-400 mt-2 z-10">
                                    Virtual Broadcast
                                  </span>
                                </div>
                                <div className="text-[10px] text-muted-foreground text-left">
                                  <p className="font-bold text-foreground line-clamp-2">
                                    {formData.location || "Zoom / Online streaming URL..."}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <LocationPickerMap
                                latitude={formData.latitude}
                                longitude={formData.longitude}
                                address={formData.address}
                                googleMapsUrl={formData.googleMapsUrl}
                                onChange={(mapData) => {
                                  setFormData(prev => ({
                                    ...prev,
                                    ...(mapData.latitude !== undefined && { latitude: mapData.latitude }),
                                    ...(mapData.longitude !== undefined && { longitude: mapData.longitude }),
                                    ...(mapData.address !== undefined && { address: mapData.address }),
                                    ...(mapData.city !== undefined && { city: mapData.city }),
                                    ...(mapData.state !== undefined && { state: mapData.state }),
                                    ...(mapData.country !== undefined && { country: mapData.country }),
                                    ...(mapData.pincode !== undefined && { pincode: mapData.pincode }),
                                    location: mapData.address || prev.location
                                  }));
                                  setErrors(prev => {
                                    const updated = { ...prev };
                                    if (mapData.latitude !== undefined) {
                                      delete updated.latitude;
                                      delete updated.longitude;
                                    }
                                    if (mapData.address !== undefined) {
                                      delete updated.address;
                                    }
                                    return updated;
                                  });
                                }}
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {/* STEP 3: Customization */}
                      {currentStep === 3 && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                          <div className="md:col-span-3 space-y-4">
                            <div className="space-y-1.5">
                              <Label htmlFor="image" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cover Image URL</Label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <Input
                                    id="image"
                                    name="image"
                                    value={formData.image && !formData.image.startsWith("data:") ? formData.image : ""}
                                    onChange={handleInputChange}
                                    placeholder="https://example.com/cover.jpg"
                                    className="rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 pl-9 focus-visible:ring-accent focus-visible:ring-2 shadow-sm text-xs text-foreground"
                                  />
                                  <ImageIcon className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="relative">
                                  <input
                                    id="device-file-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById("device-file-upload")?.click()}
                                    className="rounded-xl border-border dark:border-muted-foreground/15 bg-white dark:bg-background/40 py-5 px-4 h-full flex items-center gap-1.5 text-xs text-foreground hover:bg-muted font-bold cursor-pointer"
                                  >
                                    <Upload className="h-4 w-4 text-muted-foreground" />
                                    <span>Upload File</span>
                                  </Button>
                                </div>
                              </div>
                              {formData.image && formData.image.startsWith("data:") && (
                                <p className="text-[10px] text-emerald-500 font-semibold px-1">
                                  ✓ Custom image loaded from your device
                                </p>
                              )}
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Select a Category Preset Banner</span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {PRESET_BANNERS.map((preset) => {
                                  const isSelected = formData.image === preset.url
                                  return (
                                    <button
                                      key={preset.id}
                                      type="button"
                                      onClick={() => setFormData(prev => ({ ...prev, image: preset.url }))}
                                      className={cn(
                                        "p-1.5 rounded-lg border text-[9px] font-semibold transition-all relative overflow-hidden h-14 flex items-end justify-center",
                                        isSelected
                                          ? "border-accent ring-2 ring-accent/10 text-white font-bold scale-102"
                                          : "border-muted text-muted-foreground hover:border-muted-foreground/45"
                                      )}
                                    >
                                      <img src={preset.url} alt={preset.label} className="absolute inset-0 h-full w-full object-cover opacity-60" />
                                      <div className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors" />
                                      <span className="relative z-10 text-white drop-shadow-sm truncate">{preset.label}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-2 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block px-1">Visual Banner Media</span>
                            <div className="border border-white/10 dark:border-white/5 rounded-xl bg-background/40 backdrop-blur-xl p-4 shadow-lg flex flex-col gap-3">
                              <div className="relative border-2 border-dashed border-muted-foreground/20 rounded-lg hover:border-accent/40 transition-colors bg-muted/10 h-36 flex flex-col items-center justify-center p-4 text-center cursor-pointer overflow-hidden group">
                                {formData.image ? (
                                  <>
                                    <img src={formData.image} alt="Selected banner" className="absolute inset-0 h-full w-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="text-[10px] text-white font-bold flex items-center gap-1">
                                        <Upload className="h-3 w-3" /> Change Banner
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-6 w-6 text-muted-foreground mb-2 group-hover:text-accent transition-colors" />
                                    <span className="text-[10px] font-bold text-foreground/80 block">Drag & Drop Banner</span>
                                    <span className="text-[9px] text-muted-foreground block mt-0.5">Supports PNG, JPG (up to 4MB)</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                  onChange={handleFileChange}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 4: TICKETS & BOOKING SETUP */}
                      {currentStep === 4 && (
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start text-xs">

                          {/* Dynamic ticket configuration panels */}
                          <div className="lg:col-span-3 space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-muted/50">
                              <div>
                                <h4 className="font-bold text-foreground text-sm flex items-center gap-1">
                                  <Ticket className="h-4 w-4 text-indigo-500" />
                                  Ticket Tiers
                                </h4>
                                <p className="text-[10px] text-muted-foreground">Add multiple pricing categories for registrations.</p>
                              </div>
                              <Button
                                type="button"
                                onClick={addTicketTier}
                                size="xs"
                                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-1 py-1 px-3"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Add Ticket
                              </Button>
                            </div>

                            {errors.tickets && (
                              <p className="text-xs text-destructive font-semibold">{errors.tickets}</p>
                            )}

                            {/* Dynamic ticket tiers list */}
                            <div className="space-y-3">
                              {tickets.map((t, idx) => {
                                const isExpanded = expandedTicketId === t.id
                                return (
                                  <div key={t.id} className="border border-white/10 dark:border-white/5 rounded-xl bg-background/50 backdrop-blur-md overflow-hidden transition-all duration-200">
                                    {/* Ticket Tier Header */}
                                    <div
                                      onClick={() => toggleExpandedTicket(t.id)}
                                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider", getTicketTypeColor(t.type))}>
                                          {t.type}
                                        </span>
                                        <span className="font-bold text-foreground text-xs leading-none">{t.name || "Untitled Tier"}</span>
                                      </div>

                                      <div className="flex items-center gap-3">
                                        <span className="font-bold text-foreground/80">{parseFloat(t.price) === 0 ? "Free" : `₹${t.price}`}</span>
                                        <span className="text-[10px] text-muted-foreground font-semibold">Qty: {t.quantity}</span>

                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={(e) => removeTicketTier(t.id, e)}
                                            disabled={tickets.length === 1}
                                            className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Expandable details form */}
                                    {isExpanded && (
                                      <div className="p-3 border-t border-muted/30 bg-muted/5 space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div className="space-y-1">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ticket Name *</Label>
                                            <Input
                                              value={t.name}
                                              onChange={(e) => updateTicketField(t.id, "name", e.target.value)}
                                              className={cn("rounded-lg h-8 text-xs border-muted-foreground/15", errors[`ticket_${idx}_name`] && "border-destructive")}
                                            />
                                            {errors[`ticket_${idx}_name`] && (
                                              <p className="text-[10px] text-destructive font-semibold mt-1">{errors[`ticket_${idx}_name`]}</p>
                                            )}
                                          </div>
                                          <div className="space-y-1">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ticket Type</Label>
                                            <select
                                              value={t.type}
                                              onChange={(e) => updateTicketField(t.id, "type", e.target.value as any)}
                                              className="h-8 w-full rounded-lg border border-muted bg-background px-2 py-1 text-xs outline-none text-foreground"
                                            >
                                              <option value="Regular">Regular</option>
                                              <option value="VIP">VIP</option>
                                              <option value="Early Bird">Early Bird</option>
                                              <option value="Student Pass">Student Pass</option>
                                              <option value="Premium Access">Premium Access</option>
                                              <option value="Free Pass">Free Pass</option>
                                            </select>
                                          </div>
                                        </div>

                                        <div className="space-y-1">
                                          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ticket Description</Label>
                                          <Input
                                            value={t.description}
                                            onChange={(e) => updateTicketField(t.id, "description", e.target.value)}
                                            placeholder="A short description explaining ticket perks."
                                            className="rounded-lg h-8 text-xs border-muted-foreground/15"
                                          />
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                          <div className="space-y-1">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Price *</Label>
                                            <Input
                                              value={t.price}
                                              onChange={(e) => updateTicketField(t.id, "price", e.target.value)}
                                              disabled={t.type === "Free Pass"}
                                              className={cn("rounded-lg h-8 text-xs border-muted-foreground/15 font-semibold", errors[`ticket_${idx}_price`] && "border-destructive")}
                                            />
                                            {errors[`ticket_${idx}_price`] && (
                                              <p className="text-[10px] text-destructive font-semibold mt-1">{errors[`ticket_${idx}_price`]}</p>
                                            )}
                                          </div>
                                          <div className="space-y-1">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Currency</Label>
                                            <div className="h-8 w-full rounded-lg border border-muted bg-[#f4f4f5]/10 dark:bg-slate-900/60 px-3 py-2 text-xs text-foreground font-semibold flex items-center">
                                              INR (₹)
                                            </div>
                                          </div>
                                          <div className="space-y-1 col-span-2 sm:col-span-1">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quantity *</Label>
                                            <Input
                                              type="number"
                                              value={t.quantity}
                                              onChange={(e) => updateTicketField(t.id, "quantity", e.target.value)}
                                              className={cn("rounded-lg h-8 text-xs border-muted-foreground/15", errors[`ticket_${idx}_qty`] && "border-destructive")}
                                            />
                                            {errors[`ticket_${idx}_qty`] && (
                                              <p className="text-[10px] text-destructive font-semibold mt-1">{errors[`ticket_${idx}_qty`]}</p>
                                            )}
                                          </div>
                                        </div>

                                        <div className="space-y-1">
                                          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sales Start & End Date</Label>
                                          <div className="flex gap-2 items-center">
                                            <Input
                                              type="date"
                                              value={t.startDate}
                                              onChange={(e) => updateTicketField(t.id, "startDate", e.target.value)}
                                              className={cn("rounded-lg h-8 text-xs border-muted-foreground/15 w-full", errors[`ticket_${idx}_dates`] && "border-destructive")}
                                            />
                                            <span className="text-[10px] text-muted-foreground font-semibold shrink-0">to</span>
                                            <Input
                                              type="date"
                                              value={t.endDate}
                                              onChange={(e) => updateTicketField(t.id, "endDate", e.target.value)}
                                              className={cn("rounded-lg h-8 text-xs border-muted-foreground/15 w-full", errors[`ticket_${idx}_dates`] && "border-destructive")}
                                            />
                                          </div>
                                          {errors[`ticket_${idx}_dates`] && (
                                            <p className="text-[10px] text-destructive font-semibold mt-1">{errors[`ticket_${idx}_dates`]}</p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>

                            {/* Additional Booking Settings */}
                            <div className="border border-white/10 dark:border-white/5 rounded-xl bg-background/40 p-4 shadow-sm space-y-3">
                              <h4 className="font-bold text-foreground text-xs flex items-center gap-1 border-b border-muted pb-1.5">
                                <Landmark className="h-4 w-4 text-indigo-500" />
                                Booking Options
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10.5px]">
                                <label className="flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={bookingSettings.showRemaining}
                                    onChange={(e) => setBookingSettings(prev => ({ ...prev, showRemaining: e.target.checked }))}
                                    className="h-3.5 w-3.5 accent-indigo-500 rounded border-muted"
                                  />
                                  Show remaining tickets count
                                </label>
                                <label className="flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={bookingSettings.enableWaitlist}
                                    onChange={(e) => setBookingSettings(prev => ({ ...prev, enableWaitlist: e.target.checked }))}
                                    className="h-3.5 w-3.5 accent-indigo-500 rounded border-muted"
                                  />
                                  Enable waitlist
                                </label>
                                <label className="flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={bookingSettings.requireApproval}
                                    onChange={(e) => setBookingSettings(prev => ({ ...prev, requireApproval: e.target.checked }))}
                                    className="h-3.5 w-3.5 accent-indigo-500 rounded border-muted"
                                  />
                                  Require host registration approval
                                </label>
                                <label className="flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={bookingSettings.allowCoupons}
                                    onChange={(e) => setBookingSettings(prev => ({ ...prev, allowCoupons: e.target.checked }))}
                                    className="h-3.5 w-3.5 accent-indigo-500 rounded border-muted"
                                  />
                                  Allow coupon / discount codes
                                </label>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div className="space-y-1">
                                  <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Refund Policy</Label>
                                  <select
                                    value={bookingSettings.refundPolicy}
                                    onChange={(e) => setBookingSettings(prev => ({ ...prev, refundPolicy: e.target.value }))}
                                    className="h-7 w-full rounded-lg border border-muted bg-background px-2 py-0.5 text-xs outline-none text-foreground"
                                  >
                                    <option value="no-refunds">No refunds</option>
                                    <option value="7-days">Up to 7 days before event</option>
                                    <option value="30-days">Up to 30 days before event</option>
                                    <option value="flexible">Flexible</option>
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Cancellation Rule</Label>
                                  <select
                                    value={bookingSettings.cancellationPolicy}
                                    onChange={(e) => setBookingSettings(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                                    className="h-7 w-full rounded-lg border border-muted bg-background px-2 py-0.5 text-xs outline-none text-foreground"
                                  >
                                    <option value="no-cancellation">No cancellation permitted</option>
                                    <option value="24h">Cancel 24 hours before</option>
                                    <option value="48h">Cancel 48 hours before</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Attendee Form Custom fields */}
                            <div className="border border-white/10 dark:border-white/5 rounded-xl bg-background/40 p-4 shadow-sm space-y-3">
                              <h4 className="font-bold text-foreground text-xs flex items-center gap-1 border-b border-muted pb-1.5">
                                <Users className="h-4 w-4 text-indigo-500" />
                                Attendee Form Fields Collection
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[9.5px]">
                                <label className="flex items-center gap-2 font-semibold text-muted-foreground opacity-50 cursor-not-allowed">
                                  <input type="checkbox" checked disabled className="h-3 accent-indigo-500 rounded" />
                                  Full Name (Required)
                                </label>
                                <label className="flex items-center gap-2 font-semibold text-muted-foreground opacity-50 cursor-not-allowed">
                                  <input type="checkbox" checked disabled className="h-3 accent-indigo-500 rounded" />
                                  Email (Required)
                                </label>
                                {[
                                  { id: "phone", label: "Phone Number" },
                                  { id: "company", label: "Company" },
                                  { id: "designation", label: "Designation" },
                                  { id: "linkedin", label: "LinkedIn URL" },
                                  { id: "dietary", label: "Dietary Prefs" },
                                  { id: "customQuestion", label: "Custom Question" }
                                ].map((item) => (
                                  <label key={item.id} className="flex items-center gap-2 font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={(attendeeFields as any)[item.id]}
                                      onChange={(e) => setAttendeeFields(prev => ({ ...prev, [item.id]: e.target.checked }))}
                                      className="h-3 accent-indigo-500 rounded border-muted"
                                    />
                                    {item.label}
                                  </label>
                                ))}
                              </div>
                            </div>

                            {/* Payment setups */}
                            <div className="border border-white/10 dark:border-white/5 rounded-xl bg-background/40 p-4 shadow-sm space-y-3">
                              <h4 className="font-bold text-foreground text-xs flex items-center gap-1 border-b border-muted pb-1.5">
                                <CreditCard className="h-4 w-4 text-indigo-500" />
                                Payout & Gateway Settings
                              </h4>

                              <div className="flex gap-2 text-[10px]">
                                <button
                                  type="button"
                                  className="flex-1 p-3 rounded-lg border-2 border-accent bg-accent/5 ring-1 ring-accent/15 text-left flex items-center gap-3"
                                >
                                  <Wallet className="h-5 w-5 text-accent shrink-0" />
                                  <div className="truncate">
                                    <span className="font-bold text-foreground block leading-tight">Paytm Gateway</span>
                                    <span className="text-[8px] opacity-75 truncate block">Wallet, UPI, Netbanking & Cards</span>
                                  </div>
                                </button>
                              </div>

                              <div className="bg-muted/15 rounded-lg p-4 flex justify-between items-center text-[10px] pt-3 mt-2">
                                <div className="text-left space-y-1 text-muted-foreground">
                                  <p className="font-bold text-foreground">Organizer Payout breakdown</p>
                                  <p>Platform Fee (Paytm): <span className="text-emerald-500 font-semibold">₹0.00 (Free)</span></p>
                                  <p>Tax / GST: <span className="text-emerald-500 font-semibold">₹0.00 (Exempt)</span></p>
                                </div>

                                <div className="text-right space-y-1">
                                  <p className="text-muted-foreground font-medium">Est. Payout per Sale</p>
                                  <p className="font-extrabold text-accent text-base">
                                    ₹{ticketPriceVal.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Interactive Digital Ticket Preview */}
                          <div className="lg:col-span-2 space-y-2 sticky top-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block px-1">Live Ticket Preview Mockup</span>

                            <div className="relative w-full max-w-sm mx-auto select-none mt-2 filter drop-shadow-md">
                              {/* Visual Ticket Body */}
                              <div className="flex bg-gradient-to-br from-[#003c33] to-[#17171c] rounded-xl overflow-hidden text-white relative h-48 border border-white/20">

                                {/* Left side circular cut-out */}
                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#1c1c24] border-r border-white/10 z-20" />
                                {/* Right side circular cut-out */}
                                <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-[#1c1c24] border-l border-white/10 z-20" />

                                {/* Main Entry Pass */}
                                <div className="flex-1 p-4 flex flex-col justify-between pr-4 pl-6 relative">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1">
                                      <Sparkles className="h-3 w-3 text-accent" />
                                      <span className="text-[8px] font-extrabold uppercase tracking-widest text-accent/80">Admit One Pass</span>
                                    </div>
                                    <h3 className="font-extrabold text-sm leading-snug line-clamp-2 mt-1 drop-shadow-sm">
                                      {formData.title || "Untitled Special Event"}
                                    </h3>
                                    <p className="text-[9px] opacity-75 font-medium line-clamp-1">{formData.location || "Location TBD"}</p>
                                  </div>

                                  <div className="space-y-1 text-[9px] border-t border-white/10 pt-2 opacity-90">
                                    <div className="flex justify-between font-semibold">
                                      <span>Date: {formData.date ? new Date(formData.date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }) : "TBD"}</span>
                                      <span>Time: {formData.time ? formData.time.split("-")[0] : "TBD"}</span>
                                    </div>
                                    <div className="text-[8px] opacity-75">Host: {formData.organizer || "Event Organizer"}</div>
                                  </div>
                                </div>

                                {/* Dashed Divider Line */}
                                <div className="absolute top-0 bottom-0 left-[72%] border-l-2 border-dashed border-white/30 z-10" />

                                {/* Tear-Off Ticket Stub */}
                                <div className="w-[28%] bg-white/5 backdrop-blur-xs flex flex-col justify-between items-center p-3 pt-4 pl-4 relative">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider leading-none text-center shadow-sm",
                                    activeTicketForCalc?.type === "VIP" ? "bg-accent text-white" : "bg-primary text-primary-foreground border border-white/10"
                                  )}>
                                    {activeTicketForCalc?.type || "Regular"}
                                  </span>

                                  {/* Barcode graphics */}
                                  <div className="flex flex-col items-center gap-1 pb-1">
                                    <div className="w-12 h-8 bg-white rounded p-1 flex items-center justify-center">
                                      <svg className="w-full h-full opacity-80" viewBox="0 0 100 100" fill="currentColor">
                                        <rect x="5" y="10" width="8" height="80" />
                                        <rect x="18" y="10" width="3" height="80" />
                                        <rect x="25" y="10" width="12" height="80" />
                                        <rect x="42" y="10" width="4" height="80" />
                                        <rect x="52" y="10" width="10" height="80" />
                                        <rect x="68" y="10" width="3" height="80" />
                                        <rect x="76" y="10" width="14" height="80" />
                                      </svg>
                                    </div>
                                    <span className="text-[7px] font-mono opacity-60">#EVT-{activeTicketForCalc?.id.substring(2, 6).toUpperCase()}</span>
                                  </div>
                                </div>

                              </div>
                            </div>
                          </div>

                        </div>
                      )}

                      {/* STEP 5: REVIEW & PUBLISH SUMMARY */}
                      {currentStep === 5 && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start text-xs">

                          {/* Summary overview check panels */}
                          <div className="md:col-span-3 space-y-4">
                            <h4 className="font-bold text-foreground text-sm border-b border-muted pb-1.5 flex items-center gap-1">
                              <ShieldCheck className="h-4 w-4 text-emerald-500" />
                              Final Campaign Summary
                            </h4>

                            <div className="space-y-3 bg-muted/15 rounded-xl p-4 border border-muted/50">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Title</span>
                                <p className="font-extrabold text-foreground text-sm leading-snug">{formData.title}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Date & Time</span>
                                  <p className="font-semibold text-foreground">{formData.date} ({formData.time || "TBD"})</p>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Location</span>
                                  <p className="font-semibold text-foreground line-clamp-1">{formData.location}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Category</span>
                                  <p className="font-semibold text-foreground capitalize">{formData.category}</p>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Organizing Club</span>
                                  <p className="font-semibold text-foreground">{formData.organizer}</p>
                                </div>
                              </div>
                            </div>

                            {/* Created Ticket tiers summaries */}
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Active Registration Classes</span>
                              <div className="space-y-2">
                                {tickets.map(t => (
                                  <div key={t.id} className="p-3 rounded-lg bg-background border border-muted flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className={cn("px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider", getTicketTypeColor(t.type))}>
                                        {t.type}
                                      </span>
                                      <span className="font-bold text-foreground">{t.name}</span>
                                    </div>
                                    <div className="flex gap-4 font-semibold text-muted-foreground">
                                      <span>Price: <span className="text-foreground">₹{t.price}</span></span>
                                      <span>Quantity: <span className="text-foreground">{t.quantity}</span></span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Rich Description text input */}
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground block px-1">Campaign Description</Label>
                            <div className="border border-white/10 dark:border-white/5 rounded-xl bg-background/40 backdrop-blur-xl p-4 shadow-lg flex flex-col gap-2">
                              <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Write a summary about details, speaker panel highlights, or food/drinks availability..."
                                rows={6}
                                className="rounded-xl border-muted-foreground/15 bg-background/50 focus-visible:ring-accent focus-visible:ring-2 shadow-sm text-xs resize-none"
                              />
                              <div className="flex justify-between items-center text-[9px] text-muted-foreground mt-1">
                                <span>Recommended: 100 - 300 characters</span>
                                <span>{formData.description.length} chars</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Wizard Footer Controls */}
                <DialogFooter className="mx-0! mb-0! p-0! bg-transparent! border-t! border-muted/50 pt-4 flex gap-3 sm:justify-end mt-4 shrink-0">
                  <div className="flex justify-between items-center w-full gap-3">
                    {currentStep > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        className="rounded-full border-[#d9d9dd] dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-foreground flex items-center gap-1.5 py-5 px-5 text-xs font-bold transition-all"
                      >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        Back
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="rounded-full border-[#d9d9dd] dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-foreground py-5 px-5 text-xs font-bold transition-all"
                      >
                        Cancel
                      </Button>
                    )}

                    <div className="flex items-center gap-2">
                      {currentStep < 5 ? (
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="rounded-full bg-gradient-to-r from-[#17458F] to-[#1E88E5] hover:from-[#0A2342] hover:to-[#17458F] text-white shadow-[0_4px_14px_rgba(30,136,229,0.35)] border-0 flex items-center gap-1.5 py-5 px-6 text-xs font-extrabold tracking-wide transition-all"
                        >
                          Next Step
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="rounded-full bg-gradient-to-r from-[#17458F] to-[#1E88E5] hover:from-[#0A2342] hover:to-[#17458F] text-white shadow-[0_4px_14px_rgba(30,136,229,0.35)] border-0 flex items-center gap-1.5 py-5 px-7 text-xs font-extrabold tracking-wide transition-all disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            "Publishing..."
                          ) : (
                            <>
                              Publish Event
                              <Check className="h-4 w-4 stroke-[3px]" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogFooter>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
