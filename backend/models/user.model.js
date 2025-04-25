import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		username: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, enum: ["student", "alumni", "admin"], default: "student" },
		profilePicture: { type: String, default: "" },
		bannerImg: { type: String, default: "" },
		headline: { type: String, default: "Almanet User" },
		location: { type: String, default: "Earth" },
		about: { type: String, default: "" },
		skills: [String],
		experience: [
			{
				title: String,
				company: String,
				startDate: Date,
				endDate: Date,
				description: String,
			},
		],
		education: [
			{
				school: String,
				fieldOfStudy: String,
				startYear: Number,
				endYear: Number,
			},
		],
		connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
		// Alumni-specific fields
		designation: { type: String, default: "" },
		company: { type: String, default: "" },
		industry: { type: String, default: "" },
		mentorshipAreas: [String], // Alumni expertise
		// Student-specific fields
		degree: { type: String, default: "" },
		yearOfStudy: { type: Number, default: null },
		interests: [String],
		recommendations: [
			{
				fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
				message: String,
			},
		],
		interactions: [
			{
				interactionType: String,
				details: String,
				timestamp: { type: Date, default: Date.now }
			}
		],
		// Admin-specific fields
		adminActions: [
			{
				actionType: String,
				targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
				details: String,
				date: { type: Date, default: Date.now },
			},
		],
		isSuperAdmin: { type: Boolean, default: false },
		// Moderation preferences
		preferences: {
			contentFilterLevel: {
				type: String,
				enum: ["low", "medium", "high"],
				default: "medium"
			},
			showFlaggedContent: {
				type: Boolean,
				default: false
			},
			moderationNotifications: {
				type: Boolean,
				default: true
			},
			darkMode: {
				type: Boolean,
				default: false
			}
		},
		moderationHistory: [
			{
				contentType: {
					type: String,
					enum: ["post", "comment"],
					required: true
				},
				contentId: {
					type: mongoose.Schema.Types.ObjectId,
					required: true
				},
				action: {
					type: String,
					enum: ["flag", "unflag", "delete"],
					required: true
				},
				reason: String,
				date: { type: Date, default: Date.now }
			}
		]
	},
	{ timestamps: true }
);

// **Add a text index for optimized searching**
// userSchema.index({ name: "text", username: "text" });

const User = mongoose.model("User", userSchema);

export default User;
