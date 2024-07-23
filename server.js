const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const pool = require('./config/database');

const authRoutes = require('./routes/auth');
const plotRoutes = require('./routes/plots');
const userRoutes = require('./routes/users');
const itemRoutes = require('./routes/items');
const plotCategoryRoutes = require('./routes/plotcategories'); // 새로운 라우트 추가

// Express 애플리케이션 생성 및 포트 설정
const app = express();
const port = process.env.PORT || 80; // 포트를 80으로 설정

// 미들웨어 설정
app.use(cors({
  origin: ['http://localhost:3000', 'https://kcloudvpn.kaist.ac.kr'],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'POST') {
    console.log(`${req.method} request to ${req.url} at ${new Date().toISOString()}`);
  }
  next();
});

app.options('*', cors()); // 올바른 CORS 설정

// 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/plots', plotRoutes);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/plotcategories', plotCategoryRoutes); // 새로운 라우트 추가

// 서버 시작
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
