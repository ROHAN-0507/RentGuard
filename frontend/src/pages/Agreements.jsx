import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import AgreementModal from "../components/AgreementModal";

import "./Agreements.css";

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

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDaysUntil(date) {
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const end = new Date(`${date}T00:00:00`);

  if (Number.isNaN(end.getTime())) return null;

  return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
}

export default function Agreements() {
  const navigate = useNavigate();

  const user = getUserFromToken();
  const [agreements, setAgreements] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState(null);

  const [viewingAgreement, setViewingAgreement] = useState(null);

  useEffect(() => {
    const currentUser = getUserFromToken();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    loadData(currentUser.role);
  }, [navigate]);

  async function loadData(role) {
    try {
      setLoading(true);
      setError("");

      const agreementResponse = await api.get("/agreements/my");

      setAgreements(agreementResponse.data || []);

      if (role === "LANDLORD") {
        const [propertyResponse, tenantResponse] = await Promise.all([
          api.get("/properties/my"),
          api.get("/users/tenants"),
        ]);

        setProperties(propertyResponse.data || []);
        setTenants(tenantResponse.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load your rental agreements.");
    } finally {
      setLoading(false);
    }
  }

  const activeAgreements = agreements.filter(
    (agreement) => agreement.status === "ACTIVE"
  );

  const expiringAgreements = agreements.filter((agreement) => {
    if (agreement.status !== "ACTIVE") return false;

    const days = getDaysUntil(agreement.endDate);

    return days !== null && days >= 0 && days <= 30;
  });

  const activeMonthlyRent = activeAgreements.reduce(
    (sum, agreement) => sum + Number(agreement.monthlyRent || 0),
    0
  );

  const filteredAgreements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return agreements.filter((agreement) => {
      const matchesSearch =
        !query ||
        agreement.property?.title?.toLowerCase().includes(query) ||
        agreement.tenant?.name?.toLowerCase().includes(query) ||
        agreement.landlord?.name?.toLowerCase().includes(query) ||
        String(agreement.id).includes(query);

      let matchesFilter = true;

      if (filter === "ACTIVE") {
        matchesFilter = agreement.status === "ACTIVE";
      }

      if (filter === "EXPIRING") {
        matchesFilter =
          agreement.status === "ACTIVE" &&
          (() => {
            const days = getDaysUntil(agreement.endDate);
            return days !== null && days >= 0 && days <= 30;
          })();
      }

      if (filter === "EXPIRED") {
        matchesFilter = agreement.status === "EXPIRED";
      }

      if (filter === "TERMINATED") {
        matchesFilter = agreement.status === "TERMINATED";
      }

      return matchesSearch && matchesFilter;
    });
  }, [agreements, search, filter]);

  const openCreateModal = () => {
    setEditingAgreement(null);
    setShowModal(true);
  };

  const openEditModal = (agreement) => {
    setEditingAgreement(agreement);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAgreement(null);
  };

  const handleSaved = async () => {
    closeModal();
    await loadData(user?.role);
  };

  const terminateAgreement = async (agreement) => {
    const confirmed = window.confirm(
      `Terminate agreement #${agreement.id} for ${
        agreement.property?.title || "this property"
      }?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.put(`/agreements/${agreement.id}/terminate`);

      await loadData(user?.role);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to terminate this agreement."
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="agreements-loading">
        <div className="agreements-loader-mark">R</div>
        <p>RENTGUARD</p>
      </div>
    );
  }

  return (
    <div className="agreements-app">

      {/* SIDEBAR */}
      <aside className="agreements-sidebar">

        <div>
          <div className="agreements-brand">

            <div className="agreements-brand-mark">
              R
            </div>

            <div>
              <div className="agreements-brand-name">
                RENTGUARD
              </div>

              <div className="agreements-brand-subtitle">
                PROPERTY MANAGEMENT
              </div>
            </div>

          </div>

          <div className="agreements-sidebar-line" />

          <div className="agreements-menu-label">
            MENU
          </div>

          <nav className="agreements-nav">

            <button
              className="agreements-nav-item"
              onClick={() => navigate("/dashboard")}
            >
              <span>01</span>
              Dashboard
            </button>

            {user?.role === "LANDLORD" && (
              <button
                className="agreements-nav-item"
                onClick={() => navigate("/properties")}
              >
                <span>02</span>
                Properties
              </button>
            )}

            <button className="agreements-nav-item active">
              <span>03</span>
              Agreements
            </button>

            <button
              className="agreements-nav-item"
              onClick={() => navigate("/payments")}
            >
              <span>04</span>
              Payments
            </button>

          </nav>
        </div>

        <div className="agreements-sidebar-bottom">

          <button
            className="agreements-logout"
            onClick={logout}
          >
            Log out
            <span>↗</span>
          </button>

        </div>

      </aside>

      {/* MAIN */}
      <main className="agreements-main">

        {/* TOP BAR */}
        <header className="agreements-topbar">

          <div className="agreements-breadcrumb">
            RENTGUARD
            <span>/</span>
            AGREEMENTS
          </div>

          <div className="agreements-profile">

            <div className="agreements-avatar">
              {user?.email?.charAt(0)?.toUpperCase() || "R"}
            </div>

            <div>
              <strong>
                {user?.email?.split("@")[0] || "User"}
              </strong>

              <span>{user?.role}</span>
            </div>

          </div>

        </header>

        {/* PAGE HERO */}
        <section className="agreements-hero">

          <div className="agreements-hero-copy">

            <p className="agreements-eyebrow">
              RENTAL MANAGEMENT
            </p>

            <h1>
              Your agreements.
            </h1>

            <p>
              Keep every tenancy, renewal and expiry
              thoughtfully organised in one place.
            </p>

          </div>

          {user?.role === "LANDLORD" && (
            <button
              className="agreements-primary-button"
              onClick={openCreateModal}
            >
              <span>+</span>
              Create agreement
            </button>
          )}

        </section>

        {error && (
          <div className="agreements-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <section className="agreements-summary">

          <div className="agreements-summary-item">
            <span>01</span>
            <div>
              <small>TOTAL AGREEMENTS</small>
              <strong>{agreements.length}</strong>
            </div>
          </div>

          <div className="agreements-summary-item">
            <span>02</span>
            <div>
              <small>ACTIVE</small>
              <strong>{activeAgreements.length}</strong>
            </div>
          </div>

          <div className="agreements-summary-item">
            <span>03</span>
            <div>
              <small>EXPIRING SOON</small>
              <strong>{expiringAgreements.length}</strong>
            </div>
          </div>

          <div className="agreements-summary-item">
            <span>04</span>
            <div>
              <small>ACTIVE MONTHLY RENT</small>
              <strong>
                {formatCurrency(activeMonthlyRent)}
              </strong>
            </div>
          </div>

        </section>

        {/* AGREEMENT LIST */}
        <section className="agreements-list-section">

          <div className="agreements-section-heading">

            <div>
              <p className="agreements-eyebrow">
                YOUR TENANCIES
              </p>

              <h2>
                Rental agreements
              </h2>
            </div>

            <div className="agreements-result-count">
              {filteredAgreements.length} RECORD
              {filteredAgreements.length === 1 ? "" : "S"}
            </div>

          </div>

          {/* SEARCH + FILTERS */}
          <div className="agreements-toolbar">

            <div className="agreements-search">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search property, tenant or agreement..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

            </div>

            <div className="agreements-filters">

              {[
                ["ALL", "All"],
                ["ACTIVE", "Active"],
                ["EXPIRING", "Expiring"],
                ["EXPIRED", "Expired"],
                ["TERMINATED", "Terminated"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={
                    filter === value
                      ? "agreement-filter active"
                      : "agreement-filter"
                  }
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}

            </div>

          </div>

          {filteredAgreements.length === 0 ? (

            <div className="agreements-empty">

              <div className="agreements-empty-number">
                —
              </div>

              <div>
                <h3>
                  No agreements found.
                </h3>

                <p>
                  Try changing your search or filter.
                </p>
              </div>

            </div>

          ) : (

            <div className="agreement-cards">

              {filteredAgreements.map((agreement) => {

                const daysUntil = getDaysUntil(
                  agreement.endDate
                );

                const isExpiring =
                  agreement.status === "ACTIVE" &&
                  daysUntil !== null &&
                  daysUntil >= 0 &&
                  daysUntil <= 30;

                return (
                  <article
                    className="agreement-card"
                    key={agreement.id}
                  >

                    <div className="agreement-card-top">

                      <div>

                        <div className="agreement-card-label">
                          AGREEMENT #
                          {agreement.id}
                        </div>

                        <h3>
                          {agreement.property?.title ||
                            "Rental property"}
                        </h3>

                        <p>
                          {agreement.property?.address ||
                            "Property address"}
                          {agreement.property?.city
                            ? `, ${agreement.property.city}`
                            : ""}
                        </p>

                      </div>

                      <div className="agreement-status-area">

                        <span
                          className={`agreement-status ${agreement.status?.toLowerCase()}`}
                        >
                          {agreement.status}
                        </span>

                        {isExpiring && (
                          <span className="agreement-expiring">
                            {daysUntil === 0
                              ? "Expires today"
                              : `${daysUntil} days left`}
                          </span>
                        )}

                      </div>

                    </div>

                    <div className="agreement-card-details">

                      <div>
                        <span>
                          {user?.role === "LANDLORD"
                            ? "TENANT"
                            : "LANDLORD"}
                        </span>

                        <strong>
                          {user?.role === "LANDLORD"
                            ? agreement.tenant?.name ||
                              "Tenant"
                            : agreement.landlord?.name ||
                              "Landlord"}
                        </strong>
                      </div>

                      <div>
                        <span>MONTHLY RENT</span>

                        <strong>
                          {formatCurrency(
                            agreement.monthlyRent
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>SECURITY DEPOSIT</span>

                        <strong>
                          {formatCurrency(
                            agreement.securityDeposit
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>PERIOD</span>

                        <strong>
                          {formatDate(
                            agreement.startDate
                          )}
                          <small>
                            →
                          </small>
                          {formatDate(
                            agreement.endDate
                          )}
                        </strong>
                      </div>

                    </div>

                    <div className="agreement-card-footer">

                      <span>
                        Created{" "}
                        {formatDate(
                          agreement.createdAt
                        )}
                      </span>

                      <div className="agreement-actions">

                        <button
                          onClick={() =>
                            setViewingAgreement(
                              agreement
                            )
                          }
                        >
                          View
                        </button>

                        {user?.role === "LANDLORD" &&
                          agreement.status === "ACTIVE" && (
                            <>
                              <button
                                onClick={() =>
                                  openEditModal(
                                    agreement
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="danger"
                                onClick={() =>
                                  terminateAgreement(
                                    agreement
                                  )
                                }
                              >
                                Terminate
                              </button>
                            </>
                          )}

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>

          )}

        </section>

        <footer className="agreements-footer">
          <span>RENTGUARD © 2026</span>
          <span>SMART RENTAL MANAGEMENT</span>
        </footer>

      </main>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <AgreementModal
          isOpen={showModal}
          mode={editingAgreement ? "edit" : "add"}
          agreement={editingAgreement}
          properties={properties}
          tenants={tenants}
          onClose={closeModal}
          onSuccess={handleSaved}
        />
      )}

      {/* VIEW MODAL */}
      {viewingAgreement && (
        <div className="agreement-view-overlay">

          <div className="agreement-view-modal">

            <button
              className="agreement-view-close"
              onClick={() =>
                setViewingAgreement(null)
              }
            >
              ×
            </button>

            <p className="agreements-eyebrow">
              AGREEMENT #
              {viewingAgreement.id}
            </p>

            <h2>
              {viewingAgreement.property?.title ||
                "Rental Agreement"}
            </h2>

            <div className="agreement-view-grid">

              <div>
                <span>PROPERTY</span>
                <strong>
                  {viewingAgreement.property?.title ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  {user?.role === "LANDLORD"
                    ? "TENANT"
                    : "LANDLORD"}
                </span>

                <strong>
                  {user?.role === "LANDLORD"
                    ? viewingAgreement.tenant?.name
                    : viewingAgreement.landlord?.name}
                </strong>
              </div>

              <div>
                <span>MONTHLY RENT</span>
                <strong>
                  {formatCurrency(
                    viewingAgreement.monthlyRent
                  )}
                </strong>
              </div>

              <div>
                <span>SECURITY DEPOSIT</span>
                <strong>
                  {formatCurrency(
                    viewingAgreement.securityDeposit
                  )}
                </strong>
              </div>

              <div>
                <span>START DATE</span>
                <strong>
                  {formatDate(
                    viewingAgreement.startDate
                  )}
                </strong>
              </div>

              <div>
                <span>END DATE</span>
                <strong>
                  {formatDate(
                    viewingAgreement.endDate
                  )}
                </strong>
              </div>

              <div>
                <span>STATUS</span>

                <strong>
                  <span
                    className={`agreement-status ${viewingAgreement.status?.toLowerCase()}`}
                  >
                    {viewingAgreement.status}
                  </span>
                </strong>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
