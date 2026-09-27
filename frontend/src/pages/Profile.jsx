import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  Globe,
} from "lucide-react";

import api from "../services/api";

function Profile() {
  const [formData, setFormData] = useState({
    phone: "",
    location: "",
    headline: "",
    summary: "",
    skills: "",
    experience: "",
    education: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await api.get("/candidates/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFormData({
        phone: response.data.phone || "",
        location: response.data.location || "",
        headline: response.data.headline || "",
        summary: response.data.summary || "",
        skills: response.data.skills || "",
        experience: response.data.experience || "",
        education: response.data.education || "",
        linkedin_url: response.data.linkedin_url || "",
        github_url: response.data.github_url || "",
        portfolio_url: response.data.portfolio_url || "",
      });
    } catch (err) {
      setError("Unable to load your profile.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await api.patch(
        "/candidates/profile/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError("Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="dashboard-loading">
        <div>
          <User size={30} />
          <p>Loading your profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">

      <div className="profile-header">
        <div>
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <span className="dashboard-label">
            CANDIDATE PROFILE
          </span>

          <h1>Build your professional profile.</h1>

          <p>
            Keep your information updated so HireAI can better understand
            your experience and skills.
          </p>
        </div>
      </div>

      {message && (
        <div className="profile-success">
          {message}
        </div>
      )}

      {error && (
        <div className="profile-error">
          {error}
        </div>
      )}

      <form className="profile-form" onSubmit={handleSubmit}>

        {/* Basic Information */}
        <section className="profile-section">
          <div className="profile-section-header">
            <User size={21} />

            <div>
              <h2>Basic Information</h2>
              <p>Your contact and professional information.</p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-group">
              <label>Phone</label>

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your phone number"
              />
            </div>

            <div className="form-group">
              <label>Location</label>

              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
              />
            </div>

            <div className="form-group full-width">
              <label>Professional Headline</label>

              <input
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g. Python Developer | Django | AI"
              />
            </div>

            <div className="form-group full-width">
              <label>Professional Summary</label>

              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows="5"
                placeholder="Describe your professional background..."
              />
            </div>

            <div className="form-group full-width">
              <label>Skills</label>

              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                rows="3"
                placeholder="Python, Django, React, SQL, REST APIs..."
              />
            </div>

          </div>
        </section>

        {/* Experience */}
        <section className="profile-section">
          <div className="profile-section-header">
            <div className="section-number">02</div>

            <div>
              <h2>Experience</h2>
              <p>Describe your professional experience.</p>
            </div>
          </div>

          <div className="form-group">
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows="7"
              placeholder="Add your work experience..."
            />
          </div>
        </section>

        {/* Education */}
        <section className="profile-section">
          <div className="profile-section-header">
            <div className="section-number">03</div>

            <div>
              <h2>Education</h2>
              <p>Add your academic background.</p>
            </div>
          </div>

          <div className="form-group">
            <textarea
              name="education"
              value={formData.education}
              onChange={handleChange}
              rows="5"
              placeholder="Degree, university, graduation year..."
            />
          </div>
        </section>

        {/* Links */}
        <section className="profile-section">
          <div className="profile-section-header">
            <div className="section-number">04</div>

            <div>
              <h2>Professional Links</h2>
              <p>Connect your online professional presence.</p>
            </div>
          </div>

          <div className="form-grid">

            <div className="form-group">
              <label>LinkedIn</label>

              <input
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="form-group">
              <label>GitHub</label>

              <input
                name="github_url"
                value={formData.github_url}
                onChange={handleChange}
                placeholder="https://github.com/..."
              />
            </div>

            <div className="form-group full-width">
              <label>
                <Globe size={15} />
                Portfolio
              </label>

              <input
                name="portfolio_url"
                value={formData.portfolio_url}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
              />
            </div>

          </div>
        </section>

        {/* Save */}
        <div className="profile-submit">
          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            <Save size={17} />

            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>

      </form>

    </main>
  );
}

export default Profile;