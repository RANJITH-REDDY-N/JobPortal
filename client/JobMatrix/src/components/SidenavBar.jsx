import { NavLink, useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/SidenavBar.module.css";
import logo from "../assets/logo.svg";
import logoMini from "../assets/logo-icon.svg";
import defaultUser from "../assets/noprofilephoto.png";
import { useDispatch, useSelector } from "react-redux";

import bagActive from "../assets/SideNavIcon-Images/basil_bag-solid-active.svg";
import bagInactive from "../assets/SideNavIcon-Images/basil_bag-solid-inactive.svg";
import bookmarkActive from "../assets/SideNavIcon-Images/bookmarks-active.svg";
import bookmarkInactive from "../assets/SideNavIcon-Images/bookmarks-inactive.svg";
import fileCheckActive from "../assets/SideNavIcon-Images/file-check-active.svg";
import fileCheckInactive from "../assets/SideNavIcon-Images/file-check-inactive.svg";
import logoutIcon from "../assets/SideNavIcon-Images/logout-inactive.svg";
import { useEffect } from "react";
import { fetchUserData } from '../Redux/userSlice';

const SidenavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchUserData(localStorage.getItem('userEmail')));
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getIndicatorPosition = () => {
    if (location.pathname.includes("/explore-jobs")) return "0rem";
    if (location.pathname.includes("/bookmarks")) return "4.2rem";
    if (location.pathname.includes("/applied-jobs")) return "8.6rem";
    if (location.pathname.includes("/profile")) return "13rem";
    return "0rem";
  };
  const userData = useSelector((state)=>state.user?.user);


  return (
    <div className={styles.sidebar}>
      <div className={styles.topSection}>
      <img src={logo} alt="JobMatrix Logo" className={`${styles.logo} ${styles.fullLogo}`} />
      <img src={logoMini} alt="JobMatrix Mini Logo" className={`${styles.logoMini}`} />


        <nav className={styles.navLinks}>
          <div
            className={styles.indicator}
            style={{ top: getIndicatorPosition() }}
          />

          <NavLink
            to="/applicant/explore-jobs"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
          >
            {({ isActive }) => (
              <>
                <img
                  src={isActive ? bagActive : bagInactive}
                  alt="Jobs"
                  className={styles.icon}
                />
                <span className={isActive ? styles.activeText : styles.inactiveText}>Jobs</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/applicant/bookmarks"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
          >
            {({ isActive }) => (
              <>
                <img
                  src={isActive ? bookmarkActive : bookmarkInactive}
                  alt="Bookmarks"
                  className={styles.icon}
                />
                <span className={isActive ? styles.activeText : styles.inactiveText}>Bookmarks</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/applicant/applied-jobs"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
          >
            {({ isActive }) => (
              <>
                <img
                  src={isActive ? fileCheckActive : fileCheckInactive}
                  alt="Applied"
                  className={styles.icon}
                />
                <span className={isActive ? styles.activeText : styles.inactiveText}>Applied</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/applicant/profile/personal-info"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
          >
            {({ isActive }) => (
              <>
                <img
                  src={userData?.user_profile_photo || defaultUser}
                  alt="Profile"
                  className={styles.profilePic}
                />
                <span className={isActive ? styles.activeText : styles.inactiveText} style={isActive?{color:'var(--blue)'}:{color:'var(--english-violet)'}}>
                  {userData?.user_first_name+" "+userData?.user_last_name || Profile}
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
  );
};

export default SidenavBar;
