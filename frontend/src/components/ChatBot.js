import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkEmail, API, setToken } from "../api";

const BOT = (text) => ({ from: "bot", text });
const USER = (text) => ({ from: "user", text });
const INIT = [BOT("Hi! Enter your email to sign in or create an account.")];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState(INIT);
  const [input, setInput] = useState("");
  const [step, setStep] = useState("email");
  const [userData, setUserData] = useState({});
  const [isPw, setIsPw] = useState(false);
  const bottom = useRef(null);
  const nav = useNavigate();

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const push = (...m) => setMsgs(p => [...p, ...m]);

  const handle = async (val) => {
    if (!val.trim() || step === "done") return;
    push(USER(isPw ? "••••••••" : val));
    setInput("");

    if (step === "email") {
      setIsPw(false);
      push(BOT("Checking..."));
      try {
        const exists = await checkEmail(val.trim());
        setUserData({ email: val.trim() });
        if (exists) {
          setMsgs(m => [...m.slice(0,-1), BOT("Welcome back! Enter your password.")]);
          setStep("password"); setIsPw(true);
        } else {
          setMsgs(m => [...m.slice(0,-1), BOT("No account found. Let's create one! What's your first name?")]);
          setStep("register_fn");
        }
      } catch { setMsgs(m => [...m.slice(0,-1), BOT("Couldn't connect. Try again.")]); }

    } else if (step === "password") {
      setIsPw(false);
      try {
        const res = await fetch(`${API}/login`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userData.email, password: val }),
        });
        if (res.ok) {
          setToken((await res.json()).token);
          push(BOT("🎉 Congratulations! You're signed in. Taking you to your profile..."));
          setStep("done");
          setTimeout(() => { setOpen(false); nav("/profile"); }, 1500);
        } else { push(BOT("Incorrect password. Try again.")); setIsPw(true); }
      } catch { push(BOT("Couldn't connect. Try again.")); setIsPw(true); }

    } else if (step === "register_fn") {
      setUserData(d => ({ ...d, firstName: val }));
      push(BOT(`Nice, ${val}! What's your last name?`));
      setStep("register_ln");

    } else if (step === "register_ln") {
      setUserData(d => ({ ...d, lastName: val }));
      push(BOT("Almost done! Choose a secure password."));
      setStep("register_pw"); setIsPw(true);

    } else if (step === "register_pw") {
      setIsPw(false);
      try {
        const res = await fetch(`${API}/register`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...userData, password: val }),
        });
        if (res.ok) {
          push(BOT("Account created! Taking you to sign in..."));
          setStep("done");
          setTimeout(() => { setOpen(false); nav("/login", { state: { email: userData.email } }); }, 1500);
        } else { push(BOT("Something went wrong. Try a different email.")); setStep("email"); }
      } catch { push(BOT("Couldn't connect. Try again.")); setIsPw(true); }
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
          50%  { box-shadow: 0 0 0 12px rgba(255,255,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }
        .chat-fab { animation: pulse 2s infinite; }
        .chat-fab:hover { transform: scale(1.08); transition: transform 0.15s; }
      `}</style>

      <button className="chat-fab" onClick={() => setOpen(o => !o)} style={s.fab}>
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div style={s.panel}>
          <div style={s.header}>Assistant</div>
          <div style={s.msgs}>
            {msgs.map((m, i) => <div key={i} style={m.from === "bot" ? s.bot : s.user}>{m.text}</div>)}
            <div ref={bottom} />
          </div>
          <div style={s.row}>
            <input
              style={s.input}
              type={isPw ? "password" : "text"}
              placeholder={isPw ? "Enter password..." : "Type here..."}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handle(input)}
              autoFocus
            />
            <button style={s.send} onClick={() => handle(input)}>→</button>
          </div>
        </div>
      )}
    </>
  );
}

const s = {
  fab:   { position: "fixed", bottom: 24, left: 24, width: 52, height: 52, borderRadius: "50%", background: "#1a56db", color: "#fff", fontSize: 22, border: "none", cursor: "pointer", zIndex: 1000 },
  panel: { position: "fixed", bottom: 88, left: 24, width: 310, height: 400, background: "#fff", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", zIndex: 1000, overflow: "hidden" },
  header:{ padding: "12px 16px", background: "#1a56db", color: "#fff", fontWeight: 600, fontSize: 14, fontFamily: "'Segoe UI', sans-serif" },
  msgs:  { flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 },
  bot:   { alignSelf: "flex-start", background: "#f1f1f1", padding: "8px 12px", borderRadius: "12px 12px 12px 2px", fontSize: 13, maxWidth: "85%", fontFamily: "'Segoe UI', sans-serif" },
  user:  { alignSelf: "flex-end", background: "#1a56db", color: "#fff", padding: "8px 12px", borderRadius: "12px 12px 2px 12px", fontSize: 13, maxWidth: "85%", fontFamily: "'Segoe UI', sans-serif" },
  row:   { display: "flex", borderTop: "1px solid #eee" },
  input: { flex: 1, padding: "10px 12px", border: "none", outline: "none", fontSize: 13, fontFamily: "'Segoe UI', sans-serif" },
  send:  { padding: "0 16px", background: "#1a56db", color: "#fff", border: "none", cursor: "pointer", fontSize: 18 },
};
