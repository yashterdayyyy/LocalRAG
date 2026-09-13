import { ObjectId } from "mongodb"
import clientPromise from "./mongodb";

export type ChatSession = {
    _id: ObjectId,
    title: string;
    createdAt: Date;
    updatedAt: Date;
};

export async function getChatSessions() {
    const client = await clientPromise;
    const db = client.db("localrag");

    return db.collection<ChatSession>("sessions")
        .find({})
        .sort({ updatedAt: -1 })
        .toArray();
}

export async function createChatSession(title: string = "New Chat") {
    const client = await clientPromise;
    const db = client.db("localrag");

    const now = new Date();

    const res = await db.collection("sessions").insertOne({
        title,
        createdAt: now,
        updatedAt: now,
    });

    return {
        _id: res.insertedId,
        title,
    };
}

export async function getChatSessionById(id: string) {
    const client = await clientPromise;
    const db = client.db("localrag");

    return db.collection("sessions").findOne({
        _id: new ObjectId(id),
    });
}
