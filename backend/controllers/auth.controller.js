import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../emails/emailHandlers.js";


export const signup = async (req, res) => {
	try {
		const { name, username, email, password, role } = req.body; // Added role field

		if (!name || !username || !email || !password || !role) { // Check if role is also provided
			return res.status(400).json({ message: "All fields are required" });
		}

		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ message: "Email already exists" });
		}

		const existingUsername = await User.findOne({ username });
		if (existingUsername) {
			return res.status(400).json({ message: "Username already exists" });
		}

		if (password.length < 6) {
			return res.status(400).json({ message: "Password must be at least 6 characters" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const user = new User({
			name,
			email,
			password: hashedPassword,
			username,
			role, // Added role to the user creation
		});

		await user.save();

		const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "3d" });

		res.cookie("jwt-linkedin", token, {
			httpOnly: true, // prevent XSS attack
			maxAge: 3 * 24 * 60 * 60 * 1000,
			sameSite: "strict", // prevent CSRF attacks
			secure: process.env.NODE_ENV === "production", // prevents man-in-the-middle attacks
		});

		res.status(201).json({ message: "User registered successfully" });

		const profileUrl = process.env.CLIENT_URL + "/profile/" + user.username;

		try {
			await sendWelcomeEmail(user.email, user.name, profileUrl);
		} catch (emailError) {
			console.error("Error sending welcome Email", emailError);
		}
	} catch (error) {
		console.log("Error in signup: ", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const login = async (req, res) => {
	
	try {
		const { username, password } = req.body;

		// Check if user exists
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Check password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		// Create and send token
		const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "3d" }); // Include role in token
		await res.cookie("jwt-linkedin", token, {
			httpOnly: false,
			maxAge: 3 * 24 * 60 * 60 * 1000,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
		});

		res.json({ message: "Logged in successfully", role: user.role }); // Include role in response
	} catch (error) {
		console.error("Error in login controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const logout = (req, res) => {
	res.clearCookie("jwt-linkedin");
	res.json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req, res) => {
	try {
	//    console.log("Current user:", req.user);
	   res.json(req.user);
	} catch (error) {
	   console.error("Error in getCurrentUser controller:", error.message);
	   res.status(500).json({ message: "Server error" });
	}
 };

export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({ message: "Email is required" });
		}

		const user = await User.findOne({ email });
		if (!user) {
			// For security reasons, we don't reveal if the email exists
			return res.status(200).json({ message: "If an account exists with this email, you will receive a password reset link" });
		}

		// Generate reset token
		const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
		
		// Create reset URL
		const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

		// Send reset email
		await sendPasswordResetEmail(user.email, user.name, resetUrl);

		res.status(200).json({ message: "If an account exists with this email, you will receive a password reset link" });
	} catch (error) {
		console.error("Error in forgotPassword:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token, newPassword } = req.body;

		if (!token || !newPassword) {
			return res.status(400).json({ message: "Token and new password are required" });
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const userId = decoded.userId;

		// Find user
		const user = await User.findById(userId);
		if (!user) {
			return res.status(400).json({ message: "Invalid or expired token" });
		}

		// Hash new password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		// Update password
		user.password = hashedPassword;
		await user.save();

		res.status(200).json({ message: "Password reset successfully" });
	} catch (error) {
		if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
			return res.status(400).json({ message: "Invalid or expired token" });
		}
		console.error("Error in resetPassword:", error);
		res.status(500).json({ message: "Server error" });
	}
};
 