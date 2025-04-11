import React, { useState, useMemo, useEffect, useCallback } from "react";
import RecruiterCommonTopBar from '../RecruiterCommonTopBar';
import styles from "../../../styles/JobsList.module.css";
import { getJobsListByACompany, getApplicantsForJob, updateApplicationStatus } from "../../../services/api";
import ApplicantsPanel from '../JobApplicants/ApplicantsPanel';

const JobsList = () => {
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

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getJobsListByACompany(currentPage, { signal: controller.signal });
        
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
    
    return () => controller.abort(); // Cleanup on unmount
  }, [currentPage]);

  // Replace the problematic useEffect with this:
  useEffect(() => {
    if (selectedJob != null) {
      const fetchApplicants = async () => {
        await handleViewApplicants(selectedJob);
      };
      fetchApplicants();
    }
  }, [applicantsListCurrentPage, selectedJob]); // Add selectedJob to dependencies

  useEffect(() => {
  // Reset to page 1 only when search query changes
  setCurrentPage(1);
}, [searchQuery]);


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
    if(status == ''){
      setSelectedStatus('All');
    }
    else{
      setSelectedStatus(status);
    }
    
    setSelectedJob(job);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    setError("Failed to load applicants");
  } finally {
    setIsLoadingApplicants(false);
  }
}, [applicantsListCurrentPage]);

  const handleClosePanel = () => {
    setSelectedJob(null);
    setApplications(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);  // Update the page state first
    // fetchJobsList(page);   // Then fetch data for that page
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    // setCurrentPage(1);
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

  const filteredJobs = useMemo(() => {
    if (!searchQuery) return allJobs;
    return allJobs.filter(job =>
      job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.job_description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allJobs]);

  
  const currentJobs = filteredJobs

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
          applicantsListCurrentPage =  {applicantsListCurrentPage}
          setApplicantsListCurrentPage = {setApplicantsListCurrentPage}
          applicantsListTotalPages = {applicantsListTotalPages}
          handleViewApplicants = {handleViewApplicants}
          selectedStatus = {selectedStatus}
        />
      </>
    )}
    </div>
  );
};

export default JobsList;