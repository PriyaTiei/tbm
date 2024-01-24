const { default: mongoose } = require("mongoose");
const { getWeekDates } = require("./getISODate");

class ApiFeatureSom {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  search() {
    const keyword = this.queryStr.Line
      ? { Line: {
            $regex: this.queryStr.Line,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });
    
    return this;
  }
  filter() {
    let newQueryStr = { ...this.queryStr };
    const removeItems = ["Line", "page", "limit"];
    removeItems.forEach((item) => delete newQueryStr[item]);

    newQueryStr = newQueryStr.w
      ? { ...newQueryStr, w: { $in: [9999, Number(newQueryStr.w)] } }
      : { ...newQueryStr };

    newQueryStr = newQueryStr.m
      ? { ...newQueryStr, m: { $in: [9999, Number(newQueryStr.m)] } }
      : { ...newQueryStr };

    newQueryStr = newQueryStr.y
      ? { ...newQueryStr, y: { $in: [9999, Number(newQueryStr.y)] } }
      : { ...newQueryStr };

    this.query = this.query.find(newQueryStr);
    this.newQueryStr = { ...newQueryStr };
    return this;
  }
  match() {
    let newQueryStr = { ...this.queryStr };
    console.log(newQueryStr.itemId);
    const dates = getWeekDates(newQueryStr.dt,newQueryStr.m,newQueryStr.y);
    console.log("dates",dates);
    this.query = this.query.find({
      checkItem:newQueryStr.itemId,
      entryFor: { 
        $in: dates
       },
    });
    return this;
  }
  pagination(docPerPage) {
    let page = this.queryStr.page || 1;
    const skip = docPerPage * (page - 1);
    this.query = this.query.find().skip(skip).limit(docPerPage);
    return this;
  }
}


module.exports = ApiFeatureSom;
