

const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const Githubrouter = express.Router();



Githubrouter.get("/", (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`;

  res.redirect(redirectUrl);
});



Githubrouter.get("/callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "No code provided" });
    }

   
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = response.data.access_token;

    if (!accessToken) {
      return res.status(400).json({ error: "Failed to get access token" });
    }

  
    const userData = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { id, login } = userData.data;

    let user = await User.findOne({ githubId: id });

    if (!user) {
      user = await User.create({
        githubId: id,
        username: login,
        accessToken,
      });
    } else {
      user.accessToken = accessToken;
      await user.save();
    }


    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

     
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("http://localhost:5173/dashboard");

  } catch (error) {
    console.error("OAuth Error:", error.response?.data || error.message);
    res.status(500).json({ error: "OAuth failed" });
  }
});

module.exports = Githubrouter;