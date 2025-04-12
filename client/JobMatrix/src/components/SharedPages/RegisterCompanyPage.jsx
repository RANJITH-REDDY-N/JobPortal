import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../../styles/RegisterCompanyPage.module.css';
import CropImageUploader from '../CropImageUploader';
import logo from '../../assets/logo.svg';
import defaultCompanyImage from '../../assets/nocompanyimage2.jpg';
import { VisibilityOffOutlined, VisibilityOutlined } from '@mui/icons-material';
import { registerUser } from '../../services/api';
import CircularProgress from '@mui/material/CircularProgress';

const RegisterCompanyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [companySecretVisible, setCompanySecretVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    companyImage: null,
    companyName: '',
    companyIndustry: '',
    companyDescription: '',
    companySecretKey: '',
    recruiterStartDate: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'RECRUITER',
    profilePhoto: null,
    createNewCompany: true,
  });

  useEffect(() => {
    if (location.state?.formData) {
      setFormData(prev => ({ ...prev, ...location.state.formData }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleImageChange = (file) => {
    setFormData(prev => ({ ...prev, companyImage: file }));
  };

  const handleBack = () => {
    navigate('/signup', { state: { formData } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const apiFormData = new FormData();

      apiFormData.append('user_first_name', formData.firstName);
      apiFormData.append('user_last_name', formData.lastName);
      apiFormData.append('user_email', formData.email);
      apiFormData.append('user_password', formData.password);
      apiFormData.append('user_role', formData.role);
      if (formData.profilePhoto) {
        apiFormData.append('user_profile_photo', formData.profilePhoto);
      }

      apiFormData.append('create_company', 'True');
      apiFormData.append('company_name', formData.companyName);
      apiFormData.append('company_industry', formData.companyIndustry);
      apiFormData.append('company_description', formData.companyDescription);
      apiFormData.append('company_secret_key', formData.companySecretKey);
      if (formData.companyImage) {
        apiFormData.append('company_image', formData.companyImage);
      }
      apiFormData.append('recruiter_start_date', formData.recruiterStartDate);

      const result = await registerUser(apiFormData);

      if (result.error) {
        throw new Error(result.error);
      }

      /**
       *  REDIRECT TO RECRUITER DASHBOARD.
       */ 
        const loginData = {
          user_email: formData.email,
          user_password: formData.password
        };
      
        try {
          const loginRes = await userAuth(loginData);
          if (loginRes && loginRes.token) {
            
            // Save Basic User Details to localStorage for immediate access
            localStorage.setItem('userEmail',loginRes.user_email);
            localStorage.setItem("jwtToken", loginRes.token);
            localStorage.setItem("userRole", loginRes.user_role);
            localStorage.setItem("userId",loginRes.user_id);
      
            // fetch user details
            const userData = await userDetails(loginRes.user_email);
            dispatch(setUser(userData));
      
            nav("/recruiter/jobs");
          } else {
            console.error("Login failed after registration", loginRes.error);
            nav("/login"); // fallback
          }
        } catch (loginErr) {
          console.error("Login error after registration", loginErr);
          nav("/login"); // fallback
        }

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <img src={logo} alt="JobMatrix Logo" className={styles.logo} />
      </div>

      <div className={styles.divider}></div>

      <div className={styles.rightPanel}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <h3 className={styles.signupText}>Create Your Company Profile</h3>

          <div className={styles.imageUploadContainer}>
            <CropImageUploader
              name="companyImage"
              onFileChange={handleImageChange}
              defaultImage={defaultCompanyImage}
              currentImage={formData.companyImage}
              aspectRatio={1}
            />
            <p className={styles.uploadHint}>Recommended size: 500x500px</p>
          </div>

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
            <select
              name="companyIndustry"
              value={formData.companyIndustry}
              onChange={handleChange}
              required
            >
              <option value="" disabled hidden></option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail">Retail</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
            <label className={styles.floatingLabel}>Industry*</label>
          </div>

          <div className={styles.inputGroup}>
            <textarea
              name="companyDescription"
              value={formData.companyDescription}
              onChange={handleChange}
              required
              placeholder=" "
              rows={4}
            />
            <label className={styles.floatingLabel}>Company Description*</label>
          </div>

          <div className={styles.inputGroup}>
            <input
              type={companySecretVisible ? 'text' : 'password'}
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
            <label className={styles.floatingLabel}>Your Start Date*</label>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={handleBack}
              className={styles.secondaryButton}
              disabled={isLoading}
            >
              Back
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Complete Registration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterCompanyPage;
