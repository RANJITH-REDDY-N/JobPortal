import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import styles from "../../styles/SidenavBar.module.css";
import logo from "../../assets/logo.svg";
import logoMini from "../../assets/logo-icon.svg";
import logoutIcon from "../../assets/SideNavIcon-Images/logout-inactive.svg";
import dashboardActive from "../../assets/SideNavIcon-Images/dashboard-active.svg";
import dashboardInactive from "../../assets/SideNavIcon-Images/dashboard-inactive.svg";
import usersActive from "../../assets/SideNavIcon-Images/users-active.svg";
import usersInactive from "../../assets/SideNavIcon-Images/users-inactive.svg";
import companiesActive from "../../assets/SideNavIcon-Images/companies-active.svg";
import companiesInactive from "../../assets/SideNavIcon-Images/companies-inactive.svg";
import jobsActive from "../../assets/SideNavIcon-Images/basil_bag-solid-active.svg";
import jobsInactive from "../../assets/SideNavIcon-Images/basil_bag-solid-inactive.svg";
import defaultUser from "../../assets/noprofilephoto.png";
import { fetchUserData } from "../../Redux/userSlice";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.user);

  useEffect(() => {
    dispatch(fetchUserData(localStorage.getItem("userEmail")));
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getIndicatorPosition = () => {
    if (location.pathname.includes("/dashboard")) return "0rem";
    if (location.pathname.includes("/users")) return "4.3rem";
    if (location.pathname.includes("/companies")) return "8.6rem";
    if (location.pathname.includes("/jobs")) return "12.9rem";
    if (location.pathname.includes("/settings")) return "17.2rem";
    return "0rem";
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.topSection}>
          <img src={logo} alt="JobMatrix Logo" className={`${styles.logo} ${styles.fullLogo}`} />
          <img src={logoMini} alt="Mini Logo" className={styles.logoMini} />

          <nav className={styles.navLinks}>
            <div className={styles.indicator} style={{ top: getIndicatorPosition() }} />

            <NavLink to="/admin/dashboard" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}>
              {({ isActive }) => (
                <>
                  <img src={isActive ? dashboardActive : dashboardInactive} alt="Dashboard" className={styles.icon} />
                  <span className={isActive ? styles.activeText : styles.inactiveText}>Dashboard</span>
                </>
              )}
            </NavLink>

            <NavLink to="/admin/users" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}>
              {({ isActive }) => (
                <>
                  <img src={isActive ? usersActive : usersInactive} alt="Users" className={styles.icon} />
                  <span className={isActive ? styles.activeText : styles.inactiveText}>Users</span>
                </>
              )}
            </NavLink>

            <NavLink to="/admin/companies" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}>
              {({ isActive }) => (
                <>
                  <img src={isActive ? companiesActive : companiesInactive} alt="Companies" className={styles.icon} />
                  <span className={isActive ? styles.activeText : styles.inactiveText}>Companies</span>
                </>
              )}
            </NavLink>

            <NavLink to="/admin/jobs" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}>
              {({ isActive }) => (
                <>
                  <img src={isActive ? jobsActive : jobsInactive} alt="Jobs" className={styles.icon} />
                  <span className={isActive ? styles.activeText : styles.inactiveText}>Jobs</span>
                </>
              )}
            </NavLink>

            <NavLink to="/admin/settings" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}>
              {({ isActive }) => (
                <>
                  <img
                    src={userData?.user_profile_photo || defaultUser}
                    alt="Profile"
                    className={styles.profilePic}
                  />
                  <span className={isActive ? styles.activeText : styles.inactiveText}>
                    {userData?.user_first_name + " " + userData?.user_last_name || "Profile"}
                  </span>
                </>
              )}
            </NavLink>
          </nav>
        </div>

        <span className={styles.logoutLink} onClick={handleLogout}>
          <img src={logoutIcon} alt="Logout" className={styles.icon} />
          <span>Logout</span>
        </span>
      </div>

      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
