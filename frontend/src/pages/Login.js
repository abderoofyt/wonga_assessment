import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API, setToken, checkEmail } from "../api";
import styles from "../styles";
import Layout from "../components/Layout";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep]         = useState("email");
  const [exists, setExists]     = useState(null); // null=unknown, true/false
  const [msg, setMsg]           = useState(null);
  const [loading, setLoading]   = useState(false);
  const debounce = useRef(null);
  const nav = useNavigate();

  // Debounce email check — fires 400ms after user stops typing
  useEffect(() => {
    setExists(null);
    if (!email.includes("@") || !email.includes(".")) return;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try { setExists(await checkEmail(email)); }
      catch { /* silent — will surface on submit */ }
    }, 400);
    return () => clearTimeout(debounce.current);
  }, [email]);

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      // Use prefetched result if available, else fetch now
      const found = exists !== null ? exists : await checkEmail(email);
      if (found) setStep("password");
      else nav("/register", { state: { email } });
    } catch { setMsg({ type: "error", text: "Could not connect to server." }); }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        nav("/profile");
      } else setMsg({ type: "error", text: "Incorrect password." });
    } catch { setMsg({ type: "error", text: "Could not connect to server." }); }
    setLoading(false);
  };

  // Hint shown while typing email
  const hint = email.includes("@") && email.includes(".")
    ? exists === true  ? "✓ Account found"
    : exists === false ? "✦ New account"
    : null : null;

  return (
    <Layout page="login">
      <h2 style={styles.h2}>Sign In</h2>
      {step === "email" ? (
        <form onSubmit={handleEmail} style={styles.form}>
          <div style={{ position: "relative" }}>
            <input style={styles.input} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            {hint && <div style={{ fontSize: 11, color: exists ? "#15803d" : "#1a56db", marginTop: 4 }}>{hint}</div>}
          </div>
          {msg && <div style={styles[msg.type]}>{msg.text}</div>}
          <button style={loading ? styles.btnDisabled : styles.btn} disabled={loading}>
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}><div style={styles.label}>Email</div>{email}</div>
          <input style={styles.input} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus />
          {msg && <div style={styles[msg.type]}>{msg.text}</div>}
          <button style={loading ? styles.btnDisabled : styles.btn} disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
          <button type="button" style={styles.btnBack} onClick={() => { setStep("email"); setMsg(null); }}>← Back</button>
        </form>
      )}
    </Layout>
  );
}
