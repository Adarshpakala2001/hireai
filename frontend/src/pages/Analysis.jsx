import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  AlertCircle,
  Target,
  Lightbulb,
  FileText,
  Briefcase,
  Sparkles,
} from "lucide-react";

import api from "../services/api";

function Analysis() {
  const { applicationId } = useParams();

  const [analysis, setAnalysis] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [selectedResume, setSelectedResume] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (applicationId) {
      fetchApplicationAnalysis();
    } else {
      fetchAnalysisOptions();
    }
  }, [applicationId]);

  async function fetchAnalysisOptions() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const [resumeResponse, jobsResponse] = await Promise.all([
        api.get("/candidates/resumes/list/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        api.get("/jobs/?status=OPEN", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      setResumes(resumeResponse.data);
      setJobs(jobsResponse.data);

      if (resumeResponse.data.length > 0) {
        const primaryResume =
          resumeResponse.data.find(
            (resume) => resume.is_primary
          ) || resumeResponse.data[0];

        setSelectedResume(String(primaryResume.id));
      }

      setLoading(false);
    } catch (err) {
      console.error(
        "Unable to load analysis options:",
        err
      );

      setError(
        "Unable to load your resumes and available jobs."
      );

      setLoading(false);
    }
  }

  async function fetchApplicationAnalysis() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await api.get(
        `/applications/${applicationId}/analysis/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalysis(response.data);
    } catch (err) {
      console.error(
        "Unable to load application analysis:",
        err
      );

      setError(
        "Unable to load the resume analysis."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    if (!selectedResume || !selectedJob) {
      setError(
        "Please select both a resume and a job."
      );
      return;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await api.post(
        "/applications/resume-analysis/",
        {
          resume_id: Number(selectedResume),
          job_id: Number(selectedJob),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAnalysis(response.data);
    } catch (err) {
      console.error(
        "Resume analysis failed:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to analyze the resume."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  function handleNewAnalysis() {
    setAnalysis(null);
    setError("");
    setSelectedJob("");
  }

  if (loading) {
    return (
      <main className="analysis-page">
        <div className="analysis-loading">
          <Brain size={30} />
          <p>
            Loading AI resume analysis...
          </p>
        </div>
      </main>
    );
  }

  if (error && !analysis && !selectedResume) {
    return (
      <main className="analysis-page">
        <div className="analysis-header">
          <Link
            to="/dashboard"
            className="back-link"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <span className="dashboard-label">
            AI RESUME ANALYSIS
          </span>

          <h1>
            Resume match analysis.
          </h1>

          <p>
            Analyze your resume against available
            job opportunities.
          </p>
        </div>

        <div className="profile-error">
          <AlertCircle size={18} />
          {error}
        </div>
      </main>
    );
  }

  /*
   * Standalone Candidate Analysis
   *
   * URL:
   * /analysis
   */
  if (!applicationId && !analysis) {
    return (
      <main className="analysis-page">
        <div className="analysis-header">
          <Link
            to="/dashboard"
            className="back-link"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <span className="dashboard-label">
            AI RESUME ANALYSIS
          </span>

          <h1>
            Analyze your resume.
          </h1>

          <p>
            Select your resume and a job opportunity
            to understand how well your profile matches
            the role.
          </p>
        </div>

        <section className="analysis-selection-card">
          <div className="analysis-selection-header">
            <div className="analysis-summary-icon">
              <Sparkles size={25} />
            </div>

            <div>
              <h2>
                Start your resume analysis
              </h2>

              <p>
                HireAI will compare your resume with
                the selected job requirements.
              </p>
            </div>
          </div>

          <div className="analysis-selection-grid">
            {/* Resume Selection */}
            <div className="analysis-field">
              <label htmlFor="resume">
                <FileText size={17} />
                Select Resume
              </label>

              <select
                id="resume"
                value={selectedResume}
                onChange={(event) =>
                  setSelectedResume(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select your resume
                </option>

                {resumes.map((resume) => (
                  <option
                    key={resume.id}
                    value={resume.id}
                  >
                    {resume.original_filename}
                  </option>
                ))}
              </select>

              {resumes.length === 0 && (
                <span className="analysis-field-help">
                  You don't have a resume yet.

                  <Link to="/resumes">
                    Upload Resume
                  </Link>
                </span>
              )}
            </div>

            {/* Job Selection */}
            <div className="analysis-field">
              <label htmlFor="job">
                <Briefcase size={17} />
                Select Job
              </label>

              <select
                id="job"
                value={selectedJob}
                onChange={(event) =>
                  setSelectedJob(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select a job
                </option>

                {jobs.map((job) => (
                  <option
                    key={job.id}
                    value={job.id}
                  >
                    {job.title}
                  </option>
                ))}
              </select>

              {jobs.length === 0 && (
                <span className="analysis-field-help">
                  No open jobs are currently available.

                  <Link to="/jobs">
                    Browse Jobs
                  </Link>
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="profile-error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <button
            type="button"
            className="analysis-analyze-button"
            onClick={handleAnalyze}
            disabled={
              analyzing ||
              !selectedResume ||
              !selectedJob
            }
          >
            <Brain size={18} />

            {analyzing
              ? "Analyzing Resume..."
              : "Analyze Resume"}
          </button>
        </section>

        <section className="analysis-info-grid">
          <div className="analysis-info-card">
            <Target size={21} />

            <div>
              <h3>
                Match Score
              </h3>

              <p>
                Understand how closely your profile
                matches the selected job.
              </p>
            </div>
          </div>

          <div className="analysis-info-card">
            <CheckCircle size={21} />

            <div>
              <h3>
                Matching Skills
              </h3>

              <p>
                See which required skills are already
                present in your resume.
              </p>
            </div>
          </div>

          <div className="analysis-info-card">
            <Lightbulb size={21} />

            <div>
              <h3>
                Improvement Suggestions
              </h3>

              <p>
                Identify areas you can strengthen
                before applying.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /*
   * Analysis Result
   *
   * Used for:
   *
   * /analysis
   *
   * and
   *
   * /analysis/:applicationId
   */
  return (
    <main className="analysis-page">
      <div className="analysis-header">
        <Link
          to={
            applicationId
              ? "/applications"
              : "/analysis"
          }
          className="back-link"
        >
          <ArrowLeft size={16} />

          {applicationId
            ? "Back to Applications"
            : "New Analysis"}
        </Link>

        <span className="dashboard-label">
          AI RESUME ANALYSIS
        </span>

        <h1>
          Resume match analysis.
        </h1>

        <p>
          AI-powered analysis of your resume
          against the selected job requirements.
        </p>
      </div>

      {/* Summary */}
      <section className="analysis-summary-card">
        <div className="analysis-summary-icon">
          <Brain size={28} />
        </div>

        <div className="analysis-summary-content">
          <span>
            Analyzed Job
          </span>

          <h2>
            {analysis.job_title}
          </h2>

          {analysis.resume_filename && (
            <span>
              Resume: {analysis.resume_filename}
            </span>
          )}

          <span>
            Analysis method:{" "}
            {analysis.analysis_method}
          </span>
        </div>

        <div className="analysis-score">
          <strong>
            {analysis.match_score}%
          </strong>

          <span>
            Match Score
          </span>
        </div>
      </section>

      {/* Analysis Grid */}
      <section className="analysis-grid">
        {/* Matching Skills */}
        <div className="analysis-card">
          <div className="analysis-card-header">
            <CheckCircle size={21} />

            <h2>
              Matching Skills
            </h2>
          </div>

          {analysis.matching_skills?.length > 0 ? (
            <div className="analysis-skills">
              {analysis.matching_skills.map(
                (skill) => (
                  <span
                    className="analysis-skill matched"
                    key={skill}
                  >
                    <CheckCircle size={15} />
                    {skill}
                  </span>
                )
              )}
            </div>
          ) : (
            <p>
              No matching skills were identified.
            </p>
          )}
        </div>

        {/* Missing Skills */}
        <div className="analysis-card">
          <div className="analysis-card-header">
            <AlertCircle size={21} />

            <h2>
              Missing Skills
            </h2>
          </div>

          {analysis.missing_skills?.length > 0 ? (
            <div className="analysis-skills">
              {analysis.missing_skills.map(
                (skill) => (
                  <span
                    className="analysis-skill missing"
                    key={skill}
                  >
                    <AlertCircle size={15} />
                    {skill}
                  </span>
                )
              )}
            </div>
          ) : (
            <p>
              No required skills are missing.
            </p>
          )}
        </div>

        {/* Experience Alignment */}
        <div className="analysis-card">
          <div className="analysis-card-header">
            <Target size={21} />

            <h2>
              Experience Alignment
            </h2>
          </div>

          <div className="analysis-alignment">
            {analysis.experience_alignment}
          </div>
        </div>

        {/* Strengths */}
        <div className="analysis-card">
          <div className="analysis-card-header">
            <Lightbulb size={21} />

            <h2>
              Strengths
            </h2>
          </div>

          <ul className="analysis-list">
            {analysis.strengths?.map(
              (strength, index) => (
                <li key={index}>
                  {strength}
                </li>
              )
            )}
          </ul>
        </div>

        {/* Suggestions */}
        <div className="analysis-card analysis-full-width">
          <div className="analysis-card-header">
            <Lightbulb size={21} />

            <h2>
              Suggestions
            </h2>
          </div>

          <ul className="analysis-list">
            {analysis.suggestions?.map(
              (suggestion, index) => (
                <li key={index}>
                  {suggestion}
                </li>
              )
            )}
          </ul>
        </div>
      </section>

      {/* Analyze Another Resume */}
      {!applicationId && (
        <div className="analysis-new-button-wrapper">
          <button
            type="button"
            className="analysis-new-button"
            onClick={handleNewAnalysis}
          >
            <Brain size={17} />
            Analyze Another Resume
          </button>
        </div>
      )}
    </main>
  );
}

export default Analysis;