import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    mentorship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentorship",
      required: true,
    },
    text: { type: String, required: true },
    setBy: { type: String, enum: ["mentor", "mentee"], required: true },
    completed: { type: Boolean, default: false }, // Add this field
    subgoals: [
      {
        text: { type: String, required: true },
        completed: { type: Boolean, default: false }, // Add this field
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;