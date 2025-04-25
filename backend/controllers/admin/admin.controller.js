import User from "../../models/user.model.js";
import Event from "../../models/event.model.js";
import Post from "../../models/post.model.js";
import Job from "../../models/job.model.js";
import Notification from "../../models/notification.model.js";
import { calculateGrowthRate } from "../../utils/stats.utils.js";
import { uploadToCloudinary } from "../../utils/cloudinary.utils.js";
import Message from "../../models/message.model.js";
import ConnectionRequest from "../../models/connectionRequest.model.js";
import Mentorship from "../../models/mentorship.model.js";
import Mentor from "../../models/mentor.model.js";
import Goal from "../../models/goal.model.js";
import Meeting from "../../models/Meeting.model.js";

export const getAdminStats = async (req, res) => {
	try {
		// Get current counts
		const [
			totalUsers,
			totalEvents,
			totalPosts,
			totalJobs,
			totalNotifications,
			activeUsers,
			newUsersThisWeek,
			newUsersLastWeek,
			newEventsThisWeek,
			newEventsLastWeek,
			newPostsThisWeek,
			newPostsLastWeek
		] = await Promise.all([
			User.countDocuments(),
			Event.countDocuments(),
			Post.countDocuments(),
			Job.countDocuments(),
			Notification.countDocuments(),
			User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
			User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
			User.countDocuments({ 
				createdAt: { 
					$gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
					$lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
				} 
			}),
			Event.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
			Event.countDocuments({ 
				createdAt: { 
					$gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
					$lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
				} 
			}),
			Post.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
			Post.countDocuments({ 
				createdAt: { 
					$gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
					$lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
				} 
			})
		]);

		// Calculate growth rates
		const userGrowthRate = calculateGrowthRate(newUsersThisWeek, newUsersLastWeek);
		const eventGrowthRate = calculateGrowthRate(newEventsThisWeek, newEventsLastWeek);
		const postGrowthRate = calculateGrowthRate(newPostsThisWeek, newPostsLastWeek);

		// Calculate platform activity (percentage of active users)
		const platformActivity = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

		res.status(200).json({
			stats: {
				users: {
					total: totalUsers,
					active: activeUsers,
					growth: userGrowthRate
				},
				events: {
					total: totalEvents,
					newThisWeek: newEventsThisWeek,
					growth: eventGrowthRate
				},
				posts: {
					total: totalPosts,
					newThisWeek: newPostsThisWeek,
					growth: postGrowthRate
				},
				jobs: {
					total: totalJobs
				},
				platform: {
					activity: platformActivity,
					notifications: totalNotifications
				}
			}
		});
	} catch (error) {
		console.error("Error fetching admin stats:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getAllUsers = async (req, res) => {
	try {
		const { page = 1, limit = 10, search = "", role = "", sortBy = "createdAt", sortOrder = "desc" } = req.query;
		
		const query = {};
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ username: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } }
			];
		}
		if (role) {
			query.role = role;
		}

		const sortOptions = {};
		sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

		const users = await User.find(query)
			.sort(sortOptions)
			.skip((page - 1) * limit)
			.limit(Number(limit))
			.select("-password");

		const totalUsers = await User.countDocuments(query);

		res.status(200).json({
			users,
			totalUsers,
			totalPages: Math.ceil(totalUsers / limit),
			currentPage: page
		});
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateUserRole = async (req, res) => {
	try {
		const { userId } = req.params;
		const { role } = req.body;

		if (!["student", "alumni", "admin"].includes(role)) {
			return res.status(400).json({ message: "Invalid role" });
		}

		const user = await User.findByIdAndUpdate(
			userId,
			{ role },
			{ new: true }
		).select("-password");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json(user);
	} catch (error) {
		console.error("Error updating user role:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const deleteUser = async (req, res) => {
	try {
		const { userId } = req.params;

		const user = await User.findByIdAndDelete(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Clean up related data
		await Promise.all([
			Post.deleteMany({ author: userId }),
			Event.deleteMany({ organizer: userId }),
			Job.deleteMany({ postedBy: userId }),
			Notification.deleteMany({ $or: [{ recipient: userId }, { relatedUser: userId }] })
		]);

		res.status(200).json({ message: "User deleted successfully" });
	} catch (error) {
		console.error("Error deleting user:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateUserDetails = async (req, res) => {
	try {
		const { userId } = req.params;
		const updateData = {};

		// Handle text fields
		if (req.body.name) updateData.name = req.body.name;
		if (req.body.username) updateData.username = req.body.username;
		if (req.body.email) updateData.email = req.body.email;
		if (req.body.location) updateData.location = req.body.location;
		if (req.body.about) updateData.about = req.body.about;
		if (req.body.headline) updateData.headline = req.body.headline;
		if (req.body.role) updateData.role = req.body.role;
		if (req.body.skills) {
			try {
				updateData.skills = JSON.parse(req.body.skills);
			} catch (error) {
				console.error("Error parsing skills:", error);
				updateData.skills = req.body.skills;
			}
		}
		if (req.body.designation) updateData.designation = req.body.designation;
		if (req.body.company) updateData.company = req.body.company;
		if (req.body.industry) updateData.industry = req.body.industry;
		if (req.body.degree) updateData.degree = req.body.degree;
		if (req.body.yearOfStudy) updateData.yearOfStudy = req.body.yearOfStudy;
		if (req.body.interests) {
			try {
				updateData.interests = JSON.parse(req.body.interests);
			} catch (error) {
				console.error("Error parsing interests:", error);
				updateData.interests = req.body.interests;
			}
		}

		// Check if username or email already exists for other users
		if (updateData.username || updateData.email) {
			const existingUser = await User.findOne({
				$or: [
					{ username: updateData.username },
					{ email: updateData.email }
				],
				_id: { $ne: userId }
			});

			if (existingUser) {
				return res.status(400).json({
					message: existingUser.username === updateData.username 
						? "Username already exists" 
						: "Email already exists"
				});
			}
		}

		// Handle file uploads
		if (req.files) {
			if (req.files.profilePicture) {
				const result = await uploadToCloudinary(req.files.profilePicture[0].buffer, "profile_pictures");
			updateData.profilePicture = result.secure_url;
		}
			if (req.files.bannerImg) {
				const result = await uploadToCloudinary(req.files.bannerImg[0].buffer, "banner_images");
			updateData.bannerImg = result.secure_url;
			}
		}

		// Update the user
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ $set: updateData },
			{ new: true, runValidators: true }
		).select("-password");

		if (!updatedUser) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json(updatedUser);
	} catch (error) {
		console.error("Error updating user details:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getUserDetails = async (req, res) => {
	try {
		const { userId } = req.params;
		
		const user = await User.findById(userId)
			.select("-password")
			.populate({
				path: "posts",
				select: "content image likes comments createdAt",
				options: { sort: { createdAt: -1 } }
			})
			.populate({
				path: "experience",
				select: "title company startDate endDate description"
			})
			.populate({
				path: "education",
				select: "school fieldOfStudy startYear endYear"
			});

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json(user);
	} catch (error) {
		console.error("Error fetching user details:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getAnalytics = async (req, res) => {
	try {
		const { timeRange = 'week', role = 'all' } = req.query;
		
		// Calculate date ranges based on timeRange
		const now = new Date();
		let startDate, activeWindow;
		switch (timeRange) {
			case 'week':
				startDate = new Date(now.setDate(now.getDate() - 7));
				activeWindow = 7 * 24 * 60 * 60 * 1000; // 7 days
				break;
			case 'month':
				startDate = new Date(now.setMonth(now.getMonth() - 1));
				activeWindow = 30 * 24 * 60 * 60 * 1000; // 30 days
				break;
			case 'quarter':
				startDate = new Date(now.setMonth(now.getMonth() - 3));
				activeWindow = 90 * 24 * 60 * 60 * 1000; // 90 days
				break;
			case 'year':
				startDate = new Date(now.setFullYear(now.getFullYear() - 1));
				activeWindow = 365 * 24 * 60 * 60 * 1000; // 365 days
				break;
			default:
				startDate = new Date(now.setDate(now.getDate() - 7));
				activeWindow = 7 * 24 * 60 * 60 * 1000;
		}

		// Build role filter
		const roleFilter = role !== 'all' ? { role } : {};

		// Get user statistics
		const [
			totalUsers,
			activeUsers,
			newUsers,
			totalStudents,
			totalAlumni
		] = await Promise.all([
			User.countDocuments(roleFilter),
			User.countDocuments({
				...roleFilter,
				lastActive: { $gte: new Date(Date.now() - activeWindow) }
			}),
			User.countDocuments({ 
				...roleFilter,
				createdAt: { $gte: startDate }
			}),
			User.countDocuments({ role: 'student' }),
			User.countDocuments({ role: 'alumni' })
		]);

		// Get connection statistics
		const [
			totalConnections,
			newConnections,
			connectionFormationGraph
		] = await Promise.all([
			ConnectionRequest.countDocuments({ status: 'accepted' }),
			ConnectionRequest.countDocuments({ 
				status: 'accepted',
				createdAt: { $gte: startDate }
			}),
			ConnectionRequest.aggregate([
				{
					$match: {
						status: 'accepted',
						createdAt: { $gte: startDate }
					}
				},
				{
					$group: {
						_id: {
							$dateToString: {
								format: "%Y-%m-%d",
								date: "$createdAt"
							}
						},
						count: { $sum: 1 }
					}
				},
				{
					$sort: { _id: 1 }
				},
				{
					$project: {
						name: "$_id",
						value: "$count",
						_id: 0
					}
				}
			])
		]);

		// Get mentorship statistics
		const [
			totalMentors,
			activeMentors,
			totalMentees,
			activeMentees,
			totalMentorships,
			newRequests,
			successfulMentorships,
			requestGraph,
			statusGraph,
			goalsStats,
			meetingsStats,
			postsStats,
			jobsStats,
			messagesStats
		] = await Promise.all([
			Mentor.countDocuments(),
			Mentorship.countDocuments({ 
				status: 'accepted',
				'mentor._id': { $exists: true }
			}),
			Mentorship.aggregate([
				{
					$match: {
						status: 'accepted',
						mentee: { $exists: true, $ne: null }
					}
				},
				{
					$group: {
						_id: '$mentee'
					}
				},
				{
					$count: 'total'
				}
			]),
			Mentorship.countDocuments({ 
				status: 'accepted',
				mentee: { $exists: true, $ne: null }
			}),
			Mentorship.countDocuments({ 
				status: { $in: ['accepted', 'completed'] }
			}),
			Mentorship.countDocuments({ 
				status: 'pending',
				requestDate: { $gte: startDate }
			}),
			Mentorship.countDocuments({ 
				$or: [
					{ status: 'completed' },
					{ 'feedback.rating': { $gte: 4 } }
				],
				requestDate: { $gte: startDate }
			}),
			Mentorship.aggregate([
				{
					$match: {
						requestDate: { $gte: startDate }
					}
				},
				{
					$group: {
						_id: {
							$dateToString: {
								format: "%Y-%m-%d",
								date: "$requestDate"
							}
						},
						count: { $sum: 1 }
					}
				},
				{
					$sort: { _id: 1 }
				},
				{
					$project: {
						name: "$_id",
						value: "$count",
						_id: 0
					}
				}
			]),
			Mentorship.aggregate([
				{
					$group: {
						_id: "$status",
						count: { $sum: 1 }
					}
				},
				{
					$project: {
						name: "$_id",
						value: "$count",
						_id: 0
					}
				}
			]),
			Goal.aggregate([
				{
					$group: {
						_id: null,
						total: { $sum: 1 },
						completed: { 
							$sum: { 
								$cond: [{ $eq: ["$completed", true] }, 1, 0] 
							} 
						},
						incomplete: { 
							$sum: { 
								$cond: [{ $eq: ["$completed", false] }, 1, 0] 
							} 
						}
					}
				}
			]),
			Meeting.aggregate([
				{
					$group: {
						_id: null,
						total: { $sum: 1 },
						upcoming: {
							$sum: {
								$cond: [
									{ $gt: ["$date", new Date().toISOString().split('T')[0]] },
									1,
									0
								]
							}
						}
					}
				}
			]),
			Post.aggregate([
				{
					$group: {
						_id: null,
						total: { $sum: 1 },
						likes: { $sum: { $size: "$likes" } },
						comments: { $sum: { $size: "$comments" } }
					}
				}
			]),
			Job.aggregate([
				{
					$group: {
						_id: null,
						total: { $sum: 1 },
						active: {
							$sum: {
								$cond: [
									{ $gt: ["$deadline", new Date()] },
									1,
									0
								]
							}
						}
					}
				}
			]),
			Message.aggregate([
				{
					$group: {
						_id: null,
						total: { $sum: 1 },
						recent: {
							$sum: {
								$cond: [
									{ $gte: ["$createdAt", new Date(Date.now() - activeWindow)] },
									1,
									0
								]
							}
						}
					}
				}
			])
		]);

		// Get previous period data for growth calculations
		const previousStartDate = new Date(startDate);
		previousStartDate.setDate(previousStartDate.getDate() - (now - startDate) / (1000 * 60 * 60 * 24));

		const [
			previousNewUsers,
			previousNewConnections,
			previousNewMentorships
		] = await Promise.all([
			User.countDocuments({ 
				...roleFilter,
				createdAt: { 
					$gte: previousStartDate,
					$lt: startDate
				}
			}),
			ConnectionRequest.countDocuments({ 
				status: 'accepted',
				createdAt: { 
					$gte: previousStartDate,
					$lt: startDate
				}
			}),
			Mentorship.countDocuments({ 
				status: 'accepted',
				requestDate: { 
					$gte: previousStartDate,
					$lt: startDate
				}
			})
		]);

		// Calculate growth rates
		const calculateGrowth = (current, previous) => {
			if (!previous) return 0;
			return ((current - previous) / previous) * 100;
		};

		const response = {
			stats: {
				users: {
					total: totalUsers,
					students: totalStudents,
					alumni: totalAlumni,
					active: activeUsers,
					activeGrowth: calculateGrowth(activeUsers, activeUsers - (newUsers - previousNewUsers)),
					newRegistrations: newUsers,
					registrationGrowth: calculateGrowth(newUsers, previousNewUsers)
				},
				connections: {
					total: totalConnections,
					new: newConnections,
					growth: calculateGrowth(newConnections, previousNewConnections),
					formationGraph: connectionFormationGraph
				},
				mentorship: {
					totalMentors,
					activeMentors,
					totalMentees: totalMentees[0]?.total || 0,
					activeMentees,
					totalMentorships,
					newRequests,
					successfulMentorships,
					successRate: totalMentorships > 0 ? 
						(successfulMentorships / totalMentorships) * 100 : 0,
					growth: calculateGrowth(successfulMentorships, previousNewMentorships),
					requestGraph,
					statusGraph
				},
				goals: {
					total: goalsStats[0]?.total || 0,
					completed: goalsStats[0]?.completed || 0,
					incomplete: goalsStats[0]?.incomplete || 0,
					completionRate: goalsStats[0]?.total ? 
						(goalsStats[0].completed / goalsStats[0].total) * 100 : 0
				},
				meetings: {
					total: meetingsStats[0]?.total || 0,
					upcoming: meetingsStats[0]?.upcoming || 0
				},
				posts: {
					total: postsStats[0]?.total || 0,
					likes: postsStats[0]?.likes || 0,
					comments: postsStats[0]?.comments || 0
				},
				jobs: {
					total: jobsStats[0]?.total || 0,
					active: jobsStats[0]?.total || 0
				},
				messages: {
					total: messagesStats[0]?.total || 0,
					recent: messagesStats[0]?.recent || 0
				}
			}
		};

		res.status(200).json(response);
	} catch (error) {
		console.error('Error in getAnalytics:', error);
		res.status(500).json({ 
			message: 'Error fetching analytics data',
			error: error.message 
		});
	}
};
