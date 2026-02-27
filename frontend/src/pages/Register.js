import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API, setToken, setConfettiFlag } from "../api";
import styles from "../styles";
import Layout from "../components/Layout";
import FullNameInput from "../components/FullNameInput";
import PasswordInput from "../components/PasswordInput";
import useForm from "../hooks/useForm";

export default function Register() {
  const { state } = useLocation();
  const [form, set, setForm] = useForm({ firstName: "", lastName: "", email: state?.email || "", password: "", confirm: "", phone: "", idNumber: "" });
  const [show, setShow] = useState({ phone: false, id: false });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const toggle = (f) => setShow(s => ({ ...s, [f]: !s[f] }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, phone: form.phone || null, idNumber: form.idNumber || null }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        if (data.isNewUser) setConfettiFlag();
        nav("/profile");
      } else setMsg({ type: "error", text: await res.text() });
    } catch { setMsg({ type: "error", text: "Could not connect to server." }); }
    setLoading(false);
  };

  const passwordsOk = !form.confirm || form.password === form.confirm;

  return (
    <Layout page="register">
      <h2 style={styles.h2}>Create Account</h2>
      <form onSubmit={submit} style={styles.form}>

        <FullNameInput
          firstName={form.firstName}
          lastName={form.lastName}
          onChange={(fn, ln) => setForm(s => ({ ...s, firstName: fn, lastName: ln }))}
        />

        <input style={styles.input} placeholder="Email" type="email" value={form.email} onChange={set("email")} required />

        <PasswordInput
          value={form.password}
          confirm={form.confirm}
          onChange={set("password")}
          onConfirmChange={set("confirm")}
        />

        <div style={{ borderTop: "1px solid #eee", paddingTop: 8, fontSize: 12, color: "#999" }}>Optional</div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" style={{ ...styles.iconBtn, fontSize: 20 }} onClick={() => toggle("phone")} title="Phone Number">
            {show.phone ? "▾" : "📱"}
          </button>
          <button type="button" style={{ ...styles.iconBtn, fontSize: 20 }} onClick={() => toggle("id")} title="ID Number">
            {show.id ? "▾" : "📇"}
          </button>
        </div>
        {show.phone && <input style={styles.input} placeholder="Phone Number" type="tel" value={form.phone}
          onChange={set("phone")}
          onKeyDown={e => { if (e.key.length === 1 && (!/[0-9]/.test(e.key) || form.phone.length >= 15)) e.preventDefault(); }}
          maxLength={15} />}
        {show.id && <input style={styles.input} placeholder="ID Number" value={form.idNumber}
          onChange={set("idNumber")}
          onKeyDown={e => { if (e.key.length === 1 && (!/[0-9]/.test(e.key) || form.idNumber.length >= 13)) e.preventDefault(); }}
          maxLength={13} />}

        {msg && <div style={styles[msg.type]}>{msg.text}</div>}
        <button style={loading || !passwordsOk ? styles.btnDisabled : styles.btn} disabled={loading || !passwordsOk}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
      <span style={styles.link} onClick={() => nav("/login")}>Already have an account? Sign in</span>
    </Layout>
  );
}
