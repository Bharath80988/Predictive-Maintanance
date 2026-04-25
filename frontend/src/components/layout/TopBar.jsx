export default function TopBar({ vehicleId, isOnline, theme, onToggleTheme }) {
  return (
    <header className="top-bar">
      <div className="top-left">
        <div className="hex-icon">⬡</div>
        <span className="sys-label">PM-SYSTEM v2.0</span>
      </div>

      <div className="top-center">
        <h1 className="main-title">PREDICTIVE MAINTENANCE</h1>
        <div className="title-underline" />
      </div>

      <div className="top-right">
        <div className="info-chip">
          <span className="chip-label">VEHICLE</span>
          <span className="chip-value">{vehicleId || 'VH-001'}</span>
        </div>
        <div className={`status-chip${isOnline ? ' online' : ''}`}>
          <span className="status-dot" />
          <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
        <button
          className="theme-toggle"
          id="themeToggleBtn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? '☀' : '🌙'}
        </button>
      </div>
    </header>
  );
}
