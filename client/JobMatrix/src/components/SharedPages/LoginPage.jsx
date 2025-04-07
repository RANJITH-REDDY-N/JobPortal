import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { VisibilityOutlined, VisibilityOffOutlined } from "@mui/icons-material";
import styles from "../../styles/LoginPage.module.css";
import logo from "../../assets/logo.svg";
import { userAuth, userDetails } from "../../services/api";
import { useDispatch } from "react-redux";
import { setUser } from "../../Redux/userSlice";

const LoginPage = () => {
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: "ranjithrn@applicant.com",
    password: "Aa@12345",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * REDUX RELATED
   */
    const dispatch = useDispatch();
  /**
   * REDUX RELATED ENDED
   */

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateInputs = () => {
    if (!formData.email || !formData.password) {
      return "Email and Password are required!";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Invalid email format!";
    }
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters!";
    }
    return null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = {
        user_email: formData.email,
        user_password: formData.password,
      };
      const response = await userAuth(data);
      if (response && response.token) {
        localStorage.setItem("jwtToken", response.token);
        const userData = await userDetails(response.user_email);
        
        // Dispatch user data to Redux
        try {
          dispatch(setUser(userData));
        } catch (error) {
          console.error("Dispatch error:", error);
        }

        // Save userEmail localStorage for immediate access
        localStorage.setItem('userEmail',response.user_email);

        if(response.user_role === 'APPLICANT') navigate("/applicant/explore-jobs");
        else if(response.user_role === 'RECRUITER') navigate('/recruiter/jobs');
        else if(response.user_role === 'ADMIN') navigate('/admin/dashboard');

      } else {
        setError(response.message || "Invalid email or password!", response);
      }
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <img src={logo} alt="JobMatrix Logo" className={styles.logo} />
      </div>

      <div className={styles.divider}></div>

      <div className={styles.right}>
        <form onSubmit={handleLogin} className={styles.form}>
          <h1 className={styles.loginText}>Login</h1>

          <div className={styles.inputGroup}>
            <input
              type="email"
              name="email"
              className={styles.input}
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder=" "
            />
            <label className={styles.floatingLabel}>Email address*</label>
          </div>

          <div className={styles.inputGroup}>
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              className={styles.input}
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder=" "
            />
            <label className={styles.floatingLabel}>Password*</label>
            <span
              title={passwordVisible ? "Hide Password" : "Show Password"}
              className={styles.eyeIcon}
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
            </span>
          </div>

          <div className={styles.forgotPassword}>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>


          {error && <div style={{ color: "red" }}>{error}</div>}
          <button
            type="submit"
            className={`${styles.button} button`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "CONTINUE"}
          </button>
        </form>

        <p className={styles.signup}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
