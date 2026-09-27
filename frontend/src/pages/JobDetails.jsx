import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  Send,
  FileText,
} from "lucide-react";
import api from "../services/api";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);

  const [selectedResume, setSelectedResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJob();
    fetchResumes();
  }, [id]);

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

      setJob(response.data);
    } catch (err) {
      console.error("Unable to load job:", err);
      setError("Unable to load this job.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchResumes() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      return;
    }

    try {
      const response = await api.get(
        "/candidates/resumes/list/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResumes(response.data);

      if (response.data.length > 0) {
        setSelectedResume(response.data[0].id);
      }
    } catch (err) {
      console.error("Unable to load resumes:", err);
    }
  }

  async function handleApply(event) {
    event.preventDefault();

    if (!selectedResume) {
      setError("Please select a resume before applying.");
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setApplying(true);
    setMessage("");
    setError("");

    try {
      await api.post(
        "/applications/",
        {
          job: job.id,
          resume: selectedResume,
          cover_letter: coverLetter,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        "Application submitted successfully."
      );

      setCoverLetter("");
    } catch (err) {
      console.error("Application error:", err);

      const responseData = err.response?.data;

      if (responseData?.non_field_errors) {
        setError(responseData.non_field_errors[0]);
      } else if (responseData?.resume) {
        setError(responseData.resume[0]);
      } else if (responseData?.job) {
        setError(responseData.job[0]);
      } else {
        setError(
          "Unable to submit your application."
        );
      }
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <main className="dashboard-loading">
        <div>
          <Briefcase size={30} />
          <p>Loading job details...</p>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="job-details-page">
        <div className="jobs-empty">
          <Briefcase size={35} />
          <h3>Job not found</h3>
          <p>
            This job may no longer be available.
          </p>

          <Link
            to="/jobs"
            className="job-view-button"
          >
            Browse Jobs
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="job-details-page">

      {/* Back */}
      <Link to="/jobs" className="back-link">
        <ArrowLeft size={16} />
        Back to Jobs
      </Link>

      {/* Job Header */}
      <section className="job-details-header">

        <div className="job-details-icon">
          <Briefcase size={28} />
        </div>

        <div className="job-details-heading">

          <div className="job-card-top">
            <span className="job-status">
              {job.status}
            </span>

            <span className="job-type">
              {formatEmploymentType(
                job.employment_type
              )}
            </span>
          </div>

          <h1>{job.title}</h1>

          <div className="job-meta job-details-meta">

            {job.department && (
              <span>
                <Briefcase size={15} />
                {job.department}
              </span>
            )}

            {job.location && (
              <span>
                <MapPin size={15} />
                {job.location}
              </span>
            )}

            {job.experience_required && (
              <span>
                <Clock size={15} />
                {job.experience_required}
              </span>
            )}

            {job.salary_range && (
              <span>
                <DollarSign size={15} />
                {job.salary_range}
              </span>
            )}

          </div>
        </div>
      </section>

      <div className="job-details-layout">

        {/* Main Content */}
        <section className="job-details-content">

          {job.skills && (
            <div className="job-detail-section">

              <h2>Required Skills</h2>

              <div className="job-skills">
                {job.skills
                  .split(",")
                  .map((skill) => (
                    <span key={skill}>
                      {skill.trim()}
                    </span>
                  ))}
              </div>

            </div>
          )}

          <div className="job-detail-section">

            <h2>Job Description</h2>

            <p className="job-description">
              {job.description}
            </p>

          </div>

          {job.responsibilities && (
            <div className="job-detail-section">

              <h2>Responsibilities</h2>

              <div className="job-long-text">
                {job.responsibilities}
              </div>

            </div>
          )}

          {job.qualifications && (
            <div className="job-detail-section">

              <h2>Qualifications</h2>

              <div className="job-long-text">
                {job.qualifications}
              </div>

            </div>
          )}

        </section>

        {/* Apply */}
        <aside className="job-apply-card">

          <div className="job-apply-header">

            <div className="job-apply-icon">
              <Send size={20} />
            </div>

            <div>
              <h2>Apply for this role</h2>

              <p>
                Submit your resume and application.
              </p>
            </div>

          </div>

          {message && (
            <div className="profile-success">
              <CheckCircle size={17} />
              {message}
            </div>
          )}

          {error && (
            <div className="profile-error">
              {error}
            </div>
          )}

          <form
            className="job-apply-form"
            onSubmit={handleApply}
          >

            <div className="form-group">

              <label>
                <FileText size={15} />
                Select Resume
              </label>

              {resumes.length === 0 ? (
                <div className="no-resume-message">
                  <p>
                    You don't have a resume uploaded yet.
                  </p>

                  <Link to="/resumes">
                    Upload Resume
                  </Link>
                </div>
              ) : (
                <select
                  value={selectedResume}
                  onChange={(event) =>
                    setSelectedResume(
                      event.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Select a resume
                  </option>

                  {resumes.map((resume) => (
                    <option
                      key={resume.id}
                      value={resume.id}
                    >
                      {resume.original_filename ||
                        `Resume ${resume.id}`}
                    </option>
                  ))}
                </select>
              )}

            </div>

            <div className="form-group">

              <label>
                Cover Letter
                <span className="optional">
                  Optional
                </span>
              </label>

              <textarea
                rows="7"
                value={coverLetter}
                onChange={(event) =>
                  setCoverLetter(event.target.value)
                }
                placeholder="Introduce yourself and explain why you're interested in this role..."
              />

            </div>

            <button
              type="submit"
              className="primary-button apply-button"
              disabled={
                applying ||
                resumes.length === 0
              }
            >
              <Send size={17} />

              {applying
                ? "Submitting..."
                : "Submit Application"}
            </button>

          </form>

        </aside>

      </div>
    </main>
  );
}

function formatEmploymentType(type) {
  if (!type) {
    return "";
  }

  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default JobDetails;