const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 4000;

// middleware:
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rxjjt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const addPropertyCollection = client
      .db("propertyDB")
      .collection("addProperty");

    const availablePropertyCollection = client
      .db("propertyDB")
      .collection("AvailableProperty");

    const propertyDistrictCollection = client
      .db("propertyDB")
      .collection("propertyDistrict");

    const propertyUpazilaCollection = client
      .db("propertyDB")
      .collection("propertyUpazila");

    // Add Property related api:
    app.post("/addProperty", async (req, res) => {
      const addPropertyInfo = req.body;
      console.log(addPropertyInfo);
      const result = await addPropertyCollection.insertOne(addPropertyInfo);
      res.send(result);
    });

    app.get("/addProperty", async (req, res) => {
      const result = await addPropertyCollection.find().toArray();
      res.send(result);
    });

    app.get("/addProperty/:id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: new ObjectId(id) };
      const result = await addPropertyCollection.findOne(query);
      res.send(result);
    });

    // available Property related api:
    app.post("/availableProperty", async (req, res) => {
      const addAvailableProperty = req.body;
      console.log(addAvailableProperty);
      const result = await availablePropertyCollection.insertOne(
        addAvailableProperty
      );
      res.send(result);
    });

    app.get("/availableProperty", async (req, res) => {
      const result = await availablePropertyCollection.find().toArray();
      res.send(result);
    });

    //  property District related api:
    app.get("/propertyDistrict", async (req, res) => {
      const result = await propertyDistrictCollection.find().toArray();
      res.send(result);
    });

    //  property Upazila related api:
    app.get("/propertyUpazila", async (req, res) => {
      const result = await propertyUpazilaCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("house-swift-web-creations-server is Running");
});
app.listen(port, () => {
  console.log(`house-swift-web-creations-server is Running on port ${port}`);
});
