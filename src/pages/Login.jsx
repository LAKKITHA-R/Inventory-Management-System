import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

 try {
  const response = await axios.post(
    `${BASE_URL}/users/login`,
    null,
    {
      params: { username: username.trim(), password }
    }
  );
      const token = typeof response.data === "string" ? response.data : response.data?.token;

      if (!token || !token.includes(".")) {
        throw new Error("The server did not return a valid login token.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("username", username.trim());

      try {
        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
        const roleValue = payload.role || payload.roles?.[0] || payload.authorities?.[0]?.authority || "STAFF";
        localStorage.setItem("role", String(roleValue).replace(/^ROLE_/, "").toUpperCase());
      } catch {
        localStorage.setItem("role", "STAFF");
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error.response
        ? `Login failed (${error.response.status}). Check your username and password.`
        : error.message || "Cannot connect to the backend. Make sure Spring Boot is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-brand"><div className="brand-mark">R<span>+</span></div><strong>Robotics Computer scales and service</strong></div>
        <div className="story-content">
          <div className="eyebrow"><span /> SMARTER STOCK. SIMPLER WORK.</div>
          <h1>Your inventory,<br /><em>in good hands.</em></h1>
          <p>A calmer way to manage products, monitor stock levels, and keep every movement organised.</p>
          <div className="story-stats">
            <div><span className="stat-symbol">↗</span><strong>Stay organised</strong><small>One clear view of your stock</small></div>
            <div><span className="stat-symbol">✳</span><strong>Act with confidence</strong><small>Spot low stock before it runs out</small></div>
          </div>
        </div>
        <div className="story-footer">© {new Date().getFullYear()} Robotics Inventory</div>
        <div className="decor-circle decor-one" /><div className="decor-circle decor-two" />
      </section>

      <section className="login-form-side">
        <div className="login-form-wrap">
          <div className="mobile-login-brand"><div className="brand-mark">S<span>+</span></div><strong>Robotics</strong></div>
          <div className="welcome-tag">WELCOME BACK</div>
          <h2>Sign in to your workspace</h2>
          <p className="login-description">Enter your account details to continue.</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-field">
              <label htmlFor="username">Username</label>
              <input id="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" required />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
              </div>
            </div>
            {errorMessage && <div className="alert alert-error" role="alert">{errorMessage}</div>}
            <button className="login-submit" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"} <span>→</span></button>
          </form>
          <div className="secure-note"><span>✓</span> Secure access protected by your account credentials</div>
        </div>
      </section>
    </main>
  );
}
