import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";


dotenv.config({ path: "../.env" }); // Adjust the path to locate `.env` in the main directory
console.log("MongoDB URI:", process.env.MONGO_URI);

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("Database connected successfully");
	} catch (error) {
		console.error("Database connection error:", error.message);
		process.exit(1);
	}
};

const migrateUsers = async () => {
	try {
		const users = await User.find();

		for (const user of users) {
			// Update existing fields or add new ones
			user.role = user.role || "student";
			user.designation = user.designation || "";
			user.company = user.company || "";
			user.industry = user.industry || "";
			user.mentorshipAreas = user.mentorshipAreas || [];
			user.degree = user.degree || "";
			user.yearOfStudy = user.yearOfStudy || null;
			user.interests = user.interests || [];
			user.mentorshipRequests = user.mentorshipRequests || [];
			user.recommendations = user.recommendations || [];
			user.interactions = user.interactions || [];

			await user.save();
		}

		console.log("Migration completed!");
	} catch (error) {
		console.error("Migration error:", error.message);
	} finally {
		mongoose.connection.close();
	}
};

(async () => {
	await connectDB();
	await migrateUsers();
})();
