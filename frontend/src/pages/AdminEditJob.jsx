
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  FileText,
  ListChecks,
  Save,
  AlertCircle,
} from "lucide-react";

import api from "../services/api";

const initialFormData = {
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
};

function AdminEditJob() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchJob() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await api.get(`/jobs/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!active) return;

        const job = response.data;

        setFormData({
          title: job.title || "",
          department: job.department || "",
          location: job.location || "",
          employment_type: job.employment_type || "FULL_TIME",
          experience_required: job.experience_required || "",
          skills: job.skills || "",
          description: job.description || "",
          responsibilities: job.responsibilities || "",
          qualifications: job.qualifications || "",
          salary_range: job.salary_range || "",
          status: job.status || "DRAFT",
        });
      } catch (err) {
        if (!active) return;

        console.error("Unable to fetch job:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          navigate("/login");
          return;
        }

        if (err.response?.status === 404) {
          setError(
            "Job not found or you do not have permission to edit it."
          );
        } else if (err.response?.status === 403) {
          setError("You do not have permission to edit this job.");
        } else {
          setError("Unable to load job details. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchJob();

    return () => {
      active = false;
    };
  }, [id, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setSaving(true);

    try {
      await api.patch(
        `/jobs/${id}/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/admin/jobs");
    } catch (err) {
      console.error("Unable to update job:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError("You do not have permission to update this job.");
      } else if (err.response?.status === 404) {
        setError("Job not found or access denied.");
      } else if (err.response?.data) {
        const messages = Object.entries(err.response.data)
          .map(([field, value]) => {
            return `${field}: ${
              Array.isArray(value) ? value.join(", ") : value
            }`;
          })
          .join(" | ");

        setError(messages || "Unable to update the job.");
      } else {
        setError("Unable to connect to the server.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="admin-create-job-page">
        <p>Loading job details...</p>
      </main>
    );
  }

  if (error && !formData.title && !formData.description) {
    return (
      <main className="admin-create-job-page">
        <div className="admin-form-message admin-form-error">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>

        <Link
          to="/admin/jobs"
          className="admin-back-link"
        >
          <ArrowLeft size={17} />
          Back to Jobs
        </Link>
      </main>
    );
  }

  return (
    <main className="admin-create-job-page">

      {/* Header */}
      <header className="admin-create-job-header">

        <Link
          to="/admin/jobs"
          className="admin-back-link"
        >
          <ArrowLeft size={17} />
          Back to Jobs
        </Link>

        <div>
          <span className="dashboard-label">
            JOB MANAGEMENT
          </span>

          <h1>Edit job.</h1>

          <p>
            Update job information, requirements,
            responsibilities, and publishing status.
          </p>
        </div>

      </header>

      {/* Error */}
      {error && (
        <div className="admin-form-message admin-form-error">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}

      {/* Edit Form */}
      <form
        className="admin-job-form"
        onSubmit={handleSubmit}
      >

        {/* Basic Information */}
        <section className="admin-form-section">

          <div className="admin-form-section-header">

            <div className="admin-form-section-icon">
              <Briefcase size={21} />
            </div>

            <div>
              <h2>Basic Information</h2>
              <p>Update the position and employment details.</p>
            </div>

          </div>

          <div className="admin-form-grid">

            <div className="admin-form-group admin-form-full">
              <label htmlFor="title">Job Title *</label>

              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="department">Department</label>

              <input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="location">Location</label>

              <div className="admin-input-icon-wrapper">
                <MapPin size={17} />

                <input
                  id="location"
                  name="location"
                  type="text"
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
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship</option>
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
                  value={formData.experience_required}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="admin-form-group admin-form-full">
              <label htmlFor="salary_range">Salary Range</label>

              <div className="admin-input-icon-wrapper">
                <DollarSign size={17} />

                <input
                  id="salary_range"
                  name="salary_range"
                  type="text"
                  value={formData.salary_range}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="status">Job Status</label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="DRAFT">Draft</option>
                <option value="OPEN">Open / Published</option>
                <option value="CLOSED">Closed</option>
              </select>
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
              <h2>Required Skills</h2>
              <p>Update the required technical skills.</p>
            </div>

          </div>

          <div className="admin-form-group">
            <label htmlFor="skills">Skills *</label>

            <input
              id="skills"
              name="skills"
              type="text"
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
              <h2>Job Description</h2>
              <p>Update the role and job expectations.</p>
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
              value={formData.responsibilities}
              onChange={handleChange}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="qualifications">
              Qualifications
            </label>

            <textarea
              id="qualifications"
              name="qualifications"
              rows="7"
              value={formData.qualifications}
              onChange={handleChange}
            />
          </div>

        </section>

        {/* Actions */}
        <section className="admin-job-form-actions">

          <Link
            to="/admin/jobs"
            className="admin-cancel-button"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="admin-publish-button"
            disabled={saving}
          >
            <Save size={18} />

            {saving ? "Saving Changes..." : "Save Changes"}
          </button>

        </section>

      </form>

    </main>
  );
}

export default AdminEditJob;
