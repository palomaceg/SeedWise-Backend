const mongoose = require("mongoose");

const MentoringSessionSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mentoring",
      required: true,
    },
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "startup",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0.5,
      max: 8,
    },
    topic: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
    },
    mentorSigned: {
      signed: { type: Boolean, default: false },
      timestamp: { type: Date },
    },
    startupSigned: {
      signed: { type: Boolean, default: false },
      timestamp: { type: Date },
    },
    status: {
      type: String,
      enum: ["pending", "signed", "conflict"],
      default: "pending",
    },
    comments: [String],

    pdfUrl: {
      type: String,
    },
  },

  {
    timestamps: true,
    collection: "mentoring_sessions",
  }
);

const mentoringSession = mongoose.model("MentoringSession", MentoringSessionSchema);
module.exports = mentoringSession;
