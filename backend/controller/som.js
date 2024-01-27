const catchAsyncError = require("../middleware/catchAsyncError");
const CheckItemsModel = require("../mongoSchema/chekItemModel");
const DailyStatusModel = require("../mongoSchema/dailyStatusModel");
const ApiFeatureSom = require("../util/apiFeatureSom");

exports.getSomAll = catchAsyncError(async (req, res, next) => {
    const items = new ApiFeatureSom(CheckItemsModel, req.query)
    .search()
    .filter()
    // .pagination(1);
    const itemsList = await items.query;

    res
        .status(201)
        .json({ success: true, itemsList });
});

exports.getSomStats = catchAsyncError(async (req, res, next) => {

    const items = new ApiFeatureSom(DailyStatusModel, req.query)
    .match()   
    // .pagination(1);
    const itemsList = await items.query;

    const datesList = {
        monday:"NA",
        tuesday:"NA",
        wednesday:"NA",
        thursday:"NA",
        friday:"NA"
    }

    itemsList.forEach((item) => {
        const date = new Date(item.entryFor);
        const day = date.getDay();
        switch (day) {
            case 1:
                datesList.monday = item.result;
                break;
            case 2:
                datesList.tuesday = item.result;
                break;
            case 3:
                datesList.wednesday = item.result;
                break;
            case 4:
                datesList.thursday = item.result;
                break;
            case 5:
                datesList.friday = item.result;
                break;
            default:
                break;
        }
    })

    res
        .status(201)
        .json({ success: true, datesList });
})