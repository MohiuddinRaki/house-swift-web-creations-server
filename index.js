const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 4000;

// middleware:
const corsConfig = {
  origin: ["https://careful-pollution.surge.sh" , "http://localhost:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
  app.use(cors(corsConfig))
app.use(express.json());

//sajib database
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v61q93t.mongodb.net/?retryWrites=true&w=majority`;

//rakib database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rxjjt.mongodb.net/?retryWrites=true&w=majority`;

// biplob database
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vsymadz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    // strict: true,
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
    const availablePropertyCollection = client
      .db("propertyDB")
      .collection("AvailableProperty");
    const wishlistCollection = client.db("propertyDB").collection("wishlists");
    const blogsDataCollection = client.db("propertyDB").collection("blogsData");

    const propertyDistrictCollection = client
      .db("propertyDB")
      .collection("propertyDistrict");

    const propertyUpazilaCollection = client
      .db("propertyDB")
      .collection("propertyUpazila");
    const tokenCollection = client.db("propertyDB").collection("allUserToken");
    const reviewCollection = client.db("propertyDB").collection("allRewiews");
    const bookingCollection = client.db("propertyDB").collection("mybooking");

    // user related api:

    app.get("/user/admin/:email", async (req, res) => {
      const email = req?.params?.email;
      const query = { email: email };
      const user = await propertyUserCollection.findOne(query);
      if (user) {
        if (user?.role === "user") {
          res.send({ role: user?.role });
        } else if (user?.role === "agent") {
          res.send({ role: user?.role });
        } else if (user?.role === "admin") {
          res.send({ role: user?.role });
        } else {
          res.send({ message: "unauthorized access" });
        }
      } else {
        res.send({ message: "user not found" });
      }
    });

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

    // delete propertyUsers
    app.delete("/propertyUsers/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await propertyUserCollection.deleteOne(query);
      res.send(result);
    });

    // update/patch /make admin user
    app.patch("/propertyUsers/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedInfo = {
        $set: {
          role: "admin",
        },
      };
      const result = await propertyUserCollection.updateOne(
        filter,
        updatedInfo
      );
      res.send(result);
    });
    app.patch("/propertyUsers/agent/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedInfo = {
        $set: {
          role: "agent",
        },
      };
      const result = await propertyUserCollection.updateOne(
        filter,
        updatedInfo
      );
      res.send(result);
    });

    app.patch("/user/makeFraud/:id", async (req, res) => {
      const id = req.params.id;
      const email = req.query.email;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: "fraud",
        },
      };
      const query = { agent_email: email };
      const deleteProperties = await addPropertyCollection.deleteMany(query);
      const deleteWishlist = await wishlistCollection.deleteMany(query);
      const result = await propertyUserCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.get("/agentproperties", async (req, res) => {
      const email = req.query.email;
      let query = { verification_status: "verified" };
      if (email) {
        query = { agent_email: email };
      }
      const result = await addPropertyCollection.find(query).toArray();
      res.send(result);
    });

    // is admin
    // app.get("/propertyUsers/admin/:email", async (req, res) => {
    //   const email = req.params.email;
    //   const query = { email: email };
    //   const user = await propertyUserCollection.findOne(query);
    //   let admin = false;
    //   if (user) {
    //     admin = user.role === "admin";
    //   }
    //   res.send({ admin });
    // });
    // is Agent
    // app.get("/propertyUsers/agent/:email", async (req, res) => {
    //   const email = req.params.email;
    //   const query = { email: email };
    //   const user = await propertyUserCollection.findOne(query);
    //   let agent = false;
    //   if (user) {
    //     agent = user.role === "agent";
    //   }
    //   res.send({ agent });
    // });
    // Add Property related api:
    app.post("/properties", async (req, res) => {
      const addPropertyInfo = req.body;
      console.log("202020", addPropertyInfo);
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
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await addPropertyCollection.findOne(query);
      res.send(result);
    });

    app.get("/agentProperties/:email", async (req, res) => {
      const email = req.params.email;
      const query = { agent_email: email };
      const result = await addPropertyCollection.find(query).toArray();
      res.send(result);
    });

    // delete property
    app.delete("/properties/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addPropertyCollection.deleteOne(query);
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
      // console.log(result);
      res.send(result);
    });

    // available Property related api:
    app.post("/availableProperty", async (req, res) => {
      const addAvailableProperty = req.body;
      // console.log(addAvailableProperty);
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
      const query = { userEmail: email };
      const result = await wishlistCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/wishlists", async (req, res) => {
      const { wishlistId, userEmail } = req.body;
      const existingWishlist = await wishlistCollection.findOne({
        wishlistId: wishlistId,
        userEmail: userEmail,
      });

      if (existingWishlist) {
        return res
          .status(400)
          .send({ message: "You already added your wishlist" });
      }

      const result = await wishlistCollection.insertOne(req.body);
      res.send(result);
    });

    app.delete("/wishlists/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishlistCollection.deleteOne(query);
      res.send(result);
    });

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
      const { reviewID, userEmail } = req.body.allReviewData;
      try {
        const existingReview = await reviewCollection.findOne({
          "reviewData.reviewID": reviewID,
          "reviewData.userEmail": userEmail,
        });

        if (existingReview) {
          return res
            .status(400)
            .send({ message: "You already added your review" });
        }

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
      // console.log(result);
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

    // booking related apis
    // post the booking
    app.post("/mybooking", async (req, res) => {
      const bookingInfo = req.body;
      console.log("202020", bookingInfo);
      const result = await bookingCollection.insertOne(bookingInfo);
      res.send(result);
    });
    // get the booking
    app.get("/mybooking", async (req, res) => {
      const cursor = bookingCollection.find();
      const result = await cursor.toArray();
      // console.log(result);
      res.send(result);
    });
    // for id wise get
    app.get("/mybooking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.findOne(query);
      res.send(result)
    })
    app.get("/allProperties/filterByPrice", async (req, res) => {
      try {
        const minPrice = "500";
        const maxPrice = "900";

        const query = {
          rent_price: { $gte: minPrice, $lte: maxPrice },
        };

        // Query the database to find properties within the specified rent_price range
        const filteredProperties = await addPropertyCollection.find(query).toArray();

        res.send(filteredProperties);
      } catch (error) {
        console.error("Error while fetching filtered properties:", error);
        res.status(500).send("Internal Server Error");
      }
    });

  // update date 
  app.patch(`/mybooking/:id`, async (req, res) => {
    const id = req.params.id;
    const Chack_In_Date = req.body.Chack_In_Date;
    // console.log(req.body.Chack_In_Date)
    const Chack_out_Date = req.body.Chack_out_Date;
  
    const query = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        Chack_In_Date: Chack_In_Date,
        Chack_out_Date: Chack_out_Date
      }
    };
    try {
      // Update the first document that matches the filter
      const result = await bookingCollection.updateOne(query, updateDoc, options);
      res.send(result);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).send({ message: "Internal server error" });
    }
  });

    // update date
    app.patch(`/mybooking/:id`, async (req, res) => {
      const id = req.params.id;
      const Chack_In_Date = req.body.Chack_In_Date;
      // console.log(req.body.Chack_In_Date)
      const Chack_out_Date = req.body.Chack_out_Date;

      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          Chack_In_Date: Chack_In_Date,
          Chack_out_Date: Chack_out_Date,
        },
      };
      try {
        // Update the first document that matches the filter
        const result = await bookingCollection.updateOne(
          query,
          updateDoc,
          options
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).send({ message: "Internal server error" });
      }
    });

    // user wise booking
    app.get("/mybooking", async (req, res) => {
      // console.log(req.query.customerName);
      console.log("from valid user", req.user);
      let query = {};
      if (req.query?.userEmailmail) {
        query = { email: req.query.userEmailmail };
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });
    // Corrected route for delete
    app.delete("/mybooking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });
    //recommendation related api

    app.get("/recommendation", async (req, res) => {
      try {
        const searchData = req.query.searchData;
        const options = {
          projection: { upazila: 1, district: 1 },
        };
        let filter = {};
        if (searchData) {
          const pattern = new RegExp(searchData, "i");
          filter = {
            $or: [
              { upazila: { $regex: pattern } },
              { district: { $regex: pattern } },
            ],
          };
          const uniqueDistrict = await addPropertyCollection.distinct(
            "district",
            filter
          );
          const uniqueUpazila = await addPropertyCollection.distinct(
            "upazila",
            filter
          );
          const result = [...uniqueDistrict, ...uniqueUpazila];
          res.send(result);
        }
      } catch (err) {
        // console.log(err.message);
      }
    });

    app.get("/propertyRecommendation", async (req, res) => {
      try {
        const data = req.query;
        const name = data.name;
        const bedroom = data.bedroom;
        const district = data.district;
        console.log(name, bedroom, district);
        const query = {
          $or: [{ name: name }, { bedroom: bedroom }, { district: district }],
          $and: [{ verification_status: "verified" }],
        };
        const result = await addPropertyCollection.find(query).toArray();
        console.log(result.length);
        if (result <= 6) {
          res.send({ data: result });
        } else {
          const result = await addPropertyCollection
            .find(query)
            .limit(6)
            .toArray();
          res.send({ data: result });
        }
      } catch (err) {
        console.log(err);
      }
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
