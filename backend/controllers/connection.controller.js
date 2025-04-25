import { sendConnectionAcceptedEmail } from "../emails/emailHandlers.js";
import ConnectionRequest from "../models/connectionRequest.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const sendConnectionRequest = async (req, res) => {
	try {
		const { userId } = req.params;
		const senderId = req.user._id;

		if (senderId.toString() === userId) {
			return res.status(400).json({ message: "You can't send a request to yourself" });
		}

		if (req.user.connections.includes(userId)) {
			return res.status(400).json({ message: "You are already connected" });
		}

		const existingRequest = await ConnectionRequest.findOne({
			sender: senderId,
			recipient: userId,
			status: "pending",
		});

		if (existingRequest) {
			return res.status(400).json({ message: "A connection request already exists" });
		}

		const newRequest = new ConnectionRequest({
			sender: senderId,
			recipient: userId,
		});

		await newRequest.save();

		res.status(201).json({ message: "Connection request sent successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error" });
	}
};

export const acceptConnectionRequest = async (req, res) => {
	try {
		const { requestId } = req.params;
		const userId = req.user._id;

		const request = await ConnectionRequest.findById(requestId)
			.populate("sender", "name email username")
			.populate("recipient", "name username");

		if (!request) {
			return res.status(404).json({ message: "Connection request not found" });
		}

		// check if the req is for the current user
		if (request.recipient._id.toString() !== userId.toString()) {
			return res.status(403).json({ message: "Not authorized to accept this request" });
		}

		if (request.status !== "pending") {
			return res.status(400).json({ message: "This request has already been processed" });
		}

		
		// Update request status and save with current timestamp
		request.status = "accepted";
		const savedRequest = await request.save();

		console.log("\n=== After Accepting Request ===");
		console.log("New status:", savedRequest.status);
		console.log("New updatedAt:", savedRequest.updatedAt);
		console.log("New createdAt:", savedRequest.createdAt);

		// if im your friend then ur also my friend ;)
		await User.findByIdAndUpdate(request.sender._id, { $addToSet: { connections: userId } });
		await User.findByIdAndUpdate(userId, { $addToSet: { connections: request.sender._id } });

		const notification = new Notification({
			recipient: request.sender._id,
			type: "connectionAccepted",
			relatedUser: userId,
		});

		await notification.save();

		res.json({ message: "Connection accepted successfully" });

		const senderEmail = request.sender.email;
		const senderName = request.sender.name;
		const recipientName = request.recipient.name;
		const profileUrl = process.env.CLIENT_URL + "/profile/" + request.recipient.username;

		try {
			await sendConnectionAcceptedEmail(senderEmail, senderName, recipientName, profileUrl);
		} catch (error) {
			console.error("Error in sendConnectionAcceptedEmail:", error);
		}
	} catch (error) {
		console.error("Error in acceptConnectionRequest controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const rejectConnectionRequest = async (req, res) => {
	try {
		const { requestId } = req.params;
		const userId = req.user._id;

		const request = await ConnectionRequest.findById(requestId);

		if (request.recipient.toString() !== userId.toString()) {
			return res.status(403).json({ message: "Not authorized to reject this request" });
		}

		if (request.status !== "pending") {
			return res.status(400).json({ message: "This request has already been processed" });
		}

		request.status = "rejected";
		await request.save();

		res.json({ message: "Connection request rejected" });
	} catch (error) {
		console.error("Error in rejectConnectionRequest controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getConnectionRequests = async (req, res) => {
	try {
		const userId = req.user._id;

		const requests = await ConnectionRequest.find({ recipient: userId, status: "pending" }).populate(
			"sender",
			"name username profilePicture headline connections"
		);

		res.json(requests);
	} catch (error) {
		console.error("Error in getConnectionRequests controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getUserConnections = async (req, res) => {
	try {
		const userId = req.user._id;
		const { query } = req.query;

		// First get the user's connections with timestamps
		const user = await User.findById(userId).populate({
			path: "connections",
			select: "name username profilePicture headline connections updatedAt",
			options: { sort: { updatedAt: -1 } }
		});

		// Get accepted connection requests with timestamps
		const connectionRequests = await ConnectionRequest.find({
			status: "accepted",
			$or: [
				{ sender: userId },
				{ recipient: userId }
			]
		}).select("sender recipient updatedAt");

		console.log("\n=== Connection Requests ===");
		connectionRequests.forEach(req => {
			console.log(`Request: sender=${req.sender}, recipient=${req.recipient}`);
			console.log(`- Updated at: ${new Date(req.updatedAt).toISOString()}`);
		});

		// Map connection requests to connections with proper timestamps
		let connections = user.connections.map(conn => {
			const request = connectionRequests.find(req => 
				(req.sender.toString() === userId && req.recipient.toString() === conn._id.toString()) ||
				(req.recipient.toString() === userId && req.sender.toString() === conn._id.toString())
			);

			console.log(`\nMapping connection ${conn.name}:`);
			console.log(`- Connection ID: ${conn._id}`);
			console.log(`- Found request: ${request ? 'yes' : 'no'}`);
			if (request) {
				console.log(`- Request updated at: ${new Date(request.updatedAt).toISOString()}`);
			}
			console.log(`- Connection updated at: ${new Date(conn.updatedAt).toISOString()}`);

			// Always use the request's updatedAt time as it reflects when the connection was accepted
			const connectionTime = request ? request.updatedAt : conn.updatedAt;

			return {
				...conn.toObject(),
				connectedAt: connectionTime
			};
		});

		// If search query exists, filter connections
		if (query && query.trim()) {
			const searchTerms = query.toLowerCase().trim().split(/\s+/);
			connections = connections.filter(connection => {
				const name = (connection.name || '').toLowerCase();
				const username = (connection.username || '').toLowerCase();
				const headline = (connection.headline || '').toLowerCase();
				
				return searchTerms.every(term => {
					const nameMatch = name.split(/\s+/).some(word => word.startsWith(term));
					const usernameMatch = username.split(/\s+/).some(word => word.startsWith(term));
					const headlineMatch = headline.split(/\s+/).some(word => word.startsWith(term));
					return nameMatch || usernameMatch || headlineMatch;
				});
			});
		}

		// Sort connections by the actual connection timestamp (most recent first)
		connections.sort((a, b) => {
			const dateA = new Date(a.connectedAt).getTime();
			const dateB = new Date(b.connectedAt).getTime();
			return dateB - dateA;
		});

		console.log("\n=== Final Sorted Order ===");
		connections.forEach(conn => {
			console.log(`${conn.name}:`);
			console.log(`- Connected at: ${new Date(conn.connectedAt).toISOString()}`);
		});

		res.json(connections);
	} catch (error) {
		console.error("Error in getUserConnections controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const removeConnection = async (req, res) => {
	try {
		const myId = req.user._id;
		const { userId } = req.params;

		await User.findByIdAndUpdate(myId, { $pull: { connections: userId } });
		await User.findByIdAndUpdate(userId, { $pull: { connections: myId } });

		res.json({ message: "Connection removed successfully" });
	} catch (error) {
		console.error("Error in removeConnection controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getConnectionStatus = async (req, res) => {
	try {
		const targetUserId = req.params.userId;
		const currentUserId = req.user._id;

		const currentUser = req.user;
		if (currentUser.connections.includes(targetUserId)) {
			return res.json({ status: "connected" });
		}

		const pendingRequest = await ConnectionRequest.findOne({
			$or: [
				{ sender: currentUserId, recipient: targetUserId },
				{ sender: targetUserId, recipient: currentUserId },
			],
			status: "pending",
		});

		if (pendingRequest) {
			if (pendingRequest.sender.toString() === currentUserId.toString()) {
				return res.json({ status: "pending" });
			} else {
				return res.json({ status: "received", requestId: pendingRequest._id });
			}
		}

		// if no connection or pending req found
		res.json({ status: "not_connected" });
	} catch (error) {
		console.error("Error in getConnectionStatus controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// import mongoose from "mongoose";


// export const getConnectionStatus = async (req, res) => {
//     try {
//         const targetUserId = req.params.userId;
//         const currentUserId = req.user._id;

//         // Validate targetUserId
//         if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
//             return res.status(400).json({ message: "Invalid target user ID" });
//         }

//         // Check if the target user is already connected
//         const currentUser = await User.findById(currentUserId).select("connections");
//         if (currentUser.connections.includes(targetUserId)) {
//             return res.json({ status: "connected" });
//         }

//         // Check for pending connection requests
//         const pendingRequest = await ConnectionRequest.findOne({
//             $or: [
//                 { sender: currentUserId, recipient: targetUserId },
//                 { sender: targetUserId, recipient: currentUserId },
//             ],
//             status: "pending",
//         });

//         if (pendingRequest) {
//             if (pendingRequest.sender.toString() === currentUserId.toString()) {
//                 return res.json({ status: "pending" });
//             } else {
//                 return res.json({ status: "received", requestId: pendingRequest._id });
//             }
//         }

//         // If no connection or pending request is found
//         res.json({ status: "not_connected" });
//     } catch (error) {
//         console.error("Error in getConnectionStatus controller:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// };