const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/userController");

router.post("/signup", registerUser); // ✅ Signup route
router.post("/login", loginUser);     // ✅ Login route

module.exports = router;
