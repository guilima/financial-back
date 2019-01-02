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
  upsertSeries: curry((collection, items, end) => {
    const seriePush = items.map(item => { 
      return { updateOne: {
        "filter": {
          "id": item.id,
          "series.date": { "$ne": end },
        },
        "update": { 
          "$push": { 
            "series": {
              $each: item.series.map(serie => {
                return {
                  value: serie.value,
                  disabled: serie.disabled,
                  date: serie.date
                }
              }),
              "$position": 0
            },
          },
        }
      }}
    });
    const serieSet = [].concat.apply([], items.map(item => {
      return item.series.map(serie => {
        return { updateOne: {
          "filter": {
            "id": item.id,
            $and: [
              { "series.date": serie.date },
              { "series.value": null },
            ]
          },
          "update": { 
            "$set": { "series.$.value": serie.value }
          }
        }}
      });
    }));

    return collection.bulkWrite(seriePush.concat(serieSet))
  })
}