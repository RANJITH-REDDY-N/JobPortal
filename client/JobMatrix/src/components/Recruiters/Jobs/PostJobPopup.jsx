import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../../styles/PostJobPopup.module.css';
import { createJobPosting } from '../../../services/api';
import { 
  Close,
  WorkOutline,
  LocationOn,
  AttachMoney,
  Description,
  Send,
  Edit,
  Info,
  Checklist,
  School,
  Star,
  Groups
} from '@mui/icons-material';

const PostJobPopup = ({ onClose, recruiterId, refreshJobs, jobData, onSave }) => {
  // Parse description into sections when editing
  const parseDescription = (desc) => {
    if (!desc) return {
      about_role: '',
      key_responsibilities: '',
      required_qualifications: '',
      preferred_qualifications: '',
      join_us: ''
    };

    // Simple parsing logic - can be enhanced as needed
    const sections = desc.split('\n\n').reduce((acc, section) => {
      if (section.includes('[About the Role]')) {
        acc.about_role = section.replace('[About the Role]\n', '');
      } else if (section.includes('[Key Responsibilities]')) {
        acc.key_responsibilities = section.replace('[Key Responsibilities]\n', '');
      } else if (section.includes('[Required Qualifications]')) {
        acc.required_qualifications = section.replace('[Required Qualifications]\n', '');
      } else if (section.includes('[Preferred Qualifications]')) {
        acc.preferred_qualifications = section.replace('[Preferred Qualifications]\n', '');
      }
      return acc;
    }, {});

    return {
      about_role: sections.about_role || '',
      key_responsibilities: sections.key_responsibilities || '',
      required_qualifications: sections.required_qualifications || '',
      preferred_qualifications: sections.preferred_qualifications || '',
      join_us: sections.join_us || ''
    };
  };

  const formatDescription = () => {
    return `[About the Role]\n${formData.about_role}\n\n` +
           `[Key Responsibilities]\n${formData.key_responsibilities}\n\n` +
           `[Required Qualifications]\n${formData.required_qualifications}\n\n` +
           `[Preferred Qualifications]\n${formData.preferred_qualifications}`;
  };

  const [formData, setFormData] = useState({
    job_title: '',
    about_role: '',
    key_responsibilities: '',
    required_qualifications: '',
    preferred_qualifications: '',
    join_us: '',
    job_location: '',
    job_salary: 0
  });

  useEffect(() => {
    if (jobData) {
      setFormData({
        job_title: jobData.job_title || '',
        job_location: jobData.job_location || '',
        job_salary: jobData.job_salary || 0,
        ...parseDescription(jobData.job_description)
      });
    }
  }, [jobData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const apiData = {
        job_title: formData.job_title,
        job_description: formatDescription(),
        job_location: formData.job_location,
        job_salary: formData.job_salary,
        recruiter_id: recruiterId
      };

      if (jobData) {
        await onSave(apiData);
      } else {
        await createJobPosting(apiData);
        refreshJobs();
      }
      onClose();
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  return (
    <AnimatePresence>
      <div className={styles.jobPopupOverlay} onClick={onClose}>
        <motion.div 
          className={styles.jobPopupContainer}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.jobPopupHeader}>
            <div>
              <h2 className={styles.jobPopupTitle}>
                {jobData ? "Edit Job Posting" : "Create New Job Posting"}
              </h2>
            </div>
            <button className={styles.jobPopupCloseButton} onClick={onClose}>
              <Close className={styles.jobPopupCloseIcon} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.jobPopupForm}>
            {/* Basic Information Section */}
            <div className={styles.jobPopupSection}>
              <div className={styles.jobPopupSectionHeader}>
                <h3 className={styles.jobPopupSectionTitle}>Basic Information</h3>
              </div>
              
              <div className={styles.jobPopupFormRow}>
                <div className={styles.jobPopupFormGroup}>
                  <label className={styles.jobPopupLabel}>
                    <WorkOutline className={styles.jobPopupLabelIcon} />
                    Job Title*
                  </label>
                  <input
                    type="text"
                    name="job_title"
                    className={styles.jobPopupInput}
                    value={formData.job_title}
                    onChange={handleChange}
                    required
                    placeholder="Senior Frontend Developer"
                  />
                </div>

                <div className={styles.jobPopupFormGroup}>
                  <label className={styles.jobPopupLabel}>
                    <LocationOn className={styles.jobPopupLabelIcon} />
                    Location*
                  </label>
                  <input
                    type="text"
                    name="job_location"
                    className={styles.jobPopupInput}
                    value={formData.job_location}
                    onChange={handleChange}
                    required
                    placeholder="New York, NY or Remote"
                  />
                </div>

                <div className={styles.jobPopupFormGroup}>
                  <label className={styles.jobPopupLabel}>
                    <AttachMoney className={styles.jobPopupLabelIcon} />
                    Annual Salary*
                  </label>
                  <div className={styles.jobPopupSalaryInput}>
                    <span className={styles.jobPopupSalaryPrefix}>$</span>
                    <input
                      type="number"
                      name="job_salary"
                      className={styles.jobPopupSalaryInputField}
                      value={formData.job_salary}
                      onChange={handleChange}
                      required
                      min="0"
                      step="any"
                      placeholder="85000"
                      inputMode="decimal"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details Section */}
            <div className={styles.jobPopupSection}>
              <div className={styles.jobPopupSectionHeader}>
                <h3 className={styles.jobPopupSectionTitle}>Job Details</h3>
              </div>

              {[
                { 
                  name: 'about_role', 
                  label: 'About the Role', 
                  icon: Info,
                  required: true,
                  placeholder: 'Describe the purpose and importance of this role...'
                },
                { 
                  name: 'key_responsibilities', 
                  label: 'Key Responsibilities', 
                  icon: Checklist,
                  required: true,
                  placeholder: 'List the main duties and expectations...'
                },
                { 
                  name: 'required_qualifications', 
                  label: 'Required Qualifications', 
                  icon: School,
                  required: true,
                  placeholder: 'Essential skills, education, and experience...'
                },
                { 
                  name: 'preferred_qualifications', 
                  label: 'Preferred Qualifications', 
                  icon: Star,
                  required: false,
                  placeholder: 'Bonus qualifications that would be nice to have...'
                }
              ].map((field) => (
                <div className={styles.jobPopupFormGroup} key={field.name}>
                  <label className={styles.jobPopupLabel}>
                    <field.icon className={styles.jobPopupLabelIcon} />
                    {field.label}{field.required ? '*' : ''}
                  </label>
                  <textarea
                    name={field.name}
                    className={`${styles.jobPopupInput} ${styles.jobPopupTextarea}`}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required={field.required}
                    rows={3}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>

            <div className={styles.jobPopupFormActions}>
              <button 
                type="button" 
                className={styles.jobPopupCancelButton} 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.jobPopupSubmitButton}
              >
                {jobData ? (
                  <>
                    <Edit className={styles.jobPopupButtonIcon} />
                    Update Job
                  </>
                ) : (
                  <>
                    <Send className={styles.jobPopupButtonIcon} />
                    Post Job
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PostJobPopup;