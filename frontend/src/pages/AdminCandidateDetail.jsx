import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  UserRound,
  ExternalLink,
  AlertCircle,
  Code2,
} from "lucide-react";

import api from "../services/api";

function AdminCandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchCandidate = async (showRefresh = false) => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get(
        `/candidates/admin/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCandidate(response.data);
    } catch (err) {
      console.error("Unable to load candidate:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to view this candidate."
        );
      } else if (err.response?.status === 404) {
        setError("Candidate not found.");
      } else {
        setError("Unable to load candidate profile.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const getInitials = (name) => {
    if (!name) return "C";

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  const getSkills = (skills) => {
    if (!skills) return [];

    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      APPLIED: "Applied",
      REVIEWING: "Under Review",
      SHORTLISTED: "Shortlisted",
      INTERVIEW: "Interview",
      SELECTED: "Selected",
      REJECTED: "Rejected",
    };

    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="admin-candidate-detail-page">
        <div className="admin-candidate-detail-loading">
          <div className="admin-candidates-spinner" />
          <p>Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-candidate-detail-page">
        <button
          type="button"
          className="admin-candidate-back-button"
          onClick={() => navigate("/admin/candidates")}
        >
          <ArrowLeft size={17} />
          Back to Candidates
        </button>

        <div className="admin-candidate-detail-error">
          <AlertCircle size={22} />

          <div>
            <h2>Unable to load candidate</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return null;
  }

  const skills = getSkills(candidate.skills);
  const applications = candidate.applications || [];
  const resumes = candidate.resumes || [];

  const selectedApplications = applications.filter(
    (application) => application.status === "SELECTED"
  );

  return (
    <div className="admin-candidate-detail-page">

      {/* HEADER */}
      <div className="admin-candidate-detail-header">
        <button
          type="button"
          className="admin-candidate-back-button"
          onClick={() => navigate("/admin/candidates")}
        >
          <ArrowLeft size={17} />
          Back to Candidates
        </button>

        <button
          type="button"
          className="admin-candidate-detail-refresh"
          onClick={() => fetchCandidate(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? "admin-candidates-spin"
                : ""
            }
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* PROFILE HERO */}
      <section className="admin-candidate-profile-hero">

        <div className="admin-candidate-profile-avatar">
          {getInitials(candidate.name)}
        </div>

        <div className="admin-candidate-profile-main">
          <h1>
            {candidate.name || candidate.username}
          </h1>

          <p className="admin-candidate-profile-headline">
            {candidate.headline || "Candidate Profile"}
          </p>

          <div className="admin-candidate-profile-meta">

            {candidate.location && (
              <span>
                <MapPin size={15} />
                {candidate.location}
              </span>
            )}

            {candidate.email && (
              <span>
                <Mail size={15} />
                {candidate.email}
              </span>
            )}

            {candidate.phone && (
              <span>
                <Phone size={15} />
                {candidate.phone}
              </span>
            )}

          </div>
        </div>

        {/* SOCIAL / EXTERNAL LINKS */}
        <div className="admin-candidate-profile-links">

          {candidate.linkedin_url && (
            <a
              href={candidate.linkedin_url}
              target="_blank"
              rel="noreferrer"
              title="LinkedIn"
            >
              <span className="admin-social-text">
                in
              </span>
            </a>
          )}

          {candidate.github_url && (
            <a
              href={candidate.github_url}
              target="_blank"
              rel="noreferrer"
              title="GitHub"
            >
              <Code2 size={18} />
            </a>
          )}

          {candidate.portfolio_url && (
            <a
              href={candidate.portfolio_url}
              target="_blank"
              rel="noreferrer"
              title="Portfolio"
            >
              <ExternalLink size={18} />
            </a>
          )}

        </div>
      </section>

      {/* MAIN LAYOUT */}
      <div className="admin-candidate-detail-layout">

        {/* MAIN */}
        <main>

          {/* SUMMARY */}
          <section className="admin-candidate-detail-card">

            <div className="admin-candidate-detail-card-header">
              <div>
                <UserRound size={19} />
                <h2>Professional Summary</h2>
              </div>
            </div>

            <div className="admin-candidate-detail-card-body">

              {candidate.summary ? (
                <p className="admin-candidate-summary-text">
                  {candidate.summary}
                </p>
              ) : (
                <p className="admin-candidate-empty-text">
                  No professional summary has been added.
                </p>
              )}

            </div>
          </section>

          {/* SKILLS */}
          <section className="admin-candidate-detail-card">

            <div className="admin-candidate-detail-card-header">
              <div>
                <Briefcase size={19} />
                <h2>Technical Skills</h2>
              </div>
            </div>

            <div className="admin-candidate-detail-card-body">

              {skills.length > 0 ? (
                <div className="admin-candidate-detail-skills">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="admin-candidate-detail-skill"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="admin-candidate-empty-text">
                  No skills have been added.
                </p>
              )}

            </div>
          </section>

          {/* EXPERIENCE */}
          <section className="admin-candidate-detail-card">

            <div className="admin-candidate-detail-card-header">
              <div>
                <Briefcase size={19} />
                <h2>Experience</h2>
              </div>
            </div>

            <div className="admin-candidate-detail-card-body">

              {candidate.experience ? (
                <p className="admin-candidate-detail-text">
                  {candidate.experience}
                </p>
              ) : (
                <p className="admin-candidate-empty-text">
                  No experience information provided.
                </p>
              )}

            </div>
          </section>

          {/* EDUCATION */}
          <section className="admin-candidate-detail-card">

            <div className="admin-candidate-detail-card-header">
              <div>
                <GraduationCap size={19} />
                <h2>Education</h2>
              </div>
            </div>

            <div className="admin-candidate-detail-card-body">

              {candidate.education ? (
                <p className="admin-candidate-detail-text">
                  {candidate.education}
                </p>
              ) : (
                <p className="admin-candidate-empty-text">
                  No education information provided.
                </p>
              )}

            </div>
          </section>

          {/* APPLICATIONS */}
          <section className="admin-candidate-detail-card">

            <div className="admin-candidate-detail-card-header">

              <div>
                <Briefcase size={19} />
                <h2>Applications</h2>
              </div>

              <span className="admin-candidate-detail-count">
                {applications.length}
              </span>

            </div>

            <div className="admin-candidate-detail-card-body">

              {applications.length > 0 ? (
                <div className="admin-candidate-applications">

                  {applications.map((application) => (
                    <div
                      className="admin-candidate-application"
                      key={application.id}
                    >

                      <div>
                        <h3>
                          {application.job_title}
                        </h3>

                        <p>
                          Applied{" "}
                          {formatDate(
                            application.applied_at
                          )}
                        </p>
                      </div>

                      <div className="admin-candidate-application-right">

                        {application.match_score !== null &&
                          application.match_score !==
                            undefined && (
                            <span className="admin-candidate-match-score">
                              {Math.round(
                                application.match_score
                              )}
                              % Match
                            </span>
                          )}

                        <span
                          className={`admin-candidate-status status-${String(
                            application.status
                          ).toLowerCase()}`}
                        >
                          {getStatusLabel(
                            application.status
                          )}
                        </span>

                        <Link
                          to={`/admin/applications/${application.id}`}
                          className="admin-candidate-application-link"
                        >
                          View Application
                        </Link>

                      </div>
                    </div>
                  ))}

                </div>
              ) : (
                <p className="admin-candidate-empty-text">
                  This candidate has not submitted any
                  applications yet.
                </p>
              )}

            </div>
          </section>

        </main>

        {/* SIDEBAR */}
        <aside>

          {/* OVERVIEW */}
          <section className="admin-candidate-sidebar-card">

            <h2>Candidate Overview</h2>

            <div className="admin-candidate-overview-stat">
              <FileText size={18} />

              <div>
                <strong>
                  {resumes.length}
                </strong>

                <span>Resumes</span>
              </div>
            </div>

            <div className="admin-candidate-overview-stat">
              <Briefcase size={18} />

              <div>
                <strong>
                  {applications.length}
                </strong>

                <span>Applications</span>
              </div>
            </div>

            <div className="admin-candidate-overview-stat">
              <CheckCircle2 size={18} />

              <div>
                <strong>
                  {selectedApplications.length}
                </strong>

                <span>Selected</span>
              </div>
            </div>

          </section>

          {/* RESUMES */}
          <section className="admin-candidate-sidebar-card">

            <div className="admin-candidate-sidebar-title">

              <h2>Resumes</h2>

              <span>
                {resumes.length}
              </span>

            </div>

            {resumes.length > 0 ? (
              <div className="admin-candidate-resume-list">

                {resumes.map((resume) => (
                  <div
                    className="admin-candidate-resume"
                    key={resume.id}
                  >

                    <div className="admin-candidate-resume-icon">
                      <FileText size={18} />
                    </div>

                    <div>

                      <strong>
                        {resume.original_filename ||
                          "Resume"}
                      </strong>

                      <span>
                        {resume.is_primary
                          ? "Primary resume"
                          : "Resume"}
                      </span>

                      <small>
                        Uploaded{" "}
                        {formatDate(
                          resume.uploaded_at
                        )}
                      </small>

                    </div>

                  </div>
                ))}

              </div>
            ) : (
              <p className="admin-candidate-empty-text">
                No resumes uploaded.
              </p>
            )}

          </section>

          {/* ACCOUNT */}
          <section className="admin-candidate-sidebar-card">

            <h2>Account Information</h2>

            <div className="admin-candidate-account-row">
              <span>Username</span>

              <strong>
                {candidate.username || "—"}
              </strong>
            </div>

            <div className="admin-candidate-account-row">
              <span>Profile Created</span>

              <strong>
                {formatDate(candidate.created_at)}
              </strong>
            </div>

            <div className="admin-candidate-account-row">
              <span>Last Updated</span>

              <strong>
                {formatDate(candidate.updated_at)}
              </strong>
            </div>

          </section>

        </aside>
      </div>
    </div>
  );
}

export default AdminCandidateDetail;