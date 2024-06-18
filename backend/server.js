const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes.js");
const caseRoutes = require("./routes/caseRoutes.js");
require("dotenv").config()
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const { OpenAI } = require("openai");
const path = require("path");
const fs = require("fs");
const { type } = require("os");

const app = express();
const PORT = process.env.PORT || 3030;
const MongoDB = process.env.MongoDB;

// MongoDB connection
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
    const { imageUrl } = req.body;
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

    // Fetch and process the image with OpenAI
    const response = await processImageWithGpt(imageUrl);

    // Cache the result
    cache[imageUrl] = response;

    res.json({ result: response });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process image" });
  }
});

async function processImageWithGpt(imageUrl) {
  try {
    let imageAsBase64;
    // Download the image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    imageAsBase64 = Buffer.from(response.data, 'binary').toString('base64');
    const prompt = `This GPT acts as an Automobile Appraiser. When a user sends a picture of a car that has been involved in an accident, it assesses the damage using a scale of 1 to 3. The scale is as follows: 1 describes minor damage, such as light scratches or dents that can be fixed for up to $750. 2 describes medium damage, such as a bumped rear or broken windshield, costing between $750 and $1500 to repair. 3 describes a total loss, meaning the car is out of use and cannot be repaired or fixed. When an image is sent, the GPT should only reply with the number 1, 2, or 3, without any additional information or text. The GPT should always adhere strictly to this scale and provide clear, unbiased assessments based solely on the visible damage.`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o", // Ensure you use the right model
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url", image_url: {
              url: `data:image/jpeg;base64,${imageAsBase64}`
            }
          },
        ]
      }
      ],
    })


    // Log the full response for debugging
    console.log("Full response from OpenAI:", aiResponse);

    if (aiResponse && aiResponse.choices && aiResponse.choices.length > 0) {
      return aiResponse.choices[0].message.content.trim();
    } else {
      throw new Error("Unexpected response structure from OpenAI API");
    }
  } catch (error) {
    console.error("Error in GPT-4 request:", error);
    throw error;
  }
}

app.get("/", (req, res) => {
  res.send("hello!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
