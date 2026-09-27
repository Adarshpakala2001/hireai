import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  FileText,
  ListChecks,
  GraduationCap,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

import api from "../services/api";

function AdminCreateJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    employment_type: "FULL_TIME",
    experience_required: "",
    skills: "",
    description: "",
    responsibilities: "",
    qualifications: "",
    salary_range: "",
    status: "DRAFT",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event, publish = false) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    const payload = {
      ...formData,
      status: publish ? "OPEN" : "DRAFT",
    };

    try {
      await api.post("/jobs/", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(
        publish
          ? "Job published successfully."
          : "Job saved as draft successfully."
      );

      setTimeout(() => {
        navigate("/admin/jobs");
      }, 1000);

    } catch (err) {
      console.error("Create job error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to create jobs."
        );
        return;
      }

      if (err.response?.data) {
        const data = err.response.data;

        const validationErrors = Object.entries(data)
          .map(([field, value]) => {
            if (Array.isArray(value)) {
              return `${field}: ${value.join(", ")}`;
            }

            return `${field}: ${value}`;
          })
          .join(" | ");

        setError(
          validationErrors ||
          "Unable to create the job."
        );
      } else {
        setError(
          "Unable to connect to the server."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-create-job-page">

      {/* Header */}
      <header className="admin-create-job-header">

        <Link
          to="/admin/dashboard"
          className="admin-back-link"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div>
          <span className="dashboard-label">
            JOB MANAGEMENT
          </span>

          <h1>
            Create a new job.
          </h1>

          <p>
            Publish a job opportunity for candidates
            and make it available on the HireAI job board.
          </p>
        </div>

      </header>


      {/* Messages */}
      {error && (
        <div className="admin-form-message admin-form-error">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="admin-form-message admin-form-success">
          <CheckCircle size={19} />
          <span>{message}</span>
        </div>
      )}


      {/* Form */}
      <form
        className="admin-job-form"
        onSubmit={(event) => handleSubmit(event, false)}
      >

        {/* Basic Information */}
        <section className="admin-form-section">

          <div className="admin-form-section-header">

            <div className="admin-form-section-icon">
              <Briefcase size={21} />
            </div>

            <div>
              <h2>
                Basic Information
              </h2>

              <p>
                Define the position and employment details.
              </p>
            </div>

          </div>


          <div className="admin-form-grid">

            <div className="admin-form-group admin-form-full">

              <label htmlFor="title">
                Job Title *
              </label>

              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Junior Python Developer"
                value={formData.title}
                onChange={handleChange}
                required
              />

            </div>


            <div className="admin-form-group">

              <label htmlFor="department">
                Department
              </label>

              <input
                id="department"
                name="department"
                type="text"
                placeholder="e.g. Engineering"
                value={formData.department}
                onChange={handleChange}
              />

            </div>


            <div className="admin-form-group">

              <label htmlFor="location">
                Location
              </label>

              <div className="admin-input-icon-wrapper">

                <MapPin size={17} />

                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. Hyderabad / Remote"
                  value={formData.location}
                  onChange={handleChange}
                />

              </div>

            </div>


            <div className="admin-form-group">

              <label htmlFor="employment_type">
                Employment Type
              </label>

              <select
                id="employment_type"
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
              >
                <option value="FULL_TIME">
                  Full Time
                </option>

                <option value="PART_TIME">
                  Part Time
                </option>

                <option value="CONTRACT">
                  Contract
                </option>

                <option value="INTERNSHIP">
                  Internship
                </option>
              </select>

            </div>


            <div className="admin-form-group">

              <label htmlFor="experience_required">
                Experience Required
              </label>

              <div className="admin-input-icon-wrapper">

                <Clock size={17} />

                <input
                  id="experience_required"
                  name="experience_required"
                  type="text"
                  placeholder="e.g. 0-1 years"
                  value={formData.experience_required}
                  onChange={handleChange}
                />

              </div>

            </div>


            <div className="admin-form-group admin-form-full">

              <label htmlFor="salary_range">
                Salary Range
              </label>

              <div className="admin-input-icon-wrapper">

                <DollarSign size={17} />

                <input
                  id="salary_range"
                  name="salary_range"
                  type="text"
                  placeholder="e.g. 4-8 LPA"
                  value={formData.salary_range}
                  onChange={handleChange}
                />

              </div>

            </div>

          </div>

        </section>


        {/* Skills */}
        <section className="admin-form-section">

          <div className="admin-form-section-header">

            <div className="admin-form-section-icon">
              <ListChecks size={21} />
            </div>

            <div>
              <h2>
                Required Skills
              </h2>

              <p>
                Add the technical skills candidates should have.
              </p>
            </div>

          </div>


          <div className="admin-form-group">

            <label htmlFor="skills">
              Skills *
            </label>

            <input
              id="skills"
              name="skills"
              type="text"
              placeholder="Python, Django, REST API, SQL, Git"
              value={formData.skills}
              onChange={handleChange}
              required
            />

            <span className="admin-form-help">
              Separate skills with commas.
            </span>

          </div>

        </section>


        {/* Job Description */}
        <section className="admin-form-section">

          <div className="admin-form-section-header">

            <div className="admin-form-section-icon">
              <FileText size={21} />
            </div>

            <div>
              <h2>
                Job Description
              </h2>

              <p>
                Describe the role, responsibilities,
                and expectations.
              </p>
            </div>

          </div>


          <div className="admin-form-group">

            <label htmlFor="description">
              Job Description *
            </label>

            <textarea
              id="description"
              name="description"
              rows="8"
              placeholder="Describe the role, team, product, and what the candidate will work on..."
              value={formData.description}
              onChange={handleChange}
              required
            />

          </div>


          <div className="admin-form-group">

            <label htmlFor="responsibilities">
              Responsibilities
            </label>

            <textarea
              id="responsibilities"
              name="responsibilities"
              rows="7"
              placeholder={`Develop and maintain Python applications
Build REST APIs using Django
Work with SQL databases
Write clean and maintainable code
Collaborate with the development team`}
              value={formData.responsibilities}
              onChange={handleChange}
            />

            <span className="admin-form-help">
              You can enter each responsibility on a separate line.
            </span>

          </div>


          <div className="admin-form-group">

            <label htmlFor="qualifications">
              Qualifications
            </label>

            <textarea
              id="qualifications"
              name="qualifications"
              rows="7"
              placeholder={`Bachelor's degree in Computer Science or related field
Strong Python fundamentals
Understanding of REST APIs
Knowledge of SQL databases
Good problem-solving skills`}
              value={formData.qualifications}
              onChange={handleChange}
            />

          </div>

        </section>


        {/* Actions */}
        <section className="admin-job-form-actions">

          <Link
            to="/admin/dashboard"
            className="admin-cancel-button"
          >
            Cancel
          </Link>


          <button
            type="submit"
            className="admin-draft-button"
            disabled={loading}
          >
            <Save size={18} />

            {loading
              ? "Saving..."
              : "Save Draft"}
          </button>


          <button
            type="button"
            className="admin-publish-button"
            disabled={loading}
            onClick={(event) =>
              handleSubmit(event, true)
            }
          >
            <Send size={18} />

            {loading
              ? "Publishing..."
              : "Publish Job"}
          </button>

        </section>

      </form>

    </main>
  );
}

export default AdminCreateJob;