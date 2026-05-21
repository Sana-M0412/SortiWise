import React, { useState } from 'react';
import { Flame, Sparkles, TrendingUp, Calendar, Trash2, Award, ArrowRight } from 'lucide-react';

const ECO_TIPS = [
  "Rinse food tins and plastic bottles before recycling; leftover residue can contaminate entire batches of recyclables.",
  "Composting organic scraps reduces landfill waste and prevents the release of methane, a potent greenhouse gas.",
  "E-waste represents 2% of garbage but 70% of overall toxic chemical pollution in landfill sites. Recycle old chargers!",
  "Upcycle glass containers into bulk storage jars instead of buying new pantry containers.",
  "Single-use coffee cups are lined with plastic film, making them non-recyclable in standard streams. Carry a reusable mug!"
];

const DAILY_CHALLENGES = [
  { id: 1, title: "Zero Single-Use Plastic", xp: 50, description: "Do not buy or use any single-use plastic water bottles or bags today." },
  { id: 2, title: "Compost Organic Waste", xp: 30, description: "Separate all kitchen food scraps into a compost or organic waste bin." },
  { id: 3, title: "Eco Walk/Ride", xp: 40, description: "Walk, bike, or use public transport instead of driving a personal vehicle." }
];

export default function Dashboard({ logs, xp, level, streak, addXp, onViewChange }) {
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * ECO_TIPS.length));
  const [completedChallenges, setCompletedChallenges] = useState(() => {
    const saved = localStorage.getItem('sortiwise_completed_challenges');
    return saved ? JSON.parse(saved) : [];
  });

  // Calculate stats
  const totalScans = logs.length;
  const carbonSaved = logs.reduce((acc, log) => {
    // If recycled or composted, we simulate carbon saved (e.g. 0.2kg for recyclable, 0.15kg for compostable)
    if (log.category === 'recyclable') return acc + 0.25;
    if (log.category === 'compostable') return acc + 0.18;
    if (log.category === 'e-waste') return acc + 1.20; // Recycling e-waste prevents mining raw minerals
    return acc;
  }, 0);

  const categoryCounts = logs.reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + 1;
    return acc;
  }, {});

  const recyclingCount = (categoryCounts['recyclable'] || 0) + (categoryCounts['compostable'] || 0);
  const recyclingRate = totalScans > 0 ? Math.round((recyclingCount / totalScans) * 100) : 0;

  // Complete a challenge
  const handleCompleteChallenge = (id, rewardXp) => {
    if (completedChallenges.includes(id)) return;
    const updated = [...completedChallenges, id];
    setCompletedChallenges(updated);
    localStorage.setItem('sortiwise_completed_challenges', JSON.stringify(updated));
    addXp(rewardXp);
  };

  // SVG Donut Chart Coordinates helper
  const totalCategoryItems = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;
  const categoriesList = ['recyclable', 'compostable', 'hazardous', 'landfill', 'e-waste'];
  const categoryColors = {
    'recyclable': 'var(--recyclable)',
    'compostable': 'var(--compostable)',
    'hazardous': 'var(--hazardous)',
    'landfill': 'var(--landfill)',
    'e-waste': 'var(--ewaste)'
  };

  // Generate donut slices
  let accumulatedAngle = 0;
  const donutSlices = categoriesList.map(cat => {
    const count = categoryCounts[cat] || 0;
    const percentage = (count / totalCategoryItems) * 100;
    const angle = (count / totalCategoryItems) * 360;
    const strokeDasharray = `${(percentage * 251.2) / 100} 251.2`;
    const strokeDashoffset = `${- (accumulatedAngle * 251.2) / 360}`;
    accumulatedAngle += angle;
    return { cat, count, percentage, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', background: 'var(--accent-gradient-glow)' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800' }}>Welcome to <span className="gradient-text">SortiWise</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '1rem' }}>
            Empowering your lifestyle with zero-shot AI reasoning and carbon footprints tracking.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
            <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '600' }}>Eco Level</p>
            <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--compostable)' }}>{level}</p>
          </div>
          <button className="neon-glow-btn" onClick={() => onViewChange('scan')}>
            Scan Waste <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Stats Widgets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        <div className="glass-card interactive" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}>
            <TrendingUp size={28} color="var(--compostable)" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>CO₂ Reduction</p>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{carbonSaved.toFixed(2)} kg</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>saved from landfill</p>
          </div>
        </div>

        <div className="glass-card interactive" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px' }}>
            <Trash2 size={28} color="var(--recyclable)" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Scanned</p>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{totalScans} Items</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI analyzed items</p>
          </div>
        </div>

        <div className="glass-card interactive" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '12px', borderRadius: '12px' }}>
            <Award size={28} color="var(--neon-purple)" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Recycling Rate</p>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{recyclingRate}%</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>compost & recycling</p>
          </div>
        </div>

        <div className="glass-card interactive" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px' }}>
            <Flame size={28} color="var(--ewaste)" className="animate-float" />
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Eco Streak</p>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>{streak} Days</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>consecutive scans</p>
          </div>
        </div>

      </div>

      {/* Main Charts & Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Footprint reductions trends */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--accent)" /> Carbon Reductions Trend
          </h3>
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 0 20px 0', borderBottom: '1px solid var(--card-border)' }}>
            {/* Simple simulated weekly bar chart if no history, or using logs */}
            {[0.4, 0.9, 1.2, 0.7, 1.8, 1.4, carbonSaved].map((val, idx) => {
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              const heightPct = Math.min(100, Math.max(10, (val / 3.0) * 100));
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{val.toFixed(1)}</div>
                  <div 
                    style={{ 
                      width: '24px', 
                      height: `${heightPct}px`, 
                      background: idx === 6 ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.06)',
                      borderRadius: '6px 6px 0 0',
                      boxShadow: idx === 6 ? '0 0 10px var(--accent-glow)' : 'none',
                      transition: 'height 0.8s ease'
                    }} 
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{days[idx]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waste categories distribution */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--neon-blue)" /> Category Breakdown
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flex: 1, flexWrap: 'wrap', gap: '16px' }}>
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg width="100%" height="100%" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--card-border)" strokeWidth="3" />
                {totalScans > 0 ? (
                  donutSlices.map((slice, idx) => (
                    <circle 
                      key={idx}
                      cx="21" 
                      cy="21" 
                      r="15.915" 
                      fill="transparent" 
                      stroke={categoryColors[slice.cat]} 
                      strokeWidth="4" 
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      transform="rotate(-90 21 21)"
                    />
                  ))
                ) : (
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                )}
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{totalScans}</span>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Items</p>
              </div>
            </div>

            {/* Labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categoriesList.map(cat => {
                const count = categoryCounts[cat] || 0;
                return (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: categoryColors[cat] }} />
                    <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)', width: '90px' }}>{cat}</span>
                    <span style={{ fontWeight: '600' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Challenges & Daily tips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Daily Challenges */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="var(--ewaste)" /> Daily Eco Challenges
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {DAILY_CHALLENGES.map(ch => {
              const isCompleted = completedChallenges.includes(ch.id);
              return (
                <div key={ch.id} className="glass-card" style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600', textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>{ch.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{ch.description}</p>
                  </div>
                  <button 
                    disabled={isCompleted}
                    onClick={() => handleCompleteChallenge(ch.id, ch.xp)}
                    className={isCompleted ? 'secondary-btn' : 'neon-glow-btn'}
                    style={{ padding: '6px 12px', fontSize: '0.78rem', minWidth: '90px' }}
                  >
                    {isCompleted ? 'Claimed' : `+${ch.xp} XP`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tip Section */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="var(--compostable)" /> Sustainability Tip of the Day
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', fontStyle: 'italic', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
              "{ECO_TIPS[tipIndex]}"
            </p>
          </div>
          <button 
            className="secondary-btn" 
            onClick={() => setTipIndex((prev) => (prev + 1) % ECO_TIPS.length)}
            style={{ width: 'fit-content', marginTop: '16px', padding: '6px 16px', fontSize: '0.8rem' }}
          >
            Next Tip
          </button>
        </div>

      </div>

    </div>
  );
}
