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
          _id: 1,
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
  upsertSeries: curry((collection, {items, date: { initial, end }}) => {
    const serieUpdatePush = [].concat.apply([], items.map(item => {
      return item.series.map(serie => {
        return {
          updateOne: {
            "filter": {
              "_id": item.id,
              "series.date": { "$ne": serie.date }
            },
            "update": { 
              "$push": { 
                "series": {
                  $each: [{
                    value: serie.value,
                    disabled: serie.disabled,
                    date: serie.date
                  }],
                  "$position": 0
                },
              },
            }
          }
        }
      })
    })).reverse();
    const serieUpdateSet = [].concat.apply([], items.map(item => {
      return item.series.filter(serie => serie.value).map(serie => {
        return { updateOne: {
          "filter": {
            "_id": item.id,
            "series": {
              $elemMatch: {
                "date": serie.date,
                "value": { "$ne": serie.value }
              }
            }
          },
          "update": { 
            "$set": { "series.$.value": serie.value }
          }
        }}
      });
    }));

    return collection.bulkWrite(serieUpdateSet.concat(serieUpdatePush))
  })
}