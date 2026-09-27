import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  MapPin,
  Clock,
  Search,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      window.location.href = "/login";
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
      setError("Unable to load job opportunities.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();

    const token = localStorage.getItem("access_token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (location.trim()) {
        params.location = location.trim();
      }

      params.status = "OPEN";

      const response = await api.get("/jobs/", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setJobs(response.data);
    } catch (err) {
      console.error("Job search failed:", err);
      setError("Unable to search jobs.");
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setLocation("");
    fetchJobs();
  }

  return (
    <main className="jobs-page">
      {/* Header */}
      <div className="jobs-header">
        <div>
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <span className="dashboard-label">
            JOB OPPORTUNITIES
          </span>

          <h1>Find your next opportunity.</h1>

          <p>
            Explore open positions and discover opportunities
            that match your skills and experience.
          </p>
        </div>
      </div>

      {/* Search */}
      <section className="job-search-card">
        <form onSubmit={handleSearch} className="job-search-form">
          <div className="job-search-field">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search jobs, skills, technologies..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="job-search-field">
            <MapPin size={18} />

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>

          <button
            type="submit"
            className="primary-button"
          >
            <Search size={17} />
            Search
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={clearFilters}
          >
            <RefreshCw size={16} />
            Clear
          </button>
        </form>
      </section>

      {/* Messages */}
      {error && (
        <div className="profile-error">
          {error}
        </div>
      )}

      {/* Job Results */}
      <section className="jobs-results">
        <div className="jobs-results-header">
          <div>
            <span className="dashboard-label">
              AVAILABLE POSITIONS
            </span>

            <h2>
              {loading
                ? "Loading jobs..."
                : `${jobs.length} ${
                    jobs.length === 1 ? "position" : "positions"
                  } found`}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="jobs-loading">
            <Briefcase size={30} />
            <p>Loading job opportunities...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="jobs-empty">
            <Briefcase size={35} />

            <h3>No open positions found</h3>

            <p>
              Try changing your search criteria or check back
              later for new opportunities.
            </p>
          </div>
        ) : (
          <div className="jobs-list">
            {jobs.map((job) => (
              <article
                className="job-card"
                key={job.id}
              >
                <div className="job-card-main">
                  <div className="job-icon">
                    <Briefcase size={22} />
                  </div>

                  <div className="job-card-content">
                    <div className="job-card-top">
                      <span className="job-status">
                        OPEN
                      </span>

                      <span className="job-type">
                        {formatEmploymentType(
                          job.employment_type
                        )}
                      </span>
                    </div>

                    <h3>{job.title}</h3>

                    <div className="job-meta">
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
                    </div>

                    {job.skills && (
                      <div className="job-skills">
                        {job.skills
                          .split(",")
                          .map((skill) => (
                            <span key={skill}>
                              {skill.trim()}
                            </span>
                          ))}
                      </div>
                    )}

                    {job.salary_range && (
                      <div className="job-salary">
                        {job.salary_range}
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  to={`/jobs/${job.id}`}
                  className="job-view-button"
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

function formatEmploymentType(type) {
  if (!type) {
    return "";
  }

  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default Jobs;