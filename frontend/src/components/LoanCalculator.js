import { useState } from "react";
import { API, getToken } from "../api";

const RATE = 0.05; // 5% monthly interest

function calcInstalment(amount, months) {
  const r = RATE;
  return (amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

const s = {
  section: { marginBottom: 20 },
  label: { fontSize: 12, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  value: { fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 8 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 },
  adjBtn: { width: 32, height: 32, borderRadius: "50%", border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" },
  slider: { flex: 1, accentColor: "#1a56db" },
  summary: { background: "#f0f5ff", borderRadius: 8, padding: "14px 16px", marginBottom: 16 },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4, color: "#333" },
  dateInput: { width: "100%", padding: "10px 14px", fontSize: 14, border: "1px solid #ddd", borderRadius: 6, marginTop: 8, boxSizing: "border-box" },
  success: { padding: "10px 14px", background: "#f0fff4", border: "1px solid #86efac", borderRadius: 6, color: "#15803d", fontSize: 13, marginBottom: 8 },
  error: { padding: "10px 14px", background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 6, color: "#b91c1c", fontSize: 13, marginBottom: 8 },
  btn: { width: "100%", padding: 12, background: "#1a56db", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15, fontWeight: 600 },
  btnDisabled: { width: "100%", padding: 12, background: "#93b4f0", color: "#fff", border: "none", borderRadius: 6, cursor: "not-allowed", fontSize: 15, fontWeight: 600 },
};

export default function LoanCalculator({ onApplied, isFirstLoan }) {
  const [amount, setAmount] = useState(5000);
  const [months, setMonths] = useState(12);
  const [date, setDate] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const instalment = calcInstalment(amount, months);
  const total = instalment * months;
  const fees = total - amount;

  const adj = (setter, val, min, max) => setter(v => Math.min(max, Math.max(min, v + val)));

  const apply = async () => {
    if (!date) return setMsg({ type: "error", text: "Please select a repayment date." });
    setLoading(true); setMsg(null);
    try {
      const res = await fetch(`${API}/loans`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ amount, period: months, instalment: +instalment.toFixed(2), repaymentDate: date }),
      });
      if (res.ok) {
        const data = await res.json();
        setMsg({ type: "success", text: "Loan approved!" });
        onApplied?.(data.leveledUp);
      } else setMsg({ type: "error", text: "Application failed." });
    } catch { setMsg({ type: "error", text: "Could not connect." }); }
    setLoading(false);
  };

  return (
    <div>
      {/* Amount */}
      <div style={s.section}>
        <div style={s.label}>Loan Amount</div>
        <div style={s.row}>
          <button style={s.adjBtn} onClick={() => adj(setAmount, -500, 500, 50000)}>−</button>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={s.value}>R {amount.toLocaleString()}</div>
            <input type="range" min={500} max={50000} step={500} value={amount} onChange={e => setAmount(+e.target.value)} style={s.slider} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa" }}><span>R 500</span><span>R 50 000</span></div>
          </div>
          <button style={s.adjBtn} onClick={() => adj(setAmount, 500, 500, 50000)}>+</button>
        </div>
      </div>

      {/* Period */}
      <div style={s.section}>
        <div style={s.label}>Loan Period</div>
        <div style={s.row}>
          <button style={s.adjBtn} onClick={() => adj(setMonths, -1, 1, 60)}>−</button>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={s.value}>{months} months</div>
            <input type="range" min={1} max={60} step={1} value={months} onChange={e => setMonths(+e.target.value)} style={s.slider} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa" }}><span>1 mo</span><span>60 mo</span></div>
          </div>
          <button style={s.adjBtn} onClick={() => adj(setMonths, 1, 1, 60)}>+</button>
        </div>
      </div>

      {/* Summary */}
      <div style={s.summary}>
        <div style={s.summaryRow}><span>Monthly Instalment</span><strong>R {instalment.toFixed(2)}</strong></div>
        <div style={s.summaryRow}><span>Total Repayment</span><strong>R {total.toFixed(2)}</strong></div>
        <div style={s.summaryRow}><span>Interest & Fees</span><strong>R {fees.toFixed(2)}</strong></div>
        <div style={s.summaryRow}><span>Instalments</span><strong>{months}x</strong></div>
      </div>

      {/* Repayment Date */}
      <div style={s.label}>Repayment Date</div>
      <input type="date" style={s.dateInput} value={date} min={new Date().toISOString().split("T")[0]} onChange={e => setDate(e.target.value)} />

      {msg && <div style={{ ...s[msg.type], marginTop: 12 }}>{msg.text}</div>}
      <button style={{ ...(loading ? s.btnDisabled : s.btn), marginTop: 12 }} onClick={apply} disabled={loading}>
        {loading ? "Applying..." : "Apply for Loan"}
      </button>
    </div>
  );
}
