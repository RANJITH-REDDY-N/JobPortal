import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiUsers, FiBriefcase, FiHome } from "react-icons/fi";
import { MdBusiness } from "react-icons/md";

import styles from "../../styles/AdminLayout.module.css";
import defaultProfilePhoto from "../../assets/noprofilephoto.png";
import logo from "../../assets/logo.svg";

const adminNavLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: <FiHome /> },
  { to: "/admin/users", label: "Users", icon: <FiUsers /> },
  { to: "/admin/companies", label: "Companies", icon: <MdBusiness /> },
  { to: "/admin/jobs", label: "Jobs", icon: <FiBriefcase /> },
  { to: "/admin/settings", label: "Profile", icon: <FiUsers /> },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(state => state.user.user);
  const fullName = user ? `${user.user_first_name || ""} ${user.user_last_name || ""}` : "Admin";

  const activeIndex = adminNavLinks.findIndex(link =>
    location.pathname.startsWith(link.to)
  );

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.topSection}>
          <img src={logo} alt="JobMatrix Logo" className={styles.logo} />

          <div className={styles.profileRow}>
            <img
              src={user?.user_profile_photo || defaultProfilePhoto}
              alt="Admin"
              className={styles.profilePic}
            />
            <span className={styles.profileName}>{fullName}</span>
          </div>

          <div className={styles.navLinks}>
            {adminNavLinks.map((link, index) => (
              <NavLink key={link.to} to={link.to} className={styles.navItem}>
                {activeIndex === index && (
                  <div className={styles.indicator} style={{ top: `${index * 3.6}rem` }} />
                )}
                <div className={styles.icon}>{link.icon}</div>
                <span className={activeIndex === index ? styles.activeText : styles.inactiveText}>
                  {link.label}
                </span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className={styles.logoutLink} onClick={handleLogout}>
          <span>Logout</span>
        </div>
      </div>

      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
