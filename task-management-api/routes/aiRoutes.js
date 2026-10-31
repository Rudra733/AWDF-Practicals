const express = require("express");
const router = express.Router();
const https = require("https");

/**
 * POST /api/ai/generate-description
 * Accepts { title } in request body.
 * Calls Gemini API via REST (models/gemini-flash-latest).
 * Returns { description, priority, fallback } — always HTTP 200 for graceful degradation.
 * API key is ONLY read from process.env.GEMINI_API_KEY (server-side .env), never exposed to client.
 */
router.post("/generate-description", async (req, res) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Task title is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[AI] GEMINI_API_KEY is not set — returning fallback response");
    return res.status(200).json({
      description: "",
      priority: "medium",
      fallback: true,
      message: "AI service is not configured. Please enter description manually.",
    });
  }

  try {
    const prompt = `You are a helpful task management assistant. Given this task title: "${title.trim()}", do TWO things:
1. Write a concise, actionable task description in 1-2 sentences. Focus on what needs to be done.
2. Suggest a priority level: "low", "medium", or "high" based on the title's urgency.

Respond in this exact JSON format (no markdown, no extra text):
{"description": "...", "priority": "medium"}`;

    const payload = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    });

    // List of models to try in case of temporary high demand spikes
    const candidateModels = [
      "gemini-flash-lite-latest",
      "gemini-flash-latest",
      "gemini-2.5-flash-lite",
      "gemini-3.1-flash-lite",
      "gemini-pro-latest"
    ];

    let lastError = null;
    let rawText = "";

    for (const model of candidateModels) {
      try {
        const aiResponse = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Timeout")), 15000);

          const options = {
            hostname: "generativelanguage.googleapis.com",
            path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
            },
          };

          const reqHttp = https.request(options, (httpRes) => {
            let data = "";
            httpRes.on("data", (chunk) => (data += chunk));
            httpRes.on("end", () => {
              clearTimeout(timeout);
              try {
                resolve({ status: httpRes.statusCode, body: JSON.parse(data) });
              } catch {
                reject(new Error("Failed to parse Gemini response"));
              }
            });
          });

          reqHttp.on("error", (err) => {
            clearTimeout(timeout);
            reject(err);
          });
          reqHttp.write(payload);
          reqHttp.end();
        });

        if (aiResponse.status === 200 && aiResponse.body.candidates?.[0]?.content?.parts?.[0]?.text) {
          rawText = aiResponse.body.candidates[0].content.parts[0].text.trim();
          console.log(`[AI] Successfully used model: ${model}`);
          break;
        } else {
          lastError = aiResponse.body.error?.message || `HTTP ${aiResponse.status}`;
          console.warn(`[AI] Model ${model} returned error: ${lastError}`);
        }
      } catch (err) {
        lastError = err.message;
        console.warn(`[AI] Model ${model} failed: ${err.message}`);
      }
    }

    if (!rawText) {
      console.error("[AI] All Gemini models failed or busy. Last error:", lastError);
      return res.status(200).json({
        description: "",
        priority: "medium",
        fallback: true,
        message: "AI service currently experiencing high demand. Please enter description manually.",
      });
    }

    // Parse the JSON response safely
    let parsed;
    try {
      const jsonStr = rawText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { description: rawText, priority: "medium" };
    }

    console.log(`[AI] Generated description for: "${title}"`);

    return res.status(200).json({
      description: parsed.description || "",
      priority: ["low", "medium", "high"].includes(parsed.priority)
        ? parsed.priority
        : "medium",
      fallback: false,
    });
  } catch (err) {
    console.error("[AI] Gemini API error:", err.message);
    return res.status(200).json({
      description: "",
      priority: "medium",
      fallback: true,
      message: "AI service unavailable. Please enter a description manually.",
    });
  }
});

module.exports = router;
