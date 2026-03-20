import React, { useRef, useState, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { auth, db } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const NutritionScanner = () => {
    const videoRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [foodInfo, setFoodInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const codeReader = useRef(new BrowserMultiFormatReader());

    useEffect(() => {
        return () => {
            codeReader.current.reset();
        };
    }, []);

    const fetchNutritionData = async (barcode) => {
        setIsLoading(true);
        console.log('Fetching nutrition data for barcode:', barcode);
        try {
            const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
            console.log('API response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API response data:', data);

            if (data.status === 1 && data.product) {
                const product = data.product;
                const nutritionData = {
                    name: product.product_name || 'Unknown Product',
                    brand: product.brands || 'Unknown Brand',
                    calories: product.nutriments?.['energy-kcal'] || 0,
                    protein: product.nutriments?.proteins || 0,
                    fat: product.nutriments?.fat || 0,
                    sugar: product.nutriments?.sugars || 0
                };

                console.log('Processed nutrition data:', nutritionData);
                setFoodInfo(nutritionData);

                // Store in Firestore if user is authenticated
                const currentUser = auth.currentUser;
                if (currentUser) {
                    try {
                        await addDoc(collection(db, 'nutritionLogs'), {
                            userId: currentUser.uid,
                            barcode: barcode,
                            foodName: nutritionData.name,
                            calories: nutritionData.calories,
                            protein: nutritionData.protein,
                            fat: nutritionData.fat,
                            sugar: nutritionData.sugar,
                            timestamp: serverTimestamp()
                        });
                        console.log('Nutrition data saved to Firestore');
                    } catch (firestoreError) {
                        console.error('Error storing nutrition data:', firestoreError);
                    }
                }
            } else {
                console.log('No product found in API response');
                setFoodInfo(null);
                setError('No nutrition data found for this barcode.');
            }
        } catch (error) {
            console.error('Error fetching nutrition data:', error);
            setFoodInfo(null);
            setError('Failed to fetch nutrition data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const startScanning = async () => {
        try {
            setError(null);
            setIsScanning(true);
            setScanResult(null);
            setFoodInfo(null);

            const videoInputDevices = await codeReader.current.listVideoInputDevices();
            const selectedDeviceId = videoInputDevices[0].deviceId;

            codeReader.current.decodeFromVideoDevice(
                selectedDeviceId,
                videoRef.current,
                (result, err) => {
                    if (result) {
                        const barcode = result.getText();
                        console.log('Barcode scanned:', barcode);
                        setScanResult(barcode);
                        codeReader.current.reset();
                        setIsScanning(false);
                        fetchNutritionData(barcode);
                    }
                    if (err && err.name !== 'NotFoundException') {
                        console.error('Scanning error:', err);
                    }
                }
            );
        } catch (err) {
            setError('Could not access camera. Please check permissions.');
            setIsScanning(false);
        }
    };

    const stopScanning = () => {
        codeReader.current.reset();
        setIsScanning(false);
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 h-full">
            <div className="glass-card p-8 w-full max-w-2xl text-center">
                <div className="flex items-center justify-center mb-6">
                    <div className="p-4 bg-gradient-to-br from-calm-teal to-calm-blue rounded-2xl shadow-glow">
                        <Camera size={40} className="text-slate-900" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-calm-teal to-calm-blue mb-4">
                    Nutrition Scanner
                </h2>
                <p className="text-white/70 mb-8 max-w-md mx-auto">
                    Scan your food barcode to instantly log nutrition facts straight into your wellness dashboard.
                </p>

                <div className="relative aspect-video w-full max-w-lg mx-auto bg-slate-900/50 rounded-2xl overflow-hidden border border-glass-border shadow-inner mb-8">
                    {isScanning ? (
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white/30 flex-col gap-4 relative">
                            <Camera size={48} />
                            <span>Camera Inactive</span>

                            {/* Decorative scan line when idle */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-calm-teal/20 to-transparent animate-float opacity-50" style={{ height: '2px', objectFit: 'cover' }}></div>
                        </div>
                    )}

                    {isScanning && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="w-full h-full border-4 border-calm-teal/30 rounded-2xl"></div>
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-calm-teal shadow-glow animate-pulse"></div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="flex items-center justify-center gap-2 text-calm-pink mb-6 p-4 bg-calm-pink/10 rounded-xl">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {scanResult && (
                    <div className="flex items-center justify-center gap-3 text-calm-teal mb-6 p-4 bg-calm-teal/10 rounded-xl">
                        <CheckCircle size={24} />
                        <div className="text-left">
                            <span className="block font-bold">Successfully Scanned!</span>
                            <span className="text-sm opacity-80">Code: {scanResult}</span>
                        </div>
                    </div>
                )}

                {foodInfo && (
                    <div className="bg-gradient-to-br from-calm-teal/10 to-calm-blue/10 border border-calm-teal/20 rounded-2xl p-6 mb-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">🍽️</span>
                            Nutrition Information
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-white/70">Product:</span>
                                <span className="text-white font-medium">{foodInfo.name}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-white/70">Brand:</span>
                                <span className="text-white font-medium">{foodInfo.brand}</span>
                            </div>

                            <div className="border-t border-calm-teal/20 pt-3 mt-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                        <div className="text-calm-teal text-sm">🔥 Calories</div>
                                        <div className="text-white text-xl font-bold">{foodInfo.calories}</div>
                                        <div className="text-white/60 text-xs">kcal</div>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                        <div className="text-calm-blue text-sm">💪 Protein</div>
                                        <div className="text-white text-xl font-bold">{foodInfo.protein}g</div>
                                        <div className="text-white/60 text-xs">per 100g</div>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                        <div className="text-calm-pink text-sm">🥑 Fat</div>
                                        <div className="text-white text-xl font-bold">{foodInfo.fat}g</div>
                                        <div className="text-white/60 text-xs">per 100g</div>
                                    </div>

                                    <div className="bg-slate-800/50 rounded-lg p-3">
                                        <div className="text-calm-purple text-sm">🍬 Sugar</div>
                                        <div className="text-white text-xl font-bold">{foodInfo.sugar}g</div>
                                        <div className="text-white/60 text-xs">per 100g</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-calm-teal/20">
                            <div className="flex items-center justify-center gap-2 text-calm-teal text-sm">
                                <CheckCircle size={16} />
                                <span>Nutrition data saved to your dashboard</span>
                            </div>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="flex items-center justify-center gap-3 text-calm-blue mb-6 p-4 bg-calm-blue/10 rounded-xl">
                        <div className="w-5 h-5 border-2 border-calm-blue border-t-transparent rounded-full animate-spin"></div>
                        <span>Fetching nutrition data...</span>
                    </div>
                )}

                <button
                    onClick={isScanning ? stopScanning : startScanning}
                    className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto gap-2 ${isScanning
                        ? 'bg-glass-white border border-glass-border text-white hover:bg-white/10'
                        : 'bg-gradient-to-r from-calm-teal to-calm-blue text-slate-900 shadow-glow'
                        }`}
                >
                    {isScanning ? (
                        <>Cancel Scanning</>
                    ) : (
                        <>
                            <RefreshCw size={20} />
                            Start Scanner
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default NutritionScanner;
