import React, { useState, useEffect } from 'react';
import { supabase, fetchUserStats, updateUserStats, syncLogsToSupabase } from './lib/supabase';
import Dashboard from './components/Dashboard';
import Scanner from './components/Scanner';
import BarcodeScanner from './components/BarcodeScanner';
import RecyclingCenters from './components/RecyclingCenters';
import Coach from './components/Coach';
import Community from './components/Community';
import Gamification from './components/Gamification';
import History from './components/History';
import Settings from './components/Settings';
import AdminPanel from './components/AdminPanel';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import { 
  Home, Leaf, QrCode, MapPin, MessageSquareCode, 
  Users, Trophy, History as HistoryIcon, Settings as SettingsIcon, 
  Lock, Sun, Moon, LogOut, Globe, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem('sortiwise_onboarded') === 'true');
  const [user, setUser] = useState(null);
  const [guestMode, setGuestMode] = useState(() => localStorage.getItem('sortiwise_guest_mode') === 'true');
  const [view, setView] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('sortiwise_theme') || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem('sortiwise_language') || 'en');

  // Gamification & Logs state
  const [logs, setLogs] = useState([]);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);

  // Sync theme with HTML class
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('sortiwise_theme', theme);
  }, [theme]);

  // Sync language with local storage
  useEffect(() => {
    localStorage.setItem('sortiwise_language', language);
  }, [language]);

  // Auth and session listener
  useEffect(() => {
    if (!supabase) return;

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setGuestMode(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setGuestMode(false);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch or sync logs depending on Auth state
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        // User logged in, fetch from Supabase
        const profile = await fetchUserStats(user.id);
        if (profile) {
          setXp(profile.xp);
          setLevel(profile.level);
          setStreak(profile.streak);
        }

        // Fetch logs
        const { data, error } = await supabase
          .from('waste_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mappedLogs = data.map(d => ({
            id: d.id,
            itemName: d.item_name,
            category: d.category,
            confidence: Number(d.confidence),
            carbonFootprintKg: Number(d.carbon_footprint_kg),
            disposalInstructions: d.disposal_instructions,
            reuseIdeas: d.reuse_ideas,
            alternatives: d.alternatives,
            environmentalReasoning: d.environmental_reasoning,
            sustainabilityScore: d.sustainability_score,
            imageUrl: d.image_url,
            created_at: d.created_at
          }));
          setLogs(mappedLogs);
        }
      } else {
        // Guest mode, fetch from LocalStorage
        const localLogs = localStorage.getItem('sortiwise_local_logs');
        const localXp = localStorage.getItem('sortiwise_local_xp');
        const localLevel = localStorage.getItem('sortiwise_local_level');
        const localStreak = localStorage.getItem('sortiwise_local_streak');

        if (localLogs) setLogs(JSON.parse(localLogs));
        if (localXp) setXp(parseInt(localXp, 10));
        if (localLevel) setLevel(parseInt(localLevel, 10));
        if (localStreak) setStreak(parseInt(localStreak, 10));
      }
    };

    loadData();
  }, [user, guestMode]);

  // Update streak when scanning items
  const updateStreak = () => {
    const lastScanDateStr = localStorage.getItem('sortiwise_last_scan_date');
    const today = new Date().toDateString();
    
    if (!lastScanDateStr) {
      // First scan
      setStreak(1);
      localStorage.setItem('sortiwise_local_streak', '1');
      localStorage.setItem('sortiwise_last_scan_date', today);
      if (user) updateUserStats(user.id, { streak: 1 });
      return;
    }

    if (lastScanDateStr === today) {
      // Already scanned today, keep streak the same
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastScanDateStr === yesterday.toDateString()) {
      // Scanned yesterday, increment streak!
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('sortiwise_local_streak', newStreak.toString());
      localStorage.setItem('sortiwise_last_scan_date', today);
      if (user) updateUserStats(user.id, { streak: newStreak });
    } else {
      // Streak broken, reset to 1
      setStreak(1);
      localStorage.setItem('sortiwise_local_streak', '1');
      localStorage.setItem('sortiwise_last_scan_date', today);
      if (user) updateUserStats(user.id, { streak: 1 });
    }
  };

  // Add XP
  const addXp = (amount) => {
    const newXp = xp + amount;
    const needed = level * 100;
    
    if (newXp >= needed) {
      // Level Up!
      const remainder = newXp - needed;
      const nextLevel = level + 1;
      setXp(remainder);
      setLevel(nextLevel);
      
      localStorage.setItem('sortiwise_local_xp', remainder.toString());
      localStorage.setItem('sortiwise_local_level', nextLevel.toString());

      if (user) {
        updateUserStats(user.id, { xp: remainder, level: nextLevel });
      }

      // Celebrate level up
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      alert(`🎉 Congratulations! You reached Eco Level ${nextLevel}! Keep sorting wisely.`);
    } else {
      setXp(newXp);
      localStorage.setItem('sortiwise_local_xp', newXp.toString());
      if (user) {
        updateUserStats(user.id, { xp: newXp });
      }
    }
  };

  // Add classification log
  const handleAddLog = async (logItem) => {
    updateStreak();

    const newLog = {
      id: Date.now().toString(),
      ...logItem,
      created_at: new Date().toISOString()
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    if (user) {
      // Save directly to Supabase
      await syncLogsToSupabase([logItem], user.id);
    } else {
      // Save locally
      localStorage.setItem('sortiwise_local_logs', JSON.stringify(updatedLogs));
    }
  };

  const handleClearLogs = async () => {
    setLogs([]);
    if (user) {
      await supabase.from('waste_logs').delete().eq('user_id', user.id);
    } else {
      localStorage.removeItem('sortiwise_local_logs');
    }
  };

  const handleImportLogs = (imported) => {
    const updated = [...imported, ...logs];
    setLogs(updated);
    if (!user) {
      localStorage.setItem('sortiwise_local_logs', JSON.stringify(updated));
    }
  };

  const handleResetAllData = () => {
    localStorage.clear();
    setLogs([]);
    setXp(0);
    setLevel(1);
    setStreak(0);
    setUser(null);
    setGuestMode(false);
    setOnboarded(false);
    setView('dashboard');
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setGuestMode(false);
    localStorage.removeItem('sortiwise_guest_mode');
    setView('dashboard');
  };

  // If onboarding is not completed, show Onboarding Wizard
  if (!onboarded) {
    return <Onboarding 
      language={language} 
      setLanguage={setLanguage} 
      onComplete={() => setOnboarded(true)} 
    />;
  }

  // If not logged in and not in guest mode, show Authentication gate
  if (!user && !guestMode) {
    return (
      <Auth 
        onAuthSuccess={(user) => {
          setUser(user);
          setGuestMode(false);
        }}
        onGuestMode={() => {
          setGuestMode(true);
          localStorage.setItem('sortiwise_guest_mode', 'true');
        }}
      />
    );
  }

  return (
    <div className="app-container">
      <div className="bg-grid"></div>

      {/* Navigation Sidebar */}
      <aside className="sidebar">
        <div>
          {/* Logo Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', paddingInline: '8px' }}>
            <span style={{ fontSize: '1.8rem' }}>♻️</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800' }} className="gradient-text">SortiWise</span>
          </div>

          {/* Nav List */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <Home size={18} /> },
              { id: 'scan', label: 'AI Scanner', icon: <Leaf size={18} /> },
              { id: 'barcode', label: 'Barcode Scan', icon: <QrCode size={18} /> },
              { id: 'centers', label: 'Recycling Map', icon: <MapPin size={18} /> },
              { id: 'coach', label: 'AI Coach', icon: <MessageSquareCode size={18} /> },
              { id: 'community', label: 'Community Feed', icon: <Users size={18} /> },
              { id: 'gamification', label: 'Gamification', icon: <Trophy size={18} /> },
              { id: 'history', label: 'History Logs', icon: <HistoryIcon size={18} /> },
              { id: 'admin', label: 'Admin Report', icon: <Lock size={18} /> },
              { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 14px',
                  background: view === item.id ? 'var(--accent-gradient)' : 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  color: view === item.id ? '#fff' : 'var(--text-secondary)',
                  fontWeight: view === item.id ? '600' : '400',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.88rem'
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* User Card & Settings */}
        <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* User profile capsule */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingInline: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>🧙‍♂️</span>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user ? (user.user_metadata?.username || user.email) : 'Guest Warrior'}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Level {level} Scout</p>
            </div>
          </div>

          {/* Theme & Log out row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px' }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: 'var(--hazardous)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px' }}
            >
              <LogOut size={16} /> Exit
            </button>
          </div>

        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="main-content">
        {view === 'dashboard' && <Dashboard logs={logs} xp={xp} level={level} streak={streak} addXp={addXp} onViewChange={setView} />}
        {view === 'scan' && <Scanner language={language} onAddLog={handleAddLog} addXp={addXp} />}
        {view === 'barcode' && <BarcodeScanner onAddLog={handleAddLog} addXp={addXp} />}
        {view === 'centers' && <RecyclingCenters />}
        {view === 'coach' && <Coach language={language} />}
        {view === 'community' && <Community currentUser={user} />}
        {view === 'gamification' && <Gamification logs={logs} xp={xp} level={level} streak={streak} />}
        {view === 'history' && <History logs={logs} onClearLogs={handleClearLogs} />}
        {view === 'admin' && <AdminPanel logs={logs} onClearLogs={handleClearLogs} />}
        {view === 'settings' && (
          <Settings 
            language={language} 
            setLanguage={setLanguage} 
            theme={theme} 
            setTheme={setTheme} 
            onResetAllData={handleResetAllData}
            logs={logs}
            onImportLogs={handleImportLogs}
          />
        )}
      </main>

    </div>
  );
}
