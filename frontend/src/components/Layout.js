import styles from "../styles";

const messages = {
  login:    { title: "Welcome back.",       sub: "Good to see you again. Sign in to pick up where you left off." },
  register: { title: "Join Wonga.",         sub: "Quick to set up. Try not to forget your password this time. 😉" },
  me:       { title: "You're all set.",     sub: "Looks like you're ready for a loan. Let's get you sorted." },
};

const mobileTag = {
  login:    "Welcome back.",
  register: "Create your account.",
  me:       "You're all set.",
};

export default function Layout({ page, children }) {
  const { title, sub } = messages[page] || messages.login;
  return (
    <>
      <style>{`
        .layout { display: flex; min-height: 100vh; font-family: 'Segoe UI', sans-serif; }
        .left { flex: 1; background: #1a56db; color: #fff; display: flex; flex-direction: column; justify-content: center; padding: 60px 48px; }
        .right { flex: 1; background: #f4f6fb; display: flex; align-items: center; justify-content: center; padding: 32px; }
        .mobile-header { display: none; }

        @media (max-width: 768px) {
          .left { display: none; }
          .right { background: #fff; padding: 32px 24px; align-items: flex-start; padding-top: 48px; }
          .mobile-header { display: flex; flex-direction: column; align-items: center; margin-bottom: 28px; gap: 8px; }
          .mobile-logo { width: 56px; height: 56px; object-fit: contain; }
          .mobile-title { font-size: 20px; font-weight: 700; color: #111; }
          .mobile-tag { font-size: 12px; color: #888; letter-spacing: 0.5px; }
          .layout { background: #fff; }
        }
      `}</style>

      <div className="layout">
        {/* Desktop left panel - hidden on me page */}
        {page !== "me" && (
          <div className="left">
            <img src="/logo.png" alt="Wonga" style={{ width: 180, height: 180, marginBottom: 24, objectFit: "contain" }} />
            <div style={styles.brand}>{title}</div>
            <div style={styles.tagline}>{sub}</div>
          </div>
        )}

        {/* Right / form side */}
        <div className="right" style={page === "me" ? { flex: 1, background: "#f4f6fb", display: "flex", justifyContent: "center", padding: 32 } : {}}>
          {/* Mobile only header */}
          <div className="mobile-header">
            <img src="/logo.png" alt="Wonga" className="mobile-logo" />
            <div className="mobile-title">{mobileTag[page] || mobileTag.login}</div>
            <div className="mobile-tag">Secure · Fast · Reliable</div>
          </div>

          <div style={styles.container}>{children}</div>
        </div>
      </div>
    </>
  );
}

