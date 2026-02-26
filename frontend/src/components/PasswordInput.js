import { useState } from "react";
import styles from "../styles";

export default function PasswordInput({ value, confirm, onChange, onConfirmChange }) {
  const [locked, setLocked] = useState(false); // locked = confirm field shown
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const mismatch = locked && confirm !== undefined && value !== confirm && confirm !== "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          style={{ ...styles.input, flex: 1 }}
          placeholder="Password"
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required
        />
        <button type="button" style={styles.iconBtn} onClick={() => setShow(s => !s)} title={show ? "Hide" : "Show"}>
          {show ? "🙈" : "👁️"}
        </button>
        <button type="button" style={styles.iconBtn} onClick={() => setLocked(s => !s)} title={locked ? "Remove confirm" : "Add confirm field"}>
          {locked ? "🔓" : "🔒"}
        </button>
      </div>

      {locked && (
        <div style={{ display: "flex", gap: 6 }}>
          <input
            style={{ ...styles.input, flex: 1, borderColor: mismatch ? "#fca5a5" : undefined }}
            placeholder="Confirm Password"
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={onConfirmChange}
            required
          />
          <button type="button" style={styles.iconBtn} onClick={() => setShowConfirm(s => !s)} title={showConfirm ? "Hide" : "Show"}>
            {showConfirm ? "🙈" : "👁️"}
          </button>
        </div>
      )}
      {mismatch && <div style={{ fontSize: 12, color: "#b91c1c" }}>Passwords do not match</div>}
    </div>
  );
}
