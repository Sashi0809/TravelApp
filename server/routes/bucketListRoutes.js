const express = require('express');
const protect = require('../middleware/authMiddleware');
const BucketList = require('../models/bucketList');

const router = express.Router();

// @desc    Add a place to bucket list
// @route   POST /api/bucketlist
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name, latitude, longitude } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Place name is required" });
        }

        const newPlace = await BucketList.create({
            user: req.user._id,
            name,
            latitude,
            longitude
        });

        res.status(201).json(newPlace);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// @desc    Get logged in user's bucket list
// @route   GET /api/bucketlist
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const list = await BucketList.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// @desc    Delete a place from bucket list
// @route   DELETE /api/bucketlist/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const place = await BucketList.findById(req.params.id);

        if (!place) {
            return res.status(404).json({ message: "Place not found" });
        }

        // Ensure user owns the bucket list item
        if (place.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "User not authorized" });
        }

        await place.deleteOne();
        res.json({ message: "Place removed from bucket list" });
    } catch (err) {
        console.error("Error creating bucket list:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// Update a bucket list item (for Mark as Visited & Journal)
router.put("/:id", protect, async (req, res) => {
    try {
        const { visited, journal } = req.body;
        const bucketItem = await BucketList.findOne({ _id: req.params.id, user: req.user._id });

        if (!bucketItem) {
            return res.status(404).json({ message: "Bucket list item not found" });
        }

        if (visited !== undefined) bucketItem.visited = visited;
        if (journal !== undefined) bucketItem.journal = journal;

        await bucketItem.save();
        res.json(bucketItem);
    } catch (err) {
        console.error("Error updating bucket list item:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// @desc    Get public bucket list for a specific user
// @route   GET /api/bucketlist/public/:userId
// @access  Public
router.get("/public/:userId", async (req, res) => {
    try {
        const list = await BucketList.find({ user: req.params.userId }).sort({ createdAt: -1 });
        if (!list) {
            return res.status(404).json({ message: "Bucket list not found" });
        }
        // Exclude private journals if we want, or just send everything.
        res.json(list);
    } catch (err) {
        console.error("Error fetching public bucket list:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = router;