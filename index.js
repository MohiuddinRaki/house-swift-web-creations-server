const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 4000;

// middleware:
app.use(cors());
app.use(express.json());

//sajib database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v61q93t.mongodb.net/?retryWrites=true&w=majority`;

//rakib database
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rxjjt.mongodb.net/?retryWrites=true&w=majority`;

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
    const propertyUserCollection = client
      .db("propertyDB")
      .collection("propertyUsers");
    const addPropertyCollection = client
      .db("propertyDB")
      .collection("addProperty");
    // const blogsDataCollection = client
    // .db("propertyDB")
    // .collection("blogsData");

    const availablePropertyCollection = client
      .db("propertyDB")
      .collection("AvailableProperty");
    const wishlistCollection = client
      .db("propertyDB")
      .collection("wishlists");
    const blogsDataCollection = client.db("propertyDB").collection("blogsData");

    const propertyDistrictCollection = client
      .db("propertyDB")
      .collection("propertyDistrict");

    const propertyUpazilaCollection = client
      .db("propertyDB")
      .collection("propertyUpazila");
    const tokenCollection = client.db("propertyDB").collection("allUserToken");
    const reviewCollection = client.db("propertyDB").collection("allRewiews");

    // user related api:
    app.post("/propertyUsers", async (req, res) => {
      const usersInfo = req?.body;
      const query = { email: usersInfo?.email };
      const existingUser = await propertyUserCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user alreday exist", insertedId: null });
      }
      const result = await propertyUserCollection.insertOne(usersInfo);
      res.send(result);
    });
    app.get("/propertyUsers", async (req, res) => {
      const result = await propertyUserCollection.find().toArray();
      res.send(result);
    });


    // is admin
    app.get("/propertyUsers/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await propertyUserCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user.role === "admin";
      }
      res.send({ admin })
    })
    

    // is Agent
    app.get("/propertyUsers/agent/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await propertyUserCollection.findOne(query);
      let agent = false;
      if (user) {
        agent = user.role === "agent";
      }
      res.send({ agent })
    })


    // Add Property related api:
    app.post("/properties", async (req, res) => {
      const addPropertyInfo = req.body;
      const result = await addPropertyCollection.insertOne(addPropertyInfo);
      res.send(result);
    });
    app.get("/properties", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const searchData = req.query.searchData;
      let query = { verification_status: "verified" };
      if (searchData) {
        const pattern = new RegExp(searchData, "i");
        query.$or = [
          { upazila: { $regex: pattern } },
          { district: { $regex: pattern } },
        ];
      }
      const propertyPerPage = await addPropertyCollection
        .find(query)
        .skip(page * size)
        .limit(size)
        .toArray();
      const allProperty = await addPropertyCollection.find(query).toArray();
      res.send({ propertyPerPage, allProperty });
    });

    app.get("/properties/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await addPropertyCollection.findOne(query);
      res.send(result);
    });

      // blogs related api
      app.get("/blogsData", async (req, res) => {
        const result = await blogsDataCollection.find().toArray();
        res.send(result);
      });
      app.get("/blogsData/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await blogsDataCollection.findOne(query);
        res.send(result);
      });

      // popular Property related api:
      app.get("/popularProperty", async (req, res) => {
        const result = await addPropertyCollection
          .find()
          .sort({ rent_price: 1 })
          .limit(6)
          .toArray();
        console.log(result);
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


    // wishlist package for tourist 
    app.get("/wishlists", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await wishlistCollection.find(query).toArray();
      res.send(result)
    })


    app.post("/wishlists", async (req, res) => {
      const { wishlistId, userEmail } = req.body;
        const existingWishlist = await wishlistCollection.findOne({ "wishlistId": wishlistId, "userEmail": userEmail });
    
        if (existingWishlist) {
          return res.status(400).send({ message: "You already added your wishlist" });
        }
    
        const result = await wishlistCollection.insertOne(req.body);
        res.send(result);

    });
  


    // app.post("/wishlists", async (req, res) => {
    //   const propertyDetails = req.body;
    //   const result = await wishlistCollection.insertOne(propertyDetails);
    //   res.send(result)
    // })

    app.delete('/wishlists/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishlistCollection.deleteOne(query);
      res.send(result);
    })



    // blos related api
    app.get("/blogsData", async (req, res) => {
      const result = await blogsDataCollection.find().toArray();
      res.send(result);
    });
    app.get("/blogsData/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogsDataCollection.findOne(query);
      res.send(result);
    });

    app.post("/allRewiews", async (req, res) => {
      const { reviewID } = req.body.allReviewData;

      try {
        // Check if reviewID already exists
        const existingReview = await reviewCollection.findOne({ reviewID });

        if (existingReview) {
          return res
            .status(400)
            .send({ message: "You already added your review" });
        }

        // If review doesn't exist, insert the review data
        const result = await reviewCollection.insertOne({
          reviewData: req.body.allReviewData,
        });
        res.send(result);
      } catch (error) {
        console.error("Error inserting review:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // get all reviews
    app.get("/allRewiews", async (req, res) => {
      const cursor = reviewCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // add token for notification related api
    app.post("/allUserToken", async (req, res) => {
      const { token } = req.body;

      try {
        // Check if token already exists
        const existingToken = await tokenCollection.findOne({ token });

        if (existingToken) {
          return res.status(400).send({ message: "Token already exists." });
        }

        // If token doesn't exist, insert the token
        const result = await tokenCollection.insertOne({ token });
        res.send(result);
      } catch (error) {
        console.error("Error inserting token:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // get all token
    app.get("/allUserToken", async (req, res) => {
      const cursor = tokenCollection.find();
      const result = await cursor.toArray();
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

    //pagination related

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
