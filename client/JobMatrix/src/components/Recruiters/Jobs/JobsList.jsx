import React, { useState, useMemo, useEffect } from "react";
import RecruiterCommonTopBar from '../RecruiterCommonTopBar';
import styles from "../../../styles/JobsList.module.css";
import { getJobsListByACompany, getApplicantsForJob } from "../../../services/api";
import ApplicantsPanel from '../JobApplicants/ApplicantsPanel';

const JobsList = () => {
  const jobsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [allJobs, setAllJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState(null);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);

  useEffect(() => {
    const fetchJobsList = async () => {
      setIsLoading(true);
      try {
        const response = await getJobsListByACompany();
        if (response && response.results) {
          setAllJobs(response.results);
        } else {
          setAllJobs([]);
        }
      } catch (err) {
        console.error(`Error in fetching Job List: ${err}`);
        setError(err.message || "Failed to fetch jobs");
        setAllJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobsList();
  }, []);

  const handleViewApplicants = async (job) => {
    setIsLoadingApplicants(true);
    try {
      const apps = await getApplicantsForJob(job.job_id);
      setApplications(apps);
      setSelectedJob(job);
    } catch (error) {
      console.error("Error fetching applicants:", error);
      setError("Failed to load applicants");
    } finally {
      setIsLoadingApplicants(false);
    }
  };

  const handleClosePanel = () => {
    setSelectedJob(null);
    setApplications(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusChange = async (applicationId, newStatus, comment = null) => {
    try {
      // Call your API to update status and/or comment
      const response = await updateApplicationStatus(applicationId, {
        "application_status": newStatus,
        "application_recruiter_comment": comment
      });
      
      // Update local state
      setApplications(prev => ({
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
      }));
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  const filteredJobs = useMemo(() => {
    if (!searchQuery) return allJobs;
    return allJobs.filter(job =>
      job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.job_description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allJobs]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  console.log("get the current jobsss",currentJobs)

  if (isLoading) {
    return <div className={styles.container}>Loading jobs...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <RecruiterCommonTopBar
        onSearch={handleSearch}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        title="Posted Jobs"
      />

      <div className={styles.jobsList}>
        {currentJobs.length > 0 ? (
          currentJobs.map((job) => (
            <div key={job.job_id} className={styles.jobCard}>
              <div className={styles.jobHeader}>
                <div className={styles.companyLogoPlaceholder}>
                  {job.job_title?.charAt(0)}
                </div>
                <div>
                  <h3 className={styles.jobTitle}>{job.job_title}</h3>
                  <p className={styles.jobLocation}>{job.job_location}</p>
                </div>
                <div className={styles.jobSalary}>
                  ${parseFloat(job.job_salary || 0).toLocaleString()} / yr
                </div>
              </div>

              <div className={styles.jobDescription}>
                <p>{job.job_description?.substring(0, 150)}...</p>
                <div className={styles.jobMeta}>
                  <span>Posted: {new Date(job.date_posted).toLocaleDateString()}</span>
                  <span>Posted by: {job.recruiter_name}</span>
                </div>
              </div>

              <div className={styles.jobActions}>
                <button 
                  className={styles.viewButton}
                  onClick={() => handleViewApplicants(job)}
                  disabled={isLoadingApplicants}
                >
                  {isLoadingApplicants && selectedJob?.job_id === job.job_id ? 
                    "Loading..." : "View Applicants"}
                </button>
                <button className={styles.editButton}>Edit Job</button>
                <button className={styles.deleteButton}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <p>No jobs found {searchQuery ? "matching your search criteria" : "posted yet"}</p>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>Clear search</button>
            )}
          </div>
        )}
      </div>

      {selectedJob && (
      <>
        <div className={styles.overlay} onClick={handleClosePanel} />
        <ApplicantsPanel 
          job={selectedJob} 
          onClose={handleClosePanel}
          applications={applications}
          onStatusChange={handleStatusChange}
        />
      </>
    )}
    </div>
  );
};

export default JobsList;