import { useState, useRef, useCallback, useEffect } from 'react';
import { API_URL, WINDOW_SIZE } from '../utils/constants';
import { SensorSimulator } from '../utils/SensorSimulator';
import BackgroundCanvas from '../components/layout/BackgroundCanvas';
import TopBar           from '../components/layout/TopBar';
import VehicleConfig    from '../components/dashboard/VehicleConfig';
import TelemetryGauges  from '../components/dashboard/TelemetryGauges';
import PredictionPanel  from '../components/dashboard/PredictionPanel';
import CommandConsole   from '../components/dashboard/CommandConsole';
import SnippetModal     from '../components/dashboard/SnippetModal';

const DEFAULT_TELEMETRY = {
  engineTemperature: 0,
  vibrationLevels:   0,
  fuelConsumption:   0,
  actualLoad:        0,
  tirePressure:      0,
};

export default function Dashboard() {
  /* ── Config state ── */
  const [vehicleId,   setVehicleId]   = useState('VH-001');
  const [vehicleType, setVehicleType] = useState('Truck');
  const [makeModel,   setMakeModel]   = useState('AshokLeyland_1616');

  /* ── Runtime state ── */
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [telemetry,    setTelemetry]    = useState(DEFAULT_TELEMETRY);
  const [samples,      setSamples]      = useState(0);
  const [prediction,   setPrediction]   = useState(null);
  const [logs,         setLogs]         = useState([
    { msg: '▸ System initialized. Awaiting start...', type: 'sys' },
  ]);
  const [showSnippet, setShowSnippet] = useState(false);

  /* ── Theme state ── */
  const [theme, setTheme] = useState(() => localStorage.getItem('pm-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pm-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  /* ── Refs for interval / sim (stable across renders) ── */
  const intervalRef  = useRef(null);
  const simRef       = useRef(new SensorSimulator());
  const samplesRef   = useRef(0);
  const monitorRef   = useRef(false);

  /* ── Logging ── */
  const log = useCallback((msg, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { msg: `[${ts}] ${msg}`, type }]);
  }, []);

  /* ── Send telemetry ── */
  const sendTelemetry = useCallback(async (data) => {
    log(`→ temp=${data.engineTemperature} vib=${data.vibrationLevels} fuel=${data.fuelConsumption} load=${data.actualLoad} tire=${data.tirePressure}`, 'send');
    setTelemetry(data);

    try {
      const res  = await fetch(API_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      const body = await res.json();

      if (res.status === 202) {
        samplesRef.current += 1;
        setSamples(samplesRef.current);
        log(`✓ Buffered (${samplesRef.current}/${WINDOW_SIZE})`, 'ok');

      } else if (res.status === 200) {
        samplesRef.current = 0;
        setSamples(WINDOW_SIZE);
        log('★ PREDICTION RECEIVED!', 'sys');
        setPrediction(body);
        const prob = (body.prediction?.probability ?? 0) * 100;
        const conf = (body.prediction?.model_confidence ?? 0) * 100;
        const risk = body.prediction?.risk_level || 'UNKNOWN';
        log(`Risk: ${risk} | Prob: ${prob.toFixed(1)}% | Conf: ${conf.toFixed(1)}%`, 'sys');
        body.warnings?.forEach(w => log(`⚡ ${w}`, 'warn'));

        setTimeout(() => {
          samplesRef.current = 0;
          setSamples(0);
        }, 2000);

      } else {
        log(`⚠ Status ${res.status}: ${JSON.stringify(body)}`, 'warn');
      }
    } catch (err) {
      log(`✕ ${err.message}`, 'err');
      log('Is backend running on localhost:8081?', 'err');
    }
  }, [log]);

  /* ── Start monitoring ── */
  const startMonitoring = useCallback(() => {
    const vid = vehicleId.trim();
    if (!vid) { log('Vehicle ID required!', 'err'); return; }

    monitorRef.current = true;
    samplesRef.current = 0;
    simRef.current.reset();

    setIsMonitoring(true);
    setSamples(0);
    setPrediction(null);

    log(`Monitoring started for [${vid}]`, 'sys');
    log('Auto-sending realistic telemetry (1.5s interval)', 'info');

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!monitorRef.current) return;
      const data = simRef.current.next(vid);
      sendTelemetry(data);
    }, 1500);
  }, [vehicleId, log, sendTelemetry]);

  /* ── Stop monitoring ── */
  const stopMonitoring = useCallback(() => {
    monitorRef.current = false;
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setIsMonitoring(false);
    log('Monitoring stopped.', 'warn');
  }, [log]);

  /* ── Manual send (console input) ── */
  const sendManual = useCallback((raw) => {
    try {
      const data = JSON.parse(raw);
      sendTelemetry(data);
    } catch (e) {
      log('✕ Invalid JSON: ' + e.message, 'err');
    }
  }, [sendTelemetry, log]);

  /* ── Clear console ── */
  const clearConsole = useCallback(() => {
    setLogs([{ msg: '▸ Console cleared.', type: 'sys' }]);
  }, []);

  return (
    <>
      <BackgroundCanvas />
      <TopBar vehicleId={vehicleId} isOnline={isMonitoring} theme={theme} onToggleTheme={toggleTheme} />

      <main className="grid-main">
        {/* ── LEFT COLUMN ── */}
        <div className="col-left">
          <VehicleConfig
            vehicleId={vehicleId}   setVehicleId={setVehicleId}
            vehicleType={vehicleType} setVehicleType={setVehicleType}
            makeModel={makeModel}   setMakeModel={setMakeModel}
            isMonitoring={isMonitoring}
            onStart={startMonitoring}
            onStop={stopMonitoring}
          />
          <TelemetryGauges telemetry={telemetry} samples={samples} />
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="col-right">
          <PredictionPanel prediction={prediction} samples={samples} />
          <CommandConsole
            logs={logs}
            onSendManual={sendManual}
            onClear={clearConsole}
            onCopySnippet={() => setShowSnippet(true)}
          />
        </div>
      </main>

      {showSnippet && (
        <SnippetModal
          vehicleId={vehicleId}
          onClose={() => setShowSnippet(false)}
          onCopied={() => log('Snippet copied!', 'ok')}
        />
      )}
    </>
  );
}
