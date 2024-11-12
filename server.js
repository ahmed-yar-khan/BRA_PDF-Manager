require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require("express");
const mongoose = require("mongoose");
const path = require("path"); // Import path module (ensure this line is at the top)
const cors = require("cors");

const businessRoutes = require("./routes/business"); // Import other modules
const connectDB = require("./dbConfig/db"); // Assuming this is the path to your dbConfig
5
const app = express();
const PORT = process.env.PORT ;

// Setup CORS with specific allowed origins
const allowedOrigins = ["http://127.0.0.1:5500", "https://b.ebra.com.pk",  "http://localhost:3000"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "client/build")));

// Database Connection
connectDB();

// Routes
app.use("/api/businesses", businessRoutes);

// Serve React app in production
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
