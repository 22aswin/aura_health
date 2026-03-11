import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth, db } from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthGuard = ({ requireProfile = true }) => {
    const [user, setUser] = useState(null);
    const [profileExists, setProfileExists] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    const docRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(docRef);

                    setProfileExists(docSnap.exists());
                } catch (error) {
                    console.error("Error checking profile:", error);
                    setProfileExists(false);
                }
            } else {
                setProfileExists(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-900 border-2 border-calm-teal/20">
                <div className="w-16 h-16 border-4 border-calm-teal border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Use the flag to determine if this route needs a finished profile.
    // /onboarding does not need a finished profile, so requireProfile=false prevents looping back to /onboarding
    if (requireProfile && !profileExists) {
        return <Navigate to="/onboarding" replace />;
    }

    // If user has a profile but tries to go back to onboarding, skip to dashboard.
    if (!requireProfile && profileExists) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default AuthGuard;
