// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {databasePromise} from "../../libs/mongodb";

export default async (req, res) => {
  let db = await databasePromise;
  let objectDate = new Date();

  let month = objectDate.getMonth();
  let year = objectDate.getFullYear();
  if (month < 10) {
    month = `0${month}`;
  }

  const { uid, track, value, feedback, index } = req.body;
  if (feedback === "optimal" && value >= 0.00 && value <= 1.00) {
    await db.collection('reports').updateOne(
      { track },
      { $push: { [`params_${index}`]: value } },
      { upsert: true },
    );
    await db.collection(`reports_${year}${month}`).updateOne(
      { track },
      { $push: { [`params_${index}`]: value } },
      { $push: { [`feedbacks_${index}`]: { uid, track, value, feedback, index } } },
      { upsert: true },
    );
  }
  res.status(200).json({status: "ok"});
};