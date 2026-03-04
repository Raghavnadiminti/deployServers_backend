const express = require("express");
const crypto = require("crypto");
const Project = require("../models/project");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const signature = req.headers["x-hub-signature-256"];
    const event = req.headers["x-github-event"];

    if (!signature) {
      return res.status(400).send("No signature");
    }

    const payloadRaw = req.body;
    const payload = JSON.parse(payloadRaw.toString());

    const repoFullName = payload.repository.full_name;

 
    const project = await Project.findOne({ repoFullName });

    if (!project) {
      return res.status(404).send("Project not found");
    }

    const hmac = crypto.createHmac(
      "sha256",
      project.webhookSecret
    );

    const digest =
      "sha256=" + hmac.update(payloadRaw).digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );

    if (!isValid) {
      return res.status(401).send("Invalid signature");
    }

    console.log("📦 GitHub Event:", event);

    
    if (event === "push") {
      const branch = payload.ref.split("/").pop();
      const commit = payload.after;

      console.log("Deploy Triggered");
      console.log("Repo:", repoFullName);
      console.log("Branch:", branch);
      console.log("Commit:", commit);

      project.lastDeployedCommit = commit;
      await project.save();
       
    }

    res.status(200).send("Webhook received");
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).send("Webhook failed");
  }
});

module.exports = router;