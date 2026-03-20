import { auth, db } from '../firebase/firebaseConfig';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const getCurrentSession = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
        return 'morning';
    } else if (hour >= 12 && hour < 18) {
        return 'afternoon';
    } else {
        return 'evening';
    }
};

export const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
};

export const checkSessionCompleted = async (sessionType) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    const today = getTodayDateString();
    const moodLogsRef = collection(db, 'dailyMoodLogs');

    const q = query(
        moodLogsRef,
        where('userId', '==', currentUser.uid),
        where('date', '==', today),
        where('sessionType', '==', sessionType)
    );

    try {
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking session completion:', error);
        return false;
    }
};

export const getTodayMoodData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    const today = getTodayDateString();
    const moodLogsRef = collection(db, 'dailyMoodLogs');

    const q = query(
        moodLogsRef,
        where('userId', '==', currentUser.uid),
        where('date', '==', today),
        orderBy('timestamp', 'asc')
    );

    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Error getting today mood data:', error);
        return [];
    }
};

export const getHealthDataForToday = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return { sleepHours: 0, waterIntake: 0, nutritionScore: 0, activityLevel: 0 };

    const today = getTodayDateString();

    try {
        // Get sleep data
        const sleepRef = collection(db, 'sleepLogs');
        const sleepQuery = query(
            sleepRef,
            where('userId', '==', currentUser.uid),
            where('date', '==', today),
            limit(1)
        );
        const sleepSnapshot = await getDocs(sleepQuery);
        const sleepData = sleepSnapshot.docs[0]?.data() || {};
        const sleepHours = sleepData.hours || 0;

        // Get water data
        const waterRef = collection(db, 'waterLogs');
        const waterQuery = query(
            waterRef,
            where('userId', '==', currentUser.uid),
            where('date', '==', today),
            limit(1)
        );
        const waterSnapshot = await getDocs(waterQuery);
        const waterData = waterSnapshot.docs[0]?.data() || {};
        const waterIntake = waterData.amount || 0;

        // Get nutrition data (average calories from scans)
        const nutritionRef = collection(db, 'nutritionLogs');
        const nutritionQuery = query(
            nutritionRef,
            where('userId', '==', currentUser.uid),
            where('date', '==', today)
        );
        const nutritionSnapshot = await getDocs(nutritionQuery);
        const nutritionDocs = nutritionSnapshot.docs;
        let nutritionScore = 0;
        if (nutritionDocs.length > 0) {
            const totalCalories = nutritionDocs.reduce((sum, doc) => sum + (doc.data().calories || 0), 0);
            nutritionScore = totalCalories / nutritionDocs.length;
        }

        // Get activity data (placeholder - would integrate with activity tracker)
        const activityLevel = 50; // Default placeholder value

        return {
            sleepHours,
            waterIntake,
            nutritionScore,
            activityLevel
        };
    } catch (error) {
        console.error('Error getting health data:', error);
        return { sleepHours: 0, waterIntake: 0, nutritionScore: 0, activityLevel: 0 };
    }
};

export const saveMoodResponse = async (questionId, score, sessionType) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');

    const healthData = await getHealthDataForToday();
    const today = getTodayDateString();

    try {
        const docRef = await addDoc(collection(db, 'dailyMoodLogs'), {
            userId: currentUser.uid,
            date: today,
            sessionType,
            questionId,
            score,
            sleepHours: healthData.sleepHours,
            waterIntake: healthData.waterIntake,
            nutritionScore: healthData.nutritionScore,
            activityLevel: healthData.activityLevel,
            timestamp: new Date()
        });

        return docRef.id;
    } catch (error) {
        console.error("Error saving mood assessment:", error);
        throw error;
    }
};

export const generateDailyMoodAnalysis = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const todayMoodData = await getTodayMoodData();
    const healthData = await getHealthDataForToday();

    if (todayMoodData.length < 3) {
        return null; // Need all 3 sessions for daily analysis
    }

    const morningScore = todayMoodData.find(d => d.sessionType === 'morning')?.score || 0;
    const afternoonScore = todayMoodData.find(d => d.sessionType === 'afternoon')?.score || 0;
    const eveningScore = todayMoodData.find(d => d.sessionType === 'evening')?.score || 0;

    const prompt = `A user completed their daily mood check.

Morning Mood: ${morningScore}/5
Afternoon Mood: ${afternoonScore}/5
Evening Mood: ${eveningScore}/5

Health Inputs:
Sleep Hours: ${healthData.sleepHours}
Water Intake: ${healthData.waterIntake}ml
Nutrition Score: ${healthData.nutritionScore} calories
Activity Level: ${healthData.activityLevel}

Explain the user's emotional condition today and provide 3 wellness suggestions. Keep the response concise and supportive.`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Save daily analysis
        await addDoc(collection(db, 'dailyMoodReports'), {
            userId: currentUser.uid,
            date: getTodayDateString(),
            morningScore,
            afternoonScore,
            eveningScore,
            healthData,
            aiSummary: text,
            timestamp: new Date()
        });

        return text;
    } catch (error) {
        console.error('Error generating daily mood analysis:', error);
        return null;
    }
};

export const saveFullMoodAssessment = async (sessionType, questionId, score) => {
    return await saveMoodAssessment(sessionType, questionId, score);
};
