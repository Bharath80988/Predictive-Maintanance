import { API_URL, WINDOW_SIZE } from '../../utils/constants';

export default function SnippetModal({ vehicleId, onClose, onCopied }) {
  const vid = vehicleId || 'VH-001';

  const snippet = `// Realistic auto-send telemetry
(async function() {
    const API = '${API_URL}';
    const VID = '${vid}';
    let eng = 72, vib = 0.25, fuel = 14, load = 12, tire = 34;

    for (let i = 0; i < ${WINDOW_SIZE}; i++) {
        eng = Math.min(eng + 0.4 + (Math.random()-0.5)*1.2, 140);
        vib = Math.max(0.05, vib + (Math.random()-0.5)*0.12);
        fuel = Math.max(6, 14 + (eng-85)*0.05 + (Math.random()-0.5)*1);
        load = Math.max(2, 12 + (Math.random()-0.5)*0.2);
        tire = Math.max(26, 34 + (eng-85)*0.02 + (Math.random()-0.5)*0.3);

        const data = {
            vehicleId: VID,
            engineTemperature: +eng.toFixed(1),
            vibrationLevels: +vib.toFixed(2),
            fuelConsumption: +fuel.toFixed(1),
            actualLoad: +load.toFixed(1),
            tirePressure: +tire.toFixed(1),
            timestamp: Date.now()
        };

        const res = await fetch(API, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(data)
        });
        console.log('[' + (i+1) + '/${WINDOW_SIZE}]', res.status, await res.json());
        await new Promise(r => setTimeout(r, 300));
    }
    console.log('Done!');
})();`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      onCopied();
      onClose();
    } catch {
      alert('Copy failed — select and copy manually.');
    }
  }

  return (
    <div className="modal-bg" id="snippetModal" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div className="panel-corner tl" />
        <div className="panel-corner tr" />
        <div className="panel-corner bl" />
        <div className="panel-corner br" />
        <div className="modal-head">
          <h2>📋 Console Auto-Send Snippet</h2>
          <button className="btn btn-xs" id="btnCloseModal" onClick={onClose}>✕</button>
        </div>
        <p className="modal-desc">
          Copy this code and paste it into your <strong>browser DevTools console</strong> (F12 → Console).
        </p>
        <pre className="snippet-pre" id="snippetCode">{snippet}</pre>
        <button className="btn btn-go" id="btnCopyClipboard" onClick={handleCopy}>
          📋 COPY TO CLIPBOARD
        </button>
      </div>
    </div>
  );
}
