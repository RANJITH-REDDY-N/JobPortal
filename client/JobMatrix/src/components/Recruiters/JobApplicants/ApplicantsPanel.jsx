import React, { useState, useEffect } from 'react';
import styles from '../../../styles/ApplicantsPanel.module.css';
import { 
    Close, Download, Email, Person, CheckCircle, 
    Cancel, Comment, ArrowBack, ChevronLeft, 
    ChevronRight, Edit, Save, Visibility, Work,
    School, Code
} from '@mui/icons-material';
import { userDetails } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion'; 
import { SlBadge } from 'react-icons/sl';

const ApplicantsPanel = ({ job, onClose, applications, onStatusChange, 
  applicantsListCurrentPage, setApplicantsListCurrentPage, applicantsListTotalPages, handleViewApplicants, selectedStatus }) => {
  const [commentText, setCommentText] = useState('');
  const [expandedApplicant, setExpandedApplicant] = useState(null);
  const [applicantDetails, setApplicantDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('skills');
  const [comments, setComments] = useState({});
  

  const handleViewResume = (resumeUrl) => {
    window.open(resumeUrl, '_blank');
  };

  const handleInputComment = (e, applicationId) => {
    console.log("handling the comment",e.target.value)
    setComments(prev => ({
      ...prev,
      [applicationId]: e.target.value
    }));
  };

  const paginate = (pageNumber) => setApplicantsListCurrentPage(pageNumber);

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const toggleApplicantDetails = async (application) => {
    const applicationId = application.application_id;
    if (expandedApplicant === applicationId) {
      setExpandedApplicant(null);
      return;
    }

    setLoadingDetails(true);
    setExpandedApplicant(applicationId);
    setActiveTab('skills');

    try {
      const response = await userDetails(application.applicant_details.email);
      setApplicantDetails(prev => ({
        ...prev,
        [applicationId]: response
      }));
    } catch (error) {
      console.error('Error fetching applicant details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Inside your component
useEffect(() => {
  if (applications.results) {
    const initialComments = {};
    applications.results.forEach(app => {
      if (app.comment) {
        initialComments[app.application_id] = app.comment;
      }
    });
    setComments(initialComments);
  }
}, [applications.results]);

  const renderTabContent = (details) => {
    if (!details) return null;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className={styles.tabContent}
        >
          {activeTab === 'skills' && (
            <div className={styles.skillsGrid}>
              {details.skills?.length > 0 ? (
                details.skills.map(skill => (
                  <motion.div
                    key={skill.skill_id}
                    className={styles.skillCard}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className={styles.skillHeader}>
                      <span className={styles.skillName}>{skill.skill_name}</span>
                      <span className={styles.skillDuration}>{skill.skill_years_of_experience} yrs</span>
                    </div>
                    <div className={styles.skillProgress}>
                      <motion.div 
                        className={styles.progressBar}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(skill.skill_years_of_experience * 20, 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </motion.div>
                ))
              ) : (
                <p>No skills listed</p>
              )}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className={styles.experienceContainer}>
              {details.work_experience?.length > 0 ? (
                <div className={styles.experienceScroller}>
                  {details.work_experience.map(exp => (
                    <div key={exp.work_experience_id} className={styles.experienceCard}>
                      <div className={styles.experienceHeader}>
                        <h5>{exp.work_experience_job_title}</h5>
                        {exp.work_experience_is_currently_working ? (
                          <span className={styles.statusCurrent}>Current</span>
                        ) : (
                          <span className={styles.statusPast}>Past</span>
                        )}
                      </div>
                      <p className={styles.companyInfo}>{exp.work_experience_company}</p>
                      <div className={styles.dateRange}>
                        {new Date(exp.work_experience_start_date).toLocaleDateString()} -{' '}
                        {exp.work_experience_is_currently_working 
                          ? 'Present' 
                          : new Date(exp.work_experience_end_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No work experience listed</p>
              )}
            </div>
          )}

          {activeTab === 'education' && (
            <div className={styles.educationContainer}>
              {details.education?.length > 0 ? (
                <div className={styles.educationScroller}>
                  {details.education.map(edu => (
                    <div key={edu.education_id} className={styles.educationCard}>
                      <div className={styles.educationHeader}>
                        <h5>{edu.education_school_name}</h5>
                        {edu.education_is_currently_enrolled ? (
                          <span className={styles.statusOngoing}>In Progress</span>
                        ) : (
                          <span className={styles.statusCompleted}>
                            <SlBadge/> {edu.education_gpa ? `${edu.education_gpa} GPA` : 'Completed'}
                          </span>
                        )}
                      </div>
                      <p className={styles.degreeInfo}>
                        {edu.education_degree_type} in {edu.education_major}
                      </p>
                      <div className={styles.dateRange}>
                        {new Date(edu.education_start_date).toLocaleDateString()} -{' '}
                        {edu.education_is_currently_enrolled 
                          ? 'Present' 
                          : new Date(edu.education_end_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No education listed</p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderApplicantDetails = (applicationId) => {
    const details = applicantDetails[applicationId];
    if (!details) return null;

    return (
      <div className={styles.applicantDetails}>
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'skills' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            <Code fontSize="small" /> Skills
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'experience' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('experience')}
          >
            <Work fontSize="small" /> Experience
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'education' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('education')}
          >
            <School fontSize="small" /> Education
          </button>
        </div>

        <div className={styles.tabContentWrapper}>
          {renderTabContent(details)}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.panelContainer}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <button onClick={onClose} className={styles.backButton}>
            <ArrowBack />
          </button>
          <h2>{job.job_title}</h2>
        </div>
        
        <div className={styles.sidebarMenu}>
          <div className={styles.menuSection}>
            <h3>APPLICANTS</h3>
            <div className={`${styles.menuItem} ${selectedStatus === 'All' ? styles.selectedMenuItem : ''}`}   onClick={() =>handleViewApplicants(job, '')}>
              <span>All Applicants</span>
              {/* <span className={styles.countBadge}>{applications.total_count}</span> */}
            </div>
          </div>

          <div className={styles.menuSection}>
            <h3>STATUS</h3>
          <div className={`${styles.menuItem} ${selectedStatus === 'Pending' ? styles.selectedMenuItem : ''}`} onClick={() => handleViewApplicants(job, 'Pending')}>
            <span>Pending</span>
          </div>

          <div className={`${styles.menuItem} ${selectedStatus === 'Approved' ? styles.selectedMenuItem : ''}`} onClick={() => handleViewApplicants(job, 'Approved')}>
            <span>Approved</span>
          </div>

          <div className={`${styles.menuItem} ${selectedStatus === 'Rejected' ? styles.selectedMenuItem : ''}`} onClick={() => handleViewApplicants(job, 'Rejected')}>
            <span>Rejected</span>
          </div>
          </div>
        </div>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.contentHeader}>
          <h3>Applicant Details</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <Close />
          </button>
        </div>

        <div className={styles.applicantsList}>
          {applications.results.map(application => (
            <div key={application.application_id} className={styles.applicantCard}>
              {/* Applicant Header - Clickable to toggle details */}
              <div 
                className={styles.applicantHeader}
                onClick={() => toggleApplicantDetails(application)}
              >
                <div className={styles.accordionIndicator}>
                  {expandedApplicant === application.application_id ? (
                    <ChevronLeft className={styles.chevronIcon} />
                  ) : (
                    <ChevronRight className={styles.chevronIcon} />
                  )}
                </div>
                <div className={styles.applicantAvatar}>
                  {getInitials(application.applicant_details.full_name)}
                </div>
                <div className={styles.applicantInfo}>
                  <div className={styles.applicatInfoSubContainer}>
                  <h4>{application.applicant_details.full_name}</h4>
                  <div className={styles.contactInfo}>
                    <Email fontSize="small" />
                    <span>{application.applicant_details.email}</span>
                  </div>
                  </div>
                  <div className={styles.applicationMeta}>
                    <div className={styles.resumeContainer}>
                          {application.applicant_details.resume ? (
                        <div className={styles.resumeActions}>
                          <button 
                            onClick={() => handleViewResume(application.applicant_details.resume)}
                            className={styles.viewResumeButton}
                          >
                            View Resume
                          </button>
                          <a 
                            href={application.applicant_details.resume} 
                            download 
                            className={styles.downloadResumeButton}
                          >
                             <Download />
                          </a>
                        </div>
                      ) : (
                        <div>No resume available</div>
                      )}
                    </div>
                    <div>
                      <span className={styles.statusBadge} data-status={application.application_status.toLowerCase()}>
                        {application.application_status}
                      </span>
                      <span>Applied: {new Date(application.application_date_applied).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              

              {/* Accordion for additional details (skills, experience, education) */}
              {expandedApplicant === application.application_id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={styles.accordionContent}
                >
                  {renderApplicantDetails(application.application_id)}
                </motion.div>
              )}

              {/* ALWAYS VISIBLE COMMENT AND ACTION BUTTONS */}
              <div className={styles.footerActions}>

              <div className={styles.inputGroup}>
              <input
                type="comment"
                name="comment"
                className={styles.input}
                value={comments[application.application_id] || ''}
                onChange={(e) => handleInputComment(e, application.application_id)}
                placeholder=""
              />
              <label className={styles.floatingLabel}>Comment*</label>
            </div>

                <div className={styles.statusActions}>
                  <div className={styles.statusButtons}>
                  <button
                      className={`${styles.statusButton} ${styles.approve}`}
                      onClick={() => onStatusChange(
                        application.application_id, 
                        "APPROVED", 
                        comments[application.application_id] || ''
                      )}
                      disabled={application.application_status === "APPROVED"}
                    >
                      Approve
                    </button>
                    <button
                      className={`${styles.statusButton} ${styles.reject}`}
                      onClick={() => onStatusChange(
                        application.application_id, 
                        "REJECTED", 
                        comments[application.application_id] || ''
                      )}
                      disabled={application.application_status === "REJECTED"}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {applicantsListTotalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              onClick={() => paginate(applicantsListCurrentPage - 1)} 
              disabled={applicantsListCurrentPage === 1}
              className={styles.paginationButton}
            >
              <ChevronLeft />
            </button>
            
            {Array.from({ length: applicantsListTotalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`${styles.paginationButton} ${applicantsListCurrentPage === number ? styles.activePage : ''}`}
              >
                {number}
              </button>
            ))}
            
            <button 
              onClick={() => paginate(applicantsListCurrentPage + 1)} 
              disabled={applicantsListCurrentPage === applicantsListTotalPages}
              className={styles.paginationButton}
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicantsPanel;