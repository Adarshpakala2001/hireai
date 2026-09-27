import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  FileText,
  LogOut,
  ChevronLeft,
} from "lucide-react";

function RecruiterNav() {
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
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Jobs",
      path: "/admin/jobs",
      icon: BriefcaseBusiness,
    },
    {
      label: "Candidates",
      path: "/admin/candidates",
      icon: Users,
    },
    {
      label: "Applications",
      path: "/admin/applications",
      icon: FileText,
    },
  ];

  return (
    <div className="recruiter-nav">
      <div className="recruiter-nav-inner">
        <div className="recruiter-nav-left">
          <Link to="/admin/dashboard" className="recruiter-brand">
            <span className="recruiter-brand-icon">H</span>
            <span>HireAI Recruiter</span>
          </Link>

          <nav className="recruiter-nav-links">
            {links.map((link) => {
              const Icon = link.icon;

              const isActive =
                location.pathname === link.path ||
                location.pathname.startsWith(`${link.path}/`);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`recruiter-nav-link ${
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

        <div className="recruiter-nav-actions">
          <button
            type="button"
            className="recruiter-back-button"
            onClick={() => navigate(-1)}
            title="Go back"
          >
            <ChevronLeft size={17} />
            Back
          </button>

          <button
            type="button"
            className="recruiter-logout-button"
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

export default RecruiterNav;