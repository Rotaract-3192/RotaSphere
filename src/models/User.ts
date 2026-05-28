import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
  clerkId: string; // Clerk user ID or simulated user ID
  email: string;
  fullName: string;
  role: 'attendee' | 'organizer' | 'admin';
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: ['attendee', 'organizer', 'admin'], default: 'attendee' },
    imageUrl: { type: String },
  },
  { timestamps: true }
)

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
export default User
