const catchAsyncError = require("../middleware/catchAsyncError");

const AbnormalityModel = require("../mongoSchema/abnormalityModel");

const HeadModel = require("../mongoSchema/chekItemModel");

const ApiFeatureAbnormality = require("../util/apiFeatureAbnormality");

const ErrorHandler = require("../util/errorHandling");

const { getStartDate, getEndDate } = require("../util/getISODate");

const { ObjectId } = require("../util/getObjectType");




exports.createAbnormality = catchAsyncError(async (req, res, next) => {
console.log("*******************************************",req.body,"********************************************************");
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

    beforeImage,

    afterImage,

    pS,

    m_spec

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

    beforeImage,

    afterImage,

    pS,

    m_spec

  });

  return res.status(200).json({ success: true, abnormalityItem });

});

exports.uploadAbnormalityImages = catchAsyncError(async (req, res, next) => {
  try {
    console.log("🧾 Received image upload request...");
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Missing _id in form data",
      });
    }

    const beforeImage = req.files?.beforeImage?.[0]?.filename || null;
    const afterImage = req.files?.afterImage?.[0]?.filename || null;

    if (!beforeImage && !afterImage) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded",
      });
    }

    const updateFields = {};
    if (beforeImage) updateFields.beforeImage = beforeImage;
    if (afterImage) updateFields.afterImage = afterImage;

    const updatedDoc = await AbnormalityModel.findByIdAndUpdate(
      _id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({
        success: false,
        message: "Abnormality not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image(s) uploaded successfully",
      updated: updateFields,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during image upload",
      error: error.message,
    });
  }
});








// exports.updateAbnormality = catchAsyncError(async (req, res, next) => {

//   const id = req.params.id;

//   const abnormalityItem = await AbnormalityModel.findById(id);

//   if (!abnormalityItem) {

//     return next(new ErrorHandler("cannot find this Abnormality item", 404));

//   }

//   const {

//     abnormality,

//     countermeasure,

//     targetDate,

//     spare,

//     pic,

//     status,

//     checkItem,

//     user,

//     beforeImage,

//     afterImage,

//     m_spec

//   } = req.body;




//   abnormalityItem.abnormality = abnormality;

//   abnormalityItem.countermeasure = countermeasure;

//   abnormalityItem.spare = spare;

//   abnormalityItem.targetDate = targetDate;

//   abnormalityItem.pic = pic;

//   abnormalityItem.status = status;

//   abnormalityItem.user = user;

//   abnormalityItem.checkItem = checkItem;

//   abnormalityItem.beforeImage = beforeImage;

//   abnormalityItem.afterImage = afterImage;

//   abnormalityItem.m_spec = m_spec;

//   await abnormalityItem.save({ validateBeforeSave: false });

//   return res.status(201).json({ success: true, abnormalityItem });

// });





exports.updateAbnormality = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;

  const abnormalityItem = await AbnormalityModel.findById(id);

  if (!abnormalityItem) {
    return next(new ErrorHandler("cannot find this Abnormality item", 404));
  }

  const {
    abnormality,
    countermeasure,
    targetDate,
    spare,
    pic,
    status,
    checkItem,
    user,
    beforeImage,
    afterImage,
    m_spec
  } = req.body;

  // Update basic fields
  abnormalityItem.abnormality = abnormality;
  abnormalityItem.countermeasure = countermeasure;
  abnormalityItem.spare = spare;
  abnormalityItem.targetDate = targetDate;
  abnormalityItem.pic = pic;
  abnormalityItem.status = status;
  abnormalityItem.user = user;
  abnormalityItem.checkItem = checkItem;
  abnormalityItem.m_spec = m_spec;
  abnormalityItem.updatedAt = new Date();

  // ✅ ONLY update image fields if they are actually provided
  // This prevents overwriting existing images with null/undefined
  if (beforeImage !== undefined && beforeImage !== null && beforeImage !== '') {
    abnormalityItem.beforeImage = beforeImage;
  }
  
  if (afterImage !== undefined && afterImage !== null && afterImage !== '') {
    abnormalityItem.afterImage = afterImage;
  }

  await abnormalityItem.save({ validateBeforeSave: false });
  return res.status(201).json({ success: true, abnormalityItem });
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




  const fromDate = req.params.fromDate;

  var toDate = req.params.toDate;

  var queryStr = req.query;

  var createdAt = { $gte: fromDate, $lt: toDate }

  let checkItemArray = [""]

  if (queryStr?.item){

    checkItemArray = []

    let checkItems = await HeadModel.find({

      workDetail: {

        $regex: queryStr.item,

        $options: "i"

      }

    })

    checkItems.map(item=>{

      checkItemArray.push(item._id.toString())

    })

  }




  if(queryStr.item  && !checkItemArray.length){

    return []

  }

    

  const abnormailityFeature = new ApiFeatureAbnormality(AbnormalityModel.find(), queryStr, createdAt, checkItemArray).filter()




  //test comp

  const abnormalities = await abnormailityFeature.query.find({






  })




  if (abnormalities.length === 0) {

    return next(new ErrorHandler("Abnormalities list not found", 404));

  }

  const totalAbnormalities = abnormalities.length;

  // console.log(abnormalities)

  return res.status(201).json({ success: true, totalAbnormalities, abnormalities });

});




exports.getAbnormality = catchAsyncError(async (req, res, next) => {

  const id = req.params.id;

  const abnormalityItem = await AbnormalityModel.findById(id)

    .populate("checkItem", "line method processNo")

    .populate("user", "name");

  if (!abnormalityItem) {

    return next(new ErrorHandler("cannot find this abnormalityItem", 404));

  }




  return res.status(201).json({ success: true, abnormalityItem });

});




exports.getAbnormalityByIdAndDate = catchAsyncError(async (req, res, next) => {

  const id = req.query.id;

  const date = req.query.date;

  console.log(date);

  var newQueryStr = {}




  if (id != "" && date != "") {

    newQueryStr["createdAt"] = {

      $lte:new Date(getEndDate(date)),

      $gte:new Date(getStartDate(date)),

    }

  }




  newQueryStr['checkItem']=ObjectId(id)




  console.log(newQueryStr);

  const abnormalityItem = await AbnormalityModel.findOne(newQueryStr)

  

  if (abnormalityItem==null) {

    return res.status(201).json({ success: false });

  }



  return res.status(201).json({ success: true, abnormalityItem });

});
