import { auth, db } from '../firebase/firebaseConfig';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const getLastWeekMoodData = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];

  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const moodLogsRef = collection(db, 'dailyMoodLogs');

  const q = query(
    moodLogsRef,
    where('userId', '==', currentUser.uid),
    where('date', '>=', sevenDaysAgo.toISOString().split('T')[0]),
    where('date', '<=', today.toISOString().split('T')[0]),
    orderBy('date', 'asc')
  );

  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting last week mood data:', error);
    return [];
  }
};

export const calculateWeeklyAverages = (moodData) => {
  if (moodData.length === 0) {
    return {
      averageMoodScore: 0,
      sleepAverage: 0,
      hydrationAverage: 0,
      activityAverage: 0,
      dailyMoodScores: []
    };
  }

  // Group by date and calculate daily averages
  const dailyData = {};
  moodData.forEach(entry => {
    const date = entry.date;
    if (!dailyData[date]) {
      dailyData[date] = {
        moodScores: [],
        sleepHours: entry.sleepHours,
        waterIntake: entry.waterIntake,
        activityLevel: entry.activityLevel
      };
    }
    dailyData[date].moodScores.push(entry.score);
  });

  const dailyMoodScores = Object.values(dailyData).map(day => {
    const avgMood = day.moodScores.reduce((sum, score) => sum + score, 0) / day.moodScores.length;
    return avgMood;
  });

  const allMoodScores = moodData.map(entry => entry.score);
  const averageMoodScore = allMoodScores.reduce((sum, score) => sum + score, 0) / allMoodScores.length;

  const sleepHours = moodData.map(entry => entry.sleepHours).filter(hours => hours > 0);
  const sleepAverage = sleepHours.length > 0 ? sleepHours.reduce((sum, hours) => sum + hours, 0) / sleepHours.length : 0;

  const waterIntakes = moodData.map(entry => entry.waterIntake).filter(intake => intake > 0);
  const hydrationAverage = waterIntakes.length > 0 ? waterIntakes.reduce((sum, intake) => sum + intake, 0) / waterIntakes.length : 0;

  const activityLevels = moodData.map(entry => entry.activityLevel).filter(level => level > 0);
  const activityAverage = activityLevels.length > 0 ? activityLevels.reduce((sum, level) => sum + level, 0) / activityLevels.length : 0;

  return {
    averageMoodScore: Math.round(averageMoodScore * 10) / 10,
    sleepAverage: Math.round(sleepAverage * 10) / 10,
    hydrationAverage: Math.round(hydrationAverage),
    activityAverage: Math.round(activityAverage),
    dailyMoodScores: dailyMoodScores.map(score => Math.round(score * 10) / 10)
  };
};

export const generateWeeklyMoodAnalysis = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const lastWeekData = await getLastWeekMoodData();

  if (lastWeekData.length === 0) {
    return null;
  }

  const averages = calculateWeeklyAverages(lastWeekData);
  const today = new Date();
  const weekStartDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const prompt = `Analyze this user's weekly mood pattern.

Daily mood scores for 7 days: [${averages.dailyMoodScores.join(', ')}]

Health averages:
- Sleep: ${averages.sleepAverage} hours per night
- Water intake: ${averages.hydrationAverage}ml per day
- Activity level: ${averages.activityAverage} (scale 0-100)
- Average mood score: ${averages.averageMoodScore}/5

Provide a short weekly emotional report and recommendations. Focus on patterns, trends, and actionable wellness advice. Keep it concise and supportive.`;

  try {
    const model = api.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Save weekly report
    await addDoc(collection(db, 'weeklyMoodReports'), {
      userId: currentUser.uid,
      weekStartDate: weekStartDate.toISOString().split('T')[0],
      averageMoodScore: averages.averageMoodScore,
      sleepAverage: averages.sleepAverage,
      hydrationAverage: averages.hydrationAverage,
      activityAverage: averages.activityAverage,
      dailyMoodScores: averages.dailyMoodScores,
      aiSummary: text,
      timestamp: new Date()
    });

    return {
      summary: text,
      averages
    };
  } catch (error) {
    console.error('Error generating weekly mood analysis:', error);
    return null;
  }
};

export const getLatestWeeklyReport = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const weeklyReportsRef = collection(db, 'weeklyMoodReports');

  const q = query(
    weeklyReportsRef,
    where('userId', '==', currentUser.uid),
    orderBy('timestamp', 'desc'),
    where('timestamp', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  );

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  } catch (error) {
    console.error('Error getting latest weekly report:', error);
    return null;
  }
};

export const getLatestDailyReport = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const dailyReportsRef = collection(db, 'dailyMoodReports');

  const q = query(
    dailyReportsRef,
    where('userId', '==', currentUser.uid),
    orderBy('timestamp', 'desc'),
    where('timestamp', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))
  );

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  } catch (error) {
    console.error('Error getting latest daily report:', error);
    return null;
  }
};
