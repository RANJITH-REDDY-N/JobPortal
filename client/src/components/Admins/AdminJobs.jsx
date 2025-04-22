import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import styles from "../../styles/AdminJobs.module.css";
import defaultCompanyImage from "../../assets/nocompanyimage2.jpg";
import noResultsImage from '../../assets/CommonJobCardIcon-Images/No Jobs Found.svg';
import viewMoreButton from "../../assets/CommonJobCardIcon-Images/viewmore_expand.svg";
import viewLessButton from "../../assets/CommonJobCardIcon-Images/viewmore_collapse.svg";
import filterIcon from "../../assets/CommonJobCardIcon-Images/filter-outline.svg";
import {
  History,
  LocationOn,
  Paid,
  SearchOutlined,
  ClearAll,
  Tune,
  Add,
  Work,
  Cancel
} from "@mui/icons-material";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { RiSkipDownFill } from "react-icons/ri";
import { LuTrash } from "react-icons/lu";
import { MdWork, MdList, MdSchool, MdStarRate } from 'react-icons/md';
import { getAllJobs, deleteJobPosting } from "../../services/api";
import ToastNotification from "../ToastNotification.jsx";

const AdminJobs = () => {
  const [jobsData, setJobsData] = useState({
    jobs: [],
    total_count: 0,
    current_page: 1,
    total_pages: 1
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [toastQueue, setToastQueue] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState({
    deleting: false,
    success: false
  });
  const [filters, setFilters] = useState({
    minSalary: 0,
    locations: [],
    jobTitles: [],
    companies: [],
    datePosted: "Any time"
  });
  const [tempFilters, setTempFilters] = useState({
    minSalary: 0,
    locations: [],
    jobTitles: [],
    companies: [],
    datePosted: "Any time"
  });
  const [inputValues, setInputValues] = useState({
    location: "",
    jobTitle: "",
    company: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const popupRef = useRef(null);

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobsData.jobs;

    const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0);

    return jobsData.jobs.filter(job => {
      const searchableFields = [
        job.job_title.toLowerCase(),
        job.company.company_name.toLowerCase(),
        job.company.company_industry.toLowerCase(),
        job.job_location.toLowerCase()
      ];
      return searchTerms.every(term => searchableFields.some(field => field.includes(term)));
    });
  }, [searchQuery, jobsData.jobs]);

  const totalPages = jobsData.total_pages;
  const totalCount = jobsData.total_count;

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handlePageChange = (page) => setCurrentPage(page);
  const toggleExpand = (jobId) => setExpandedJobId(prev => (prev === jobId ? null : jobId));

  const handleDeleteJob = async (e, jobId) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmDelete = window.confirm("Are you sure you want to delete this job?");
    if (!confirmDelete) return;

    try {
      setDeleteStatus({ deleting: true, success: false });
      setJobId(jobId);

      const response = await deleteJobPosting(jobId);

      if (!response.error) {
        setDeleteStatus({ deleting: false, success: true });
        showToast("Job deleted successfully!", "success");
        fetchJobs();
        setTimeout(() => {
          setDeleteStatus({ deleting: false, success: false });
        }, 2000);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      setDeleteStatus({ deleting: false, success: false });
      showToast(error.message || "Failed to delete the job", "error");
    }
  };

  const showToast = (message, type) => {
    const newToast = { message, type, id: Date.now() };
    setToastQueue(prev => [...prev, newToast]);

    setTimeout(() => {
      setToastQueue(prev => prev.filter(t => t.id !== newToast.id));
    }, 3000);
  };

  // Filter functions
  const handleInputChange = (e, field) => {
    setInputValues({
      ...inputValues,
      [field]: e.target.value
    });
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") {
      addFilterItem(field);
    }
  };

  const addFilterItem = (field) => {
    const value = inputValues[field].trim();
    if (!value) return;

    const filterKey = field === 'company' ? 'companies' :
        field === 'jobTitle' ? 'jobTitles' :
            'locations';

    if (tempFilters[filterKey].length >= 3) return;

    const exists = tempFilters[filterKey].some(
        item => item.toLowerCase() === value.toLowerCase()
    );

    if (!exists) {
      setTempFilters(prev => ({
        ...prev,
        [filterKey]: [...prev[filterKey], value]
      }));
      setInputValues(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const removeFilterItem = (filterKey, value) => {
    setTempFilters(prev => ({
      ...prev,
      [filterKey]: prev[filterKey].filter(item => item !== value)
    }));
  };

  const handleSalaryChange = (value) => {
    const percentage = (value / 500000) * 100;
    document.documentElement.style.setProperty('--slider-percentage', `${percentage}%`);
    setTempFilters(prev => ({
      ...prev,
      minSalary: parseInt(value)
    }));
  };

  const handleDatePostedChange = (value) => {
    setTempFilters(prev => ({
      ...prev,
      datePosted: value
    }));
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      minSalary: 0,
      locations: [],
      jobTitles: [],
      companies: [],
      datePosted: "Any time"
    };
    setFilters(clearedFilters);
    setTempFilters(clearedFilters);
    setInputValues({
      location: "",
      jobTitle: "",
      company: ""
    });
    document.documentElement.style.removeProperty('--slider-percentage');
    setSearchQuery("");
  };

  const handleClose = () => {
    setTempFilters(filters);
    setShowFilters(false);
  };

  const handleRemoveFilter = (filterType, value = null) => {
    const newFilters = { ...filters };

    if (filterType === 'minSalary') {
      newFilters.minSalary = 0;
      document.documentElement.style.removeProperty('--slider-percentage');
    } else if (filterType === 'datePosted') {
      newFilters.datePosted = "Any time";
    } else if (value) {
      newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
    } else {
      newFilters[filterType] = [];
    }

    setFilters(newFilters);
  };

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllJobs({
        ...filters,
        page: currentPage
      });

      setJobsData({
        jobs: response.data,
        total_count: response["total_count"],
        current_page: response["current_page"],
        total_pages: response["total_pages"]
      });
    } catch (err) {
      setError(err.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, filters, currentPage]);

  const getPagination = (currentPage, totalPages) => {
    const pagination = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pagination.push(i);
      }
    } else {
      pagination.push(1);
      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          pagination.push(i);
        }
        pagination.push("...");
      }
      else if (currentPage >= totalPages - 3) {
        pagination.push("...");
        for (let i = totalPages - 4; i <= totalPages - 1; i++) {
          pagination.push(i);
        }
      }
      else {
        pagination.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pagination.push(i);
        }
        pagination.push("...");
      }
      pagination.push(totalPages);
    }
    return pagination.slice(0, 7);
  };

  return (
      <div className={styles.container}>
        {/* Top Section */}
        <div className={styles.topSection}>
          <h2 className={styles.title}>All Jobs</h2>

          <div className={styles.searchContainer}>
            <SearchOutlined className={styles.searchIcon} />
            <input
                type="text"
                placeholder="Search for jobs..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <div className={styles.bottomBar}>
            <div className={styles.filtersContainer}>
              <div
                  className={styles.filters}
                  onClick={() => setShowFilters(true)}
              >
                <img
                    src={filterIcon}
                    alt="Filter"
                    className={styles.filterIcon}
                />
                <span>Filters</span>
              </div>

              {/* Active Filters */}
              <div className={styles.activeFilters}>
                {filters.minSalary > 0 && (
                    <span className={styles.filterChip}>
                  <RiSkipDownFill style={{ color: 'var(--english-violet)', fontSize: '1.3rem' }}/>
                  $ {filters.minSalary.toLocaleString()}/yr
                  <Cancel
                      onClick={() => handleRemoveFilter('minSalary')}
                      className={styles.removeFilter}
                  />
                </span>
                )}

                {filters.datePosted !== "Any time" && (
                    <span className={styles.filterChip}>
                  <History style={{ color: 'var(--english-violet)', fontSize: '1.3rem' }}/>
                      {filters.datePosted}
                      <Cancel
                          onClick={() => handleRemoveFilter('datePosted')}
                          className={styles.removeFilter}
                      />
                </span>
                )}

                {filters.locations.map((location, index) => (
                    <span key={`loc-${index}`} className={styles.filterChip}>
                  <LocationOn style={{ color: 'var(--english-violet)', fontSize: '1.3rem' }}/>
                      {location}
                      <Cancel
                          onClick={() => handleRemoveFilter('locations', location)}
                          className={styles.removeFilter}
                      />
                </span>
                ))}

                {filters.jobTitles.map((title, index) => (
                    <span key={`title-${index}`} className={styles.filterChip}>
                  <Work style={{ color: 'var(--english-violet)', fontSize: '1.3rem' }}/>
                      {title}
                      <Cancel
                          onClick={() => handleRemoveFilter('jobTitles', title)}
                          className={styles.removeFilter}
                      />
                </span>
                ))}

                {filters.companies.map((company, index) => (
                    <span key={`comp-${index}`} className={styles.filterChip}>
                  <Work style={{ color: 'var(--english-violet)', fontSize: '1.3rem' }}/>
                      {company}
                      <Cancel
                          onClick={() => handleRemoveFilter('companies', company)}
                          className={styles.removeFilter}
                      />
                </span>
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
            <span
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                className={currentPage === 1 ? styles.disabledNav : ""}
            >
              ‹ Previous
            </span>

              {getPagination(currentPage, totalPages).map((page, index) => (
                  <button
                      key={index}
                      disabled={page === "..."}
                      className={
                        currentPage === page
                            ? styles.activePage
                            : page === "..."
                                ? styles.dots
                                : styles.pageBtn
                      }
                      onClick={() => page !== "..." && handlePageChange(page)}
                  >
                    {page}
                  </button>
              ))}

              <span
                  onClick={() =>
                      currentPage < totalPages && handlePageChange(currentPage + 1)
                  }
                  className={currentPage === totalPages ? styles.disabledNav : ""}
              >
              Next ›
            </span>
            </div>
          </div>
        </div>

        {/* Job List */}
        {!loading && (
            <div className={styles.jobList}>
              {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                      <div key={job.job_id} className={styles.jobCard}>
                        <div className={styles.header}>
                          <div className={styles.left}>
                            <div className={styles.posted}>
                              <History fontSize="small" />
                              <span>
                        {(() => {
                          const now = new Date();
                          const postedDate = new Date(job.job_date_posted);
                          const timeDiff = now - postedDate;
                          const seconds = Math.floor(timeDiff / 1000);
                          const minutes = Math.floor(seconds / 60);
                          const hours = Math.floor(minutes / 60);
                          const days = Math.floor(hours / 24);
                          const weeks = Math.floor(days / 7);
                          const months = Math.floor(days / 30);
                          const years = Math.floor(days / 365);

                          if (seconds < 60) return 'Just now';
                          if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
                          if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
                          if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
                          if (weeks <= 4) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
                          if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
                          return `${years} year${years === 1 ? '' : 's'} ago`;
                        })()}
                      </span>
                            </div>
                            <h2 className={styles.jobTitle}>{job.job_title}</h2>
                            <p className={styles.company}>{job.company.company_name}</p>
                          </div>

                          <div className={styles.right}>
                            <img
                                src={job.company?.company_image ? `http://localhost:8000${job.company.company_image}` : defaultCompanyImage}
                                alt={job.company.company_name}
                                className={styles.logo}
                                onError={(e) => (e.target.src = defaultCompanyImage)}
                            />
                            <div className={styles.infoRow}>
                              <LocationOn fontSize="small" />
                              <span>{job.job_location}</span>
                            </div>
                            <div className={styles.infoRow}>
                              <Paid fontSize="small" />
                              <span>${parseFloat(job.job_salary).toLocaleString()} {job.job_salary < 1000 ? '/hr' : '/yr'}</span>
                            </div>
                          </div>
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.description}>
                          <div
                              style={{
                                maxHeight: expandedJobId === job.job_id ? '1000px' : '100px',
                                overflow: 'hidden',
                                transition: 'max-height 0.3s ease-in-out'
                              }}
                          >
                            {expandedJobId === job.job_id ? (
                                <>
                                  <strong>Job Description</strong>
                                  {(() => {
                                    const sections = job.job_description.split(/(?=\[.*?\])/g);
                                    const mandatorySection = sections.find(section =>
                                        section.startsWith('[About the Role]')
                                    );

                                    const otherSections = sections.filter(section =>
                                        !section.startsWith('[About the Role]') &&
                                        section.replace(/\[.*?\]/, '').trim().length > 0
                                    );

                                    const renderSection = (section) => {
                                      const titleMatch = section.match(/\[(.*?)\]/);
                                      const title = titleMatch ? titleMatch[1] : null;
                                      const content = section.replace(/\[.*?\]/, '').trim();

                                      let Icon;
                                      switch (title) {
                                        case 'About the Role':
                                          Icon = MdWork;
                                          break;
                                        case 'Key Responsibilities':
                                          Icon = MdList;
                                          break;
                                        case 'Required Qualifications':
                                          Icon = MdSchool;
                                          break;
                                        case 'Preferred Qualifications':
                                          Icon = MdStarRate;
                                          break;
                                        default:
                                          Icon = null;
                                      }

                                      return (
                                          <div key={title}>
                                            {title && (
                                                <div style={{display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0 8px'}}>
                                                  {Icon && <Icon style={{color: 'var(--english-violet)'}} />}
                                                  <span style={{fontWeight: 'bold'}}>{title}</span>
                                                </div>
                                            )}
                                            <p>{content}</p>
                                          </div>
                                      );
                                    };

                                    return (
                                        <>
                                          {mandatorySection && renderSection(mandatorySection)}
                                          {otherSections.map(section => renderSection(section))}
                                        </>
                                    );
                                  })()}

                                  <strong style={{display: 'block', marginTop: '20px'}}>About Company</strong>
                                  <p>{job.company.company_description}</p>
                                </>
                            ) : (
                                <p>{job.job_description.slice(0, 180) + "..."}</p>
                            )}
                          </div>

                          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '16px'}}>
                            <button
                                onClick={() => toggleExpand(job.job_id)}
                                className={styles.expandBtn}
                            >
                              {expandedJobId === job.job_id ? (
                                  <>
                                    <img src={viewLessButton} alt="View Less" />
                                    View Less <FiChevronUp />
                                  </>
                              ) : (
                                  <>
                                    <img src={viewMoreButton} alt="View More" />
                                    View More <FiChevronDown />
                                  </>
                              )}
                            </button>

                            <button
                                onClick={(e) => handleDeleteJob(e, job.job_id)}
                                className={styles.deleteBtn}
                                disabled={deleteStatus.deleting && job.job_id === jobId}
                            >
                              {deleteStatus.deleting && job.job_id === jobId ? (
                                  <div style={{width: '18px', height: '18px', borderRadius: '50%', border: '2px solid white', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '8px'}} />
                              ) : (
                                  <LuTrash style={{marginRight: '6px'}} />
                              )}
                              Delete Job
                            </button>
                          </div>
                        </div>
                      </div>
                  ))
              ) : (
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0'}}>
                    <img
                        src={noResultsImage}
                        alt="No results found"
                        style={{width: '200px', marginBottom: '20px'}}
                    />
                    {filters.minSalary > 0 ||
                    filters.locations.length > 0 ||
                    filters.jobTitles.length > 0 ||
                    filters.companies.length > 0 ||
                    filters.datePosted !== "Any time" ||
                    searchQuery ? (
                        <>
                          <p>No jobs found matching your filters</p>
                          <button
                              onClick={handleClearFilters}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'transparent',
                                color: 'var(--english-violet)',
                                border: '1px solid var(--english-violet)',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginTop: '12px'
                              }}
                          >
                            <ClearAll fontSize="small" /> Clear All Filters
                          </button>
                        </>
                    ) : (
                        <>
                          <p>Sorry! No jobs to show.</p>
                        </>
                    )}
                  </div>
              )}
            </div>
        )}

        {loading && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <iframe
                  src="https://lottie.host/embed/642b60ca-6e74-40ba-8d4e-c12fa8db1bc3/gxUxRH683G.lottie"
                  style={{
                    width: '200px',
                    height: '200px',
                    backgroundColor: 'transparent',
                    overflow: 'hidden'
                  }}
                  title="Loading animation"
                  allowFullScreen
                  allow="autoplay"
              />
            </div>
        )}

        {/* Filter Popup */}
        {showFilters && (
            <div className={styles.filterPopupOverlay}>
              <div className={styles.filterPopup} ref={popupRef}>
                <div className={styles.filterHeader}>
                  <h3>Filters</h3>
                  <button className={styles.closeButton} onClick={handleClose}>
                    ×
                  </button>
                </div>

                {/* Salary Filter */}
                <div className={styles.filterGroup}>
              <span className={styles.minSalaryTitle}>
                <h4>Minimum Annual Salary:</h4>
                <span>$ {tempFilters.minSalary.toLocaleString()} per year</span>
              </span>
                  <div className={styles.sliderContainer}>
                    <div className={styles.sliderRangeLabels}>
                      <span>$ 0K </span>
                      <input
                          type="range"
                          min="0"
                          max="500000"
                          step="10000"
                          value={tempFilters.minSalary}
                          onChange={(e) => handleSalaryChange(e.target.value)}
                      />
                      <span> $ 500K</span>
                    </div>
                  </div>
                </div>

                {/* Date Posted */}
                <div className={styles.filterGroup}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight:'bold' }}>
                <History style={{ fontSize: 'large' }} />
                Date Posted
              </span>
                  <div className={styles.datePostedOptions}>
                    {["Past 24 hours", "Past 3 days", "Past week", "Past month", "Any time"].map((option) => (
                        <label key={option} className={styles.dateOption}>
                          <input
                              type="radio"
                              name="datePosted"
                              checked={tempFilters.datePosted === option}
                              onChange={() => handleDatePostedChange(option)}
                          />
                          {option}
                        </label>
                    ))}
                  </div>
                </div>

                {/* Locations */}
                <div className={styles.filterGroup}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight:'bold' }}>
                <LocationOn style={{ fontSize: 'large' }} />
                Locations
              </span>
                  <div className={styles.filterInputContainer}>
                    <input
                        type="text"
                        placeholder={tempFilters.locations.length >= 3 ? 'Max 3 locations reached' : 'Add a Location'}
                        value={inputValues.location}
                        onChange={(e) => handleInputChange(e, "location")}
                        onKeyDown={(e) => handleKeyDown(e, "location")}
                        disabled={tempFilters.locations.length >= 3}
                    />
                    <button
                        className={styles.addButton}
                        onClick={() => addFilterItem("location")}
                        disabled={tempFilters.locations.length >= 3}
                    >
                      <Add fontSize="small"/>Add
                    </button>
                  </div>
                  <div className={styles.filterTags}>
                    {tempFilters.locations.map((location, index) => (
                        <span key={index} className={styles.filterTag}>
                    {location}
                          <button onClick={() => removeFilterItem("locations", location)}>
                      ×
                    </button>
                  </span>
                    ))}
                  </div>
                </div>

                {/* Job Titles */}
                <div className={styles.filterGroup}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight:'bold' }}>
                <Work style={{ fontSize: 'large' }} />
                Job Titles
              </span>
                  <div className={styles.filterInputContainer}>
                    <input
                        type="text"
                        placeholder={tempFilters.jobTitles.length >= 3 ? 'Max 3 titles reached' : 'Add a Job Title'}
                        value={inputValues.jobTitle}
                        onChange={(e) => handleInputChange(e, "jobTitle")}
                        onKeyDown={(e) => handleKeyDown(e, "jobTitle")}
                        disabled={tempFilters.jobTitles.length >= 3}
                    />
                    <button
                        className={styles.addButton}
                        onClick={() => addFilterItem("jobTitle")}
                        disabled={tempFilters.jobTitles.length >= 3}
                    >
                      <Add fontSize="small"/>Add
                    </button>
                  </div>
                  <div className={styles.filterTags}>
                    {tempFilters.jobTitles.map((title, index) => (
                        <span key={index} className={styles.filterTag}>
                    {title}
                          <button onClick={() => removeFilterItem("jobTitles", title)}>
                      ×
                    </button>
                  </span>
                    ))}
                  </div>
                </div>

                {/* Companies */}
                <div className={styles.filterGroup}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight:'bold' }}>
                <Work style={{ fontSize: 'large' }} />
                Companies
              </span>
                  <div className={styles.filterInputContainer}>
                    <input
                        type="text"
                        placeholder={tempFilters.companies.length >= 3 ? 'Max 3 companies reached' : 'Add a Company'}
                        value={inputValues.company}
                        onChange={(e) => handleInputChange(e, "company")}
                        onKeyDown={(e) => handleKeyDown(e, "company")}
                        disabled={tempFilters.companies.length >= 3}
                    />
                    <button
                        className={styles.addButton}
                        onClick={() => addFilterItem("company")}
                        disabled={tempFilters.companies.length >= 3}
                    >
                      <Add fontSize="small"/>Add
                    </button>
                  </div>
                  <div className={styles.filterTags}>
                    {tempFilters.companies.map((company, index) => (
                        <span key={index} className={styles.filterTag}>
                    {company}
                          <button onClick={() => removeFilterItem("companies", company)}>
                      ×
                    </button>
                  </span>
                    ))}
                  </div>
                </div>

                <div className={styles.filterActions}>
                  <button
                      className={styles.clearButton}
                      onClick={handleClearFilters}
                  >
                    <ClearAll fontSize="small" /> Clear All
                  </button>
                  <button
                      className={styles.applyButton}
                      onClick={handleApplyFilters}
                  >
                    <Tune fontSize="small" /> Apply Filters
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Toast Notifications */}
        {toastQueue.slice(0, 3).map((toast, index) => (
            <ToastNotification
                key={toast.id}
                message={toast.message}
                type={toast.type}
                style={{
                  position: 'fixed',
                  top: `${20 + (index * 70)}px`,
                  right: '20px',
                  zIndex: 1100
                }}
                onClose={() => setToastQueue(prev => prev.filter(t => t.id !== toast.id))}
            />
        ))}
      </div>
  );
};

export default AdminJobs;