require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const crypto = require("crypto");
const connectDB = require('./config/db')
const app = express();
const Githubrouter = require('./routes/OauthRoutes')
const gitApirouter=require('./routes/githubapi')


app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

app.use(
  "/webhook/github",
  express.raw({ type: "application/json" }),
  require("./routes/webhook")
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB()
app.get("/", (req, res) => {
  res.status(200).json({
    status: "Server running ",
  });
});



app.use('/auth/github',Githubrouter)
app.use('/api',gitApirouter)

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