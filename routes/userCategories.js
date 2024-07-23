const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get plots by user ID and category ID
router.get('/users/:user_id/categories/:category_id/plots', async (req, res) => {
  const { user_id, category_id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT Plots.*
       FROM Plots
       JOIN UserPlayedPlots ON Plots.plot_id = UserPlayedPlots.plot_id
       JOIN PlotCategories ON Plots.plot_id = PlotCategories.plot_id
       WHERE UserPlayedPlots.user_id = ? AND PlotCategories.category_id = ?`,
      [user_id, category_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching plots:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Define other user category routes here

module.exports = router;
