const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const tasksRouter = require("./routes/tasks");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

//  Connect MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

app.use("/tasks", tasksRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
