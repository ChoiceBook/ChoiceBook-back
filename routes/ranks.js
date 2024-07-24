const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 플롯과 카테고리를 연결하는 엔드포인트
router.post('/', async (req, res) => {
  const { plot_id, user_id, item_id, rank_value } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO Ranks (plot_id, user_id, item_id, rank_value) VALUES (?, ?, ?, ?)',
      [plot_id, user_id, item_id, rank_value]
    );

    res.status(201).json({ message: ' Rank uploaded successfully' });
  } catch (error) {
    console.error('Error updating rank:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }

});

module.exports = router;
