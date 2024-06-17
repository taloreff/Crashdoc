const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes.js");
const caseRoutes = require("./routes/caseRoutes.js");
const env = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const { OpenAI } = require("openai");
const path = require("path");
const fs = require("fs");

env.config();
const app = express();
const PORT = process.env.PORT || 3030;
const MongoDB = process.env.MongoDB;

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// MongoDB connection
console.log("MongoDB", MongoDB);
mongoose
  .connect(MongoDB)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));

// Routes
app.use("/user", userRoutes);
app.use("/case", caseRoutes);

// OpenAI Configuration
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple in-memory cache
const cache = {};

// Rate limiting variables
let lastRequestTime = Date.now();
const REQUEST_INTERVAL = 1000; // 1 request per second

// File upload configuration
const upload = multer({ dest: "uploads/" });

// Upload and process photos endpoint
app.post("/upload", async (req, res) => {
  try {
    const { imageUrl } = req.body; // assuming the client sends the image URL in the request body
    console.log("imageurl", imageUrl);

    // Check cache
    if (cache[imageUrl]) {
      console.log("Returning cached result");
      return res.json({ result: cache[imageUrl] });
    }

    // Rate limiting
    const now = Date.now();
    if (now - lastRequestTime < REQUEST_INTERVAL) {
      const waitTime = REQUEST_INTERVAL - (now - lastRequestTime);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    lastRequestTime = Date.now();

    // Process the image URL with GPT-3.5
    const response = await processImageWithGpt(imageUrl);
    console.log("response from gpt", response);

    // Cache the result
    cache[imageUrl] = response;

    res.json({ result: response });
  } catch (error) {
    console.error("Error processing image:", error);
    if (error.status === 429) {
      res
        .status(429)
        .json({ error: "Rate limit exceeded. Please try again later." });
    } else {
      res.status(500).json({ error: "Failed to process image" });
    }
  }
});

async function processImageWithGpt(imageUrl) {
  try {
    const prompt = `Assess the damage in this car image: ${imageUrl}.\nThis GPT acts as an Automobile Appraiser. When a user sends a picture of a car that has been involved in an accident, it assesses the damage using a scale of 1 to 3. The scale is as follows: 1 describes minor damage, such as light scratches or dents that can be fixed for up to $750. 2 describes medium damage, such as a bumped rear or broken windshield, costing between $750 and $1500 to repair. 3 describes a total loss, meaning the car is out of use and cannot be repaired or fixed. When an image is sent, the GPT should only reply with the number 1, 2, or 3, without any additional information or text. The GPT should always adhere strictly to this scale and provide clear, unbiased assessments based solely on the visible damage.`;

    const response = await openai.completions.create({
      model: "text-embedding-ada-002",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10,
    });

    // Log the full response for debugging
    console.log("Full response from OpenAI:", response);

    if (response && response.choices && response.choices.length > 0) {
      return response.choices[0].message.content.trim();
    } else {
      throw new Error("Unexpected response structure from OpenAI API");
    }
  } catch (error) {
    console.error("Error in GPT-3 request:", error);
    throw error;
  }
}

app.get("/", (req, res) => {
  res.send("hello!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
