class ApiFeaturePendingTask {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
    this.newQueryStr = queryStr;
  }


 

  match() {
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

    this.newQueryStr = { ...newQueryStr };

    this.query = this.query.aggregate([
      { $match: newQueryStr },
      { $project: { _id: 1, line: 1, processNo: 1, workDetail: 1, pS: 1 } },
      { $addFields: { result: "PENDING" } },
    ]);
    return this;
  }

  

  line() {
    let newQueryStr = { ...this.queryStr }; 

    this.query = this.query.aggregate([
      { $match: newQueryStr },
      {
        $group: {
          _id:  "$line" ,
          processList: {
            $push: {
              processNo: "$processNo",
              checkItem: "$checkItem",
              result: "$result",
            },
          },
        },
      },
     
    ])
    return this;
  }
}

module.exports = ApiFeaturePendingTask;
