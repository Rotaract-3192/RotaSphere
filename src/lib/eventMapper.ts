// Convert Supabase database row to frontend-compatible EventItem format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapRowToEventItem(row: any): any {
  const priceStr = row.type === "free" ? "Free" : `$${parseFloat(String(row.price || 0)).toFixed(2)}`
  
  const startD = new Date(row.start_date)
  const endD = new Date(row.end_date)
  
  const dateStr = startD.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  const timeStr = `${startD.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} - ${endD.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} ${row.timezone}`
  const locStr = row.location_type === "online" ? "Virtual Online Link" : `${row.venue_name}, ${row.city}`

  return {
    id: String(row.id),
    title: row.title,
    description: row.description,
    date: dateStr,
    time: timeStr,
    location: locStr,
    image: row.banner_url,
    organizer: row.organizer,
    price: priceStr,
    category: row.category,
    capacity: String(row.capacity),
    attendees: row.attendees_count || 0,
    latitude: row.latitude,
    longitude: row.longitude,
    googleMapsUrl: row.google_maps_url,
    // Raw fields for editing/details if needed
    slug: row.slug,
    fullDescription: row.full_description,
    startDate: row.start_date,
    endDate: row.end_date,
    timezone: row.timezone,
    type: row.type,
    priceVal: row.price,
    visibility: row.visibility,
    locationType: row.location_type,
    venueName: row.venue_name,
    venueDescription: row.venue_description,
    country: row.country,
    state: row.state,
    city: row.city,
    address: row.address,
    pincode: row.pincode,
    tags: row.tags ? row.tags.join(", ") : "",
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    organizerId: row.organizer_id
  }
}
