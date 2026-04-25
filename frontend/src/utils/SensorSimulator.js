/**
 * Realistic sensor simulator — mirrors the HTML frontend's SensorSimulator.
 * Produces gradual warm-up, oscillations and occasional spikes for all sensors.
 */
export class SensorSimulator {
  constructor() { this.reset(); }

  reset() {
    this.engine    = { val: 65, base: 65, target: 82, rate: 0.3 };
    this.vibration = { val: 0.15, base: 0.15 };
    this.fuel      = { val: 10, base: 10 };
    this.load      = { val: 8, base: 8 };
    this.tire      = { val: 35, base: 35 };
    this.tick      = 0;
  }

  next(vehicleId) {
    this.tick++;

    // ENGINE: warm-up then oscillate
    if (this.engine.val < this.engine.target) {
      this.engine.val += this.engine.rate + this.noise(0.3);
    } else {
      this.engine.val = this.engine.target + Math.sin(this.tick * 0.15) * 2 + this.noise(1.2);
    }
    if (Math.random() < 0.08) this.engine.val += this.noise(5);
    this.engine.val = this.clamp(this.engine.val, 65, 160);

    // VIBRATION: low baseline with occasional spikes
    this.vibration.val = this.vibration.base
      + Math.sin(this.tick * 0.2) * 0.08
      + this.noise(0.06);
    if (Math.random() < 0.05) this.vibration.val += 0.3 + Math.random() * 0.8;
    this.vibration.val = this.clamp(this.vibration.val, 0.05, 4.5);
    this.vibration.base += this.noise(0.005);
    this.vibration.base = this.clamp(this.vibration.base, 0.2, 0.6);

    // FUEL
    const fuelMod = (this.engine.val - 85) * 0.05;
    this.fuel.val = this.fuel.base + fuelMod + Math.sin(this.tick * 0.1) * 0.8 + this.noise(0.5);
    this.fuel.val = this.clamp(this.fuel.val, 6, 35);

    // LOAD
    this.load.val = this.load.base + Math.sin(this.tick * 0.05) * 0.2 + this.noise(0.1);
    this.load.val = this.clamp(this.load.val, 2, 28);

    // TIRE
    this.tire.val = this.tire.base
      + (this.engine.val - 85) * 0.02
      + this.noise(0.15);
    this.tire.val = this.clamp(this.tire.val, 26, 50);

    return {
      vehicleId,
      engineTemperature: +this.engine.val.toFixed(1),
      vibrationLevels:   +this.vibration.val.toFixed(2),
      fuelConsumption:   +this.fuel.val.toFixed(1),
      actualLoad:        +this.load.val.toFixed(1),
      tirePressure:      +this.tire.val.toFixed(1),
      timestamp:         Date.now(),
    };
  }

  noise(scale) { return (Math.random() - 0.5) * 2 * scale; }
  clamp(v, min, max) { return Math.min(Math.max(v, min), max); }
}
