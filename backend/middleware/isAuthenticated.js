const jwt = require("jsonwebtoken");
const userModel = require("../mongoSchema/userModel");
const ErrorHandler = require("../util/errorHandling");
const catchAsyncError = require("./catchAsyncError");

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  const token = req.cookies?.token || req.headers?.authorization?.replace("Bearer ", "");
  if (!token) {
    return next(new ErrorHandler("Login before accessing this route", 401));
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new ErrorHandler("Invalid or expired session. Please log in again.", 401));
  }

  const user = await userModel.findById(decodedToken.id);
  if (!user) {
    return next(new ErrorHandler("User not found. Re-login to access this route", 401));
  }

  req.user = user;
  next();
});

exports.authorizedRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(
        new ErrorHandler(
          `Role (${req.user?.role || "unknown"}) is not authorized to access this resource`,
          403
        )
      );
    }
    next();
  };
};
