import { db, auth } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

export const checkSessionCompleted = async (sessionType) => {
    try {
        const user = auth.currentUser;
        if (!user) return false;

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const sessionDateId = `${today}_${sessionType}`;

        const q = query(
            collection(db, 'moodLogs'),
            where('userId', '==', user.uid),
            where('sessionDateId', '==', sessionDateId)
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking session completion:", error);
        return false;
    }
};

export const saveMoodAssessment = async ({ sessionType, questionsAsked, positiveAffect, negativeAffect, answers, aiSummary, suggestions }) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error("User must be logged in to save mood assessments");
        }

        const today = new Date().toISOString().split('T')[0];
        const sessionDateId = `${today}_${sessionType}`;

        const docRef = await addDoc(collection(db, 'moodLogs'), {
            userId: user.uid,
            sessionType,
            sessionDateId,
            questionsAsked,
            positiveAffect,
            negativeAffect,
            answers,
            aiSummary,
            suggestions,
            timestamp: serverTimestamp()
        });

        return docRef.id;
    } catch (error) {
        console.error("Error saving mood assessment:", error);
        throw error;
    }
};
