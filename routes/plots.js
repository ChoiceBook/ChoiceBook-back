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

router.get('/:plot_id/random-image', async (req, res) => {
  const { plot_id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT item_image_url FROM Items WHERE plot_id = ?',
      [plot_id]
    );

    if (rows.length > 0) {
      const randomItem = rows[Math.floor(Math.random() * rows.length)];
      res.json({ item_image_url: randomItem.item_image_url });
    } else {
      res.status(404).json({ error: 'Plot not found or no items available' });
    }
  } catch (error) {
    console.error('Error fetching random image:', error);
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

router.delete('/:plot_id', async (req, res) => {
  const { plot_id } = req.params;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Delete from UserPlayedPlots
    await connection.query(
      'DELETE FROM UserPlayedPlots WHERE plot_id = ?',
      [plot_id]
    );

    // Delete from PlotCategories
    await connection.query(
      'DELETE FROM PlotCategories WHERE plot_id = ?',
      [plot_id]
    );

    // Delete from Plots
    const [result] = await connection.query(
      'DELETE FROM Plots WHERE plot_id = ?',
      [plot_id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Plot not found' });
    }

    await connection.commit();
    res.status(200).json({ message: 'Plot deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting plot:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  } finally {
    connection.release();
  }
});

module.exports = router;
