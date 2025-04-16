import React, { useState, useEffect } from 'react';
import styles from '../../../styles/ApplicantsPanel.module.css';
import { 
  Close, Download, Email, Person, CheckCircle, 
  Cancel, Comment, ArrowBack, ChevronLeft, 
  ChevronRight, Edit, Save, Visibility, Work,
  School, Code, LocationOn, Event, Description,
  Bookmark, BookmarkBorder, ExpandMore, ExpandLess,
  Search, FilterList, MoreVert, Star, StarBorder
} from '@mui/icons-material';
import { userDetails } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { SlBadge } from 'react-icons/sl';

const ApplicantsPanel = ({ job, onClose, applications, onStatusChange, 
  applicantsListCurrentPage, setApplicantsListCurrentPage, applicantsListTotalPages, handleViewApplicants, selectedStatus }) => {
  const [expandedApplicant, setExpandedApplicant] = useState(null);
  const [applicantDetails, setApplicantDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('skills');
  const [comments, setComments] = useState({});
  const [showJobDetails, setShowJobDetails] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  console.log("appplicantss ",applications)

  // Filter applicants based on search query
  const filteredApplicants = applications?.results?.filter(applicant => 
    applicant.applicant_details.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    applicant.applicant_details.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleViewResume = (resumeUrl) => {
    window.open(resumeUrl, '_blank');
  };

  const handleInputComment = (e, applicationId) => {
    setComments(prev => ({
      ...prev,
      [applicationId]: e.target.value
    }));
  };

  const paginate = (pageNumber) => setApplicantsListCurrentPage(pageNumber);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '';
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
      console.log("resss ",response)
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
                    whileHover={{ scale: 1.03 }}
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
                <div className={styles.emptyState}>
                  <Person sx={{ fontSize: 40 }} />
                  <p>No skills listed</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className={styles.experienceContainer}>
              {details.work_experience?.length > 0 ? (
                <div className={styles.experienceScroller}>
                  {details.work_experience.map(exp => (
                    <motion.div 
                      key={exp.work_experience_id} 
                      className={styles.experienceCard}
                      whileHover={{ y: -2 }}
                    >
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
                      <p className={styles.experienceDescription}>{exp.work_experience_description}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Work sx={{ fontSize: 40 }} />
                  <p>No work experience listed</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'education' && (
            <div className={styles.educationContainer}>
              {details.education?.length > 0 ? (
                <div className={styles.educationScroller}>
                  {details.education.map(edu => (
                    <motion.div 
                      key={edu.education_id} 
                      className={styles.educationCard}
                      whileHover={{ y: -2 }}
                    >
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
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <School sx={{ fontSize: 40 }} />
                  <p>No education listed</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <motion.div 
      className={styles.panelContainer}
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Sidebar with new glass morphism effect */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <button onClick={onClose} className={styles.backButton}>
            <ArrowBack />
            <span>Back to Jobs</span>
          </button>
          <h2 className={styles.jobTitle}>{job.job_title}</h2>
          <div className={styles.jobQuickInfo}>
            <span><LocationOn fontSize="small" /> {job.job_location}</span>
            <span><Event fontSize="small" /> {new Date(job.date_posted).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className={styles.sidebarMenu}>
          <div className={styles.menuSection}>
            <h3 className={styles.menuTitle}>APPLICANTS</h3>
            <div 
              className={`${styles.menuItem} ${selectedStatus === 'All' ? styles.selectedMenuItem : ''}`} 
              onClick={() => handleViewApplicants(job, '')}
            >
              <div className={styles.menuItemContent}>
                <span>All Applicants</span>
              </div>
            </div>
          </div>

          <div className={styles.menuSection}>
            <h3 className={styles.menuTitle}>STATUS</h3>
            <div 
              className={`${styles.menuItem} ${selectedStatus === 'Pending' ? styles.selectedMenuItem : ''}`} 
              onClick={() => handleViewApplicants(job, 'Pending')}
            >
              <div className={styles.menuItemContent}>
                <span>Pending</span>
              </div>
            </div>
            <div 
              className={`${styles.menuItem} ${selectedStatus === 'Approved' ? styles.selectedMenuItem : ''}`} 
              onClick={() => handleViewApplicants(job, 'Approved')}
            >
              <div className={styles.menuItemContent}>
                <span>Approved</span>
              </div>
            </div>
            <div 
              className={`${styles.menuItem} ${selectedStatus === 'Rejected' ? styles.selectedMenuItem : ''}`} 
              onClick={() => handleViewApplicants(job, 'Rejected')}
            >
              <div className={styles.menuItemContent}>
                <span>Rejected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.contentArea}>
        <div className={styles.contentHeader}>
          <div className={styles.headerLeft}>
            <h3>Applicant Management</h3>
            <div className={styles.headerStats}>
              <div className={styles.statPill}>
                <span>Total</span>
                <strong>
                {(applications?.status_counts.approved || 0) + 
                (applications?.status_counts.rejected || 0) + 
                (applications?.status_counts.pending || 0)}
              </strong>
              </div>
              <div className={styles.statPill}>
                <span>Pending</span>
                <strong>{applications?.status_counts.pending || 0}</strong>
              </div>
              <div className={styles.statPill}>
                <span>Approved</span>
                <strong>{applications?.status_counts.approved || 0}</strong>
              </div>
              <div className={styles.statPill}>
                <span>Rejected</span>
                <strong>{applications?.status_counts.rejected || 0}</strong>
              </div>
            </div>
          </div>
          
          <div className={styles.headerRight}>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search applicants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button 
                className={styles.filterButton}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <FilterList />
              </button>
            </div>
            <button onClick={onClose} className={styles.closeButton}>
              <Close />
            </button>
          </div>
        </div>

        {/* Job Details Card with Floating Effect */}
        {showJobDetails && (
          <motion.div 
            className={styles.jobDetailsCard}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
          >
            <div className={styles.jobDetailsHeader}>
              <div>
                <h3>{job.job_title}</h3>
                <div className={styles.jobMeta}>
                  <span className={styles.jobMetaItem}>
                    <LocationOn fontSize="small" />
                    {job.job_location}
                  </span>
                  <span className={styles.jobMetaItem}>
                    <Event fontSize="small" />
                    Posted: {new Date(job.date_posted).toLocaleDateString()}
                  </span>
                  {job.job_salary && (
                    <span className={styles.jobMetaItem}>
                      ${parseFloat(job.job_salary).toLocaleString()}/yr
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setShowJobDetails(false)}
                className={styles.hideDetailsButton}
              >
                <ExpandLess />
              </button>
            </div>
            <div className={styles.jobDescription}>
              <h4><Description fontSize="small" /> Job Description</h4>
              <p>{job.job_description}</p>
            </div>
          </motion.div>
        )}

        {!showJobDetails && (
          <button 
            onClick={() => setShowJobDetails(true)}
            className={styles.showDetailsButton}
          >
            <ExpandMore /> Show Job Details
          </button>
        )}

        {/* Applicants List with Card Redesign */}
        <div className={styles.applicantsList}>
          {filteredApplicants.length > 0 ? (
            filteredApplicants.map(application => (
              <motion.div 
                key={application.application_id} 
                className={styles.applicantCard}
                whileHover={{ y: -2 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Redesigned Card Header */}
                <div className={styles.cardHeader} onClick={() => toggleApplicantDetails(application)}>
                  <div className={styles.applicantPreview}>
                    <div className={styles.avatarContainer}>
                      <div className={styles.avatarImage}>
                        {application.applicant_details.profile_picture ? (
                          <img 
                            src={application.applicant_details.profile_picture} 
                            alt={application.applicant_details.full_name}
                          />
                        ) : (
                          <span className={styles.avatarInitials}>
                            {getInitials(application.applicant_details.full_name)}
                          </span>
                        )}
                      </div>
                      <div className={styles.statusIndicator} data-status={application.application_status.toLowerCase()} />
                    </div>

                    <div className={styles.applicantSummary}>
                      <div className={styles.nameAndMeta}>
                        <h4>{application.applicant_details.full_name}</h4>
                        <div className={styles.metaInfo}>
                          <span className={styles.statusBadge} data-status={application.application_status.toLowerCase()}>
                            {application.application_status}
                          </span>
                          <span className={styles.appliedDate}>
                            Applied {new Date(application.application_date_applied).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className={styles.contactInfo}>
                        <div className={styles.contactItem}>
                          <Email fontSize="small" />
                          <span>{application.applicant_details.email}</span>
                        </div>
                        {application.applicant_details.phone && (
                          <div className={styles.contactItem}>
                            <Phone fontSize="small" />
                            <span>{application.applicant_details.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.quickActions}>
                    <div className={styles.chevronContainer}>
                      {expandedApplicant === application.application_id ? (
                        <ChevronLeft className={styles.chevronIcon} />
                      ) : (
                        <ChevronRight className={styles.chevronIcon} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content - Redesigned */}
                {expandedApplicant === application.application_id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={styles.accordionContent}
                  >
                    <div className={styles.applicantDetails}>
                      {/* Social Links Section */}
                      {(applicantDetails[application.application_id]?.linkedin_url || 
                       applicantDetails[application.application_id]?.github_url || 
                       applicantDetails[application.application_id]?.portfolio_url) && (
                        <div className={styles.socialLinks}>
                          {applicantDetails[application.application_id]?.linkedin_url && (
                            <a 
                              href={applicantDetails[application.application_id].linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={styles.socialLink}
                            >
                              <LinkedIn fontSize="small" /> LinkedIn
                            </a>
                          )}
                          {applicantDetails[application.application_id]?.github_url && (
                            <a 
                              href={applicantDetails[application.application_id].github_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={styles.socialLink}
                            >
                              <GitHub fontSize="small" /> GitHub
                            </a>
                          )}
                          {applicantDetails[application.application_id]?.portfolio_url && (
                            <a 
                              href={applicantDetails[application.application_id].portfolio_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={styles.socialLink}
                            >
                              <Language fontSize="small" /> Portfolio
                            </a>
                          )}
                        </div>
                      )}

                      {/* Tabs Navigation */}
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

                      {/* Tab Content */}
                      <div className={styles.tabContentWrapper}>
                        {loadingDetails ? (
                          <div className={styles.loadingSpinner}>
                            <div className={styles.spinner}></div>
                            <p>Loading applicant details...</p>
                          </div>
                        ) : (
                          renderTabContent(applicantDetails[application.application_id])
                        )}
                      </div>
                    </div>

                    {/* Action Footer - Redesigned */}
                    <div className={styles.cardFooter}>
                      <div className={styles.resumeSection}>
                        <h5>Resume</h5>
                        {application.applicant_details.resume ? (
                          <div className={styles.resumeActions}>
                            <motion.button
                              onClick={() => handleViewResume(application.applicant_details.resume)}
                              className={styles.resumeButton}
                              whileHover={{ scale: 1.02 }}
                            >
                              <Visibility fontSize="small" /> Preview
                            </motion.button>
                            <a 
                              href={application.applicant_details.resume} 
                              download 
                              className={styles.resumeButton}
                            >
                              <Download fontSize="small" /> Download
                            </a>
                          </div>
                        ) : (
                          <div className={styles.noResume}>No resume available</div>
                        )}
                      </div>

                      <div className={styles.commentSection}>
                        <h5>Evaluation Notes</h5>
                        <div className={styles.commentInputContainer}>
                          <Comment className={styles.commentIcon} />
                          <textarea
                            value={comments[application.application_id] || ''}
                            onChange={(e) => handleInputComment(e, application.application_id)}
                            placeholder="Add your evaluation notes..."
                            className={styles.commentInput}
                          />
                        </div>
                      </div>

                      <div className={styles.decisionButtons}>
                        <motion.button
                          className={`${styles.statusButton} ${styles.approve}`}
                          onClick={() => onStatusChange(
                            application.application_id, 
                            "APPROVED", 
                            comments[application.application_id] || ''
                          )}
                          disabled={application.application_status === "APPROVED"}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <CheckCircle fontSize="small" /> 
                          {application.application_status === "APPROVED" ? 'Approved' : 'Approve'}
                        </motion.button>
                        <motion.button
                          className={`${styles.statusButton} ${styles.reject}`}
                          onClick={() => onStatusChange(
                            application.application_id, 
                            "REJECTED", 
                            comments[application.application_id] || ''
                          )}
                          disabled={application.application_status === "REJECTED"}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Cancel fontSize="small" /> 
                          {application.application_status === "REJECTED" ? 'Rejected' : 'Reject'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div 
              className={styles.emptyApplicants}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.emptyIllustration}>
                <Person sx={{ fontSize: 80, opacity: 0.3 }} />
              </div>
              <h3>No applicants found</h3>
              <p>There are no applicants matching your current filters</p>
              {searchQuery && (
                <button 
                  className={styles.clearSearchButton}
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </button>
              )}
            </motion.div>
          )}
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
            
            {Array.from({ length: Math.min(5, applicantsListTotalPages) }, (_, i) => {
              let pageNumber;
              if (applicantsListTotalPages <= 5) {
                pageNumber = i + 1;
              } else if (applicantsListCurrentPage <= 3) {
                pageNumber = i + 1;
              } else if (applicantsListCurrentPage >= applicantsListTotalPages - 2) {
                pageNumber = applicantsListTotalPages - 4 + i;
              } else {
                pageNumber = applicantsListCurrentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`${styles.paginationButton} ${applicantsListCurrentPage === pageNumber ? styles.activePage : ''}`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            {applicantsListTotalPages > 5 && applicantsListCurrentPage < applicantsListTotalPages - 2 && (
              <span className={styles.paginationEllipsis}>...</span>
            )}
            
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
    </motion.div>
  );
};

export default ApplicantsPanel;