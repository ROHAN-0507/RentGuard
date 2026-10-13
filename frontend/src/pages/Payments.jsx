import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import "./payments.css";

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
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Payments() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const currentUser = getUserFromToken();

    if (!currentUser) {
      navigate("/login");
      return;
    }

    setUser(currentUser);
    loadPayments();
  }, [navigate]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/payments/my");

      setPayments(response.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load your payment records.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const markAsPaid = async (paymentId) => {
    try {
      setProcessingId(paymentId);
      setError("");

      await api.put(`/payments/${paymentId}/paid`);

      await loadPayments();
    } catch (err) {
      console.error(err);
      setError("Unable to mark this payment as paid.");
    } finally {
      setProcessingId(null);
    }
  };

  const firstName =
    user?.email?.split("@")[0]?.charAt(0).toUpperCase() +
    user?.email?.split("@")[0]?.slice(1);

  const stats = useMemo(() => {
    const paid = payments.filter((p) => p.status === "PAID");
    const pending = payments.filter((p) => p.status === "PENDING");
    const overdue = payments.filter((p) => p.status === "OVERDUE");

    return {
      total: payments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      ),
      collected: paid.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      ),
      pending: pending.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      ),
      overdue: overdue.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      ),
      paidCount: paid.length,
      pendingCount: pending.length,
      overdueCount: overdue.length,
    };
  }, [payments]);

  const filteredPayments =
    filter === "ALL"
      ? payments
      : payments.filter((payment) => payment.status === filter);

  if (loading) {
    return (
      <div className="payment-loader">
        <div className="payment-loader-mark">R</div>
        <p>RENTGUARD</p>
      </div>
    );
  }

  return (
    <div className="payment-page">
      {/* SIDEBAR */}
      <aside className="payment-sidebar">
        <div>
          <div className="payment-logo">
            <div className="payment-logo-symbol">R</div>

            <div>
              <div className="payment-logo-name">RENTGUARD</div>
              <div className="payment-logo-subtitle">
                PROPERTY MANAGEMENT
              </div>
            </div>
          </div>

          <div className="payment-sidebar-divider" />

          <p className="payment-menu-label">MENU</p>

          <nav className="payment-nav">
            <button
              className="payment-nav-item"
              onClick={() => navigate("/dashboard")}
            >
              <span>01</span>
              Dashboard
            </button>

            {user?.role === "LANDLORD" && (
              <button
                className="payment-nav-item"
                onClick={() => navigate("/properties")}
              >
                <span>02</span>
                Properties
              </button>
            )}

            <button
              className="payment-nav-item"
              onClick={() => navigate("/agreements")}
            >
              <span>03</span>
              Agreements
            </button>

            <button className="payment-nav-item active">
              <span>04</span>
              Payments
            </button>

            <button className="payment-nav-item">
              <span>05</span>
              Maintenance
            </button>

            <button className="payment-nav-item">
              <span>06</span>
              Notifications
            </button>
          </nav>
        </div>

        <div className="payment-sidebar-bottom">
          <button className="payment-settings">
            <span>⚙</span>
            Settings
          </button>

          <button className="payment-logout" onClick={logout}>
            Log out
            <span>↗</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="payment-main">
        {/* TOPBAR */}
        <header className="payment-topbar">
          <div className="payment-breadcrumb">
            RENTGUARD <span>/</span> PAYMENTS
          </div>

          <div className="payment-profile-area">
            <button className="payment-notification">
              ◌
              <i />
            </button>

            <div className="payment-profile">
              <div className="payment-avatar">
                {firstName?.charAt(0) || "R"}
              </div>

              <div>
                <strong>{firstName || "User"}</strong>
                <span>{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="payment-hero">
          <div>
            <p className="payment-eyebrow">
              {user?.role === "LANDLORD"
                ? "FINANCIAL OVERVIEW"
                : "RENTAL PAYMENTS"}
            </p>

            <h1>
              Payment
              <br />
              <em>history.</em>
            </h1>

            <p className="payment-hero-description">
              Track rental collections, outstanding balances and payment
              activity across your RentGuard portfolio.
            </p>
          </div>

          <div className="payment-hero-number">
            <span>RECORDS</span>
            <strong>{payments.length}</strong>
            <small>PAYMENTS</small>
          </div>
        </section>

        {error && (
          <div className="payment-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* STATS */}
        <section className="payment-stats">
          <div className="payment-stat">
            <span>01</span>
            <div>
              <p>TOTAL VALUE</p>
              <strong>{formatCurrency(stats.total)}</strong>
            </div>
          </div>

          <div className="payment-stat payment-stat-positive">
            <span>02</span>
            <div>
              <p>COLLECTED</p>
              <strong>{formatCurrency(stats.collected)}</strong>
            </div>
          </div>

          <div className="payment-stat">
            <span>03</span>
            <div>
              <p>PENDING</p>
              <strong>{formatCurrency(stats.pending)}</strong>
            </div>
          </div>

          <div className="payment-stat payment-stat-danger">
            <span>04</span>
            <div>
              <p>OVERDUE</p>
              <strong>{formatCurrency(stats.overdue)}</strong>
            </div>
          </div>
        </section>

        {/* PAYMENT CONTENT */}
        <section className="payment-content">
          <div className="payment-section-heading">
            <div>
              <p className="payment-eyebrow">TRANSACTION REGISTER</p>
              <h2>Payment activity</h2>
            </div>

            <div className="payment-filters">
              {["ALL", "PENDING", "PAID", "OVERDUE"].map((item) => (
                <button
                  key={item}
                  className={filter === item ? "selected" : ""}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="payment-empty">
              <div className="payment-empty-mark">R</div>
              <h3>No payment records</h3>
              <p>
                Payment activity associated with your rental agreements will
                appear here.
              </p>
            </div>
          ) : (
            <div className="payment-table-wrap">
              <div className="payment-table-head">
                <span>PAYMENT</span>
                <span>PROPERTY / TENANT</span>
                <span>DUE DATE</span>
                <span>AMOUNT</span>
                <span>STATUS</span>
                <span />
              </div>

              {filteredPayments.map((payment) => (
                <div className="payment-row" key={payment.id}>
                  <div className="payment-id">
                    <span className="payment-row-number">
                      #{String(payment.id).padStart(2, "0")}
                    </span>

                    <strong>
                      {payment.paymentMethod || "Rental Payment"}
                    </strong>

                    <small>
                      {payment.transactionReference || "No reference"}
                    </small>
                  </div>

                  <div className="payment-property">
                    <strong>
                      {payment.agreement?.property?.title ||
                        "Rental Property"}
                    </strong>

                    <small>
                      {user?.role === "LANDLORD"
                        ? payment.tenant?.name || "Tenant"
                        : payment.landlord?.name || "Landlord"}
                    </small>
                  </div>

                  <div className="payment-date">
                    {formatDate(payment.dueDate)}
                  </div>

                  <div className="payment-amount">
                    {formatCurrency(payment.amount)}
                  </div>

                  <div>
                    <span
                      className={`payment-status ${payment.status.toLowerCase()}`}
                    >
                      <i />
                      {payment.status}
                    </span>

                    {payment.paidDate && (
                      <small className="payment-paid-date">
                        Paid {formatDate(payment.paidDate)}
                      </small>
                    )}
                  </div>

                  <div className="payment-action">
                    {user?.role === "LANDLORD" &&
                    payment.status !== "PAID" ? (
                      <button
                        onClick={() => markAsPaid(payment.id)}
                        disabled={processingId === payment.id}
                      >
                        {processingId === payment.id
                          ? "UPDATING..."
                          : "MARK PAID"}
                      </button>
                    ) : (
                      <span className="payment-complete">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="payment-footer">
          <span>RENTGUARD</span>
          <p>SMART RENTAL & PROPERTY MANAGEMENT</p>
          <span>2026</span>
        </footer>
      </main>
    </div>
  );
}