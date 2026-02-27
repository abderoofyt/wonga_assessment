export const API = "/api";
export const getToken = () => localStorage.getItem("token");
export const setToken = (t) => localStorage.setItem("token", t);
export const clearToken = () => localStorage.removeItem("token");
export const setConfettiFlag = () => localStorage.setItem("confetti", "1");
export const popConfettiFlag = () => { const v = localStorage.getItem("confetti"); localStorage.removeItem("confetti"); return v === "1"; };

export const checkEmail = async (email) => {
  const res = await fetch(`${API}/check-email`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return (await res.json()).exists;
};
