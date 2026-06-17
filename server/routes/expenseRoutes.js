const express = require("express");
const protect = require("../middleware/authMiddleware");
const Expense = require("../models/Expense");
const router = express.Router();

// Get all expenses for user
router.get("/", protect, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        console.error("Error fetching expenses", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Add an expense
router.post("/", protect, async (req, res) => {
    try {
        const { tripName, amount, category, description, date } = req.body;

        if (!tripName || !amount) {
            return res.status(400).json({ message: "Trip name and amount are required" });
        }

        const newExpense = await Expense.create({
            user: req.user._id,
            tripName,
            amount: Number(amount),
            category,
            description,
            date: date ? new Date(date) : Date.now()
        });

        res.status(201).json(newExpense);
    } catch (err) {
        console.error("Error adding expense", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete an expense
router.delete("/:id", protect, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        if (expense.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await expense.deleteOne();
        res.json({ message: "Expense removed" });
    } catch (err) {
        console.error("Error deleting expense", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
