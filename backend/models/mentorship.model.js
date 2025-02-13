import mongoose from "mongoose";

const subgoalSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: true } // Ensures Mongoose auto-generates `_id`
);

const goalSchema = new mongoose.Schema({
  text: { type: String, required: true },
  subgoals: [subgoalSchema], // Subgoals array
});

const mentorshipSchema = new mongoose.Schema(
  {
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor", required: true },
    mentee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    requestDate: { type: Date, default: Date.now },
    mentorshipType: {
      type: String,
      enum: ["Resume Review", "Career Guidance", "Technical Skills"],
      required: true,
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, default: "" },
    },
    sessions: [
      {
        date: { type: Date, required: true },
        time: { type: String, required: true },
        status: {
          type: String,
          enum: ["scheduled", "completed", "cancelled"],
          default: "scheduled",
        },
      },
    ],
    goals: [goalSchema], // Add goals to the mentorship schema
  },
  { timestamps: true }
);

const Mentorship = mongoose.model("Mentorship", mentorshipSchema);
export default Mentorship;
