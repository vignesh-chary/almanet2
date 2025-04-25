import Post from "../../models/post.model.js";
import { uploadToCloudinary } from "../../utils/cloudinary.utils.js";

export const getAllPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        
        const query = {};
        if (search) {
            query.$or = [
                { content: { $regex: search, $options: "i" } },
                { "author.name": { $regex: search, $options: "i" } }
            ];
        }

        const posts = await Post.find(query)
            .populate("author", "name profilePicture role")
            .populate("likes", "name profilePicture")
            .populate({
                path: "comments",
                populate: {
                    path: "author",
                    select: "name profilePicture"
                }
            })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalPosts = await Post.countDocuments(query);

        res.status(200).json({
            posts,
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Delete post image from Cloudinary if exists
        if (post.image) {
            await uploadToCloudinary.destroy(post.image);
        }

        await Post.findByIdAndDelete(postId);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updatePostStatus = async (req, res) => {
    try {
        const { postId } = req.params;
        const { status } = req.body;

        if (!["active", "hidden", "reported"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const post = await Post.findByIdAndUpdate(
            postId,
            { status },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json(post);
    } catch (error) {
        console.error("Error updating post status:", error);
        res.status(500).json({ message: "Server error" });
    }
}; 