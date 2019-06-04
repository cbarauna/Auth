const mongoose = require("../../database");
const bcrypt = require("bcryptjs");
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  completed: {
    type: Boolean,
    required: true,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TaskSchema = mongoose.model("Task", ProjectSchema);

module.exports = TaskSchema;
