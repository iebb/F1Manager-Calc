// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {databasePromise} from "../../libs/cloud/mongodb";

export const handler = async (req, res) => {
  // let db = await databasePromise;
  //
  // const { uid, track, values } = req.body;
  // await db.collection('values').updateOne(
  //   { track },
  //   {
  //     $inc: { [`feedback_cnt`]: 1 },
  //     $push: { [`values`]: {uid, track, values} },
  //   },
  //   { upsert: true },
  // );
  res.status(200).json({status: "ok"});
};
export default handler;