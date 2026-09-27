import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";

function Resume() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await api.get("/candidates/resumes/list/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setResumes(response.data);
    } catch (err) {
      console.error("Unable to load resumes:", err);
      setError("Unable to load your resumes.");
    } finally {
      setLoadingResumes(false);
    }
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files[0];

    setMessage("");
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFile(null);
      setError("Please select a PDF or DOCX file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setFile(null);
      setError("File size must be 5 MB or less.");
      return;
    }

    setFile(selectedFile);
  }

  async function handleUpload(event) {
  event.preventDefault();

  if (!file) {
    setError("Please select a resume first.");
    return;
  }

  const token = localStorage.getItem("access_token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  setUploading(true);
  setMessage("");
  setError("");

  try {
    await api.post("/candidates/resumes/", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    setMessage("Resume uploaded successfully.");
    setFile(null);

    event.target.reset();

    // Refresh resume list separately
    try {
      await fetchResumes();
    } catch (listError) {
      console.error("Resume uploaded, but list refresh failed:", listError);
    }
  } catch (err) {
    console.error("Resume upload error:", err);

    if (err.response?.data?.file) {
      setError(
        Array.isArray(err.response.data.file)
          ? err.response.data.file[0]
          : err.response.data.file
      );
    } else {
      setError("Unable to upload your resume. Please try again.");
    }
  } finally {
    setUploading(false);
  }
}

  return (
    <main className="resume-page">
      {/* Header */}
      <div className="resume-header">
        <div>
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <span className="dashboard-label">
            RESUME MANAGEMENT
          </span>

          <h1>Manage your resume.</h1>

          <p>
            Upload your latest resume so HireAI can analyze your skills,
            experience, and job alignment.
          </p>
        </div>
      </div>

      {/* Success Message */}
      {message && (
        <div className="profile-success">
          <CheckCircle size={18} />
          {message}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="profile-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Upload Section */}
      <section className="resume-upload-section">
        <div className="resume-section-header">
          <div className="resume-icon">
            <FileText size={24} />
          </div>

          <div>
            <h2>Upload Resume</h2>
            <p>
              Supported formats: PDF and DOCX. Maximum size: 5 MB.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpload}>
          <label className="resume-dropzone">
            <Upload size={32} />

            <strong>
              {file ? file.name : "Choose your resume"}
            </strong>

            <span>
              {file
                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                : "Click to browse PDF or DOCX files"}
            </span>

            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              hidden
            />
          </label>

          <div className="resume-upload-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={!file || uploading}
            >
              <Upload size={17} />

              {uploading
                ? "Uploading..."
                : "Upload Resume"}
            </button>
          </div>
        </form>
      </section>

      {/* Uploaded Resumes */}
      <section className="resume-list-section">
        <div className="resume-section-header">
          <div className="resume-icon">
            <FileText size={24} />
          </div>

          <div>
            <h2>Your Uploaded Resumes</h2>
            <p>
              Manage the resumes you've uploaded to HireAI.
            </p>
          </div>
        </div>

        {loadingResumes ? (
          <div className="resume-loading">
            Loading your resumes...
          </div>
        ) : resumes.length === 0 ? (
          <div className="resume-empty">
            <FileText size={30} />

            <h3>No resumes uploaded yet</h3>

            <p>
              Upload your first resume above to get started
              with AI-powered analysis.
            </p>
          </div>
        ) : (
          <div className="resume-list">
            {resumes.map((resume) => (
              <article
                className="resume-card"
                key={resume.id}
              >
                <div className="resume-card-icon">
                  <FileText size={22} />
                </div>

                <div className="resume-card-content">
                  <h3>
                    {resume.original_filename ||
                      "Uploaded Resume"}
                  </h3>

                  <div className="resume-card-meta">
                    <span>
                      {resume.uploaded_at
                        ? new Date(
                            resume.uploaded_at
                          ).toLocaleDateString()
                        : "Recently uploaded"}
                    </span>

                    {resume.is_primary && (
                      <span className="resume-primary">
                        Primary Resume
                      </span>
                    )}
                  </div>
                </div>

                <div className="resume-status">
                  <CheckCircle size={17} />
                  <span>Processed</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Resume;