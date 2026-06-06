import mongoose, { Schema, Document, Model } from "mongoose"

export interface IAuditLog extends Document {
  userId: string;
  userEmail?: string;
  action: string;
  targetId?: string;
  details?: any;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: String, required: true },
    userEmail: { type: String },
    action: { type: String, required: true },
    targetId: { type: String },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema)
export default AuditLog
