import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API, setToken, checkEmail } from "../api";
import styles from "../styles";
import Layout from "../components/Layout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState("email");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const exists = await checkEmail(email);
      if (exists) setStep("password");
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
        setToken((await res.json()).token);
        setMsg({ type: "success", text: "Login successful! Redirecting..." });
        setTimeout(() => nav("/profile"), 1000);
      } else setMsg({ type: "error", text: "Incorrect password." });
    } catch { setMsg({ type: "error", text: "Could not connect to server." }); }
    setLoading(false);
  };

  return (
    <Layout page="login">
      <h2 style={styles.h2}>Sign In</h2>
      {step === "email" ? (
        <form onSubmit={handleEmail} style={styles.form}>
          <input style={styles.input} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
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
