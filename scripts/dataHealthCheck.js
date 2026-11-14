const pendingOrphans = await db.pendingtasks.aggregate([
  {
    $lookup: {
      from: "checkitems",
      localField: "checkItem",
      foreignField: "_id",
      as: "ci"
    }
  },
  {
    $match: {
      ci: { $size: 0 }
    }
  },
  {
    $count: "count"
  }
]).toArray();

const cardOrphans = await db.cards.aggregate([
  {
    $lookup: {
      from: "checkitems",
      localField: "checkItem",
      foreignField: "_id",
      as: "ci"
    }
  },
  {
    $match: {
      ci: { $size: 0 }
    }
  },
  {
    $count: "count"
  }
]).toArray();

console.log({
  pendingTaskOrphans: pendingOrphans[0]?.count || 0,
  cardOrphans: cardOrphans[0]?.count || 0
});