function curry(fn) {
  return (...xs) => {
    if (xs.length === 0) {
      throw Error('EMPTY INVOCATION');
    }
    if (xs.length >= fn.length) {
      return fn(...xs);
    }
    return curry(fn.bind(null, ...xs));
  };
}

module.exports = {
  getSeries: curry((collection, {series, date: { initial, end }}) => {
    return collection.aggregate([
      { $match: 
        { $or: series}
      },
      {
        $project: {
          _id: 0,
          id: 1,
          name: 1,
          series: {
            $filter: {
              input: "$series",
              as: "serie",
              cond: { $and: [
                { $gte: ["$$serie.date", initial] },
                { $lte: ["$$serie.date", end] }
              ]}
            }
          }
        }
      }
    ]);
  }),
  upsertSeries: curry((collection, {series, date: { _, end }}) => {
    return collection.bulkWrite(series.map((serie) => {
      return { 
        updateOne: {
          "filter": {
            "id": serie.id,
            "series.date": { "$ne": end }
          },
          "update": { 
            "$push": { 
              "series": {
                $each: [
                  { "date": end  }
                ],
                "$position": 0
              },
            }
          },
          upsert: true
        }
      }
    }))
  })
}