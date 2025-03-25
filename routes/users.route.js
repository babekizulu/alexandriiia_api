const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get logged in user profile
router.get("/users/:id", async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Fetch user from database
    const result = await db.query(
      "SELECT id, first_name, last_name, email FROM users WHERE id = $1",
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email
    });

  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
