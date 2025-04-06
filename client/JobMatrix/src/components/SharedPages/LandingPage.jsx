import { Link } from "react-router-dom";
import styles from "../../styles/LandingPage.module.css";
import landingImage from "../../assets/landingpage.jpeg";
import logoImage from "../../assets/logo.svg";

const LandingPage = () => {
  return (
    <div className={styles.container}>
      {/* Left Section - Image & Tagline */}
      <div className={styles.left}>
        <img src={landingImage} alt="Job Opportunities" className={styles.image} />
        <p className={styles.caption}>
          Discover Your Next Career Move. <br />
          Find the perfect job or hire top talent!
        </p>
      </div>

      {/* Divider */}
      <div className={styles.divider}></div>

      {/* Right Section - Logo, Title & Buttons */}
      <div className={styles.right}>
        <img src={logoImage} alt="JobMatrix Logo" className={styles.logo} />
        <h2 className={styles.title}>Connecting Talent with Opportunity</h2>
        <div className={styles.buttons}>
          <Link to="/login" className={`button ${styles.button}`}>
            LOGIN
          </Link>
          <Link to="/signup" className={`button ${styles.button}`}>
            SIGN UP
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
