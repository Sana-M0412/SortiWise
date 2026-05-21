import React from 'react';
import { Award, ShieldCheck, Flame, Users, Trophy, CheckCircle2 } from 'lucide-react';

const BADGES = [
  {
    id: 'starter',
    name: 'Green Seedling',
    description: 'Welcome to SortiWise. Unlock by joining the app.',
    icon: '🌱',
    condition: (logs) => true
  },
  {
    id: 'warrior',
    name: 'Waste Warrior',
    description: 'Classified and logged 5+ waste items.',
    icon: '⚔️',
    condition: (logs) => logs.length >= 5
  },
  {
    id: 'champion',
    name: 'Eco Champion',
    description: 'Reached Eco Level 3 or higher.',
    icon: '🏆',
    condition: (logs, level) => level >= 3
  },
  {
    id: 'compost_guru',
    name: 'Compost Guru',
    description: 'Logged at least 2 organic compost items.',
    icon: '🥬',
    condition: (logs) => logs.filter(l => l.category === 'compostable').length >= 2
  },
  {
    id: 'ewaste_avenger',
    name: 'E-Waste Avenger',
    description: 'Correctly disposed of electronic items.',
    icon: '🔌',
    condition: (logs) => logs.filter(l => l.category === 'e-waste').length >= 1
  },
  {
    id: 'carbon_destroyer',
    name: 'Carbon Destroyer',
    description: 'Saved a cumulative 2.0+ kg of CO2.',
    icon: '💥',
    condition: (logs) => {
      const co2 = logs.reduce((acc, log) => {
        if (log.category === 'recyclable') return acc + 0.25;
        if (log.category === 'compostable') return acc + 0.18;
        if (log.category === 'e-waste') return acc + 1.20;
        return acc;
      }, 0);
      return co2 >= 2.0;
    }
  }
];

const LEADERBOARD_USERS = [
  { rank: 1, name: "EcoGuru_Bangalore", xp: 1240, level: 6, carbonSaved: 14.5 },
  { rank: 2, name: "WasteFighter_99", xp: 980, level: 4, carbonSaved: 9.2 },
  { rank: 3, name: "GreenQueen", xp: 750, level: 3, carbonSaved: 6.8 },
  { rank: 4, name: "CarbonCutter", xp: 510, level: 2, carbonSaved: 4.8 }
];

export default function Gamification({ logs, xp, level, streak }) {
  // Calculate level boundaries (each level takes level * 100 XP)
  const xpNeeded = level * 100;
  const xpProgress = Math.min(100, Math.round((xp / xpNeeded) * 100));

  // Determine current Rank title
  const getRankTitle = () => {
    if (level >= 5) return "Eco Overlord";
    if (level >= 3) return "Waste Warden";
    if (level >= 2) return "Green Scout";
    return "Seedling";
  };

  // Compile leaderboard injecting current user
  const userCarbon = logs.reduce((acc, log) => {
    if (log.category === 'recyclable') return acc + 0.25;
    if (log.category === 'compostable') return acc + 0.18;
    if (log.category === 'e-waste') return acc + 1.20;
    return acc;
  }, 0);

  const rawUser = { rank: '-', name: 'You (Eco Warrior)', xp, level, carbonSaved: Math.round(userCarbon * 10) / 10 };
  const combinedLeaderboard = [...LEADERBOARD_USERS, rawUser].sort((a, b) => b.xp - a.xp);

  // Assign correct ranks post-sorting
  const rankedLeaderboard = combinedLeaderboard.map((u, idx) => ({
    ...u,
    rank: idx + 1
  }));

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      
      {/* Level, streak & badge progress */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Level Card */}
        <div className="glass-card" style={{ background: 'var(--accent-gradient-glow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{getRankTitle()} Rank</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Level {level} Environmentalist</p>
            </div>
            <ShieldCheck size={32} color="var(--compostable)" />
          </div>

          {/* XP Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ width: `${xpProgress}%`, height: '100%', background: 'var(--accent-gradient)', boxShadow: '0 0 10px var(--accent-glow)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>{xp} XP</span>
            <span>{xpNeeded} XP needed for Level {level + 1}</span>
          </div>
        </div>

        {/* Badges Collection */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="var(--accent)" /> Achievements Badges
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            {BADGES.map(badge => {
              const isUnlocked = badge.condition(logs, level);
              return (
                <div 
                  key={badge.id}
                  className="glass-card"
                  style={{
                    padding: '16px 12px',
                    textAlign: 'center',
                    background: isUnlocked ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                    borderColor: isUnlocked ? 'var(--card-hover-border)' : 'var(--card-border)',
                    opacity: isUnlocked ? 1 : 0.45,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontSize: '2rem', filter: isUnlocked ? 'none' : 'grayscale(100%)' }}>
                    {badge.icon}
                  </span>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>{badge.name}</h4>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>{badge.description}</p>
                  
                  {isUnlocked && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: 'var(--compostable)', fontWeight: '700', textTransform: 'uppercase', marginTop: '4px' }}>
                      <CheckCircle2 size={10} /> Unlocked
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Leaderboards */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trophy size={18} color="var(--ewaste)" /> Global Eco-Leaderboard
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Compare points with neighbors and top regional waste segregation experts.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rankedLeaderboard.map((user, idx) => {
            const isUser = user.name.includes("You");
            return (
              <div 
                key={idx}
                className="glass-card"
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: isUser ? 'var(--accent-gradient-glow)' : 'rgba(255,255,255,0.01)',
                  borderColor: isUser ? 'var(--accent)' : 'var(--card-border)',
                  boxShadow: isUser ? 'var(--shadow-glow)' : 'none'
                }}
              >
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: user.rank === 1 ? 'gold' : user.rank === 2 ? 'silver' : user.rank === 3 ? '#cd7f32' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: user.rank <= 3 ? '#000' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '700' }}>
                  {user.rank}
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: isUser ? 'var(--compostable)' : 'var(--text-primary)' }}>{user.name}</h4>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Level {user.level} | Saved {user.carbonSaved}kg CO₂</p>
                </div>

                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {user.xp} XP
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
