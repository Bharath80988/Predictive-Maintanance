import { useEffect, useRef } from 'react';
import { WINDOW_SIZE } from '../../utils/constants';
import Panel from '../ui/Panel';

/* ── Individual gauge sub-components ── */

function EngineCoilGauge({ value }) {
  const loopCount = Math.floor(((Math.min(value, 140) - 60) / 80) * 9);
  return (
    <div className="custom-g" id="gaugeEngineWrap">
      <div className="g-val-top c-orange"><span id="gValEngine">{value.toFixed(1)}</span></div>
      <div className="coil-container">
        <div className="coil-line" />
        <div className="coil-loops" id="engineCoil">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="loop" style={{ opacity: i < loopCount ? 1 : 0.2 }} />
          ))}
        </div>
        <div className="coil-end" />
      </div>
      <span className="g-name">ENGINE TEMP</span>
    </div>
  );
}

function VibrationGauge({ value }) {
  const svgRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const amp = Math.min(value * 15, 45);
    const freq = Math.min(value * 2, 5);

    function animate() {
      if (!svgRef.current) return;
      const t = Date.now() / 200;
      let d = 'M0,50';
      for (let x = 10; x <= 100; x += 10) {
        const y = 50 + Math.sin(x * freq + t) * amp;
        d += ` L${x},${y}`;
      }
      svgRef.current.setAttribute('d', d);
      animRef.current = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [value]);

  return (
    <div className="custom-g" id="gaugeVibWrap">
      <div className="g-val-top c-magenta"><span id="gValVib">{value.toFixed(2)}</span></div>
      <div className="sphere-container b-magenta">
        <svg className="wave-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path id="vibWave" ref={svgRef} className="wave-path" d="M0,50 Q10,50 20,50 T40,50 T60,50 T80,50 T100,50" />
        </svg>
        <div className="sphere-glare" />
      </div>
      <span className="g-name">VIBRATION</span>
    </div>
  );
}

function FuelGauge({ value }) {
  const pct = Math.min((value / 35) * 100, 100);
  return (
    <div className="custom-g" id="gaugeFuelWrap">
      <div className="g-val-top c-cyan"><span id="gValFuel">{value.toFixed(1)}</span></div>
      <div className="sphere-container b-cyan">
        <div className="liquid-bg">
          <div className="liquid-fill" style={{ height: pct + '%' }} />
        </div>
        <div className="sphere-glare" />
      </div>
      <span className="g-name">FUEL</span>
    </div>
  );
}

function LoadGauge({ value }) {
  const discCount = Math.floor((value / 20) * 5);
  return (
    <div className="custom-g" id="gaugeLoadWrap">
      <div className="g-val-top c-white"><span id="gValLoad">{value.toFixed(1)}</span></div>
      <div className="disc-stack" id="loadStack">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`disc${i < discCount ? ' active' : ''}`} />
        ))}
      </div>
      <span className="g-name">LOAD</span>
    </div>
  );
}

function TireGauge({ value }) {
  const psi = value.toFixed(1);
  return (
    <div className="custom-g Quad-wrap" id="gaugeTireWrap">
      <div className="g-val-top c-yellow"><span id="gValTire">{psi}</span></div>
      <div className="quad-container">
        <div className="quad-bg">
          <div className="q-circle tl"><span className="q-val">{psi}</span></div>
          <div className="q-circle tr"><span className="q-val">{psi}</span></div>
          <div className="q-center">PSI</div>
          <div className="q-circle bl"><span className="q-val">{psi}</span></div>
          <div className="q-circle br"><span className="q-val">{psi}</span></div>
        </div>
      </div>
      <span className="g-name">TIRE PSI</span>
    </div>
  );
}

/* ── Main Telemetry Panel ── */
export default function TelemetryGauges({ telemetry, samples }) {
  const progress = Math.min((samples / WINDOW_SIZE) * 100, 100);

  return (
    <Panel className="panel-gauges">
      <div className="panel-head">
        <span className="panel-icon">◎</span>
        <h2>LIVE TELEMETRY</h2>
        <div className="sample-counter">
          <span id="samplesCount">{Math.min(samples, WINDOW_SIZE)}</span>
          <span className="dim"> / </span>
          <span id="windowSize">{WINDOW_SIZE}</span>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: progress + '%' }} />
      </div>
      <div className="gauges-row">
        <EngineCoilGauge value={telemetry.engineTemperature} />
        <VibrationGauge  value={telemetry.vibrationLevels} />
        <FuelGauge       value={telemetry.fuelConsumption} />
        <LoadGauge       value={telemetry.actualLoad} />
        <TireGauge       value={telemetry.tirePressure} />
      </div>
    </Panel>
  );
}
