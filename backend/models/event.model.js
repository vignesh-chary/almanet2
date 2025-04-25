import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const speakerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  image: { type: String },
});

const agendaItemSchema = new mongoose.Schema({
  time: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
});

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    detailedDescription: { type: String },
    bannerImg: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    endTime: { type: String },
    locationType: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      required: true
    },
    onlineLink: { type: String },
    physicalLocation: { type: String },
    category: {
      type: String,
      enum: ['Networking', 'Mentorship', 'Workshops', 'Social', 'Alumni Meetups', 'Webinars', 'Others'],
      required: true
    },
    speakers: [speakerSchema],
    agenda: [agendaItemSchema],
    participants: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      registrationDate: { type: Date, default: Date.now }
    }],
    comments: [commentSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ['published', 'cancelled'],
      default: 'published'
    },
  },
  { timestamps: true }
);

eventSchema.plugin(mongoosePaginate);

const Event = mongoose.model("Event", eventSchema);
export default Event;