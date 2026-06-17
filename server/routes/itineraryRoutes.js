const express = require("express");
const router = express.Router();
// We will use axios for potential API calls or just heuristics
const axios = require("axios");

router.post("/", async (req, res) => {
    try {
        const { placeName, duration = 3, placeType = "City Exploration" } = req.body;

        if (!placeName) {
            return res.status(400).json({ message: "placeName is required" });
        }

        const days = parseInt(duration, 10);
        const itinerary = [];

        // Check if Gemini API key is provided
        if (process.env.GEMINI_API_KEY) {
            try {
                // Simplified call to Gemini via Google Generative AI REST API
                const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
                const prompt = `Create a ${days}-day travel itinerary for ${placeName}. The trip type is ${placeType}. Format as JSON array of objects, where each object has a "day" (number), "title" (string), and "activities" (array of strings). Do not include any other text or markdown, just the raw JSON.`;
                
                const response = await axios.post(url, {
                    contents: [{ parts: [{ text: prompt }] }]
                });

                const text = response.data.candidates[0].content.parts[0].text;
                // Parse the JSON string (might have backticks, so clean it)
                const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
                const aiItinerary = JSON.parse(cleanedText);
                return res.json({ source: "AI", itinerary: aiItinerary });
            } catch (aiError) {
                console.error("AI Generation failed, falling back to heuristics:", aiError.message);
            }
        }

        // Fallback Heuristic Itinerary (Option B behavior)
        for (let i = 1; i <= days; i++) {
            let activities = [];
            let title = `Day ${i} in ${placeName}`;

            if (i === 1) {
                title = "Arrival & Acclimation";
                activities = [
                    "Check into your accommodation and freshen up.",
                    `Take a light walk around the main square of ${placeName}.`,
                    "Enjoy a local welcome dinner."
                ];
            } else if (i === days) {
                title = "Farewell & Departure";
                activities = [
                    "Last-minute souvenir shopping.",
                    "Enjoy a relaxed brunch.",
                    "Head to the airport/station for departure."
                ];
            } else {
                if (placeType.includes("Beach")) {
                    title = "Sun, Sand & Sea";
                    activities = ["Morning beach relaxation.", "Afternoon water sports or snorkeling.", "Seafood dinner by the coast."];
                } else if (placeType.includes("Mountain")) {
                    title = "Adventure & Nature";
                    activities = ["Early morning hike to a scenic viewpoint.", "Picnic lunch in nature.", "Evening campfire or cozy lodge dinner."];
                } else if (placeType.includes("Historical")) {
                    title = "Culture & Heritage";
                    activities = ["Visit the most famous local museum or ruins.", "Guided walking tour of the old town.", "Traditional cultural performance or dinner."];
                } else {
                    title = "City Exploration";
                    activities = ["Visit a famous landmark or monument.", "Explore the local markets.", "Enjoy the vibrant nightlife."];
                }
            }
            itinerary.push({ day: i, title, activities });
        }

        res.json({ source: "Heuristic", itinerary });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error generating itinerary" });
    }
});

module.exports = router;
