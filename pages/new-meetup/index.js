// pages/[meetupId].js
import MeetupDetail from "../components/meetups/MeetupDetail";

import { Fragment } from "react";
import Head from "next/head";
import { MongoClient, ObjectId } from "mongodb";

export default function MeetupDetailsPage({ meetup }) {
  return (
    <Fragment>
      <Head>
        <title>{meetup.title}</title>
        <meta name="description" content={meetup.description} />
      </Head>
      <MeetupDetail
        image={meetup.image}
        title={meetup.title}
        address={meetup.address}
        description={meetup.description}
      />
    </Fragment>
  );
}

export async function getStaticPaths() {
  const user = encodeURIComponent(process.env.MONGODB_USER);
  const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
  const cluster = process.env.MONGODB_CLUSTERNAME;
  const dbName = process.env.MONGODB_DATABASE;
  const uri = `mongodb+srv://${user}:${password}@${cluster}.mongodb.net/${dbName}?retryWrites=true&w=majority`;

  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const meetups = await db
    .collection("meetups")
    .find({}, { projection: { _id: 1 } })
    .toArray();
  client.close();

  return {
    fallback: "blocking",
    paths: meetups.map((m) => ({
      params: { meetupId: m._id.toString() },
    })),
  };
}

export async function getStaticProps({ params }) {
  const meetupId = params.meetupId;

  const user = encodeURIComponent(process.env.MONGODB_USER);
  const password = encodeURIComponent(process.env.MONGODB_PASSWORD);
  const cluster = process.env.MONGODB_CLUSTERNAME;
  const dbName = process.env.MONGODB_DATABASE;
  const uri = `mongodb+srv://${user}:${password}@${cluster}.mongodb.net/${dbName}?retryWrites=true&w=majority`;

  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);
  const meetup = await db
    .collection("meetups")
    .findOne({ _id: new ObjectId(meetupId) });
  client.close();

  if (!meetup) {
    return { notFound: true };
  }

  return {
    props: {
      meetup: {
        id: meetup._id.toString(),
        title: meetup.title,
        address: meetup.address,
        image: meetup.image,
        description: meetup.description || "",
      },
    },
    revalidate: 10,
  };
}
