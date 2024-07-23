const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const multer = require('multer');

// Middleware for logging requests and responses
router.use((req, res, next) => {
  console.log('Incoming Request:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Store the original send method
  const originalSend = res.send;

  // Replace the send method with a custom function
  res.send = function (body) {
    console.log('Outgoing Response:', {
      statusCode: res.statusCode,
      body: body
    });
    // Call the original send method
    return originalSend.call(this, body);
  };

  next();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.originalname}`);
  }
});

const upload = multer({ storage });

// Get all plots
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Plots');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching plots:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Get plot by ID
router.get('/:plot_id', async (req, res) => {
  const { plot_id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM Plots WHERE plot_id = ?', [plot_id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching plot:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// Get items for a plot
router.get('/:plot_id/items', async (req, res) => {
  const { plot_id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM Items WHERE plot_id = ?', [plot_id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching items for plot:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.post('/', async (req, res) => {
  const { user_id, title, description } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO Plots (user_id, title, description, created_at) VALUES (?, ?, ?, NOW())',
      [user_id, title, description]
    );

    res.status(201).json({ message: '플롯이 성공적으로 생성되었습니다.', plot_id: result.insertId });
  } catch (error) {
    console.error('플롯 생성 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
