import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PropertyModal from "../components/PropertyModal";

function getCurrentUserFromToken() {
  try {
    const token = localStorage.getItem("token");

    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));

    return {
      email: payload.sub || payload.email,
      role:
        payload.role ||
        payload.roles?.[0]?.replace("ROLE_", "") ||
        payload.authorities?.[0]?.authority?.replace("ROLE_", ""),
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

function formatLocation(property) {
  return [property.city, property.state].filter(Boolean).join(", ");
}

export default function Properties() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [agreements, setAgreements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedProperty, setSelectedProperty] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(null);

  const currentUser = getCurrentUserFromToken();

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [propertyResponse, agreementResponse] = await Promise.all([
        api.get("/properties/my"),
        api.get("/agreements/my"),
      ]);

      setProperties(propertyResponse.data || []);
      setAgreements(agreementResponse.data || []);
    } catch (err) {
      console.error("Failed to load properties:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to load your properties. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    Promise.resolve().then(loadProperties);
  }, [navigate, loadProperties]);

  function openAddModal() {
    setSelectedProperty(null);
    setModalMode("add");
    setModalOpen(true);
  }

  function openEditModal(property) {
    setSelectedProperty(property);
    setModalMode("edit");
    setModalOpen(true);
  }

  function openViewModal(property) {
    setSelectedProperty(property);
    setModalMode("view");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelectedProperty(null);
  }

  async function handleDelete(property) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${property.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(property.id);

      await api.delete(`/properties/${property.id}`);

      setProperties((current) =>
        current.filter((item) => item.id !== property.id)
      );
    } catch (err) {
      console.error("Failed to delete property:", err);

      alert(
        err.response?.data?.message ||
          "Unable to delete this property. Please try again."
      );
    } finally {
      setDeleteLoading(null);
    }
  }

  function handleModalSuccess(savedProperty) {
    if (!savedProperty) {
      loadProperties();
      closeModal();
      return;
    }

    if (modalMode === "edit") {
      setProperties((current) =>
        current.map((property) =>
          property.id === savedProperty.id ? savedProperty : property
        )
      );
    } else {
      setProperties((current) => [savedProperty, ...current]);
    }

    closeModal();
  }

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return properties;

    return properties.filter((property) => {
      const searchableText = [
        property.title,
        property.address,
        property.city,
        property.state,
        property.pincode,
        String(property.id),
        String(property.monthlyRent),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [properties, search]);

  function getPropertyStatus(property) {
    const activeAgreement = agreements.find(
      (agreement) =>
        agreement.property?.id === property.id &&
        agreement.status === "ACTIVE"
    );

    if (activeAgreement) {
      return {
        label: "Occupied",
        className: "occupied",
      };
    }

    return {
      label: "Available",
      className: "available",
    };
  }

  const totalRent = properties.reduce(
    (sum, property) => sum + Number(property.monthlyRent || 0),
    0
  );

  const occupiedCount = properties.filter((property) => {
    return agreements.some(
      (agreement) =>
        agreement.property?.id === property.id &&
        agreement.status === "ACTIVE"
    );
  }).length;

  if (loading) {
    return (
      <div className="properties-page">
        <div className="properties-loading">
          <div className="properties-loader"></div>
          <p>Loading your properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="properties-page">
      <header className="properties-header">
        <div className="properties-breadcrumb">
          <span>RentGuard</span>
          <span className="breadcrumb-divider">/</span>
          <span>Properties</span>
        </div>

        <div className="properties-header-main">
          <div>
            <p className="properties-eyebrow">PROPERTY PORTFOLIO</p>

            <h1>
              Your <em>properties.</em>
            </h1>

            <p className="properties-subtitle">
              Manage your rental portfolio, occupancy and property details.
            </p>
          </div>

          <div className="properties-user">
            <div className="properties-user-avatar">
              {currentUser?.email?.charAt(0)?.toUpperCase() || "R"}
            </div>

            <div>
              <span className="properties-user-label">SIGNED IN AS</span>
              <strong>{currentUser?.email || "Landlord"}</strong>
            </div>
          </div>
        </div>
      </header>

      <section className="property-summary">
        <div className="property-summary-item">
          <span>Total properties</span>
          <strong>{properties.length}</strong>
        </div>

        <div className="property-summary-item">
          <span>Occupied</span>
          <strong>{occupiedCount}</strong>
        </div>

        <div className="property-summary-item">
          <span>Available</span>
          <strong>{properties.length - occupiedCount}</strong>
        </div>

        <div className="property-summary-item">
          <span>Monthly portfolio rent</span>
          <strong>{formatCurrency(totalRent)}</strong>
        </div>
      </section>

      <section className="properties-toolbar">
        <div className="property-search">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <circle cx="11" cy="11" r="7"></circle>
            <path d="m20 20-4-4"></path>
          </svg>

          <input
            type="text"
            placeholder="Search properties, locations or ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch("")}
              type="button"
            >
              ×
            </button>
          )}
        </div>

        <button className="add-property-button" onClick={openAddModal}>
          <span>+</span>
          Add property
        </button>
      </section>

      {error && (
        <div className="properties-error">
          <span>{error}</span>
          <button onClick={loadProperties}>Retry</button>
        </div>
      )}

      {!error && filteredProperties.length === 0 && (
        <div className="properties-empty">
          {properties.length === 0 ? (
            <>
              <div className="empty-icon">⌂</div>

              <h2>Your portfolio starts here.</h2>

              <p>
                Add your first rental property to begin managing your portfolio
                with RentGuard.
              </p>

              <button onClick={openAddModal}>Add your first property</button>
            </>
          ) : (
            <>
              <div className="empty-icon">⌕</div>

              <h2>No properties found.</h2>

              <p>
                Try searching with a different property name, location or ID.
              </p>

              <button onClick={() => setSearch("")}>Clear search</button>
            </>
          )}
        </div>
      )}

      {filteredProperties.length > 0 && (
        <section className="properties-grid">
          {filteredProperties.map((property, index) => {
            const status = getPropertyStatus(property);

            return (
              <article className="property-card" key={property.id}>
                <div className={`property-card-visual visual-${index % 4}`}>
                  <div className="property-card-overlay"></div>

                  <div className="property-card-top">
                    <span className="property-id">
                      PROPERTY {String(property.id).padStart(2, "0")}
                    </span>

                    <span className={`property-status ${status.className}`}>
                      <i></i>
                      {status.label}
                    </span>
                  </div>

                  <div className="property-visual-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>

                <div className="property-card-content">
                  <div className="property-card-heading">
                    <div>
                      <p className="property-type">RENTAL PROPERTY</p>

                      <h2>{property.title}</h2>
                    </div>

                    <button
                      className="property-more"
                      type="button"
                      onClick={() => openViewModal(property)}
                      title="View property"
                    >
                      →
                    </button>
                  </div>

                  <div className="property-location">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"></path>
                      <circle cx="12" cy="10" r="2.5"></circle>
                    </svg>

                    <span>
                      {formatLocation(property) || property.address}
                    </span>
                  </div>

                  <div className="property-card-divider"></div>

                  <div className="property-card-details">
                    <div>
                      <span>MONTHLY RENT</span>
                      <strong>{formatCurrency(property.monthlyRent)}</strong>
                    </div>

                    <div>
                      <span>PINCODE</span>
                      <strong>{property.pincode || "—"}</strong>
                    </div>
                  </div>

                  <div className="property-card-actions">
                    <button
                      type="button"
                      className="property-view-button"
                      onClick={() => openViewModal(property)}
                    >
                      View property
                    </button>

                    <button
                      type="button"
                      className="property-edit-button"
                      onClick={() => openEditModal(property)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="property-delete-button"
                      onClick={() => handleDelete(property)}
                      disabled={deleteLoading === property.id}
                    >
                      {deleteLoading === property.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {modalOpen && <PropertyModal
        isOpen={modalOpen}
        mode={modalMode}
        property={selectedProperty}
        onClose={closeModal}
        onSuccess={handleModalSuccess}
      />}
    </div>
  );
}
