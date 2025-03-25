const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all research topics
router.get("/research-topics", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM research_topics ORDER BY created_at DESC"
    );

    res.json({
      topics: result.rows
    });

  } catch (error) {
    console.error("Error fetching research topics:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
