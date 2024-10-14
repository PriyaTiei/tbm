const mongoose = require("mongoose");
const { ObjectId } = require("../util/getObjectType");

const dailyStatusSchema = new mongoose.Schema({
  checkItem: {
    type: mongoose.Schema.ObjectId,
    ref: "checkitems",
    required: true,
  },
  checkedAt: {
    type: Date,
    default: Date.now,
  },
  entryFor: {
    type: String,
    required: true,
  },
  pS: {
    type: String,
    required: true,
  },
  result: {
    type: String,
    required: [true, "please enter the result judgement"],
  },
  remarks: {
    type: String,
  },
  value: {
    type: String,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "users",
    required: true,
  },
  tl: {
    type: Boolean,
    default: false,
  },
  gl: {
    type: Boolean,
    default: false,
  },
  tlBy: {
    type: ObjectId,
    default: null
  },
  glBy: {
    type: ObjectId,
    default: null
  },
  tlAt: {
    type: Date,
    default: null
  },
  glAt: {
    type: Date,
    default: null
  },
  tlComment: {
    type: String,
    default: null
  },
  glComment: {
    type: String,
    default: null
  },
  checkedBy: {
    type: String,
  },
  m_spec: [
    {
      m_id: { type: String,},
      m_lable: { type: String},
      m_unit: { type: String},
      m_value:{ type: Number},
      m_criteria: { type: String} 
    }
  ],
});

module.exports = mongoose.model("dailystatus", dailyStatusSchema);
