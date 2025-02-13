import mongoose from "mongoose";

const menteeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    interests: [{ type: String }], // Topics mentee wants mentorship in
    bio: { type: String },
    mentorshipRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mentorship" }] // Past mentorships
  },
  { timestamps: true }
);

const Mentee = mongoose.model("Mentee", menteeSchema);
export default Mentee;
