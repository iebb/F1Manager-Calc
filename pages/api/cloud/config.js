// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {databasePromise} from "../../../libs/mongodb";
import {getServerSession} from "next-auth"
import {authOptions} from "../auth/[...nextauth]";

export default async (req, res) => {
  const session = await getServerSession(req, res, authOptions)
  let db = await databasePromise;

  const { method, body } = req;

  switch (method) {
    case 'GET':
      await db.collection('cloud_configs').findOne({ userId: session.userId });
      res.send(JSON.stringify(session, null, 2))
      break;
    case 'POST': // set
      let { config } = body;
      await db.collection('cloud_configs').updateOne(
        { userId: session.userId },
        {
          $set: { config },
        },
        { upsert: true },
      );
      res.send(JSON.stringify(session, null, 2))
      break;
  }


};