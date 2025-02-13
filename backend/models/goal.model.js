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
        subgoals: [
            {
                text: { type: String, required: true },
                completed: { type: Boolean, default: false },
                // _id: { type: mongoose.Schema.Types.ObjectId, default: mongoose.Types.ObjectId }, // Explicitly define _id
            },
        ],
    },
    { timestamps: true, versionKey: false } // Added versionKey: false
);

const Goal = mongoose.model("Goal", goalSchema);
export default Goal;