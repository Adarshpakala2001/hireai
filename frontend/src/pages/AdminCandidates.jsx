import React, { useCallback, useEffect, useState } from "react";
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

import api from "../services/api";

function AdminCandidates() {
  const [candidates, setCandidates] = useState([]);

  // Search and filter values
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [skill, setSkill] = useState("");

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Fetch candidates from the backend
  const fetchCandidates = useCallback(
    async ({ showRefresh = false, filters = {} } = {}) => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setCandidates([]);
        setError("Your session has expired. Please login again.");
        setLoading(false);
        setRefreshing(false);
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

        if (filters.search?.trim()) {
          params.search = filters.search.trim();
        }

        if (filters.location?.trim()) {
          params.location = filters.location.trim();
        }

        if (filters.skill?.trim()) {
          params.skill = filters.skill.trim();
        }

        const response = await api.get("/candidates/admin/", {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Support both paginated and normal array responses
        const data = response.data;

        const candidateList = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];

        setCandidates(candidateList);
      } catch (err) {
        console.error("Unable to fetch candidates:", err);

        setCandidates([]);

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
            "Unable to load candidates. Please check your connection and try again."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // Load candidates when the page opens
  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Search candidates
  const handleSearch = (event) => {
    event.preventDefault();

    fetchCandidates({
      filters: {
        search,
        location,
        skill,
      },
    });
  };

  // Clear all filters and fetch the complete candidate list
  const handleClearFilters = () => {
    setSearch("");
    setLocation("");
    setSkill("");

    fetchCandidates({
      filters: {
        search: "",
        location: "",
        skill: "",
      },
    });
  };

  // Refresh candidates using the currently selected filters
  const handleRefresh = () => {
    fetchCandidates({
      showRefresh: true,
      filters: {
        search,
        location,
        skill,
      },
    });
  };

  // Generate candidate initials
  const getCandidateName = (candidate) => {
    const fullName = [
      candidate.first_name,
      candidate.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      candidate.name ||
      fullName ||
      candidate.username ||
      "Candidate"
    );
  };

  const getInitials = (name) => {
    if (!name || typeof name !== "string") {
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

  // Support skills stored as either an array or comma-separated string
  const getSkills = (skills) => {
    if (!skills) {
      return [];
    }

    if (Array.isArray(skills)) {
      return skills
        .map((item) =>
          typeof item === "string" ? item : item?.name
        )
        .filter(Boolean);
    }

    if (typeof skills === "string") {
      return skills
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  const hasFilters =
    search.trim() || location.trim() || skill.trim();

  return (
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
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          <RefreshCw
            size={17}
            className={
              refreshing ? "admin-candidates-spin" : ""
            }
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Search and Filters */}
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
          disabled={loading}
        >
          <Search size={17} />
          Search
        </button>

        {hasFilters && (
          <button
            type="button"
            className="admin-candidates-clear"
            onClick={handleClearFilters}
            disabled={loading}
          >
            Clear
          </button>
        )}
      </form>

      {/* Error Message */}
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

      {/* Loading State */}
      {loading && (
        <div className="admin-candidates-loading">
          <div className="admin-candidates-spinner"></div>
          <p>Loading candidates...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && candidates.length === 0 && (
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

            const candidateName =
              getCandidateName(candidate);

            return (
              <div
                className="admin-candidate-card"
                key={candidate.id}
              >
                {/* Candidate Information */}
                <div className="admin-candidate-card-top">
                  <div className="admin-candidate-avatar">
                    {getInitials(candidateName)}
                  </div>

                  <div className="admin-candidate-main">
                    <h3>{candidateName}</h3>

                    <p>
                      {candidate.headline || "Candidate"}
                    </p>
                  </div>
                </div>

                {/* Location */}
                {candidate.location && (
                  <div className="admin-candidate-location">
                    <MapPin size={16} />

                    <span>{candidate.location}</span>
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
                      .map((candidateSkill, index) => (
                        <span
                          className="admin-candidate-skill"
                          key={`${candidate.id}-${candidateSkill}-${index}`}
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

                {/* Candidate Statistics */}
                <div className="admin-candidate-stats">
                  <div className="admin-candidate-stat">
                    <FileText size={17} />

                    <div>
                      <strong>
                        {candidate.resume_count ?? 0}
                      </strong>

                      <span>Resumes</span>
                    </div>
                  </div>

                  <div className="admin-candidate-stat">
                    <Briefcase size={17} />

                    <div>
                      <strong>
                        {candidate.application_count ?? 0}
                      </strong>

                      <span>Applications</span>
                    </div>
                  </div>
                </div>

                {/* Candidate Footer */}
                <div className="admin-candidate-card-footer">
                  <span className="admin-candidate-email">
                    {candidate.email || candidate.username}
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
  );
}

export default AdminCandidates;