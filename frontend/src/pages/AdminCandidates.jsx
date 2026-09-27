import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  FileText,
  Users,
  RefreshCw,
  Eye,
  UserRound,
  AlertCircle,
} from "lucide-react";

import RecruiterNav from "../components/RecruiterNav";
import api from "../services/api";

function AdminCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [skill, setSkill] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchCandidates = async (showRefresh = false) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setError("Your session has expired. Please login again.");
      setLoading(false);
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (location.trim()) {
        params.location = location.trim();
      }

      if (skill.trim()) {
        params.skill = skill.trim();
      }

      const response = await api.get("/candidates/admin/", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCandidates(response.data.results || []);
    } catch (err) {
      console.error("Unable to fetch candidates:", err);

      if (err.response?.status === 401) {
        setError(
          "Your recruiter session is invalid or expired. Please login again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view candidate profiles."
        );
      } else {
        setError(
          "Unable to load candidates. Please make sure the backend is running."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchCandidates();
  };

  const handleClearFilters = () => {
    setSearch("");
    setLocation("");
    setSkill("");

    setTimeout(() => {
      fetchCandidates();
    }, 0);
  };

  const getInitials = (name) => {
    if (!name) {
      return "C";
    }

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (
      parts[0][0] + parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const getSkills = (skills) => {
    if (!skills) {
      return [];
    }

    return skills
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  return (
    <>
      <RecruiterNav />

      <div className="admin-candidates-page">
        {/* Header */}
        <div className="admin-candidates-header">
          <div>
            <div className="admin-candidates-title-row">
              <div className="admin-candidates-title-icon">
                <Users size={24} />
              </div>

              <div>
                <h1>Candidate Management</h1>

                <p>
                  Browse and manage candidate profiles.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="admin-candidates-refresh"
            onClick={() => fetchCandidates(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "admin-candidates-spin"
                  : ""
              }
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Search / Filters */}
        <form
          className="admin-candidates-filters"
          onSubmit={handleSearch}
        >
          <div className="admin-candidates-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search candidates..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="admin-candidates-filter">
            <MapPin size={17} />

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
            />
          </div>

          <div className="admin-candidates-filter">
            <Briefcase size={17} />

            <input
              type="text"
              placeholder="Skill"
              value={skill}
              onChange={(event) =>
                setSkill(event.target.value)
              }
            />
          </div>

          <button
            type="submit"
            className="admin-candidates-search-button"
          >
            <Search size={17} />
            Search
          </button>

          {(search || location || skill) && (
            <button
              type="button"
              className="admin-candidates-clear"
              onClick={handleClearFilters}
            >
              Clear
            </button>
          )}
        </form>

        {/* Error */}
        {error && (
          <div className="admin-candidates-error">
            <AlertCircle size={19} />
            <span>{error}</span>
          </div>
        )}

        {/* Results Header */}
        <div className="admin-candidates-results-header">
          <div>
            <h2>Candidates</h2>

            {!loading && (
              <span>
                {candidates.length} candidate
                {candidates.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="admin-candidates-loading">
            <div className="admin-candidates-spinner"></div>

            <p>Loading candidates...</p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          candidates.length === 0 && (
            <div className="admin-candidates-empty">
              <div className="admin-candidates-empty-icon">
                <UserRound size={30} />
              </div>

              <h3>No candidates found</h3>

              <p>
                No candidate profiles match your current
                search or filter criteria.
              </p>
            </div>
          )}

        {/* Candidate Grid */}
        {!loading && candidates.length > 0 && (
          <div className="admin-candidates-grid">
            {candidates.map((candidate) => {
              const candidateSkills = getSkills(
                candidate.skills
              );

              return (
                <div
                  className="admin-candidate-card"
                  key={candidate.id}
                >
                  {/* Candidate Top */}
                  <div className="admin-candidate-card-top">
                    <div className="admin-candidate-avatar">
                      {getInitials(candidate.name)}
                    </div>

                    <div className="admin-candidate-main">
                      <h3>
                        {candidate.name ||
                          candidate.username}
                      </h3>

                      <p>
                        {candidate.headline ||
                          "Candidate"}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {candidate.location && (
                    <div className="admin-candidate-location">
                      <MapPin size={16} />

                      <span>
                        {candidate.location}
                      </span>
                    </div>
                  )}

                  {/* Summary */}
                  {candidate.summary && (
                    <p className="admin-candidate-summary">
                      {candidate.summary.length > 150
                        ? `${candidate.summary.substring(
                            0,
                            150
                          )}...`
                        : candidate.summary}
                    </p>
                  )}

                  {/* Skills */}
                  <div className="admin-candidate-skills">
                    {candidateSkills.length > 0 ? (
                      candidateSkills
                        .slice(0, 6)
                        .map((candidateSkill) => (
                          <span
                            className="admin-candidate-skill"
                            key={candidateSkill}
                          >
                            {candidateSkill}
                          </span>
                        ))
                    ) : (
                      <span className="admin-candidate-no-skills">
                        No skills added
                      </span>
                    )}

                    {candidateSkills.length > 6 && (
                      <span className="admin-candidate-more-skills">
                        +{candidateSkills.length - 6}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="admin-candidate-stats">
                    <div className="admin-candidate-stat">
                      <FileText size={17} />

                      <div>
                        <strong>
                          {candidate.resume_count || 0}
                        </strong>

                        <span>Resumes</span>
                      </div>
                    </div>

                    <div className="admin-candidate-stat">
                      <Briefcase size={17} />

                      <div>
                        <strong>
                          {candidate.application_count ||
                            0}
                        </strong>

                        <span>Applications</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="admin-candidate-card-footer">
                    <span className="admin-candidate-email">
                      {candidate.email ||
                        candidate.username}
                    </span>

                    <Link
                      to={`/admin/candidates/${candidate.id}`}
                      className="admin-candidate-view-button"
                    >
                      <Eye size={16} />
                      View Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default AdminCandidates;