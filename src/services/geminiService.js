import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let ai;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

export const analyzeMood = async (paScore, naScore) => {
    if (!ai) {
        throw new Error("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    const prompt = `
You are Aura, an empathetic wellness assistant for a modern health application. 
A user just completed a PANAS (Positive and Negative Affect Schedule) emotional assessment.

Their Scores:
Positive Affect (PA): ${paScore} / 50 (higher means more energy, concentration, and engagement)
Negative Affect (NA): ${naScore} / 50 (higher means more distress, lethargy, and tension)

Based on these specific scores, return a JSON object with exactly two keys:
1. "summary": A short, conversational, and empathetic explanation of their current emotional state based on the balance of these two scores. Keep it under 3 sentences. Do not use markdown.
2. "suggestions": An array of exactly 3 actionable, highly specific, and practical wellness suggestions tailored to help balance their current state.

Respond ONLY with valid JSON.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const data = JSON.parse(response.text);

        return {
            summary: data.summary || "I've analyzed your PANAS scores.",
            suggestions: data.suggestions || [
                "Take a 5-minute deep breathing break.",
                "Hydrate and stretch your neck and shoulders.",
                "Consider logging a quick journal entry today."
            ]
        };
    } catch (error) {
        console.error("Gemini AI API Error:", error);
        throw error;
    }
};

export const chatWithAura = async (userMessage) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    const systemPrompt = "You are Aura AI, a supportive wellness assistant helping users reflect on their emotions using conversational mood questions inspired by the PANAS framework. Ask reflective questions and give short supportive suggestions. Keep your answer brief and conversational. ";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: systemPrompt + "User Message: " + userMessage }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Invalid response structure from Gemini API");
        }
    } catch (error) {
        console.error("Aura Chat API Error:", error);
        throw error;
    }
};
