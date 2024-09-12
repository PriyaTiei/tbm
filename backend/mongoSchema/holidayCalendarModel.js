const mongoose = require("mongoose");

const holidayCalendarSchema = new mongoose.Schema({

    date: {
        type: Date,
        unique: true,
        required: [true, "please specify the date in YYYY/MM/DD format (as a String)"],
    },

    reason: {
        type: String,
        required: [true, "please Enter reason for the holiday"],
    },

    adhoc: {
        type: Boolean,
        default: false
    },
    
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "users",
        required: true,
      },
    
    createdAt: {
        type: Date,
        default: Date.now,
    },
    
    deleted: {
        type: Boolean,
        default: false
    },
});

module.exports = mongoose.model("holidayCalendar", holidayCalendarSchema);
