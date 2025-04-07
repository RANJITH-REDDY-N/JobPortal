import { NavLink, useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/SidenavBar.module.css";
import logo from "../assets/logo.svg";
import logoMini from "../assets/logo-icon.svg";
import logoutIcon from "../assets/SideNavIcon-Images/logout-inactive.svg";
import bagActive from "../assets/SideNavIcon-Images/basil_bag-solid-active.svg";
import bagInactive from "../assets/SideNavIcon-Images/basil_bag-solid-inactive.svg";
import defaultUser from "../assets/noprofilephoto.png";
import { fetchUserData } from '../Redux/userSlice';
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

const RecruiterSidenavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  useEffect(() => {
      dispatch(fetchUserData(localStorage.getItem('userEmail')));
    }, [dispatch]);
  const userData = useSelector((state)=>state.user?.user);


  const getIndicatorPosition = () => {
    if (location.pathname.includes("/jobs")) return "0rem";
    if (location.pathname.includes("/company-info")) return "4.2rem";
    if (location.pathname.includes("/profile")) return "8.4rem";
    return "0rem";
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };
  
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
              <NavLink to="/recruiter/jobs"
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

              <NavLink to="/recruiter/company-info"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                {({ isActive }) => (
                  <>
                    <img
                      src={isActive ? bagActive : bagInactive}
                      alt="CompanyInfo"
                      className={styles.icon}
                    />
                    <span className={isActive ? styles.activeText : styles.inactiveText}>Company Info</span>
                  </>
                )}
              </NavLink>

              <NavLink
                  to="/recruiter/profile/personal-info"
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

export default RecruiterSidenavBar;
