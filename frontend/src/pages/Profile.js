import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API, getToken, clearToken } from "../api";
import styles from "../styles";
import Layout from "../components/Layout";
import LoanCalculator from "../components/LoanCalculator";
import Confetti from "../components/Confetti";

const TABS = ["Profile", "Apply", "My Loans"];

export default function Me() {
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [tab, setTab] = useState(0);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const prevLevel = useRef(null);
  const nav = useNavigate();

  const popConfetti = () => { setConfetti(true); setTimeout(() => setConfetti(false), 3000); };

  const fetchUser = useCallback(() =>
    fetch(`${API}/profile`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(u => {
        // Only fire confetti on level up (not on initial load)
        if (prevLevel.current !== null && u.level > prevLevel.current) popConfetti();
        prevLevel.current = u.level;
        setUser(u); setForm(u);
      })
      .catch(() => { clearToken(); nav("/login"); }), [nav]);

  const fetchLoans = useCallback(() =>
    fetch(`${API}/loans`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(setLoans).catch(() => {}), []);

  useEffect(() => { fetchUser(); fetchLoans(); }, [fetchUser, fetchLoans]);

  const save = async () => {
    setLoading(true); setMsg(null);
    const res = await fetch(`${API}/profile`, {
      method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, phone: form.phone || null, idNumber: form.idNumber || null }),
    }).catch(() => null);
    if (res?.ok) { setUser(await res.json()); setEdit(false); setMsg({ type: "success", text: "Saved!" }); }
    else setMsg({ type: "error", text: "Failed to save." });
    setLoading(false);
  };

  const repay = async (loanId, type) => {
    const res = await fetch(`${API}/loans/${loanId}/repay`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ type }),
    });
    if (res.ok) { fetchUser(); fetchLoans(); }
  };

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const progress = user ? Math.min(100, (user.onTimeCount / user.nextLevelTarget) * 100) : 0;

  return (
    <Layout page="me">
      <Confetti active={confetti} />
      {/* Level badge + name */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{user?.firstName} {user?.lastName}</div>
          <div style={{ fontSize: 12, color: "#888" }}>{user?.email}</div>
        </div>
        <span style={{ fontSize: 11, background: "#e0edff", color: "#1a56db", padding: "4px 12px", borderRadius: 20, fontWeight: 700 }}>
          Level {user?.level ?? 1}
        </span>
      </div>

      {/* Level progress bar */}
      {user && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>
            Progress to Level {(user.level ?? 1) + 1} — {user.onTimeCount}/{user.nextLevelTarget} on-time payments
            {user.missedCount > 0 && <span style={{ color: "#e53e3e", marginLeft: 6 }}>({user.missedCount} missed)</span>}
          </div>
          <div style={{ background: "#eee", borderRadius: 4, height: 6 }}>
            <div style={{ width: `${progress}%`, background: "#1a56db", height: 6, borderRadius: 4, transition: "width 0.4s" }} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #eee", marginBottom: 20, gap: 4 }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => { setTab(i); setMsg(null); }} style={{
            padding: "8px 14px", border: "none", background: "none", cursor: "pointer",
            fontSize: 13, fontWeight: tab === i ? 700 : 400,
            color: tab === i ? "#1a56db" : "#888",
            borderBottom: tab === i ? "2px solid #1a56db" : "2px solid transparent",
          }}>{t}</button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 0 && <>
        {!edit ? <>
          {[["First Name", user?.firstName], ["Last Name", user?.lastName], ["Phone", user?.phone], ["ID Number", user?.idNumber]].map(([label, val]) => (
            <div key={label} style={styles.field}><div style={styles.label}>{label}</div>{val || <span style={{ color: "#bbb" }}>Not set</span>}</div>
          ))}
          {msg && <div style={styles[msg.type]}>{msg.text}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button style={styles.btn} onClick={() => { setEdit(true); setMsg(null); }}>Edit</button>
            <button style={styles.btnLogout} onClick={() => { clearToken(); nav("/login"); }}>Logout</button>
          </div>
        </> : <>
          {["firstName", "lastName", "phone", "idNumber"].map((f, i) => (
            <input key={f} style={{ ...styles.input, marginTop: i > 0 ? 8 : 0 }}
              placeholder={["First Name", "Last Name", "Phone (optional)", "ID Number (optional)"][i]}
              value={form[f] || ""} onChange={set(f)} />
          ))}
          {msg && <div style={{ ...styles[msg.type], marginTop: 8 }}>{msg.text}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button style={loading ? styles.btnDisabled : styles.btn} onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
            <button style={styles.btnBack} onClick={() => { setEdit(false); setForm(user); setMsg(null); }}>Cancel</button>
          </div>
        </>}
      </>}

      {/* Apply Tab */}
      {tab === 1 && <LoanCalculator isFirstLoan={loans.length === 0} onApplied={(leveledUp) => { fetchUser(); fetchLoans(); setTab(2); if (leveledUp) popConfetti(); }} />}

      {/* My Loans Tab */}
      {tab === 2 && <>
        {loans.length === 0 && <p style={{ color: "#888", fontSize: 14 }}>No loans yet.</p>}
        {loans.map(loan => (
          <div key={loan.id} style={{ ...styles.field, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <strong>R {loan.amount.toLocaleString()}</strong>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 600,
                background: loan.status === "repaid" ? "#f0fff4" : "#fff7ed",
                color: loan.status === "repaid" ? "#15803d" : "#c05621" }}>
                {loan.status}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>{loan.period} months · R {loan.instalment}/mo · Due {loan.repaymentDate}</div>
            {loan.status === "active" && (
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button style={{ ...styles.btn, flex: 1, padding: 8, fontSize: 12 }} onClick={() => repay(loan.id, "early")}>Repay Early</button>
                <button style={{ ...styles.btn, flex: 1, padding: 8, fontSize: 12 }} onClick={() => repay(loan.id, "ontime")}>Repay On Time</button>
                <button style={{ ...styles.btnLogout, flex: 1, padding: 8, fontSize: 12, marginTop: 0 }} onClick={() => repay(loan.id, "late")}>Repay Late</button>
              </div>
            )}
            {loan.status === "repaid" && <div style={{ fontSize: 12, color: "#15803d", marginTop: 4 }}>✓ Repaid {loan.repayType}</div>}
          </div>
        ))}
      </>}
    </Layout>
  );
}
