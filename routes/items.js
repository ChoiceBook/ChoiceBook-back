const express = require('express');
const router = express.Router();
const pool = require('../config/database');

router.get('/:item_id', async (req, res) => {
  const { item_id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Items WHERE item_id = ?',
      [item_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
