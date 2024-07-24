const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// 플롯과 카테고리를 연결하는 엔드포인트
router.post('/', async (req, res) => {
  const { user_id, plot_id } = req.body;

  try {
    // 기존 항목 존재 여부 확인
    const [existingEntries] = await pool.query(
      'SELECT * FROM UserPlayedPlots WHERE user_id = ? AND plot_id = ?',
      [user_id, plot_id]
    );

    if (existingEntries.length > 0) {
      return res.status(200).json({ message: 'This plot has already been played by the user.' });
    }

    // 새로운 항목 삽입
    const [result] = await pool.query(
      'INSERT INTO UserPlayedPlots (user_id, plot_id) VALUES (?, ?)',
      [user_id, plot_id]
    );

    res.status(201).json({ message: 'Played plot updated successfully' });
  } catch (error) {
    console.error('Error updating played plots:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }

});

module.exports = router;
