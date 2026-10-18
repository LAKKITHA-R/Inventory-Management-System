
import { NavLink, useNavigate } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Overview", icon: "◫" },
  { to: "/products", label: "Products", icon: "▦" },
  { to: "/low-stock", label: "Low stock", icon: "⚑" },
  { to: "/stock-management", label: "Stock movement", icon: "↕" },
  { to: "/stock-history", label: "Transactions", icon: "◷" },
  { to: "/createbill", label: "Create Bill", icon: "＋" },
  { to: "/billing", label: "Billing History", icon: "▤" },
  {
    to: "/monthly-analysis",
    label: "Monthly Analysis",
    icon: "▤",
    adminOnly: true,
  },
];

export default function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const role = (localStorage.getItem("role") || "STAFF")
    .replace("ROLE_", "")
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    navigate("/", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          R<span>+</span>
        </div>

        <div className="brand-copy">
          <strong>ROBOTICS</strong>
          <small>INVENTORY WORKSPACE</small>
        </div>
      </div>

      <div className="sidebar-label">WORKSPACE</div>

      <nav className="nav-links" aria-label="Main navigation">
        {links
          .filter((link) => !link.adminOnly || role === "ADMIN")
          .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              <span className="nav-icon" aria-hidden="true">
                {link.icon}
              </span>

              <span>{link.label}</span>

              {link.to === "/low-stock" && (
                <span className="nav-dot" />
              )}
            </NavLink>
          ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="profile-row">
          <div className="avatar">
            {username.slice(0, 1).toUpperCase()}
          </div>

          <div className="profile-copy">
            <strong>{username}</strong>
            <small>{role}</small>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
          >
            ↗
          </button>
        </div>
      </div>
    </aside>
  );
}
