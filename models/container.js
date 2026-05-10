const mongoose = require("mongoose");

const containerSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    containerId: {
      type: String,
      required: true,
      unique: true,
    },

    containerName: {
      type: String,
      required: true,
      unique: true, 
    },

    internalPort: {
      type: Number,
      default: 3000,
    },

    status: {
      type: String,
      enum: ["running", "stopped", "failed", "starting"],
      default: "starting",
    },


    lastStartedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);