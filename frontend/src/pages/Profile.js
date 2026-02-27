import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API, getToken, clearToken, popConfettiFlag } from "../api";
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
  const [firstLoanModal, setFirstLoanModal] = useState(false);
  const prevLevel = useRef(null);
  const nav = useNavigate();

  const popConfetti = () => { setConfetti(true); setTimeout(() => setConfetti(false), 3000); };

  const load = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [uRes, lRes] = await Promise.all([
        fetch(`${API}/profile`, { headers }),
        fetch(`${API}/loans`,   { headers }),
      ]);
      if (!uRes.ok) throw new Error();
      const [u, l] = await Promise.all([uRes.json(), lRes.json()]);
      if (prevLevel.current !== null && u.level > prevLevel.current) popConfetti();
      if (prevLevel.current === null && popConfettiFlag()) popConfetti(); // new user or first login
      prevLevel.current = u.level;
      setUser(u); setForm(u); setLoans(l);
    } catch { clearToken(); nav("/login"); }
  }, [nav]);

  useEffect(() => { load(); }, [load]);

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
    if (res.ok) { load(); }
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
          {[
            { f: "firstName", label: "First Name",           max: 50, type: "name"  },
            { f: "lastName",  label: "Last Name",            max: 50, type: "name"  },
            { f: "phone",     label: "Phone (optional)",     max: 15, type: "phone" },
            { f: "idNumber",  label: "ID Number (optional)", max: 13, type: "id"    },
          ].map(({ f, label, max, type }, i) => {
            const val = form[f] || "";
            const near = val.length >= max - 10;
            const atMax = val.length >= max;
            const onKeyDown = (e) => {
              if (e.key.length !== 1) return;
              if (type === "name"  && /[0-9]/.test(e.key)) { e.preventDefault(); return; }
              if (type === "phone" && (!/[0-9]/.test(e.key) || val.length >= 15)) { e.preventDefault(); return; }
              if (type === "id"    && (!/[0-9]/.test(e.key) || val.length >= 13)) { e.preventDefault(); return; }
            };
            return (
              <div key={f} style={{ marginTop: i > 0 ? 8 : 0 }}>
                <input style={styles.input} placeholder={label} value={val}
                  onChange={e => setForm(s => ({ ...s, [f]: e.target.value }))}
                  onKeyDown={onKeyDown} maxLength={max} />
                {near && <span style={{ fontSize: 10, color: atMax ? "#b91c1c" : "#999", marginLeft: 4 }}>{val.length}/{max}</span>}
              </div>
            );
          })}
          {msg && <div style={{ ...styles[msg.type], marginTop: 8 }}>{msg.text}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button style={loading ? styles.btnDisabled : styles.btn} onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
            <button style={styles.btnBack} onClick={() => { setEdit(false); setForm(user); setMsg(null); }}>Cancel</button>
          </div>
        </>}
      </>}

      {/* Apply Tab */}
      {tab === 1 && <LoanCalculator isFirstLoan={loans.length === 0} onApplied={(leveledUp) => { load(); setTab(2); if (leveledUp) { popConfetti(); setFirstLoanModal(true); } }} />}

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
                <button style={{ ...styles.btnGreen, flex: 1, padding: 8, fontSize: 12 }} onClick={() => repay(loan.id, "early")}>Repay Early</button>
                <button style={{ ...styles.btn, flex: 1, padding: 8, fontSize: 12 }} onClick={() => repay(loan.id, "ontime")}>Repay On Time</button>
                <button style={{ ...styles.btnLogout, flex: 1, padding: 8, fontSize: 12, marginTop: 0 }} onClick={() => repay(loan.id, "late")}>Repay Late</button>
              </div>
            )}
            {loan.status === "repaid" && <div style={{ fontSize: 12, color: "#15803d", marginTop: 4 }}>✓ Repaid {loan.repayType}</div>}
          </div>
        ))}
      </>}
      {firstLoanModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 36, maxWidth: 360, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1a56db", marginBottom: 8 }}>Congratulations!</div>
            <div style={{ fontSize: 15, color: "#555", marginBottom: 24, lineHeight: 1.5 }}>
              Welcome to Level 2! Thanks for taking your first loan out with us — we're excited to be part of your journey.
            </div>
            <button style={{ ...styles.btn, width: "100%" }} onClick={() => setFirstLoanModal(false)}>Let's Go! 🚀</button>
          </div>
        </div>
      )}
    </Layout>
  );
}
