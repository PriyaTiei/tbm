const catchAsyncError = require("../middleware/catchAsyncError");
const CardRaisedModel = require("../mongoSchema/cardRaisedModel");
const ErrorHandler = require("../util/errorHandling");

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
  });
  res.status(200).json({ success: true, card });
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
  res.status(201).json({ success: true, card });
});

exports.deleteCard = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const card = await CardRaisedModel.findById(id);
  if (!card) {
    return next(new ErrorHandler("cannot find this card", 404));
  }

  await card.remove();
  res.status(201).json({ success: true, message: "deleted Card successfully" });
});

exports.getCardAll = catchAsyncError(async (req, res, next) => {
  const fromDate = req.params.fromDate;
  var toDate = req.params.toDate;
  // console.log(`createdAt:{$gte:${fromDate}, $lt:${toDate}}`)
  const cards = await CardRaisedModel.find({
    createdAt: { $gte: fromDate, $lt: toDate },
  })
    .populate("user", "name")
    .populate("checkItem", "line workDetail processNo")
    .sort({ createdAt: -1 });
  if (cards.length === 0) {
    return next(new ErrorHandler("Cards not found", 404));
  }
  const totalCards = cards.length;
  res.status(201).json({ success: true, totalCards, cards });
});

exports.getCard = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const card = await CardRaisedModel.findById(id)
    .populate("checkItem", "line workDetail processNo")
    .populate("user", "name");

  if (!card) {
    return next(new ErrorHandler("cannot find this card", 404));
  }

  res.status(201).json({ success: true, card });
});
