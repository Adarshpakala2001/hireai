import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Search,
  RefreshCw,
  Eye,
  Users,
  AlertCircle,
  XCircle,
} from "lucide-react";

import api from "../services/api";

function AdminApplications() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const jobFilter = searchParams.get("job");

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, jobFilter]);

  async function fetchApplications() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = {};

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      if (jobFilter) {
        params.job = jobFilter;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get(
        "/applications/admin/",
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplications(response.data);
    } catch (err) {
      console.error(
        "Unable to load applications:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to view applications."
        );
        return;
      }

      setError(
        "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    fetchApplications();
  }

  function clearSearch() {
    setSearch("");
    setTimeout(() => {
      fetchApplications();
    }, 0);
  }

  function formatDate(dateString) {
    if (!dateString) {
      return "-";
    }

    return new Date(dateString).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getScoreClass(score) {
    if (score === null || score === undefined) {
      return "score-none";
    }

    if (score >= 80) {
      return "score-high";
    }

    if (score >= 60) {
      return "score-medium";
    }

    return "score-low";
  }

  return (
    <main className="admin-applications-page">

      {/* Header */}
      <header className="admin-applications-header">

        <div>

          <Link
            to="/admin/dashboard"
            className="admin-back-link"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <span className="dashboard-label">
            RECRUITMENT ACTIVITY
          </span>

          <h1>
            Applications.
          </h1>

          <p>
            Review candidates, resumes, AI match
            analysis, and application progress.
          </p>

        </div>

      </header>


      {/* Error */}
      {error && (
        <div className="admin-applications-error">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}


      {/* Toolbar */}
      <section className="admin-applications-toolbar">

        <form
          className="admin-application-search"
          onSubmit={handleSearch}
        >

          <Search size={18} />

          <input
            type="text"
            placeholder="Search candidate, email, or job..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <XCircle size={17} />
            </button>
          )}

        </form>


        <div className="admin-application-filters">

          <button
            type="button"
            className={
              statusFilter === "ALL"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("ALL")
            }
          >
            All
          </button>

          <button
            type="button"
            className={
              statusFilter === "APPLIED"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("APPLIED")
            }
          >
            Applied
          </button>

          <button
            type="button"
            className={
              statusFilter === "REVIEWING"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("REVIEWING")
            }
          >
            Reviewing
          </button>

          <button
            type="button"
            className={
              statusFilter === "SHORTLISTED"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("SHORTLISTED")
            }
          >
            Shortlisted
          </button>

          <button
            type="button"
            className={
              statusFilter === "INTERVIEW"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("INTERVIEW")
            }
          >
            Interview
          </button>

          <button
            type="button"
            className={
              statusFilter === "SELECTED"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("SELECTED")
            }
          >
            Selected
          </button>

          <button
            type="button"
            className={
              statusFilter === "REJECTED"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("REJECTED")
            }
          >
            Rejected
          </button>

        </div>


        <button
          type="button"
          className="admin-applications-refresh"
          onClick={fetchApplications}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </section>


      {/* Results */}
      <section className="admin-applications-panel">

        <div className="admin-applications-panel-header">

          <div>

            <span>
              {applications.length}{" "}
              {applications.length === 1
                ? "APPLICATION"
                : "APPLICATIONS"}
            </span>

            <h2>
              Candidate Applications
            </h2>

          </div>

          {jobFilter && (
            <Link
              to="/admin/applications"
              className="admin-clear-job-filter"
            >
              Clear Job Filter
            </Link>
          )}

        </div>


        {loading ? (

          <div className="admin-applications-loading">
            <RefreshCw size={27} />
            <p>
              Loading applications...
            </p>
          </div>

        ) : applications.length === 0 ? (

          <div className="admin-applications-empty">

            <Users size={40} />

            <h3>
              No applications found
            </h3>

            <p>
              Applications submitted by candidates
              will appear here.
            </p>

          </div>

        ) : (

          <div className="admin-applications-table-wrapper">

            <table className="admin-applications-table">

              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job</th>
                  <th>Resume</th>
                  <th>Match</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {applications.map(
                  (application) => (

                    <tr
                      key={application.id}
                    >

                      {/* Candidate */}
                      <td>

                        <div className="admin-candidate-cell">

                          <div className="admin-candidate-avatar">
                            {application.candidate_name
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {application.candidate_name}
                            </strong>

                            <span>
                              {application.candidate_email ||
                                application.candidate_username}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* Job */}
                      <td>

                        <div className="admin-job-cell">

                          <strong>
                            {application.job_title}
                          </strong>

                        </div>

                      </td>


                      {/* Resume */}
                      <td>

                        <div className="admin-resume-cell">

                          <FileText size={17} />

                          <span>
                            {application.resume_filename ||
                              "No resume"}
                          </span>

                        </div>

                      </td>


                      {/* Match */}
                      <td>

                        {application.match_score !==
                        null &&
                        application.match_score !==
                        undefined ? (

                          <span
                            className={`admin-match-score ${getScoreClass(
                              application.match_score
                            )}`}
                          >
                            {application.match_score}%
                          </span>

                        ) : (

                          <span className="score-none">
                            Not analyzed
                          </span>

                        )}

                      </td>


                      {/* Status */}
                      <td>

                        <span
                          className={`admin-status status-${application.status.toLowerCase()}`}
                        >
                          {application.status}
                        </span>

                      </td>


                      {/* Date */}
                      <td>

                        <span className="admin-applied-date">
                          {formatDate(
                            application.applied_at
                          )}
                        </span>

                      </td>


                      {/* Action */}
                      <td>

                        <Link
                          to={`/admin/applications/${application.id}`}
                          className="admin-view-application"
                        >
                          <Eye size={16} />
                          View
                        </Link>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </main>
  );
}

export default AdminApplications;