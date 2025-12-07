const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// POST /api/contact
router.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Please fill all required fields." });
  }

  try {
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();

    res.status(200).json({ message: "Your message has been received!" });
  } catch (error) {
    console.error("Error saving contact:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
