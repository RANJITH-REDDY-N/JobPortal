import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/SignupPage.module.css";
import { VisibilityOffOutlined, VisibilityOutlined, FileUploadOutlined } from "@mui/icons-material";
import CropImageUploader from "../CropImageUploader";
import logo from "../../assets/logo.svg";
import { registerUser, userAuth, userDetails } from "../../services/api";
import defaultProfilePhoto from '../../assets/noprofilephoto.png';
import { useDispatch } from "react-redux";
import { setUser } from "../../Redux/userSlice";

const SignupPage = () => {
  const nav = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Initialize form data from location state if available
  const [formData, setFormData] = useState(location.state?.formData || {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
    profilePhoto: null,
    adminSecretKey: "",
    ssn: "",
    resume: null,
    recruiterStartDate: "",
    createNewCompany: false,
    companyName: "", 
    companySecretKey: "",
    companyIndustry: "",
    companyDescription: "",
    companyImage: null
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [ssnVisible, setSsnVisible] = useState(false);
  const [companySecretVisible, setCompanySecretVisible] = useState(false);
  const [adminSecretVisible, setAdminSecretVisible] = useState(false);
  

  const calculateStrength = (password) => {
    if (!password || password.length < 8) return { level: 0, label: "Weak", color: "#FF3E36" };
    
    const requirements = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[@!#$%&_-]/.test(password)
    ].filter(Boolean).length;

    if (requirements === 4) return { level: 3, label: "Strong", color: "#0BE881" };
    if (requirements >= 2) return { level: 2, label: "Good", color: "#FFDA36" };
    return { level: 1, label: "Fair", color: "#FF691F" };
  };

  const passwordStrength = calculateStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : 
              type === "file" ? files[0] : 
              value
    }));
  };

  const formatNumber = (input) => {
    const inputStr = String(input);
    
    const digitsOnly = inputStr.replace(/\D/g, '').slice(0, 9);
    
    // Format as XXX-XX-XXXX
    if (digitsOnly.length <= 3) {
      return digitsOnly;
    }
    if (digitsOnly.length <= 5) {
      return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3)}`;
    }
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 5)}-${digitsOnly.slice(5)}`;
  };

  const handleSSNChange = (e) => {
    const formatted = formatNumber(e.target.value)
    const { name, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : 
              type === "file" ? files[0] : 
              formatted
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.role === "RECRUITER" && formData.createNewCompany) {
      nav('/register-company', { 
        state: { formData } // Pass all form data
      });
    } else {
      console.log('Registering user:', formData);
      try {
        const apiFormData = new FormData();
        
        // Map form fields to database columns
        apiFormData.append('user_first_name', formData.firstName);
        apiFormData.append('user_last_name', formData.lastName);
        apiFormData.append('user_email', formData.email);
        apiFormData.append('user_password', formData.password);
        apiFormData.append('user_role', formData.role);
        
        // Handle profile photo if exists
        if (formData.profilePhoto) {
          apiFormData.append('user_profile_photo', formData.profilePhoto);
        }
        
        // Handle role-specific fields
        if (formData.role === "ADMIN" && formData.ssn) {
          apiFormData.append('admin_ssn', formData.ssn);
          apiFormData.append('admin_secret_key', formData.adminSecretKey);
        }
        
        if (formData.role === "APPLICANT" && formData.resume) {
          apiFormData.append('applicant_resume', formData.resume);
        }
  
        // Call the registration API
        const result = await registerUser(apiFormData);
        
        if (result.error) {
          console.error('Registration error:', result.error);
          // setRegistrationError(result.error);
          return;
        }
        
        /**
         *  REDIRECT TO DASHBOARD BASED ON THE ROLE.
         */ 
        if (formData.role === "APPLICANT") {
          const loginData = {
            user_email: formData.email,
            user_password: formData.password
          };
        
          try {
            const loginRes = await userAuth(loginData);
            if (loginRes && loginRes.token) {
              localStorage.setItem("jwtToken", loginRes.token);
              localStorage.setItem("userEmail", loginRes.user_email);
        
              // fetch user details
              const userData = await userDetails(loginRes.user_email);
              dispatch(setUser(userData));
        
              nav("/applicant/explore-jobs");
            } else {
              console.error("Login failed after registration", loginRes.error);
              nav("/login"); // fallback
            }
          } catch (loginErr) {
            console.error("Login error after registration", loginErr);
            nav("/login"); // fallback
          }
        } else if (formData.role === "ADMIN") {
          console.log("Admin Registration Successful");
          const loginData = {
            user_email: formData.email,
            user_password: formData.password
          };
        
          try {
            const loginRes = await userAuth(loginData);
            if (loginRes && loginRes.token) {
              localStorage.setItem("jwtToken", loginRes.token);
              localStorage.setItem("userEmail", loginRes.user_email);
        
              // fetch user details
              const userData = await userDetails(loginRes.user_email);
              dispatch(setUser(userData));
        
              nav('/admin/dashboard');
            } else {
              console.error("Login failed after registration", loginRes.error);
              nav("/login"); // fallback
            }
          } catch (loginErr) {
            console.error("Login error after registration", loginErr);
            nav("/login"); // fallback
          }
        } else {
          nav("/login");
        }


        
      } catch (error) {
        console.error('Registration failed:', error);
        // setRegistrationError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <img src={logo} alt="JobMatrix Logo" className={styles.logo} />
      </div>

      <div className={styles.divider}></div>

      <div className={styles.right}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h1 className={styles.signupText}>Sign Up</h1>

          <div className={styles.profileSection}>
            <div className={styles.cropImageContainer}>
              <CropImageUploader
                name="profilePhoto"
                onFileChange={(file) => setFormData(prev => ({ ...prev, profilePhoto: file }))}
                defaultImage={defaultProfilePhoto}
                currentImage={formData.profilePhoto}
                checkPage="signup"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder=" "
              />
              <label className={styles.floatingLabel}>First Name*</label>
            </div>
            
            <div className={styles.inputGroup}>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder=" "
              />
              <label className={styles.floatingLabel}>Last Name*</label>
            </div>
          </div>

          {/* <hr className={styles.sectionDivider} /> */}

          <div className={styles.inputGroup}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder=" "
            />
            <label className={styles.floatingLabel}>Email*</label>
          </div>

          <div className={styles.inputGroup}>
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder=" "
              className={styles.passwordInput}
            />
            <label className={styles.floatingLabel}>Password*</label>
            <div className={styles.passwordIcons}>
              <span
                className={styles.eyeIcon}
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
              </span>
            </div>
            
          </div>
          {formData.password.length > 0 && (<div className={styles.passwordStrengthDiv}>
          
              <div className={styles.passwordStrengthContainer}>
                <span className={styles.strengthLabel}>Strength:</span>
                <div className={styles.passwordStrengthBar}>
                  <div style={{ 
                    width: `${(passwordStrength.level + 1) * 25}%`,
                    backgroundColor: passwordStrength.color 
                  }}></div>
                </div>
                <span 
                  className={styles.strengthText}
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </span>
              </div>
            
          </div>)}
          

          <div className={styles.inputGroup}>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select Role*</option>
              <option value="APPLICANT">Applicant</option>
              <option value="RECRUITER">Recruiter</option>
              <option value="ADMIN">Admin</option>
            </select>
            <label className={styles.floatingLabel}>Role*</label>
          </div>

          {/* <hr className={styles.sectionDivider} /> */}

          {/* Applicant Fields */}
          {formData.role === "APPLICANT" && (
            <div className={styles.inputGroup}>
              <input
                type="file"
                name="resume"
                onChange={handleChange}
                accept=".pdf,.doc,.docx"
                id="resume-upload"
                style={{ display: 'none' }}
              />
              <div className={styles.fileUploadContainer}>
              <label htmlFor="resume-upload" className={styles.fileUploadLabel}>
                <div className={styles.uploadFileText}><span className={styles.fileUploadIcon}><FileUploadOutlined/></span><span>Upload Resume</span></div>
              </label>
              {formData.resume && (
                <span className={styles.fileName}>{formData.resume.name}</span>
              )}
              </div>
            </div>
          )}

          {/* Admin Fields */}
          {formData.role === "ADMIN" && (
            <>
              <div className={styles.inputGroup}>
                <input
                  type={adminSecretVisible ? "text" : "password"}
                  name="adminSecretKey"
                  value={formData.adminSecretKey}
                  onChange={handleChange}
                  required
                  placeholder=""
                  className={styles.passwordInput}
                />
                <label className={styles.floatingLabel}>Admin Secret Key</label>
                <div className={styles.passwordIcons}>
                  <span
                    className={styles.eyeIcon}
                    onClick={() => setAdminSecretVisible(!adminSecretVisible)}
                  >
                    {adminSecretVisible ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                  </span>
                </div>
              </div>
              <div className={styles.inputGroup}>
                <input
                  type={ssnVisible ? "text" : "password"}
                  name="ssn"
                  value={formData.ssn}
                  onChange={handleSSNChange}
                  required
                  placeholder=""
                  pattern="\d{3}-\d{2}-\d{4}"
                  className={styles.passwordInput}
                />
                <label className={styles.floatingLabel}>SSN</label>
                <div className={styles.passwordIcons}>
                  <span
                    className={styles.eyeIcon}
                    onClick={() => setSsnVisible(!ssnVisible)}
                  >
                    {ssnVisible ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Recruiter Fields */}
          {formData.role === "RECRUITER" && (
            <>
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  name="createNewCompany"
                  checked={formData.createNewCompany}
                  onChange={handleChange}
                  id="create-company"
                />
                <label htmlFor="create-company">Create New Company</label>
              </div>
              
              {!formData.createNewCompany && (
                <>
                  <div className={styles.inputGroup}>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      placeholder=" "
                    />
                    <label className={styles.floatingLabel}>Company Name*</label>
                  </div>
                  <div className={styles.inputGroup}>
                    <input
                      type={companySecretVisible ? "text" : "password"}
                      name="companySecretKey"
                      value={formData.companySecretKey}
                      onChange={handleChange}
                      required
                      placeholder=" "
                      className={styles.passwordInput}
                    />
                    <label className={styles.floatingLabel}>Company Secret Key*</label>
                    <div className={styles.passwordIcons}>
                      <span
                        className={styles.eyeIcon}
                        onClick={() => setCompanySecretVisible(!companySecretVisible)}
                      >
                        {companySecretVisible ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                      </span>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <input
                      type="date"
                      name="recruiterStartDate"
                      value={formData.recruiterStartDate}
                      onChange={handleChange}
                      required
                    />
                    <label className={styles.floatingLabel}>Start Date*</label>
                  </div>
                </>
              )}
            </>
          )}

          <button type="submit" className={styles.submitButton}>
            {formData.role === "RECRUITER" && formData.createNewCompany ? "Continue To Create Company" : "Register"}
          </button>

          <p className={styles.loginLink}>
            Already a user? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;