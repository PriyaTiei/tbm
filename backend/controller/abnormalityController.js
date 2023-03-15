const catchAsyncError = require("../middleware/catchAsyncError");
const AbnormalityModel = require("../mongoSchema/abnormalityModel");
const ErrorHandler = require("../util/errorHandling");



exports.createAbnormality = catchAsyncError(async (req, res, next) => {

  const {
    checkItem,
    abnormality,
    countermeasure,
    targetDate,
    pic,
    line,
    processNo,
    spare,
    status,
    user,
    image
  } = req.body;
  const abnormalityItem = await AbnormalityModel.create({
    checkItem,
    abnormality,
    countermeasure,
    targetDate,
    pic,
    // user: req.user._id,
    user,
    line,
    processNo,
    spare,
    status,
    image
  });
  res.status(200).json({ success: true, abnormalityItem });
});

exports.uploadAbnormalityImage = catchAsyncError(async (req, res, next) => {
  const { _id } = req.body;
  console.log("Id is :", _id);
  // save in mongo db

  AbnormalityModel.findByIdAndUpdate(
    _id,
    {
      images: [req.file.filename],
    },
    (err, doc) => {
      if (err) {
        console.log("err ", err);
        res.status(400).json({
          success: false,
          message: "image upload Failed",
        });
      } else {
        res.status(200).json({
          success: true,
          message: "image uploaded successfully",
          file: req.file,
        });
      }
    }
  );
});

exports.updateAbnormality = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const abnormalityItem = await AbnormalityModel.findById(id);
  if (!abnormalityItem) {
    return next(new ErrorHandler("cannot find this Abnormality item", 404));
  }

  const { abnormality, countermeasure, targetDate, spare,pic, status, checkItem , user, image} =
    req.body;
    
  abnormalityItem.abnormality = abnormality;
  abnormalityItem.countermeasure = countermeasure;
  abnormalityItem.spare= spare;
  abnormalityItem.targetDate = targetDate;
  abnormalityItem.pic = pic;
  abnormalityItem.status = status;
  abnormalityItem.user = user;
  abnormalityItem.checkItem = checkItem;
  abnormalityItem.image =image;
  await abnormalityItem.save({ validateBeforeSave: false });
  res.status(201).json({ success: true, abnormalityItem });
});

exports.deleteAbnormality = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const abnormalityItem = await AbnormalityModel.findById(id);
  if (!abnormalityItem) {
    return next(new ErrorHandler("cannot find this abnormalityItem", 404));
  }

  await abnormalityItem.remove();
  res
    .status(201)
    .json({ success: true, message: "deleted Abnormality Item successfully" });
});

exports.getAbnormalityAll = catchAsyncError(async (req, res, next) => {
  //test
  
  const fromDate=req.params.fromDate
  var toDate = req.params.toDate
  

 //test comp
  const abnormalities = await AbnormalityModel.find({createdAt:{$gte:fromDate, $lt:toDate}})
    .populate("user", "name")
    .populate("checkItem", "workDetail")
    .sort({createdAt:-1});
  if (abnormalities.length === 0) {
    return next(new ErrorHandler("Abnormalities list not found", 404));
  }
  const totalAbnormalities = abnormalities.length;
  res.status(201).json({ success: true, totalAbnormalities, abnormalities });
});

exports.getAbnormality = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const abnormalityItem = await AbnormalityModel.findById(id)
    .populate("checkItem", "line method processNo")
    .populate("user", "name");
  if (!abnormalityItem) {
    return next(new ErrorHandler("cannot find this abnormalityItem", 404));
  }

  res.status(201).json({ success: true, abnormalityItem });
});
