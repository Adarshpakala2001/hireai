import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Search,
  Briefcase,
  MapPin,
  Users,
  Edit3,
  Trash2,
  XCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import api from "../services/api";

function AdminJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get("/jobs/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs(response.data);
    } catch (err) {
      console.error("Unable to load jobs:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
        return;
      }

      setError("Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  }

  async function updateJobStatus(job, newStatus) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const response = await api.patch(
        `/jobs/${job.id}/`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobs((previous) =>
        previous.map((item) =>
          item.id === job.id
            ? response.data
            : item
        )
      );
    } catch (err) {
      console.error(
        "Unable to update job:",
        err
      );

      setError(
        "Unable to update the job status."
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteJob(job) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${job.title}"?`
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      await api.delete(
        `/jobs/${job.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobs((previous) =>
        previous.filter(
          (item) => item.id !== job.id
        )
      );
    } catch (err) {
      console.error(
        "Unable to delete job:",
        err
      );

      setError(
        "Unable to delete the job."
      );
    } finally {
      setActionLoading(false);
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      job.department
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      job.location
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <main className="admin-jobs-loading">
        <Briefcase size={30} />
        <p>Loading jobs...</p>
      </main>
    );
  }

  return (
    <main className="admin-jobs-page">

      {/* Header */}
      <header className="admin-jobs-header">

        <div>

          <Link
            to="/admin/dashboard"
            className="admin-back-link"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <span className="dashboard-label">
            JOB MANAGEMENT
          </span>

          <h1>
            Manage jobs.
          </h1>

          <p>
            Create, publish, update, and manage
            your recruitment opportunities.
          </p>

        </div>


        <Link
          to="/admin/jobs/create"
          className="admin-create-job-button"
        >
          <Plus size={18} />
          Create Job
        </Link>

      </header>


      {/* Error */}
      {error && (
        <div className="admin-jobs-error">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}


      {/* Toolbar */}
      <section className="admin-jobs-toolbar">

        <div className="admin-job-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <XCircle size={17} />
            </button>
          )}

        </div>


        <div className="admin-job-filters">

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
              statusFilter === "OPEN"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("OPEN")
            }
          >
            Open
          </button>

          <button
            type="button"
            className={
              statusFilter === "DRAFT"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("DRAFT")
            }
          >
            Draft
          </button>

          <button
            type="button"
            className={
              statusFilter === "CLOSED"
                ? "active"
                : ""
            }
            onClick={() =>
              setStatusFilter("CLOSED")
            }
          >
            Closed
          </button>

        </div>


        <button
          type="button"
          className="admin-jobs-refresh"
          onClick={fetchJobs}
        >
          <RefreshCw size={17} />
          Refresh
        </button>

      </section>


      {/* Jobs */}
      <section className="admin-jobs-list-panel">

        <div className="admin-jobs-list-header">

          <div>

            <span>
              {filteredJobs.length}{" "}
              {filteredJobs.length === 1
                ? "JOB"
                : "JOBS"}
            </span>

            <h2>
              Job Opportunities
            </h2>

          </div>

        </div>


        {filteredJobs.length === 0 ? (
          <div className="admin-jobs-empty">

            <Briefcase size={38} />

            <h3>
              No jobs found
            </h3>

            <p>
              Try changing your search or
              create a new job opportunity.
            </p>

            <Link
              to="/admin/jobs/create"
              className="admin-create-job-button"
            >
              <Plus size={17} />
              Create Job
            </Link>

          </div>
        ) : (

          <div className="admin-job-cards">

            {filteredJobs.map((job) => (

              <article
                className="admin-job-card"
                key={job.id}
              >

                {/* Main */}
                <div className="admin-job-card-main">

                  <div className="admin-job-card-icon">
                    <Briefcase size={22} />
                  </div>

                  <div className="admin-job-card-info">

                    <div className="admin-job-title-row">

                      <h3>
                        {job.title}
                      </h3>

                      <span
                        className={`admin-status status-${job.status.toLowerCase()}`}
                      >
                        {job.status}
                      </span>

                    </div>

                    <p>
                      {job.department ||
                        "General"}
                      {" • "}
                      {job.location ||
                        "Remote"}
                    </p>

                    <div className="admin-job-details">

                      <span>
                        {job.employment_type
                          ?.replace("_", " ")}
                      </span>

                      <span>
                        {job.experience_required ||
                          "Experience not specified"}
                      </span>

                      {job.salary_range && (
                        <span>
                          {job.salary_range}
                        </span>
                      )}

                    </div>

                    <div className="admin-job-skills">

                      {job.skills
                        ?.split(",")
                        .slice(0, 5)
                        .map((skill) => (
                          <span key={skill}>
                            {skill.trim()}
                          </span>
                        ))}

                    </div>

                  </div>

                </div>


                {/* Meta */}
                <div className="admin-job-card-meta">

                  <div className="admin-job-application-count">

                    <Users size={17} />

                    <strong>
                      {job.application_count ??
                        0}
                    </strong>

                    <span>
                      {job.application_count === 1
                        ? "Application"
                        : "Applications"}
                    </span>

                  </div>


                  <div className="admin-job-actions">

                    <Link
                      to={`/admin/jobs/${job.id}/edit`}
                      className="admin-job-action edit"
                    >
                      <Edit3 size={16} />
                      Edit
                    </Link>


                    <Link
                      to={`/admin/applications?job=${job.id}`}
                      className="admin-job-action view"
                    >
                      <Users size={16} />
                      Applications
                    </Link>


                    {job.status === "OPEN" ? (

                      <button
                        type="button"
                        className="admin-job-action close"
                        disabled={actionLoading}
                        onClick={() =>
                          updateJobStatus(
                            job,
                            "CLOSED"
                          )
                        }
                      >
                        <XCircle size={16} />
                        Close
                      </button>

                    ) : job.status === "CLOSED" ? (

                      <button
                        type="button"
                        className="admin-job-action publish"
                        disabled={actionLoading}
                        onClick={() =>
                          updateJobStatus(
                            job,
                            "OPEN"
                          )
                        }
                      >
                        <Briefcase size={16} />
                        Reopen
                      </button>

                    ) : (

                      <button
                        type="button"
                        className="admin-job-action publish"
                        disabled={actionLoading}
                        onClick={() =>
                          updateJobStatus(
                            job,
                            "OPEN"
                          )
                        }
                      >
                        <Briefcase size={16} />
                        Publish
                      </button>

                    )}


                    <button
                      type="button"
                      className="admin-job-action delete"
                      disabled={
                        actionLoading ||
                        job.application_count > 0
                      }
                      title={
                        job.application_count > 0
                          ? "Jobs with applications cannot be deleted."
                          : "Delete job"
                      }
                      onClick={() =>
                        deleteJob(job)
                      }
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}

export default AdminJobs;