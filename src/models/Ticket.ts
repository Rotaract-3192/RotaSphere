import mongoose, { Schema, Document, Model } from "mongoose"

export interface ITicket extends Document {
  eventId: mongoose.Types.ObjectId | string; // Reference to Event
  userId: string; // clerkId/id of the attendee
  ticketCode: string; // unique ticket identifier (e.g. barcode code)
  pricePaid: number;
  status: 'active' | 'cancelled' | 'used';
  purchasedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: String, required: true, index: true },
    ticketCode: { type: String, required: true, unique: true, index: true },
    pricePaid: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['active', 'cancelled', 'used'], default: 'active' },
    purchasedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema)
export default Ticket
