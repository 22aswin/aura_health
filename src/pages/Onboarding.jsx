import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowRight, Activity, User, Scale, Ruler, Heart } from 'lucide-react';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [profile, setProfile] = useState({
        name: '',
        age: '',
        gender: '',
        height: '',
        weight: '',
        activityLevel: 'Moderate'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = async () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            setLoading(true);
            setError(null);
            try {
                const user = auth.currentUser;
                if (!user) throw new Error("No authenticated user found.");

                await setDoc(doc(db, 'users', user.uid), {
                    name: profile.name,
                    age: Number(profile.age),
                    gender: profile.gender,
                    height: Number(profile.height),
                    weight: Number(profile.weight),
                    activityLevel: profile.activityLevel,
                    createdAt: serverTimestamp()
                });

                navigate('/dashboard');
            } catch (err) {
                console.error("Error saving profile: ", err);
                setError("Failed to save profile. Please try again.");
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-calm-teal/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-calm-purple/10 rounded-full blur-[120px] mix-blend-screen animate-float"></div>

            <div className="glass-card p-12 w-full max-w-2xl relative z-10 mx-4">
                <div className="mb-8 flex items-center justify-center gap-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-500 ${i === step ? 'w-12 bg-calm-teal shadow-glow' :
                                i < step ? 'w-8 bg-calm-teal/50' : 'w-8 bg-glass-border'
                                }`}
                        />
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-calm-pink/10 border border-calm-pink/30 rounded-xl text-calm-pink text-sm text-center">
                        {error}
                    </div>
                )}

                <div className="min-h-[300px] flex flex-col justify-center">
                    {step === 1 && (
                        <div className="animate-fade-in-up w-full max-w-md mx-auto space-y-6">
                            <h2 className="text-3xl font-bold text-white text-center mb-6">Basic Information</h2>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                                <input
                                    type="text" name="name" placeholder="Full Name" value={profile.name} onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-glass-border rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-calm-teal text-white placeholder-white/30"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <input
                                        type="number" name="age" placeholder="Age" value={profile.age} onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-glass-border rounded-xl px-4 py-4 focus:outline-none focus:border-calm-teal text-white placeholder-white/30"
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <select
                                        name="gender" value={profile.gender} onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-glass-border rounded-xl px-4 py-4 focus:outline-none focus:border-calm-teal text-white appearance-none"
                                    >
                                        <option value="" disabled>Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in-up w-full max-w-md mx-auto space-y-6">
                            <h2 className="text-3xl font-bold text-white text-center mb-6">Body Metrics</h2>
                            <div className="relative">
                                <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                                <input
                                    type="number" name="height" placeholder="Height in cm" value={profile.height} onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-glass-border rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-calm-teal text-white placeholder-white/30"
                                />
                            </div>
                            <div className="relative">
                                <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                                <input
                                    type="number" name="weight" placeholder="Weight in kg" value={profile.weight} onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-glass-border rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-calm-teal text-white placeholder-white/30"
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fade-in-up w-full max-w-md mx-auto space-y-6">
                            <h2 className="text-3xl font-bold text-white text-center mb-6">Lifestyle</h2>
                            <div className="relative">
                                <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                                <select
                                    name="activityLevel" value={profile.activityLevel} onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-glass-border rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-calm-teal text-white appearance-none"
                                >
                                    <option value="Sedentary">Sedentary (Little to no exercise)</option>
                                    <option value="Light">Light (Exercise 1-3 days/week)</option>
                                    <option value="Moderate">Moderate (Exercise 3-5 days/week)</option>
                                    <option value="Active">Active (Exercise 6-7 days/week)</option>
                                    <option value="Very Active">Very Active (Intense exercise daily)</option>
                                </select>
                            </div>
                            <p className="text-white/60 text-sm text-center mt-4">
                                This helps Aura calibrate your personal wellness twin.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-12 flex justify-center">
                    <button
                        onClick={handleNext}
                        disabled={loading || (step === 1 && (!profile.name || !profile.age || !profile.gender)) || (step === 2 && (!profile.height || !profile.weight))}
                        className="px-8 py-4 rounded-xl font-bold flex items-center gap-3 bg-gradient-to-r from-calm-teal to-calm-blue text-slate-900 shadow-glow transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? 'Saving...' : step === 3 ? 'Enter Dashboard' : 'Continue'}
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;

// Add some Tailwind animations if not present
// Could also be added via index.css
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in-up {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
  }
`;
document.head.appendChild(style);
