const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all weaves
router.get("/weaves", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM weaves ORDER BY created_at DESC"
    );

    res.json({
      weaves: result.rows
    });

  } catch (error) {
    console.error("Error fetching weaves:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
