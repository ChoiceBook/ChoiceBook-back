//필요한 모듈 불러오기
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/database');

const authRoutes = require('./routes/auth')
//const plotRoutes = require('./routes/plot')

//Express 애플리케이션 생성 및 포트 설정
const app = express();
const port = process.env.PORT;

//미들웨어 설정
app.use(cors());
app.use(express.json());
//app.options('*'.ors());

//라우트 설정
app.use('/api/auth', authRoutes);
//app.use('api/plot', plotRoutes)

//서버 시작
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
});

app.get('/api/users/:user_id/categories/:category_id/plots', async (req, res) => {
  const { user_id, category_id } = req.params;
  try {
      const [rows] = await pool.query(
          `SELECT Plots.*
           FROM Plots
           JOIN UserPlayedPlots ON Plots.plot_id = UserPlayedPlots.plot_id
           JOIN PlotCategories ON Plots.plot_id = PlotCategories.plot_id
           WHERE UserPlayedPlots.user_id = ? AND PlotCategories.category_id = ?`,
          [user_id, category_id]
      );
      res.json(rows);
  } catch (error) {
      console.error('Error fetching plots:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

app.get('/api/plots/:plot_id/users/:user_id/ranks', async (req, res) => {
  const { plot_id, user_id } = req.params;
  try {
      const [rows] = await pool.query(
        'SELECT rank_id, plot_id, user_id, item_id, rank_value, ranked_at FROM Ranks WHERE plot_id = ? AND user_id = ? ORDER BY rank_value',          [plot_id, user_id]
      );
      res.json(rows);
  } catch (error) {
      console.error('Error fetching ranks:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

app.get('/api/items/:item_id', async (req, res) => {
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


