import React, { useState } from 'react';
import styles from '../../../styles/ApplicantsPanel.module.css';
import { 
    Close, Download, Email, Person, CheckCircle, 
    Cancel, Comment, ArrowBack, ChevronLeft, 
    ChevronRight, Edit, Save, Visibility
  } from '@mui/icons-material';

const ApplicantsPanel = ({ job, onClose, applications, onStatusChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingComment, setEditingComment] = useState(null);
  const [commentText, setCommentText] = useState('');
  const applicantsPerPage = 4; // Matches your screenshot showing 4 applicants

  const handleStatusChange = (applicationId, newStatus) => {
    console.log(`Changing status of application ${applicationId} to ${newStatus}`);
    // Implement actual status change API call here
  };

  const handleViewResume = (resumeUrl) => {
    window.open(resumeUrl, '_blank');
  };

  const handleEditComment = (application) => {
    setEditingComment(application.application_id);
    setCommentText(application.application_recruiter_comment || '');
  };

  const handleSaveComment = (applicationId) => {
    onStatusChange(applicationId, null, commentText);
    setEditingComment(null);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
  };

  // Calculate pagination
  const totalPages = Math.ceil(applications.results.length / applicantsPerPage);
  const indexOfLastApplicant = currentPage * applicantsPerPage;
  const indexOfFirstApplicant = indexOfLastApplicant - applicantsPerPage;
  const currentApplicants = applications.results.slice(indexOfFirstApplicant, indexOfLastApplicant);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Helper function to get initials
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
            <div className={styles.menuItem}>
              <span>All Applicants</span>
              <span className={styles.countBadge}>{applications.total_count}</span>
            </div>
            <div className={styles.menuItem}>
              <span>New</span>
              <span className={styles.countBadge}>
                {applications.results.filter(a => isApplicationNew(a.application_date_applied)).length}
              </span>
            </div>
          </div>

          <div className={styles.menuSection}>
            <h3>STATUS</h3>
            <div className={styles.menuItem}>
              <span>Pending</span>
              <span className={styles.countBadge}>
                {applications.results.filter(a => a.application_status === "PENDING").length}
              </span>
            </div>
            <div className={styles.menuItem}>
              <span>Approved</span>
              <span className={styles.countBadge}>
                {applications.results.filter(a => a.application_status === "APPROVED").length}
              </span>
            </div>
            <div className={styles.menuItem}>
              <span>Rejected</span>
              <span className={styles.countBadge}>
                {applications.results.filter(a => a.application_status === "REJECTED").length}
              </span>
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
          {currentApplicants.map(application => (
            <div key={application.application_id} className={styles.applicantCard}>
              {/* Applicant Header */}
              <div className={styles.applicantHeader}>
                <div className={styles.applicantAvatar}>
                  {getInitials(application.applicant_details.full_name)}
                </div>
                <div className={styles.applicantInfo}>
                  <h4>{application.applicant_details.full_name}</h4>
                  <div className={styles.contactInfo}>
                    <span><Email /> {application.applicant_details.email}</span>
                  </div>
                  <div className={styles.applicationMeta}>
                    <span className={styles.statusBadge} data-status={application.application_status.toLowerCase()}>
                      {application.application_status}
                    </span>
                    <span>Applied: {new Date(application.application_date_applied).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Comment Section */}
              {(application.application_recruiter_comment || editingComment === application.application_id) && (
                <div className={styles.commentSection}>
                  <div className={styles.commentHeader}>
                    <Comment className={styles.commentIcon} />
                    <h5>Recruiter Notes</h5>
                    {editingComment !== application.application_id && (
                      <button 
                        onClick={() => handleEditComment(application)}
                        className={styles.editCommentButton}
                      >
                        <Edit fontSize="small" />
                      </button>
                    )}
                  </div>
                  
                  {editingComment === application.application_id ? (
                    <div className={styles.commentEditContainer}>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className={styles.commentTextarea}
                        placeholder="Add your comments about this applicant..."
                      />
                      <div className={styles.commentEditButtons}>
                        <button 
                          onClick={() => handleSaveComment(application.application_id)}
                          className={styles.saveButton}
                        >
                          <Save fontSize="small" /> Save
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className={styles.cancelButton}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>{application.application_recruiter_comment}</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
              {application.applicant_details.resume ? (
              <div className={styles.resumeActions}>
                <button 
                  onClick={() => handleViewResume(application.applicant_details.resume)}
                  className={styles.viewResumeButton}
                >
                  <Visibility /> View Resume
                </button>
                <a 
                  href={application.applicant_details.resume} 
                  download 
                  className={styles.downloadResumeButton}
                >
                  <Download /> Download
                </a>
              </div>
            )
            :
            (
                <div>
                    
                </div>
            )
        
        }
                {!application.application_recruiter_comment && editingComment !== application.application_id && (
                  <button 
                    onClick={() => handleEditComment(application)}
                    className={styles.addCommentButton}
                  >
                    <Comment fontSize="small" /> Add Note
                  </button>
                )}
                <div className={styles.statusButtons}>
                  <button 
                    className={`${styles.statusButton} ${styles.approve}`}
                    onClick={() => handleStatusChange(application.application_id, "APPROVED")}
                    disabled={application.application_status === "APPROVED"}
                  >
                    <CheckCircle /> Approve
                  </button>
                  <button 
                    className={`${styles.statusButton} ${styles.reject}`}
                    onClick={() => handleStatusChange(application.application_id, "REJECTED")}
                    disabled={application.application_status === "REJECTED"}
                  >
                    <Cancel /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className={styles.paginationButton}
            >
              <ChevronLeft />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`${styles.paginationButton} ${currentPage === number ? styles.activePage : ''}`}
              >
                {number}
              </button>
            ))}
            
            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
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

// Helper function to determine if application is "new" (within last 7 days)
const isApplicationNew = (dateString) => {
  const applicationDate = new Date(dateString);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return applicationDate > weekAgo;
};

export default ApplicantsPanel;