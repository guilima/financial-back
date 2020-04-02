import Mongodb from '../mongodb';

const getSeries = async ({series, date: { initial, end }}) => {
  const { client, db } = await Mongodb();
  const collection = db.collection('monthly_series');
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
  ]).toArray();
}

const upsertSeries = async (items) => {
  const { client, db } = await Mongodb();
  const collection = db.collection('monthly_series');
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
                  date: serie.date,
                  value: serie.value,
                  disabled: serie.disabled
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

  return collection.bulkWrite(serieUpdateSet.concat(serieUpdatePush));
}

export {
  getSeries,
  upsertSeries
}