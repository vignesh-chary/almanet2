import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Your existing protectRoute middleware (unchanged)
export const protectRoute = async (req, res, next) => {
	try {
		const token = req.cookies["jwt-linkedin"];

		if (!token) {
			return res.status(401).json({ message: "Unauthorized - No Token Provided" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) {
			return res.status(401).json({ message: "Unauthorized - Invalid Token" });
		}

		const user = await User.findById(decoded.userId).select("-password");

		if (!user) {
			return res.status(401).json({ message: "User not found" });
		}

		req.user = user;
		next();
	} catch (error) {
		console.log("Error in protectRoute middleware:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
};

// Add this new authorize middleware
export const authorize = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				message: `Forbidden - Requires one of these roles: ${roles.join(', ')}`
			});
		}
		next();
	};
};

export const protect = async (req, res, next) => {
	try {
		// Get token from header
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({
				message: "Not authorized, no token",
			});
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Get user from token
		const user = await User.findById(decoded.id).select("-password");

		if (!user) {
			return res.status(401).json({
				message: "Not authorized, user not found",
			});
		}

		// Add user to request object
		req.user = user;
		next();
	} catch (error) {
		return res.status(401).json({
			message: "Not authorized, token failed",
		});
	}
};