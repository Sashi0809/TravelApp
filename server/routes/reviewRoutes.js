const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const protect = require("../middleware/authMiddleware");

// Get all reviews for a specific place
router.get("/:placeName", async (req, res) => {
    try {
        const placeName = req.params.placeName;
        const reviews = await Review.find({ placeName }).sort({ createdAt: -1 });
        
        // Calculate average rating
        let averageRating = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            averageRating = (sum / reviews.length).toFixed(1);
        }

        res.json({ reviews, averageRating, count: reviews.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// Create or Update a review for a specific place
router.post("/", protect, async (req, res) => {
    try {
        const { placeName, rating, comment } = req.body;
        const userId = req.user._id;
        const userName = req.user.name;

        if (!placeName || !rating || !comment) {
            return res.status(400).json({ message: "Please provide all fields" });
        }

        // Use findOneAndUpdate with upsert to either update existing or create new
        const review = await Review.findOneAndUpdate(
            { userId, placeName },
            { userName, rating, comment },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(201).json(review);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
