const mongoose = require("mongoose");

const pendingTaskSchema = new mongoose.Schema({
    checkItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'checkitems'
    },
    line: {
      type: String,
      required: true
    },
    processNo: {
      type: String,
      required: true
    },
    workDetail: {
      type: String,
      required: true
    },
    pS: {
      type: String,
      required: true
    },
    result: {
      type: String,
      enum: ['PENDING', 'OK', 'NG'],
      default: 'PENDING'
    }
     
        
    
  }, {
    timestamps : true
  });

module.exports = mongoose.model("pendingTasks", pendingTaskSchema);
