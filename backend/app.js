// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");

// const error = require("./middleware/error");
// const userRouter = require("./Router/userRouter");
// const cookieParser = require("cookie-parser");
// const headRouter = require("./Router/headRouter");
// const dailyStatusRouter = require("./Router/dailyStatusRouter");
// const cardRouter = require("./Router/cardRouter");
// const abnormalityRouter = require("./Router/abnormalityRouter");
// const pendingRouter = require("./Router/pendingTaskRouter");
// const holidayCalendarRouter = require("./Router/holidayCalendarRouter");
// const reportsRouter = require('./Router/reportsRouter');

// const urlencodedBodyParser = bodyParser.urlencoded({ extended: false });

// const app = express(); 

// app.use(express.json());
// app.use(cookieParser());
// app.use(urlencodedBodyParser);
// app.use(cors());
// app.use("/assets", express.static(__dirname + "/public/"));

// app.use("/user", userRouter);
// app.use("/head", headRouter);
// app.use("/dailyStatus", dailyStatusRouter);
// app.use("/card", cardRouter);
// app.use("/abnormality", abnormalityRouter);
// app.use("/pendingTasks", pendingRouter);
// app.use("/holidays", holidayCalendarRouter);
// app.use('/reports', reportsRouter);

// app.use(error);
// module.exports = app;

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const error = require("./middleware/error");
const userRouter = require("./Router/userRouter");
const headRouter = require("./Router/headRouter");
const dailyStatusRouter = require("./Router/dailyStatusRouter");
const cardRouter = require("./Router/cardRouter");
const abnormalityRouter = require("./Router/abnormalityRouter");
const pendingRouter = require("./Router/pendingTaskRouter");
const holidayCalendarRouter = require("./Router/holidayCalendarRouter");
const reportsRouter = require("./Router/reportsRouter");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// ✅ Serve static files from "public" folder
app.use("/assets", express.static(path.join(__dirname, "public")));

app.use("/user", userRouter);
app.use("/head", headRouter);
app.use("/dailyStatus", dailyStatusRouter);
app.use("/card", cardRouter);
app.use("/abnormality", abnormalityRouter);
app.use("/pendingTasks", pendingRouter);
app.use("/holidays", holidayCalendarRouter);
app.use("/reports", reportsRouter);

app.use(error);

module.exports = app; // ✅ Make sure you're exporting the app
