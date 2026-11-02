
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, ArrowRight, ShieldCheck } from "lucide-react";

import api from "../services/api";
import GoogleSignIn from "../components/GoogleSignIn";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login/", formData);

      const { access, refresh } = response.data;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);

      const meResponse = await api.get("/auth/me/", {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      });

      const user = meResponse.data;

      if (user.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-container">

        {/* Left Side */}
        <section className="auth-info">

          <Link to="/" className="auth-brand">
            <span className="brand-icon">
              <Brain size={22} />
            </span>
            <span>HireAI</span>
          </Link>

          <div className="auth-info-content">

            <span className="auth-label">
              WELCOME BACK
            </span>

            <h1>
              Continue building
              <br />
              better hiring workflows.
            </h1>

            <p>
              Access your HireAI workspace to manage jobs,
              candidates, resumes, applications, and
              AI-assisted recruitment workflows.
            </p>

            <div className="auth-security">
              <ShieldCheck size={20} />

              <div>
                <strong>Secure authentication</strong>

                <span>
                  Your account is protected with
                  JWT-based authentication.
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* Right Side */}
        <section className="auth-card-wrapper">

          <div className="auth-card">

            <div className="auth-card-header">
              <h2>Sign in</h2>

              <p>
                Enter your credentials to access your account.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            {/* Google Sign-In */}
            <div className="auth-social-section">
              <GoogleSignIn onError={setError} />
            </div>

            {/* Divider */}
            <div className="auth-divider">
              <span>OR CONTINUE WITH EMAIL</span>
            </div>

            {/* Username and Password Login */}
            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >

              {/* Username */}
              <div className="form-group">

                <label htmlFor="username">
                  Username
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />

              </div>

              {/* Password */}
              <div className="form-group">

                <label htmlFor="password">
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}

                {!loading && (
                  <ArrowRight size={18} />
                )}
              </button>

            </form>

            {/* Register */}
            <div className="auth-footer">
              <span>Don't have an account?</span>

              <Link to="/register">
                Create one
              </Link>
            </div>

            {/* Back Home */}
            <Link to="/" className="back-home">
              ← Back to HireAI
            </Link>

          </div>
        </section>

      </div>
    </main>
  );
}

export default Login;
