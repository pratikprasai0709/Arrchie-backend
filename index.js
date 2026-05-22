// initialization
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import mongoose from "mongoose";

const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI || "mongodb+srv://pratik:pratik@professionals.6vnffjd.mongodb.net/?retryWrites=true&w=majority&appName=Professionals";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Successfully connected to MongoDB and pinged the deployment!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}
run().catch(console.dir);

//Routes
app.get('/', (_req, res)=>{
    res.send("This is the Homepage");
});

//Starting the server in a port
app.listen(port, "0.0.0.0", () => {
  console.log(`Server started at port ${port}`);
});
