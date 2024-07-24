const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 플롯과 카테고리를 연결하는 엔드포인트
router.post('/', async (req, res) => {
  const { user_id, plot_id } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO UserPlayedPlots (user_id, plot_id) VALUES (?, ?)',
      [user_id, plot_id]
    );

    res.status(201).json({ message: ' Played plot updated successfully' });
  } catch (error) {
    console.error('Error updating played plots:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }

});

module.exports = router;
