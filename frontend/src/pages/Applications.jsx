import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  FileText,
  Clock,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get("/applications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplications(response.data);
    } catch (err) {
      console.error("Unable to load applications:", err);
      setError("Unable to load your applications.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="applications-page">
      {/* Header */}
      <div className="applications-header">
        <div>
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <span className="dashboard-label">
            MY APPLICATIONS
          </span>

          <h1>Track your applications.</h1>

          <p>
            Review the jobs you've applied to and monitor
            the current status of each application.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={fetchApplications}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="profile-error">
          {error}
        </div>
      )}

      {/* Results */}
      <section className="applications-section">

        <div className="applications-summary">
          <div>
            <span className="dashboard-label">
              APPLICATION HISTORY
            </span>

            <h2>
              {loading
                ? "Loading..."
                : `${applications.length} ${
                    applications.length === 1
                      ? "application"
                      : "applications"
                  }`}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="applications-loading">
            <Briefcase size={30} />
            <p>Loading your applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="applications-empty">
            <FileText size={36} />

            <h3>No applications yet</h3>

            <p>
              Browse available jobs and submit your first
              application.
            </p>

            <Link
              to="/jobs"
              className="job-view-button"
            >
              Browse Jobs
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="applications-list">
            {applications.map((application) => (
              <article
                className="application-card"
                key={application.id}
              >
                <div className="application-main">

                  <div className="application-icon">
                    <Briefcase size={22} />
                  </div>

                  <div className="application-content">

                    <div className="application-top">
                      <span
                        className={`application-status status-${application.status.toLowerCase()}`}
                      >
                        {formatStatus(application.status)}
                      </span>

                      <span className="application-date">
                        <Clock size={14} />
                        {formatDate(
                          application.applied_at
                        )}
                      </span>
                    </div>

                    <h3>
                      {application.job_title}
                    </h3>

                    <div className="application-resume">
                      <FileText size={15} />

                      <span>
                        {application.resume_filename ||
                          "Resume submitted"}
                      </span>
                    </div>

                  </div>
                </div>

                <Link
                  to={`/jobs/${application.job}`}
                  className="application-view-button"
                >
                  View Job
                  <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        )}

      </section>
    </main>
  );
}

function formatStatus(status) {
  if (!status) {
    return "";
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(date) {
  if (!date) {
    return "Recently";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export default Applications;