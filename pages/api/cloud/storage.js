// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {databasePromise} from "../../../libs/cloud/mongodb";
import {getServerSession} from "next-auth"
import {authOptions} from "../auth/[...nextauth]";

export const handler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions)
  let db = await databasePromise;

  const { method, body } = req;

  switch (method) {
    case 'GET':
      if (session) {
        let cloudConfig = await db.collection('cloud_configs').findOne({ userId: session.userId });
        res.send(JSON.stringify(cloudConfig, null, 2))
      } else {
        res.send(JSON.stringify({}, null, 2))
      }
      break;
    case 'POST': // set
      await db.collection('cloud_configs').updateOne(
        { userId: session.userId },
        {
          $set: body,
        },
        { upsert: true },
      );
      res.send(JSON.stringify(session, null, 2))
      break;
  }


};
export default handler;