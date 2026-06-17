const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        userName: { type: String, required: true }, // Store name to avoid population overhead
        placeName: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true }
    },
    { timestamps: true }
);

// Ensure a user can only have one review per place
reviewSchema.index({ userId: 1, placeName: 1 }, { unique: true });

module.exports = mongoose.model("review", reviewSchema);
