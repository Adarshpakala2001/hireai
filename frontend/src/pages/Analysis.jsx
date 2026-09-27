import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  CheckCircle,
  AlertCircle,
  Target,
  Lightbulb,
} from "lucide-react";
import api from "../services/api";

function Analysis() {
  const { applicationId } = useParams();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalysis();
  }, [applicationId]);

  async function fetchAnalysis() {
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
      console.error("Unable to load analysis:", err);
      setError(
        "Unable to load the resume analysis."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="analysis-page">
        <div className="analysis-loading">
          Loading AI resume analysis...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="analysis-page">
        <div className="profile-error">
          <AlertCircle size={18} />
          {error}
        </div>
      </main>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <main className="analysis-page">
      <div className="analysis-header">
        <Link
          to="/applications"
          className="back-link"
        >
          <ArrowLeft size={16} />
          Back to Applications
        </Link>

        <span className="dashboard-label">
          AI RESUME ANALYSIS
        </span>

        <h1>Resume match analysis.</h1>

        <p>
          AI-powered analysis of your resume against
          the selected job requirements.
        </p>
      </div>

      <section className="analysis-summary-card">
        <div className="analysis-summary-icon">
          <Brain size={28} />
        </div>

        <div className="analysis-summary-content">
          <span>Analyzed Job</span>

          <h2>{analysis.job_title}</h2>

          <span>
            Analysis method: {analysis.analysis_method}
          </span>
        </div>

        <div className="analysis-score">
          <strong>{analysis.match_score}%</strong>
          <span>Match Score</span>
        </div>
      </section>

      <section className="analysis-grid">
        <div className="analysis-card">
          <div className="analysis-card-header">
            <CheckCircle size={21} />
            <h2>Matching Skills</h2>
          </div>

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
        </div>

        <div className="analysis-card">
          <div className="analysis-card-header">
            <AlertCircle size={21} />
            <h2>Missing Skills</h2>
          </div>

          {analysis.missing_skills.length > 0 ? (
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

        <div className="analysis-card">
          <div className="analysis-card-header">
            <Target size={21} />
            <h2>Experience Alignment</h2>
          </div>

          <div className="analysis-alignment">
            {analysis.experience_alignment}
          </div>
        </div>

        <div className="analysis-card">
          <div className="analysis-card-header">
            <Lightbulb size={21} />
            <h2>Strengths</h2>
          </div>

          <ul className="analysis-list">
            {analysis.strengths.map(
              (strength, index) => (
                <li key={index}>
                  {strength}
                </li>
              )
            )}
          </ul>
        </div>

        <div className="analysis-card analysis-full-width">
          <div className="analysis-card-header">
            <Lightbulb size={21} />
            <h2>Suggestions</h2>
          </div>

          <ul className="analysis-list">
            {analysis.suggestions.map(
              (suggestion, index) => (
                <li key={index}>
                  {suggestion}
                </li>
              )
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}

export default Analysis;