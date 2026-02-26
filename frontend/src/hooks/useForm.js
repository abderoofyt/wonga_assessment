import { useState } from "react";

export default function useForm(initial) {
  const [form, setForm] = useState(initial);
  const set = (f) => (e) => setForm(s => ({ ...s, [f]: e.target.value }));
  const reset = () => setForm(initial);
  return [form, set, setForm, reset];
}
