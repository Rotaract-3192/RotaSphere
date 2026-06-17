import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
  clerkId: string; // Clerk user ID or simulated user ID
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'ORGANIZER' | 'ATTENDEE' | 'PENDING_USER';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: ['SUPER_ADMIN', 'ADMIN', 'ORGANIZER', 'ATTENDEE', 'PENDING_USER'], default: 'ATTENDEE' },
    status: { type: String, enum: ['ACTIVE', 'PENDING', 'SUSPENDED', 'REJECTED'], default: 'ACTIVE' },
    imageUrl: { type: String },
  },
  { timestamps: true }
)

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
export default User
