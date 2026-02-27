const styles = {

  // Split Page Layout
  page: {
    minHeight: "100vh", display: "flex",
    fontFamily: "'Segoe UI', sans-serif",
  },

  left: {
    flex: 1,
    background: "#1a56db", color: "#fff",
    display: "flex", flexDirection: "column", justifyContent: "center",
    padding: "60px 48px",
  },

  right: {
    flex: 1,
    background: "#f4f6fb",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 32,
  },


  // Welcome Banner
  brand: {
    fontSize: 36, fontWeight: 800,
    marginBottom: 16, letterSpacing: -1,
  },

  tagline: {
    fontSize: 17, opacity: 0.85,
    lineHeight: 1.6, maxWidth: 320,
  },


  // Card
  container: {
    width: "100%", maxWidth: 400,
    background: "#fff",
    padding: 36,
    borderRadius: 12,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },

  h2: {
    marginTop: 0, marginBottom: 24,
    fontSize: 22, color: "#111",
  },

  form: {
    display: "flex", flexDirection: "column",
    gap: 14,
  },


  // Inputs
  input: {
    padding: "12px 16px",
    fontSize: 14,
    border: "1px solid #ddd", borderRadius: 6,
    outline: "none",
  },

  field: {
    background: "#f9f9f9",
    border: "1px solid #eee", borderRadius: 8,
    padding: "12px 16px",
    marginBottom: 10, fontSize: 15,
  },

  label: {

    color: "#888",
    fontSize: 11, fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5, marginBottom: 4,
  },


  // Buttons
  btn: {
    background: "#1a56db", color: "#fff",
    border: "none", borderRadius: 6, cursor: "pointer",
    padding: 12,
    fontSize: 15, fontWeight: 600, marginTop: 8,
  },

  btnDisabled: {
    background: "#93b4f0", color: "#fff",
    border: "none", borderRadius: 6, cursor: "not-allowed",
    padding: 12,
    fontSize: 15, fontWeight: 600, marginTop: 8,
  },

  btnBack: {
    background: "#eef2ff", color: "#1a56db",
    border: "none", borderRadius: 6, cursor: "pointer",
    padding: 12,
    fontSize: 15, fontWeight: 600, marginTop: 4,
  },

  btnLogout: {
    background: "#fee2e2", color: "#b91c1c",
    border: "none", borderRadius: 6, cursor: "pointer",
    padding: 12,
    fontSize: 15, fontWeight: 600, marginTop: 20,
  },

  btnGreen: {
    background: "#dcfce7", color: "#15803d",
    border: "none", borderRadius: 6, cursor: "pointer",
    padding: 12,
    fontSize: 15, fontWeight: 600, marginTop: 8,
  },

  btnExpand: {
    background: "none", border: "none",
    color: "#1a56db", cursor: "pointer",
    fontSize: 13, fontWeight: 600,
    padding: "6px 0", marginTop: 6,
  },

  iconBtn: {
    width: 38, height: 38,
    borderRadius: 6, border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: 16, flexShrink: 0, marginLeft: 6,
  },


  // Feedback
  error: {
    padding: "10px 14px",
    background: "#fff0f0",
    border: "1px solid #fca5a5", borderRadius: 6,
    color: "#b91c1c",
    fontSize: 13, marginTop: 6,
  },

  success: {
    padding: "10px 14px",
    background: "#f0fff4",
    border: "1px solid #86efac", borderRadius: 6,
    color: "#15803d",
    fontSize: 13, marginTop: 6,
  },

  link: {
    display: "block",
    marginTop: 20,  fontSize: 13,
    textAlign: "center", cursor: "pointer",
    color: "#1a56db", 
  },

};

export default styles;