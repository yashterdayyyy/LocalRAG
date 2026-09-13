import { MongoClient } from "mongodb";

const uri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  "mongodb://127.0.0.1:27017/localrag";
const options = {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
};

/**
 * Global is used here to maintain a cached connection across hot reloads in development
*/
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!(global)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global)._mongoClientPromise = client.connect();
  }
  clientPromise = (global)._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
