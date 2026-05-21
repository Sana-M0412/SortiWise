import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, RefreshCw, Layers } from 'lucide-react';

const CENTER_TEMPLATES = [
  {
    name: "SortiWise Smart E-Waste Recycling Hub",
    type: "e-waste",
    typesAccepted: ["Computers", "Mobile Phones", "Batteries", "Chargers", "Cables"],
    address: "Techno Park Rd, Block B",
    latOffset: 0.012,
    lngOffset: -0.014,
    phone: "+91 98860 12345"
  },
  {
    name: "GreenEarth Organic Compost Depot",
    type: "compost",
    typesAccepted: ["Food Scraps", "Garden Trimmings", "Peels", "Organic Board"],
    address: "Eco Meadows, Central Avenue",
    latOffset: -0.009,
    lngOffset: 0.018,
    phone: "+91 80234 56789"
  },
  {
    name: "Municipal Dry Waste Segregation Center",
    type: "recyclable",
    typesAccepted: ["Cardboard", "Paper", "PET Plastics", "Glass Bottles", "Metal Cans"],
    address: "Civic Utilities Circle",
    latOffset: 0.022,
    lngOffset: 0.005,
    phone: "+91 94480 98765"
  },
  {
    name: "Hazardous Chemical & Battery Collection Vault",
    type: "hazardous",
    typesAccepted: ["Aerosols", "Car Batteries", "Mercury Bulbs", "Paints", "Pesticides"],
    address: "Industrial Ward, Phase 2",
    latOffset: -0.017,
    lngOffset: -0.021,
    phone: "+91 99000 54321"
  }
];

export default function RecyclingCenters() {
  const [coords, setCoords] = useState(null); // { lat, lng }
  const [loading, setLoading] = useState(false);
  const [centers, setCenters] = useState([]);
  const [filterType, setFilterType] = useState('all'); // all | recyclable | compost | e-waste | hazardous
  const [errorMsg, setErrorMsg] = useState('');

  // Haversine formula to calculate distance in km between two lat/lng pairs
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return Math.round(d * 10) / 10;
  };

  const getGeolocation = () => {
    setLoading(true);
    setErrorMsg('');
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser. Simulating default coordinates.");
      simulateLocation(12.9716, 77.5946); // Bangalore
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        generateNearbyCenters(latitude, longitude);
        setLoading(false);
      },
      (error) => {
        console.warn("Geolocation permission denied:", error.message);
        setErrorMsg("Location access denied. Loaded default simulator coordinates (Bangalore).");
        simulateLocation(12.9716, 77.5946);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const simulateLocation = (lat, lng) => {
    setCoords({ lat, lng });
    generateNearbyCenters(lat, lng);
    setLoading(false);
  };

  const generateNearbyCenters = (userLat, userLng) => {
    const mapped = CENTER_TEMPLATES.map(tmpl => {
      const centerLat = userLat + tmpl.latOffset;
      const centerLng = userLng + tmpl.lngOffset;
      const distance = calculateDistance(userLat, userLng, centerLat, centerLng);
      return {
        ...tmpl,
        lat: centerLat,
        lng: centerLng,
        distance
      };
    }).sort((a, b) => a.distance - b.distance);
    setCenters(mapped);
  };

  useEffect(() => {
    getGeolocation();
  }, []);

  const filteredCenters = filterType === 'all' 
    ? centers 
    : centers.filter(c => c.type === filterType);

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
      
      {/* Geolocation Info panel */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800' }} className="gradient-text">
          Eco-Facility Locator
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Find nearby state-authorized disposal warehouses, community compost drops, and e-waste collection bins.
        </p>

        {coords ? (
          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Compass size={18} color="var(--compostable)" />
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Active Coordinates</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Latitude: {coords.lat.toFixed(5)}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Longitude: {coords.lng.toFixed(5)}</p>
          </div>
        ) : (
          <div className="skeleton" style={{ height: '70px', borderRadius: '12px' }} />
        )}

        {errorMsg && (
          <p style={{ color: 'var(--ewaste)', fontSize: '0.78rem' }}>{errorMsg}</p>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="secondary-btn" onClick={getGeolocation} disabled={loading} style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}>
            <RefreshCw size={14} className={loading ? 'animate-float' : ''} /> Refresh Location
          </button>
          <button className="secondary-btn" onClick={() => simulateLocation(12.9716, 77.5946)} style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}>
            Simulate Bangalore
          </button>
        </div>

        {/* Filter Facility Category */}
        <div style={{ marginTop: '12px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
            Filter Facility Category:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { id: 'all', label: 'Show All' },
              { id: 'recyclable', label: '♻️ Recyclables' },
              { id: 'compost', label: '🥬 Compost' },
              { id: 'e-waste', label: '🔌 E-Waste' },
              { id: 'hazardous', label: '☣️ Hazardous' }
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setFilterType(btn.id)}
                className={filterType === btn.id ? 'neon-glow-btn' : 'secondary-btn'}
                style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '15px' }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Centers Directory */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MapPin size={18} color="var(--accent)" /> Nearby Facilities ({filteredCenters.length})
        </h3>

        {filteredCenters.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', marginBlock: 'auto' }}>
            No centers match the chosen filter in this range.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
            {filteredCenters.map((center, idx) => (
              <div 
                key={idx}
                className="glass-card interactive animate-fade-in"
                style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', borderLeft: `4px solid ${
                  center.type === 'recyclable' ? 'var(--recyclable)' :
                  center.type === 'compost' ? 'var(--compostable)' :
                  center.type === 'e-waste' ? 'var(--ewaste)' : 'var(--hazardous)'
                }` }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)' }}>{center.name}</h4>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                    {center.distance} km
                  </span>
                </div>
                
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>📍 {center.address}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>📞 {center.phone}</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
                  {center.typesAccepted.map((tag, tIdx) => (
                    <span key={tIdx} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                      {tag}
                    </span>
                  ))}
                </div>

                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="secondary-btn"
                  style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '0.75rem', marginTop: '12px', width: '100%', gap: '6px' }}
                >
                  <Navigation size={12} /> Navigate Directions
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
