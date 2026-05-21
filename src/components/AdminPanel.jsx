import React from 'react';
import { BarChart3, Printer, FileText, Settings, ShieldAlert, Trash2, Award } from 'lucide-react';

export default function AdminPanel({ logs, onClearLogs }) {
  // Aggregate statistics
  const totalItems = logs.length;
  const categories = ['recyclable', 'compostable', 'hazardous', 'landfill', 'e-waste'];
  
  const categoryCounts = logs.reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + 1;
    return acc;
  }, {});

  const totalCarbon = logs.reduce((acc, log) => acc + log.carbonFootprintKg, 0);
  const avgCarbon = totalItems > 0 ? (totalCarbon / totalItems).toFixed(3) : 0;

  const handlePrintReport = () => {
    // Hide components temporarily using print classes or standard window.print()
    window.print();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Admin stats */}
      <div className="glass-card" style={{ background: 'var(--accent-gradient-glow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Admin Analytics Panel</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
              System audits, carbon summaries, and print export utilities.
            </p>
          </div>
          <button onClick={handlePrintReport} className="neon-glow-btn" style={{ gap: '8px', padding: '10px 18px', fontSize: '0.85rem' }}>
            <Printer size={16} /> Export PDF Report
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Core Stats Overview */}
        <div className="glass-card" id="printable-area-admin">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--accent)" /> Carbon Audit Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Scanned Items:</span>
              <span style={{ fontWeight: '700' }}>{totalItems}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Cumulative Carbon Footprint:</span>
              <span style={{ fontWeight: '700', color: 'var(--ewaste)' }}>{totalCarbon.toFixed(2)} kg CO₂e</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Average Carbon Footprint:</span>
              <span style={{ fontWeight: '700' }}>{avgCarbon} kg CO₂e / item</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Active Guest Session:</span>
              <span style={{ fontWeight: '700', color: 'var(--compostable)' }}>Local Sandbox</span>
            </div>
          </div>
        </div>

        {/* Categories audit bar chart */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="var(--neon-blue)" /> Category Frequency Audit
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categories.map(cat => {
              const count = categoryCounts[cat] || 0;
              const pct = totalItems > 0 ? (count / totalItems) * 100 : 0;
              const barColor = 
                cat === 'recyclable' ? 'var(--recyclable)' :
                cat === 'compostable' ? 'var(--compostable)' :
                cat === 'e-waste' ? 'var(--ewaste)' :
                cat === 'hazardous' ? 'var(--hazardous)' : 'var(--landfill)';
              return (
                <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{cat}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({Math.round(pct)}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: barColor }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Printable page layout directives */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .sidebar, .neon-glow-btn, .secondary-btn, form, select, input {
            display: none !important;
          }
          .main-content {
            padding: 0 !important;
            max-width: 100% !important;
          }
          .glass-card {
            background: none !important;
            border: 1px solid #ccc !important;
            color: black !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }
          h2, h3, h4, span, p, label {
            color: black !important;
          }
          .gradient-text {
            background: none !important;
            -webkit-text-fill-color: black !important;
            color: black !important;
          }
        }
      `}</style>

    </div>
  );
}
