
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
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

    if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    setSubmitting(true);
    const result = await login(formData.phone, formData.password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || "Login failed.");
      return;
    }

    navigate("/dashboard");
  }

  return (
    <>
      <PageHeader
        title="Farmer Login"
        subtitle="Login to access your farmer account."
      />

      <div className="container section">
        <div className="card form-card">
          <h2>Login to Your Account</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="phone">Mobile Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter 10-digit mobile number"
                maxLength="10"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting}
            >
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="form-note">
            New here? <Link to="/register">Create a farmer account</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
