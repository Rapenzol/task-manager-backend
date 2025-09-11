const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRouter = require("./routes/auth");
const taskRouter = require('./routes/tasks');

dotenv.config();
const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());  // JSON body parse karega
app.use(express.urlencoded({ extended: true })); // ✅ Add this line

// ✅ Routes
app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);

// ✅ Test route
// app.get("/", (req, res) => res.send("API is running"));

// ✅ MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

// ✅ Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
