import { useState } from "react";
import api from "../services/api";

const emptyForm = {
  title: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  monthlyRent: "",
  description: "",
};

export default function PropertyModal({
  isOpen,
  mode = "add",
  property,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState(() => property ? {
    title: property.title || "",
    address: property.address || "",
    city: property.city || "",
    state: property.state || "",
    pincode: property.pincode || "",
    monthlyRent: property.monthlyRent ?? "",
    description: property.description || "",
  } : emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const isView = mode === "view";
  const isEdit = mode === "edit";

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
  }

  function validate() {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Property title is required.";
    }

    if (!form.address.trim()) {
      nextErrors.address = "Address is required.";
    }

    if (!form.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!form.state.trim()) {
      nextErrors.state = "State is required.";
    }

    if (!form.pincode.trim()) {
      nextErrors.pincode = "Pincode is required.";
    } else if (!/^\d{6}$/.test(form.pincode.trim())) {
      nextErrors.pincode = "Enter a valid 6-digit pincode.";
    }

    if (
      form.monthlyRent === "" ||
      Number.isNaN(Number(form.monthlyRent)) ||
      Number(form.monthlyRent) <= 0
    ) {
      nextErrors.monthlyRent = "Enter a valid monthly rent.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isView) return;

    if (!validate()) return;

    try {
      setSubmitting(true);
      setApiError("");

      const payload = {
        title: form.title.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        monthlyRent: Number(form.monthlyRent),
        description: form.description.trim(),
      };

      let response;

      if (isEdit) {
        response = await api.put(`/properties/${property.id}`, payload);
      } else {
        response = await api.post("/properties", payload);
      }

      onSuccess(response.data);
    } catch (err) {
      console.error("Property save failed:", err);

      setApiError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to save the property. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const title = isView
    ? "Property details"
    : isEdit
    ? "Edit property"
    : "Add property";

  return (
    <div className="property-modal-backdrop" onMouseDown={onClose}>
      <div
        className="property-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="property-modal-header">
          <div>
            <span className="property-modal-eyebrow">
              {isView ? "PROPERTY DETAILS" : "PROPERTY PORTFOLIO"}
            </span>

            <h2>{title}</h2>
          </div>

          <button
            className="property-modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="property-modal-line"></div>

        {apiError && <div className="property-modal-error">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="property-form-grid">
            <div className="property-field property-field-full">
              <label htmlFor="title">PROPERTY TITLE</label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. RentGuard Apartment"
                value={form.title}
                onChange={handleChange}
                disabled={isView}
              />

              {errors.title && (
                <small className="field-error">{errors.title}</small>
              )}
            </div>

            <div className="property-field property-field-full">
              <label htmlFor="address">ADDRESS</label>

              <input
                id="address"
                name="address"
                type="text"
                placeholder="Street / building / locality"
                value={form.address}
                onChange={handleChange}
                disabled={isView}
              />

              {errors.address && (
                <small className="field-error">{errors.address}</small>
              )}
            </div>

            <div className="property-field">
              <label htmlFor="city">CITY</label>

              <input
                id="city"
                name="city"
                type="text"
                placeholder="Hyderabad"
                value={form.city}
                onChange={handleChange}
                disabled={isView}
              />

              {errors.city && (
                <small className="field-error">{errors.city}</small>
              )}
            </div>

            <div className="property-field">
              <label htmlFor="state">STATE</label>

              <input
                id="state"
                name="state"
                type="text"
                placeholder="Telangana"
                value={form.state}
                onChange={handleChange}
                disabled={isView}
              />

              {errors.state && (
                <small className="field-error">{errors.state}</small>
              )}
            </div>

            <div className="property-field">
              <label htmlFor="pincode">PINCODE</label>

              <input
                id="pincode"
                name="pincode"
                type="text"
                inputMode="numeric"
                maxLength="6"
                placeholder="500072"
                value={form.pincode}
                onChange={handleChange}
                disabled={isView}
              />

              {errors.pincode && (
                <small className="field-error">{errors.pincode}</small>
              )}
            </div>

            <div className="property-field">
              <label htmlFor="monthlyRent">MONTHLY RENT (₹)</label>

              <input
                id="monthlyRent"
                name="monthlyRent"
                type="number"
                min="1"
                placeholder="15000"
                value={form.monthlyRent}
                onChange={handleChange}
                disabled={isView}
              />

              {errors.monthlyRent && (
                <small className="field-error">{errors.monthlyRent}</small>
              )}
            </div>

            <div className="property-field property-field-full">
              <label htmlFor="description">DESCRIPTION</label>

              <textarea
                id="description"
                name="description"
                rows="4"
                placeholder="Describe the property..."
                value={form.description}
                onChange={handleChange}
                disabled={isView}
              />

              {errors.description && (
                <small className="field-error">{errors.description}</small>
              )}
            </div>
          </div>

          <div className="property-modal-footer">
            <button
              type="button"
              className="property-modal-cancel"
              onClick={onClose}
            >
              {isView ? "Close" : "Cancel"}
            </button>

            {!isView && (
              <button
                type="submit"
                className="property-modal-submit"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : isEdit
                  ? "Save changes"
                  : "Add property"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
