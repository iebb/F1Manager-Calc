// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {databasePromise} from "../../libs/cloud/mongodb";

export const handler = async (req, res) => {
  // let db = await databasePromise;
  // let objectDate = new Date();
  //
  // let month = objectDate.getMonth();
  // let year = objectDate.getFullYear();
  // if (month < 10) {
  //   month = `0${month}`;
  // }
  //
  // const { uid, gameVersion, track, value, feedback, index } = req.body;
  // if (feedback === "optimal" && value >= 0.00 && value <= 1.00) {
  //   await db.collection('reports_game_' + gameVersion).updateOne(
  //     { track },
  //     {
  //       $inc: { [`feedback_cnt_${index}`]: 1 },
  //       $push: { [`params_${index}`]: value },
  //     },
  //     { upsert: true },
  //   );
  //   await db.collection('reports_val_' + gameVersion).updateOne(
  //     { track },
  //     {
  //       $inc: { [`feedback_cnt_${index}`]: 1 },
  //     },
  //     { upsert: true },
  //   );
  // }
  res.status(200).json({status: "ok"});
};
export default handler;