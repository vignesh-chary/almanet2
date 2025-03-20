import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    linkedin: { type: String }, // Optional LinkedIn profile
    industry: { type: String }, // Industry field of the mentor
    expertise: [{ type: String, required: true }], // List of expertise areas
    bio: { type: String, default: "No bio available" },
    // photoUrl: { type: String, default: "" }, // Profile picture URL

    // Mentor's available slots (day, start time, end time)
    availability: [
      {
        day: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
      },
    ],

    rating: { type: Number, min: 1, max: 5, default: 0 }, // Default 0 instead of null
    totalSessions: { type: Number, default: 0 },

    // Array of reviews with menteeId, rating, and feedback
    reviews: [
      {
        mentee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        feedback: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Mentor = mongoose.model("Mentor", mentorSchema);
export default Mentor;
