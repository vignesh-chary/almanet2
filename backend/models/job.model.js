import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship"],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["Entry", "Mid", "Senior"],
      required: true,
    },
    position: { type: String, required: true },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applications: [
      {
        name: { type: String, required: true },
        email: { type: String, required: true },
        resume: { type: String, required: true },
        appliedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ["Pending", "Accepted", "Rejected"],
          default: "Pending",
        }, // Added status field
      },
    ],
    requirements: [{ type: String }],
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
