import { auth, db } from '../firebase/firebaseConfig';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const getPast7DaysReports = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    const reportsRef = collection(db, 'dailyMoodReports');
    const q = query(
        reportsRef,
        where('userId', '==', currentUser.uid),
        orderBy('date', 'desc'),
        limit(7)
    );

    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Error fetching past week reports:', error);
        return [];
    }
};

export const generateWeeklyReport = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User must be logged in");

    const pastReports = await getPast7DaysReports();
    if (pastReports.length === 0) {
        throw new Error("Not enough data to generate a weekly report. Please complete more daily mood checks!");
    }

    // Format the past week's data to feed into Gemini
    const summaryData = pastReports.map(report => `
Date: ${report.date}
Morning Score: ${report.morningScore || 0}/5
Afternoon Score: ${report.afternoonScore || 0}/5
Evening Score: ${report.eveningScore || 0}/5
Health Factors: Sleep (${report.healthData?.sleepHours || 0}h), Water (${report.healthData?.waterIntake || 0}ml)
Daily AI Summary: ${report.aiSummary || 'None'}
    `).join('\n---\n');

    const prompt = `You are an expert wellness coach. Review the user's mood and health data over the past week (up to 7 days).
    
Past Week Data:
${summaryData}

Write a comprehensive "Weekly Emotional & Wellness Report." Include:
1. Overall Trend Analysis
2. Sleep & Hydration Impact on Mood
3. Areas of Improvement
4. 3 Actionable Goals for Next Week

Format entirely in Markdown.`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Save weekly report
        const today = new Date().toISOString().split('T')[0];
        const docRef = await addDoc(collection(db, 'weeklyMoodReports'), {
            userId: currentUser.uid,
            dateGenerated: today,
            aiSummary: text,
            daysAnalyzed: pastReports.length,
            timestamp: new Date()
        });

        return { id: docRef.id, text, date: today };
    } catch (error) {
        console.error('Error generating weekly report:', error);
        throw error;
    }
};

export const fetchLatestWeeklyReport = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const reportsRef = collection(db, 'weeklyMoodReports');
    const q = query(
        reportsRef,
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(1)
    );

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        return querySnapshot.docs[0].data();
    } catch (error) {
        console.error('Error fetching latest weekly report:', error);
        return null;
    }
}
