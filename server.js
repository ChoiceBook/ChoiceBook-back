//필요한 모듈 불러오기
const express = require('express');
const cors = require('cors');
require('dotenv').config();

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
app.use('/api/auth', authRoutes)
//app.use('api/plot', plotRoutes)

//서버 시작
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

