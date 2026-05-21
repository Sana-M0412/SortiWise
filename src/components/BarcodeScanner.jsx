import React, { useState } from 'react';
import { Camera, Search, PlusCircle, Bookmark, Trash2, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const MOCK_PRODUCTS = {
  "8901030733560": {
    name: "Pepsi 500ml PET Bottle",
    barcode: "8901030733560",
    brand: "PepsiCo",
    material: "PET Plastic (Code 1) + Paper Label",
    recyclable: "highly_recyclable",
    guidance: "Rinse container, remove cap and label, throw bottle in recycling bin.",
    alternatives: "Stainless steel reusable flask, glass carbonated water maker.",
    co2eKg: 0.08,
    score: 75
  },
  "49000028904": {
    name: "Coca-Cola 330ml Can",
    barcode: "49000028904",
    brand: "The Coca-Cola Company",
    material: "100% Recyclable Aluminum",
    recyclable: "highly_recyclable",
    guidance: "Rinse out liquids, crush can to save space, and place in aluminum recycling bin.",
    alternatives: "Soda maker with reusable carbon dioxide cylinders.",
    co2eKg: 0.12,
    score: 92
  },
  "028400040112": {
    name: "Lay's Classic Family Size Potato Chips",
    barcode: "028400040112",
    brand: "Frito-Lay",
    material: "Multi-layer Metallized Biaxially Oriented Polypropylene (BOPP)",
    recyclable: "non_recyclable",
    guidance: "Dispose in the landfill bin. Multi-layer plastics cannot be separated efficiently.",
    alternatives: "Snacks packaged in paper boxes, or fresh homemade potato chips.",
    co2eKg: 0.18,
    score: 15
  },
  "011110038364": {
    name: "Colgate Triple Action Toothpaste 150g",
    barcode: "011110038364",
    brand: "Colgate-Palmolive",
    material: "Plastic-Aluminium Foil Laminate Tube",
    recyclable: "non_recyclable",
    guidance: "Squeeze completely empty and discard in standard landfill trash.",
    alternatives: "Toothpaste tabs packaged in glass jars, metal recyclable toothpaste tubes.",
    co2eKg: 0.14,
    score: 22
  },
  "012000042436": {
    name: "Lipton Yellow Label Tea (100 Bags)",
    barcode: "012000042436",
    brand: "Unilever / Lipton",
    material: "Paper Box + Foil Wrappers + Tea Bags",
    recyclable: "compostable_recyclable",
    guidance: "Recycle the cardboard box. Clean paper tags are recyclable. Tea bags are organic compostable.",
    alternatives: "Loose tea leaves bought in bulk steel tins.",
    co2eKg: 0.05,
    score: 85
  }
};

export default function BarcodeScanner({ onAddLog, addXp }) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [activeScan, setActiveScan] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('sortiwise_barcode_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [errorMsg, setErrorMsg] = useState('');

  const lookupBarcode = (code) => {
    setErrorMsg('');
    setResult(null);

    const cleanCode = code.trim();
    if (!cleanCode) return;

    if (MOCK_PRODUCTS[cleanCode]) {
      const prod = MOCK_PRODUCTS[cleanCode];
      setResult(prod);
      if (prod.recyclable === 'highly_recyclable' || prod.recyclable === 'compostable_recyclable') {
        confetti({ particleCount: 50, spread: 40 });
      }
    } else {
      setErrorMsg("Product barcode not found in local catalog. Try typing: 8901030733560, 49000028904, or 028400040112.");
    }
  };

  const handleSimulateScan = (code) => {
    setActiveScan(true);
    setErrorMsg('');
    setResult(null);

    // Simulate standard camera scan delay
    setTimeout(() => {
      setActiveScan(false);
      lookupBarcode(code);
    }, 1500);
  };

  const saveToHistory = () => {
    if (!result) return;
    
    // Add to barcode history logs
    const updatedHistory = [result, ...history.filter(h => h.barcode !== result.barcode)].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('sortiwise_barcode_history', JSON.stringify(updatedHistory));

    // Convert to Waste Log structure and add to global logs
    const wasteCategory = result.recyclable === 'highly_recyclable' ? 'recyclable' :
                          result.recyclable === 'compostable_recyclable' ? 'recyclable' : 'landfill';
    
    onAddLog({
      itemName: `${result.name} (${result.brand})`,
      category: wasteCategory,
      confidence: 1.0,
      carbonFootprintKg: result.co2eKg,
      disposalInstructions: [result.guidance],
      reuseIdeas: ["Upcycle packaging for DIY storage"],
      alternatives: [result.alternatives],
      environmentalReasoning: `Packaging material: ${result.material}. Estimated CO2 footprint: ${result.co2eKg}kg.`,
      sustainabilityScore: result.score
    });

    addXp(30);
    setResult(null);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('sortiwise_barcode_history');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      
      {/* Scanner Window */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px' }} className="gradient-text">
          Smart Barcode Scanner
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Scan EAN/UPC barcodes to identify packaging materials, inspect recyclability ratings, and find alternatives.
        </p>

        {/* Laser beam simulated screen */}
        <div style={{
          height: '180px',
          background: '#04060b',
          borderRadius: '12px',
          border: '1px solid var(--card-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          {activeScan ? (
            <>
              {/* Red laser line */}
              <div style={{
                position: 'absolute',
                left: 0,
                width: '100%',
                height: '2px',
                background: '#ef4444',
                boxShadow: '0 0 10px #ef4444',
                animation: 'scanLine 2s infinite linear'
              }} />
              <p style={{ color: 'var(--hazardous)', fontSize: '0.85rem', fontWeight: '600' }}>Decoding Barcode...</p>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)' }}>
              <Camera size={40} style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '0.82rem' }}>Barcode camera simulator ready.</p>
            </div>
          )}
        </div>

        {/* Quick simulation buttons */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Choose a mock product to scan:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleSimulateScan('8901030733560')}>
              🥤 Pepsi PET
            </button>
            <button className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleSimulateScan('49000028904')}>
              🥫 Coca-Cola Can
            </button>
            <button className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleSimulateScan('028400040112')}>
              🍟 Lay's Bag
            </button>
            <button className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleSimulateScan('011110038364')}>
              🪥 Colgate Tube
            </button>
            <button className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleSimulateScan('012000042436')}>
              ☕ Lipton Tea
            </button>
          </div>
        </div>

        {/* Manual Input Search */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Type barcode (e.g. 49000028904)..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', color: '#fff', fontSize: '0.9rem' }}
          />
          <button className="neon-glow-btn" onClick={() => lookupBarcode(barcodeInput)} style={{ padding: '12px' }}>
            <Search size={16} /> Lookup
          </button>
        </div>

        {errorMsg && (
          <p style={{ color: 'var(--hazardous)', fontSize: '0.8rem', marginTop: '10px' }}>
            {errorMsg}
          </p>
        )}
      </div>

      {/* Results & History Panel */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Results view */}
        {result ? (
          <div className="glass-card animate-fade-in" style={{ background: 'var(--accent-gradient-glow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>{result.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Brand: {result.brand} | Barcode: {result.barcode}</p>
              </div>
              <span className={`badge ${result.recyclable === 'highly_recyclable' || result.recyclable === 'compostable_recyclable' ? 'recyclable' : 'landfill'}`}>
                {result.recyclable.replace('_', ' ')}
              </span>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <p><strong>Packaging Composition:</strong> {result.material}</p>
              <p><strong>Carbon Impact:</strong> {result.co2eKg} kg CO₂e (Eco Score: {result.score}/100)</p>
              <p><strong>Disposal Action:</strong> {result.guidance}</p>
              <p><strong>Eco Alternatives:</strong> {result.alternatives}</p>
            </div>

            <button className="neon-glow-btn" onClick={saveToHistory} style={{ width: '100%', marginTop: '16px', padding: '10px' }}>
              <PlusCircle size={16} /> Log product & Claim +30 XP
            </button>
          </div>
        ) : (
          <div style={{ border: '1px dashed var(--card-border)', borderRadius: '12px', padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No barcode scanned yet. Use the simulation buttons or manual input.
          </div>
        )}

        {/* Local Scans History */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={16} color="var(--accent)" /> Scanned Catalog History
            </h3>
            {history.length > 0 && (
              <button onClick={clearHistory} style={{ border: 'none', background: 'none', color: 'var(--hazardous)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>No items in search logs.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {history.map((hist, index) => (
                <div 
                  key={index}
                  onClick={() => setResult(hist)}
                  className="glass-card interactive"
                  style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
                >
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>{hist.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BC: {hist.barcode} | {hist.material}</p>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: hist.score > 50 ? 'var(--compostable)' : 'var(--hazardous)' }}>
                    {hist.score}/100
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
