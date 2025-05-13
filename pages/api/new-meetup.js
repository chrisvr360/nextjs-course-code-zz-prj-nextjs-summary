// pages/api/new-meetup.js

import { MongoClient } from "mongodb";

async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} not allowed.` });
  }

  const data = req.body;

  const user = encodeURIComponent(process.env.MONGODB_USER);
  const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
  const cluster = process.env.MONGODB_CLUSTERNAME; // e.g. "cluster0.bvqjwx2"
  const database = process.env.MONGODB_DATABASE; // e.g. "meetups"

  const uri = `mongodb+srv://${user}:${password}@${cluster}.mongodb.net/${database}?retryWrites=true&w=majority`;

  let client;
  try {
    client = await MongoClient.connect(uri);
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    return res.status(500).json({ message: "Could not connect to database." });
  }

  const db = client.db(database);

  let result;
  try {
    result = await db.collection("meetups").insertOne(data);
  } catch (err) {
    console.error("Insert failed:", err);
    client.close();
    return res.status(500).json({ message: "Inserting data failed." });
  }

  client.close();

  return res
    .status(201)
    .json({ message: "Meetup inserted!", meetupId: result.insertedId });
}

export default handler;
