const express = require("express");
const axios = require("axios");
const crypto = require("crypto");

const Project = require("../models/project");
const auth = require("../middlewares/auth");

const gitApirouter = express.Router();



gitApirouter.get("/repos", auth, async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.github.com/user/repos",
      {
        headers: {
          Authorization: `Bearer ${req.user.accessToken}`,
        },
      }
    );
    
    const repos = response.data.map((repo) => ({
      
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      default_branch: repo.default_branch,
    }));
      
    res.json(repos);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch repos" });
  }
});



gitApirouter.post("/projects", auth, async (req, res) => {
  try {
    const { repoFullName } = req.body;

    if (!repoFullName) {
      return res.status(400).json({ error: "Repo full name required" });
    }
    console.log("repofullname",repoFullName)
    const [owner, repo] = repoFullName.split("/");
 const repoData = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${req.user.accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    console.log("Permissions:", repoData.data.permissions);
    console.log("Owner:", repoData.data.owner.login);
 const webhookResponse = await axios.post(
  `https://api.github.com/repos/${owner}/${repo}/hooks`,
  {
    name: "web",
    active: true,
    events: ["push"],
    config: {
      url: `${process.env.BASE_URL}/webhook/github`,
      content_type: "json",
      insecure_ssl: "0",
      secret: process.env.GITHUB_WEBHOOK_SECRET,
    },
  },
  {
    headers: {
      Authorization: `Bearer ${req.user.accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  }
);

    const webhookId = webhookResponse.data.id;

   
    const project = await Project.create({
      user: req.user._id,
      repoId: id,
      repoName: name,
      repoFullName: full_name,
      defaultBranch: default_branch,
      webhookId,
      webhookSecret,
    });

    res.status(201).json({
      message: "Project created & webhook installed 🚀",
      project,
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Project creation failed" });
  }
});

module.exports ={ gitApirouter};