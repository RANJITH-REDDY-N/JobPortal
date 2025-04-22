import styles from "../../styles/AdminJobs.module.css";
import defaultCompanyLogo from "../../assets/nocompanyimage2.jpg";
import { History, LocationOn, Paid, SearchOutlined, ClearAll, Tune, Add, Work, Cancel } from "@mui/icons-material";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { RiSkipDownFill } from "react-icons/ri";
import filterIcon from "../../assets/CommonJobCardIcon-Images/filter-outline.svg";
import { useState, useEffect, useRef } from "react";
import { getAllJobs } from "../../services/api";


const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
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
  
  const jobsPerPage = 6;
  const popupRef = useRef(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await getAllJobs();
        const jobArray = Array.isArray(response?.data) ? response.data : [];
        setJobs(jobArray);
        setFilteredJobs(jobArray);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
        setFilteredJobs([]);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    let filtered = [...jobs];

    // Search functionality
    if (searchQuery.trim()) {
      const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(term => term.length > 0);
      filtered = filtered.filter(job => {
        const searchableFields = [
          job.job_title.toLowerCase(),
          job.company_name.toLowerCase(),
          job.job_location.toLowerCase()
        ];
        return searchTerms.every(term => 
          searchableFields.some(field => field.includes(term))
        );
      });
    }

    // Filter by salary
    if (filters.minSalary > 0) {
      filtered = filtered.filter(job => job.job_salary >= filters.minSalary);
    }

    // Filter by locations
    if (filters.locations.length > 0) {
      filtered = filtered.filter(job => 
        filters.locations.some(location => 
          job.job_location.toLowerCase().includes(location.toLowerCase())
        )
      );
    }

    // Filter by job titles
    if (filters.jobTitles.length > 0) {
      filtered = filtered.filter(job => 
        filters.jobTitles.some(title => 
          job.job_title.toLowerCase().includes(title.toLowerCase())
        )
      );
    }

    // Filter by companies
    if (filters.companies.length > 0) {
      filtered = filtered.filter(job => 
        filters.companies.some(company => 
          job.company_name.toLowerCase().includes(company.toLowerCase())
        )
      );
    }

    // Filter by date posted
    if (filters.datePosted !== "Any time") {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch(filters.datePosted) {
        case "Past 24 hours":
          cutoffDate.setDate(now.getDate() - 1);
          break;
        case "Past 3 days":
          cutoffDate.setDate(now.getDate() - 3);
          break;
        case "Past week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "Past month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(job => 
        new Date(job.job_created_date) >= cutoffDate
      );
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [searchQuery, filters, jobs]);

  const handleDelete = (jobId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this job?");
    if (confirmDelete) {
      setJobs(prev => prev.filter(job => job.job_id !== jobId));
      setFilteredJobs(prev => prev.filter(job => job.job_id !== jobId));
      console.log("Deleted job ID:", jobId);
    }
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handlePageChange = (page) => setCurrentPage(page);
  const toggleExpand = (jobId) => 
    setExpandedJobId(prev => (prev === jobId ? null : jobId));

  const totalPages = Math.ceil((filteredJobs || []).length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const paginatedJobs = (filteredJobs || []).slice(startIndex, startIndex + jobsPerPage);

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
                  <Apartment style={{ color: 'var(--english-violet)', fontSize: '1.3rem' }}/>
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
      <div className={styles.jobList}>
        {paginatedJobs.map((job) => (
          <div key={job.job_id} className={styles.jobCard}>
            <div className={styles.header}>
              <div className={styles.left}>
                <div className={styles.posted}>
                  <History fontSize="small" />
                  <span>
                    {Math.floor(
                      (new Date() - new Date(job.job_created_date)) /
                        (1000 * 60 * 60 * 24)
                    ) || 0}{" "}
                    days ago
                  </span>
                </div>
                <h2 className={styles.jobTitle}>{job.job_title}</h2>
                <p className={styles.company}>{job.company_name}</p>
              </div>

              <div className={styles.right}>
                <img
                  src={job.company?.company_image ? `http://localhost:8000${job.company.company_image}` : defaultCompanyLogo}
                  alt="Company Logo"
                  className={styles.logo}
                  onError={(e) => (e.target.src = defaultCompanyLogo)}
                />
                <div className={styles.infoRow}>
                  <LocationOn fontSize="small" />
                  <span>{job.job_location}</span>
                </div>
                <div className={styles.infoRow}>
                  <Paid fontSize="small" />
                  <span>${job.job_salary}</span>
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.description}>
              <p>
                {expandedJobId === job.job_id
                  ? job.job_description
                  : job.job_description.slice(0, 180) + "..."}
              </p>
              <button 
                onClick={() => toggleExpand(job.job_id)} 
                className={styles.expandBtn}
              >
                {expandedJobId === job.job_id ? (
                  <>
                    View Less <FiChevronUp />
                  </>
                ) : (
                  <>
                    View More <FiChevronDown />
                  </>
                )}
              </button>
            </div>
            <button 
              onClick={() => handleDelete(job.job_id)} 
              className={styles.deleteBtn}
            >
              Delete Job
            </button>
          </div>
        ))}
      </div>

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
                <Apartment style={{ fontSize: 'large' }} />
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
    </div>
  );
};

export default AdminJobs;