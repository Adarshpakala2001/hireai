import { Link, useLocation } from "react-router-dom";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  function closeMenu() {
    setMenuOpen(false);
  }

  /*
   * Keep the full navbar on:
   * - Home
   * - Login
   * - Register
   *
   * Hide it everywhere inside the authenticated workspace.
   */
  const publicPages = [
    "/",
    "/login",
    "/register",
  ];

  const isPublicPage = publicPages.includes(
    location.pathname
  );

  if (!isPublicPage) {
    return null;
  }

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Brand */}
        <Link
          to="/"
          className="brand"
          onClick={closeMenu}
        >
          <span className="brand-icon">
            <Brain size={22} />
          </span>

          <span className="brand-name">
            HireAI
          </span>
        </Link>

        {/* Navigation */}
        <nav
          className={`nav-links ${
            menuOpen ? "open" : ""
          }`}
        >

          {/* Features */}
          <a
            href="/#features"
            onClick={closeMenu}
          >
            Features
          </a>

          {/* How It Works */}
          <a
            href="/#how-it-works"
            onClick={closeMenu}
          >
            How It Works
          </a>

          {/* Technology */}
          <a
            href="/#technology"
            onClick={closeMenu}
          >
            Technology
          </a>

          {/* Login */}
          <Link
            to="/login"
            onClick={closeMenu}
          >
            Login
          </Link>

          {/* Get Started */}
          <Link
            to="/register"
            className="nav-button"
            onClick={closeMenu}
          >
            Get Started
          </Link>

        </nav>

        {/* Mobile Menu */}
        <button
          className="mobile-menu-button"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
          aria-label="Toggle navigation"
          type="button"
        >
          {menuOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

      </div>
    </header>
  );
}

export default Navbar;