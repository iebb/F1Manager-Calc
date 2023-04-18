import {databasePromise} from "../cloud/mongodb";

export const getConfig = async (userId) => {
  let db = await databasePromise;
  return await db.collection('cloud_configs').findOne({
    userId
  });
}