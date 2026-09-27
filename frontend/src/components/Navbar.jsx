import { Link } from "react-router-dom";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Brain size={22} />
          </span>

          <span className="brand-name">HireAI</span>
        </Link>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#features" onClick={() => setMenuOpen(false)}>
            Features
          </a>

          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How It Works
          </a>

          <a href="#technology" onClick={() => setMenuOpen(false)}>
            Technology
          </a>

          <Link to="/login" onClick={() => setMenuOpen(false)}>
            Login
          </Link>

          <Link
            to="/register"
            className="nav-button"
            onClick={() => setMenuOpen(false)}
          >
            Get Started
          </Link>
        </nav>

        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;