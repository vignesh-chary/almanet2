import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		username: { 
			type: String, 
			required: true, 
			unique: true 
		},
		email: { 
			type: String, 
			required: true, 
			unique: true 
		},
		password: { 
			type: String, 
			required: true 
		},
		role: {
			type: String,
			enum: ["student", "alumni", "admin"], // Added "admin"
			default: "student",
		},
		profilePicture: {
			type: String,
			default: "",
		},
		bannerImg: {
			type: String,
			default: "",
		},
		headline: {
			type: String,
			default: "Almanet User",
		},
		location: {
			type: String,
			default: "Earth",
		},
		about: {
			type: String,
			default: "",
		},
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
		connections: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		// Alumni-specific fields
		designation: {
			type: String,
			default: "",
		},
		company: {
			type: String,
			default: "",
		},
		industry: {
			type: String,
			default: "",
		},
		mentorshipAreas: [String],
		// Student-specific fields
		degree: {
			type: String,
			default: "",
		},
		yearOfStudy: {
			type: Number,
			default: null,
		},
		interests: [String],
		mentorshipRequests: [
			{
				alumniId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				requestDate: {
					type: Date,
					default: Date.now,
				},
				status: {
					type: String,
					enum: ["pending", "approved", "rejected"],
					default: "pending",
				},
			},
		],
		recommendations: [
			{
				fromUser: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				message: String,
			},
		],
		interactions: [
			{
				interactionType: String,
				details: String,
				date: {
					type: Date,
					default: Date.now,
				},
			},
		],
		// Admin-specific fields
		adminActions: [
			{
				actionType: String, // Example: "banUser", "approvePost"
				targetUser: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				details: String,
				date: {
					type: Date,
					default: Date.now,
				},
			},
		],
		isSuperAdmin: {
			type: Boolean, // Flag for super-admin privileges
			default: false,
		},
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
