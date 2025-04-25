import Discussion from "../models/discussion.model.js";
import { handleError } from "../utils/errorHandler.js";
import cloudinary from "../lib/cloudinary.js";
import { Readable } from 'stream';

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'discussions',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const stream = Readable.from(file.buffer);
    stream.pipe(uploadStream);
  });
};

export const createDiscussion = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    const { title, content, tags, authorName } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const discussionData = {
      title,
      content,
      author: req.user?._id || null,
      authorName: authorName || "Anonymous",
      tags: tags ? JSON.parse(tags) : [],
    };

    if (req.file) {
      try {
        console.log("Uploading file to Cloudinary...");
        const result = await uploadToCloudinary(req.file);
        console.log("Cloudinary upload result:", result);
        discussionData.image = result.secure_url;
        console.log("Updated discussionData:", discussionData);
      } catch (uploadError) {
        console.error("Error uploading to Cloudinary:", uploadError);
        return res.status(500).json({ message: "Error uploading media" });
      }
    }

    console.log("Final discussion data before creation:", discussionData);
    const discussion = await Discussion.create(discussionData);
    console.log("Created discussion:", discussion);
    res.status(201).json(discussion);
  } catch (error) {
    console.error("Error creating discussion:", error);
    handleError(res, error);
  }
};

export const getDiscussions = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc", search, tag } = req.query;
    
    const query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (tag) {
      query.tags = tag;
    }

    console.log("Fetching discussions with query:", query);

    const discussions = await Discussion.find(query)
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: 'author',
        select: 'name profilePicture',
        model: 'User'
      })
      .populate({
        path: 'answers.author',
        select: 'name profilePicture',
        model: 'User'
      });

    console.log("Fetched discussions with populated authors:", discussions.map(d => ({
      id: d._id,
      author: d.author,
      authorName: d.authorName
    })));

    const total = await Discussion.countDocuments(query);

    res.json({
      discussions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching discussions:", error);
    handleError(res, error);
  }
};

export const getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate("author", "name profilePicture")
      .populate("answers.author", "name profilePicture");

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    // Increment views
    discussion.views += 1;
    await discussion.save();

    res.json(discussion);
  } catch (error) {
    handleError(res, error);
  }
};

export const addAnswer = async (req, res) => {
  try {
    const { content, authorName } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const answerData = {
      content,
      author: req.user?._id || null,
      authorName: authorName || "Anonymous",
    };

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file);
        answerData.image = result.secure_url;
      } catch (uploadError) {
        console.error("Error uploading to Cloudinary:", uploadError);
        return res.status(500).json({ message: "Error uploading media" });
      }
    }

    discussion.answers.push(answerData);
    await discussion.save();
    res.json(discussion);
  } catch (error) {
    handleError(res, error);
  }
};

export const voteDiscussion = async (req, res) => {
  try {
    const { type } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const userId = req.user._id;
    const upvotes = discussion.upvotes.map(id => id.toString());
    const downvotes = discussion.downvotes.map(id => id.toString());

    if (type === "upvote") {
      if (upvotes.includes(userId.toString())) {
        discussion.upvotes = discussion.upvotes.filter(id => id.toString() !== userId.toString());
      } else {
        discussion.upvotes.push(userId);
        discussion.downvotes = discussion.downvotes.filter(id => id.toString() !== userId.toString());
      }
    } else if (type === "downvote") {
      if (downvotes.includes(userId.toString())) {
        discussion.downvotes = discussion.downvotes.filter(id => id.toString() !== userId.toString());
      } else {
        discussion.downvotes.push(userId);
        discussion.upvotes = discussion.upvotes.filter(id => id.toString() !== userId.toString());
      }
    }

    await discussion.save();
    res.json(discussion);
  } catch (error) {
    handleError(res, error);
  }
};

export const voteAnswer = async (req, res) => {
  try {
    const { type } = req.body;
    const { discussionId, answerId } = req.params;
    const discussion = await Discussion.findById(discussionId);

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const answer = discussion.answers.id(answerId);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const userId = req.user._id;
    const upvotes = answer.upvotes.map(id => id.toString());
    const downvotes = answer.downvotes.map(id => id.toString());

    if (type === "upvote") {
      if (upvotes.includes(userId.toString())) {
        answer.upvotes = answer.upvotes.filter(id => id.toString() !== userId.toString());
      } else {
        answer.upvotes.push(userId);
        answer.downvotes = answer.downvotes.filter(id => id.toString() !== userId.toString());
      }
    } else if (type === "downvote") {
      if (downvotes.includes(userId.toString())) {
        answer.downvotes = answer.downvotes.filter(id => id.toString() !== userId.toString());
      } else {
        answer.downvotes.push(userId);
        answer.upvotes = answer.upvotes.filter(id => id.toString() !== userId.toString());
      }
    }

    await discussion.save();
    res.json(discussion);
  } catch (error) {
    handleError(res, error);
  }
};

export const markAsSolved = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    if (discussion.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the author can mark as solved" });
    }

    discussion.isSolved = true;
    await discussion.save();

    res.json(discussion);
  } catch (error) {
    handleError(res, error);
  }
}; 