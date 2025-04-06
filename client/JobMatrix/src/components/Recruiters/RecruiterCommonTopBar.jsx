import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "../../styles/RecruiterCommonTopBar.module.css";
import filterIcon from "../../assets/CommonJobCardIcon-Images/filter-outline.svg";
import { 
  Tune, ClearAll, Add, Cancel, SearchOutlined, 
  History, LocationOn, Work, Apartment, People 
} from '@mui/icons-material';

const RecruiterCommonTopBar = ({
  onSearch,
  onFilter,
  currentPage,
  totalPages,
  onPageChange,
  filtersCleared,
  title = "Posted Jobs"
}) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter state and popup
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minSalary: 0,
    locations: [],
    jobTitles: [],
    statuses: [],
    datePosted: "Any time"
  });
  
  const [tempFilters, setTempFilters] = useState({
    minSalary: filters.minSalary,
    locations: [...filters.locations],
    jobTitles: [...filters.jobTitles],
    statuses: [...filters.statuses],
    datePosted: filters.datePosted
  });
  
  const [inputValues, setInputValues] = useState({
    location: "",
    jobTitle: ""
  });
  const popupRef = useRef(null);

  useEffect(() => {
    onSearch(searchTerm);
  }, [searchTerm]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilters]);

  const handleInputChange = (e, field) => {
    setInputValues({
      ...inputValues,
      [field]: e.target.value
    });
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") {
      const filterKey = field === 'jobTitle' ? 'jobTitles' : 'locations';
      if (tempFilters[filterKey].length < 3) {
        addFilterItem(field);
      }
    }
  };

  const addFilterItem = (field) => {
    const value = inputValues[field].trim();
    if (!value) return;

    const filterKey = field === 'jobTitle' ? 'jobTitles' : 'locations';

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

  const handleStatusChange = (status) => {
    setTempFilters(prev => {
      if (prev.statuses.includes(status)) {
        return {
          ...prev,
          statuses: prev.statuses.filter(s => s !== status)
        };
      } else {
        return {
          ...prev,
          statuses: [...prev.statuses, status]
        };
      }
    });
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    if(onFilter) onFilter(tempFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      minSalary: 0,
      locations: [],
      jobTitles: [],
      statuses: [],
      datePosted: "Any time"
    };
    setFilters(clearedFilters);
    setTempFilters(clearedFilters);
    setInputValues({
      location: "",
      jobTitle: ""
    });
    document.documentElement.style.removeProperty('--slider-percentage');
    if (onFilter) onFilter(clearedFilters);
  };

  const handleClose = () => {
    setTempFilters({
      minSalary: filters.minSalary,
      locations: [...filters.locations],
      jobTitles: [...filters.jobTitles],
      statuses: [...filters.statuses],
      datePosted: filters.datePosted
    });
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
    setTempFilters(newFilters);
    if (onFilter) onFilter(newFilters);
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

  useEffect(() => {
    if (filtersCleared !== undefined) { 
      handleClearFilters();
    }
  }, [filtersCleared]);

  return (
    <div className={styles.container}>
      <div className={styles.topSection}>
        <h2 className={styles.title}>{title}</h2>

        <div className={styles.searchContainer}>
          <SearchOutlined className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search jobs or applicants"
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.bottomSection}>
        <div className={styles.bottomBar}>
          <div className={styles.filtersContainer}>
            <div 
              className={styles.filters} 
              onClick={() => setShowFilters(true)}
            >
              <img src={filterIcon} alt="Filter" className={styles.filterIcon} />
              <span>Filters</span>
            </div>
            
            <div className={styles.activeFilters}>
              {filters.minSalary > 0 && (
                <span className={styles.filterChip}>
                  <span style={{ color: 'var(--english-violet)' }}>$</span>
                  {filters.minSalary.toLocaleString()}/yr
                  <Cancel 
                    onClick={() => handleRemoveFilter('minSalary')}
                    className={styles.removeFilter}
                  />
                </span>
              )}
              
              {filters.datePosted && filters.datePosted !== "Any time" && (
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

              {filters.statuses.map((status, index) => (
                <span key={`status-${index}`} className={styles.filterChip}>
                  <People style={{ color: 'var(--english-violet)', fontSize: '1.3rem' }}/>
                  {status}
                  <Cancel
                    onClick={() => handleRemoveFilter('statuses', status)}
                    className={styles.removeFilter}
                  />
                </span>
              ))}
            </div>
          </div>

          <div className={styles.pagination}>
            <span
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
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
                onClick={() => page !== "..." && onPageChange(page)}
              >
                {page}
              </button>
            ))}

            <span
              onClick={() =>
                currentPage < totalPages && onPageChange(currentPage + 1)
              }
              className={currentPage === totalPages ? styles.disabledNav : ""}
            >
              Next ›
            </span>
          </div>
        </div>
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

            <div className={styles.filterGroup}>
              <h4>Minimum Annual Salary:</h4>
              <div className={styles.sliderContainer}>
                <div className={styles.sliderRangeLabels}>
                  <span>$0K</span>
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    value={tempFilters.minSalary}
                    onChange={(e) => handleSalaryChange(e.target.value)}
                  />
                  <span>$500K</span>
                </div>
                <div className={styles.sliderValue}>
                  ${tempFilters.minSalary.toLocaleString()}
                </div>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <h4>
                <History style={{ fontSize: '1.2rem', marginRight: '8px' }} />
                Date Posted
              </h4>
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

            <div className={styles.filterGroup}>
              <h4>
                <People style={{ fontSize: '1.2rem', marginRight: '8px' }} />
                Application Status
              </h4>
              <div className={styles.statusOptions}>
                {["Pending", "Approved", "Rejected"].map((status) => (
                  <label key={status} className={styles.statusOption}>
                    <input
                      type="checkbox"
                      checked={tempFilters.statuses.includes(status)}
                      onChange={() => handleStatusChange(status)}
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <h4>
                <LocationOn style={{ fontSize: '1.2rem', marginRight: '8px' }} />
                Locations
              </h4>
              <div className={styles.filterInputContainer}>
                <input
                  type="text"
                  placeholder={tempFilters.locations.length >= 3 ? 'Max 3 locations' : 'Add location'}
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
                  <Add fontSize="small"/> Add
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

            <div className={styles.filterGroup}>
              <h4>
                <Work style={{ fontSize: '1.2rem', marginRight: '8px' }} />
                Job Titles
              </h4>
              <div className={styles.filterInputContainer}>
                <input
                  type="text"
                  placeholder={tempFilters.jobTitles.length >= 3 ? 'Max 3 titles' : 'Add job title'}
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
                  <Add fontSize="small"/> Add
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

export default RecruiterCommonTopBar;