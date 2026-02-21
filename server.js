require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect(err => {
    if (err) return console.error("❌ DB Connection failed:", err);
    console.log("✅ Connected to Railway MySQL!");
});

app.get('/moods', (req, res) => {
    db.query('SELECT * FROM moods ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.post('/moods', (req, res) => {
    const { mood_level, journal_entry } = req.body;
    
    // 🤖 AI Logic for Lab 6 Verification
    let ai_suggestion = "";
    if (mood_level <= 3) ai_suggestion = "It sounds like a tough day. Take a deep breath and remember it's okay to rest. 🌿";
    else if (mood_level <= 6) ai_suggestion = "You're holding steady. Small steps are still progress! ✨";
    else if (mood_level <= 8) ai_suggestion = "Solid energy! Keep focusing on what makes you happy. 🚀";
    else ai_suggestion = "Incredible vibes! You're absolutely glowing today! 🔥";

    const query = 'INSERT INTO moods (mood_level, journal_entry) VALUES (?, ?)';
    db.query(query, [mood_level, journal_entry], (err, result) => {
        if (err) return res.status(500).send(err);
        // Send the AI response back to the frontend
        res.status(201).send({ 
            message: 'Mood recorded!', 
            ai_response: ai_suggestion 
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server vibing on port ${PORT}`));