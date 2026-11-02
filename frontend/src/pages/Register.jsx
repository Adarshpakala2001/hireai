
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
  BriefcaseBusiness,
  Building2,
  Globe,
  ChevronLeft,
} from "lucide-react";

import api from "../services/api";
import GoogleSignIn from "../components/GoogleSignIn";

function Register() {
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
    company_name: "",
    designation: "",
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

  function selectAccount(type) {
    setAccountType(type);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!accountType) {
      setError("Please select an account type.");
      return;
    }

    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (
      accountType === "RECRUITER" &&
      (!formData.company_name.trim() ||
        !formData.designation.trim())
    ) {
      setError("Please provide your company and designation.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        password2: formData.password2,
        role: accountType,
        company_name: formData.company_name,
        designation: formData.designation,
      };

      await api.post("/auth/register/", payload);

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error("Registration failed:", err);

      const responseData = err.response?.data;

      if (responseData) {
        const firstError = Object.entries(responseData).find(
          ([key]) => key !== "non_field_errors"
        );

        if (firstError) {
          const [field, messages] = firstError;

          setError(
            `${field.replaceAll("_", " ")}: ${
              Array.isArray(messages)
                ? messages.join(" ")
                : messages
            }`
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
            {accountType === "CANDIDATE"
              ? "CANDIDATE ACCOUNT"
              : accountType === "RECRUITER"
              ? "RECRUITER ACCOUNT"
              : "CREATE YOUR ACCOUNT"}
          </span>

          <h1>
            {accountType
              ? "Create your account."
              : "Join HireAI today."}
          </h1>

          <p>
            {accountType === "CANDIDATE"
              ? "Discover opportunities, showcase your skills, and manage your job applications."
              : accountType === "RECRUITER"
              ? "Find talented professionals, manage job openings, and simplify your hiring process."
              : "Your AI-powered platform for smarter recruitment and career opportunities."}
          </p>
        </div>

        {/* Account Type Selection */}
        {!accountType && (
          <section className="register-card">
            <h2>Choose your account type</h2>

            <p>
              Tell us how you plan to use HireAI.
            </p>

            <div className="register-account-options">

              {/* Candidate */}
              <button
                type="button"
                className="register-account-option"
                onClick={() => selectAccount("CANDIDATE")}
              >
                <span className="register-account-icon candidate-icon">
                  <User size={26} />
                </span>

                <strong>Candidate / Job Seeker</strong>

                <span>
                  Explore jobs, upload resumes, apply for
                  opportunities, and track your applications.
                </span>

                <span className="register-option-action">
                  Continue as Candidate
                  <ArrowRight size={17} />
                </span>
              </button>

              {/* Recruiter */}
              <button
                type="button"
                className="register-account-option"
                onClick={() => selectAccount("RECRUITER")}
              >
                <span className="register-account-icon recruiter-icon">
                  <BriefcaseBusiness size={26} />
                </span>

                <strong>Employer / Recruiter / HR</strong>

                <span>
                  Create job openings, review candidates,
                  and manage your recruitment pipeline.
                </span>

                <span className="register-option-action">
                  Continue as Recruiter
                  <ArrowRight size={17} />
                </span>
              </button>

            </div>

            {error && (
              <div className="register-message register-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="register-login">
              <span>Already have an account?</span>
              <Link to="/login">Sign in</Link>
            </div>
          </section>
        )}

        {/* Registration Form */}
        {accountType && (
          <section className="register-card">

            <button
              type="button"
              className="register-back-button"
              onClick={() => selectAccount("")}
            >
              <ChevronLeft size={17} />
              Change account type
            </button>

            {/* Google Sign-in */}
            <div className="register-social-section">
              <p>Continue with your preferred account</p>

              {accountType === "CANDIDATE" ? (
                <GoogleSignIn onError={setError} />
              ) : (
                <div className="register-message">
                  <AlertCircle size={18} />
                  <span>
                    Google registration is currently available
                    for candidate accounts. Please use email
                    registration to create a recruiter account.
                  </span>
                </div>
              )}
            </div>

            <div className="register-divider">
              <span>OR REGISTER WITH EMAIL</span>
            </div>

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

              {/* Recruiter Details */}
              {accountType === "RECRUITER" && (
                <>
                  <div className="register-field">
                    <label htmlFor="company_name">
                      Company Name
                    </label>

                    <div className="register-input-wrapper">
                      <Building2 size={17} />

                      <input
                        id="company_name"
                        name="company_name"
                        type="text"
                        placeholder="Enter your organization"
                        value={formData.company_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="register-field">
                    <label htmlFor="designation">
                      Designation
                    </label>

                    <div className="register-input-wrapper">
                      <BriefcaseBusiness size={17} />

                      <input
                        id="designation"
                        name="designation"
                        type="text"
                        placeholder="e.g. HR Manager, Recruiter"
                        value={formData.designation}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

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

                {!loading && <ArrowRight size={18} />}
              </button>

            </form>

            <div className="register-login">
              <span>Already have an account?</span>
              <Link to="/login">Sign in</Link>
            </div>

          </section>
        )}

        {/* Footer */}
        <p className="register-footer">
          By creating an account, you agree to use HireAI
          responsibly and provide accurate information.
        </p>

      </section>
    </main>
  );
}

export default Register;
