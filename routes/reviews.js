// routes/reviews.js
import express from "express";
import Review from "../models/Review.js";
const router = express.Router();

// POST: Add review
router.post("/reviews", async (req, res) => {
  try {
    const { name, message } = req.body;
    const newReview = new Review({ name, message });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: "Review creation failed" });
  }
});

// GET: Fetch reviews
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

export default router;
