import { useEffect, useRef } from 'react';
import Panel from '../ui/Panel';

export default function CommandConsole({ logs, onSendManual, onClear, onCopySnippet }) {
  const bodyRef   = useRef(null);
  const inputRef  = useRef(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logs]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const raw = inputRef.current?.value.trim();
    if (!raw) return;
    onSendManual(raw);
    inputRef.current.value = '';
  }

  return (
    <Panel className="panel-console">
      <div className="panel-head">
        <span className="panel-icon">⌨</span>
        <h2>COMMAND CONSOLE</h2>
        <div className="console-btns">
          <button className="btn btn-xs" id="btnSnippet" onClick={onCopySnippet}>📋 SNIPPET</button>
          <button className="btn btn-xs" id="btnClear"   onClick={onClear}>✕ CLEAR</button>
        </div>
      </div>
      <div className="console-body" id="consoleBody" ref={bodyRef}>
        {logs.map((entry, i) => (
          <div key={i} className={`c-line c-${entry.type}`}>{entry.msg}</div>
        ))}
      </div>
      <div className="console-input">
        <span className="prompt">❯</span>
        <textarea
          id="consoleInput"
          ref={inputRef}
          rows={1}
          placeholder="Paste JSON or type command..."
          onKeyDown={handleKeyDown}
        />
        <button className="btn btn-send" id="btnSend" onClick={handleSend}>SEND</button>
      </div>
    </Panel>
  );
}
