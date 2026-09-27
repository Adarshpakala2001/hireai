import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  User,
  Briefcase,
  FileText,
  Download,
  Brain,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";


function AdminApplicationReview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  /* =========================================
     LOAD APPLICATION
  ========================================= */

  useEffect(() => {
    fetchApplication();
  }, [id]);


  async function fetchApplication() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/applications/admin/${id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplication(response.data);

      setSelectedStatus(
        response.data.status
      );

    } catch (err) {
      console.error(
        "Unable to load application:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "refresh_token"
        );

        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to view this application."
        );
        return;
      }

      if (err.response?.status === 404) {
        setError(
          "Application not found."
        );
        return;
      }

      setError(
        "Unable to load application."
      );

    } finally {
      setLoading(false);
    }
  }


  /* =========================================
     DOWNLOAD RESUME
  ========================================= */

  async function handleDownloadResume() {
    const token = localStorage.getItem(
      "access_token"
    );

    if (!token) {
      navigate("/login");
      return;
    }

    if (!application?.resume_filename) {
      setError(
        "No resume is available for this application."
      );
      return;
    }

    setDownloading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.get(
        `/applications/admin/${id}/resume/download/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },

          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type:
            response.headers[
              "content-type"
            ] || "application/octet-stream",
        }
      );

      const blobUrl =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = blobUrl;

      link.download =
        application.resume_filename ||
        "candidate-resume";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        blobUrl
      );

      setMessage(
        "Resume downloaded successfully."
      );

    } catch (err) {
      console.error(
        "Unable to download resume:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "refresh_token"
        );

        navigate("/login");
        return;
      }

      if (err.response?.status === 403) {
        setError(
          "You do not have permission to download this resume."
        );
        return;
      }

      setError(
        "Unable to download the resume."
      );

    } finally {
      setDownloading(false);
    }
  }


  /* =========================================
     UPDATE APPLICATION STATUS
  ========================================= */

  async function updateStatus() {
    if (
      !application ||
      selectedStatus === application.status
    ) {
      return;
    }

    const token = localStorage.getItem(
      "access_token"
    );

    if (!token) {
      navigate("/login");
      return;
    }

    setUpdating(true);
    setError("");
    setMessage("");

    try {
      const response = await api.patch(
        `/applications/admin/${id}/status/`,
        {
          status: selectedStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplication(
        response.data.application
      );

      setSelectedStatus(
        response.data.application.status
      );

      setMessage(
        "Application status updated successfully."
      );

    } catch (err) {
      console.error(
        "Unable to update status:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "refresh_token"
        );

        navigate("/login");
        return;
      }

      setError(
        "Unable to update application status."
      );

    } finally {
      setUpdating(false);
    }
  }


  /* =========================================
     HELPERS
  ========================================= */

  function formatDate(dateString) {
    if (!dateString) {
      return "-";
    }

    return new Date(
      dateString
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }


  function getScoreClass(score) {
    if (
      score === null ||
      score === undefined
    ) {
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


  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <main className="admin-review-loading">

        <RefreshCw size={30} />

        <p>
          Loading application...
        </p>

      </main>
    );
  }


  /* =========================================
     ERROR
  ========================================= */

  if (error && !application) {
    return (
      <main className="admin-review-page">

        <div className="admin-review-message error">

          <AlertCircle size={20} />

          <span>
            {error}
          </span>

        </div>

      </main>
    );
  }


  /* =========================================
     RESUME INFORMATION
  ========================================= */

  const isPdf =
    application?.resume_filename
      ?.toLowerCase()
      .endsWith(".pdf");

  const resumePreviewUrl =
    application?.resume_url;

  const analysisAvailable =
    application?.match_score !== null &&
    application?.match_score !== undefined;


  /* =========================================
     PAGE
  ========================================= */

  return (
    <main className="admin-review-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <header className="admin-review-header">

        <div>

          <Link
            to="/admin/applications"
            className="admin-back-link"
          >
            <ArrowLeft size={17} />

            Back to Applications
          </Link>


          <span className="dashboard-label">
            APPLICATION REVIEW
          </span>


          <h1>
            {application.candidate_name}
          </h1>


          <p>
            Review the candidate profile,
            resume, AI analysis, and
            application status.
          </p>

        </div>

      </header>


      {/* =====================================
          MESSAGES
      ===================================== */}

      {error && (
        <div className="admin-review-message error">

          <AlertCircle size={18} />

          <span>
            {error}
          </span>

        </div>
      )}


      {message && (
        <div className="admin-review-message success">

          <CheckCircle size={18} />

          <span>
            {message}
          </span>

        </div>
      )}


      {/* =====================================
          MAIN LAYOUT
      ===================================== */}

      <div className="admin-review-layout">


        {/* ===================================
            LEFT SIDE
        =================================== */}

        <div className="admin-review-main">


          {/* =================================
              CANDIDATE
          ================================= */}

          <section className="admin-review-card">

            <div className="admin-review-card-header">

              <div className="admin-review-card-title">

                <div className="admin-review-icon">

                  <User size={20} />

                </div>


                <div>

                  <span>
                    CANDIDATE
                  </span>

                  <h2>
                    Candidate Profile
                  </h2>

                </div>

              </div>

            </div>


            <div className="admin-candidate-profile">

              <div className="admin-large-avatar">

                {application.candidate_name
                  ?.charAt(0)
                  ?.toUpperCase()}

              </div>


              <div className="admin-candidate-profile-info">

                <h3>
                  {application.candidate_name}
                </h3>


                <p>
                  {application.candidate_email ||
                    application.candidate_username}
                </p>


                <div className="admin-candidate-meta">

                  <span>
                    Applied{" "}
                    {formatDate(
                      application.applied_at
                    )}
                  </span>


                  <span>
                    Application #
                    {application.id}
                  </span>

                </div>

              </div>

            </div>

          </section>


          {/* =================================
              JOB
          ================================= */}

          <section className="admin-review-card">

            <div className="admin-review-card-header">

              <div className="admin-review-card-title">

                <div className="admin-review-icon">

                  <Briefcase size={20} />

                </div>


                <div>

                  <span>
                    POSITION
                  </span>

                  <h2>
                    Applied Job
                  </h2>

                </div>

              </div>

            </div>


            <div className="admin-job-review">

              <h3>
                {application.job_title}
              </h3>


              <p>
                Candidate applied for this
                position through HireAI.
              </p>

            </div>

          </section>


          {/* =================================
              RESUME
          ================================= */}

          <section className="admin-review-card">

            <div className="admin-review-card-header">

              <div className="admin-review-card-title">

                <div className="admin-review-icon">

                  <FileText size={20} />

                </div>


                <div>

                  <span>
                    CANDIDATE DOCUMENT
                  </span>

                  <h2>
                    Resume
                  </h2>

                </div>

              </div>


              {application.resume_filename && (

                <button
                  type="button"
                  className="admin-resume-download"
                  onClick={
                    handleDownloadResume
                  }
                  disabled={downloading}
                >

                  <Download size={17} />

                  {downloading
                    ? "Downloading..."
                    : "Download Resume"}

                </button>

              )}

            </div>


            {/* Resume filename */}

            <div className="admin-resume-name">

              <FileText size={18} />

              <span>
                {application.resume_filename ||
                  "No resume uploaded"}
              </span>

            </div>


            {/* Resume preview */}

            {application.resume_filename ? (

              isPdf && resumePreviewUrl ? (

                <div className="admin-resume-preview">

                  <iframe
                    src={resumePreviewUrl}
                    title="Candidate Resume"
                  />

                </div>

              ) : (

                <div className="admin-docx-preview">

                  <div className="admin-docx-preview-icon">

                    <FileText size={32} />

                  </div>


                  <h3>
                    Resume Preview
                  </h3>


                  <p>
                    This resume is a DOCX file.
                    The extracted resume content
                    is shown below.
                  </p>


                  <div className="admin-resume-text">

                    {application.resume_text ? (

                      application.resume_text

                    ) : (

                      "No extracted resume text is available."

                    )}

                  </div>

                </div>

              )

            ) : (

              <div className="admin-no-resume">

                <FileText size={32} />

                <p>
                  No resume was attached to
                  this application.
                </p>

              </div>

            )}

          </section>


          {/* =================================
              AI ANALYSIS
          ================================= */}

          <section className="admin-review-card">

            <div className="admin-review-card-header">

              <div className="admin-review-card-title">

                <div className="admin-review-icon ai">

                  <Brain size={20} />

                </div>


                <div>

                  <span>
                    AI-ASSISTED ANALYSIS
                  </span>

                  <h2>
                    Resume Match Analysis
                  </h2>

                </div>

              </div>

            </div>


            {analysisAvailable ? (

              <div className="admin-ai-analysis">


                {/* Score */}

                <div className="admin-score-section">

                  <div
                    className={`admin-large-score ${getScoreClass(
                      application.match_score
                    )}`}
                  >

                    {application.match_score}%

                  </div>


                  <div>

                    <strong>
                      Resume Match Score
                    </strong>

                    <span>
                      Based on the current
                      resume and job requirements.
                    </span>

                  </div>

                </div>


                {/* Skills */}

                <div className="admin-analysis-grid">


                  {/* Matching */}

                  <div>

                    <h3>
                      Matching Skills
                    </h3>


                    {application.matching_skills
                      ?.length > 0 ? (

                      <div className="admin-analysis-tags">

                        {application.matching_skills.map(
                          (skill) => (

                            <span
                              className="matching"
                              key={skill}
                            >

                              ✓ {skill}

                            </span>

                          )
                        )}

                      </div>

                    ) : (

                      <p>
                        No matching skills detected.
                      </p>

                    )}

                  </div>


                  {/* Missing */}

                  <div>

                    <h3>
                      Missing Skills
                    </h3>


                    {application.missing_skills
                      ?.length > 0 ? (

                      <div className="admin-analysis-tags">

                        {application.missing_skills.map(
                          (skill) => (

                            <span
                              className="missing"
                              key={skill}
                            >

                              {skill}

                            </span>

                          )
                        )}

                      </div>

                    ) : (

                      <p>
                        No missing skills detected.
                      </p>

                    )}

                  </div>

                </div>


                {/* Experience */}

                <div className="admin-experience-alignment">

                  <strong>
                    Experience Alignment
                  </strong>


                  <span>
                    {application.experience_alignment ||
                      "Not specified"}
                  </span>

                </div>


                {/* Strengths / Suggestions */}

                <div className="admin-analysis-columns">


                  <div>

                    <h3>
                      Strengths
                    </h3>


                    <ul>

                      {application.strengths?.map(
                        (strength) => (

                          <li key={strength}>
                            {strength}
                          </li>

                        )
                      )}

                    </ul>

                  </div>


                  <div>

                    <h3>
                      Suggestions
                    </h3>


                    <ul>

                      {application.suggestions?.map(
                        (suggestion) => (

                          <li key={suggestion}>
                            {suggestion}
                          </li>

                        )
                      )}

                    </ul>

                  </div>

                </div>

              </div>

            ) : (

              <div className="admin-no-analysis">

                <Brain size={30} />

                <p>
                  AI match analysis is not
                  available for this application.
                </p>

              </div>

            )}

          </section>

        </div>


        {/* ===================================
            RIGHT SIDEBAR
        =================================== */}

        <aside className="admin-review-sidebar">


          {/* =================================
              STATUS
          ================================= */}

          <section className="admin-review-card">

            <div className="admin-review-card-header">

              <div className="admin-review-card-title">

                <div className="admin-review-icon">

                  <Clock size={20} />

                </div>


                <div>

                  <span>
                    WORKFLOW
                  </span>

                  <h2>
                    Application Status
                  </h2>

                </div>

              </div>

            </div>


            <div className="admin-status-workflow">

              <label htmlFor="application-status">

                Current Status

              </label>


              <select
                id="application-status"
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(
                    event.target.value
                  )
                }
              >

                <option value="APPLIED">
                  Applied
                </option>

                <option value="REVIEWING">
                  Reviewing
                </option>

                <option value="SHORTLISTED">
                  Shortlisted
                </option>

                <option value="INTERVIEW">
                  Interview
                </option>

                <option value="SELECTED">
                  Selected
                </option>

                <option value="REJECTED">
                  Rejected
                </option>

              </select>


              <button
                type="button"
                className="admin-update-status"
                disabled={
                  updating ||
                  selectedStatus ===
                    application.status
                }
                onClick={updateStatus}
              >

                {updating
                  ? "Updating..."
                  : "Update Status"}

              </button>

            </div>

          </section>


          {/* =================================
              RESUME DOWNLOAD
          ================================= */}

          {application.resume_filename && (

            <section className="admin-review-card">

              <div className="admin-sidebar-download">

                <FileText size={22} />


                <div>

                  <strong>
                    Candidate Resume
                  </strong>


                  <span>
                    Download the original
                    resume file.
                  </span>

                </div>

              </div>


              <button
                type="button"
                className="admin-full-download"
                onClick={
                  handleDownloadResume
                }
                disabled={downloading}
              >

                <Download size={17} />

                {downloading
                  ? "Downloading..."
                  : "Download Resume"}

              </button>

            </section>

          )}


          {/* =================================
              QUICK INFORMATION
          ================================= */}

          <section className="admin-review-card">

            <div className="admin-review-card-header">

              <div className="admin-review-card-title">

                <div className="admin-review-icon">

                  <CheckCircle size={20} />

                </div>


                <div>

                  <span>
                    APPLICATION
                  </span>

                  <h2>
                    Quick Information
                  </h2>

                </div>

              </div>

            </div>


            <div className="admin-quick-info">


              <div>

                <span>
                  Status
                </span>


                <strong
                  className={`admin-status status-${application.status.toLowerCase()}`}
                >

                  {application.status}

                </strong>

              </div>


              <div>

                <span>
                  Match Score
                </span>


                <strong>

                  {analysisAvailable
                    ? `${application.match_score}%`
                    : "N/A"}

                </strong>

              </div>


              <div>

                <span>
                  Applied
                </span>


                <strong>

                  {formatDate(
                    application.applied_at
                  )}

                </strong>

              </div>


            </div>

          </section>

        </aside>

      </div>

    </main>
  );
}


export default AdminApplicationReview;