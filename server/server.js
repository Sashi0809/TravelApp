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

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

app.get('/', (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;
    res.json({
        message: "Api is running",
        database: isConnected ? "connected" : "disconnected",
        dbState: mongoose.connection.readyState
    });
});



const PORT = process.env.PORT || 5000

app.listen(PORT, ()=> console.log('port is running'))
