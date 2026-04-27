
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json({ limit: "4mb" }));

// Placeholder — will configure Azure OpenAI later
app.post("/api/ai", async (req, res) => {
  res.json({
    text: JSON.stringify(
      [
        {
          id: "example_field",
          label: "Example Field",
          description: "This is a placeholder response"
        }
      ],
      null,
      2
    )
  });
});

app.listen(3001, () => {
  console.log("✅ Backend running on http://localhost:3001");
});
