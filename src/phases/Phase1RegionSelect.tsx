
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { getRandomFailureGif, getRandomSuccessGif } from '../data/gifs';

// ─── ROAST MESSAGES (English / Hindi / Gujarati) ────────────────────────────
// GIFs will be assigned uniquely from the shared pool at show time.

const ROAST_TEXTS = [
  "WRONG! Try again, space cadet! 🤦‍♂️",
  "Galat jawab! Thoda dhyan se! 😂",
  "Are yaar! Itna simple bhi nahi pata? 🙈",
  "Bhai, tu DevOps karega ki golgappe khayega? 😜",
  "Oops! That's not the fastest route! 🚀",
  "Aavyu re! Aavo to sahi, pan aam nai! 🤪",
  "Sharaddha rakho, latency maaro! 😅",
  "Chalo, phir se try karo! Tumse na ho payega? 😂",
  "Not even close! Maybe you need more chai? ☕",
  "Bhai, tane latency su che te khabar nathi? 🤔",
  "LOL! That region is slower than Mumbai traffic! 🚦",
  "Aree! Ekdam ultu! Have sudhro! 🙏",
  "Thoda brain cells use karo, please! 🧠",
  "Mara vichaar ma, aapde aagal vadharvu joiye? 😆",
];

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Region {
  code: string;
  name: string;
  city: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
  latency: number;
  distanceKm: number;
  bearing: number;
}

interface UserLocation {
  lat: number;
  lng: number;
  city: string;
  country: string;
  flag: string;
  countryCode: string;
}

// ─── AWS REGIONS (with real coordinates) ─────────────────────────────────────

const REGIONS_RAW = [
  { code: 'us-east-1', name: 'US East (N. Virginia)', city: 'Ashburn', country: 'USA', flag: '🇺🇸', lat: 39.0438, lng: -77.4874 },
  { code: 'us-west-2', name: 'US West (Oregon)', city: 'Portland', country: 'USA', flag: '🇺🇸', lat: 45.5231, lng: -122.6765 },
  { code: 'eu-west-1', name: 'EU West (Ireland)', city: 'Dublin', country: 'Ireland', flag: '🇮🇪', lat: 53.3498, lng: -6.2603 },
  { code: 'ap-south-1', name: 'Asia Pacific (Mumbai)', city: 'Mumbai', country: 'India', flag: '🇮🇳', lat: 19.0760, lng: 72.8777 },
  { code: 'ap-southeast-1', name: 'Asia Pacific (Singapore)', city: 'Singapore', country: 'Singapore', flag: '🇸🇬', lat: 1.3521, lng: 103.8198 },
  { code: 'sa-east-1', name: 'South America (São Paulo)', city: 'São Paulo', country: 'Brazil', flag: '🇧🇷', lat: -23.5505, lng: -46.6333 },
];

const FALLBACK_LATENCIES: Record<string, number> = {
  'us-east-1': 210, 'us-west-2': 260, 'eu-west-1': 140,
  'ap-south-1': 12, 'ap-southeast-1': 65, 'sa-east-1': 310,
};

// ─── UTILITY FUNCTIONS ───────────────────────────────────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingDeg(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const lat1r = (lat1 * Math.PI) / 180;
  const lat2r = (lat2 * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2r);
  const x = Math.cos(lat1r) * Math.sin(lat2r) - Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function estimateLatency(distanceKm: number): number {
  return Math.round(5 + distanceKm * 0.012);
}

// ─── GLOBE LAYOUT CONSTANTS ──────────────────────────────────────────────────

const GLOBE_CX = 200;
const GLOBE_CY = 200;
const GLOBE_R = 155;
const REGION_R = 138;
const PATH_ARC_FACTOR = 0.42;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function Phase1RegionSelect() {
  const { selectedRegion, setSelectedRegion, completePhase, addScore, addBadge } = useGameStore();

  // ── User geolocation ──────────────────────────────────────────────────
  const [userLoc, setUserLoc] = useState<UserLocation | null>(null);
  const [locLoading, setLocLoading] = useState(true);
  const [locError, setLocError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchLocation() {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (!cancelled && data.latitude && data.longitude) {
          setUserLoc({
            lat: data.latitude,
            lng: data.longitude,
            city: data.city || 'Unknown',
            country: data.country_name || 'Unknown',
            flag: data.country_code
              ? String.fromCodePoint(...[...data.country_code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
              : '🌐',
            countryCode: data.country_code || 'XX',
          });
        } else if (!cancelled) {
          setLocError(true);
        }
      } catch {
        if (!cancelled) setLocError(true);
      } finally {
        if (!cancelled) setLocLoading(false);
      }
    }
    fetchLocation();
    return () => { cancelled = true; };
  }, []);

  // ── Build region list with dynamic latencies ──────────────────────────
  const regions: Region[] = useMemo(() => {
    const refLat = userLoc?.lat ?? 20.5937;
    const refLng = userLoc?.lng ?? 78.9629;
    return REGIONS_RAW.map((r) => {
      const distanceKm = Math.round(haversineKm(refLat, refLng, r.lat, r.lng));
      const latency = userLoc ? estimateLatency(distanceKm) : FALLBACK_LATENCIES[r.code] ?? 100;
      const bearing = bearingDeg(refLat, refLng, r.lat, r.lng);
      return { ...r, distanceKm, latency, bearing };
    });
  }, [userLoc]);

  // ── Game state ────────────────────────────────────────────────────────
  const [pings, setPings] = useState<number[]>(() => regions.map(() => 0));
  const [showSuccess, setShowSuccess] = useState(false);
  const [shakeRegion, setShakeRegion] = useState<string | null>(null);
  const [phaseCompleted, setPhaseCompleted] = useState(false);
  const [highlightedRegion, setHighlightedRegion] = useState<string | null>(null);
  const [showDebriefing, setShowDebriefing] = useState(false);
  const [winningRegion, setWinningRegion] = useState<Region | null>(null);
  const [roast, setRoast] = useState<{ text: string; gifUrl: string } | null>(null);
  const [showRoast, setShowRoast] = useState(false);
  const [successGif, setSuccessGif] = useState('');

  // reveal pings one by one
  useEffect(() => {
    const reveal = async () => {
      const dynamicPings = regions.map((r) => r.latency);
      for (let i = 0; i < dynamicPings.length; i++) {
        await new Promise((r) => setTimeout(r, 400));
        setPings((prev) => {
          const next = [...prev];
          next[i] = dynamicPings[i];
          return next;
        });
      }
    };
    const t = setTimeout(reveal, 800);
    return () => clearTimeout(t);
  }, [regions]);

  const lowestLatency = useMemo(
    () => Math.min(...regions.map((r) => r.latency)),
    [regions],
  );

  // Find furthest region for comparison
  const furthestRegion = useMemo(
    () => regions.reduce((max, r) => r.latency > max.latency ? r : max, regions[0]),
    [regions],
  );

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleRegionClick = useCallback(
    (region: Region) => {
      if (phaseCompleted) return;
      setSelectedRegion(region.code);

      if (region.latency === lowestLatency) {
        setWinningRegion(region);
        setSuccessGif(getRandomSuccessGif());
        setShowSuccess(true);
        addScore(100);
        addBadge({
          id: 'region-scout',
          name: 'Region Scout',
          icon: '🌍',
          earnedAt: Date.now(),
        });
        // After success animation, show debriefing
        setTimeout(() => {
          setShowSuccess(false);
          setShowDebriefing(true);
        }, 10000);
      } else {
        setShakeRegion(region.code);
        // Pick a random roast text + unique failure GIF
        const randomText = ROAST_TEXTS[Math.floor(Math.random() * ROAST_TEXTS.length)];
        const gifUrl = getRandomFailureGif();
        setRoast({ text: randomText, gifUrl });
        setShowRoast(true);
        setTimeout(() => {
          setShakeRegion(null);
          setShowRoast(false);
        }, 10000);
      }
    },
    [phaseCompleted, lowestLatency, setSelectedRegion, addScore, addBadge],
  );

  const handleContinue = useCallback(() => {
    completePhase(1);
    setPhaseCompleted(true);
  }, [completePhase]);

  // ── Globe helpers ─────────────────────────────────────────────────────
  const regionPositions = useMemo(() => {
    return regions.map((r) => {
      const rad = ((r.bearing - 90) * Math.PI) / 180;
      return {
        x: GLOBE_CX + REGION_R * Math.cos(rad),
        y: GLOBE_CY + REGION_R * Math.sin(rad),
      };
    });
  }, [regions]);

  const buildPath = (toX: number, toY: number): string => {
    const dx = toX - GLOBE_CX;
    const dy = toY - GLOBE_CY;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const offset = len * PATH_ARC_FACTOR;
    const midX = (GLOBE_CX + toX) / 2 + (-dy / len) * offset;
    const midY = (GLOBE_CY + toY) / 2 + (dx / len) * offset;
    return `M${GLOBE_CX},${GLOBE_CY} Q${midX},${midY} ${toX},${toY}`;
  };

  const latencyColor = (ms: number): string => {
    if (ms < 30) return '#00ff88';
    if (ms < 100) return '#ffaa00';
    return '#ff3366';
  };

  const latencyLabel = (ms: number): string => {
    if (ms < 30) return 'Excellent';
    if (ms < 100) return 'Good';
    if (ms < 200) return 'Fair';
    return 'Poor';
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[550px] relative">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-bold text-white mb-1"
      >
        🌍 Mission Control — Region Selection
      </motion.h2>
      <p className="text-xs text-cosmic-muted mb-3 text-center max-w-xl">
        We&apos;ve detected your location. Watch the network paths light up — the{' '}
        <strong className="text-cosmic-accent">shortest path = lowest latency</strong>.
        Select the best region to stabilise your orbit.
      </p>

      {/* ── User location badge ─────────────────────────────────────── */}
      <div className="mb-3 flex items-center gap-2">
        {locLoading ? (
          <span className="text-[10px] font-mono text-cosmic-muted animate-pulse">
            📡 Detecting your location...
          </span>
        ) : locError ? (
          <span className="text-[10px] font-mono text-cosmic-warning">
            ⚠️ Could not detect location — using defaults
          </span>
        ) : userLoc ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-cosmic-panel/60 border border-cosmic-accent/30 rounded-full px-3 py-1.5"
          >
            <span className="text-sm">{userLoc.flag}</span>
            <span className="text-[10px] font-mono text-cosmic-accent">
              You: {userLoc.city}, {userLoc.country}
            </span>
            <span className="w-2 h-2 rounded-full bg-cosmic-success animate-pulse" />
          </motion.div>
        ) : null}
      </div>

      {/* ── GLOBE VISUALISATION ──────────────────────────────────────── */}
      <div className="relative w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] mb-2 flex-shrink-0">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <filter id="globe-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="globe-grad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#1a1a5e" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#0d0d2b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06061a" stopOpacity="0.8" />
            </radialGradient>
          </defs>

          <circle cx={GLOBE_CX} cy={GLOBE_CY} r={GLOBE_R + 8}
            fill="none" stroke="rgba(0,240,255,0.08)" strokeWidth="12" filter="url(#globe-glow)" />

          <circle cx={GLOBE_CX} cy={GLOBE_CY} r={GLOBE_R}
            fill="url(#globe-grad)" stroke="rgba(0,240,255,0.25)" strokeWidth="1.5" filter="url(#globe-glow)" />

          {[0.35, 0.65].map((frac, i) => (
            <ellipse key={`lat-${i}`} cx={GLOBE_CX} cy={GLOBE_CY}
              rx={GLOBE_R * Math.cos(frac * Math.PI)} ry={GLOBE_R * 0.22}
              fill="none" stroke="rgba(0,240,255,0.06)" strokeWidth="0.8"
              transform={`translate(0,${(frac - 0.5) * GLOBE_R * 0.85})`} />
          ))}
          {[-40, 0, 40, 90].map((angle, i) => (
            <line key={`lng-${i}`} x1={GLOBE_CX} y1={GLOBE_CY - GLOBE_R}
              x2={GLOBE_CX} y2={GLOBE_CY + GLOBE_R}
              stroke="rgba(0,240,255,0.05)" strokeWidth="0.6"
              transform={`rotate(${angle}, ${GLOBE_CX}, ${GLOBE_CY})`} />
          ))}
          <ellipse cx={GLOBE_CX} cy={GLOBE_CY} rx={GLOBE_R * 0.97} ry={GLOBE_R * 0.15}
            fill="none" stroke="rgba(0,240,255,0.12)" strokeWidth="1" />

          {/* ── Network paths ──────────────────────────────────────── */}
          {regionPositions.map((pos, i) => {
            const region = regions[i];
            const pinged = pings[i] > 0;
            if (!pinged) return null;
            const color = latencyColor(region.latency);
            const isLowest = region.latency === lowestLatency;
            return (
              <g key={`path-${i}`}>
                <path d={buildPath(pos.x, pos.y)} fill="none" stroke={color}
                  strokeWidth={isLowest ? 2.5 : 1.2}
                  strokeOpacity={isLowest ? 0.5 : 0.2} strokeLinecap="round" filter="url(#globe-glow)" />
                <path d={buildPath(pos.x, pos.y)} fill="none" stroke={color}
                  strokeWidth={isLowest ? 2 : 1}
                  strokeOpacity={isLowest ? 0.9 : 0.5}
                  strokeDasharray={isLowest ? '6 8' : '4 12'} strokeLinecap="round">
                  <animate attributeName="stroke-dashoffset" from="0"
                    to={isLowest ? '-28' : '-32'} dur={isLowest ? '0.7s' : '1.4s'} repeatCount="indefinite" />
                </path>
              </g>
            );
          })}

          {/* ── Region nodes ──────────────────────────────────────── */}
          {regionPositions.map((pos, i) => {
            const region = regions[i];
            const pinged = pings[i] > 0;
            if (!pinged) return null;
            const color = latencyColor(region.latency);
            const isLowest = region.latency === lowestLatency;
            const isHighlighted = highlightedRegion === region.code;
            const isSelected = selectedRegion === region.code;
            return (
              <g key={`node-${i}`} style={{ cursor: 'pointer' }}
                onClick={() => handleRegionClick(region)}
                onMouseEnter={() => setHighlightedRegion(region.code)}
                onMouseLeave={() => setHighlightedRegion(null)}>
                <circle cx={pos.x} cy={pos.y} r={isLowest ? 14 : 10}
                  fill="none" stroke={color}
                  strokeWidth={isLowest ? 2 : 1}
                  strokeOpacity={isHighlighted || isSelected ? 0.8 : 0.4}
                  filter="url(#node-glow)">
                  {isLowest && <animate attributeName="r" values="12;16;12" dur="1.5s" repeatCount="indefinite" />}
                </circle>
                <circle cx={pos.x} cy={pos.y} r={isLowest ? 5 : 3.5} fill={color} filter="url(#node-glow)" />
                {isLowest && (
                  <g transform={`translate(${pos.x + 16}, ${pos.y - 10})`}>
                    <rect x="-18" y="-7" width="36" height="14" rx="4"
                      fill="rgba(0,255,136,0.2)" stroke="#00ff88" strokeWidth="0.8" />
                    <text x="0" y="3" textAnchor="middle" fill="#00ff88"
                      fontSize="8" fontFamily="monospace" fontWeight="bold">BEST</text>
                  </g>
                )}
                <text x={pos.x} y={pos.y + 24} textAnchor="middle"
                  fill={isHighlighted || isSelected ? color : 'rgba(200,200,232,0.7)'}
                  fontSize="8" fontFamily="monospace">{region.code}</text>
                <text x={pos.x} y={pos.y + 35} textAnchor="middle"
                  fill={color} fontSize="9" fontFamily="monospace" fontWeight="bold">{region.latency}ms</text>
              </g>
            );
          })}

          {/* ── User marker (centre) ──────────────────────────────── */}
          <circle cx={GLOBE_CX} cy={GLOBE_CY} r={8}
            fill="#00f0ff" fillOpacity="0.3" stroke="#00f0ff" strokeWidth="2" filter="url(#node-glow)">
            <animate attributeName="r" values="7;10;7" dur="2s" repeatCount="indefinite" />
            <animate attributeName="fillOpacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <text x={GLOBE_CX} y={GLOBE_CY + 4} textAnchor="middle" fontSize="12" fill="#00f0ff"
            style={{ pointerEvents: 'none' }}>🏠</text>
          <text x={GLOBE_CX} y={GLOBE_CY - 16} textAnchor="middle" fontSize="7"
            fontFamily="monospace" fill="rgba(0,240,255,0.8)">YOU</text>
        </svg>
      </div>

      {/* ── Latency legend ─────────────────────────────────────────── */}
      <div className="flex gap-4 mb-4 text-[10px] font-mono">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cosmic-success animate-pulse" /> Low (&lt;30ms)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cosmic-warning" /> Medium (30-100ms)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cosmic-danger" /> High (&gt;100ms)
        </span>
      </div>

      {/* ── Region cards grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-2xl">
        <AnimatePresence>
          {regions.map((region, idx) => {
            const pingRevealed = pings[idx] > 0;
            const isLowest = region.latency === lowestLatency;
            const isSelected = selectedRegion === region.code;
            const isShaking = shakeRegion === region.code;

            return (
              <motion.button
                key={region.code}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1, scale: 1,
                  x: isShaking ? [0, -5, 5, -5, 5, 0] : 0,
                }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => handleRegionClick(region)}
                disabled={phaseCompleted || showDebriefing}
                className={`
                  relative p-3 rounded-xl border text-left transition-all duration-300
                  ${isSelected && isLowest
                    ? 'border-cosmic-success bg-cosmic-success/10 animate-pulse-glow'
                    : 'border-cosmic-border bg-cosmic-panel/40 hover:border-cosmic-accent/50'}
                  ${isShaking ? 'border-cosmic-danger bg-cosmic-danger/10 animate-shake' : ''}
                  ${phaseCompleted || showDebriefing ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{region.flag}</span>
                  <span className="text-[10px] font-mono text-cosmic-accent">{region.code}</span>
                </div>
                <p className="text-[10px] text-cosmic-text mb-1">{region.city}, {region.country}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-[9px] font-mono mb-0.5">
                    <span className="text-cosmic-muted">PING</span>
                    {pingRevealed ? (
                      <span style={{ color: latencyColor(region.latency) }}>{region.latency}ms</span>
                    ) : (
                      <span className="text-cosmic-muted">---</span>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-cosmic-bg rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: pingRevealed ? `${Math.min((region.latency / 350) * 100, 100)}%` : '0%' }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: latencyColor(region.latency) }}
                    />
                  </div>
                  {pingRevealed && (
                    <p className="text-[9px] text-cosmic-muted mt-0.5 font-mono">
                      ~{region.distanceKm.toLocaleString()} km
                    </p>
                  )}
                </div>
                {pingRevealed && isLowest && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="absolute top-1.5 right-1.5">
                    <span className="text-[9px] bg-cosmic-success/20 px-1.5 py-0.5 rounded text-cosmic-success font-mono">BEST</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Success overlay (brief flash with GIF) ─────────────────── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-cosmic-bg/85 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1], rotate: [0, 360] }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {successGif && (
                <img src={successGif} alt="Success"
                  className="w-56 h-56 object-contain rounded-2xl mx-auto mb-3 border-2 border-cosmic-success/50 shadow-[0_0_30px_rgba(0,255,136,0.3)] bg-black/20" />
              )}
              <span className="text-6xl">🛰️</span>
              <h2 className="text-2xl font-bold text-cosmic-success mt-4 glow-text">Orbit Stabilised!</h2>
              <p className="text-sm text-cosmic-text mt-2">Analysing connection metrics...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ROAST OVERLAY ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showRoast && roast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="bg-cosmic-dark/90 border-2 border-cosmic-danger/60 rounded-2xl p-5 max-w-sm w-full shadow-[0_0_30px_rgba(255,51,102,0.4)] pointer-events-auto"
            >
              {/* GIF */}
              <div className="mb-3 rounded-xl overflow-hidden border border-cosmic-danger/30">
                <img
                  src={roast.gifUrl}
                  alt="roast"
                  className="w-full h-40 object-contain bg-black/30"
                />
              </div>
              {/* Roast Text */}
              <p className="text-lg font-bold text-cosmic-danger text-center glow-text">
                {roast.text}
              </p>
              {/* Close hint */}
              <p className="text-[9px] font-mono text-cosmic-muted text-center mt-2">
                Try again in 10 seconds...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DEBRIEFING PANEL ───────────────────────────────────────── */}
      <AnimatePresence>
        {showDebriefing && winningRegion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-cosmic-bg/90 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-cosmic-dark border-2 border-cosmic-success/40 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-[0_0_40px_rgba(0,255,136,0.15)]"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-4xl"
                >
                  🛰️
                </motion.span>
                <div>
                  <h2 className="text-lg font-bold text-cosmic-success glow-text">
                    Mission Debriefing — Phase 1
                  </h2>
                  <p className="text-xs text-cosmic-muted font-mono">Region Selection Analysis</p>
                </div>
              </div>

              {/* What you chose */}
              <div className="bg-cosmic-panel/50 border border-cosmic-border rounded-xl p-4 mb-4">
                <h3 className="text-xs font-mono text-cosmic-accent mb-2">🎯 YOUR SELECTION</h3>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{winningRegion.flag}</span>
                  <div>
                    <p className="text-sm font-bold text-white">{winningRegion.name}</p>
                    <p className="text-xs text-cosmic-muted font-mono">
                      {winningRegion.code} — {winningRegion.city}, {winningRegion.country}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-mono font-bold text-cosmic-success">{winningRegion.latency}ms</p>
                    <p className="text-[10px] text-cosmic-muted">latency</p>
                  </div>
                </div>
              </div>

              {/* Key learnings */}
              <div className="space-y-4 mb-5">
                {/* Why this was correct */}
                <div className="bg-cosmic-success/5 border border-cosmic-success/20 rounded-lg p-3">
                  <p className="text-xs font-mono text-cosmic-success font-bold mb-1">✅ WHY THIS WAS CORRECT</p>
                  <p className="text-xs text-cosmic-text leading-relaxed">
                    <strong className="text-white">{winningRegion.city}</strong> is geographically the closest
                    AWS region to your location{userLoc ? ` (${userLoc.city}, ${userLoc.country})` : ''} at{' '}
                    <strong className="text-cosmic-success">{winningRegion.distanceKm.toLocaleString()} km</strong> away.
                    Shorter physical distance means fewer network hops, less fibre-optic cable to traverse,
                    and therefore <strong className="text-cosmic-success">lower latency</strong>.
                  </p>
                </div>

                {/* The comparison */}
                <div className="bg-cosmic-warning/5 border border-cosmic-warning/20 rounded-lg p-3">
                  <p className="text-xs font-mono text-cosmic-warning font-bold mb-1">📊 THE DIFFERENCE MATTERS</p>
                  <p className="text-xs text-cosmic-text leading-relaxed">
                    Compare: <strong className="text-cosmic-success">{winningRegion.code}</strong> at{' '}
                    <span className="text-cosmic-success font-mono">{winningRegion.latency}ms</span> vs{' '}
                    <strong className="text-cosmic-danger">{furthestRegion.code}</strong> at{' '}
                    <span className="text-cosmic-danger font-mono">{furthestRegion.latency}ms</span>.
                    That&apos;s a{' '}
                    <strong className="text-cosmic-warning">
                      {Math.round(((furthestRegion.latency - winningRegion.latency) / furthestRegion.latency) * 100)}%
                      improvement
                    </strong>.
                    In a real app, this directly affects page load times, API response speed, and user experience.
                  </p>
                </div>

                {/* Core concept */}
                <div className="bg-cosmic-accent/5 border border-cosmic-accent/20 rounded-lg p-3">
                  <p className="text-xs font-mono text-cosmic-accent font-bold mb-1">🧠 CORE CONCEPT: LATENCY</p>
                  <p className="text-xs text-cosmic-text leading-relaxed">
                    <strong>Latency</strong> is the time it takes for data to travel from your user to the server
                    and back. It&apos;s measured in milliseconds (ms). Every kilometre of fibre adds ~0.005-0.01ms.
                    Routing through more internet exchange points adds overhead. The golden rule:{' '}
                    <strong className="text-cosmic-accent">
                      deploy your servers as close to your users as possible.
                    </strong>
                  </p>
                </div>
              </div>

              {/* Score & badge */}
              <div className="flex items-center justify-between mb-5 bg-cosmic-panel/30 border border-cosmic-border rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌍</span>
                  <span className="text-xs font-mono text-cosmic-text">Badge earned:</span>
                  <span className="text-xs font-mono text-cosmic-accent font-bold">Region Scout</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono text-cosmic-warning font-bold">+100 pts</span>
                </div>
              </div>

              {/* Continue button */}
              <motion.button
                onClick={handleContinue}
                className="w-full py-4 rounded-xl font-bold text-sm tracking-wider font-mono
                  bg-cosmic-success/20 border-2 border-cosmic-success text-cosmic-success
                  hover:bg-cosmic-success/30 transition-all"
                whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(0,255,136,0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                🚀 PROCEED TO THE FORGE
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
