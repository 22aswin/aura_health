import React, { useRef, useState, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const NutritionScanner = () => {
    const videoRef = useRef(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const codeReader = useRef(new BrowserMultiFormatReader());

    useEffect(() => {
        return () => {
            codeReader.current.reset();
        };
    }, []);

    const startScanning = async () => {
        try {
            setError(null);
            setIsScanning(true);
            setScanResult(null);

            const videoInputDevices = await codeReader.current.listVideoInputDevices();
            const selectedDeviceId = videoInputDevices[0].deviceId;

            codeReader.current.decodeFromVideoDevice(
                selectedDeviceId,
                videoRef.current,
                (result, err) => {
                    if (result) {
                        setScanResult(result.getText());
                        codeReader.current.reset();
                        setIsScanning(false);
                    }
                    if (err && err.name !== 'NotFoundException') {
                        console.error(err);
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
