const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const router = express.Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// 유틸리티 함수: 토큰 생성
const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// 회원가입 라우트
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('회원가입 요청을 받았습니다:', { email });

        // 이메일 중복 체크
        const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (users.length > 0) {
            return res.status(400).json({ message: '이미 존재하는 이메일입니다.' });
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 새 사용자 등록
        await pool.query('INSERT INTO Users (email, password) VALUES (?, ?)', [email, hashedPassword]);
        console.log('사용자 등록 성공:', { email });

        res.status(201).json({ message: '회원가입이 완료되었습니다.' });
    } catch (error) {
        console.error('회원가입 중 오류 발생:', error.message);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// 로그인 라우트
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('로그인 요청을 받았습니다:', { email });

        // 사용자 조회
        const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (users.length === 0) {
            console.log('가입되지 않은 이메일입니다.');
            return res.status(401).json({ message: '가입되지 않은 이메일입니다.' });
        }
        const user = users[0];
        console.log('유저', user.username);
        
        // 비밀번호 검증
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('잘못된 비밀번호입니다.');
            return res.status(401).json({ message: '잘못된 비밀번호입니다.' });
        }

        // Access Token 생성
        const accessToken = generateAccessToken(user.user_id);

        // Refresh Token 생성
        const refreshToken = generateRefreshToken(user.user_id);

        // 데이터베이스에 Refresh Token 저장
        await pool.query('UPDATE Users SET refresh_token = ? WHERE user_id = ?', [refreshToken, user.user_id]);
        console.log('로그인 성공: ', user.username);
        res.json({ userId: user.user_id, email, accessToken, refreshToken });
    } catch (error) {
        console.error('로그인 중 오류 발생:', error.message);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});

// Refresh Token 라우트
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh Token이 제공되지 않았습니다.' });
        }

        // Refresh Token 검증
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        const [users] = await pool.query('SELECT * FROM Users WHERE user_id = ? AND refresh_token = ?', [decoded.userId, refreshToken]);
        if (users.length === 0) {
            return res.status(401).json({ message: '유효하지 않은 Refresh Token입니다.' });
        }

        const user = users[0];
        
        // 새로운 Access Token 생성
        const newAccessToken = generateAccessToken(user.user_id);

        res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error('Refresh Token 검증 중 오류 발생:', error.message);
        res.status(401).json({ message: 'Refresh Token이 만료되었거나 유효하지 않습니다. 다시 로그인해주세요.' });
    }
});

module.exports = router;
