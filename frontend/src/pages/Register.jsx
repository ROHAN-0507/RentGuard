
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "TENANT",
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
      const response = await api.post("/auth/register", form);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="register-decoration register-decoration-one" />
      <div className="register-decoration register-decoration-two" />

      <header className="register-header">
        <button
          type="button"
          className="register-brand"
          onClick={() => navigate("/login")}
        >
          <span className="register-brand-mark">R</span>
          <span className="register-brand-name">
            RENTGUARD
            <small>PROPERTY MANAGEMENT</small>
          </span>
        </button>

        <span className="register-header-note">
          A BETTER WAY TO MANAGE RENTALS
        </span>
      </header>

      <section className="register-layout">
        <div className="register-intro">
          <span className="register-eyebrow">
            START YOUR JOURNEY
          </span>

          <h1>
            Better renting
            <br />
            begins <em>with you.</em>
          </h1>

          <p>
            Create your RentGuard account and bring your rental
            management into one simple, organised space.
          </p>

          <div className="register-benefits">
            <div className="register-benefit">
              <span>01</span>
              <div>
                <strong>Everything in one place</strong>
                <p>Keep your rental details organised.</p>
              </div>
            </div>

            <div className="register-benefit">
              <span>02</span>
              <div>
                <strong>Stay on top of agreements</strong>
                <p>Access your rental information easily.</p>
              </div>
            </div>

            <div className="register-benefit">
              <span>03</span>
              <div>
                <strong>Made for your role</strong>
                <p>A workspace for tenants and landlords.</p>
              </div>
            </div>
          </div>

          <div className="register-intro-footer">
            <span>01</span>
            <span className="register-footer-line" />
            <span>YOUR NEXT CHAPTER STARTS HERE</span>
          </div>
        </div>

        <div className="register-card">
          <div className="register-card-top">
            <span className="register-card-label">
              CREATE YOUR ACCOUNT
            </span>
            <span className="register-card-symbol">↗</span>
          </div>

          <h2>
            Join RentGuard<span>.</span>
          </h2>

          <p className="register-card-description">
            A few details and you're ready to get started.
          </p>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-field">
              <label htmlFor="register-name">FULL NAME</label>
              <div className="register-input-wrap">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M4 21v-2a8 8 0 0 1 16 0v2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  id="register-name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="register-email">EMAIL ADDRESS</label>
              <div className="register-input-wrap">
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
                  id="register-email"
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

            <div className="register-field">
              <label htmlFor="register-password">PASSWORD</label>
              <div className="register-input-wrap">
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
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="register-role">I AM A</label>
              <div className="register-select-wrap">
                <select
                  id="register-role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="TENANT">Tenant</option>
                  <option value="LANDLORD">Landlord</option>
                </select>
                <span>⌄</span>
              </div>
            </div>

            {error && (
              <div className="register-error" role="alert">
                <span>!</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              <span>
                {loading ? "Creating your account..." : "Create account"}
              </span>
              <span className="register-submit-arrow">→</span>
            </button>
          </form>

          <div className="register-card-divider">
            <span />
            <span>ALREADY HAVE AN ACCOUNT?</span>
            <span />
          </div>

          <button
            type="button"
            className="register-login"
            onClick={() => navigate("/login")}
          >
            Sign in to RentGuard <span>↗</span>
          </button>

          <p className="register-secure-note">
            <span>◆</span> YOUR PROPERTY JOURNEY, IN SAFE HANDS
          </p>
        </div>
      </section>

      <footer className="register-bottom">
        <span>© {new Date().getFullYear()} RENTGUARD</span>
        <span>BUILT FOR BETTER RENTAL EXPERIENCES</span>
      </footer>
    </main>
  );
}

export default Register;
