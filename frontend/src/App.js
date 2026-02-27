import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ChatBot from "./components/ChatBot";
import { getToken } from "./api";

const Login    = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile  = lazy(() => import("./pages/Profile"));

function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/profile"  element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*"         element={<Navigate to="/login" />} />
        </Routes>
      </Suspense>
      <ChatBot />
    </BrowserRouter>
  );
}
