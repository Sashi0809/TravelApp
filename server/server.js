const express= require('express')
const cors = require('cors')
const dotenv= require('dotenv')
const mongoose= require('mongoose')
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const bucketListRoutes = require('./routes/bucketListRoutes');
const reviewRoutes = require("./routes/reviewRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");

dotenv.config()  //loads local variables

const app= express()

app.use(cors())
app.use(express.json())
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bucketlist", bucketListRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/itinerary", itineraryRoutes);

let dbError = null;

if (!process.env.MONGO_URI) {
    dbError = "MONGO_URI environment variable is missing in Render.";
    console.error(dbError);
} else {
    mongoose.connect(process.env.MONGO_URI)
      .then(() => {
          console.log("MongoDB connected successfully");
          dbError = null;
      })
      .catch((err) => {
          console.error("MongoDB connection error:", err.message);
          dbError = err.message;
      });
}

app.get('/', (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;
    // Mask password in URI for safe debugging
    let maskedUri = null;
    if (process.env.MONGO_URI) {
        maskedUri = process.env.MONGO_URI.replace(/:([^@]+)@/, ":****@");
    }

    res.json({
        message: "Api is running",
        database: isConnected ? "connected" : "disconnected",
        dbState: mongoose.connection.readyState,
        hasMongoUri: Boolean(process.env.MONGO_URI),
        currentUri: maskedUri,
        connectionError: dbError
    });
});



const PORT = process.env.PORT || 5000

app.listen(PORT, ()=> console.log('port is running'))
