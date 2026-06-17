const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        tripName: { type: String, required: true },
        amount: { type: Number, required: true },
        category: { type: String, enum: ["Food", "Transport", "Accommodation", "Activities", "Other"], default: "Other" },
        description: { type: String },
        date: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

module.exports = mongoose.model("expense", expenseSchema);
