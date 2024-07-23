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

router.post('/', async (req, res) => {
  const { plot_id, item_name, item_image_url } = req.body;

  console.log('Received request body:', req.body);

  try {
    const [result] = await pool.query(
      'INSERT INTO Items (plot_id, item_name, item_image_url) VALUES (?, ?, ?)',
      [plot_id, item_name, item_image_url]
    );

    console.log('Database insert result:', result);

    res.status(201).json({ message: 'Item created successfully', itemId: result.insertId });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Server error occurred' });
  }
});

router.put('/:item_id', async (req, res) => {
  const { item_id } = req.params;
  const { item_image_url } = req.body;

  console.log('Received request to update item:', req.body);

  try {
    const [result] = await pool.query(
      'UPDATE Items SET item_image_url = ? WHERE item_id = ?',
      [item_image_url, item_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    console.log('Item updated successfully:', result);

    res.status(200).json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Server error occurred' });
  }
});

module.exports = router;
