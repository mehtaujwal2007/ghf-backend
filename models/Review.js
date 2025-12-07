// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  name: String,
  message: String,
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);
