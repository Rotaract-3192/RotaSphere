"use client"

import * as React from "react"
import { useForm, Resolver, FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MapPin, Users, DollarSign, Ticket, 
  Plus, ArrowLeft, ArrowRight, Check, Upload, Globe, 
  Lock, Unlock, Sparkles, Mail, Phone, IndianRupee
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription 
} from "@/components/ui/form"
import { EventItem } from "@/data/mockData"
import { createEventAction, updateEventAction } from "@/app/actions/eventActions"
import { ROTARACT_CLUBS } from "@/data/clubs"

// Preset Unsplash images for banners and thumbnails
const PRESET_BANNERS = [
  { id: "tech-1", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80", label: "Tech Hall" },
  { id: "tech-2", url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80", label: "Developer Meetup" },
  { id: "music-1", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80", label: "Concert Lights" },
  { id: "music-2", url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80", label: "DJ Stage" },
  { id: "food-1", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&auto=format&fit=crop&q=80", label: "BBQ Grill" },
  { id: "business-1", url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&auto=format&fit=crop&q=80", label: "Corporate Speech" }
]

const PRESET_THUMBNAILS = [
  { id: "thumb-tech", url: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400&auto=format&fit=crop&q=80", label: "Workspace" },
  { id: "thumb-music", url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&auto=format&fit=crop&q=80", label: "Crowd" },
  { id: "thumb-food", url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&auto=format&fit=crop&q=80", label: "Healthy Food" },
  { id: "thumb-business", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&auto=format&fit=crop&q=80", label: "Collaboration" }
]

const TIMEZONES = [
  { value: "EST", label: "Eastern Standard Time (EST) - UTC-5" },
  { value: "PST", label: "Pacific Standard Time (PST) - UTC-8" },
  { value: "CST", label: "Central Standard Time (CST) - UTC-6" },
  { value: "MST", label: "Mountain Standard Time (MST) - UTC-7" },
  { value: "UTC", label: "Coordinated Universal Time (UTC)" },
  { value: "GMT", label: "Greenwich Mean Time (GMT) - UTC+0" },
  { value: "CET", label: "Central European Time (CET) - UTC+1" },
  { value: "IST", label: "Indian Standard Time (IST) - UTC+5:30" },
  { value: "AEDT", label: "Australian Eastern Daylight Time (AEDT) - UTC+11" },
]

// Zod Schema representing all fields in the 5 steps
const createEventSchema = z.object({
  // Step 1: Basic Info
  title: z.string().min(3, "Event name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Short description must be at least 10 char").max(160, "Short description must be under 160 characters"),
  fullDescription: z.string().min(20, "Full description must be at least 20 characters"),
  bannerUrl: z.string().min(1, "Event banner is required"),
  thumbnailUrl: z.string().min(1, "Event thumbnail is required"),

  // Step 2: Date & Time
  startDate: z.string().min(1, "Start date and time is required"),
  endDate: z.string().min(1, "End date and time is required"),
  timezone: z.string().min(1, "Timezone is required"),

  // Step 3: Event Settings
  type: z.enum(["free", "paid"]),
  price: z.string().optional(),
  ticketTiers: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.coerce.number().min(0, "Price cannot be negative"),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
    ticketsSold: z.coerce.number().default(0),
    enabled: z.boolean()
  })).optional(),
  visibility: z.enum(["public", "private"]),
  locationType: z.enum(["in-person", "online", "hybrid"]),
  hostClub: z.string().min(1, "Hosting Rotaract Club is required"),

  // Step 4: Venue Details
  venueName: z.string().optional(),
  venueDescription: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  pincode: z.string().optional(),

  // Step 5: Additional Details
  category: z.string().min(1, "Category is required"),
  tags: z.string().min(1, "At least one tag is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1 attendee"),
  contactEmail: z.string().email("Please enter a valid contact email"),
  contactPhone: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validate end date is after start date
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date/time must be after start date/time",
        path: ["endDate"],
      })
    }
  }

  // Validate price if paid
  if (data.type === "paid" && (!data.price || data.price.trim() === "" || data.price === "$0" || data.price === "$0.00" || data.price === "₹0" || data.price === "₹0.00")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Price is required for paid events",
      path: ["price"],
    })
  }

  if (data.type === "paid") {
    const hasEnabled = data.ticketTiers?.some(t => t.enabled)
    if (!hasEnabled) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one ticket type must be enabled for paid events",
        path: ["ticketTiers"],
      })
    }
  }

  // Validate venue details if in-person or hybrid
  if (data.locationType !== "online") {
    if (!data.venueName || data.venueName.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Venue name is required",
        path: ["venueName"],
      })
    }
    if (!data.country || data.country.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Country is required",
        path: ["country"],
      })
    }
    if (!data.city || data.city.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "City is required",
        path: ["city"],
      })
    }
    if (!data.address || data.address.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Address is required",
        path: ["address"],
      })
    }
    if (!data.pincode || data.pincode.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pincode is required",
        path: ["pincode"],
      })
    }
  }
})

type EventFormValues = z.infer<typeof createEventSchema>

interface MultiStepCreateEventProps {
  onSuccessRedirect: () => void;
  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  organizerName: string;
  editEvent?: EventItem;
}

export function MultiStepCreateEvent({ onSuccessRedirect, events, setEvents, organizerName, editEvent }: MultiStepCreateEventProps) {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [tagInput, setTagInput] = React.useState("")
  const [clubSearch, setClubSearch] = React.useState("")
  const [clubDropdownOpen, setClubDropdownOpen] = React.useState(false)
  const [tagsList, setTagsList] = React.useState<string[]>(() => {
    if (editEvent?.tags) {
      return Array.isArray(editEvent.tags) 
        ? (editEvent.tags as string[])
        : String(editEvent.tags).split(",").map(t => t.trim()).filter(Boolean)
    }
    return []
  })
  
  const form = useForm<EventFormValues>({
    resolver: zodResolver(createEventSchema) as any,
    mode: "onTouched",
    defaultValues: (editEvent ? {
      title: editEvent.title || "",
      slug: editEvent.slug || "",
      description: editEvent.description || "",
      fullDescription: editEvent.fullDescription || editEvent.description || "",
      bannerUrl: editEvent.image || PRESET_BANNERS[0].url,
      thumbnailUrl: editEvent.thumbnailUrl || editEvent.image || PRESET_THUMBNAILS[0].url,
      startDate: editEvent.startDate || editEvent.date || "",
      endDate: editEvent.endDate || editEvent.date || "",
      timezone: editEvent.timezone || "IST",
      type: editEvent.price && parseFloat(String(editEvent.price).replace(/[^0-9.]/g, "")) > 0 ? "paid" : "free",
      price: editEvent.price ? String(editEvent.price).replace(/[^0-9.]/g, "") : "",
      visibility: (editEvent.visibility as "public" | "private") || "public",
      locationType: (editEvent.locationType as "in-person" | "online" | "hybrid") || "in-person",
      venueName: editEvent.venueName || "",
      venueDescription: editEvent.venueDescription || "",
      country: editEvent.country || "India",
      state: editEvent.state || "",
      city: editEvent.city || "",
      address: editEvent.address || "",
      pincode: editEvent.pincode || "",
      category: editEvent.category || "community",
      tags: Array.isArray(editEvent.tags) ? editEvent.tags.join(", ") : (editEvent.tags || ""),
      capacity: editEvent.capacity ? Number(editEvent.capacity) : 500,
      contactEmail: editEvent.contactEmail || "",
      contactPhone: editEvent.contactPhone || "",
      hostClub: (editEvent as any).hostClub || "",
      ticketTiers: (editEvent as any).ticketTiers && (editEvent as any).ticketTiers.length > 0
        ? (editEvent as any).ticketTiers
        : [
            { id: "early-bird", name: "Early Bird", price: 0, capacity: 50, ticketsSold: 0, enabled: false },
            { id: "normal", name: "Normal", price: editEvent.price ? parseFloat(String(editEvent.price).replace(/[^0-9.]/g, "")) || 0 : 0, capacity: editEvent.capacity ? Number(editEvent.capacity) : 500, ticketsSold: editEvent.attendees || 0, enabled: true },
            { id: "vip", name: "VIP", price: 0, capacity: 20, ticketsSold: 0, enabled: false }
          ]
    } : {
      title: "",
      slug: "",
      description: "",
      fullDescription: "",
      bannerUrl: PRESET_BANNERS[0].url,
      thumbnailUrl: PRESET_THUMBNAILS[0].url,
      startDate: "",
      endDate: "",
      timezone: "EST",
      type: "free",
      price: "",
      visibility: "public",
      locationType: "in-person",
      venueName: "",
      venueDescription: "",
      country: "United States",
      state: "",
      city: "",
      address: "",
      pincode: "",
      category: "community",
      tags: "",
      capacity: 500,
      contactEmail: "",
      contactPhone: "",
      hostClub: "",
      ticketTiers: [
        { id: "early-bird", name: "Early Bird", price: 0, capacity: 50, ticketsSold: 0, enabled: false },
        { id: "normal", name: "Normal", price: 0, capacity: 500, ticketsSold: 0, enabled: true },
        { id: "vip", name: "VIP", price: 0, capacity: 20, ticketsSold: 0, enabled: false }
      ]
    }) as EventFormValues
  })

  const { trigger, watch, setValue } = form
  const titleValue = watch("title")
  const locationTypeValue = watch("locationType")
  const typeValue = watch("type")
  const bannerValue = watch("bannerUrl")
  const thumbnailValue = watch("thumbnailUrl")

  // Auto-generate slug from event title (with short random suffix for uniqueness)
  React.useEffect(() => {
    if (titleValue && !editEvent) {
      const base = titleValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric except spaces/hyphens
        .replace(/\s+/g, "-") // spaces to hyphens
        .replace(/-+/g, "-") // collapse multiple hyphens
        .trim()
      // Append a short random hex suffix to guarantee uniqueness
      const suffix = Math.random().toString(36).slice(2, 7)
      setValue("slug", `${base}-${suffix}`, { shouldValidate: true })
    }
  }, [titleValue, setValue, editEvent])

  // Sync react-hook-form state with custom tags list state
  React.useEffect(() => {
    setValue("tags", tagsList.join(", "), { shouldValidate: true })
  }, [tagsList, setValue])

  const ticketTiersValue = watch("ticketTiers")

  // Auto-calculate capacity and default price from enabled ticket tiers
  React.useEffect(() => {
    if (typeValue === "paid" && ticketTiersValue) {
      const totalCap = ticketTiersValue
        .filter((t: any) => t.enabled)
        .reduce((sum: number, t: any) => sum + (Number(t.capacity) || 0), 0)
      setValue("capacity", totalCap, { shouldValidate: true })

      // Auto-set price to the first enabled tier's price (e.g. Early Bird if active, or Normal)
      const activeTier = ticketTiersValue.find((t: any) => t.id === "early-bird" && t.enabled && t.ticketsSold < t.capacity)
        || ticketTiersValue.find((t: any) => t.id === "normal" && t.enabled)
        || ticketTiersValue.find((t: any) => t.enabled)
      
      if (activeTier) {
        setValue("price", String(activeTier.price), { shouldValidate: true })
      }
    }
  }, [ticketTiersValue, typeValue, setValue])

  const handleAddTag = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tagsList.includes(trimmed)) {
      setTagsList([...tagsList, trimmed])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter(t => t !== tagToRemove))
  }

  // Define steps configurations
  const steps = [
    { number: 1, label: "Basic Info", fields: ["title", "slug", "description", "fullDescription", "bannerUrl", "thumbnailUrl"] as const },
    { number: 2, label: "Date & Time", fields: ["startDate", "endDate", "timezone"] as const },
    { number: 3, label: "Settings", fields: ["type", "price", "ticketTiers", "visibility", "locationType", "hostClub"] as const },
    { number: 4, label: "Venue Details", fields: ["venueName", "venueDescription", "country", "state", "city", "address", "pincode"] as const, skipIfOnline: true },
    { number: 5, label: "Additional Info", fields: ["category", "tags", "capacity", "contactEmail", "contactPhone"] as const }
  ]

  const totalSteps = steps.length



  // Go to next step after validating current fields
  const handleNext = async () => {
    const activeStepObj = steps.find(s => s.number === currentStep)
    if (!activeStepObj) return

    // Trigger validation for fields in current step
    const fieldsToValidate = [...activeStepObj.fields] as FieldPath<EventFormValues>[]
    const isStepValid = await trigger(fieldsToValidate)

    if (isStepValid) {
      let nextStep = currentStep + 1
      // If next step is Step 4 and location is Online, skip to Step 5
      if (nextStep === 4 && locationTypeValue === "online") {
        nextStep = 5
      }
      if (nextStep <= totalSteps) {
        setCurrentStep(nextStep)
      }
    }
  }

  // Go to previous step
  const handleBack = () => {
    let prevStep = currentStep - 1
    // If going back to Step 4 but location is Online, skip back to Step 3
    if (prevStep === 4 && locationTypeValue === "online") {
      prevStep = 3
    }
    if (prevStep >= 1) {
      setCurrentStep(prevStep)
    }
  }

  // Simulate file upload with FileReader (converting to base64 DataURL for mockup visual storage)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "bannerUrl" | "thumbnailUrl") => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setValue(fieldName, reader.result as string, { shouldValidate: true })
      }
      reader.readAsDataURL(file)
    }
  }

  // Form Submit Handler
  const onSubmit = async (data: EventFormValues) => {
    try {
      if (editEvent) {
        const res = await updateEventAction(editEvent.id, {
          ...data,
          organizer: organizerName
        })

        if (res.success && res.event) {
          const updatedEvent = res.event as EventItem
          const updated = events.map(e => e.id === editEvent.id ? updatedEvent : e)
          setEvents(updated)
          localStorage.setItem("rotasphere_events", JSON.stringify(updated))
          onSuccessRedirect()
        } else {
          alert(res.error || "Failed to update event. Please try again.")
        }
        return
      }

      const res = await createEventAction({
        ...data,
        organizer: organizerName
      })

      if (res.success && res.event) {
        const newEvent = res.event as EventItem
        const updated = [newEvent, ...events]
        setEvents(updated)
        
        // Update localStorage as fallback and client state synchronization
        localStorage.setItem("rotasphere_events", JSON.stringify(updated))
        onSuccessRedirect()
      } else {
        alert(res.error || "Failed to create event. Please try again.")
      }
    } catch (err) {
      console.error("Submission failed:", err)
      alert("An unexpected error occurred during submission.")
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Wizard Header Progress Stepper */}
      <Card className="border border-border bg-card p-5 shadow-none rounded-[16px]">
        <div className="relative flex justify-between items-center w-full">
          {/* Progress bar line */}
          <div className="absolute left-4 right-4 top-4 -translate-y-1/2 h-0.5 bg-muted z-0">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ 
                width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` 
              }}
            />
          </div>

          {/* Step Nodes */}
          {steps.map((s) => {
            const isCompleted = currentStep > s.number || (s.number === 4 && locationTypeValue === "online" && currentStep > 3)
            const isActive = currentStep === s.number
            const isSkipped = s.number === 4 && locationTypeValue === "online"

            return (
              <div key={s.number} className="relative z-10 flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  disabled={s.number > currentStep && !isCompleted}
                  onClick={() => {
                    // Only allow clicking previous or completed steps
                    if (isCompleted || s.number < currentStep) {
                      setCurrentStep(s.number)
                    }
                  }}
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isActive
                      ? "bg-accent border-accent text-white shadow-none ring-4 ring-accent/20"
                      : isSkipped
                      ? "bg-muted border-border text-muted-foreground/50 line-through cursor-not-allowed"
                      : "bg-background border-border text-muted-foreground hover:border-accent/50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{s.number}</span>
                  )}
                </button>
                <span className={cn(
                  "hidden sm:block text-[10px] font-bold uppercase tracking-wider",
                  isActive ? "text-accent" : "text-muted-foreground",
                  isSkipped && "line-through opacity-40"
                )}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Main Form Area */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border border-border bg-card p-6 shadow-none relative overflow-hidden rounded-[16px]">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
                
                <CardContent className="p-0 space-y-6">
                  
                  {/* STEP 1: BASIC INFORMATION */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-md font-bold text-foreground">Basic Information</h3>
                        <p className="text-xs text-muted-foreground">Set up the core elements of your event brand identity.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Title *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. RotaSphere Global Tech Summit 2026" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="slug"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Slug Slug *</FormLabel>
                              <FormControl>
                                <Input placeholder="rotasphere-global-tech-summit-2026" {...field} />
                              </FormControl>
                              <FormDescription>Unique URL string: eventsphere.com/events/[slug]</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Short Tagline Description *</FormLabel>
                            <FormControl>
                              <Input placeholder="A concise, one-sentence description summarizing the event main theme." {...field} />
                            </FormControl>
                            <FormDescription>Appears on the homepage event card grid (max 160 characters).</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fullDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Event Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe details, schedules, keynote presenters, food offerings, networking schedules..." 
                                rows={6} 
                                className="resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>Explain all features in markdown format.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Image Upload Zone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Event Banner */}
                        <FormField
                          control={form.control}
                          name="bannerUrl"
                          render={() => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Event Promo Banner Image *</FormLabel>
                              <div className="flex flex-col gap-3 mt-1.5">
                                <div className="relative h-32 w-full rounded-xl border border-dashed border-muted flex items-center justify-center bg-muted/10 overflow-hidden group">
                                  {bannerValue ? (
                                    <>
                                      <img src={bannerValue} alt="Banner Preview" className="h-full w-full object-cover" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-[10px] text-white font-bold flex items-center gap-1">
                                          <Upload className="h-3 w-3" /> Change Banner
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-center p-4">
                                      <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                                      <span className="text-[10px] font-semibold text-muted-foreground">Click to upload banner</span>
                                    </div>
                                  )}
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => handleFileUpload(e, "bannerUrl")}
                                  />
                                </div>
                                <span className="text-[9px] text-muted-foreground">Recommended ratio: 16:9 (1200x675px)</span>
                                
                                {/* Presets Quick Selection */}
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-muted-foreground">Or pick a professional preset:</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {PRESET_BANNERS.map((preset) => (
                                      <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => setValue("bannerUrl", preset.url, { shouldValidate: true })}
                                        className={cn(
                                          "px-2 py-0.5 rounded-full border text-[9px] font-medium transition-all",
                                          bannerValue === preset.url
                                            ? "bg-accent/10 text-accent border-accent/40 font-bold"
                                            : "border-muted hover:bg-muted/40 text-muted-foreground"
                                        )}
                                      >
                                        {preset.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Event Thumbnail */}
                        <FormField
                          control={form.control}
                          name="thumbnailUrl"
                          render={() => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Event Card Thumbnail Image *</FormLabel>
                              <div className="flex flex-col gap-3 mt-1.5">
                                <div className="relative h-32 w-full rounded-xl border border-dashed border-muted flex items-center justify-center bg-muted/10 overflow-hidden group">
                                  {thumbnailValue ? (
                                    <>
                                      <img src={thumbnailValue} alt="Thumbnail Preview" className="h-full w-full object-cover" />
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-[10px] text-white font-bold flex items-center gap-1">
                                          <Upload className="h-3 w-3" /> Change Thumbnail
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-center p-4">
                                      <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                                      <span className="text-[10px] font-semibold text-muted-foreground">Click to upload thumbnail</span>
                                    </div>
                                  )}
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => handleFileUpload(e, "thumbnailUrl")}
                                  />
                                </div>
                                <span className="text-[9px] text-muted-foreground">Recommended: Square 1:1 or 4:3 image ratio</span>

                                {/* Presets Quick Selection */}
                                <div className="space-y-1">
                                  <span className="text-[9px] font-bold text-muted-foreground">Or pick a professional preset:</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {PRESET_THUMBNAILS.map((preset) => (
                                      <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => setValue("thumbnailUrl", preset.url, { shouldValidate: true })}
                                        className={cn(
                                          "px-2 py-0.5 rounded-full border text-[9px] font-medium transition-all",
                                          thumbnailValue === preset.url
                                            ? "bg-accent/10 text-accent border-accent/40 font-bold"
                                            : "border-muted hover:bg-muted/40 text-muted-foreground"
                                        )}
                                      >
                                        {preset.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: DATE & TIME */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-md font-bold text-foreground">Date & Time</h3>
                        <p className="text-xs text-muted-foreground">Define schedule parameters and local timezone settings.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Start Date & Time *</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event End Date & Time *</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone *</FormLabel>
                            <FormControl>
                              <select 
                                className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs outline-none focus-visible:border-ring text-foreground dark:bg-background/40"
                                {...field}
                              >
                                {TIMEZONES.map((tz) => (
                                  <option key={tz.value} value={tz.value} className="bg-background text-foreground">
                                    {tz.label}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormDescription>Global attendees will see event times aligned to this region.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* STEP 3: EVENT SETTINGS */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-md font-bold text-foreground">Event Settings</h3>
                        <p className="text-xs text-muted-foreground">Select ticketing modes, accessibility, and location types.</p>
                      </div>

                      {/* Pricing Model selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel>Ticket Price Model *</FormLabel>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                  { value: "free", label: "Free Event", desc: "No charges apply for passes", icon: Ticket },
                                  { value: "paid", label: "Paid Tickets", desc: "Require attendee payout", icon: IndianRupee }
                                ].map((option) => {
                                  const Icon = option.icon
                                  const isSelected = field.value === option.value
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => {
                                        field.onChange(option.value)
                                        if (option.value === "free") setValue("price", "")
                                      }}
                                      className={cn(
                                        "flex flex-col items-center justify-between p-4 rounded-2xl border-2 text-center text-xs transition-all gap-2",
                                        isSelected
                                          ? "border-accent bg-accent/10 text-foreground ring-2 ring-accent/20"
                                          : "border-border hover:bg-muted/40 text-muted-foreground"
                                      )}
                                    >
                                      <Icon className="h-5 w-5 text-accent" />
                                      <div>
                                        <span className="font-bold block text-[11px]">{option.label}</span>
                                        <span className="text-[9px] opacity-75">{option.desc}</span>
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
 
                        {/* Ticket Tiers Selector (Conditional) */}
                        {typeValue === "paid" && (
                          <div className="col-span-1 md:col-span-2 space-y-4 border-t border-muted/50 pt-4 mt-2">
                            <FormLabel className="text-sm font-bold block mb-1">Ticket Types & Pricing *</FormLabel>
                            <p className="text-[10px] text-muted-foreground -mt-3 mb-3">Enable one or more ticket types and specify their individual price and capacity.</p>
                            
                            <div className="space-y-4">
                              {ticketTiersValue?.map((tier: any, index: number) => {
                                const isEnabled = tier.enabled;
                                return (
                                  <div 
                                    key={tier.id} 
                                    className={cn(
                                      "p-4 rounded-2xl border transition-all duration-300 space-y-4 bg-background/50",
                                      isEnabled 
                                        ? "border-accent ring-1 ring-accent/10" 
                                        : "border-border opacity-70"
                                    )}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2.5">
                                        <input
                                          type="checkbox"
                                          id={`tier-${tier.id}`}
                                          checked={isEnabled}
                                          onChange={(e) => {
                                            const updated = [...ticketTiersValue]
                                            updated[index] = { ...updated[index], enabled: e.target.checked }
                                            setValue("ticketTiers", updated, { shouldValidate: true })
                                          }}
                                          className="h-4.5 w-4.5 rounded border-gray-300 text-accent focus:ring-accent accent-accent cursor-pointer"
                                        />
                                        <label 
                                          htmlFor={`tier-${tier.id}`} 
                                          className="text-xs font-bold text-foreground cursor-pointer select-none uppercase tracking-wider"
                                        >
                                          {tier.name} Ticket
                                        </label>
                                      </div>
                                      
                                      {isEnabled && (
                                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold">
                                          Active Tier
                                        </span>
                                      )}
                                    </div>

                                    {isEnabled && (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-dashed border-border/50 animate-fade-in">
                                        <FormField
                                          control={form.control}
                                          name={`ticketTiers.${index}.price` as any}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Ticket Price (₹) *</FormLabel>
                                              <FormControl>
                                                <div className="relative">
                                                  <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                  <Input type="number" placeholder="100.00" className="pl-7 h-8.5 text-xs" {...field} />
                                                </div>
                                              </FormControl>
                                              <FormMessage className="text-[10px]" />
                                            </FormItem>
                                          )}
                                        />
                                        
                                        <FormField
                                          control={form.control}
                                          name={`ticketTiers.${index}.capacity` as any}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Quantity Needed *</FormLabel>
                                              <FormControl>
                                                <div className="relative">
                                                  <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                  <Input type="number" placeholder="100" className="pl-7 h-8.5 text-xs" {...field} />
                                                </div>
                                              </FormControl>
                                              <FormMessage className="text-[10px]" />
                                            </FormItem>
                                          )}
                                        />
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="ticketTiers"
                              render={() => (
                                <FormItem>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </div>
                        )}
                      </div>
 
                      {/* Public vs Private settings */}
                      <FormField
                        control={form.control}
                        name="visibility"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Event Visibility *</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {[
                                { value: "public", label: "Public Listing", desc: "Listed on search and event grids", icon: Unlock },
                                { value: "private", label: "Private Invite", desc: "Only accessible via direct link", icon: Lock }
                              ].map((option) => {
                                const Icon = option.icon
                                const isSelected = field.value === option.value
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => field.onChange(option.value)}
                                      className={cn(
                                        "flex items-center gap-3 p-4 rounded-xl border-2 text-left text-xs transition-all",
                                        isSelected
                                          ? "border-accent bg-accent/8 text-foreground ring-2 ring-accent/20"
                                          : "border-border hover:bg-muted/40 text-muted-foreground"
                                      )}
                                    >
                                      <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                                        <Icon className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <span className="font-bold block text-[11px]">{option.label}</span>
                                        <span className="text-[9px] opacity-75">{option.desc}</span>
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                      {/* Host Club settings (District 3192 Searchable Combobox) */}
                      <FormField
                        control={form.control}
                        name="hostClub"
                        render={({ field }) => {
                          const selectedClub = field.value
                          const filteredClubs = ROTARACT_CLUBS.filter(club =>
                            club.toLowerCase().includes(clubSearch.toLowerCase())
                          )

                          return (
                            <FormItem className="space-y-2 relative">
                              <FormLabel>Hosting Rotaract Club *</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <div 
                                    className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background/50 px-3 py-2 text-xs placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-accent/20 cursor-pointer"
                                    onClick={() => setClubDropdownOpen(!clubDropdownOpen)}
                                  >
                                    <span className={cn(selectedClub ? "text-foreground font-medium" : "text-muted-foreground")}>
                                      {selectedClub || "Select host club name..."}
                                    </span>
                                    <Users className="h-4 w-4 text-muted-foreground opacity-60" />
                                  </div>
                                </FormControl>
                                
                                {clubDropdownOpen && (
                                  <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-background p-1.5 shadow-lg animate-fade-in backdrop-blur-md">
                                    <div className="flex items-center border-b border-border/40 pb-1.5 mb-1.5 px-2">
                                      <input
                                        type="text"
                                        placeholder="Search club name..."
                                        value={clubSearch}
                                        onChange={(e) => setClubSearch(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full bg-transparent text-xs text-foreground outline-none border-none placeholder:text-muted-foreground"
                                        autoFocus
                                      />
                                    </div>
                                    <div className="space-y-0.5">
                                      {clubSearch.trim() && !ROTARACT_CLUBS.some(c => c.toLowerCase() === clubSearch.trim().toLowerCase()) && (
                                        <div
                                          onClick={() => {
                                            field.onChange(clubSearch.trim())
                                            setClubDropdownOpen(false)
                                            setClubSearch("")
                                          }}
                                          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors bg-accent/5 text-accent font-medium border border-dashed border-accent/25 hover:bg-accent/10 mb-1"
                                        >
                                          <span>Use custom: "{clubSearch.trim()}"</span>
                                          <Plus className="h-3.5 w-3.5 text-accent" />
                                        </div>
                                      )}
                                      
                                      {filteredClubs.length === 0 ? (
                                        clubSearch.trim() ? null : (
                                          <div className="py-2 text-center text-xs text-muted-foreground">
                                            No clubs found
                                          </div>
                                        )
                                      ) : (
                                        filteredClubs.map((club) => {
                                          const isSelected = selectedClub === club
                                          return (
                                            <div
                                              key={club}
                                              onClick={() => {
                                                field.onChange(club)
                                                setClubDropdownOpen(false)
                                                setClubSearch("")
                                              }}
                                              className={cn(
                                                "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer select-none transition-colors",
                                                isSelected 
                                                  ? "bg-accent/10 text-accent font-semibold" 
                                                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                              )}
                                            >
                                              <span>{club}</span>
                                              {isSelected && <Check className="h-3 w-3 text-accent" />}
                                            </div>
                                          )
                                        })
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <FormDescription>Select the Rotaract Club hosting this event.</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />
 
                      {/* Location format settings */}
                      <FormField
                        control={form.control}
                        name="locationType"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Location Delivery Type *</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {[
                                { value: "in-person", label: "In-Person", desc: "Physical venue location", icon: MapPin },
                                { value: "online", label: "Online Virtual", desc: "Zoom, Meet, or streaming Link", icon: Globe },
                                { value: "hybrid", label: "Hybrid format", desc: "Both physical and streaming", icon: Sparkles }
                              ].map((option) => {
                                const Icon = option.icon
                                const isSelected = field.value === option.value
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => field.onChange(option.value)}
                                    className={cn(
                                      "flex flex-col items-center justify-between p-4 rounded-xl border-2 text-center text-xs transition-all gap-2",
                                      isSelected
                                        ? "border-accent bg-accent/8 text-foreground ring-2 ring-accent/20"
                                        : "border-border hover:bg-muted/40 text-muted-foreground"
                                    )}
                                  >
                                    <Icon className="h-5 w-5 text-accent" />
                                    <div>
                                      <span className="font-bold block text-[11px]">{option.label}</span>
                                      <span className="text-[9px] opacity-75">{option.desc}</span>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                            <FormDescription>If Online is selected, the venue details step is skipped.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* STEP 4: VENUE DETAILS (CONDITIONAL) */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-md font-bold text-foreground">Venue Details</h3>
                        <p className="text-xs text-muted-foreground">Provide instructions to help attendees find the physical location.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="venueName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Venue Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Moscone Convention Center" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="venueDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Venue Access / Directions (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Enter through West Lobby building doors" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country *</FormLabel>
                              <FormControl>
                                <Input placeholder="United States" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State / Region</FormLabel>
                              <FormControl>
                                <Input placeholder="California" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem className="col-span-1">
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Input placeholder="San Francisco" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="sm:col-span-2">
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address *</FormLabel>
                                <FormControl>
                                  <Input placeholder="747 Howard St" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="pincode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pincode / ZIP Code *</FormLabel>
                              <FormControl>
                                <Input placeholder="94103" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 5: ADDITIONAL DETAILS */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-md font-bold text-foreground">Additional Details</h3>
                        <p className="text-xs text-muted-foreground">Add tags, seat capacities, and organizer contact details.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <FormControl>
                                <select 
                                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs outline-none focus-visible:border-ring text-foreground dark:bg-background/40"
                                  {...field}
                                >
                                  <option value="community" className="bg-background text-foreground">Community Service</option>
                                  <option value="professional" className="bg-background text-foreground">Professional Development</option>
                                  <option value="club" className="bg-background text-foreground">Club Service</option>
                                  <option value="international" className="bg-background text-foreground">International Service</option>
                                  <option value="fundraiser" className="bg-background text-foreground">Fundraisers</option>
                                  <option value="pr" className="bg-background text-foreground">Public Relations</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="capacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximum Attendees Limit *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                  <Input 
                                    type="number" 
                                    placeholder="500" 
                                    className="pl-7" 
                                    disabled={typeValue === "paid"}
                                    {...field} 
                                  />
                                </div>
                              </FormControl>
                              <FormDescription>
                                {typeValue === "paid" 
                                  ? "Calculated automatically from the sum of enabled ticket tier capacities."
                                  : "Limits total tickets that can be booked."}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Tag list creator */}
                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel>Search Tags & Topics *</FormLabel>
                            <div className="flex gap-2">
                              <Input 
                                placeholder="Type a tag (e.g. react, marketing, rock) and press Enter" 
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault()
                                    handleAddTag(e)
                                  }
                                }}
                              />
                              <Button 
                                type="button" 
                                onClick={handleAddTag}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 rounded-xl"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {/* Hidden input to hold tags array for zod validation */}
                            <input type="hidden" {...field} />

                            {tagsList.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 pt-1.5">
                                {tagsList.map((tag) => (
                                  <span 
                                    key={tag} 
                                    className="inline-flex items-center gap-1.5 bg-accent/10 text-accent border border-accent/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                                  >
                                    {tag}
                                    <button 
                                      type="button" 
                                      onClick={() => handleRemoveTag(tag)}
                                      className="text-accent hover:text-accent/80 font-bold"
                                    >
                                      &times;
                                    </button>
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground block italic pt-1">
                                No tags added yet. Enter at least one tag.
                              </span>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-muted/50">
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organizer Contact Email *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                  <Input placeholder="support@rotasphere.com" className="pl-7" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organizer Contact Phone (Optional)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                  <Input placeholder="+1 (555) 019-2834" className="pl-7" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                </CardContent>

                {/* Form Footer Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-muted/50 mt-8 gap-3">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="rounded-full border-muted hover:bg-muted/50 text-xs font-semibold px-4"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1.5" />
                      Back
                    </Button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onSuccessRedirect}
                      className="rounded-full text-muted-foreground hover:text-foreground text-xs font-semibold px-4"
                    >
                      Cancel
                    </Button>

                    {currentStep < totalSteps ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm px-5"
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-sm px-6"
                      >
                        Publish Event
                        <Check className="h-4 w-4 ml-1.5" />
                      </Button>
                    )}
                  </div>
                </div>

              </Card>
            </motion.div>
          </AnimatePresence>
        </form>
      </Form>
    </div>
  )
}
