import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  Briefcase,
  Users,
  FileText,
  Clock,
  CheckCircle,
  Plus,
  ArrowRight,
  LogOut,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import api from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await api.get(
        "/applications/admin/dashboard/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDashboard(response.data);
      setError("");
    } catch (err) {
      console.error(
        "Unable to load admin dashboard:",
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
          "You do not have permission to access the recruiter dashboard."
        );
        return;
      }

      setError(
        "Unable to load the recruiter dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/login");
  }

  if (loading) {
    return (
      <main className="admin-dashboard-loading">
        <Brain size={30} />
        <p>
          Loading recruiter workspace...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="admin-dashboard-page">
        <div className="admin-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </main>
    );
  }

  const stats = dashboard?.statistics || {};

  return (
    <main className="admin-dashboard-page">

      {/* Header */}
      <header className="admin-dashboard-header">

        <div>
          <span className="dashboard-label">
            RECRUITER WORKSPACE
          </span>

          <h1>
            Recruitment overview.
          </h1>

          <p>
            Manage jobs, candidates, applications,
            and AI-powered recruitment insights.
          </p>
        </div>

        <div className="admin-header-actions">

          <button
            type="button"
            className="admin-refresh-button"
            onClick={fetchDashboard}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </header>


      {/* Statistics */}
      <section className="admin-stats-grid">

        <AdminStatCard
          icon={<Briefcase size={22} />}
          label="Open Jobs"
          value={stats.open_jobs ?? 0}
        />

        <AdminStatCard
          icon={<FileText size={22} />}
          label="Applications"
          value={stats.total_applications ?? 0}
        />

        <AdminStatCard
          icon={<Users size={22} />}
          label="Candidates"
          value={stats.total_candidates ?? 0}
        />

        <AdminStatCard
          icon={<Clock size={22} />}
          label="Interviews"
          value={stats.interviews ?? 0}
        />

        <AdminStatCard
          icon={<CheckCircle size={22} />}
          label="Selected"
          value={stats.selected ?? 0}
        />

        <AdminStatCard
          icon={<Briefcase size={22} />}
          label="Total Jobs"
          value={stats.total_jobs ?? 0}
        />

      </section>


      {/* Main Content */}
      <section className="admin-dashboard-content">

        {/* Recent Applications */}
        <div className="admin-panel">

          <div className="admin-panel-header">

            <div>
              <span>
                RECRUITMENT ACTIVITY
              </span>

              <h2>
                Recent Applications
              </h2>
            </div>

            <Link
              to="/admin/applications"
              className="admin-panel-link"
            >
              View All
              <ArrowRight size={16} />
            </Link>

          </div>


          <div className="admin-application-list">

            {dashboard?.recent_applications?.length > 0 ? (
              dashboard.recent_applications.map(
                (application) => (
                  <div
                    className="admin-application-row"
                    key={application.id}
                  >

                    <div className="admin-application-avatar">
                      {application.candidate_name
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>

                    <div className="admin-application-info">

                      <strong>
                        {application.candidate_name}
                      </strong>

                      <span>
                        {application.job_title}
                      </span>

                    </div>

                    <span
                      className={`admin-status status-${application.status.toLowerCase()}`}
                    >
                      {application.status}
                    </span>

                  </div>
                )
              )
            ) : (
              <div className="admin-empty-state">
                No applications yet.
              </div>
            )}

          </div>

        </div>


        {/* Quick Actions */}
        <div className="admin-panel">

          <div className="admin-panel-header">

            <div>
              <span>
                MANAGEMENT
              </span>

              <h2>
                Quick Actions
              </h2>
            </div>

          </div>


          <div className="admin-quick-actions">

            <Link
              to="/admin/jobs/create"
              className="admin-quick-action"
            >
              <div className="admin-quick-icon">
                <Plus size={21} />
              </div>

              <div>
                <strong>
                  Create Job
                </strong>

                <span>
                  Publish a new job opportunity
                </span>
              </div>

              <ArrowRight size={17} />
            </Link>


            <Link
              to="/admin/jobs"
              className="admin-quick-action"
            >
              <div className="admin-quick-icon">
                <Briefcase size={21} />
              </div>

              <div>
                <strong>
                  Manage Jobs
                </strong>

                <span>
                  View and manage job openings
                </span>
              </div>

              <ArrowRight size={17} />
            </Link>


            <Link
              to="/admin/applications"
              className="admin-quick-action"
            >
              <div className="admin-quick-icon">
                <FileText size={21} />
              </div>

              <div>
                <strong>
                  Applications
                </strong>

                <span>
                  Review candidate applications
                </span>
              </div>

              <ArrowRight size={17} />
            </Link>


            <Link
              to="/admin/candidates"
              className="admin-quick-action"
            >
              <div className="admin-quick-icon">
                <Users size={21} />
              </div>

              <div>
                <strong>
                  Candidates
                </strong>

                <span>
                  Browse candidate profiles
                </span>
              </div>

              <ArrowRight size={17} />
            </Link>

          </div>

        </div>

      </section>


      {/* Recent Jobs */}
      <section className="admin-panel admin-jobs-panel">

        <div className="admin-panel-header">

          <div>
            <span>
              JOB MANAGEMENT
            </span>

            <h2>
              Recent Jobs
            </h2>
          </div>

          <Link
            to="/admin/jobs"
            className="admin-panel-link"
          >
            Manage Jobs
            <ArrowRight size={16} />
          </Link>

        </div>


        <div className="admin-jobs-list">

          {dashboard?.recent_jobs?.length > 0 ? (
            dashboard.recent_jobs.map((job) => (
              <div
                className="admin-job-row"
                key={job.id}
              >

                <div className="admin-job-main">

                  <div className="admin-job-icon">
                    <Briefcase size={20} />
                  </div>

                  <div>
                    <strong>
                      {job.title}
                    </strong>

                    <span>
                      {job.department || "General"}
                      {" • "}
                      {job.location || "Remote"}
                    </span>
                  </div>

                </div>


                <div className="admin-job-meta">

                  <span
                    className={`admin-status status-${job.status.toLowerCase()}`}
                  >
                    {job.status}
                  </span>

                  <span>
                    {job.application_count} applications
                  </span>

                </div>

              </div>
            ))
          ) : (
            <div className="admin-empty-state">
              No jobs created yet.
            </div>
          )}

        </div>

      </section>

    </main>
  );
}


function AdminStatCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="admin-stat-card">

      <div className="admin-stat-icon">
        {icon}
      </div>

      <div>
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>

    </div>
  )
}


export default AdminDashboard;