import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGuard from './components/AuthGuard';

import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import MoodCheck from './pages/MoodCheck';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Protected Route - Needs Auth, but no Profile Required */}
                <Route element={<AuthGuard requireProfile={false} />}>
                    <Route path="/onboarding" element={<Onboarding />} />
                </Route>

                {/* Protected Route - Needs Auth AND Profile */}
                <Route element={<AuthGuard requireProfile={true} />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/mood-check" element={<MoodCheck />} />
                </Route>

                {/* Default Redirect to Dashboard (AuthGuard handles bounces) */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
