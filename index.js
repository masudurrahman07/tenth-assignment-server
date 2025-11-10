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

// ===================== Commit 3: Database & collection setup =====================
const dbName = "jobs-db";
const collectionName = "jobs";
const jobsCollection = client.db(dbName).collection(collectionName);

// ===================== Commit 4: GET all jobs =====================
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

// ===================== Commit 5: GET single job by ID =====================
app.get("/jobs/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const job = await jobsCollection.findOne({ _id: new ObjectId(id) });
    if (!job) return res.status(404).send({ message: "Job not found" });

    if (!job.acceptedBy) job.acceptedBy = [];
    res.send(job);
  } catch (err) {
    res.status(500).send({ message: "Failed to fetch job", error: err });
  }
});

// ===================== Commit 6: POST new job =====================
app.post("/jobs", async (req, res) => {
  try {
    const job = req.body;
    job.postedAt = job.postedAt || new Date();
    job.acceptedBy = job.acceptedBy || [];
    const result = await jobsCollection.insertOne(job);
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to add job", error: err });
  }
});

// ===================== Commit 7: PUT update job =====================
app.put("/jobs/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    
    if (updatedData.acceptedBy) {
      const result = await jobsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $addToSet: { acceptedBy: updatedData.acceptedBy[0] } }
      );
      return res.send(result);
    }

    
    if (updatedData.removeUser) {
      const result = await jobsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $pull: { acceptedBy: updatedData.removeUser } }
      );
      return res.send(result);
    }

    
    const { title, category, summary, coverImage } = updatedData;
    const result = await jobsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, category, summary, coverImage } }
    );
    res.send(result);
  } catch (err) {
    res.status(500).send({ message: "Failed to update job", error: err });
  }
});

