// ===================== Commit 1: Initial setup =====================
// Setup Express server, CORS, JSON middleware, and test route
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Freelance Marketplace Backend is Running!");
});

// ===================== Commit 2: MongoDB connection =====================
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri =
  "mongodb+srv://simpleDBUser:L8jrYrRlPRIJ7PVQ@cluster0.mzammbm.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error(err);
  }
}
connectDB();


const dbName = "jobs-db";
const collectionName = "jobs";
const jobsCollection = client.db(dbName).collection(collectionName);


app.get("/jobs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const jobs = await jobsCollection
      .find()
      .sort({ postedAt: -1 })
      .limit(limit)
      .toArray();

    const updatedJobs = jobs.map((job) => ({
      ...job,
      acceptedBy: job.acceptedBy || [],
    }));

    res.send(updatedJobs);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch jobs", error: err });
  }
});

