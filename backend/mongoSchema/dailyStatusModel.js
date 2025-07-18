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
   updatedAt: {
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
    type: mongoose.Schema.ObjectId,
    default: null,
    ref: "users",
    required: false,
  },
  glBy: {
    type: mongoose.Schema.ObjectId,
    default: null,
    ref: "users",
    required: false,
  },
  tlAt: {
    type: Date,
    default: null,
    required: false
  },
  glAt: {
    type: Date,
    default: null,
    required: false
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
