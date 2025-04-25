import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    authorName: {
      type: String,
      required: true,
      default: "Anonymous",
    },
    tags: [{
      type: String,
      trim: true,
    }],
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    answers: [{
      content: {
        type: String,
        required: true,
      },
      image: {
        type: String,
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      authorName: {
        type: String,
        required: true,
        default: "Anonymous",
      },
      upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }],
      downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }],
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    views: {
      type: Number,
      default: 0,
    },
    isSolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search functionality
discussionSchema.index({ title: "text", content: "text", tags: "text" });

const Discussion = mongoose.model("Discussion", discussionSchema);

export default Discussion; 