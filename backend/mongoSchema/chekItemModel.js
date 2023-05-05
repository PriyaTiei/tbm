const mongoose = require("mongoose");

const checkItemSchema = new mongoose.Schema({
  line: {
    type: String,
    required: [true, "please enter Line name"],
  },

  processNo: {
    type: String,
    required: [true, "please enter Process No "],
  },
  model: {
    type: String,
    required: [false, "please enter Model"],
  },
  reason: {
    type: String,
    required: [false, "please enter Reason (category)"],
  },
  workDetail: {
    type: String,
    required: [true, "please enter Work detail"],
  },
  criterion: {
    type: String,
    required: [true, "please enter Criterion"],
  },
  methodWssNo: {
    type: String,
    required: [false, "please enter Method WSS No"],
  },
  action: {
    type: String,
    required: [false, "please enter Action"],
  },
  cycle: {
    type: String,
    required: [true, "please enter Cycle"],
  },
  tool: {
    type: String,
    required: [false, "please enter Tool"],
  },
  prepManHr: {
    type: Number,
    required: [false, "please enter Prep man-hr（m)"],
  },
  workTime: {
    type: Number,
    required: [false, "please enter Work time （m/times)"],
  },
  workManpower: {
    type: Number,
    required: [false, "please enter Work manpower"],
  },
  wHr: {
    type: Number,
    required: [false, "please enter W- hr （m/times"],
  },
  pS: {
    type: String,
    required: [true, "please enter P/S"],
  },
  rS: {
    type: String,
    required: [true, "please enter R/S"],
  },
  holidayOperation: {
    type: String,
    required: [false, "please enter Holiday operation"],
  },
  entryDate: {
    type: Date,
    required: [false, "please enter Entry/Modification date"],
  },
  y: [
    {
      type: Number,
      required: [true, "please enter Year"],
    },
  ],
  m: [
    {
      type: Number,
      required: [true, "please enter Month"],
    },
  ],
  w: [
    {
      type: Number,
      required: [true, "please enter Week"],
    },
  ],
  d: [
    {
      type: Number,
      required: [true, "please enter Day"],
    },
  ],
  categoryCtrl: {
    type: String,
    required: [false, "please enter Category Ctrl"],
  },
  commonItem: {
    type: String,
    required: [false, "please enter Common Item"],
  },
  cardNo: {
    type: String,
    required: [false, "please enter Card No"],
  },
  workOnePoint: {
    type: String,
    required: [false, "please enter Work one point"],
  },
  safetyOnePoint: {
    type: String,
    required: [false, "please enter Safety one point"],
  },
  qualityOnePoint: {
    type: String,
    required: [false, "please enter Quality one point"],
  },
  remark: {
    type: String,
  },
  images: [{ type: String }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("checkitems", checkItemSchema);
