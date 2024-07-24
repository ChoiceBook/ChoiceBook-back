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

router.post('/', async (req, res) => {
    const { user_id, title, description } = req.body;
    try {
      const [result] = await pool.query(
        'INSERT INTO Plots (user_id, title, description) VALUES (?, ?, ?)',
        [user_id, title, description]
      );
      res.status(201).json({ message: 'Plot created successfully', plotId: result.insertId });
    } catch (error) {
      console.error('Error creating plot:', error);
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
    const query = `
      SELECT 
        r.rank_id, 
        r.plot_id, 
        r.user_id, 
        r.item_id, 
        r.rank_value, 
        r.ranked_at,
        r.increasement
      FROM Ranks r
      JOIN (
        SELECT item_id, MAX(ranked_at) AS latest_ranked_at
        FROM Ranks
        WHERE plot_id = ? AND user_id = ?
        GROUP BY item_id
      ) latest_ranks
      ON r.item_id = latest_ranks.item_id AND r.ranked_at = latest_ranks.latest_ranked_at
      WHERE r.plot_id = ? AND r.user_id = ?
      ORDER BY r.rank_value;
    `;

    const [rows] = await pool.query(query, [plot_id, user_id, plot_id, user_id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching ranks:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});




module.exports = router;
