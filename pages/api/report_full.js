// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {databasePromise} from "../../libs/cloud/mongodb";

export const handler = async (req, res) => {
  let db = await databasePromise;

  const { uid, gameVersion, optimalParam, track, optimalSetup } = req.body;
  await db.collection('reports_optimal_' + gameVersion).updateOne(
    { track },
    {
      $inc: { [`feedback_cnt`]: 1 },
      $push: {
        optimalSetups: optimalSetup,
        optimalParams: optimalParam,
      },
    },
    { upsert: true },
  );
  res.status(200).json({status: "ok"});
};
export default handler;