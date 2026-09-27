import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  UserCircle,
  Brain,
  LogOut,
  ChevronLeft,
} from "lucide-react";

function CandidateNav() {
  const location = useLocation();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_role");

    navigate("/login");
  }

  const links = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Jobs",
      path: "/jobs",
      icon: BriefcaseBusiness,
    },
    {
      label: "My Applications",
      path: "/applications",
      icon: FileText,
    },
    {
      label: "Resume",
      path: "/resumes",
      icon: FileText,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: UserCircle,
    },
    {
      label: "AI Analysis",
      path: "/analysis",
      icon: Brain,
    },
  ];

  return (
    <div className="candidate-nav">
      <div className="candidate-nav-inner">
        <div className="candidate-nav-left">
          <Link
            to="/dashboard"
            className="candidate-brand"
          >
            <span className="candidate-brand-icon">
              <Brain size={20} />
            </span>

            <span>HireAI</span>
          </Link>

          <nav className="candidate-nav-links">
            {links.map((link) => {
              const Icon = link.icon;

              const isActive =
                location.pathname === link.path ||
                location.pathname.startsWith(
                  `${link.path}/`
                );

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`candidate-nav-link ${
                    isActive ? "active" : ""
                  }`}
                >
                  <Icon size={17} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="candidate-nav-actions">
          <button
            type="button"
            className="candidate-back-button"
            onClick={() => navigate(-1)}
            title="Go back"
          >
            <ChevronLeft size={17} />
            Back
          </button>

          <button
            type="button"
            className="candidate-logout-button"
            onClick={logout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default CandidateNav;