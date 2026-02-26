import { useState } from "react";
import styles from "../styles";

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

  const handleFull = (e) => {
    setFull(e.target.value);
    const { firstName: fn, lastName: ln } = splitName(e.target.value);
    onChange(fn, ln);
  };

  const handleFirst = (e) => onChange(e.target.value, lastName);
  const handleLast = (e) => onChange(firstName, e.target.value);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {locked ? (
        <div style={{ display: "flex", gap: 6 }}>
          <input style={{ ...styles.input, flex: 1 }} placeholder="Full Name" value={full || (firstName || lastName ? `${firstName} ${lastName}`.trim() : "")} onChange={handleFull} required />
          <button type="button" style={styles.iconBtn} onClick={unlock} title="Split into first & last name">✂️</button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 6 }}>
            <input style={{ ...styles.input, flex: 1 }} placeholder="First Name" value={firstName} onChange={handleFirst} required />
            <input style={{ ...styles.input, flex: 1 }} placeholder="Last Name" value={lastName} onChange={handleLast} required />
            <button type="button" style={styles.iconBtn} onClick={lock} title="Combine into full name">🔗</button>
          </div>
        </>
      )}
    </div>
  );
}
