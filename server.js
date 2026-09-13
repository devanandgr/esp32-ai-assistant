const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("ESP32 AI ASSISTANT SERVER OK");
});

app.get("/ask", async (req, res) => {
  try {
    const question = req.query.text;

    if (!question) {
      return res.status(400).json({
        error: "Please provide ?text=your question"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: question
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No answer received";

    res.json({
      question: question,
      answer: answer
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Gemini connection failed",
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
