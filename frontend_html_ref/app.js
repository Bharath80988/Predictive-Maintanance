/* ═══════════════════════════════════════════════
   PREDICTIVE MAINTENANCE — DASHBOARD v2
   Realistic telemetry + sci-fi UI
   ═══════════════════════════════════════════════ */

const API_URL = 'http://localhost:8081/api/vehicle/telemetry';
const WINDOW_SIZE = 30;

/* ═════════ REALISTIC SENSOR SIMULATOR ═════════
   Each sensor has a base value and drifts slowly
   with small perturbations, like real hardware. */
class SensorSimulator {
    constructor() {
        this.reset();
    }

    reset() {
        // Safe starting values that result in a LOW predictive score in the ML model
        // (temp < 90, vib < 0.4, tire ~ 35 => score ~ 0.25 => LOW RISK)
        this.engine = { val: 65, base: 65, target: 82, rate: 0.3 };     // °C
        this.vibration = { val: 0.15, base: 0.15 };                      // g
        this.fuel = { val: 10, base: 10 };                                // L/h
        this.load = { val: 8, base: 8 };                                  // tons (LoadCapacity=16, so ratio=0.5)
        this.tire = { val: 35, base: 35 };                                // PSI
        this.tick = 0;
    }

    next(vehicleId) {
        this.tick++;

        // ENGINE: gradually warms up, then oscillates near operating temp
        if (this.engine.val < this.engine.target) {
            this.engine.val += this.engine.rate + this.noise(0.3);
        } else {
            // Normal operating fluctuation ±2°C
            this.engine.val = this.engine.target + Math.sin(this.tick * 0.15) * 2 + this.noise(1.2);
        }
        // Occasional heat spikes (simulates traffic, hills)
        if (Math.random() < 0.08) this.engine.val += this.noise(5);
        this.engine.val = this.clamp(this.engine.val, 65, 160);

        // VIBRATION: mostly low with occasional spikes
        this.vibration.val = this.vibration.base
            + Math.sin(this.tick * 0.2) * 0.08
            + this.noise(0.06);
        // Road bump or rough patch (5% chance)
        if (Math.random() < 0.05) this.vibration.val += 0.3 + Math.random() * 0.8;
        this.vibration.val = this.clamp(this.vibration.val, 0.05, 4.5);
        // Slowly drift base vibration (wear simulation)
        this.vibration.base += this.noise(0.005);
        this.vibration.base = this.clamp(this.vibration.base, 0.2, 0.6);

        // FUEL: correlates loosely with engine temp
        const fuelModifier = (this.engine.val - 85) * 0.05;
        this.fuel.val = this.fuel.base + fuelModifier + Math.sin(this.tick * 0.1) * 0.8 + this.noise(0.5);
        this.fuel.val = this.clamp(this.fuel.val, 6, 35);

        // LOAD: very stable — only tiny fluctuations (cargo shifting)
        this.load.val = this.load.base + Math.sin(this.tick * 0.05) * 0.2 + this.noise(0.1);
        this.load.val = this.clamp(this.load.val, 2, 28);

        // TIRE PRESSURE: very slow drift (temperature-related), very stable
        this.tire.val = this.tire.base
            + (this.engine.val - 85) * 0.02   // warmer engine → slightly higher tire pressure
            + this.noise(0.15);
        this.tire.val = this.clamp(this.tire.val, 26, 50);

        return {
            vehicleId: vehicleId,
            engineTemperature: +this.engine.val.toFixed(1),
            vibrationLevels:   +this.vibration.val.toFixed(2),
            fuelConsumption:   +this.fuel.val.toFixed(1),
            actualLoad:        +this.load.val.toFixed(1),
            tirePressure:      +this.tire.val.toFixed(1),
            timestamp:         Date.now()
        };
    }

    noise(scale) { return (Math.random() - 0.5) * 2 * scale; }
    clamp(v, min, max) { return Math.min(Math.max(v, min), max); }
}

/* ═════════ BACKGROUND PARTICLES ═════════ */
function initParticles() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const particles = [];

    function resize() {
        w = canvas.width  = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create 50 floating particles
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.5 + 0.3,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.2,
            alpha: Math.random() * 0.4 + 0.1,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);

        // Ambient gradient
        const grad = ctx.createRadialGradient(w * 0.3, h * 0.5, 0, w * 0.3, h * 0.5, w * 0.6);
        grad.addColorStop(0, 'rgba(0,180,255,0.02)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const grad2 = ctx.createRadialGradient(w * 0.8, h * 0.2, 0, w * 0.8, h * 0.2, w * 0.4);
        grad2.addColorStop(0, 'rgba(255,45,149,0.015)');
        grad2.addColorStop(1, 'transparent');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, w, h);

        // Draw particles
        for (const p of particles) {
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,200,255,${p.alpha})`;
            ctx.fill();
        }

        requestAnimationFrame(draw);
    }
    draw();
}

/* ═════════ GAUGE CONFIG ═════════ */
const GAUGE_CFG = {
    engine:    { id:'gaugeEngine',    max:200, warnAt:120, dangerAt:150, dec:1 },
    vibration: { id:'gaugeVibration', max:5,   warnAt:1.5, dangerAt:3,   dec:2 },
    fuel:      { id:'gaugeFuel',      max:50,  warnAt:25,  dangerAt:38,  dec:1 },
    load:      { id:'gaugeLoad',      max:30,  warnAt:20,  dangerAt:26,  dec:1 },
    tire:      { id:'gaugeTire',      max:60,  warnAt:42,  dangerAt:52,  dec:1 },
};

/* ═════════ APP ═════════ */
const app = {
    monitoring: false,
    interval: null,
    samples: 0,
    sim: new SensorSimulator(),

    init() {
        document.getElementById('windowSize').textContent = WINDOW_SIZE;
        document.getElementById('remainingCount').textContent = WINDOW_SIZE;

        document.getElementById('consoleInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendManual(); }
        });

        initParticles();

        // Auto-start
        this.startMonitoring();
    },

    /* ── Start / Stop ── */
    startMonitoring() {
        const vid = document.getElementById('vehicleId').value.trim();
        if (!vid) { this.log('Vehicle ID required!', 'err'); return; }

        this.monitoring = true;
        this.samples = 0;
        this.sim.reset();

        document.getElementById('navVehicleId').textContent = vid;
        document.getElementById('btnStart').disabled = true;
        document.getElementById('btnStop').disabled = false;

        const sc = document.getElementById('statusChip');
        sc.classList.add('online');
        document.getElementById('statusText').textContent = 'ONLINE';

        document.getElementById('predPlaceholder').style.display = '';
        document.getElementById('predResults').style.display = 'none';
        document.getElementById('remainingCount').textContent = WINDOW_SIZE;
        this.updateProgress(0);

        this.log(`Monitoring started for [${vid}]`, 'sys');

        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => {
            if (!this.monitoring) return;
            const data = this.sim.next(vid);
            this.sendTelemetry(data);
        }, 1500);

        this.log('Auto-sending realistic telemetry (1.5s interval)', 'info');
    },

    stopMonitoring() {
        this.monitoring = false;
        if (this.interval) { clearInterval(this.interval); this.interval = null; }

        document.getElementById('btnStart').disabled = false;
        document.getElementById('btnStop').disabled = true;
        document.getElementById('statusChip').classList.remove('online');
        document.getElementById('statusText').textContent = 'OFFLINE';
        this.log('Monitoring stopped.', 'warn');
    },

    /* ── Send ── */
    async sendTelemetry(data) {
        this.log(`→ temp=${data.engineTemperature} vib=${data.vibrationLevels} fuel=${data.fuelConsumption} load=${data.actualLoad} tire=${data.tirePressure}`, 'send');
        this.updateGauges(data);

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const body = await res.json();

            if (res.status === 202) {
                this.samples++;
                this.updateProgress(this.samples);
                document.getElementById('remainingCount').textContent = Math.max(WINDOW_SIZE - this.samples, 0);
                this.log(`✓ Buffered (${this.samples}/${WINDOW_SIZE})`, 'ok');

            } else if (res.status === 200) {
                this.samples = 0;
                this.updateProgress(WINDOW_SIZE);
                this.log('★ PREDICTION RECEIVED!', 'sys');
                this.showPrediction(body);
                setTimeout(() => {
                    this.updateProgress(0);
                    this.samples = 0;
                    document.getElementById('remainingCount').textContent = WINDOW_SIZE;
                }, 2000);

            } else {
                this.log(`⚠ Status ${res.status}: ${JSON.stringify(body)}`, 'warn');
            }
        } catch (err) {
            this.log(`✕ ${err.message}`, 'err');
            this.log('Is backend running on localhost:8081?', 'err');
        }
    },

    sendManual() {
        const raw = document.getElementById('consoleInput').value.trim();
        if (!raw) return;
        try {
            const data = JSON.parse(raw);
            document.getElementById('consoleInput').value = '';
            this.sendTelemetry(data);
        } catch (e) { this.log('✕ Invalid JSON: ' + e.message, 'err'); }
    },

    /* ── Gauge rendering ── */
    updateGauges(data) {
        // 1. Engine Temp (Heating Coil)
        const eTemp = Math.min(data.engineTemperature, 140);
        document.getElementById('gValEngine').textContent = eTemp.toFixed(1);
        const loopCount = Math.floor(((eTemp - 60) / 80) * 9); 
        const loops = document.getElementById('engineCoil').querySelectorAll('.loop');
        loops.forEach((l, i) => {
            if (i < loopCount) l.style.opacity = '1';
            else l.style.opacity = '0.2';
        });

        // 2. Vibration (Waveform)
        const vib = data.vibrationLevels;
        document.getElementById('gValVib').textContent = vib.toFixed(2);
        // Animate wave amplitude and frequency based on vibration
        const amp = Math.min(vib * 15, 45); // Max amplitude 45
        const freq = Math.min(vib * 2, 5);
        const t = Date.now() / 200;
        let d = `M0,50`;
        for(let x=10; x<=100; x+=10) {
            const y = 50 + Math.sin(x*freq + t) * amp;
            d += ` L${x},${y}`;
        }
        document.getElementById('vibWave').setAttribute('d', d);

        // 3. Fuel (Liquid Sphere)
        const fuel = data.fuelConsumption;
        document.getElementById('gValFuel').textContent = fuel.toFixed(1);
        const fuelPct = Math.min((fuel / 35) * 100, 100);
        document.getElementById('fuelLiquid').style.height = fuelPct + '%';

        // 4. Load (Stacked Discs)
        const load = data.actualLoad;
        document.getElementById('gValLoad').textContent = load.toFixed(1);
        const discCount = Math.floor((load / 20) * 5); // 5 discs max
        const discs = document.getElementById('loadStack').querySelectorAll('.disc');
        discs.forEach((d, i) => {
            if (i < discCount) d.classList.add('active');
            else d.classList.remove('active');
        });

        // 5. Tire PSI (Quad Container)
        const tire = data.tirePressure.toFixed(1);
        document.getElementById('gValTire').textContent = tire;
        const qVals = document.querySelectorAll('.q-val');
        qVals.forEach(q => q.textContent = tire);
    },

    updateProgress(n) {
        const pct = Math.min((n / WINDOW_SIZE) * 100, 100);
        document.getElementById('progressFill').style.width = pct + '%';
        document.getElementById('samplesCount').textContent = Math.min(n, WINDOW_SIZE);
    },

    /* ── Prediction ── */
    showPrediction(result) {
        document.getElementById('predPlaceholder').style.display = 'none';
        document.getElementById('predResults').style.display = '';

        const banner = document.getElementById('riskBanner');
        const risk = result.prediction?.risk_level || 'UNKNOWN';
        const rl = risk.toLowerCase();
        document.getElementById('riskLevel').textContent = risk.toUpperCase();

        banner.className = 'risk-banner';
        if (rl.includes('low'))       banner.classList.add('low');
        else if (rl.includes('med'))  banner.classList.add('medium');
        else if (rl.includes('high')) banner.classList.add('high');
        else if (rl.includes('crit')) banner.classList.add('critical');

        const prob = (result.prediction?.probability ?? 0) * 100;
        document.getElementById('probBar').style.width = prob + '%';
        document.getElementById('probValue').textContent = prob.toFixed(1) + '%';

        const hrs = result.prediction?.estimated_hours_to_failure;
        document.getElementById('hoursToFailure').textContent = hrs != null ? hrs.toFixed(0) + ' hrs' : 'N/A';

        const conf = (result.prediction?.model_confidence ?? 0) * 100;
        document.getElementById('confidenceBar').style.width = conf + '%';
        document.getElementById('confidenceValue').textContent = conf.toFixed(1) + '%';

        const warnings = result.warnings || [];
        const wb = document.getElementById('warningsBox');
        const wl = document.getElementById('warningsList');
        wl.innerHTML = '';
        if (warnings.length) {
            wb.style.display = '';
            warnings.forEach(w => { const li = document.createElement('li'); li.textContent = w; wl.appendChild(li); });
            warnings.forEach(w => this.log(`⚡ ${w}`, 'warn'));
        } else { wb.style.display = 'none'; }

        // === Contributing Factors ===
        const ws = result.window_statistics;
        const fb = document.getElementById('factorsBox');
        if (ws) {
            fb.style.display = '';
            // The backend ML model computes score based on Temp (max 200), Vib (max 2), Tire (<30 is bad)
            // and Load Ratio (ActualLoad / LoadCapacity=16)
            
            const tempImpact = Math.min((ws.avg_engine_temperature / 130) * 100, 100);
            const vibImpact  = Math.min((ws.avg_vibration_levels / 1.0) * 100, 100);
            const tireImpact = ws.avg_tire_pressure < 30 ? 90 : 20;
            const loadImpact = Math.min((ws.avg_load / 16) * 100, 100); // 16 is default LoadCapacity

            const getImpactClass = (val) => {
                if (val >= 85) return 'f-impact-crit';
                if (val >= 60) return 'f-impact-high';
                if (val >= 40) return 'f-impact-med';
                return 'f-impact-low';
            };

            const factors = [
                { name: 'Engine Heat', val: tempImpact, cls: getImpactClass(tempImpact) },
                { name: 'Vibration', val: vibImpact, cls: getImpactClass(vibImpact) },
                { name: 'Tire Condition', val: tireImpact, cls: getImpactClass(tireImpact) },
                { name: 'Cargo Stress', val: loadImpact, cls: getImpactClass(loadImpact) }
            ];
            
            // Sort by highest impact first
            factors.sort((a,b) => b.val - a.val);

            // Determine primary driver
            const desc = document.getElementById('factorsDesc');
            if (prob < 30) desc.textContent = "All systems operating within normal parameters.";
            else desc.textContent = `High risk primarily driven by excessive ${factors[0].name.toLowerCase()}.`;

            const fl = document.getElementById('factorsList');
            fl.innerHTML = '';
            factors.forEach(f => {
                const row = document.createElement('div');
                row.className = 'f-row';
                row.innerHTML = `
                    <span class="f-name">${f.name}</span>
                    <div class="f-bar-track"><div class="f-bar-fill ${f.cls}"></div></div>
                    <span class="f-val">${f.val.toFixed(0)}%</span>
                `;
                fl.appendChild(row);
            });
        } else {
            fb.style.display = 'none';
        }

        // === Window Stats ===
        if (ws) {
            document.getElementById('statTemp').textContent = ws.avg_engine_temperature?.toFixed(1) + '°C';
            document.getElementById('statVib').textContent  = ws.avg_vibration_levels?.toFixed(2) + ' g';
            document.getElementById('statFuel').textContent = ws.avg_fuel_consumption?.toFixed(1) + ' L/h';
            document.getElementById('statLoad').textContent = ws.avg_load?.toFixed(1) + ' t';
            document.getElementById('statTire').textContent = ws.avg_tire_pressure?.toFixed(1) + ' PSI';
        }

        this.log(`Risk: ${risk} | Prob: ${prob.toFixed(1)}% | Conf: ${conf.toFixed(1)}%`, 'sys');
    },

    /* ── Console ── */
    log(msg, type = 'info') {
        const body = document.getElementById('consoleBody');
        const line = document.createElement('div');
        line.className = `c-line c-${type}`;
        const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
        line.textContent = `[${ts}] ${msg}`;
        body.appendChild(line);
        body.scrollTop = body.scrollHeight;
    },

    clearConsole() {
        document.getElementById('consoleBody').innerHTML = '<div class="c-line c-sys">▸ Console cleared.</div>';
    },

    /* ── Snippet modal ── */
    copySnippet() {
        const vid = document.getElementById('vehicleId').value.trim() || 'VH-001';
        const snippet = `// Realistic auto-send telemetry
(async function() {
    const API = '${API_URL}';
    const VID = '${vid}';
    let eng = 72, vib = 0.25, fuel = 14, load = 12, tire = 34;

    for (let i = 0; i < ${WINDOW_SIZE}; i++) {
        // Gradual warm-up + drift
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

        document.getElementById('snippetCode').textContent = snippet;
        document.getElementById('snippetModal').style.display = '';
    },

    closeModal() { document.getElementById('snippetModal').style.display = 'none'; },

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(document.getElementById('snippetCode').textContent);
            this.log('Snippet copied!', 'ok');
            this.closeModal();
        } catch { this.log('Copy failed — select and copy manually.', 'warn'); }
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
