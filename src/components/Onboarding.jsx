import React, { useState } from 'react';
import { Shield, Sparkles, Globe, Leaf, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Onboarding({ onComplete, language, setLanguage }) {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to SortiWise",
      subtitle: "Smart AI Waste Assistant & Carbon Tracker",
      description: "SortiWise is a futuristic, reasoning-driven platform that guides your disposal behavior. We use zero-shot visual AI models to analyze materials instead of standard machine learning databases.",
      icon: <Leaf className="animate-float" size={80} color="var(--compostable)" />
    },
    {
      title: "Zero-Shot Multi-Input AI",
      subtitle: "Camera, Uploads, Text, or Voice",
      description: "Classify items in real-time by taking photos, typing text descriptions, or speaking naturally in your own language. The AI details the category, disposal steps, upcycling ideas, and eco alternatives.",
      icon: <Sparkles size={80} color="var(--neon-blue)" />
    },
    {
      title: "Gamification & Footprint Tracking",
      subtitle: "Earn XP, Streaks, & Badges",
      description: "Watch your carbon footprint decrease with each item recycled. Level up from a Seedling to an Eco Champion, maintain daily active streaks, and complete weekly sustainability challenges.",
      icon: <Shield size={80} color="var(--ewaste)" />
    },
    {
      title: "Choose Your Preferences",
      subtitle: "Tailor your green experience",
      description: "Select your language. If you have a Gemini API Key or Supabase account, you can configure them in the settings page later. Guest mode is enabled by default to save logs locally.",
      icon: <Globe size={80} color="var(--neon-purple)" />,
      interactive: true
    }
  ];

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      localStorage.setItem('sortiwise_onboarded', 'true');
      onComplete();
    }
  };

  const handlePrev = () => {
    if (slide > 0) {
      setSlide(slide - 1);
    }
  };

  const activeSlide = slides[slide];

  return (
    <div className="modal-overlay" style={{ background: 'var(--bg-primary)' }}>
      <div className="bg-grid"></div>
      <div className="glass-card animate-fade-in" style={{ maxWidth: '560px', width: '100%', padding: '40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          {activeSlide.icon}
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }} className="gradient-text">
          {activeSlide.title}
        </h1>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: '500' }}>
          {activeSlide.subtitle}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '32px' }}>
          {activeSlide.description}
        </p>

        {activeSlide.interactive && (
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Preferred Interface Language:
            </label>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'neon-glow-btn' : 'secondary-btn'}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('kn')}
                className={language === 'kn' ? 'neon-glow-btn' : 'secondary-btn'}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                ಕನ್ನಡ (Kannada)
              </button>
              <button 
                onClick={() => setLanguage('hi')}
                className={language === 'hi' ? 'neon-glow-btn' : 'secondary-btn'}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                हिंदी (Hindi)
              </button>
            </div>
          </div>
        )}

        {/* Navigation Indicator dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
          {slides.map((_, idx) => (
            <div 
              key={idx}
              style={{
                width: idx === slide ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: idx === slide ? 'var(--accent)' : 'var(--card-border)',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {slide > 0 ? (
            <button onClick={handlePrev} className="secondary-btn" style={{ padding: '10px 20px' }}>
              <ArrowLeft size={18} /> Back
            </button>
          ) : (
            <div />
          )}

          <button onClick={handleNext} className="neon-glow-btn" style={{ padding: '10px 24px' }}>
            {slide === slides.length - 1 ? 'Launch SortiWise' : 'Next'} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
