const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    repoId: {
      type: Number,
      required: true,
    },

    repoName: {
      type: String,
      required: true,
    },

    
    repoFullName: {
      type: String,
      required: true,
      unique: true,
    },

    defaultBranch: {
      type: String,
      default: "main",
    },

    webhookId: {
      type: Number,
      required: true,
    },

    webhookSecret: {
      type: String,
      required: true,
    },

    lastDeployedCommit: {
      type: String,
    },
 status:{
      type: String,
      enum: ["running", "stopped", "failed", "starting"],
      default: "starting",
    },
    url:{
      type:String,
      default:null
    }
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);