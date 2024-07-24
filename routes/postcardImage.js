const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // 데이터베이스 연결을 위한 pool 가져오기

router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
      SELECT i.item_image_url
      FROM Ranks r
      JOIN Items i ON r.item_id = i.item_id
      WHERE r.user_id = ? AND r.rank_value = 1
      ORDER BY r.rank_id DESC
      LIMIT 1
    `;

    const [rows] = await pool.query(query, [user_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No rank found for the given user_id' });
    }

    res.json({ imageUrl: rows[0].item_image_url });
  } catch (error) {
    console.error('Error fetching postcard image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
