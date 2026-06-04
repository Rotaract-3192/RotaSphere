import mongoose, { Schema, Document, Model } from "mongoose"

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  fullDescription: string;
  bannerUrl: string;
  thumbnailUrl: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  type: 'free' | 'paid';
  price?: number;
  visibility: 'public' | 'private';
  locationType: 'in-person' | 'online' | 'hybrid';
  venueName?: string;
  venueDescription?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  pincode?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  category: string;
  tags: string[];
  capacity: number;
  contactEmail: string;
  contactPhone?: string;
  organizer: string; // Organizer full name or email/clerkId
  attendeesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    fullDescription: { type: String, required: true },
    bannerUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timezone: { type: String, required: true, default: "EST" },
    type: { type: String, enum: ['free', 'paid'], required: true },
    price: { type: Number, default: 0 },
    visibility: { type: String, enum: ['public', 'private'], required: true, default: 'public' },
    locationType: { type: String, enum: ['in-person', 'online', 'hybrid'], required: true },
    venueName: { type: String },
    venueDescription: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    address: { type: String },
    pincode: { type: String },
    googleMapsUrl: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    category: { type: String, required: true },
    tags: { type: [String], required: true, default: [] },
    capacity: { type: Number, required: true, default: 500 },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    organizer: { type: String, required: true },
    attendeesCount: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
)

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema)
export default Event
