import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Mic, FileText, CheckCircle, Volume2, ShieldAlert, Sparkles, Loader } from 'lucide-react';
import { analyzeWasteImage, analyzeWasteText } from '../lib/gemini';
import { classifyOffline } from '../lib/offlineClassifier';
import confetti from 'canvas-confetti';

export default function Scanner({ language, onAddLog, addXp }) {
  const [activeTab, setActiveTab] = useState('upload'); // upload | camera | text | voice
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [textDescription, setTextDescription] = useState('');
  
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const recognitionRef = useRef(null);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Result state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [classificationSource, setClassificationSource] = useState(''); // 'gemini' | 'offline'
  const [errorMsg, setErrorMsg] = useState('');

  // Audio synthesis state
  const [isNarrating, setIsNarrating] = useState(false);

  // Cleanup camera stream
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Set up standard browser SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setSpeechText(transcript);
        setTextDescription(transcript);
      };
      rec.onerror = (err) => {
        console.error("Speech recognition error:", err);
        setErrorMsg("Voice capture error. Try speaking clearly or typing.");
        setIsListening(false);
      };
      recognitionRef.current = rec;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setErrorMsg("Voice Speech recognition is not supported in this browser. Try Chrome/Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setErrorMsg('');
      setSpeechText('');
      recognitionRef.current.start();
    }
  };

  // Camera helpers
  const startCamera = async () => {
    setErrorMsg('');
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg("Camera access is not supported or is blocked by your browser. Note: Mobile devices require an HTTPS connection (secure origin) to access the camera. Please upload a file instead.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setErrorMsg("Unable to access camera. Please verify camera permissions in your browser or system settings, or upload an image instead.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        stopCamera();
      }, 'image/jpeg');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  // Trigger classification
  const handleAnalyze = async () => {
    setLoading(true);
    setErrorMsg('');
    setResult(null);
    setIsNarrating(false);
    window.speechSynthesis?.cancel();

    // Check if offline or if no API key is stored
    const isOnline = navigator.onLine;
    const hasApiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('sortiwise_gemini_key');

    try {
      if (!isOnline || !hasApiKey) {
        // Fallback to local offline classifier
        const queryText = activeTab === 'text' || activeTab === 'voice' 
          ? textDescription 
          : (selectedFile ? selectedFile.name : 'plastic bottle');

        // Simulate network delay for realistic experience
        await new Promise(r => setTimeout(r, 1200));
        const offlineResult = classifyOffline(queryText, language);
        setResult(offlineResult);
        setClassificationSource('offline');
        triggerCelebration(offlineResult.category);
      } else {
        // Run Online Gemini API
        let apiResult;
        if (activeTab === 'upload' || activeTab === 'camera') {
          if (!selectedFile) {
            throw new Error("Please select or capture an image first.");
          }
          apiResult = await analyzeWasteImage(selectedFile, language);
        } else {
          if (!textDescription.trim()) {
            throw new Error("Please enter a waste description first.");
          }
          apiResult = await analyzeWasteText(textDescription, language);
        }

        setResult(apiResult);
        setClassificationSource('gemini');
        triggerCelebration(apiResult.category);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to analyze the item. Please verify your internet and API keys.");
    } finally {
      setLoading(false);
    }
  };

  const triggerCelebration = (category) => {
    if (category === 'recyclable' || category === 'compostable') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: category === 'recyclable' ? ['#3b82f6', '#60a5fa', '#ffffff'] : ['#10b981', '#34d399', '#ffffff']
      });
    }
  };

  // Voice narration feedback
  const handleSpeakInstructions = () => {
    if (!result || !window.speechSynthesis) return;

    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }

    const textToSpeak = `
      Item classified as ${result.itemName}. 
      Disposal method: ${result.disposalInstructions.join('. ')}. 
      Upcycling tip: ${result.reuseIdeas[0] || 'No suggestions'}.
    `;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-US';
    
    utterance.onend = () => setIsNarrating(false);
    utterance.onerror = () => setIsNarrating(false);

    setIsNarrating(true);
    window.speechSynthesis.speak(utterance);
  };

  // Save scan result to log and add XP
  const handleSaveLog = () => {
    if (!result) return;
    onAddLog(result);
    addXp(20);
    // Visual reset
    setResult(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setTextDescription('');
    setSpeechText('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      
      {/* Scanner Control Box */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px' }} className="gradient-text">
          AI Waste Segregator
        </h2>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', marginBottom: '20px' }}>
          {[
            { id: 'upload', label: 'Upload Image', icon: <Upload size={16} /> },
            { id: 'camera', label: 'Live Camera', icon: <Camera size={16} /> },
            { id: 'text', label: 'Text Describe', icon: <FileText size={16} /> },
            { id: 'voice', label: 'Voice Command', icon: <Mic size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setErrorMsg('');
                if (tab.id !== 'camera') stopCamera();
              }}
              style={{
                flex: 1,
                padding: '10px 4px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : 'none',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? '600' : '400',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.8rem'
              }}
            >
              {tab.icon}
              <span className="hide-mobile">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Input Views */}
        <div style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {errorMsg && (
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--hazardous)', fontSize: '0.82rem', marginBottom: '16px' }}>
              {errorMsg}
            </div>
          )}

          {/* tab: UPLOAD */}
          {activeTab === 'upload' && (
            <div style={{ textAlign: 'center' }}>
              {!previewUrl ? (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--card-border)', borderRadius: '12px', padding: '40px 20px', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }} className="interactive">
                  <Upload size={36} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '12px' }}>Drag and drop or browse files</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>PNG, JPG, WebP supported</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }} />
                  <button className="secondary-btn" onClick={() => { setSelectedFile(null); setPreviewUrl(''); }} style={{ marginTop: '12px', marginInline: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}>
                    Remove Image
                  </button>
                </div>
              )}
            </div>
          )}

          {/* tab: CAMERA */}
          {activeTab === 'camera' && (
            <div style={{ textAlign: 'center' }}>
              {!cameraActive && !previewUrl && (
                <button className="neon-glow-btn" onClick={startCamera} style={{ marginInline: 'auto' }}>
                  Activate Webcam
                </button>
              )}

              {cameraActive && (
                <div className="scanline-container" style={{ position: 'relative', width: '100%', maxHeight: '240px', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                  <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                  <button className="neon-glow-btn animate-pulse-glow" onClick={capturePhoto} style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
                    Capture Waste
                  </button>
                </div>
              )}

              {previewUrl && !cameraActive && (
                <div>
                  <img src={previewUrl} alt="Captured" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }} />
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '12px' }}>
                    <button className="secondary-btn" onClick={startCamera} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Retake
                    </button>
                    <button className="secondary-btn" onClick={() => { setSelectedFile(null); setPreviewUrl(''); }} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* tab: TEXT DESCRIBE */}
          {activeTab === 'text' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Describe what item you are holding:
              </label>
              <textarea
                value={textDescription}
                onChange={(e) => setTextDescription(e.target.value)}
                placeholder="e.g. A half-eaten sandwich in a grease-stained cardboard sleeve..."
                style={{ width: '100%', height: '110px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', color: '#fff', fontSize: '0.9rem', resize: 'none' }}
              />
            </div>
          )}

          {/* tab: VOICE COMMAND */}
          {activeTab === 'voice' && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div 
                onClick={toggleListening}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: isListening ? 'var(--hazardous)' : 'var(--accent-gradient)',
                  boxShadow: isListening ? '0 0 20px rgba(239,68,68,0.4)' : '0 0 15px var(--accent-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  animation: isListening ? 'float 1.5s infinite ease-in-out' : 'none'
                }}
              >
                <Mic size={28} color="#fff" />
              </div>
              <p style={{ fontSize: '0.85rem', color: isListening ? 'var(--hazardous)' : 'var(--text-secondary)' }}>
                {isListening ? 'Listening... Speak now!' : 'Tap the microphone to dictate waste details'}
              </p>
              {speechText && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)', width: '100%', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  "{speechText}"
                </div>
              )}
            </div>
          )}

        </div>

        {/* Analyze action */}
        <div style={{ marginTop: '24px' }}>
          <button 
            onClick={handleAnalyze}
            className="neon-glow-btn animate-pulse-glow"
            disabled={loading}
            style={{ width: '100%', padding: '14px', borderRadius: '10px' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <Loader size={18} className="animate-float" /> Analyzing Materials...
              </span>
            ) : (
              'Initiate Classification'
            )}
          </button>
        </div>

      </div>

      {/* Results Box */}
      <div className="glass-card">
        {!result && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: 'var(--text-muted)' }}>
            ♻️
            <p style={{ marginTop: '16px', fontSize: '0.9rem' }}>Scan or describe an item to view AI material insights.</p>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="skeleton" style={{ height: '32px', width: '60%' }} />
            <div className="skeleton" style={{ height: '20px', width: '40%' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="skeleton" style={{ height: '24px', width: '30%' }} />
              <div className="skeleton" style={{ height: '24px', width: '25%' }} />
            </div>
            <div className="skeleton" style={{ height: '60px', width: '100%' }} />
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
          </div>
        )}

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Header info */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{result.itemName}</h3>
                <span className={`badge ${result.category}`}>{result.category}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                AI Confidence: {Math.round(result.confidence * 100)}% | 
                Source: {classificationSource === 'gemini' ? 'Multimodal LLM' : 'Offline Rule-based Engine'}
              </p>
            </div>

            {/* Badges and Impact */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div className="glass-card" style={{ padding: '8px 12px', flex: 1, minWidth: '100px', background: 'rgba(255,255,255,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carbon Footprint</span>
                <p style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--ewaste)' }}>{result.carbonFootprintKg} kg CO₂e</p>
              </div>
              <div className="glass-card" style={{ padding: '8px 12px', flex: 1, minWidth: '100px', background: 'rgba(255,255,255,0.02)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Eco Score</span>
                <p style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--compostable)' }}>{result.sustainabilityScore}/100</p>
              </div>
            </div>

            {/* Environmental reasoning */}
            <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent)', fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              <strong>AI Reasoning:</strong> {result.environmentalReasoning}
            </div>

            {/* Step-by-step disposal */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '6px' }}>Proper Disposal Instructions:</h4>
              <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-secondary)' }}>
                {result.disposalInstructions.map((ins, idx) => (
                  <li key={idx}>{ins}</li>
                ))}
              </ul>
            </div>

            {/* Upcycling & Eco alternatives */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>Creative Upcycling Ideas:</h4>
              <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {result.reuseIdeas.map((idea, idx) => (
                  <li key={idx}>{idea}</li>
                ))}
              </ul>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>Greener Alternatives:</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {result.alternatives.join(', ')}
              </p>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button onClick={handleSpeakInstructions} className="secondary-btn" style={{ flex: 1, padding: '10px' }}>
                <Volume2 size={16} /> {isNarrating ? 'Stop Speaking' : 'Read Aloud'}
              </button>
              <button onClick={handleSaveLog} className="neon-glow-btn" style={{ flex: 2, padding: '10px' }}>
                <CheckCircle size={16} /> Record Classification (+20 XP)
              </button>
            </div>

          </div>
        )}

      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
