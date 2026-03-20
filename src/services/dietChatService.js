import { auth, db } from '../firebase/firebaseConfig';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';

export const sendMessageToDietAI = async (message) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in");

    // Fetch user profile
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const profile = userDoc.exists() ? userDoc.data() : null;
    
    const age = profile?.age || "Not specified";
    const weight = profile?.weight || "Not specified";
    const height = profile?.height || "Not specified";
    const activity = profile?.activityLevel || "Not specified";

    const prompt = `You are a nutrition expert.
User details:
Age: ${age}
Weight: ${weight}
Height: ${height}
Activity Level: ${activity}

User query: ${message}

Provide a personalized diet suggestion with meals and brief explanation. Keep the response clean and easy to read.`;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API key is missing");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) throw new Error("AI Integration Failed");
        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Save to Firestore
        await addDoc(collection(db, 'dietChatLogs'), {
            userId: user.uid,
            message: message,
            response: aiResponse,
            timestamp: new Date()
        });

        return aiResponse;
    } catch (error) {
        console.error("Diet Chat Error:", error);
        throw error;
    }
};
