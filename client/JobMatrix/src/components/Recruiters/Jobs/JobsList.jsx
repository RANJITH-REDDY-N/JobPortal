
import React, { useState, useMemo, useEffect, useCallback } from "react";
import RecruiterCommonTopBar from '../RecruiterCommonTopBar';
import styles from "../../../styles/JobsList.module.css";
import { 
  getJobsListByACompany, 
  getApplicantsForJob, 
  updateApplicationStatus,
  updateJobPosting,
  deleteJobPosting
} from "../../../services/api";
import ApplicantsPanel from '../JobApplicants/ApplicantsPanel';
import { motion, AnimatePresence } from "framer-motion";
import PostJobPopup from './PostJobPopup'
import { useSelector } from 'react-redux';

const JobsList = () => {
  const userData = useSelector((state)=> state.user.user)
  const [jobsPerPage, setJobsPerPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [allJobs, setAllJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState(null);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [totalPages, setTotalPages] = useState(0)
  const [applicantsListCurrentPage, setApplicantsListCurrentPage] = useState(1);
  const [applicantsListTotalPages, setApplicantsListTotalPages] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showPostJobPopup, setShowPostJobPopup] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [filters, setFilters] = useState({
    locations: [],
    jobTitles: [],
    datePosted: "Any time"
  });
  

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getJobsListByACompany({
          page: currentPage,
          ...filters
        }, { signal: controller.signal });
        
        if (response?.results) {
          setAllJobs(response.results);
          setTotalPages(response.total_pages);
          setJobsPerPage(response.results.length);
        } else {
          setAllJobs([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(`Error in fetching Job List: ${err}`);
          setError(err.message || "Failed to fetch jobs");
          setAllJobs([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    
    return () => controller.abort();
  }, [currentPage, filters]);
  
  const refreshJobs = useCallback(() => {
    setCurrentPage(1); 
  }, []);

  // Handle edit job
  const handleEditJob = async (updatedJobData) => {
    console.log()
    try {
      await updateJobPosting(editingJob.job_id, updatedJobData);
      refreshJobs();
      setEditingJob(null);
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  // Handle delete job
  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    
    try {
      await deleteJobPosting(jobToDelete.job_id);
      refreshJobs();
      setJobToDelete(null);
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };
  
  useEffect(() => {
    if (selectedJob != null) {
      const fetchApplicants = async () => {
        await handleViewApplicants(selectedJob);
      };
      fetchApplicants();
    }
  }, [applicantsListCurrentPage, selectedJob]);

// heyyy
const handleViewApplicants = useCallback(async (job, status = '') => {
  setIsLoadingApplicants(true);
  const data = {
    job_Id: job.job_id,
    page: applicantsListCurrentPage
  }
  try {
    const apps = await getApplicantsForJob(data, status);
    setApplications(apps);
    setApplicantsListTotalPages(apps.total_pages);
    setSelectedStatus(status || 'All');
    setSelectedJob(job);
    setPanelOpen(true); // Add this line
  } catch (error) {
    console.error("Error fetching applicants:", error);
    setError("Failed to load applicants");
  } finally {
    setIsLoadingApplicants(false);
  }
}, [applicantsListCurrentPage]);

const handleClosePanel = () => {
  setPanelOpen(false);
  setTimeout(() => {
    setSelectedJob(null);
    setApplications(null);
  }, 300); // Match this with your CSS transition duration
};

// heyyy

  const handlePageChange = (page) => {
    setCurrentPage(page);  // Update the page state first
    // fetchJobsList(page);   // Then fetch data for that page
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleStatusChange = async (applicationId, newStatus, comment = null) => {
    console.log("Updating status:", applicationId, newStatus, comment);
    setUpdatingStatus(applicationId);

    try {
      const response = await updateApplicationStatus(applicationId, {
        "application_status": newStatus,
        "application_recruiter_comment": comment
      });
      console.log("responseee ",response)
      if (response && !response.error) {
        setApplications(prev => {
          if (!prev || !prev.results) return prev;
          
          return {
            ...prev,
            results: prev.results.map(app => 
              app.application_id === applicationId 
                ? { 
                    ...app, 
                    application_status: newStatus,
                    application_recruiter_comment: comment || app.application_recruiter_comment
                  } 
                : app
            )
          };
        });
      } else {
        console.error("API response indicates failure:", response);
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating application:", error);
      setUpdatingStatus(null);
      
    }
  };

   // Add this function to handle filter changes
   const handleFilter = useCallback((newFilters) => {
    setCurrentPage(1); // Reset to first page when filters change
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  const filteredJobs = useMemo(() => {
    if (!searchQuery) return allJobs;
    return allJobs.filter(job =>
      job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.job_description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allJobs]);

  
  const currentJobs = filteredJobs

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h3>Error Loading Jobs</h3>
        <p>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <RecruiterCommonTopBar
        onSearch={handleSearch}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onFilter={handleFilter} 
        filters={filters} 
        onPostJob={() => setShowPostJobPopup(true)}
        title="Posted Jobs"
      />

      <div className={styles.jobsList}>
        {currentJobs.length > 0 ? (
          <AnimatePresence initial={false}>
            {currentJobs.map((job) => (
              <motion.div
                key={job.job_id}
                className={styles.jobCard}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ duration: 0.3 }}
              >
                <div className={styles.jobHeader}>
                  <div className={styles.companyLogoPlaceholder}>
                    {job.job_title?.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.jobInfo}>
                    <h3 className={styles.jobTitle}>{job.job_title}</h3>
                    <div className={styles.jobMeta}>
                      <span className={styles.jobLocation}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {job.job_location}
                      </span>
                      <span className={styles.postedDate}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {new Date(job.date_posted).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={styles.jobSalary}>
                    ${parseFloat(job.job_salary || 0).toLocaleString()}
                    <span>/yr</span>
                  </div>
                </div>

                <div className={styles.jobDescription}>
                  <p>{job.job_description?.substring(0, 150)}...</p>
                </div>

                <div className={styles.jobActions}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewApplicants(job)}
                    disabled={isLoadingApplicants}
                  >
                    {isLoadingApplicants && selectedJob?.job_id === job.job_id ? (
                      <>
                        <span className={styles.spinner}></span> Loading...
                      </>
                    ) : (
                      "View Applicants"
                    )}
                  </button>
                  <button className={styles.editButton} onClick={() => setEditingJob(job)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                  </button>
                  <button className={styles.deleteButton} onClick={() => setJobToDelete(job)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIllustration}>
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <h3>No jobs found</h3>
            <p>{searchQuery ? "No jobs match your search criteria" : "You haven't posted any jobs yet"}</p>
            {searchQuery && (
              <button 
                className={styles.clearSearchButton}
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {selectedJob && (
  <>
    <div 
      className={`${styles.overlay} ${panelOpen ? styles.active : ''}`} 
      onClick={handleClosePanel} 
    />
    <div 
      className={`${styles.applicantsPanelWrapper} ${panelOpen ? styles.active : ''}`}
    >
      <ApplicantsPanel 
        job={selectedJob} 
        onClose={handleClosePanel}
        applications={applications}
        onStatusChange={handleStatusChange}
        applicantsListCurrentPage={applicantsListCurrentPage}
        setApplicantsListCurrentPage={setApplicantsListCurrentPage}
        applicantsListTotalPages={applicantsListTotalPages}
        handleViewApplicants={handleViewApplicants}
        selectedStatus={selectedStatus}
      />
    </div>
  </>
)}

      {showPostJobPopup && (
        <PostJobPopup
          onClose={() => setShowPostJobPopup(false)}
          recruiterId={userData.user_id}
          refreshJobs={refreshJobs}
        />
      )}

      {/* Edit Job Popup */}
      {editingJob && (
        <PostJobPopup
          onClose={() => setEditingJob(null)}
          recruiterId={userData.user_id}
          refreshJobs={refreshJobs}
          jobData={editingJob}
          onSave={handleEditJob}
        />
      )}

      {/* Delete Confirmation Popup */}
      {jobToDelete && (
        <div className={styles.overlay} onClick={() => setJobToDelete(null)}>
          <motion.div 
            className={styles.confirmationPopup}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete Job Posting</h3>
            <p>Are you sure you want to delete "{jobToDelete.job_title}"?</p>
            <p className={styles.warningText}>This action cannot be undone.</p>
            
            <div className={styles.confirmationButtons}>
              <button 
                className={styles.cancelButton}
                onClick={() => setJobToDelete(null)}
              >
                Cancel
              </button>
              <button 
                className={styles.deleteConfirmButton}
                onClick={handleDeleteJob}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default JobsList;