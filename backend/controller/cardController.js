const catchAsyncError = require("../middleware/catchAsyncError");
const CardRaisedModel = require("../mongoSchema/cardRaisedModel");
const ApiFeatureCard = require("../util/apiFeatureCard");
const ErrorHandler = require("../util/errorHandling");
const HeadModel = require("../mongoSchema/chekItemModel");

exports.createCard = catchAsyncError(async (req, res, next) => {
  const {
    cardType,
    abnormality,
    checkItem,
    user,
    line,
    processNo,
    status,
    image,
    pS,
    abnormalityId,
    dailyStatusId
  } = req.body;
  const card = await CardRaisedModel.create({
    cardType,
    abnormality,
    checkItem,
    user,
    line,
    processNo,
    status,
    image,
    pS,
    abnormalityId,
    dailyStatusId
  });
  return res.status(200).json({ success: true, card });
});

exports.updateCard = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const card = await CardRaisedModel.findById(id);
  if (!card) {
    return next(new ErrorHandler("cannot find this card", 404));
  }

  const {
    cardType,
    abnormality,
    status,
    checkItem,
    user,
    line,
    processNo,
    image,
  } = req.body;
  card.cardType = cardType;
  (card.abnormality = abnormality), (card.status = status);
  card.user = user;
  card.checkItem = checkItem;
  card.line = line;
  card.processNo = processNo;
  card.image = image;

  await card.save({ validateBeforeSave: false });
  return res.status(201).json({ success: true, card });
});

exports.deleteCard = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const card = await CardRaisedModel.findById(id);
  if (!card) {
    return next(new ErrorHandler("cannot find this card", 404));
  }

  await card.remove();
  return res.status(201).json({ success: true, message: "deleted Card successfully" });
});

exports.getCardAll = catchAsyncError(async (req, res, next) => {
  const fromDate = req.params.fromDate;
  const toDate = req.params.toDate;
  console.log("getCardAll Function clicked");
  const queryStr = req.query;
  const createdAt = { $gte: fromDate, $lt: toDate };

  let checkItemArray = [""];
  if (queryStr?.item) {
    checkItemArray = [];
    const checkItems = await HeadModel.find({
      workDetail: {
        $regex: queryStr.item,
        $options: "i"
      }
    });
    checkItemArray = checkItems.map(item => item._id.toString());
  }

  if (queryStr.item && !checkItemArray.length) {
    return res.status(200).json({ success: true, totalCards: 0, cards: [] });
  }

  const cardFeature = new ApiFeatureCard(
    CardRaisedModel.find(),
    queryStr,
    createdAt,
    checkItemArray
  ).filter();

  // Test comp
  var cards = await cardFeature.query.find({});

  cards.forEach((item, i) => {

    // Check and update abnormalityId
    if (!item.abnormalityId) {
      let plainItem = item.toObject();
      plainItem.abnormalityId = { id: "", m_spec: [] };
      cards[i] = plainItem;
    }

    // Check and update dailyStatusId
    if (!item.dailyStatusId) {
      let plainItem = cards[i].toObject ? cards[i].toObject() : item.toObject();
      plainItem.dailyStatusId = { id: "", status: "" };
      cards[i] = plainItem;
    }
  });


  if (cards.length === 0) {
    return next(new ErrorHandler("Cards not found", 404));
  }

  // Ensure every card has an abnormalityId


  const totalCards = cards.length;
  return res.status(200).json({ success: true, totalCards, cards });
});


exports.getCard = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const card = await CardRaisedModel.findById(id)
    .populate("checkItem", "line workDetail processNo")
    .populate("user", "name");

  if (!card) {
    return next(new ErrorHandler("cannot find this card", 404));
  }

  return res.status(201).json({ success: true, card });
});
