import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  User,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register/", formData);

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error(
        "Registration failed:",
        err
      );

      const responseData = err.response?.data;

      if (responseData) {
        if (responseData.username) {
          setError(
            `Username: ${responseData.username.join(" ")}`
          );
        } else if (responseData.email) {
          setError(
            `Email: ${responseData.email.join(" ")}`
          );
        } else if (responseData.password) {
          setError(
            `Password: ${responseData.password.join(" ")}`
          );
        } else if (responseData.detail) {
          setError(responseData.detail);
        } else {
          setError(
            "Unable to create your account. Please check your details."
          );
        }
      } else {
        setError(
          "Unable to connect to HireAI. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">

      <section className="register-container">

        {/* Header */}
        <div className="register-header">

          <div className="register-logo">
            <span className="register-logo-icon">
              <Brain size={25} />
            </span>

            <span>HireAI</span>
          </div>

          <span className="dashboard-label">
            CANDIDATE ACCOUNT
          </span>

          <h1>
            Create your account.
          </h1>

          <p>
            Build your profile, upload your resume,
            analyze job matches, and manage your
            applications with HireAI.
          </p>

        </div>


        {/* Form Card */}
        <section className="register-card">

          <form onSubmit={handleSubmit}>

            {/* Name */}
            <div className="register-form-row">

              <div className="register-field">

                <label htmlFor="first_name">
                  First Name
                </label>

                <div className="register-input-wrapper">
                  <User size={17} />

                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="First name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>


              <div className="register-field">

                <label htmlFor="last_name">
                  Last Name
                </label>

                <div className="register-input-wrapper">
                  <User size={17} />

                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Last name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

            </div>


            {/* Username */}
            <div className="register-field">

              <label htmlFor="username">
                Username
              </label>

              <div className="register-input-wrapper">
                <User size={17} />

                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>


            {/* Email */}
            <div className="register-field">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="register-input-wrapper">
                <Mail size={17} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>


            {/* Password */}
            <div className="register-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="register-input-wrapper">
                <Lock size={17} />

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </div>

              <span className="register-help">
                Use at least 8 characters.
              </span>

            </div>


            {/* Confirm Password */}
            <div className="register-field">

              <label htmlFor="password2">
                Confirm Password
              </label>

              <div className="register-input-wrapper">
                <Lock size={17} />

                <input
                  id="password2"
                  name="password2"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </div>

            </div>


            {/* Error */}
            {error && (
              <div className="register-message register-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}


            {/* Success */}
            {success && (
              <div className="register-message register-success">
                <CheckCircle size={18} />
                <span>{success}</span>
              </div>
            )}


            {/* Submit */}
            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>

          </form>


          {/* Login */}
          <div className="register-login">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
            </Link>

          </div>

        </section>


        {/* Footer Note */}
        <p className="register-footer">
          By creating an account, you can use HireAI
          to manage your candidate profile, resumes,
          job applications, and resume analysis.
        </p>

      </section>

    </main>
  );
}

export default Register;