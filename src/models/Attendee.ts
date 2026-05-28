import mongoose, { Schema, Document, Model } from "mongoose"

export interface IAttendee extends Document {
  eventId: mongoose.Types.ObjectId | string; // Reference to Event
  clerkId: string; // Attendee's user session ID
  email: string;
  fullName: string;
  ticketId: mongoose.Types.ObjectId | string; // Reference to Ticket
  registeredAt: Date;
}

const AttendeeSchema = new Schema<IAttendee>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    clerkId: { type: String, required: true, index: true },
    email: { type: String, required: true },
    fullName: { type: String, required: true },
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true },
    registeredAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

// Prevent duplicate attendee registration for the same event
AttendeeSchema.index({ eventId: 1, clerkId: 1 }, { unique: true })

const Attendee: Model<IAttendee> = mongoose.models.Attendee || mongoose.model<IAttendee>("Attendee", AttendeeSchema)
export default Attendee
