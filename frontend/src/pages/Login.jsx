
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", form);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-decoration login-decoration-one" />
      <div className="login-decoration login-decoration-two" />

      <header className="login-header">
        <button
          type="button"
          className="login-brand"
          onClick={() => navigate("/login")}
        >
          <span className="login-brand-mark">R</span>
          <span className="login-brand-name">
            RENTGUARD
            <small>PROPERTY MANAGEMENT</small>
          </span>
        </button>

        <span className="login-header-note">
          A BETTER WAY TO MANAGE RENTALS
        </span>
      </header>

      <section className="login-layout">
        <div className="login-intro">
          <span className="login-eyebrow">
            YOUR SPACE. YOUR PEACE OF MIND.
          </span>

          <h1>
            Property management,
            <br />
            <em>made effortless.</em>
          </h1>

          <p>
            Everything you need to manage properties, track
            agreements and stay on top of rent — all in one place.
          </p>

          <div className="login-trust">
            <span className="login-trust-icon">✓</span>
            <div>
              <strong>One place for everything</strong>
              <span>Your rental management, simplified.</span>
            </div>
          </div>

          <div className="login-intro-footer">
            <span>01</span>
            <span className="login-footer-line" />
            <span>SIMPLER RENTING STARTS HERE</span>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-top">
            <span className="login-card-label">WELCOME BACK</span>
            <span className="login-card-symbol">↗</span>
          </div>

          <h2>Sign in<span>.</span></h2>

          <p className="login-card-description">
            Enter your details to access your account.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="login-email">EMAIL ADDRESS</label>
              <div className="login-input-wrap">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="m4 7 8 6 8-6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">PASSWORD</label>
              <div className="login-input-wrap">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <rect
                    x="4"
                    y="10"
                    width="16"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <span>!</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              <span>{loading ? "Signing you in..." : "Sign in to RentGuard"}</span>
              <span className="login-submit-arrow">→</span>
            </button>
          </form>

          <div className="login-card-divider">
            <span />
            <span>NEW TO RENTGUARD?</span>
            <span />
          </div>

          <button
            type="button"
            className="login-register"
            onClick={() => navigate("/register")}
          >
            Create your account <span>↗</span>
          </button>

          <p className="login-secure-note">
            <span>◆</span> YOUR PROPERTY JOURNEY, IN SAFE HANDS
          </p>
        </div>
      </section>

      <footer className="login-bottom">
        <span>© {new Date().getFullYear()} RENTGUARD</span>
        <span>BUILT FOR BETTER RENTAL EXPERIENCES</span>
      </footer>
    </main>
  );
}

export default Login;
