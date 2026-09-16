class ApiFeatureHead {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
    this.newQueryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.dept
      ? {
        pS: {
          $regex: this.queryStr.dept,
          $options: "i",
        },
      }
      : {};

    this.query = this.query.find({ ...keyword });
    this.newQueryStr = { ...keyword };

    return this;
  }
  filter() {
    let newQueryStr = { ...this.queryStr };
    const removeItems = ["dept", "page", "limit"];
    removeItems.forEach((item) => delete newQueryStr[item]);

    newQueryStr = newQueryStr.d
      ? { ...newQueryStr, d: { $in: [9999, Number(newQueryStr.d)] } }
      : { ...newQueryStr };

    newQueryStr = newQueryStr.w
      ? { ...newQueryStr, w: { $in: [9999, Number(newQueryStr.w)] } }
      : { ...newQueryStr };

    newQueryStr = newQueryStr.m
      ? { ...newQueryStr, m: { $in: [9999, Number(newQueryStr.m)] } }
      : { ...newQueryStr };

    newQueryStr = newQueryStr.y
      ? { ...newQueryStr, y: { $in: [9999, Number(newQueryStr.y)] } }
      : { ...newQueryStr };

    if (newQueryStr.line) {
      const lineLower = String(newQueryStr.line).toLowerCase().trim();
      if (lineLower === "assembly" || lineLower === "all assembly") {
        newQueryStr.line = { $regex: "assembly", $options: "i" };
      } else if (lineLower === "machining" || lineLower === "all machining") {
        newQueryStr.line = { $regex: "block|crank|head|cam", $options: "i" };
      }
    }

    if (!newQueryStr.hasOwnProperty("isDeleted") && !newQueryStr.$or) {
      newQueryStr.$or = [
        { isDeleted: { $exists: false } },
        { isDeleted: false },
      ];
    }

    this.query = this.query.find(newQueryStr);
    this.newQueryStr = { ...newQueryStr };
    return this;
  }
  pagination(docPerPage) {
    let page = this.queryStr.page || 1;
    const skip = docPerPage * (page - 1);
    this.query = this.query.find().skip(skip).limit(docPerPage);
    return this;
  }

  match() {
    let newQueryStr = { ...this.queryStr };
    const removeItems = ["dept", "page", "limit"];
    removeItems.forEach((item) => delete newQueryStr[item]);
    console.log(newQueryStr);

    newQueryStr = newQueryStr.d
      ? { ...newQueryStr, d: { $in: [9999, Number(newQueryStr.d)] } }
      : { ...newQueryStr };

    newQueryStr = newQueryStr.w
      ? { ...newQueryStr, w: { $in: [9999, Number(newQueryStr.w)] } }
      : { ...newQueryStr };

    newQueryStr = newQueryStr.m
      ? { ...newQueryStr, m: { $in: [9999, Number(newQueryStr.m)] } }
      : { ...newQueryStr };

    newQueryStr = newQueryStr.y
      ? { ...newQueryStr, y: { $in: [9999, Number(newQueryStr.y)] } }
      : { ...newQueryStr };



    // The below line of code is to search cards based on OP number
    const keyword1 = this.newQueryStr.processNo
      ? {
        processNo: {
          $regex: this.newQueryStr.processNo,
          $options: "i",
        },
      }
      : {};
    // The below line of code is to search cards based on card number
    const keyword2 = this.newQueryStr.cardNo
      ? {
        cardNo: {
          $regex: this.newQueryStr.cardNo,
          $options: "i",
        },
      }
      : {};

    // Updating the search query with revised filter parameters
    newQueryStr = { ...newQueryStr, ...keyword1, ...keyword2 };

    if (newQueryStr.line) {
      const lineLower = String(newQueryStr.line).toLowerCase().trim();
      if (lineLower === "assembly" || lineLower === "all assembly") {
        newQueryStr.line = { $regex: "assembly", $options: "i" };
      } else if (lineLower === "machining" || lineLower === "all machining") {
        newQueryStr.line = { $regex: "block|crank|head|cam", $options: "i" };
      }
    }

    if (!newQueryStr.hasOwnProperty("isDeleted") && !newQueryStr.$or) {
      newQueryStr.$or = [
        { isDeleted: { $exists: false } },
        { isDeleted: false },
      ];
    }

    this.newQueryStr = { ...newQueryStr };

    //    console.log(this.newQueryStr);

    this.query = this.query.aggregate([
      { $match: newQueryStr },
      {
        $group: {
          _id: { line: "$line" },
          processList: { $push: "$processNo" },
          // itemCount: { $sum: 1 },
        },
      },
    ]);
    //    console.log(this.query);
    console.log("this.newQueryStr", this.newQueryStr)
    return this;
  }
}

module.exports = ApiFeatureHead;
