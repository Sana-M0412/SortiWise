import React, { useState } from 'react';
import { Key, Database, RefreshCw, ShieldAlert, CheckCircle2, Download, Upload, Trash2 } from 'lucide-react';

export default function Settings({ language, setLanguage, theme, setTheme, onResetAllData, logs, onImportLogs }) {
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('sortiwise_gemini_key') || '');
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('sortiwise_supabase_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem('sortiwise_supabase_key') || '');
  const [saveSuccess, setSaveSuccess] = useState('');

  const handleSaveCredentials = (e) => {
    e.preventDefault();
    localStorage.setItem('sortiwise_gemini_key', geminiKey.trim());
    localStorage.setItem('sortiwise_supabase_url', supabaseUrl.trim());
    localStorage.setItem('sortiwise_supabase_key', supabaseKey.trim());
    
    setSaveSuccess('Credentials saved successfully. Reload the page to apply changes.');
    setTimeout(() => setSaveSuccess(''), 4000);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sortiwise_logs_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          onImportLogs(parsed);
          alert("Logs imported successfully!");
        } else {
          alert("Invalid backup file. Must be a JSON array of waste logs.");
        }
      } catch (err) {
        alert("Failed to parse the backup file.");
      }
    };
    if (e.target.files[0]) {
      fileReader.readAsText(e.target.files[0]);
    }
  };

  const handleReset = () => {
    if (window.confirm("CRITICAL WARNING: This will delete ALL credentials, credentials history, logged scans, and gamification progress. Do you wish to continue?")) {
      onResetAllData();
      setGeminiKey('');
      setSupabaseUrl('');
      setSupabaseKey('');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      
      {/* Credentials Setup Panel */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px' }} className="gradient-text">
          System Credentials
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Connect your own API accounts. Keys are stored locally in your browser's secure sandboxed memory.
        </p>

        {saveSuccess && (
          <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--compostable)', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <CheckCircle2 size={16} /> {saveSuccess}
          </div>
        )}

        <form onSubmit={handleSaveCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              🔑 Gemini API Key:
            </label>
            <input
              type="password"
              placeholder="AI vision key (starts with AIzaSy...)"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', color: '#fff', fontSize: '0.88rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              📡 Supabase Project URL (Optional):
            </label>
            <input
              type="text"
              placeholder="https://xyz.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', color: '#fff', fontSize: '0.88rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              🛰️ Supabase Anon Public Key (Optional):
            </label>
            <input
              type="password"
              placeholder="Supabase Client JWT Key"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', color: '#fff', fontSize: '0.88rem' }}
            />
          </div>

          <button type="submit" className="neon-glow-btn" style={{ padding: '10px', borderRadius: '8px', fontSize: '0.88rem', marginTop: '8px' }}>
            Save Credentials
          </button>
        </form>
      </div>

      {/* Preferences & Backup Panel */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Language & Theme settings */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px' }}>App Preferences</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Toggle App Theme:</span>
              <button className="secondary-btn" onClick={toggleTheme} style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>System Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', background: '#090d16', border: '1px solid var(--card-border)', color: '#fff', fontSize: '0.85rem' }}
              >
                <option value="en">English</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Import/Export backup */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px' }}>Data Backups</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="secondary-btn" onClick={handleExportData} style={{ flex: 1, padding: '10px', fontSize: '0.8rem', gap: '6px' }}>
              <Download size={14} /> Export Backup
            </button>
            <label className="secondary-btn" style={{ flex: 1, padding: '10px', fontSize: '0.8rem', gap: '6px', cursor: 'pointer' }}>
              <Upload size={14} /> Import Backup
              <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Reset settings */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--hazardous)', marginBottom: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <ShieldAlert size={16} /> Danger Zone
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '12px' }}>
            Irreversibly wipe all data, logins, settings, achievements, and cache databases from this browser environment.
          </p>
          <button className="secondary-btn" onClick={handleReset} style={{ width: '100%', padding: '10px', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--hazardous)' }}>
            <Trash2 size={14} /> Reset System Data
          </button>
        </div>

      </div>

    </div>
  );
}
