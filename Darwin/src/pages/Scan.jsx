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

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
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

    useEffect(() => {
        if (!capturedImage && !analysisResult) {
            startCamera();
        }
        return () => {
            stopCamera();
        };
    }, [capturedImage, analysisResult]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageDataUrl = canvas.toDataURL('image/png');
            setCapturedImage(imageDataUrl);
            stopCamera();
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setAnalysisResult(null);
        setError(null);
    };

    const handleConfirm = async () => {
        setIsAnalyzing(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
            setError("Vous devez être connecté pour analyser une image.");
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
                body: JSON.stringify({ imageData: capturedImage })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error) {
                    throw new Error(data.error);
                }
                throw new Error("Erreur lors de l'analyse.");
            }

            setAnalysisResult(data);

        } catch (err) {
            console.error("Analysis error:", err);
            setError(err.message || "Une erreur est survenue lors de l'analyse.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (error) {
        return (
            <div className="scan-container">
                <div style={{
                    color: 'white',
                    textAlign: 'center',
                    marginTop: '50%',
                    padding: '20px'
                }}>
                    <p>{error}</p>
                    <button
                        className="btn-secondary"
                        onClick={handleRetake}
                        style={{ marginTop: '20px' }}
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="scan-container">
            {isAnalyzing && (
                <div className="analyzing-overlay">
                    <div className="spinner"></div>
                    <div className="analyzing-text">Analyse en cours...</div>
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
                            <div>
                                <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                                    Observations: {analysisResult.observation_count}
                                </div>
                            </div>
                        </div>

                        <div className="result-actions">
                            <button className="btn-secondary" onClick={handleRetake}>Scanner un autre</button>
                            <button className="btn-primary" onClick={() => {/* Navigate to collection or details */ }}>Voir détails</button>
                        </div>
                    </div>
                </div>
            ) : capturedImage ? (
                <div className="captured-image-container">
                    <img src={capturedImage} alt="Captured" className="captured-image" />
                    {!isAnalyzing && (
                        <div className="action-buttons">
                            <button className="btn-secondary" onClick={handleRetake}>Reprendre</button>
                            <button className="btn-primary" onClick={handleConfirm}>Analyser</button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="camera-feed"
                        muted
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    <div className="scan-overlay">
                        <div className="scan-header">
                            <h2>Scanner un spécimen</h2>
                        </div>

                        <div className="viewfinder">
                            <div className="viewfinder-corner top-left"></div>
                            <div className="viewfinder-corner top-right"></div>
                            <div className="viewfinder-corner bottom-left"></div>
                            <div className="viewfinder-corner bottom-right"></div>
                            <div className="scan-line"></div>
                        </div>

                        <div className="controls-area">
                            <button className="shutter-button" onClick={handleCapture} aria-label="Prendre une photo">
                                <div className="shutter-inner"></div>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Scan;
