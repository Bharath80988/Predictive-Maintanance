import { WINDOW_SIZE } from '../../utils/constants';
import Panel from '../ui/Panel';

function getRiskClass(risk) {
  const r = (risk || '').toLowerCase();
  if (r.includes('low'))  return 'low';
  if (r.includes('med'))  return 'medium';
  if (r.includes('high')) return 'high';
  if (r.includes('crit')) return 'critical';
  return '';
}

function getImpactClass(val) {
  if (val >= 85) return 'f-impact-crit';
  if (val >= 60) return 'f-impact-high';
  if (val >= 40) return 'f-impact-med';
  return 'f-impact-low';
}

/* ── Placeholder crystal ── */
function Placeholder({ remaining }) {
  return (
    <div className="pred-placeholder" id="predPlaceholder">
      <div className="crystal">
        <div className="crystal-shape" />
      </div>
      <p>Awaiting full telemetry window...</p>
      <p className="sub">
        Send <span id="remainingCount">{remaining}</span> readings to trigger ML analysis
      </p>
    </div>
  );
}

/* ── Results ── */
function Results({ result }) {
  const pred   = result.prediction || {};
  const ws     = result.window_statistics;
  const risk   = (pred.risk_level || 'UNKNOWN').toUpperCase();
  const rClass = getRiskClass(pred.risk_level);
  const prob   = (pred.probability ?? 0) * 100;
  const hrs    = pred.estimated_hours_to_failure;
  const conf   = (pred.model_confidence ?? 0) * 100;
  const warnings = result.warnings || [];

  // Contributing factors
  let factors = [];
  if (ws) {
    const tempImpact = Math.min((ws.avg_engine_temperature / 130) * 100, 100);
    const vibImpact  = Math.min((ws.avg_vibration_levels  / 1.0)  * 100, 100);
    const tireImpact = ws.avg_tire_pressure < 30 ? 90 : 20;
    const loadImpact = Math.min((ws.avg_load / 16) * 100, 100);
    factors = [
      { name: 'Engine Heat',    val: tempImpact, cls: getImpactClass(tempImpact) },
      { name: 'Vibration',      val: vibImpact,  cls: getImpactClass(vibImpact) },
      { name: 'Tire Condition', val: tireImpact, cls: getImpactClass(tireImpact) },
      { name: 'Cargo Stress',   val: loadImpact, cls: getImpactClass(loadImpact) },
    ].sort((a, b) => b.val - a.val);
  }

  const factorDesc = prob < 30
    ? 'All systems operating within normal parameters.'
    : `High risk primarily driven by excessive ${factors[0]?.name.toLowerCase()}.`;

  return (
    <div className="pred-results" id="predResults">
      {/* Risk Banner */}
      <div className={`risk-banner${rClass ? ' ' + rClass : ''}`} id="riskBanner">
        <span className="risk-label">RISK LEVEL</span>
        <span className="risk-val" id="riskLevel">{risk}</span>
      </div>

      {/* Metrics */}
      <div className="metrics-col">
        <div className="m-row">
          <span className="m-label">Failure Probability</span>
          <div className="m-bar-track">
            <div className="m-bar-fill prob-fill" id="probBar" style={{ width: prob + '%' }} />
          </div>
          <span className="m-val" id="probValue">{prob.toFixed(1)}%</span>
        </div>
        <div className="m-row m-highlight">
          <span className="m-label">Hours to Failure</span>
          <span className="m-val-big" id="hoursToFailure">
            {hrs != null ? hrs.toFixed(0) + ' hrs' : 'N/A'}
          </span>
        </div>
        <div className="m-row">
          <span className="m-label">Model Confidence</span>
          <div className="m-bar-track">
            <div className="m-bar-fill conf-fill" id="confidenceBar" style={{ width: conf + '%' }} />
          </div>
          <span className="m-val" id="confidenceValue">{conf.toFixed(1)}%</span>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="warnings-box" id="warningsBox">
          <h3>⚡ WARNINGS</h3>
          <ul id="warningsList">
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Contributing Factors */}
      {ws && (
        <div className="factors-box" id="factorsBox">
          <h3>🔍 CONTRIBUTING FACTORS</h3>
          <p className="factors-desc" id="factorsDesc">{factorDesc}</p>
          <div className="factors-list" id="factorsList">
            {factors.map(f => (
              <div key={f.name} className="f-row">
                <span className="f-name">{f.name}</span>
                <div className="f-bar-track">
                  <div className={`f-bar-fill ${f.cls}`} style={{ width: f.val.toFixed(0) + '%' }} />
                </div>
                <span className="f-val">{f.val.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Window Stats */}
      {ws && (
        <div className="winstats">
          <h3>📊 WINDOW STATISTICS</h3>
          <div className="winstats-grid">
            <div className="ws"><span className="ws-l">Avg Temp</span><span className="ws-v" id="statTemp">{ws.avg_engine_temperature?.toFixed(1)}°C</span></div>
            <div className="ws"><span className="ws-l">Avg Vib</span><span className="ws-v" id="statVib">{ws.avg_vibration_levels?.toFixed(2)} g</span></div>
            <div className="ws"><span className="ws-l">Avg Fuel</span><span className="ws-v" id="statFuel">{ws.avg_fuel_consumption?.toFixed(1)} L/h</span></div>
            <div className="ws"><span className="ws-l">Avg Load</span><span className="ws-v" id="statLoad">{ws.avg_load?.toFixed(1)} t</span></div>
            <div className="ws"><span className="ws-l">Avg Tire</span><span className="ws-v" id="statTire">{ws.avg_tire_pressure?.toFixed(1)} PSI</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PredictionPanel({ prediction, samples }) {
  const remaining = Math.max(WINDOW_SIZE - samples, 0);
  const hasPrediction = prediction !== null;

  return (
    <Panel className="panel-prediction">
      <div className="panel-head">
        <span className="panel-icon warn-icon">⚠</span>
        <h2>PREDICTION ANALYSIS</h2>
      </div>
      {hasPrediction ? <Results result={prediction} /> : <Placeholder remaining={remaining} />}
    </Panel>
  );
}
