const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Done"],
      default: "To Do",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      index: true,
    }
  },
  { timestamps: true }
);

taskSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model("Task", taskSchema);
