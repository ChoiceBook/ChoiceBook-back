const express = require('express');
const router = express.Router();
const pool = require('../config/database');


router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Plots');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching plots:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.get('/:plot_id', async (req, res) => {
  const { plot_id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Plots WHERE plot_id = ?',
      [plot_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching plot:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.get('/:plot_id/items', async (req, res) => {
  const { plot_id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT * FROM Items WHERE plot_id = ?`,
      [plot_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching items for plot:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});


router.get('/:plot_id/users/:user_id/ranks', async (req, res) => {
    const { plot_id, user_id } = req.params;
    try {
        const [rows] = await pool.query(
          'SELECT rank_id, plot_id, user_id, item_id, rank_value, ranked_at FROM Ranks WHERE plot_id = ? AND user_id = ? ORDER BY rank_value',          [plot_id, user_id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching ranks:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
  });

module.exports = router;
