require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");

const app = express();



app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

app.use(
  "/webhook/github",
  express.raw({ type: "application/json" })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.status(200).json({
    status: "Server running 🚀",
  });
});



app.get("/auth/github", (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`;

  res.redirect(redirectUrl);
});



app.get("/auth/github/callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "No code provided" });
    }

    // Exchange code for access token
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



    res.status(200).json({
      message: "GitHub connected successfully",
      user: userData.data.login,
    });

  } catch (error) {
    console.error("OAuth Error:", error.response?.data || error.message);
    res.status(500).json({ error: "OAuth failed" });
  }
});



app.post("/webhook/github", (req, res) => {
  try {
    const signature = req.headers["x-hub-signature-256"];
    const event = req.headers["x-github-event"];

    if (!signature) {
      return res.status(400).send("No signature");
    }

    // Verify signature
    const hmac = crypto.createHmac(
      "sha256",
      process.env.GITHUB_WEBHOOK_SECRET
    );

    const digest =
      "sha256=" +
      hmac.update(req.body).digest("hex");

    if (signature !== digest) {
      return res.status(401).send("Invalid signature");
    }

    // Parse payload
    const payload = JSON.parse(req.body.toString());

    console.log("GitHub Event:", event);

    if (event === "push") {
      console.log("Push detected on repo:", payload.repository.full_name);


    }

    res.status(200).send("Webhook received ✅");

  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).send("Webhook processing failed");
  }
});



app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});




app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});