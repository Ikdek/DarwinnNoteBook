import React, { useRef, useEffect, useState } from 'react';
import './Scan.css';

const Scan = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [autoScan, setAutoScan] = useState(true); // Default to auto scan

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                };
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    // Main Control Effect
    useEffect(() => {
        if (autoScan && !analysisResult) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [autoScan, analysisResult]);

    // Auto Scan Interval
    useEffect(() => {
        let intervalId;

        if (autoScan && !analysisResult && stream && !isAnalyzing) {
            intervalId = setInterval(() => {
                captureAndAnalyze();
            }, 2000); // Check every 2 seconds
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [autoScan, analysisResult, stream, isAnalyzing]);

    const captureAndAnalyze = async () => {
        if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Use a smaller size for speed if possible
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8); // Compress slightly

        await performAnalysis(imageDataUrl, true);
    };

    const performAnalysis = async (imageData, isAuto = false) => {
        setIsAnalyzing(true);
        if (!isAuto) setError(null); // only reset error on manual

        const token = localStorage.getItem('token');
        if (!token) {
            setError("Vous devez être connecté.");
            setIsAnalyzing(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/classification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ imageData: imageData })
            });

            const data = await response.json();

            if (response.ok) {
                // Success! Organism found
                setCapturedImage(imageData); // Freeze the frame
                setAnalysisResult(data);
                setAutoScan(false); // Stop scanning
            } else {
                // Not found or error
                if (!isAuto) {
                    // Manual mode: show error
                    setError(data.error || "Rien de connu détecté.");
                } else {
                    // Auto mode: ignore and retry
                    console.log("Auto-scan: nothing detected or " + data.error);
                }
            }

        } catch (err) {
            console.error("Analysis error:", err);
            if (!isAuto) setError("Erreur réseau ou serveur.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Manual Capture (for "Force" or fallback)
    const handleManualCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const img = canvas.toDataURL('image/jpeg', 0.9);
            performAnalysis(img, false);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setAnalysisResult(null);
        setError(null);
        setAutoScan(true); // Restart loop
    };

    return (
        <div className="scan-container">
            {error && (
                <div className="analyzing-overlay" style={{ background: 'rgba(0,0,0,0.8)', zIndex: 30 }}>
                    <p style={{ color: 'white', padding: '20px', textAlign: 'center' }}>{error}</p>
                    <button className="btn-secondary" onClick={() => setError(null)}>Fermer</button>
                </div>
            )}

            {isAnalyzing && !autoScan && (
                /* Only show spinner on manual analysis, auto is silent */
                <div className="analyzing-overlay">
                    <div className="spinner"></div>
                    <div className="analyzing-text">Analyse...</div>
                </div>
            )}

            {analysisResult ? (
                <div className="captured-image-container">
                    <img src={capturedImage} alt="Captured" className="captured-image" />
                    <div className="result-card">
                        <div className="result-header">
                            <div className="result-title">
                                <h3>{analysisResult.common_name || "Espèce inconnue"}</h3>
                                <p className="result-subtitle">{analysisResult.scientific_name}</p>
                            </div>
                            {analysisResult.score && (
                                <div className="result-score">
                                    {(analysisResult.score * 100).toFixed(0)}%
                                </div>
                            )}
                        </div>

                        <div className="result-content">
                            {analysisResult.image_url && (
                                <img src={analysisResult.image_url} alt="Reference" className="result-image" />
                            )}
                            <div className="result-details">
                                <div style={{ fontSize: '0.9rem' }}>
                                    Observations: {analysisResult.observation_count}
                                </div>
                            </div>
                        </div>

                        <div className="result-actions">
                            <button className="btn-secondary" onClick={handleRetake}>Scanner un autre</button>
                            <button className="btn-primary">Voir détails</button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        playsInline
                        className="camera-feed"
                        muted
                        style={{ display: capturedImage && !autoScan ? 'none' : 'block' }}
                    />
                    {/* Show frozen image if we manually captured but waiting or error */}
                    {capturedImage && !autoScan && !analysisResult && (
                        <img src={capturedImage} className="camera-feed" alt="frozen" />
                    )}

                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    <div className="scan-overlay">
                        <div className="scan-header">
                            <h2>{isAnalyzing ? "Analyse en cours..." : "Recherche de spécimen..."}</h2>
                        </div>

                        <div className="viewfinder">
                            <div className="viewfinder-corner top-left"></div>
                            <div className="viewfinder-corner top-right"></div>
                            <div className="viewfinder-corner bottom-left"></div>
                            <div className="viewfinder-corner bottom-right"></div>
                            {isAnalyzing && <div className="scan-line"></div>}
                        </div>

                        <div className="controls-area">
                            {!isAnalyzing && (
                                <button className="shutter-button" onClick={handleManualCapture} aria-label="Forcer l'analyse">
                                    <div className="shutter-inner"></div>
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Scan;
