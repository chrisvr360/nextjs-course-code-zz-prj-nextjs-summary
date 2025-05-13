import { Fragment } from "react";
import Head from "next/head";
import { MongoClient } from "mongodb";
import MeetupList from "../components/meetups/MeetupList";

export default function HomePage(props) {
  return (
    <Fragment>
      <Head>
        <title>React Meetups</title>
        <meta
          name="description"
          content="Browse a huge list of highly active React meetups!"
        />
      </Head>
      <MeetupList meetups={props.meetups} />
    </Fragment>
  );
}

export async function getStaticProps() {
  // build the connection string from .env.local
  const user = encodeURIComponent(process.env.MONGODB_USER);
  const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
  const cluster = process.env.MONGODB_CLUSTERNAME; // e.g. "cluster0.bvqjwx2"
  const dbName = process.env.MONGODB_DATABASE; // e.g. "meetups"

  const uri = `mongodb+srv://${user}:${password}@${cluster}.mongodb.net/${dbName}?retryWrites=true&w=majority`;

  // connect & fetch
  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const meetupsCollection = db.collection("meetups");
  const rawMeetups = await meetupsCollection.find().toArray();
  client.close();

  // map _id to string and return props
  const meetups = rawMeetups.map((m) => ({
    id: m._id.toString(),
    title: m.title,
    address: m.address,
    image: m.image,
  }));

  return {
    props: { meetups },
    revalidate: 1, // ISR: regenerate page every second at most
  };
}
