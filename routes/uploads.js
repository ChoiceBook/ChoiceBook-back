const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Set the destination folder
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`); // Set the file name
  }
});

const upload = multer({ storage: storage });

// Upload single file
router.post('/', upload.single('file'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }
    res.status(200).json({
      message: '파일 업로드 성공',
      file: {
        filename: file.filename,
        path: file.path,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;
