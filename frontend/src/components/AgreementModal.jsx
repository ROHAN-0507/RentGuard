import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  propertyId: "",
  tenantId: "",
  monthlyRent: "",
  securityDeposit: "",
  startDate: "",
  endDate: "",
};

function formatDateForInput(date) {
  if (!date) return "";

  return String(date).slice(0, 10);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export default function AgreementModal({
  isOpen,
  mode = "add",
  agreement,
  properties,
  tenants,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);

  const isView = mode === "view";
  const isEdit = mode === "edit";

  useEffect(() => {
    if (!isOpen) return;

    if (agreement) {
      setForm({
        propertyId: agreement.property?.id || "",
        tenantId: agreement.tenant?.id || "",
        monthlyRent: agreement.monthlyRent ?? "",
        securityDeposit: agreement.securityDeposit ?? "",
        startDate: formatDateForInput(agreement.startDate),
        endDate: formatDateForInput(agreement.endDate),
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
    setApiError("");
  }, [isOpen, agreement]);

  if (!isOpen) return null;

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setApiError("");
  }

  function validate() {
    const nextErrors = {};

    if (!form.propertyId) {
      nextErrors.propertyId = "Select a property.";
    }

    if (!form.tenantId) {
      nextErrors.tenantId = "Select a tenant.";
    }

    if (
      form.monthlyRent === "" ||
      Number(form.monthlyRent) <= 0
    ) {
      nextErrors.monthlyRent = "Enter a valid monthly rent.";
    }

    if (
      form.securityDeposit === "" ||
      Number(form.securityDeposit) < 0
    ) {
      nextErrors.securityDeposit =
        "Enter a valid security deposit.";
    }

    if (!form.startDate) {
      nextErrors.startDate = "Select a start date.";
    }

    if (!form.endDate) {
      nextErrors.endDate = "Select an end date.";
    }

    if (
      form.startDate &&
      form.endDate &&
      new Date(form.endDate) <= new Date(form.startDate)
    ) {
      nextErrors.endDate =
        "End date must be after the start date.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isView) return;

    if (!validate()) return;

    try {
      setSaving(true);
      setApiError("");

      const payload = {
        monthlyRent: Number(form.monthlyRent),
        securityDeposit: Number(form.securityDeposit),
        startDate: form.startDate,
        endDate: form.endDate,
      };

      let response;

      if (isEdit) {
        response = await api.put(
          `/agreements/${agreement.id}`,
          payload
        );
      } else {
        response = await api.post(
          `/agreements?propertyId=${form.propertyId}&tenantId=${form.tenantId}`,
          payload
        );
      }

      onSuccess(response.data);
    } catch (err) {
      console.error("Agreement save failed:", err);

      setApiError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to save the agreement."
      );
    } finally {
      setSaving(false);
    }
  }

  const title = isView
    ? "Agreement details"
    : isEdit
    ? "Edit agreement"
    : "Create agreement";

  const selectedProperty = properties?.find(
    (property) => String(property.id) === String(form.propertyId)
  );

  const selectedTenant = tenants?.find(
    (tenant) => String(tenant.id) === String(form.tenantId)
  );

  return (
    <div
      className="agreement-modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="agreement-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="agreement-modal-header">
          <div>
            <span className="agreement-modal-eyebrow">
              RENTAL AGREEMENT
            </span>

            <h2>{title}</h2>
          </div>

          <button
            type="button"
            className="agreement-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="agreement-modal-line"></div>

        {apiError && (
          <div className="agreement-modal-error">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="agreement-form-grid">
            <div className="agreement-field">
              <label>PROPERTY</label>

              <select
                name="propertyId"
                value={form.propertyId}
                onChange={handleChange}
                disabled={isView || isEdit}
              >
                <option value="">Select property</option>

                {properties?.map((property) => (
                  <option
                    key={property.id}
                    value={property.id}
                  >
                    {property.title} — {property.city}
                  </option>
                ))}
              </select>

              {errors.propertyId && (
                <small>{errors.propertyId}</small>
              )}
            </div>

            <div className="agreement-field">
              <label>TENANT</label>

              <select
                name="tenantId"
                value={form.tenantId}
                onChange={handleChange}
                disabled={isView || isEdit}
              >
                <option value="">Select tenant</option>

                {tenants?.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name || tenant.email}
                  </option>
                ))}
              </select>

              {errors.tenantId && (
                <small>{errors.tenantId}</small>
              )}
            </div>

            <div className="agreement-field">
              <label>MONTHLY RENT (₹)</label>

              <input
                name="monthlyRent"
                type="number"
                min="1"
                value={form.monthlyRent}
                onChange={handleChange}
                disabled={isView}
              />

              {errors.monthlyRent && (
                <small>{errors.monthlyRent}</small>
              )}
            </div>

            <div className="agreement-field">
              <label>SECURITY DEPOSIT (₹)</label>

              <input
                name="securityDeposit"
                type="number"
                min="0"
                value={form.securityDeposit}
                onChange={handleChange}
                disabled={isView}
              />

              {errors.securityDeposit && (
                <small>{errors.securityDeposit}</small>
              )}
            </div>

            <div className="agreement-field">
              <label>START DATE</label>

              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                disabled={isView}
              />

              {errors.startDate && (
                <small>{errors.startDate}</small>
              )}
            </div>

            <div className="agreement-field">
              <label>END DATE</label>

              <input
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                disabled={isView}
              />

              {errors.endDate && (
                <small>{errors.endDate}</small>
              )}
            </div>
          </div>

          {isView && agreement && (
            <div className="agreement-view-summary">
              <div>
                <span>PROPERTY</span>
                <strong>
                  {selectedProperty?.title ||
                    agreement.property?.title ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>TENANT</span>
                <strong>
                  {selectedTenant?.name ||
                    agreement.tenant?.name ||
                    agreement.tenant?.email ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>STATUS</span>
                <strong>{agreement.status}</strong>
              </div>

              <div>
                <span>MONTHLY RENT</span>
                <strong>
                  {formatCurrency(agreement.monthlyRent)}
                </strong>
              </div>
            </div>
          )}

          <div className="agreement-modal-footer">
            <button
              type="button"
              className="agreement-modal-cancel"
              onClick={onClose}
            >
              {isView ? "Close" : "Cancel"}
            </button>

            {!isView && (
              <button
                type="submit"
                className="agreement-modal-submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : isEdit
                  ? "Save changes"
                  : "Create agreement"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}