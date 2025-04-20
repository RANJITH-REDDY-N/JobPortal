import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "../../../styles/CompanyInfo.module.css";
import { FiEdit3, FiSave } from "react-icons/fi";
import { LuEraser } from "react-icons/lu";
import { BsBuilding, BsGraphUp, BsPeople } from "react-icons/bs";
import CropImageUploader from "../../CropImageUploader";
import ToastNotification from "../../ToastNotification";
import { setCompany } from "../../../Redux/userSlice";
import { updateCompanyDetails, getRecruiterCompanyDetails } from '../../../services/api';
import defaultCompanyImage from '../../../assets/noprofilephoto.png';
import defaultBackground from '../../../assets/nocompanyimage2.jpg';
import classNames from 'classnames';

const CompanyInfo = () => {
    const dispatch = useDispatch();
    const userData = useSelector((state) => state.user?.user);

    const [activeTab, setActiveTab] = useState("details");
    const [companyData, setCompanyData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedDetails, setEditedDetails] = useState({});
    const [toastQueue, setToastQueue] = useState([]);
    const [companyImageFile, setCompanyImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            setIsLoading(true);
            try {
                const response = await getRecruiterCompanyDetails();
                console.log("Company details fetched:", response);
                setCompanyData(response);
                setEditedDetails({ ...response.company });
                dispatch(setCompany(response.company));
            } catch (error) {
                console.error("Error fetching company details:", error);
                showToast("Failed to load company information", "error");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanyDetails();
    }, [dispatch]);

    const showToast = (message, type = "success") => {
        const newToast = { message, type, id: Date.now() };
        setToastQueue(prev => [...prev, newToast]);

        setTimeout(() => {
            setToastQueue(prev => prev.filter(t => t.id !== newToast.id));
        }, 3000);
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            setCompanyImageFile(null);
        }
    };

    const handleCompanyImageChange = (file) => {
        setCompanyImageFile(file);
    };

    const handleSaveChanges = async () => {
        try {
            const formData = new FormData();
            Object.keys(editedDetails).forEach(key => {
                if (key !== 'company_image') {
                    formData.append(key, editedDetails[key]);
                }
            });

            if (companyImageFile) {
                formData.append('company_image', companyImageFile);
            } else if (editedDetails.company_image === null) {
                formData.append('company_image', '');
            }

            const response = await updateCompanyDetails(formData);

            if (response.error) {
                showToast(response.error.message || "Operation failed", "error");
            } else {
                dispatch(setCompany(response.data));
                // Update local state to reflect changes
                setCompanyData(prev => ({
                    ...prev,
                    company: response.data
                }));
                showToast("Company details updated successfully");
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error updating company:", error);
            const errorMessage =
                error?.response?.data?.error?.message ||
                error?.response?.data?.message ||
                error?.message ||
                "Failed to update company details";

            showToast(errorMessage, "error");
        }
    };

    const handleCancel = () => {
        setEditedDetails({ ...companyData?.company });
        setCompanyImageFile(null);
        setIsEditing(false);
        showToast("Changes discarded", "info");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (isLoading) {
        return <div className={styles.loadingContainer}>Loading company information...</div>;
    }

    return (
        <div className={styles.wrapper}>
            {/* Toast Notifications */}
            <div className={styles.toastContainer}>
                {toastQueue.map((toast) => (
                    <ToastNotification
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToastQueue(prev => prev.filter(t => t.id !== toast.id))}
                    />
                ))}
            </div>

            {/* Background Banner */}
            <div className={styles.banner}>
                <img
                    src={defaultBackground}
                    alt="Company background"
                    className={styles.bannerImage}
                />
            </div>

            {/* Main Content Container */}
            <div className={styles.container}>
                {/* Tabs Navigation */}
                <div className={styles.tabsContainer}>
                    <button
                        className={classNames(styles.tabButton, { [styles.activeTab]: activeTab === "details" })}
                        onClick={() => setActiveTab("details")}
                    >
                        <BsBuilding /> Company Details
                    </button>
                    <button
                        className={classNames(styles.tabButton, { [styles.activeTab]: activeTab === "stats" })}
                        onClick={() => setActiveTab("stats")}
                    >
                        <BsGraphUp /> Company Statistics
                    </button>
                </div>

                {/* Company Details Tab */}
                {activeTab === "details" && (
                    <>
                        {/* Header with Logo and Basic Info */}
                        <div className={styles.header}>
                            <div className={styles.logoContainer}>
                                <CropImageUploader
                                    name="company_image"
                                    onFileChange={handleCompanyImageChange}
                                    defaultImage={defaultCompanyImage}
                                    currentImage={editedDetails.company_image}
                                    checkPage='company-info'
                                    isEditing={isEditing}
                                />
                            </div>

                            <div className={styles.headerInfo}>
                                <h1 className={styles.companyName}>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="company_name"
                                            value={editedDetails.company_name || ''}
                                            onChange={handleInputChange}
                                            className={styles.editInput}
                                        />
                                    ) : (
                                        editedDetails.company_name
                                    )}
                                </h1>

                                <div className={styles.industryTag}>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="company_industry"
                                            value={editedDetails.company_industry || ''}
                                            onChange={handleInputChange}
                                            className={styles.editInput}
                                            placeholder="Industry..."
                                        />
                                    ) : (
                                        <span>{editedDetails.company_industry}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Company Content Sections */}
                        <div className={styles.content}>
                            {/* About Section */}
                            <div className={styles.section}>
                                <h2 className={styles.sectionTitle}>Company Description</h2>
                                <div className={styles.sectionContent}>
                                    {isEditing ? (
                                        <textarea
                                            name="company_description"
                                            value={editedDetails.company_description || ''}
                                            onChange={handleInputChange}
                                            className={styles.editTextarea}
                                            rows={5}
                                            placeholder="Add a company description..."
                                        />
                                    ) : (
                                        <p className={styles.description}>
                                            {editedDetails.company_description || "No company description available."}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className={styles.buttonGroup}>
                            {!isEditing ? (
                                <button
                                    className={styles.editButton}
                                    onClick={handleEditToggle}
                                >
                                    <FiEdit3 /> Edit Company
                                </button>
                            ) : (
                                <>
                                    <button
                                        className={styles.cancelButton}
                                        onClick={handleCancel}
                                    >
                                        <LuEraser /> Cancel
                                    </button>
                                    <button
                                        className={styles.saveButton}
                                        onClick={handleSaveChanges}
                                    >
                                        <FiSave /> Save
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}

                {/* Company Statistics Tab */}
                {activeTab === "stats" && companyData && (
                    <div className={styles.statsContainer}>
                        <h2 className={styles.statsHeader}>Company Statistics</h2>

                        <div className={styles.statsCards}>
                            <div className={styles.statCard}>
                                <div className={styles.statIcon}>
                                    <BsPeople size={24} />
                                </div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>{companyData.stats.total_recruiters}</span>
                                    <span className={styles.statLabel}>Total Recruiters</span>
                                </div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statIcon}>
                                    <BsPeople size={24} />
                                </div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>{companyData.stats.active_recruiters}</span>
                                    <span className={styles.statLabel}>Active Recruiters</span>
                                </div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statIcon}>
                                    <BsGraphUp size={24} />
                                </div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statValue}>{companyData.stats.total_jobs}</span>
                                    <span className={styles.statLabel}>Total Jobs</span>
                                </div>
                            </div>
                        </div>

                        {/* Recruiters List */}
                        <div className={styles.recruitersSection}>
                            <h3 className={styles.subsectionTitle}>Company Recruiters</h3>
                            <div className={styles.recruitersTable}>
                                <div className={styles.tableHeader}>
                                    <div className={styles.headerCell}>Name</div>
                                    <div className={styles.headerCell}>Email</div>
                                    <div className={styles.headerCell}>Status</div>
                                    <div className={styles.headerCell}>Start Date</div>
                                    <div className={styles.headerCell}>Jobs Posted</div>
                                </div>

                                {companyData.recruiters.map(recruiter => (
                                    <div key={recruiter.recruiter_id} className={styles.tableRow}>
                                        <div className={styles.tableCell}>
                                            {recruiter.user_first_name} {recruiter.user_last_name}
                                            {recruiter.is_current_user && <span className={styles.currentUser}> (You)</span>}
                                        </div>
                                        <div className={styles.tableCell}>{recruiter.user_email}</div>
                                        <div className={styles.tableCell}>
                                            <span className={
                                                recruiter.is_active
                                                    ? styles.statusActive
                                                    : styles.statusInactive
                                            }>
                                                {recruiter.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className={styles.tableCell}>{recruiter.start_date}</div>
                                        <div className={styles.tableCell}>{recruiter.jobs_posted}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyInfo;