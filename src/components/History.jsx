import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Trash2, Calendar, FileDown } from 'lucide-react';

export default function History({ logs, onClearLogs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortKey, setSortKey] = useState('newest'); // newest | oldest | high-carbon | low-carbon
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to delete all local history logs? This cannot be undone.")) {
      onClearLogs();
    }
  };

  // Filter logs
  const filtered = logs.filter(log => {
    const matchesSearch = log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.environmentalReasoning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || log.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Sort logs
  const sorted = [...filtered].sort((a, b) => {
    const timeA = new Date(a.created_at || a.id).getTime();
    const timeB = new Date(b.created_at || b.id).getTime();
    
    if (sortKey === 'newest') return timeB - timeA;
    if (sortKey === 'oldest') return timeA - timeB;
    if (sortKey === 'high-carbon') return b.carbonFootprintKg - a.carbonFootprintKg;
    if (sortKey === 'low-carbon') return a.carbonFootprintKg - b.carbonFootprintKg;
    return 0;
  });

  const categoryColors = {
    'recyclable': 'var(--recyclable)',
    'compostable': 'var(--compostable)',
    'hazardous': 'var(--hazardous)',
    'landfill': 'var(--landfill)',
    'e-waste': 'var(--ewaste)'
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Search & Filters card */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }} className="gradient-text">History Log</h2>
          {logs.length > 0 && (
            <button onClick={handleClear} className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--hazardous)' }}>
              <Trash2 size={12} /> Clear Logs
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          {/* Search text */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search history by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', color: '#fff', fontSize: '0.85rem' }}
            />
          </div>

          {/* Sort selection */}
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#090d16', border: '1px solid var(--card-border)', color: '#fff', fontSize: '0.85rem' }}
          >
            <option value="newest">Sort by: Newest First</option>
            <option value="oldest">Sort by: Oldest First</option>
            <option value="high-carbon">Sort by: Carbon (Highest)</option>
            <option value="low-carbon">Sort by: Carbon (Lowest)</option>
          </select>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'recyclable', label: 'Recyclable' },
            { id: 'compostable', label: 'Compostable' },
            { id: 'hazardous', label: 'Hazardous' },
            { id: 'landfill', label: 'Landfill' },
            { id: 'e-waste', label: 'E-Waste' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={activeCategory === tab.id ? 'neon-glow-btn' : 'secondary-btn'}
              style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '15px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }} className="glass-card">
            No waste logs matches the filters or search. Go scan an item!
          </div>
        ) : (
          sorted.map(log => {
            const isExpanded = expandedId === log.id;
            const logDate = log.created_at ? new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today';
            return (
              <div 
                key={log.id} 
                className="glass-card animate-fade-in" 
                style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', borderColor: isExpanded ? 'var(--accent)' : 'var(--card-border)' }}
              >
                {/* Header row */}
                <div 
                  onClick={() => toggleExpand(log.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: categoryColors[log.category] || 'var(--accent)' }} />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{log.itemName}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Calendar size={12} /> {logDate}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right', marginRight: '8px' }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--ewaste)' }}>{log.carbonFootprintKg} kg</p>
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CO₂e</p>
                    </div>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="animate-fade-in">
                    
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <p><strong>Category:</strong> <span style={{ textTransform: 'uppercase', color: categoryColors[log.category] }} className="badge-inline">{log.category}</span></p>
                      <p><strong>AI Confidence:</strong> {Math.round(log.confidence * 100)}%</p>
                      <p><strong>Sustainability Score:</strong> {log.sustainabilityScore}/100</p>
                    </div>

                    <p><strong>Reasoning:</strong> {log.environmentalReasoning}</p>

                    <div>
                      <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Disposal Instructions:</p>
                      <ul style={{ paddingLeft: '18px' }}>
                        {log.disposalInstructions.map((ins, idx) => (
                          <li key={idx} style={{ marginTop: '2px' }}>{ins}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Upcycling Ideas:</p>
                      <ul style={{ paddingLeft: '18px' }}>
                        {log.reuseIdeas.map((idea, idx) => (
                          <li key={idx} style={{ marginTop: '2px' }}>{idea}</li>
                        ))}
                      </ul>
                    </div>

                    {log.alternatives && log.alternatives.length > 0 && (
                      <p><strong>Greener Alternatives:</strong> {log.alternatives.join(', ')}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
