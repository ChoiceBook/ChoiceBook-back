const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.post('/', async (req, res) => {
  const { plot_id, user_id, item_id, rank_value } = req.body;

  try {
    // 기존 rank 값 조회
    const [existingRanks] = await pool.query(
      'SELECT rank_value FROM Ranks WHERE plot_id = ? AND item_id = ?',
      [plot_id, item_id]
    );

    let increasement = null;
    if (existingRanks.length > 0) {
      const previousRankValue = existingRanks[0].rank_value;
      increasement = rank_value - previousRankValue;
    }

    const [result] = await pool.query(
      'INSERT INTO Ranks (plot_id, user_id, item_id, rank_value, increasement) VALUES (?, ?, ?, ?, ?)',
      [plot_id, user_id, item_id, rank_value, increasement]
    );

    res.status(201).json({ message: 'Rank uploaded successfully' });
  } catch (error) {
    console.error('Error updating rank:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;

