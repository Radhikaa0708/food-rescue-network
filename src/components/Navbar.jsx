import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link to="/" className="brand">
          <div className="brand-mark">R</div>
          <div className="brand-name">Rescue Route</div>
        </Link>

        <ul className="nav-list">
          <li><a href="/#problem">The Problem</a></li>
          <li><a href="/#how">How It Works</a></li>
          <li><a href="/#features">Features</a></li>
          <li>
            <Link to="/dashboard" className={pathname === "/dashboard" ? "active" : ""}>
              Dashboard
            </Link>
          </li>
        </ul>

        <Link to="/dashboard" className="nav-cta">
          List Surplus
        </Link>
      </div>
    </header>
  );
}
