import { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["APPLICATION_RECEIVED", "APPLICATION_REVIEWING", "APPLICATION_APPROVED"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    href: { type: String, required: true },
    relatedApplicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true },
    companyName: { type: String, default: "" },
    recruiterName: { type: String, default: "" },
    companyAddress: { type: String, default: "" },
    appointmentDate: { type: String, default: "" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = models.Notification || model("Notification", NotificationSchema);
export default Notification;
