const API_BASE_URL = import.meta.env.VITE_JOB_MATRIX_API_BASE_URL;

const fetchAPI = async (URL, method = "GET", data = null, is_auth = false, content_type = 'application/json', isMultipart = false) => {
  try {
    const token = localStorage.getItem("jwtToken");
    const options = {method, headers: {}};

    // Only set Content-Type if not multipart
    if (!isMultipart) {
      options.headers["Content-Type"] = content_type;
    }

    if (is_auth && token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    if (data) {
      options.body = isMultipart ? data : JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${URL}`, options);
    const resData = await response.json();

    if (!response.ok) {
      return { error: resData || `HTTP error! Status: ${response.status}` };
    }

    return resData;
  } catch (e) {
    console.error("Error in fetching request:", e);
    return { error: "Network error. Please try again." };
  }
};

/** OPEN API - NO AUTH */
export const registerUser = (formData) => fetchAPI(`users/create/`, "POST", formData, false, 'multipart/form-data', true);
export const getCompanies = () => fetchAPI(`companies/`, "GET");

/** Users */
export const userAuth = (data) => fetchAPI(`login/`, "POST", data, false, 'application/json', false);
export const userDetails = (email) => fetchAPI(`users/get/?user_email=${email}`, "GET", null, true);
export const patchUserDetails = (userId, formData) => fetchAPI(`users/patch/${userId}/`, "PATCH", formData, true, 'multipart/form-data', true);
export const patchResume = (formData) => fetchAPI(`users/resume-update/`, "PATCH", formData, true, 'multipart/form-data', true);

/** JOBS WITH FILTER AND PAGINATION */
export const getAllJobs = (params = {}) => {
  const queryString = new URLSearchParams();
  
  if (params.minSalary) queryString.append('min_salary', params.minSalary);
  if (params.datePosted && params.datePosted !== "Any time") queryString.append('date_posted', params.datePosted);
  if (params.page) queryString.append('page', params.page);
  
  if (params.locations) params.locations.forEach(loc => queryString.append('location', loc));
  if (params.jobTitles) params.jobTitles.forEach(title => queryString.append('job_title', title));
  if (params.companies) params.companies.forEach(comp => queryString.append('company_name', comp));
  
  return fetchAPI(`job/jobs-list/?${queryString.toString()}`, "GET", null, true, 'application/json', false);
};


/** BOOKMARK JOBS*/
export const getBookmarks = (params = {}) =>{
  const queryString = new URLSearchParams();
  
  if (params.minSalary) queryString.append('min_salary', params.minSalary);
  if (params.datePosted && params.datePosted !== "Any time") queryString.append('date_posted', params.datePosted);
  if (params.page) queryString.append('page', params.page);
  
  if (params.locations) params.locations.forEach(loc => queryString.append('location', loc));
  if (params.jobTitles) params.jobTitles.forEach(title => queryString.append('job_title', title));
  if (params.companies) params.companies.forEach(comp => queryString.append('company_name', comp));
  
  return fetchAPI(`job/bookmarks/get/?${queryString.toString()}`,"GET",null,true, 'application/json', false);
}
export const addBookmark = (data) => fetchAPI('job/bookmarks/', "POST", data, true, 'application/json', false);
export const deleteBookmark = (bookmarkId) => fetchAPI(`job/bookmarks/${bookmarkId}/`, "DELETE", null, true, 'application/json', false);

/** APPLIED JOBS */
export const getAppliedJobs = (params = {}) => {
  const queryString = new URLSearchParams();

  if(params.minSalary) queryString.append('min_salary', params.minSalary);
  if(params.datePosted && params.datePosted !== "Any time") queryString.append('date_posted', params.datePosted);
  if(params.page) queryString.append('page',params.page);
  if(params.locations) params.locations.forEach(location => queryString.append('job_location', location));
  if(params.jobTitles) params.jobTitles.forEach(title => queryString.append('job_title', title));
  if(params.companies) params.companies.forEach(company => queryString.append('company_name', company));
  
  return fetchAPI(`job/applied?${queryString.toString()}`,"GET",null,true,'application/json',false);
}
export const applyJob = (data) => fetchAPI('job/applications/', "POST", data, true, 'application/json', false);

/** SKILLS */
export const getSkills = (userId) => fetchAPI(`profile/skill/user/${userId}/`,"GET",null,true,'application/json',false);
export const postSkill = (data) => fetchAPI('profile/skill/create/',"POST", data, true,'application/json',false);
export const editSkill = (skillId , data) => fetchAPI(`profile/skill/update/${skillId}/`, "PATCH", data, true, 'application/json',false);
export const deleteSkill = (skillId) => fetchAPI(`profile/skill/delete/${skillId}/`,"DELETE",null,true, 'application/json',false);

/** EDUCATION */
export const getEducation = (applicantId) => fetchAPI(`profile/education/user/${applicantId}/`,"GET",null,true,'application/json',false);
export const postEducation = (data) => fetchAPI('profile/education/create/',"POST", data, true, 'application/json', false);
export const editEducation = (educationId, data) => fetchAPI(`profile/education/update/${educationId}/`,"PATCH",data,true,'application/json',false);
export const deleteEducation = (educationId) => fetchAPI(`profile/education/delete/${educationId}/`,"DELETE",null,true,'application/json',false);

/** WORK EXPERIENCE */
export const getWorkExperience = (applicantId) => fetchAPI(`profile/work-experience/user/${applicantId}`,"GET",null,true,'application/json',false);
export const postWorkExperience = (data) => fetchAPI(`profile/work-experience/create/`,"POST", data, true, 'application/json', false);
export const editWorkExperience = (educationId, data) => fetchAPI(`profile/work-experience/update/${educationId}/`,"PATCH",data,true,'application/json',false);
export const deleteWorkExperience = (educationId) => fetchAPI(`profile/work-experience/delete/${educationId}/`,"DELETE",null,true,'application/json',false);

/** RECRUITER */
export const getApplicantsForJob = (data, status) => {
  const queryString = new URLSearchParams();
  if(data.page) queryString.append('page',data.page);
  return fetchAPI(`job/applicants/${data.job_Id}/?${queryString.toString()}&application_status=${status}`,"GET",null,true,'application/json',false);
}
export const getJobsListByACompany = (page) => fetchAPI(`company-jobs/?page=${page}`, "GET", null, true,'application/json',false);
export const updateApplicationStatus = (applicationId, data) => fetchAPI(`job/recruiter/applications/${applicationId}/`, "PATCH", data, true,'application/json',false);
export const updateCompanyDetails = (data) => fetchAPI(`company/update/`, "PATCH", data, true,'multipart/form-data',true);

/** ADMIN */
export const getAllUsers = () => fetchAPI(`users/all/`,"GET",null,true,'application/json',false);
export const getDashboardInsights = () => fetchAPI('admin/dashboard-insights/', "GET", null, true,'application/json',false);

export default fetchAPI;