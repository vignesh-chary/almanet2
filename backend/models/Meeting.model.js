import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },
  menteeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  startTime: { type: String, required: true }, // Format: HH:mm
  endTime: { type: String, required: true }, // Format: HH:mm
  meetLink: { type: String, required: true }, // Meeting link
}, { timestamps: true });

const Meeting = mongoose.model("Meeting", meetingSchema);
export default Meeting;