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

    console.log(this.newQueryStr);

    this.query = this.query.aggregate([
      { $match: newQueryStr },
      {
        $project: {
          _id: 1,
          line: 1,
          processNo: 1,
          workDetail: 1,
          pS: 1,
          rS: 1,
          cardNo: 1,
        },
      },
      { $addFields: { result: "PENDING" } },
    ]);
    return this;
  }

  line() {
    let newQueryStr = { ...this.queryStr };

    this.query = this.query.aggregate([
      {
        $match: newQueryStr,
      },
      {
        $lookup: {
          from: "checkitems",
          localField: "checkItem",
          foreignField: "_id",
          as: "itemSpec"
        }
      },
      {
        $unwind: {
          path: "$itemSpec"
        }
      },
      {
        $group: {
          _id: { line: "$line", processNo: "$processNo", checkItem: "$checkItem" },
          processList: {
            $push: {
              id: "$_id",
              checkItem: "$checkItem",
              result: "$result",
              pS: "$pS",
              entryDates: "$entryDates",
              rS: "$rS",
              itemSpec: "$itemSpec"
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.line",
          processList: {
            $push: {
              processNo: "$_id.processNo",
              processData: "$processList",
            },
          },
        },
      }
    ]);
    return this;
  }

  lineReport() {
    let newQueryStr = { ...this.queryStr };


    this.query = this.query.aggregate([
      {
        $match: newQueryStr,
      },
      {
        $lookup: {
          from: "dailystatuses",
          localField: "checkItem",
          foreignField: "checkItem",
          as: "itemSpec"
        }
      },
      {
        $lookup: {
          from: "checkitems",
          localField: "checkItem",
          foreignField: "_id",
          as: "checkitems"
        }
      },
      {
        $unwind: {
          path: "$itemSpec",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          actuals: {
            $reduce: {
              input: "$itemSpec.m_spec",
              initialValue: "",
              in: {
                $cond: {
                  if: {
                    $eq: [
                      {
                        $indexOfArray: [
                          "$itemSpec.m_spec",
                          "$$this"
                        ]
                      },
                      0
                    ]
                  },
                  then: {
                    $concat: [
                      "$$value",
                      "$$this.m_lable",
                      " ",
                      {
                        $toString: "$$this.m_value"
                      },
                      " ",
                      "$$this.m_unit"
                    ]
                  },
                  else: {
                    $concat: [
                      "$$value",
                      ", ",
                      "$$this.m_lable",
                      " ",
                      {
                        $toString: "$$this.m_value"
                      },
                      " ",
                      "$$this.m_unit"
                    ]
                  }
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          criteria: {
            $reduce: {
              input: "$itemSpec.m_spec",
              initialValue: "",
              in: {
                $cond: {
                  if: {
                    $eq: [
                      {
                        $indexOfArray: [
                          "$itemSpec.m_spec",
                          "$$this"
                        ]
                      },
                      0
                    ]
                  },
                  then: {
                    $concat: [
                      "$$value",
                      "$$this.m_criteria",
                    ]
                  },
                  else: {
                    $concat: [
                      "$$value",
                      ", ",
                      "$$this.m_criteria",
                    ]
                  }
                }
              }
            }
          }
        }
      },
      {
        $group: {
          _id: { line: "$line", processNo: "$processNo", checkItem: "$checkItem" },
          processList: {
            $push: {
              id: "$_id",
              checkItem: "$checkItem",
              checkitems: "$checkitems",
              result: "$result",
              pS: "$pS",
              entryDates: "$entryDates",
              rS: "$rS",
              itemSpec: "$itemSpec",
              actuals: "$actuals",
              criteria: "$criteria"
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.line",
          processList: {
            $push: {
              processNo: "$_id.processNo",
              processData: "$processList",
            },
          },
        },
      }

    ]);
    return this;
  }

};

module.exports = ApiFeaturePendingTask;
