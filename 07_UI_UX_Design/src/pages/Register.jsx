
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    password: "",
    village: "",
    district: "",
    landAcres: "",
    mainCrop: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (Object.entries(formData).some(
      ([name, value]) =>
        name === "password" ? !value : !String(value).trim()
    )) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (Number(formData.landAcres) <= 0) {
      setError("Enter a valid land area.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    const result = await register(formData);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || "Registration failed.");
      return;
    }

    // Registration successful: open Dashboard
    navigate("/dashboard", { replace: true });
  }

  const fields = [
    ["fullName", "Full Name", "text"],
    ["phone", "Mobile Number", "tel"],
    ["password", "Password (at least 6 characters)", "password"],
    ["village", "Village Name", "text"],
    ["district", "District", "text"],
    ["landAcres", "Land Area (Acres)", "number"],
    ["mainCrop", "Main Crop", "text"],
  ];

  return (
    <>
      <PageHeader
        title="Farmer Registration"
        subtitle="Create your account to access crop storage services."
      />

      <div className="container section">
        <div className="card form-card">
          <h2>Create Farmer Account</h2>

          {error && (
            <div className="alert alert-error">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {fields.map(([name, label, type]) => (
              <div className="form-group" key={name}>
                <label htmlFor={name}>{label}</label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  minLength={name === "password" ? 6 : undefined}
                  autoComplete={name === "password" ? "new-password" : undefined}
                  min={type === "number" ? "0.01" : undefined}
                  step={type === "number" ? "any" : undefined}
                />
              </div>
            ))}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting}
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Register;
