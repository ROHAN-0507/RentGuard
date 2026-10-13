import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import "../index.css";

function getUserFromToken() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return {
      email: payload.sub,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const currentUser = getUserFromToken();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);
    loadDashboard(currentUser.role);
  }, [navigate]);

  const loadDashboard = async (role) => {
    try {
      setLoading(true);
      setError("");

      if (role === "LANDLORD") {
        const [propertyResponse, agreementResponse] =
          await Promise.all([
            api.get("/properties/my"),
            api.get("/agreements/my"),
          ]);

        setProperties(propertyResponse.data);
        setAgreements(agreementResponse.data);
      } else {
        const agreementResponse =
          await api.get("/agreements/my");

        setAgreements(agreementResponse.data);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load your RentGuard data.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="luxury-loader">
        <div className="loader-mark">R</div>
        <p>RENTGUARD</p>
      </div>
    );
  }

  const activeAgreements = agreements.filter(
    (agreement) => agreement.status === "ACTIVE"
  );

  const totalRent = activeAgreements.reduce(
    (sum, agreement) =>
      sum + (agreement.monthlyRent || 0),
    0
  );

  const firstName =
    user?.email?.split("@")[0]?.charAt(0).toUpperCase() +
    user?.email?.split("@")[0]?.slice(1);

  return (
    <div className="luxury-app">

      {/* SIDEBAR */}
      <aside className="luxury-sidebar">

        <div>

          <div className="luxury-logo">
            <div className="logo-symbol">R</div>

            <div>
              <div className="logo-name">
                RENTGUARD
              </div>

              <div className="logo-subtitle">
                PROPERTY MANAGEMENT
              </div>
            </div>
          </div>

          <div className="sidebar-divider" />

          <p className="menu-label">
            MENU
          </p>

          <nav className="luxury-nav">

            {/* DASHBOARD */}
            <Link
              to="/dashboard"
              className="luxury-nav-item active"
            >
              <span>01</span>
              Dashboard
            </Link>

            {/* PROPERTIES */}
            {user?.role === "LANDLORD" && (
              <Link
                to="/properties"
                className="luxury-nav-item"
              >
                <span>02</span>
                Properties
              </Link>
            )}

            {/* AGREEMENTS */}
            <Link
              to="/agreements"
              className="luxury-nav-item"
            >
              <span>03</span>
              Agreements
            </Link>

            {/* PAYMENTS */}
            <Link
              to="/payments"
              className="luxury-nav-item"
            >
              <span>04</span>
              Payments
            </Link>

            {/* MAINTENANCE */}
            <Link
              to="/maintenance"
              className="luxury-nav-item"
            >
              <span>05</span>
              Maintenance
            </Link>

            {/* NOTIFICATIONS */}
            <Link
              to="/notifications"
              className="luxury-nav-item"
            >
              <span>06</span>
              Notifications
            </Link>

          </nav>

        </div>

        <div className="sidebar-bottom">

          <button
            className="settings-link"
            type="button"
          >
            <span>⚙</span>
            Settings
          </button>

          <button
            className="logout-link"
            onClick={logout}
            type="button"
          >
            Log out
            <span>↗</span>
          </button>

        </div>

      </aside>

      {/* MAIN */}
      <main className="luxury-main">

        {/* TOPBAR */}
        <header className="luxury-topbar">

          <div className="breadcrumb">
            RENTGUARD <span>/</span> DASHBOARD
          </div>

          <div className="topbar-right">

            <Link
              to="/notifications"
              className="notification-button"
            >
              ◌
              <i />
            </Link>

            <div className="profile">

              <div className="profile-avatar">
                {firstName?.charAt(0) || "R"}
              </div>

              <div className="profile-info">
                <strong>
                  {firstName || "User"}
                </strong>

                <span>
                  {user?.role}
                </span>
              </div>

            </div>

          </div>

        </header>

        {/* HERO */}
        <section className="luxury-hero">

          <div className="hero-copy">

            <p className="eyebrow">
              {user?.role === "LANDLORD"
                ? "LANDLORD OVERVIEW"
                : "TENANT OVERVIEW"}
            </p>

            <h1>
              Good morning,
              <br />
              <em>
                {firstName || "there"}.
              </em>
            </h1>

            <p className="hero-description">
              Everything you need to manage your rental journey,
              thoughtfully organised in one place.
            </p>

          </div>

          <div className="hero-number">
            <span>ACTIVE</span>

            <strong>
              {activeAgreements.length}
            </strong>

            <small>
              AGREEMENTS
            </small>
          </div>

        </section>

        {error && (
          <div className="luxury-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* STATS */}
        <section className="luxury-stats">

          {user?.role === "LANDLORD" && (
            <div className="luxury-stat">

              <span className="stat-index">
                01
              </span>

              <div>
                <p>PROPERTIES</p>

                <strong>
                  {properties.length}
                </strong>
              </div>

            </div>
          )}

          <div className="luxury-stat">

            <span className="stat-index">
              {user?.role === "LANDLORD"
                ? "02"
                : "01"}
            </span>

            <div>
              <p>ACTIVE AGREEMENTS</p>

              <strong>
                {activeAgreements.length}
              </strong>
            </div>

          </div>

          <div className="luxury-stat">

            <span className="stat-index">
              {user?.role === "LANDLORD"
                ? "03"
                : "02"}
            </span>

            <div>
              <p>MONTHLY RENT</p>

              <strong>
                ₹{totalRent.toLocaleString("en-IN")}
              </strong>
            </div>

          </div>

          <div className="luxury-stat">

            <span className="stat-index">
              {user?.role === "LANDLORD"
                ? "04"
                : "03"}
            </span>

            <div>
              <p>ACCOUNT</p>

              <strong className="active-account">
                ACTIVE
              </strong>
            </div>

          </div>

        </section>

        {/* PROPERTIES */}
        {user?.role === "LANDLORD" && (
          <section className="luxury-section">

            <div className="section-title-row">

              <div>
                <p className="eyebrow">
                  YOUR PORTFOLIO
                </p>

                <h2>
                  Properties
                </h2>
              </div>

              <Link
                to="/properties"
                className="outline-button"
              >
                Manage properties
                <span>↗</span>
              </Link>

            </div>

            {properties.length === 0 ? (

              <div className="luxury-empty">

                <span>01</span>

                <div>
                  <h3>
                    Your portfolio is empty.
                  </h3>

                  <p>
                    Add a property to begin
                    managing your rental portfolio.
                  </p>
                </div>

              </div>

            ) : (

              <div className="luxury-property-grid">

                {properties
                  .slice(0, 3)
                  .map((property, index) => (

                    <article
                      className="luxury-property"
                      key={property.id}
                    >

                      <div className="property-image">

                        <div className="image-overlay">

                          <span>
                            PROPERTY{" "}
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <Link to="/properties">
                            ↗
                          </Link>

                        </div>

                        <div className="building-mark">
                          R
                        </div>

                      </div>

                      <div className="property-content">

                        <div className="property-meta">

                          <span>
                            AVAILABLE
                          </span>

                          <span>
                            ID #{property.id}
                          </span>

                        </div>

                        <h3>
                          {property.title}
                        </h3>

                        <p>
                          {property.address}

                          {property.city &&
                            `, ${property.city}`}
                        </p>

                        <div className="property-bottom">

                          <div>

                            <span>
                              MONTHLY RENT
                            </span>

                            <strong>
                              ₹
                              {property.monthlyRent?.toLocaleString(
                                "en-IN"
                              )}
                            </strong>

                          </div>

                          <Link
                            to="/properties"
                            className="small-arrow"
                          >
                            →
                          </Link>

                        </div>

                      </div>

                    </article>

                  ))}

              </div>

            )}

          </section>
        )}

        {/* AGREEMENTS */}
        <section className="luxury-section agreements-section">

          <div className="section-title-row">

            <div>

              <p className="eyebrow">
                RENTAL MANAGEMENT
              </p>

              <h2>
                Agreements
              </h2>

            </div>

            <Link
              to="/agreements"
              className="outline-button"
            >
              Manage agreements
              <span>↗</span>
            </Link>

            <span className="section-count">
              {agreements.length} TOTAL
            </span>

          </div>

          {agreements.length === 0 ? (

            <div className="luxury-empty">

              <span>—</span>

              <div>

                <h3>
                  No agreements yet.
                </h3>

                <p>
                  Your rental agreements
                  will appear here.
                </p>

              </div>

            </div>

          ) : (

            <div className="luxury-agreements">

              <div className="agreement-heading">

                <span>
                  PROPERTY
                </span>

                <span>
                  {user?.role === "LANDLORD"
                    ? "TENANT"
                    : "LANDLORD"}
                </span>

                <span>
                  RENT
                </span>

                <span>
                  PERIOD
                </span>

                <span>
                  STATUS
                </span>

              </div>

              {agreements.map((agreement) => (

                <div
                  className="agreement-row"
                  key={agreement.id}
                >

                  <div>

                    <strong>
                      {agreement.property?.title ||
                        "Property"}
                    </strong>

                    <small>
                      AGREEMENT #{agreement.id}
                    </small>

                  </div>

                  <div>
                    {user?.role === "LANDLORD"
                      ? agreement.tenant?.name
                      : agreement.landlord?.name}
                  </div>

                  <div className="rent-value">
                    ₹
                    {agreement.monthlyRent?.toLocaleString(
                      "en-IN"
                    )}
                  </div>

                  <div>

                    <span>
                      {agreement.startDate}
                    </span>

                    <small>
                      TO {agreement.endDate}
                    </small>

                  </div>

                  <div>

                    <span
                      className={`luxury-status ${agreement.status?.toLowerCase()}`}
                    >
                      {agreement.status}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* FOOTER */}
        <footer className="luxury-footer">
          <span>
            RENTGUARD © 2026
          </span>

          <span>
            SMART RENTAL MANAGEMENT
          </span>
        </footer>

      </main>

    </div>
  );
}