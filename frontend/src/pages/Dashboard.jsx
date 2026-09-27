import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Briefcase,
  Send,
  User,
  Brain,
  LogOut,
  ArrowRight,
  Upload,
} from "lucide-react";

import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await api.get("/auth/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
    } catch (error) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      navigate("/login");
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
      <main className="dashboard-loading">
        <div>
          <Brain size={30} />
          <p>Loading your workspace...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">

      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div>
          <span className="dashboard-label">
            CANDIDATE WORKSPACE
          </span>

          <h1>
            Welcome back
            {user?.first_name
              ? `, ${user.first_name}`
              : `, ${user?.username}`}
            .
          </h1>

          <p>
            Manage your profile, resumes, applications, and
            AI-powered career analysis.
          </p>
        </div>

        <button
          className="dashboard-logout"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Logout
        </button>
      </header>

      {/* Quick Actions */}
      <section className="dashboard-actions">

        <Link to="/profile" className="dashboard-action">
          <div className="dashboard-action-icon">
            <User size={22} />
          </div>

          <div>
            <strong>Complete Profile</strong>
            <span>Update your professional information</span>
          </div>

          <ArrowRight size={18} />
        </Link>

        <Link to="/resumes" className="dashboard-action">
          <div className="dashboard-action-icon">
            <Upload size={22} />
          </div>

          <div>
            <strong>Manage Resume</strong>
            <span>Upload and manage your resumes</span>
          </div>

          <ArrowRight size={18} />
        </Link>

        <Link to="/jobs" className="dashboard-action">
          <div className="dashboard-action-icon">
            <Briefcase size={22} />
          </div>

          <div>
            <strong>Browse Jobs</strong>
            <span>Explore available opportunities</span>
          </div>

          <ArrowRight size={18} />
        </Link>

      </section>

      {/* Dashboard Cards */}
      <section className="dashboard-grid">

        <DashboardCard
          icon={<User size={23} />}
          title="My Profile"
          description="Manage your personal information, skills, education, and professional links."
          action="View Profile"
          to="/profile"
        />

        <DashboardCard
          icon={<FileText size={23} />}
          title="My Resume"
          description="Upload your resume and prepare it for AI-powered analysis."
          action="Manage Resume"
          to="/resumes"
        />

        <DashboardCard
          icon={<Briefcase size={23} />}
          title="Job Opportunities"
          description="Browse open positions and find opportunities matching your skills."
          action="Browse Jobs"
          to="/jobs"
        />

        <DashboardCard
          icon={<Send size={23} />}
          title="Applications"
          description="Track the jobs you have applied for and monitor application status."
          action="View Applications"
          to="/applications"
        />

        <DashboardCard
          icon={<Brain size={23} />}
          title="AI Resume Analysis"
          description="Analyze your resume against job requirements and understand skill alignment."
          action="Analyze Resume"
          to="/analysis"
        />

      </section>

      {/* Account Information */}
      <section className="account-card">

        <div>
          <span>ACCOUNT</span>
          <h2>Your HireAI Account</h2>
        </div>

        <div className="account-details">
          <div>
            <span>Username</span>
            <strong>{user?.username}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{user?.email || "Not provided"}</strong>
          </div>

          <div>
            <span>Role</span>
            <strong>{user?.role}</strong>
          </div>
        </div>

      </section>

    </main>
  );
}

function DashboardCard({
  icon,
  title,
  description,
  action,
  to,
}) {
  return (
    <article className="dashboard-card">

      <div className="dashboard-card-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      <Link to={to}>
        {action}
        <ArrowRight size={16} />
      </Link>

    </article>
  );
}

export default Dashboard;