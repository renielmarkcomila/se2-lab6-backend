const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// Enable CORS so your GitHub Pages frontend can talk to Render
app.use(cors());
app.use(express.json());

// 1. Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 2. Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// 3. POST Route: Save mood and get AI response
app.post("/moods", async (req, res) => {
    const { mood, mood_level } = req.body;

    try {
        const prompt = `The user says they are feeling: "${mood}". Give a very short, supportive, and empathetic response (max 2 sentences).`;
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        const sql = "INSERT INTO moods (mood_text, ai_response, mood_level) VALUES (?, ?, ?)";
        db.query(sql, [mood, aiResponse, mood_level], (err, data) => {
            if (err) {
                console.error("DB Error:", err);
                return res.status(500).json(err);
            }
            return res.json({
                message: "Success!",
                ai_response: aiResponse
            });
        });

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "The AI is sleepy right now." });
    }
});

// 4. GET Route: Fetch reflection history
app.get("/moods", (req, res) => {
    const sql = "SELECT * FROM moods ORDER BY created_at DESC";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// 5. Dynamic Port for Render Deployment
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is bumping on port ${PORT}, sah!`);
});