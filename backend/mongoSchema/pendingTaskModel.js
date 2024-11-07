const mongoose = require("mongoose");

const pendingTaskSchema = new mongoose.Schema(
  {
    checkItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "checkitems",
    },
    line: {
      type: String,
      required: true,
    },
    processNo: {
      type: String,
      required: true,
    },
    workDetail: {
      type: String,
      required: true,
    },
    pS: {
      type: String,
      required: true,
    },
    rS: {
      type: String,
      required: true,
    },
    result: {
      type: String,
      enum: ["PENDING", "OK", "NG"],
      default: "PENDING",
    },
  checkedBy: {
    type: String,
  },
    entryDates: {
      type: [Date],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("pendingTasks", pendingTaskSchema);
