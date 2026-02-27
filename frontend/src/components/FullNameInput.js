import { useState } from "react";
import styles from "../styles";

const blockDigits = (e) => { if (/[0-9]/.test(e.key)) e.preventDefault(); };

// Splits "John Doe", "John, Doe", "John.Doe" etc into [firstName, lastName]
function splitName(val) {
  const parts = val.trim().split(/[\s,.:;]+/);
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "" };
}

export default function FullNameInput({ firstName, lastName, onChange }) {
  const [locked, setLocked] = useState(true);
  const [full, setFull] = useState(firstName || lastName ? `${firstName} ${lastName}`.trim() : "");

  const unlock = () => setLocked(false);

  const lock = () => {
    const { firstName: fn, lastName: ln } = splitName(full);
    onChange(fn, ln);
    setLocked(true);
  };

  const handleFull  = (e) => { const val = e.target.value.slice(0, 50); setFull(val); const { firstName: fn, lastName: ln } = splitName(val); onChange(fn, ln); };
  const handleFirst = (e) => onChange(e.target.value.slice(0, 50), lastName);
  const handleLast  = (e) => onChange(firstName, e.target.value.slice(0, 50));

  const charCount = (val) => val.length >= 40
    ? <span style={{ fontSize: 10, color: val.length >= 50 ? "#b91c1c" : "#999", marginLeft: 4 }}>{val.length}/50</span>
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {locked ? (
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: 1 }}>
            <input style={{ ...styles.input, width: "100%", boxSizing: "border-box" }} placeholder="Full Name" value={full || (firstName || lastName ? `${firstName} ${lastName}`.trim() : "")} onChange={handleFull} onKeyDown={blockDigits} maxLength={50} required />
            {charCount(full || `${firstName} ${lastName}`.trim())}
          </div>
          <button type="button" style={styles.iconBtn} onClick={unlock} title="Split into first & last name">✂️</button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ flex: 1 }}>
            <input style={{ ...styles.input, width: "100%", boxSizing: "border-box" }} placeholder="First Name" value={firstName} onChange={handleFirst} onKeyDown={blockDigits} maxLength={50} required />
            {charCount(firstName)}
          </div>
          <div style={{ flex: 1 }}>
            <input style={{ ...styles.input, width: "100%", boxSizing: "border-box" }} placeholder="Last Name" value={lastName} onChange={handleLast} onKeyDown={blockDigits} maxLength={50} required />
            {charCount(lastName)}
          </div>
          <button type="button" style={styles.iconBtn} onClick={lock} title="Combine into full name">🔗</button>
        </div>
      )}
    </div>
  );
}
