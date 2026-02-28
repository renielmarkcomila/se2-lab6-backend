const { GoogleGenerativeAI } = require("@google/generative-ai"); // Essential Import!
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// 1. Initialize Gemini with your key from Render Environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 2. Database Connection (Using your existing Railway setup)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// 3. The "Real AI" Route (Matching your Vue frontend call)
app.post("/moods", async (req, res) => {
    const { mood } = req.body;

    try {
        // AI Logic: Actually generating a response now, G!
        const prompt = `The user says they are feeling: "${mood}". Give a very short, supportive, and empathetic response (max 2 sentences).`;
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        // Save to MySQL
        const sql = "INSERT INTO moods (mood_text, ai_response) VALUES (?, ?)";
        db.query(sql, [mood, aiResponse], (err, data) => {
            if (err) {
                console.error("DB Error:", err);
                return res.status(500).json(err);
            }
            
            // Return the REAL AI message to your Vue frontend
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

// 4. Dynamic Port for Render Deployment
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is bumping on port ${PORT}, sah!`);
});