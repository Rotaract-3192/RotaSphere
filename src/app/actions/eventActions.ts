"use server"

import dbConnect from "@/lib/dbConnect"
import Event from "@/models/Event"

export interface EventFormInput {
  title: string;
  slug: string;
  description: string;
  fullDescription: string;
  bannerUrl: string;
  thumbnailUrl: string;
  startDate: string;
  endDate: string;
  timezone: string;
  type: 'free' | 'paid';
  price?: string;
  visibility: 'public' | 'private';
  locationType: 'in-person' | 'online' | 'hybrid';
  venueName?: string;
  venueDescription?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  pincode?: string;
  category: string;
  tags: string;
  capacity: number;
  contactEmail: string;
  contactPhone?: string;
  organizer: string;
}

// Convert Mongoose Event Document to a frontend-compatible EventItem format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToEventItem(doc: any): any {
  const priceStr = doc.type === "free" ? "Free" : `$${parseFloat(String(doc.price || 0)).toFixed(2)}`
  
  const startD = new Date(doc.startDate)
  const endD = new Date(doc.endDate)
  
  const dateStr = startD.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  const timeStr = `${startD.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} - ${endD.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} ${doc.timezone}`
  const locStr = doc.locationType === "online" ? "Virtual Online Link" : `${doc.venueName}, ${doc.city}`

  return {
    id: String(doc._id || doc.id),
    title: doc.title,
    description: doc.description,
    date: dateStr,
    time: timeStr,
    location: locStr,
    image: doc.bannerUrl,
    organizer: doc.organizer,
    price: priceStr,
    category: doc.category,
    capacity: String(doc.capacity),
    attendees: doc.attendeesCount || 0
  }
}

export async function createEventAction(input: EventFormInput) {
  try {
    const isDbConfigured = !!process.env.MONGODB_URI;
    
    // Construct formatting for return value
    const startD = new Date(input.startDate)
    const endD = new Date(input.endDate)
    const dateStr = startD.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    const timeStr = `${startD.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} - ${endD.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} ${input.timezone}`
    const locStr = input.locationType === "online" ? "Virtual Online Link" : `${input.venueName}, ${input.city}`
    const priceVal = input.type === "free" ? 0 : parseFloat(input.price || "0")
    const tagsArr = input.tags ? input.tags.split(",").map(t => t.trim()).filter(Boolean) : []
    const priceStr = input.type === "free" ? "Free" : `$${priceVal.toFixed(2)}`

    const simulatedEvent = {
      id: `evt-${Date.now()}`,
      title: input.title,
      description: input.description,
      date: dateStr,
      time: timeStr,
      location: locStr,
      image: input.bannerUrl,
      organizer: input.organizer,
      price: priceStr,
      category: input.category,
      capacity: String(input.capacity),
      attendees: 0
    }

    if (!isDbConfigured) {
      console.warn("MONGODB_URI is not set. Simulating database save for:", input.title)
      return { 
        success: true, 
        event: simulatedEvent,
        simulated: true 
      }
    }

    // Connect to database
    await dbConnect()

    // Save to MongoDB
    const newDoc = await Event.create({
      title: input.title,
      slug: input.slug,
      description: input.description,
      fullDescription: input.fullDescription,
      bannerUrl: input.bannerUrl,
      thumbnailUrl: input.thumbnailUrl,
      startDate: startD,
      endDate: endD,
      timezone: input.timezone,
      type: input.type,
      price: priceVal,
      visibility: input.visibility,
      locationType: input.locationType,
      venueName: input.venueName,
      venueDescription: input.venueDescription,
      country: input.country,
      state: input.state,
      city: input.city,
      address: input.address,
      pincode: input.pincode,
      category: input.category,
      tags: tagsArr,
      capacity: Number(input.capacity),
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      organizer: input.organizer,
      attendeesCount: 0
    })

    const mapped = mapToEventItem(newDoc)

    return { 
      success: true, 
      event: mapped,
      simulated: false
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to create event"
    console.error("Failed to create event in MongoDB:", error)
    return { success: false, error: errorMsg }
  }
}

export async function getEventsAction() {
  try {
    const isDbConfigured = !!process.env.MONGODB_URI;

    if (!isDbConfigured) {
      return { success: true, events: [], simulated: true }
    }

    await dbConnect()
    const docs = await Event.find({}).sort({ createdAt: -1 })
    const mapped = docs.map(mapToEventItem)

    return { success: true, events: mapped, simulated: false }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to fetch events"
    console.error("Failed to fetch events from MongoDB:", error)
    return { success: false, error: errorMsg }
  }
}
