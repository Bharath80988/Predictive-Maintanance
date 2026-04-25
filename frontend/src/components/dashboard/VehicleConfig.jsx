import Panel from '../ui/Panel';

export default function VehicleConfig({ vehicleId, setVehicleId, vehicleType, setVehicleType,
  makeModel, setMakeModel, isMonitoring, onStart, onStop }) {
  return (
    <Panel className="panel-config">
      <div className="panel-head">
        <span className="panel-icon">◈</span>
        <h2>VEHICLE CONFIGURATION</h2>
      </div>
      <div className="config-body">
        <div className="field">
          <label>Vehicle ID</label>
          <input
            type="text"
            id="vehicleId"
            value={vehicleId}
            onChange={e => setVehicleId(e.target.value)}
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label>Vehicle Type</label>
            <select id="vehicleType" value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
              <option value="Truck">Truck</option>
              <option value="Bus">Bus</option>
              <option value="Car">Car</option>
              <option value="SUV">SUV</option>
            </select>
          </div>
          <div className="field">
            <label>Make &amp; Model</label>
            <select id="makeModel" value={makeModel} onChange={e => setMakeModel(e.target.value)}>
              <option value="AshokLeyland_1616">Ashok Leyland 1616</option>
              <option value="Tata_Prima">Tata Prima</option>
              <option value="BharatBenz_1617">BharatBenz 1617</option>
              <option value="Eicher_Pro">Eicher Pro</option>
            </select>
          </div>
        </div>
        <div className="btn-row">
          <button
            id="btnStart"
            className="btn btn-go"
            disabled={isMonitoring}
            onClick={onStart}
          >
            ▶ START MONITORING
          </button>
          <button
            id="btnStop"
            className="btn btn-stop"
            disabled={!isMonitoring}
            onClick={onStop}
          >
            ■ STOP
          </button>
        </div>
      </div>
    </Panel>
  );
}
